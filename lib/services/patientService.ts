'use server';

import { createClient } from '../supabase/server';
import { handleServiceResponse } from './baseService';
import { Patient, CreatePatientInput, PatientStatus, ServiceResponse } from '../types';
import { MOCK_PATIENTS } from './mockData';

let inMemoryPatients: Patient[] = [...MOCK_PATIENTS];

export async function getPatients(practitionerId?: string): Promise<ServiceResponse<Patient[]>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Patient[]>(inMemoryPatients, null);

  let targetId = practitionerId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('practitioner_id', targetId)
    .order('last_name', { ascending: true });

  if (error || !data) return handleServiceResponse<Patient[]>(inMemoryPatients, null);
  return handleServiceResponse<Patient[]>(data as Patient[], null);
}

export async function getPatientById(id: string): Promise<ServiceResponse<Patient>> {
  const localPatient = inMemoryPatients.find((p) => p.id === id);

  const supabase = await createClient();
  if (!supabase) {
    if (localPatient) return handleServiceResponse<Patient>(localPatient, null);
    return handleServiceResponse<Patient>(null, 'Patient not found');
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    if (localPatient) return handleServiceResponse<Patient>(localPatient, null);
    return handleServiceResponse<Patient>(null, error || 'Patient not found');
  }
  return handleServiceResponse<Patient>(data as Patient, null);
}

export async function createPatient(input: CreatePatientInput, practitionerId?: string): Promise<ServiceResponse<Patient>> {
  const supabase = await createClient();

  let targetId = practitionerId;
  if (!targetId && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }
  if (!targetId) targetId = 'prac-1';

  const newPatient: Patient = {
    id: `pat-${Date.now()}`,
    practitioner_id: targetId as string,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  inMemoryPatients.unshift(newPatient);

  if (!supabase) return handleServiceResponse<Patient>(newPatient, null);

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

  if (error || !data) return handleServiceResponse<Patient>(newPatient, null);
  return handleServiceResponse<Patient>(data as Patient, null);
}

export async function updatePatient(id: string, input: Partial<CreatePatientInput>): Promise<ServiceResponse<Patient>> {
  const index = inMemoryPatients.findIndex((p) => p.id === id);
  let updatedInMemory: Patient | null = null;
  if (index !== -1) {
    inMemoryPatients[index] = {
      ...inMemoryPatients[index],
      ...input,
      updated_at: new Date().toISOString()
    };
    updatedInMemory = inMemoryPatients[index];
  }

  const supabase = await createClient();
  if (!supabase) {
    if (updatedInMemory) return handleServiceResponse<Patient>(updatedInMemory, null);
    return handleServiceResponse<Patient>(null, 'Patient not found');
  }

  const { data, error } = await supabase
    .from('patients')
    .update({ ...input })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    if (updatedInMemory) return handleServiceResponse<Patient>(updatedInMemory, null);
    return handleServiceResponse<Patient>(null, error);
  }
  return handleServiceResponse<Patient>(data as Patient, null);
}

export async function updatePatientStatus(id: string, status: PatientStatus): Promise<ServiceResponse<Patient>> {
  const index = inMemoryPatients.findIndex((p) => p.id === id);
  let updatedInMemory: Patient | null = null;
  if (index !== -1) {
    inMemoryPatients[index] = {
      ...inMemoryPatients[index],
      status,
      updated_at: new Date().toISOString()
    };
    updatedInMemory = inMemoryPatients[index];
  } else {
    updatedInMemory = {
      id,
      practitioner_id: 'prac-1',
      first_name: 'Patient',
      last_name: id,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryPatients.unshift(updatedInMemory);
  }

  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Patient>(updatedInMemory, null);

  const { data, error } = await supabase
    .from('patients')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return handleServiceResponse<Patient>(updatedInMemory, null);
  return handleServiceResponse<Patient>(data as Patient, null);
}
