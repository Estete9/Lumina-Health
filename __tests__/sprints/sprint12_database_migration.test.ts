import { getPatients } from '../../lib/services/patientService';
import { getAppointments } from '../../lib/services/appointmentService';
import { getNotesByPatientId } from '../../lib/services/noteService';
import { getPractitionerAnalytics } from '../../lib/services/analyticsService';
import { authService } from '../../lib/services/authService';

jest.mock('../../lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null })
    })),
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'test-id' }, session: { access_token: 'test' } }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' }, access_token: 'test' } }, error: null }),
    }
  }))
}));

describe('Sprint 12 Database Migration', () => {
  it('patientService returns ServiceResponse', async () => {
    const res = await getPatients();
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('error');
  });

  it('appointmentService returns ServiceResponse', async () => {
    const res = await getAppointments();
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('error');
  });

  it('noteService returns ServiceResponse', async () => {
    const res = await getNotesByPatientId('patient-1');
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('error');
  });

  it('analyticsService returns ServiceResponse', async () => {
    const res = await getPractitionerAnalytics();
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('error');
  });

  it('authService login returns ServiceResponse', async () => {
    const res = await authService.login({ email: 'test@test.com', password: 'password' });
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('error');
  });
});
