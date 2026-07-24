export interface Practitioner {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  clinic_name?: string;
  created_at: string;
  updated_at?: string;
}

export type PatientStatus = 'active' | 'inactive' | 'completed' | 'archived';

export interface Patient {
  id: string;
  practitioner_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  status: PatientStatus;
  primary_ailment?: string | null;
  secondary_ailments?: string[] | null;
  tags?: string[] | null;
  notes_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  status?: PatientStatus;
  primary_ailment: string;
  secondary_ailments?: string[];
  tags?: string[];
  notes_summary?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patient_id: string;
  practitioner_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  patient_name?: string;
  session_type?: string;
}

export interface CreateAppointmentInput {
  patient_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type?: string;
  notes?: string;
  patient_name?: string;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  practitioner_id: string;
  session_date?: string;
  discoveries?: string[] | string | null;
  daily_actions?: string[] | string | null;
  ailments?: string[] | string | null;
  raw_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  patient_id: string;
  session_date: string;
  discoveries?: string[];
  daily_actions?: string[];
  ailments?: string[];
  raw_notes?: string;
}

export interface PractitionerDashboardStats {
  activePatientsCount: number;
  upcomingAppointmentsCount: number;
  notesWrittenThisWeek: number;
  recentAppointments: Appointment[];
  recentPatients: Patient[];
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface SearchResultItem {
  id: string;
  type: 'patient' | 'note' | 'appointment';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}
