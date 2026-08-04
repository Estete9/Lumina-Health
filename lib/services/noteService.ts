'use server';

import { createClient } from '../supabase/server';
import { handleServiceResponse } from './baseService';
import { ClinicalNote, CreateNoteInput, ServiceResponse } from '../types';
import { MOCK_CLINICAL_NOTES } from './mockData';

let inMemoryNotes: ClinicalNote[] = [...MOCK_CLINICAL_NOTES];

export async function getNotesByPatientId(patientId: string): Promise<ServiceResponse<ClinicalNote[]>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<ClinicalNote[]>(null, 'Failed to connect to database');

  const { data, error } = await supabase
    .from('clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error || !data) return handleServiceResponse<ClinicalNote[]>(null, error?.message || 'Failed to fetch notes');
  return handleServiceResponse<ClinicalNote[]>(data as ClinicalNote[], null);
}

export async function createNote(input: CreateNoteInput, practitionerId?: string): Promise<ServiceResponse<ClinicalNote>> {
  const supabase = await createClient();

  let targetId = practitionerId;
  if (!targetId && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }
  if (!targetId) return handleServiceResponse<ClinicalNote>(null, 'Authentication required');

  const newNote: ClinicalNote = {
    id: `note-${Date.now()}`,
    patient_id: input.patient_id,
    practitioner_id: targetId as string,
    session_date: input.session_date || new Date().toISOString(),
    discoveries: input.discoveries || [],
    daily_actions: input.daily_actions || [],
    ailments: input.ailments || [],
    raw_notes: input.raw_notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!supabase) return handleServiceResponse<ClinicalNote>(null, 'Failed to connect to database');

  const { data, error } = await supabase
    .from('clinical_notes')
    .insert({
      patient_id: input.patient_id,
      practitioner_id: targetId as string,
      session_date: input.session_date,
      discoveries: input.discoveries || [],
      daily_actions: input.daily_actions || [],
      ailments: input.ailments || [],
      raw_notes: input.raw_notes || ''
    })
    .select()
    .single();

  if (error || !data) return handleServiceResponse<ClinicalNote>(null, error?.message || 'Failed to create note');
  return handleServiceResponse<ClinicalNote>(data as ClinicalNote, null);
}

export async function updateNote(id: string, input: Partial<CreateNoteInput>): Promise<ServiceResponse<ClinicalNote>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<ClinicalNote>(null, 'Failed to connect to database');

  const { data, error } = await supabase
    .from('clinical_notes')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return handleServiceResponse<ClinicalNote>(null, error?.message || 'Failed to update note');
  return handleServiceResponse<ClinicalNote>(data as ClinicalNote, null);
}

export async function deleteNote(id: string): Promise<ServiceResponse<boolean>> {
  const index = inMemoryNotes.findIndex((n) => n.id === id);
  if (index !== -1) {
    inMemoryNotes.splice(index, 1);
  }

  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<boolean>(true, null);

  const { error } = await supabase
    .from('clinical_notes')
    .delete()
    .eq('id', id);

  if (error) return handleServiceResponse<boolean>(false, error);
  return handleServiceResponse<boolean>(true, null);
}

export async function getAllNotes(): Promise<ServiceResponse<ClinicalNote[]>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<ClinicalNote[]>(null, 'Failed to connect to database');

  const { data, error } = await supabase
    .from('clinical_notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return handleServiceResponse<ClinicalNote[]>(null, error?.message || 'Failed to fetch notes');
  return handleServiceResponse<ClinicalNote[]>(data as ClinicalNote[], null);
}

export async function getNotes(practitionerId?: string): Promise<ServiceResponse<ClinicalNote[]>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<ClinicalNote[]>(null, 'Failed to connect to database');

  let targetId = practitionerId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) targetId = user.id;
    else return handleServiceResponse<ClinicalNote[]>(inMemoryNotes, null);
  }

  let query = supabase.from('clinical_notes').select('*').order('created_at', { ascending: false });
  if (targetId) {
    query = query.eq('practitioner_id', targetId);
  }

  const { data, error } = await query;
  if (error || !data) return handleServiceResponse<ClinicalNote[]>(null, error?.message || 'Failed to fetch notes');
  return handleServiceResponse<ClinicalNote[]>(data as ClinicalNote[], null);
}
