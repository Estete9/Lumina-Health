import { createPatient, updatePatientStatus, getPatientById } from '../../lib/services/patientService';

describe('Sprint 8: Patient Status Lifecycle Management Unit Tests', () => {
  it('should update patient status across full lifecycle states', async () => {
    const p = await createPatient({ first_name: 'Winston', last_name: 'Smith', status: 'active' });
    const pId = p.data!.id;

    // Transition to Completed Therapy
    const completed = await updatePatientStatus(pId, 'completed');
    expect(completed.error).toBeNull();
    expect(completed.data?.status).toBe('completed');

    // Transition to Archived
    const archived = await updatePatientStatus(pId, 'archived');
    expect(archived.error).toBeNull();
    expect(archived.data?.status).toBe('archived');

    // Verify fetched record reflects updated status
    const fetched = await getPatientById(pId);
    expect(fetched.data?.status).toBe('archived');
  });
});
