import { createAppointment, updateAppointmentTelehealth, getAppointments, getAppointmentsByPatientId } from '@/lib/services/appointmentService';
import { CreateAppointmentInput } from '@/lib/types';

describe('Sprint 11: Telehealth Service Layer Tests', () => {
  const patientId = 'p-101';
  let createdAppointmentId: string;

  it('createAppointment successfully persists telehealth_url and telehealth_provider', async () => {
    const input: CreateAppointmentInput = {
      patient_id: patientId,
      scheduled_at: new Date().toISOString(),
      duration_minutes: 50,
      session_type: 'Initial Consultation',
      notes: 'Testing telehealth',
      patient_name: 'Test Patient',
      telehealth_url: 'https://meet.google.com/test-room',
      telehealth_provider: 'meet'
    };

    const response = await createAppointment(input);
    expect(response.error).toBeNull();
    expect(response.data).toBeDefined();
    expect(response.data?.telehealth_url).toBe('https://meet.google.com/test-room');
    expect(response.data?.telehealth_provider).toBe('meet');
    
    if (response.data) {
      createdAppointmentId = response.data.id;
    }
  });

  it('updateAppointmentTelehealth modifies telehealth properties on an existing appointment', async () => {
    const newUrl = 'https://zoom.us/j/1234567890';
    const response = await updateAppointmentTelehealth(createdAppointmentId, newUrl, 'zoom');
    
    expect(response.error).toBeNull();
    expect(response.data).toBeDefined();
    expect(response.data?.telehealth_url).toBe(newUrl);
    expect(response.data?.telehealth_provider).toBe('zoom');
  });

  it('getAppointments returns telehealth fields correctly', async () => {
    const response = await getAppointments();
    expect(response.error).toBeNull();
    
    const appointment = response.data?.find(a => a.id === createdAppointmentId);
    expect(appointment).toBeDefined();
    expect(appointment?.telehealth_url).toBe('https://zoom.us/j/1234567890');
    expect(appointment?.telehealth_provider).toBe('zoom');
  });

  it('getAppointmentsByPatientId returns telehealth fields correctly', async () => {
    const response = await getAppointmentsByPatientId(patientId);
    expect(response.error).toBeNull();
    
    const appointment = response.data?.find(a => a.id === createdAppointmentId);
    expect(appointment).toBeDefined();
    expect(appointment?.telehealth_url).toBe('https://zoom.us/j/1234567890');
    expect(appointment?.telehealth_provider).toBe('zoom');
  });
});
