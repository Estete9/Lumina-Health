import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { Patient, CreatePatientInput, PatientStatus, ServiceResponse } from '../types';
import { MOCK_PATIENTS } from './mockData';

let inMemoryPatients: Patient[] = [...MOCK_PATIENTS];

export async function getPatients(practitionerId: string = 'prac-1'): Promise<ServiceResponse<Patient[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryPatients, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: inMemoryPatients, error: null };
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .order('last_name', { ascending: true });

    if (error) {
      return handleServiceResponse<Patient[]>(inMemoryPatients, null);
    }

    const dbPatients = (data as Patient[]) || [];
    const dbIds = new Set(dbPatients.map((p) => p.id));
    const localFiltered = inMemoryPatients.filter((p) => !dbIds.has(p.id));

    return handleServiceResponse<Patient[]>([...localFiltered, ...dbPatients], null);
  } catch (error) {
    return handleServiceResponse<Patient[]>(inMemoryPatients, error);
  }
}

export async function getPatientById(id: string): Promise<ServiceResponse<Patient>> {
  const localPatient = inMemoryPatients.find((p) => p.id === id);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (localPatient) return { data: localPatient, error: null };
    return { data: null, error: 'Patient not found' };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      if (localPatient) return { data: localPatient, error: null };
      return { data: null, error: 'Patient not found' };
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      if (localPatient) return { data: localPatient, error: null };
      return handleServiceResponse<Patient>(null, error);
    }

    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    if (localPatient) return handleServiceResponse<Patient>(localPatient, null);
    return handleServiceResponse<Patient>(null, error);
  }
}

export async function createPatient(input: CreatePatientInput, practitionerId: string = 'prac-1'): Promise<ServiceResponse<Patient>> {
  const newPatient: Patient = {
    id: `pat-${Date.now()}`,
    practitioner_id: practitionerId,
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: newPatient, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
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
        tags: input.tags
      })
      .select()
      .single();

    if (error || !data) {
      return { data: newPatient, error: null };
    }

    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    return handleServiceResponse<Patient>(newPatient, null);
  }
}

export async function updatePatient(id: string, input: Partial<CreatePatientInput>): Promise<ServiceResponse<Patient>> {
  const patientIndex = inMemoryPatients.findIndex((p) => p.id === id);
  let updatedInMemoryPatient: Patient | null = null;

  if (patientIndex !== -1) {
    inMemoryPatients[patientIndex] = {
      ...inMemoryPatients[patientIndex],
      ...input,
      updated_at: new Date().toISOString()
    };
    updatedInMemoryPatient = inMemoryPatients[patientIndex];
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (updatedInMemoryPatient) return { data: updatedInMemoryPatient, error: null };
    return { data: null, error: 'Patient not found' };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      if (updatedInMemoryPatient) return { data: updatedInMemoryPatient, error: null };
      return { data: null, error: 'Patient not found' };
    }

    const { data, error } = await supabase
      .from('patients')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      if (updatedInMemoryPatient) return { data: updatedInMemoryPatient, error: null };
      return handleServiceResponse<Patient>(null, error);
    }

    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    if (updatedInMemoryPatient) return handleServiceResponse<Patient>(updatedInMemoryPatient, null);
    return handleServiceResponse<Patient>(null, error);
  }
}

export async function updatePatientStatus(id: string, status: PatientStatus): Promise<ServiceResponse<Patient>> {
  const patientIndex = inMemoryPatients.findIndex((p) => p.id === id);
  let updatedInMemoryPatient: Patient | null = null;

  if (patientIndex !== -1) {
    inMemoryPatients[patientIndex] = {
      ...inMemoryPatients[patientIndex],
      status,
      updated_at: new Date().toISOString()
    };
    updatedInMemoryPatient = inMemoryPatients[patientIndex];
  } else {
    // Fallback patient if not in memory
    updatedInMemoryPatient = {
      id,
      practitioner_id: 'prac-1',
      first_name: 'Patient',
      last_name: id,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryPatients.unshift(updatedInMemoryPatient);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: updatedInMemoryPatient, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: updatedInMemoryPatient, error: null };
    }

    const { data, error } = await supabase
      .from('patients')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return { data: updatedInMemoryPatient, error: null };
    }

    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    return handleServiceResponse<Patient>(updatedInMemoryPatient, null);
  }
}
