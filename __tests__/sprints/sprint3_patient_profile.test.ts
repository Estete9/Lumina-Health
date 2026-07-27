import { getPatientById, createPatient } from '../../lib/services/patientService';
import { getNotesByPatientId } from '../../lib/services/noteService';
import { getAppointmentsByPatientId } from '../../lib/services/appointmentService';

describe('Sprint 3: Patient Detail Profile Unit Tests', () => {
  it('should retrieve comprehensive patient details and clinical history', async () => {
    const patientRes = await createPatient({
      first_name: 'Sarah',
      last_name: 'Connor',
      primary_ailment: 'Post-Traumatic Stress Disorder'
    });

    const patientId = patientRes.data!.id;

    const fetchedPatient = await getPatientById(patientId);
    expect(fetchedPatient.data?.first_name).toBe('Sarah');

    const notesRes = await getNotesByPatientId(patientId);
    expect(notesRes.error).toBeNull();
    expect(Array.isArray(notesRes.data)).toBe(true);

    const apptsRes = await getAppointmentsByPatientId(patientId);
    expect(apptsRes.error).toBeNull();
    expect(Array.isArray(apptsRes.data)).toBe(true);
  });
});
