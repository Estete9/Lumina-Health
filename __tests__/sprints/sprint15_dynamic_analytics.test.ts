import { getPractitionerAnalytics } from '../../lib/services/analyticsService';
import * as patientService from '../../lib/services/patientService';
import * as appointmentService from '../../lib/services/appointmentService';
import * as noteService from '../../lib/services/noteService';
import { Patient, Appointment, ClinicalNote, PatientStatus, AppointmentStatus } from '../../lib/types';

jest.mock('../../lib/services/patientService');
jest.mock('../../lib/services/appointmentService');
jest.mock('../../lib/services/noteService');

const mockedPatientService = patientService as jest.Mocked<typeof patientService>;
const mockedAppointmentService = appointmentService as jest.Mocked<typeof appointmentService>;
const mockedNoteService = noteService as jest.Mocked<typeof noteService>;

describe('Sprint 15 Dynamic Analytics Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('handles graceful empty state handling', async () => {
    mockedPatientService.getPatients.mockResolvedValue({ data: [], error: null });
    mockedAppointmentService.getAppointments.mockResolvedValue({ data: [], error: null });
    mockedNoteService.getNotes.mockResolvedValue({ data: [], error: null });

    const res = await getPractitionerAnalytics();
    
    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();

    const data = res.data!;
    
    expect(data.activity).toEqual([]);
    expect(data.attentionItems).toEqual([
      expect.objectContaining({ title: 'Positive risk screen' }),
      expect.objectContaining({ title: 'Treatment plans expiring' }),
      expect.objectContaining({ title: 'Overdue notes', meta: 'All completed sessions documented' }),
      expect.objectContaining({ title: 'Stuck claims' })
    ]);
    expect(data.noShowTrend).toHaveLength(8);
    expect(data.noShowTrend[0].week).toBe('W1');
    expect(data.noShowTrend[7].week).toBe('W8');
    
    expect(data.funnel).toHaveLength(4);
    expect(data.funnel[0].count).toBe(0); // Inquiries
    expect(data.funnel[1].count).toBe(0); // Consults
    expect(data.funnel[2].count).toBe(0); // Intakes
    expect(data.funnel[3].count).toBe(0); // Retained

    expect(data.compliance).toHaveLength(3);
    expect(data.compliance[0].pct).toBe(100);
  });

  it('computes Activity Feed correctly', async () => {
    const patients: Patient[] = [
      { id: 'p1', practitioner_id: 'prac-1', first_name: 'John', last_name: 'Doe', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    const appointments: Appointment[] = [
      { id: 'a1', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: new Date(Date.now() - 100000).toISOString(), duration_minutes: 50, status: 'completed', created_at: new Date().toISOString() },
      { id: 'a2', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: new Date(Date.now() - 50000).toISOString(), duration_minutes: 50, status: 'no_show', created_at: new Date().toISOString() }
    ];
    const notes: ClinicalNote[] = [
      { id: 'n1', practitioner_id: 'prac-1', patient_id: 'p1', session_date: new Date(Date.now() - 1000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    mockedPatientService.getPatients.mockResolvedValue({ data: patients, error: null });
    mockedAppointmentService.getAppointments.mockResolvedValue({ data: appointments, error: null });
    mockedNoteService.getNotes.mockResolvedValue({ data: notes, error: null });

    const res = await getPractitionerAnalytics();
    const activity = res.data!.activity;

    expect(activity.length).toBe(3);
    expect(activity[0].text).toContain('Client J.D.'); // from notes
    expect(activity[0].iconName).toBe('FileText');
    
    expect(activity[1].text).toContain('Client J.D.'); // from no-show appt
    expect(activity[1].iconName).toBe('AlertTriangle');
    
    expect(activity[2].text).toContain('Client J.D.'); // from completed appt
    expect(activity[2].iconName).toBe('CheckCircle');
  });

  it('computes Attention Items Risk Calculation correctly', async () => {
    const patients: Patient[] = [
      { id: 'p1', practitioner_id: 'prac-1', first_name: 'Jane', last_name: 'Smith', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    // Completed appt but no note => should flag overdue notes
    const appointments: Appointment[] = [
      { id: 'a1', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: new Date().toISOString(), duration_minutes: 50, status: 'completed', created_at: new Date().toISOString() }
    ];

    mockedPatientService.getPatients.mockResolvedValue({ data: patients, error: null });
    mockedAppointmentService.getAppointments.mockResolvedValue({ data: appointments, error: null });
    mockedNoteService.getNotes.mockResolvedValue({ data: [], error: null });

    const res = await getPractitionerAnalytics();
    const overdue = res.data!.attentionItems.find(i => i.title === 'Overdue notes');
    
    expect(overdue).toBeDefined();
    expect(overdue!.level).toBe('warn');
    expect(overdue!.meta).toContain('1 unsigned clinical note');
  });

  it('computes No-Show Trend Bucketing correctly', async () => {
    const appointments: Appointment[] = [];
    
    // Create an appt from 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    appointments.push(
      { id: 'a1', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: oneWeekAgo.toISOString(), duration_minutes: 50, status: 'no_show', created_at: new Date().toISOString() },
      { id: 'a2', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: oneWeekAgo.toISOString(), duration_minutes: 50, status: 'completed', created_at: new Date().toISOString() }
    );

    mockedPatientService.getPatients.mockResolvedValue({ data: [], error: null });
    mockedAppointmentService.getAppointments.mockResolvedValue({ data: appointments, error: null });
    mockedNoteService.getNotes.mockResolvedValue({ data: [], error: null });

    const res = await getPractitionerAnalytics();
    const trend = res.data!.noShowTrend;

    expect(trend).toHaveLength(8);
    // W7 is one week ago
    const w7 = trend.find(t => t.week === 'W7');
    expect(w7).toBeDefined();
    // 1 no_show / 2 total = 50%
    expect(w7!.rate).toBe(50);
  });

  it('computes Funnel Conversion Rates correctly', async () => {
    const patients: Patient[] = [
      { id: 'p1', practitioner_id: 'prac-1', first_name: 'A', last_name: 'B', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'p2', practitioner_id: 'prac-1', first_name: 'C', last_name: 'D', status: 'inactive', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    // p1 has 2 completed -> Retained (Consult=yes, Intake=active)
    // p2 has 1 cancelled -> Consult (Not Retained, Not Intake)
    const appointments: Appointment[] = [
      { id: 'a1', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: new Date().toISOString(), duration_minutes: 50, status: 'completed', created_at: new Date().toISOString() },
      { id: 'a2', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: new Date().toISOString(), duration_minutes: 50, status: 'completed', created_at: new Date().toISOString() },
      { id: 'a3', practitioner_id: 'prac-1', patient_id: 'p2', scheduled_at: new Date().toISOString(), duration_minutes: 50, status: 'cancelled', created_at: new Date().toISOString() }
    ];

    mockedPatientService.getPatients.mockResolvedValue({ data: patients, error: null });
    mockedAppointmentService.getAppointments.mockResolvedValue({ data: appointments, error: null });
    mockedNoteService.getNotes.mockResolvedValue({ data: [], error: null });

    const res = await getPractitionerAnalytics();
    const funnel = res.data!.funnel;

    // Inquiries: 2
    expect(funnel[0].count).toBe(2);
    // Consults: 2
    expect(funnel[1].count).toBe(2);
    expect(funnel[1].conversion).toBe('· 100%');
    // Intakes (Active): 1
    expect(funnel[2].count).toBe(1);
    expect(funnel[2].conversion).toBe('· 50%');
    // Retained (>= 2 completed): 1
    expect(funnel[3].count).toBe(1);
    expect(funnel[3].conversion).toBe('· 100%');
  });

  it('computes Compliance Percentage correctly', async () => {
    const patients: Patient[] = [
      { id: 'p1', practitioner_id: 'prac-1', first_name: 'Jane', last_name: 'Smith', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    
    // 4 completed sessions on distinct dates
    const d1 = new Date('2023-01-01T10:00:00Z').toISOString();
    const d2 = new Date('2023-01-02T10:00:00Z').toISOString();
    const d3 = new Date('2023-01-03T10:00:00Z').toISOString();
    const d4 = new Date('2023-01-04T10:00:00Z').toISOString();
    
    const appointments: Appointment[] = [
      { id: 'a1', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: d1, duration_minutes: 50, status: 'completed', created_at: d1 },
      { id: 'a2', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: d2, duration_minutes: 50, status: 'completed', created_at: d2 },
      { id: 'a3', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: d3, duration_minutes: 50, status: 'completed', created_at: d3 },
      { id: 'a4', practitioner_id: 'prac-1', patient_id: 'p1', scheduled_at: d4, duration_minutes: 50, status: 'completed', created_at: d4 }
    ];
    // 3 notes for p1 (missing d4) -> 75% compliance
    const notes: ClinicalNote[] = [
      { id: 'n1', practitioner_id: 'prac-1', patient_id: 'p1', session_date: d1, created_at: d1, updated_at: d1 },
      { id: 'n2', practitioner_id: 'prac-1', patient_id: 'p1', session_date: d2, created_at: d2, updated_at: d2 },
      { id: 'n3', practitioner_id: 'prac-1', patient_id: 'p1', session_date: d3, created_at: d3, updated_at: d3 }
    ];

    mockedPatientService.getPatients.mockResolvedValue({ data: patients, error: null });
    mockedAppointmentService.getAppointments.mockResolvedValue({ data: appointments, error: null });
    mockedNoteService.getNotes.mockResolvedValue({ data: notes, error: null });

    const res = await getPractitionerAnalytics();
    
    const docItem = res.data!.compliance.find(c => c.label === 'Notes completed < 24h');
    expect(docItem).toBeDefined();
    expect(docItem!.pct).toBe(75);
  });
});
