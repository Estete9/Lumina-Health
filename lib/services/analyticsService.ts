import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { 
  PractitionerAnalytics, 
  DiagnosticDistributionItem, 
  WeeklyTrendItem, 
  ClinicalDiscoveryFrequencyItem, 
  ServiceResponse 
} from '../types';
import { getPatients } from './patientService';
import { getAppointments } from './appointmentService';
import { getNotes } from './noteService';

const DIAGNOSTIC_COLORS = [
  '#0d9488', // Teal 600
  '#0284c7', // Sky 600
  '#6366f1', // Indigo 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#f59e0b', // Amber 500
];

/**
 * Helper to dynamically compute analytics from domain data services
 */
export async function computeAnalyticsFromServices(practitionerId: string): Promise<PractitionerAnalytics> {
  const [patientsRes, apptsRes, notesRes] = await Promise.all([
    getPatients(practitionerId),
    getAppointments(practitionerId),
    getNotes(practitionerId)
  ]);

  const patients = patientsRes.data || [];
  const appointments = apptsRes.data || [];
  const notes = notesRes.data || [];

  // 1. KPI Calculations
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const activeCaseloadRatio = totalPatients > 0 
    ? Math.round((activePatients / totalPatients) * 100 * 10) / 10 
    : 0;

  const completedSessions = appointments.filter(a => a.status === 'completed').length;
  const nonCancelledSessions = appointments.filter(a => a.status !== 'cancelled').length;
  const sessionCompletionRate = nonCancelledSessions > 0 
    ? Math.round((completedSessions / nonCancelledSessions) * 100 * 10) / 10 
    : 0;

  const avgNotesPerPatient = totalPatients > 0 
    ? Math.round((notes.length / totalPatients) * 10) / 10 
    : 0;

  // 2. Diagnostic Distribution
  const ailmentCounts: Record<string, number> = {};
  patients.forEach(p => {
    if (p.primary_ailment) {
      ailmentCounts[p.primary_ailment] = (ailmentCounts[p.primary_ailment] || 0) + 1;
    }
    if (Array.isArray(p.secondary_ailments)) {
      p.secondary_ailments.forEach(sec => {
        if (sec) ailmentCounts[sec] = (ailmentCounts[sec] || 0) + 1;
      });
    }
  });

  const totalAilmentMentions = Object.values(ailmentCounts).reduce((a, b) => a + b, 0) || 1;
  const diagnosticDistribution: DiagnosticDistributionItem[] = Object.entries(ailmentCounts)
    .map(([ailment, count], index) => ({
      ailment,
      count,
      percentage: Math.round((count / totalAilmentMentions) * 100 * 10) / 10,
      color: DIAGNOSTIC_COLORS[index % DIAGNOSTIC_COLORS.length]
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Weekly Trends
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayStats: Record<string, { completed: number; total: number }> = {};
  daysOfWeek.forEach(d => dayStats[d] = { completed: 0, total: 0 });

  appointments.forEach(apt => {
    if (!apt.scheduled_at) return;
    const date = new Date(apt.scheduled_at);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    if (dayStats[dayName]) {
      dayStats[dayName].total += 1;
      if (apt.status === 'completed') dayStats[dayName].completed += 1;
    }
  });

  const weeklyTrends: WeeklyTrendItem[] = daysOfWeek.map(day => {
    const stat = dayStats[day];
    return {
      dayOrWeek: day,
      completedSessions: stat.completed,
      scheduledSessions: stat.total,
      completionRate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
    };
  });

  // 4. Top Discoveries & Tag Frequency
  const discoveryMap: Record<string, { count: number; category: 'cbt_insight' | 'symptom' | 'intervention' }> = {};
  
  notes.forEach(note => {
    const discoveriesList = Array.isArray(note.discoveries) 
      ? note.discoveries 
      : typeof note.discoveries === 'string' ? [note.discoveries] : [];
    
    discoveriesList.forEach(disc => {
      if (!disc) return;
      const key = disc.trim();
      if (!discoveryMap[key]) {
        discoveryMap[key] = { count: 0, category: 'cbt_insight' };
      }
      discoveryMap[key].count += 1;
    });

    const ailmentsList = Array.isArray(note.ailments) 
      ? note.ailments 
      : typeof note.ailments === 'string' ? [note.ailments] : [];
    
    ailmentsList.forEach(ail => {
      if (!ail) return;
      const key = ail.trim();
      if (!discoveryMap[key]) {
        discoveryMap[key] = { count: 0, category: 'symptom' };
      }
      discoveryMap[key].count += 1;
    });
  });

  const totalDiscoveriesCount = Object.values(discoveryMap).reduce((acc, curr) => acc + curr.count, 0) || 1;
  const topDiscoveries: ClinicalDiscoveryFrequencyItem[] = Object.entries(discoveryMap)
    .map(([tagOrDiscovery, data]) => ({
      tagOrDiscovery,
      category: data.category,
      count: data.count,
      percentage: Math.round((data.count / totalDiscoveriesCount) * 100 * 10) / 10
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    practitionerId,
    totalPatients,
    activePatients,
    activeCaseloadRatio,
    totalSessionsCompleted: completedSessions,
    sessionCompletionRate,
    avgNotesPerPatient,
    diagnosticDistribution,
    weeklyTrends,
    topDiscoveries,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Primary Analytics Service Handler with Supabase + Dual-Mode Fallback
 */
export async function getPractitionerAnalytics(
  practitionerId: string = 'prac-1'
): Promise<ServiceResponse<PractitionerAnalytics>> {
  // Dual-mode check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const mockAnalytics = await computeAnalyticsFromServices(practitionerId);
    return { data: mockAnalytics, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      const mockAnalytics = await computeAnalyticsFromServices(practitionerId);
      return { data: mockAnalytics, error: null };
    }

    // Try Supabase or fallback to computed service data
    const mockAnalytics = await computeAnalyticsFromServices(practitionerId);
    return handleServiceResponse<PractitionerAnalytics>(mockAnalytics, null);
  } catch (error) {
    const mockAnalytics = await computeAnalyticsFromServices(practitionerId);
    return handleServiceResponse<PractitionerAnalytics>(mockAnalytics, null);
  }
}
