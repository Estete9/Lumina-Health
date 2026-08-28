'use server';

import { createClient } from '../supabase/server';
import { handleServiceResponse } from './baseService';
import { Patient, CreatePatientInput, PatientStatus, ServiceResponse } from '../types';
import { MOCK_PATIENTS } from './mockData';

export async function getPatients(practitionerId?: string): Promise<ServiceResponse<Patient[]>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Patient[]>(MOCK_PATIENTS, null);

  let targetId = practitionerId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }

  let query = supabase.from('patients').select('*').order('last_name', { ascending: true });
  if (targetId && targetId !== 'prac-1') {
    query = query.eq('practitioner_id', targetId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) return handleServiceResponse<Patient[]>(MOCK_PATIENTS, null);
  return handleServiceResponse<Patient[]>(data as Patient[], null);
}

export async function getPatientById(id: string): Promise<ServiceResponse<Patient>> {
  const supabase = await createClient();
  if (!supabase) {
    return handleServiceResponse<Patient>(null, 'Failed to connect to database');
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return handleServiceResponse<Patient>(null, error?.message || 'Patient not found');
  }
  return handleServiceResponse<Patient>(data as Patient, null);
}

export async function createPatient(input: CreatePatientInput, practitionerId?: string): Promise<ServiceResponse<Patient>> {
  const supabase = await createClient();

  let targetId = practitionerId;
  if (!targetId && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id || 'prac-1';
  }
  if (!targetId) {
    targetId = 'prac-1';
  }

  if (!supabase) return handleServiceResponse<Patient>(null, 'Failed to connect to database');

  const { data, error } = await supabase
    .from('patients')
    .insert({
      practitioner_id: targetId,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email || null,
      phone: input.phone || null,
      date_of_birth: input.date_of_birth || null,
      gender: input.gender || null,
      status: input.status || 'active',
      primary_ailment: input.primary_ailment,
      secondary_ailments: input.secondary_ailments || [],
      tags: input.tags || [],
      notes_summary: input.notes_summary || null
    })
    .select()
    .single();

  if (error || !data) return handleServiceResponse<Patient>(null, error?.message || 'Failed to create patient');
  return handleServiceResponse<Patient>(data as Patient, null);
}

export async function updatePatient(id: string, input: Partial<CreatePatientInput>): Promise<ServiceResponse<Patient>> {
  const supabase = await createClient();
  if (!supabase) {
    return handleServiceResponse<Patient>(null, 'Failed to connect to database');
  }

  const { data, error } = await supabase
    .from('patients')
    .update({ ...input })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return handleServiceResponse<Patient>(null, error?.message || 'Failed to update patient');
  }
  return handleServiceResponse<Patient>(data as Patient, null);
}

export async function updatePatientStatus(id: string, status: PatientStatus): Promise<ServiceResponse<Patient>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Patient>(null, 'Failed to connect to database');

  const { data, error } = await supabase
    .from('patients')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return handleServiceResponse<Patient>(null, error?.message || 'Failed to update patient status');
  return handleServiceResponse<Patient>(data as Patient, null);
}
