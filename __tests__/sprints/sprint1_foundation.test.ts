import { getDashboardStats } from '../../lib/services/dashboardService';
import { getPatients } from '../../lib/services/patientService';

describe('Sprint 1: Foundation & Roster Service Unit Tests', () => {
  it('should return default practitioner stats', async () => {
    const res = await getDashboardStats('prac-1');
    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data?.activePatientsCount).toBeGreaterThanOrEqual(0);
    expect(res.data?.upcomingAppointmentsCount).toBeGreaterThanOrEqual(0);
  });

  it('should fetch patient roster without errors', async () => {
    const res = await getPatients('prac-1');
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
  });
});
