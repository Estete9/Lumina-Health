import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { ClinicalNote, CreateNoteInput, ServiceResponse } from '../types';
import { MOCK_CLINICAL_NOTES } from './mockData';

let inMemoryNotes: ClinicalNote[] = [...MOCK_CLINICAL_NOTES];

export async function getNotesByPatientId(patientId: string): Promise<ServiceResponse<ClinicalNote[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const filtered = inMemoryNotes.filter((n) => n.patient_id === patientId);
    return { data: filtered, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      const filtered = inMemoryNotes.filter((n) => n.patient_id === patientId);
      return { data: filtered, error: null };
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      const filtered = inMemoryNotes.filter((n) => n.patient_id === patientId);
      return handleServiceResponse<ClinicalNote[]>(filtered, null);
    }

    const dbNotes = (data as ClinicalNote[]) || [];
    const dbIds = new Set(dbNotes.map((n) => n.id));
    const localFiltered = inMemoryNotes.filter((n) => n.patient_id === patientId && !dbIds.has(n.id));
    const mergedNotes = [...localFiltered, ...dbNotes];

    return handleServiceResponse<ClinicalNote[]>(mergedNotes, null);
  } catch (error) {
    const filtered = inMemoryNotes.filter((n) => n.patient_id === patientId);
    return handleServiceResponse<ClinicalNote[]>(filtered, error);
  }
}

export async function createNote(input: CreateNoteInput, practitionerId: string = 'prac-1'): Promise<ServiceResponse<ClinicalNote>> {
  const newNote: ClinicalNote = {
    id: `note-${Date.now()}`,
    patient_id: input.patient_id,
    practitioner_id: practitionerId,
    session_date: input.session_date,
    discoveries: input.discoveries || [],
    daily_actions: input.daily_actions || [],
    ailments: input.ailments || [],
    raw_notes: input.raw_notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Always unshift to inMemoryNotes so in-memory mock store holds the note
  if (!inMemoryNotes.some(n => n.id === newNote.id)) {
    inMemoryNotes.unshift(newNote);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: newNote, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: newNote, error: null };
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .insert({
        patient_id: input.patient_id,
        practitioner_id: practitionerId,
        session_date: input.session_date,
        discoveries: input.discoveries || [],
        daily_actions: input.daily_actions || [],
        ailments: input.ailments || [],
        raw_notes: input.raw_notes || ''
      })
      .select()
      .single();

    if (error || !data) {
      return { data: newNote, error: null };
    }

    return handleServiceResponse<ClinicalNote>(data as ClinicalNote, null);
  } catch (error) {
    return handleServiceResponse<ClinicalNote>(newNote, null);
  }
}

export async function getAllNotes(): Promise<ServiceResponse<ClinicalNote[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryNotes, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: inMemoryNotes, error: null };
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleServiceResponse<ClinicalNote[]>(inMemoryNotes, null);
    }

    return handleServiceResponse<ClinicalNote[]>(data as ClinicalNote[], null);
  } catch (error) {
    return handleServiceResponse<ClinicalNote[]>(inMemoryNotes, error);
  }
}
