'use server';

import { createClient } from '../supabase/server';
import { handleServiceResponse } from './baseService';
import { Appointment, AppointmentStatus, CreateAppointmentInput, ServiceResponse, TelehealthProvider } from '../types';
import { MOCK_APPOINTMENTS } from './mockData';

let inMemoryAppointments: Appointment[] = [...MOCK_APPOINTMENTS];

export async function getAppointments(practitionerId?: string): Promise<ServiceResponse<Appointment[]>> {
  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Appointment[]>(inMemoryAppointments, null);

  // For MVP, if no practitionerId is provided and no auth session exists, we bypass the filter
  // so we can see all seeded appointments in the database.
  let query = supabase.from('appointments').select('*').order('scheduled_at', { ascending: true });
  
  if (practitionerId) {
    query = query.eq('practitioner_id', practitionerId);
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      query = query.eq('practitioner_id', user.id);
    }
  }

  const { data, error } = await query;

  if (error || !data) return handleServiceResponse<Appointment[]>(inMemoryAppointments, null);
  return handleServiceResponse<Appointment[]>(data as Appointment[], null);
}

export async function getAppointmentsByPatientId(patientId: string): Promise<ServiceResponse<Appointment[]>> {
  const filtered = inMemoryAppointments.filter((a) => a.patient_id === patientId);

  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Appointment[]>(filtered, null);

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false });

  if (error || !data) return handleServiceResponse<Appointment[]>(filtered, null);
  return handleServiceResponse<Appointment[]>(data as Appointment[], null);
}

export async function createAppointment(input: CreateAppointmentInput, practitionerId?: string): Promise<ServiceResponse<Appointment>> {
  const supabase = await createClient();

  let targetId = practitionerId;
  if (!targetId && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }
  if (!targetId) targetId = 'prac-1';

  const newAppt: Appointment = {
    id: `apt-${Date.now()}`,
    patient_id: input.patient_id,
    practitioner_id: targetId as string,
    patient_name: input.patient_name,
    scheduled_at: input.scheduled_at,
    duration_minutes: input.duration_minutes,
    status: 'scheduled',
    session_type: input.session_type,
    notes: input.notes || '',
    telehealth_url: input.telehealth_url || null,
    telehealth_provider: input.telehealth_provider || null,
    created_at: new Date().toISOString()
  };

  inMemoryAppointments.unshift(newAppt);

  if (!supabase) return handleServiceResponse<Appointment>(newAppt, null);

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      practitioner_id: targetId as string,
      patient_id: input.patient_id,
      patient_name: input.patient_name,
      scheduled_at: input.scheduled_at,
      duration_minutes: input.duration_minutes,
      status: 'scheduled',
      session_type: input.session_type,
      notes: input.notes || '',
      telehealth_url: input.telehealth_url || null,
      telehealth_provider: input.telehealth_provider || null
    })
    .select()
    .single();

  if (error || !data) return handleServiceResponse<Appointment>(newAppt, null);
  return handleServiceResponse<Appointment>(data as Appointment, null);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<ServiceResponse<Appointment>> {
  const index = inMemoryAppointments.findIndex((a) => a.id === id);
  let updatedInMemory: Appointment | null = null;
  if (index !== -1) {
    inMemoryAppointments[index] = {
      ...inMemoryAppointments[index],
      status
    };
    updatedInMemory = inMemoryAppointments[index];
  } else {
    updatedInMemory = {
      id,
      patient_id: 'p-101',
      practitioner_id: 'prac-1',
      patient_name: 'Patient',
      scheduled_at: new Date().toISOString(),
      duration_minutes: 50,
      status,
      session_type: 'Therapy Session',
      created_at: new Date().toISOString()
    };
    inMemoryAppointments.unshift(updatedInMemory);
  }

  const supabase = await createClient();
  if (!supabase) return handleServiceResponse<Appointment>(updatedInMemory!, null);

  if (status === 'cancelled') {
    // Completely remove from Supabase
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    // Remove from in-memory array
    const index = inMemoryAppointments.findIndex((a) => a.id === id);
    if (index !== -1) inMemoryAppointments.splice(index, 1);

    if (error) return handleServiceResponse<Appointment>(updatedInMemory!, null);
    return handleServiceResponse<Appointment>(updatedInMemory!, null);
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return handleServiceResponse<Appointment>(updatedInMemory, null);
  return handleServiceResponse<Appointment>(data as Appointment, null);
}

export async function updateAppointmentTelehealth(
  id: string,
  telehealthUrl: string | null,
  telehealthProvider?: TelehealthProvider | null
): Promise<ServiceResponse<Appointment>> {
  const index = inMemoryAppointments.findIndex((a) => a.id === id);
  let updatedInMemory: Appointment | null = null;
  if (index !== -1) {
    inMemoryAppointments[index] = {
      ...inMemoryAppointments[index],
      telehealth_url: telehealthUrl,
      telehealth_provider: telehealthProvider || null
    };
    updatedInMemory = inMemoryAppointments[index];
  }

  const supabase = await createClient();
  if (!supabase) {
    if (updatedInMemory) return handleServiceResponse<Appointment>(updatedInMemory, null);
    return handleServiceResponse<Appointment>(null, 'Appointment not found');
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ telehealth_url: telehealthUrl, telehealth_provider: telehealthProvider || null })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    if (updatedInMemory) return handleServiceResponse<Appointment>(updatedInMemory, null);
    return handleServiceResponse<Appointment>(null, error);
  }
  return handleServiceResponse<Appointment>(data as Appointment, null);
}
