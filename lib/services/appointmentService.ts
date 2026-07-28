import { createClient } from '../supabase/client';
import { handleServiceResponse } from './baseService';
import { Appointment, AppointmentStatus, CreateAppointmentInput, ServiceResponse, TelehealthProvider } from '../types';
import { MOCK_APPOINTMENTS } from './mockData';

let inMemoryAppointments: Appointment[] = [...MOCK_APPOINTMENTS];

export async function getAppointments(practitionerId: string = 'prac-1'): Promise<ServiceResponse<Appointment[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryAppointments, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) return { data: inMemoryAppointments, error: null };
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return handleServiceResponse<Appointment[]>(inMemoryAppointments, null);
    }
    return handleServiceResponse<Appointment[]>(data as Appointment[], null);
  } catch (error) {
    return handleServiceResponse<Appointment[]>(inMemoryAppointments, error);
  }
}

export async function getAppointmentsByPatientId(patientId: string): Promise<ServiceResponse<Appointment[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const filtered = inMemoryAppointments
      .filter((a) => a.patient_id === patientId)
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    return { data: filtered, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      const filtered = inMemoryAppointments
        .filter((a) => a.patient_id === patientId)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
      return { data: filtered, error: null };
    }
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false });

    if (error) {
      const filtered = inMemoryAppointments
        .filter((a) => a.patient_id === patientId)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
      return handleServiceResponse<Appointment[]>(filtered, null);
    }
    return handleServiceResponse<Appointment[]>(data as Appointment[], null);
  } catch (error) {
    const filtered = inMemoryAppointments
      .filter((a) => a.patient_id === patientId)
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    return handleServiceResponse<Appointment[]>(filtered, error);
  }
}

export async function createAppointment(input: CreateAppointmentInput, practitionerId: string = 'prac-1'): Promise<ServiceResponse<Appointment>> {
  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    patient_id: input.patient_id,
    practitioner_id: practitionerId,
    patient_name: input.patient_name,
    scheduled_at: input.scheduled_at,
    duration_minutes: input.duration_minutes,
    status: 'scheduled',
    session_type: input.session_type,
    notes: input.notes || '',
    telehealth_url: input.telehealth_url || null,
    telehealth_provider: input.telehealth_provider || null,
    created_at: new Date().toISOString(),
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    inMemoryAppointments.unshift(newAppointment);
    return { data: newAppointment, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      inMemoryAppointments.unshift(newAppointment);
      return { data: newAppointment, error: null };
    }
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        practitioner_id: practitionerId,
        patient_id: input.patient_id,
        scheduled_at: input.scheduled_at,
        duration_minutes: input.duration_minutes,
        status: 'scheduled',
        session_type: input.session_type,
        notes: input.notes,
        telehealth_url: input.telehealth_url,
        telehealth_provider: input.telehealth_provider
      })
      .select()
      .single();

    if (error || !data) {
      inMemoryAppointments.unshift(newAppointment);
      return { data: newAppointment, error: null };
    }

    return handleServiceResponse<Appointment>(data as Appointment, null);
  } catch (error) {
    inMemoryAppointments.unshift(newAppointment);
    return handleServiceResponse<Appointment>(newAppointment, null);
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<ServiceResponse<Appointment>> {
  const index = inMemoryAppointments.findIndex((a) => a.id === id);
  if (index !== -1) {
    inMemoryAppointments[index] = { ...inMemoryAppointments[index], status };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryAppointments[index] || null, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      return { data: inMemoryAppointments[index] || null, error: null };
    }
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return { data: inMemoryAppointments[index] || null, error: null };
    }

    return handleServiceResponse<Appointment>(data as Appointment, null);
  } catch (error) {
    return { data: inMemoryAppointments[index] || null, error: null };
  }
}

export async function updateAppointmentTelehealth(
  id: string,
  telehealthUrl: string | null,
  telehealthProvider?: TelehealthProvider | null
): Promise<ServiceResponse<Appointment>> {
  const index = inMemoryAppointments.findIndex((a) => a.id === id);
  if (index !== -1) {
    inMemoryAppointments[index] = {
      ...inMemoryAppointments[index],
      telehealth_url: telehealthUrl,
      telehealth_provider: telehealthProvider || null
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: inMemoryAppointments[index] || null, error: null };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      return { data: inMemoryAppointments[index] || null, error: null };
    }
    const { data, error } = await supabase
      .from('appointments')
      .update({ telehealth_url: telehealthUrl, telehealth_provider: telehealthProvider || null })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return { data: inMemoryAppointments[index] || null, error: null };
    }

    return handleServiceResponse<Appointment>(data as Appointment, null);
  } catch (error) {
    return { data: inMemoryAppointments[index] || null, error: null };
  }
}
