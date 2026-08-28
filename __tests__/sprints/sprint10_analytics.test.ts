import { getPractitionerAnalytics } from '../../lib/services/analyticsService';
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

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly calculate lean KPI metrics from domain services', async () => {
    // Mock patients
    const mockPatients: Patient[] = [
      { id: 'p1', practitioner_id: 'prac-1', first_name: 'John', last_name: 'Doe', status: 'active', created_at: '', updated_at: '' },
      { id: 'p2', practitioner_id: 'prac-1', first_name: 'Jane', last_name: 'Smith', status: 'completed', created_at: '', updated_at: '' },
    ];

    // Mock appointments
    const mockAppointments: Appointment[] = [
      { id: 'a1', patient_id: 'p1', practitioner_id: 'prac-1', scheduled_at: '2026-07-27T10:00:00Z', duration_minutes: 50, status: 'completed', created_at: '' },
      { id: 'a2', patient_id: 'p2', practitioner_id: 'prac-1', scheduled_at: '2026-07-28T11:00:00Z', duration_minutes: 50, status: 'cancelled', created_at: '' },
    ];

    // Mock notes
    const mockNotes: ClinicalNote[] = [
      { id: 'n1', patient_id: 'p1', practitioner_id: 'prac-1', created_at: '', updated_at: '' },
      { id: 'n2', patient_id: 'p2', practitioner_id: 'prac-1', created_at: '', updated_at: '' },
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
    expect(data.totalSessionsCompleted).toBe(1);
    expect(data.totalNotesCount).toBe(2);
  });

  it('should handle empty data gracefully', async () => {
    (patientService.getPatients as jest.Mock).mockResolvedValue({ data: [], error: null });
    (appointmentService.getAppointments as jest.Mock).mockResolvedValue({ data: [], error: null });
    (noteService.getNotes as jest.Mock).mockResolvedValue({ data: [], error: null });

    const response = await getPractitionerAnalytics('prac-1');
    
    expect(response.error).toBeNull();
    const data = response.data!;
    expect(data.totalPatients).toBe(0);
    expect(data.activePatients).toBe(0);
    expect(data.totalSessionsCompleted).toBe(0);
    expect(data.totalNotesCount).toBe(0);
  });
});
