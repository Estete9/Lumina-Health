import { getPractitionerAnalytics, getDecisionAnalyticsHubData } from '../../lib/services/analyticsService';
import * as patientService from '../../lib/services/patientService';
import * as appointmentService from '../../lib/services/appointmentService';
import * as noteService from '../../lib/services/noteService';
import { Patient, Appointment, ClinicalNote } from '../../lib/types';

jest.mock('../../lib/services/patientService');
jest.mock('../../lib/services/appointmentService');
jest.mock('../../lib/services/noteService');
jest.mock('../../lib/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue(null),
}));

describe('Analytics Service (Sprint 10: PRP-05)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly calculate KPI metrics from domain services', async () => {
    // Mock patients
    const mockPatients: Patient[] = [
      { id: 'p1', practitioner_id: 'prac-1', first_name: 'John', last_name: 'Doe', status: 'active', primary_ailment: 'Generalized Anxiety Disorder', secondary_ailments: ['Panic Disorder'], created_at: '', updated_at: '' },
      { id: 'p2', practitioner_id: 'prac-1', first_name: 'Jane', last_name: 'Smith', status: 'completed', primary_ailment: 'Major Depressive Disorder', created_at: '', updated_at: '' },
    ];

    // Mock appointments
    const mockAppointments: Appointment[] = [
      { id: 'a1', patient_id: 'p1', practitioner_id: 'prac-1', scheduled_at: '2026-07-27T10:00:00Z', duration_minutes: 50, status: 'completed', created_at: '' }, // Monday
      { id: 'a2', patient_id: 'p2', practitioner_id: 'prac-1', scheduled_at: '2026-07-28T11:00:00Z', duration_minutes: 50, status: 'cancelled', created_at: '' }, // Tuesday
    ];

    // Mock notes
    const mockNotes: ClinicalNote[] = [
      { id: 'n1', patient_id: 'p1', practitioner_id: 'prac-1', session_date: '2026-07-27', discoveries: ['Catastrophizing'], ailments: ['Panic Attack'], created_at: '', updated_at: '' },
      { id: 'n2', patient_id: 'p2', practitioner_id: 'prac-1', session_date: '2026-07-28', discoveries: ['Catastrophizing', 'Sleep Hygiene'], ailments: [], created_at: '', updated_at: '' },
    ];

    (patientService.getPatients as jest.Mock).mockResolvedValue({ data: mockPatients, error: null });
    (appointmentService.getAppointments as jest.Mock).mockResolvedValue({ data: mockAppointments, error: null });
    (noteService.getNotes as jest.Mock).mockResolvedValue({ data: mockNotes, error: null });

    const response = await getPractitionerAnalytics('prac-1');
    
    expect(response.error).toBeNull();
    expect(response.data).toBeDefined();

    const data = response.data!;
    
    // Check KPIs
    expect(data.totalPatients).toBe(2);
    expect(data.activePatients).toBe(1);
    expect(data.activeCaseloadRatio).toBe(50); // 1 / 2 * 100
    
    // Check session completion rate
    // Total non-cancelled = 1 (a1). Completed = 1 (a1)
    expect(data.totalSessionsCompleted).toBe(1);
    expect(data.sessionCompletionRate).toBe(100);

    // Check notes average
    expect(data.avgNotesPerPatient).toBe(1); // 2 notes / 2 patients

    // Check diagnostic distribution
    const gad = data.diagnosticDistribution.find(d => d.ailment === 'Generalized Anxiety Disorder');
    expect(gad).toBeDefined();
    expect(gad?.count).toBe(1);

    // Check top discoveries
    const catastrophizing = data.topDiscoveries.find(d => d.tagOrDiscovery === 'Catastrophizing');
    expect(catastrophizing).toBeDefined();
    expect(catastrophizing?.count).toBe(2);
    expect(catastrophizing?.category).toBe('cbt_insight');
  });

  it('should handle empty data gracefully', async () => {
    (patientService.getPatients as jest.Mock).mockResolvedValue({ data: [], error: null });
    (appointmentService.getAppointments as jest.Mock).mockResolvedValue({ data: [], error: null });
    (noteService.getNotes as jest.Mock).mockResolvedValue({ data: [], error: null });

    const response = await getPractitionerAnalytics('prac-1');
    
    expect(response.error).toBeNull();
    const data = response.data!;
    expect(data.totalPatients).toBe(0);
    expect(data.activeCaseloadRatio).toBe(0);
    expect(data.sessionCompletionRate).toBe(0);
    expect(data.diagnosticDistribution.length).toBe(0);
  });
  
  it('should generate decision analytics hub data', async () => {
    (patientService.getPatients as jest.Mock).mockResolvedValue({ data: [], error: null });
    (appointmentService.getAppointments as jest.Mock).mockResolvedValue({ data: [], error: null });
    (noteService.getNotes as jest.Mock).mockResolvedValue({ data: [], error: null });

    const response = await getDecisionAnalyticsHubData('prac-1');
    
    expect(response.error).toBeNull();
    const data = response.data!;
    
    // clinicalOutcomes
    expect(data.clinicalOutcomes.overallImprovementRate).toBe(52.8);
    expect(data.clinicalOutcomes.metrics.length).toBeGreaterThan(0);
    expect(data.clinicalOutcomes.severityTrends.length).toBeGreaterThan(0);
    
    // practiceDynamics
    expect(data.practiceDynamics.overallRetentionRate).toBe(75.0);
    expect(data.practiceDynamics.retentionFunnel.length).toBeGreaterThan(0);
    expect(data.practiceDynamics.monthlyAttendance.length).toBeGreaterThan(0);
    
    // caseloadCapacity
    expect(data.caseloadCapacity.bandwidth.status).toBeDefined();
    expect(data.caseloadCapacity.workloadHeatmap.length).toBeGreaterThan(0);
    expect(data.caseloadCapacity.burnoutRisk.riskLevel).toBeDefined();
  });
});
