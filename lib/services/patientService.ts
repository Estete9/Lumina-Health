import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { Patient, CreatePatientInput, ServiceResponse } from '../types';
import { MOCK_PATIENTS } from './mockData';

let inMemoryPatients: Patient[] = [...MOCK_PATIENTS];

export async function getPatients(practitionerId?: string): Promise<ServiceResponse<Patient[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const filtered = practitionerId 
      ? inMemoryPatients.filter(p => p.practitioner_id === practitionerId || p.practitioner_id === 'prac-1') 
      : inMemoryPatients;
    return { data: filtered, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: inMemoryPatients, error: null };
    }
    let query = supabase.from('patients').select('*');
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    const { data, error } = await query;
    if (error) {
      return handleServiceResponse<Patient[]>(inMemoryPatients, null);
    }
    return handleServiceResponse<Patient[]>(data as Patient[], null);
  } catch (error) {
    return handleServiceResponse<Patient[]>(inMemoryPatients, error);
  }
}

export async function getPatientById(id: string): Promise<ServiceResponse<Patient>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const patient = inMemoryPatients.find(p => p.id === id) || null;
    return { data: patient, error: patient ? null : 'Patient not found' };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      const patient = inMemoryPatients.find(p => p.id === id) || null;
      return { data: patient, error: patient ? null : 'Patient not found' };
    }
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
    if (error) {
      const patient = inMemoryPatients.find(p => p.id === id) || null;
      return handleServiceResponse<Patient>(patient, error);
    }
    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    const patient = inMemoryPatients.find(p => p.id === id) || null;
    return handleServiceResponse<Patient>(patient, error);
  }
}

export async function createPatient(input: CreatePatientInput, practitionerId: string = 'prac-1'): Promise<ServiceResponse<Patient>> {
  const newPatient: Patient = {
    id: `p-${Date.now()}`,
    practitioner_id: practitionerId,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email || null,
    phone: input.phone || null,
    date_of_birth: input.date_of_birth || null,
    gender: input.gender || null,
    status: input.status || 'active',
    primary_ailment: input.primary_ailment || null,
    secondary_ailments: input.secondary_ailments || [],
    notes_summary: input.notes_summary || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    inMemoryPatients.unshift(newPatient);
    return { data: newPatient, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      inMemoryPatients.unshift(newPatient);
      return { data: newPatient, error: null };
    }

    const { data, error } = await supabase
      .from('patients')
      .insert({
        practitioner_id: practitionerId,
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        phone: input.phone,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        status: input.status || 'active',
        primary_ailment: input.primary_ailment,
        secondary_ailments: input.secondary_ailments,
        notes_summary: input.notes_summary
      })
      .select()
      .single();

    if (error || !data) {
      inMemoryPatients.unshift(newPatient);
      return { data: newPatient, error: null };
    }

    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    inMemoryPatients.unshift(newPatient);
    return handleServiceResponse<Patient>(newPatient, null);
  }
}

export async function updatePatient(id: string, input: Partial<CreatePatientInput>): Promise<ServiceResponse<Patient>> {
  const index = inMemoryPatients.findIndex(p => p.id === id);
  if (index !== -1) {
    inMemoryPatients[index] = {
      ...inMemoryPatients[index],
      ...input,
      updated_at: new Date().toISOString()
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryPatients[index] || null, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: inMemoryPatients[index] || null, error: null };
    }

    const { data, error } = await supabase
      .from('patients')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return { data: inMemoryPatients[index] || null, error: null };
    }

    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    return { data: inMemoryPatients[index] || null, error: null };
  }
}
