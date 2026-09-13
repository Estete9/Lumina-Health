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

export type TelehealthProvider = 'meet' | 'zoom' | 'teams' | 'custom';

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
  telehealth_url?: string | null;
  telehealth_provider?: TelehealthProvider | null;
}

export interface CreateAppointmentInput {
  patient_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type?: string;
  notes?: string;
  patient_name?: string;
  telehealth_url?: string;
  telehealth_provider?: TelehealthProvider;
}

export interface UpdateAppointmentTelehealthInput {
  id: string;
  telehealth_url: string | null;
  telehealth_provider?: TelehealthProvider | null;
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
  recentNotes: (ClinicalNote & { patient_name: string })[];
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
  date?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  specialty?: string;
  clinic_name?: string;
  created_at: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password?: string;
  specialty?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  session_id?: string;
  access_token?: string;
  expires_at?: number;
}

export interface AuthResponseData {
  user: AuthUser | null;
  session: AuthSession | null;
}

export type Direction = "up" | "down" | "flat";
export type AttentionLevel = "risk" | "warn" | "info";
export type NavKey = "overview" | "clinical" | "attendance" | "financial" | "pipeline" | "compliance";

export interface ActivityItem {
  iconName: string;
  text: string;
  time: string;
  tone: 'neutral' | 'risk' | 'warn' | 'good';
}

export interface Kpi {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  good?: boolean;
  trend?: string;
}

export interface AttentionItem {
  level: AttentionLevel;
  iconName: string;
  title: string;
  meta: string;
}

export interface CaseloadMonth {
  month: string;
  improving: number;
  stable: number;
  worsening: number;
}

export interface ClientSparkline {
  id: string;
  issue: string;
  data: number[];
  direction: Direction;
  client?: string;
  measure?: string;
  score?: number;
  prev?: number;
}

export interface NoShowWeek {
  week: string;
  rate: number;
}

export interface RevenueMonth {
  month: string;
  insurance: number;
  private: number;
}

export interface ArBucket {
  bucket: string;
  amount: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  value?: number;
  conversion?: string | null;
}

export interface ReferralSource {
  source: string;
  inquiries: number;
  retained: string;
}

export interface ComplianceItem {
  label: string;
  pct: number;
  note?: string;
  task?: string;
  progress?: number;
}

export interface PractitionerAnalytics {
  practitionerId: string;
  totalPatients: number;
  activePatients: number;
  totalSessionsCompleted: number;
  totalNotesCount: number;
  lastUpdated: string;
  activity: ActivityItem[];
  kpis: Kpi[];
  attentionItems: AttentionItem[];
  caseloadTrajectory: CaseloadMonth[];
  clientSparklines: ClientSparkline[];
  noShowTrend: NoShowWeek[];
  revenueData: RevenueMonth[];
  arAging: ArBucket[];
  funnel: FunnelStage[];
  referralSources: ReferralSource[];
  compliance: ComplianceItem[];
}

export type ScratchpadCategory = 'admin' | 'clinical' | 'follow_up' | 'supervision';

export interface ScratchpadNote {
  id: string;
  practitioner_id: string;
  content: string;
  category?: ScratchpadCategory;
  is_pinned?: boolean;
  is_completed?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateScratchpadInput {
  content: string;
  category?: ScratchpadCategory;
  is_pinned?: boolean;
  is_completed?: boolean;
  practitioner_id?: string;
}

export interface UpdateScratchpadInput {
  content?: string;
  category?: ScratchpadCategory;
  is_pinned?: boolean;
  is_completed?: boolean;
}

