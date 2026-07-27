import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { ClinicalNote, CreateNoteInput, ServiceResponse } from '../types';
import { MOCK_CLINICAL_NOTES } from './mockData';

let inMemoryNotes: ClinicalNote[] = [...MOCK_CLINICAL_NOTES];
const deletedNoteIds = new Set<string>();

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
    const activeDbNotes = dbNotes.filter((n) => !deletedNoteIds.has(n.id));
    const dbIds = new Set(activeDbNotes.map((n) => n.id));
    const localFiltered = inMemoryNotes.filter((n) => n.patient_id === patientId && !dbIds.has(n.id));

    return handleServiceResponse<ClinicalNote[]>([...localFiltered, ...activeDbNotes], null);
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

  if (!inMemoryNotes.some((n) => n.id === newNote.id)) {
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
        discoveries: input.discoveries,
        daily_actions: input.daily_actions,
        ailments: input.ailments,
        raw_notes: input.raw_notes
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

export async function updateNote(id: string, input: Partial<CreateNoteInput>): Promise<ServiceResponse<ClinicalNote>> {
  let noteIndex = inMemoryNotes.findIndex((n) => n.id === id);
  let updatedInMemoryNote: ClinicalNote;

  if (noteIndex !== -1) {
    inMemoryNotes[noteIndex] = {
      ...inMemoryNotes[noteIndex],
      ...input,
      updated_at: new Date().toISOString()
    };
    updatedInMemoryNote = inMemoryNotes[noteIndex];
  } else {
    updatedInMemoryNote = {
      id: id,
      patient_id: input.patient_id || 'patient-1',
      practitioner_id: 'prac-1',
      session_date: input.session_date || new Date().toISOString().split('T')[0],
      discoveries: input.discoveries || [],
      daily_actions: input.daily_actions || [],
      ailments: input.ailments || [],
      raw_notes: input.raw_notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryNotes.unshift(updatedInMemoryNote);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: updatedInMemoryNote, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: updatedInMemoryNote, error: null };
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return { data: updatedInMemoryNote, error: null };
    }

    return handleServiceResponse<ClinicalNote>(data as ClinicalNote, null);
  } catch (error) {
    return handleServiceResponse<ClinicalNote>(updatedInMemoryNote, null);
  }
}

export async function deleteNote(id: string): Promise<ServiceResponse<boolean>> {
  inMemoryNotes = inMemoryNotes.filter((n) => n.id !== id);
  deletedNoteIds.add(id);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: true, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: true, error: null };
    }

    const { error } = await supabase
      .from('clinical_notes')
      .delete()
      .eq('id', id);

    if (error) {
      return handleServiceResponse<boolean>(true, null);
    }

    return handleServiceResponse<boolean>(true, null);
  } catch (error) {
    return handleServiceResponse<boolean>(true, error);
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

    if (error || !data) {
      return { data: inMemoryNotes, error: null };
    }

    return handleServiceResponse<ClinicalNote[]>(data as ClinicalNote[], null);
  } catch (error) {
    return handleServiceResponse<ClinicalNote[]>(inMemoryNotes, error);
  }
}

export async function getNotes(practitionerId?: string): Promise<ServiceResponse<ClinicalNote[]>> {
  const allNotesRes = await getAllNotes();
  if (allNotesRes.error || !allNotesRes.data) {
    return allNotesRes;
  }
  if (practitionerId) {
    const filtered = allNotesRes.data.filter((n) => !n.practitioner_id || n.practitioner_id === practitionerId);
    return { data: filtered, error: null };
  }
  return allNotesRes;
}

