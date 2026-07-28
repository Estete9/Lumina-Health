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

export interface DiagnosticDistributionItem {
  ailment: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface WeeklyTrendItem {
  dayOrWeek: string;
  completedSessions: number;
  scheduledSessions: number;
  completionRate: number;
}

export interface ClinicalDiscoveryFrequencyItem {
  tagOrDiscovery: string;
  category: 'cbt_insight' | 'symptom' | 'intervention';
  count: number;
  percentage: number;
}

export interface PractitionerAnalytics {
  practitionerId: string;
  totalPatients: number;
  activePatients: number;
  activeCaseloadRatio: number;
  totalSessionsCompleted: number;
  sessionCompletionRate: number;
  avgNotesPerPatient: number;
  diagnosticDistribution: DiagnosticDistributionItem[];
  weeklyTrends: WeeklyTrendItem[];
  topDiscoveries: ClinicalDiscoveryFrequencyItem[];
  lastUpdated: string;
}

// ==========================================
// CATEGORY 1: CLINICAL OUTCOMES INTERFACES
// ==========================================

export interface ClinicalOutcomeMetric {
  id: string;
  title: string;
  currentValue: number;
  previousValue: number;
  unit: '%' | 'pts' | 'count';
  changePercentage: number;
  isPositiveImprovement: boolean;
  baselineAvg: number;
  targetAvg: number;
  description: string;
}

export interface SymptomSeverityTrendPoint {
  period: string; // e.g. "Week 1", "Jan 2026", "Session 1"
  avgSeverityScore: number; // Scale 0-10 or PHQ-9 (0-27) / GAD-7 (0-21)
  severeCount: number;
  moderateCount: number;
  mildCount: number;
  remissionCount: number;
}

export interface AilmentDistributionItem {
  ailment: string;
  count: number;
  percentage: number;
  avgInitialSeverity: number;
  avgCurrentSeverity: number;
  improvementRate: number; // percentage reduction
  color?: string;
}

export interface ClinicalOutcomesData {
  overallImprovementRate: number;
  activeTrackedPatients: number;
  metrics: ClinicalOutcomeMetric[];
  severityTrends: SymptomSeverityTrendPoint[];
  ailmentDistribution: AilmentDistributionItem[];
}

// ==========================================
// CATEGORY 2: PRACTICE DYNAMICS INTERFACES
// ==========================================

export interface RetentionFunnelStage {
  stageId: string;
  stageName: string; // e.g. "Intake / Onboarding", "Sessions 1-3", "Sessions 4-8", "Maintenance/Completion"
  patientCount: number;
  conversionRate: number; // % reaching this stage from previous
  dropoffRate: number; // % dropping off at this stage
  avgSessionsInStage: number;
  color: string;
}

export interface MonthlyAttendanceTrendItem {
  month: string; // e.g. "May", "Jun", "Jul"
  scheduledSessions: number;
  attendedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  attendanceRate: number; // %
}

export interface CancellationRateMetric {
  totalCancellations: number;
  lateCancellations: number; // < 24 hrs
  cancellationRate: number; // %
  topReason: string;
  vsPreviousMonthChange: number;
}

export interface PracticeDynamicsData {
  overallRetentionRate: number;
  averageSessionFrequencyDays: number;
  retentionFunnel: RetentionFunnelStage[];
  monthlyAttendance: MonthlyAttendanceTrendItem[];
  cancellationMetrics: CancellationRateMetric;
}

// ==========================================
// CATEGORY 3: CASELOAD & CAPACITY INTERFACES
// ==========================================

export interface CapacityBandwidthMetric {
  currentActivePatients: number;
  maxCapacityThreshold: number;
  bandwidthPercentage: number;
  weeklySessionHours: number;
  maxWeeklyHours: number;
  status: 'Optimal' | 'Near Capacity' | 'Over Capacity' | 'Underutilized';
  statusColor: string;
}

export interface WeeklyWorkloadHeatmapSlot {
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  hourSlot: string; // e.g. "09:00", "10:00", "14:00"
  sessionCount: number;
  intensityLevel: 'empty' | 'low' | 'medium' | 'high' | 'peak';
}

export interface BurnoutRiskStatus {
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  consecutivePeakDays: number;
  overtimeHoursThisWeek: number;
  contributingFactors: string[];
  recommendedActions: string[];
}

export interface CaseloadCapacityData {
  bandwidth: CapacityBandwidthMetric;
  workloadHeatmap: WeeklyWorkloadHeatmapSlot[];
  burnoutRisk: BurnoutRiskStatus;
}

// ==========================================
// UNIFIED DECISION ANALYTICS HUB DATA PAYLOAD
// ==========================================

export interface DecisionAnalyticsHubData {
  practitionerId: string;
  clinicalOutcomes: ClinicalOutcomesData;
  practiceDynamics: PracticeDynamicsData;
  caseloadCapacity: CaseloadCapacityData;
  lastUpdated: string;
}
