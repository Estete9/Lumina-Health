import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { SearchResultItem, ServiceResponse, Patient } from '../types';
import { MOCK_PATIENTS, MOCK_CLINICAL_NOTES, MOCK_APPOINTMENTS } from './mockData';

export async function searchGlobalResources(query: string): Promise<ServiceResponse<SearchResultItem[]>> {
  const rawLower = query.toLowerCase();
  const normalizedQuery = rawLower.replace(/^[@#]/, '').trim();
  const searchPattern = normalizedQuery || rawLower;

  if (!searchPattern) {
    return { data: [], error: null };
  }

  // In-memory fallback search across mock data
  const matchedPatients: SearchResultItem[] = MOCK_PATIENTS
    .filter((p: Patient) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      const email = (p.email || '').toLowerCase();
      const ailment = (p.primary_ailment || '').toLowerCase();
      const secondaryStr = Array.isArray(p.secondary_ailments) ? p.secondary_ailments.join(' ').toLowerCase() : '';
      const tagsStr = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';

      return (
        fullName.includes(searchPattern) ||
        p.first_name.toLowerCase().includes(searchPattern) ||
        p.last_name.toLowerCase().includes(searchPattern) ||
        email.includes(searchPattern) ||
        ailment.includes(searchPattern) ||
        secondaryStr.includes(searchPattern) ||
        tagsStr.includes(searchPattern)
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

      return (
        discoveriesStr.includes(searchPattern) ||
        rawNotes.includes(searchPattern) ||
        ailmentsStr.includes(searchPattern)
      );
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
      return pName.includes(searchPattern) || sessionType.includes(searchPattern) || notes.includes(searchPattern);
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
        .or(`first_name.ilike.%${searchPattern}%,last_name.ilike.%${searchPattern}%,email.ilike.%${searchPattern}%,primary_ailment.ilike.%${searchPattern}%`),
      supabase
        .from('clinical_notes')
        .select('*')
        .or(`raw_notes.ilike.%${searchPattern}%`),
      supabase
        .from('appointments')
        .select('*')
        .or(`patient_name.ilike.%${searchPattern}%,session_type.ilike.%${searchPattern}%`)
    ]);

    const dbPatients: SearchResultItem[] = (patientsRes.data || []).map((p: any) => ({
      id: p.id,
      type: 'patient' as const,
      title: `${p.first_name} ${p.last_name}`,
      subtitle: p.primary_ailment || p.email || 'Patient',
      url: `/patients/${p.id}`,
      badge: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : undefined
    }));

    const dbNotes: SearchResultItem[] = (notesRes.data || []).map((n: any) => {
      const patient = MOCK_PATIENTS.find((p) => p.id === n.patient_id);
      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';
      return {
        id: n.id,
        type: 'note' as const,
        title: `Note: ${patientName}`,
        subtitle: n.raw_notes ? (n.raw_notes.length > 60 ? n.raw_notes.slice(0, 60) + '...' : n.raw_notes) : 'Clinical Note',
        url: `/patients/${n.patient_id}?tab=notes`,
        badge: 'Clinical Note'
      };
    });

    const dbAppointments: SearchResultItem[] = (appointmentsRes.data || []).map((a: any) => ({
      id: a.id,
      type: 'appointment' as const,
      title: `${a.patient_name || 'Appointment'} - ${a.session_type}`,
      subtitle: `${new Date(a.scheduled_at).toLocaleDateString()} (${a.duration_minutes} min)`,
      url: `/calendar`,
      badge: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : undefined
    }));

    const dbResults = [...dbPatients, ...dbNotes, ...dbAppointments];
    const dbIds = new Set(dbResults.map((r) => r.id));
    const uniqueInMemory = inMemoryResults.filter((r) => !dbIds.has(r.id));

    return { data: [...dbResults, ...uniqueInMemory], error: null };
  } catch (error) {
    return { data: inMemoryResults, error: null };
  }
}
