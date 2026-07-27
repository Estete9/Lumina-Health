import { getAppointments, createAppointment, updateAppointmentStatus } from '../../lib/services/appointmentService';

describe('Sprint 2: Interactive Session Scheduler Unit Tests', () => {
  it('should fetch appointments for practitioner', async () => {
    const res = await getAppointments('prac-1');
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should create a new therapy appointment', async () => {
    const newAppt = await createAppointment({
      patient_id: 'pat-1',
      start_time: '2026-08-01T10:00:00Z',
      end_time: '2026-08-01T11:00:00Z',
      status: 'scheduled',
      notes: 'Initial evaluation session'
    }, 'prac-1');

    expect(newAppt.error).toBeNull();
    expect(newAppt.data).toBeDefined();
    expect(newAppt.data?.status).toBe('scheduled');
  });

  it('should update appointment status', async () => {
    const newAppt = await createAppointment({
      patient_id: 'pat-1',
      start_time: '2026-08-02T10:00:00Z',
      end_time: '2026-08-02T11:00:00Z',
      status: 'scheduled'
    }, 'prac-1');

    const apptId = newAppt.data!.id;
    const updated = await updateAppointmentStatus(apptId, 'completed');
    expect(updated.error).toBeNull();
    expect(updated.data?.status).toBe('completed');
  });
});
