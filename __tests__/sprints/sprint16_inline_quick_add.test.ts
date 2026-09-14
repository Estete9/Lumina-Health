import { createPatient } from '../../lib/services/patientService';

describe('Sprint 16: Patient Roster Inline Quick-Add Unit Tests', () => {
  it('should successfully create a patient with only minimal required fields', async () => {
    const res = await createPatient({
      first_name: 'Jane',
      last_name: 'Doe',
      primary_ailment: 'Insomnia'
    });

    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data?.first_name).toBe('Jane');
    expect(res.data?.last_name).toBe('Doe');
    expect(res.data?.primary_ailment).toBe('Insomnia');
  });

  it('should default the patient status to active when omitted', async () => {
    const res = await createPatient({
      first_name: 'John',
      last_name: 'Smith',
      primary_ailment: 'Anxiety'
    });

    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data?.status).toBe('active');
  });
});
