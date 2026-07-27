import { getPatientById, createPatient } from '../../lib/services/patientService';

describe('patientService Unit Tests', () => {
  it('should create and find a patient by id in memory', async () => {
    // Add a dummy patient to memory via createPatient
    const created = await createPatient({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      date_of_birth: '1990-01-01',
      status: 'active',
      primary_ailment: 'Generalized Anxiety Disorder'
    });
    
    expect(created.data).toBeDefined();
    const newId = created.data!.id;

    const response = await getPatientById(newId);
    
    expect(response.data).toBeDefined();
    expect(response.data?.first_name).toBe('John');
    expect(response.error).toBeNull();
  });

  it('should return error for non-existent patient', async () => {
    const response = await getPatientById('non-existent-id');
    expect(response.data).toBeNull();
    expect(response.error).toBeDefined();
    expect(response.error).toContain('Patient not found');
  });
});
