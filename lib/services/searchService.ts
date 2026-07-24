import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { SearchResultItem, ServiceResponse, Patient, ClinicalNote, Appointment } from '../types';
import { MOCK_PATIENTS, MOCK_CLINICAL_NOTES, MOCK_APPOINTMENTS } from './mockData';

export async function searchGlobalResources(query: string): Promise<ServiceResponse<SearchResultItem[]>> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return { data: [], error: null };
  }

  // In-memory fallback search across mock data
  const matchedPatients: SearchResultItem[] = MOCK_PATIENTS
    .filter((p) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      const email = (p.email || '').toLowerCase();
      const ailment = (p.primary_ailment || '').toLowerCase();
      return (
        fullName.includes(trimmed) ||
        p.first_name.toLowerCase().includes(trimmed) ||
        p.last_name.toLowerCase().includes(trimmed) ||
        email.includes(trimmed) ||
        ailment.includes(trimmed)
      );
    })
    .map((p) => ({
      id: p.id,
      type: 'patient' as const,
      title: `${p.first_name} ${p.last_name}`,
      subtitle: p.primary_ailment || p.email || 'Patient',
      url: `/patients/${p.id}`,
      badge: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : undefined
    }));

  const matchedNotes: SearchResultItem[] = MOCK_CLINICAL_NOTES
    .filter((n) => {
      const discoveriesStr = Array.isArray(n.discoveries)
        ? n.discoveries.join(' ').toLowerCase()
        : (n.discoveries || '').toLowerCase();
      const rawNotes = (n.raw_notes || '').toLowerCase();
      const ailmentsStr = Array.isArray(n.ailments)
        ? n.ailments.join(' ').toLowerCase()
        : (n.ailments || '').toLowerCase();
      return discoveriesStr.includes(trimmed) || rawNotes.includes(trimmed) || ailmentsStr.includes(trimmed);
    })
    .map((n) => {
      const patient = MOCK_PATIENTS.find((p) => p.id === n.patient_id);
      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';
      const snippet = n.raw_notes ? (n.raw_notes.length > 60 ? n.raw_notes.slice(0, 60) + '...' : n.raw_notes) : 'Clinical Note';
      return {
        id: n.id,
        type: 'note' as const,
        title: `Note: ${patientName}`,
        subtitle: snippet,
        url: `/patients/${n.patient_id}?tab=notes`,
        badge: 'Clinical Note'
      };
    });

  const matchedAppointments: SearchResultItem[] = MOCK_APPOINTMENTS
    .filter((a) => {
      const pName = (a.patient_name || '').toLowerCase();
      const sessionType = (a.session_type || '').toLowerCase();
      const notes = (a.notes || '').toLowerCase();
      return pName.includes(trimmed) || sessionType.includes(trimmed) || notes.includes(trimmed);
    })
    .map((a) => {
      const formattedDate = new Date(a.scheduled_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        id: a.id,
        type: 'appointment' as const,
        title: `${a.patient_name || 'Appointment'} - ${a.session_type}`,
        subtitle: `${formattedDate} (${a.duration_minutes} min)`,
        url: `/calendar`,
        badge: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : undefined
      };
    });

  const inMemoryResults = [...matchedPatients, ...matchedNotes, ...matchedAppointments];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryResults, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      return { data: inMemoryResults, error: null };
    }

    const [patientsRes, notesRes, appointmentsRes] = await Promise.all([
      supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%,primary_ailment.ilike.%${trimmed}%`),
      supabase
        .from('clinical_notes')
        .select('*')
        .or(`raw_notes.ilike.%${trimmed}%`),
      supabase
        .from('appointments')
        .select('*')
        .or(`patient_name.ilike.%${trimmed}%,session_type.ilike.%${trimmed}%,notes.ilike.%${trimmed}%`)
    ]);

    if (patientsRes.error || notesRes.error || appointmentsRes.error) {
      return { data: inMemoryResults, error: null };
    }

    const dbPatients: SearchResultItem[] = (patientsRes.data || []).map((p: Patient) => ({
      id: p.id,
      type: 'patient' as const,
      title: `${p.first_name} ${p.last_name}`,
      subtitle: p.primary_ailment || p.email || 'Patient',
      url: `/patients/${p.id}`,
      badge: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : undefined
    }));

    const dbNotes: SearchResultItem[] = (notesRes.data || []).map((n: ClinicalNote) => ({
      id: n.id,
      type: 'note' as const,
      title: `Note: Clinical Record`,
      subtitle: n.raw_notes ? (n.raw_notes.length > 60 ? n.raw_notes.slice(0, 60) + '...' : n.raw_notes) : 'Clinical Note',
      url: `/patients/${n.patient_id}?tab=notes`,
      badge: 'Clinical Note'
    }));

    const dbAppointments: SearchResultItem[] = (appointmentsRes.data || []).map((a: Appointment) => ({
      id: a.id,
      type: 'appointment' as const,
      title: `${a.patient_name || 'Appointment'} - ${a.session_type}`,
      subtitle: `${new Date(a.scheduled_at).toLocaleDateString()} (${a.duration_minutes} min)`,
      url: `/calendar`,
      badge: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : undefined
    }));

    const combinedDb = [...dbPatients, ...dbNotes, ...dbAppointments];
    const existingIds = new Set(combinedDb.map((item) => item.id));
    const merged = [...combinedDb, ...inMemoryResults.filter((item) => !existingIds.has(item.id))];

    return { data: merged, error: null };
  } catch (error) {
    return handleServiceResponse<SearchResultItem[]>(inMemoryResults, error);
  }
}
