import { createPatient, updatePatient } from '../../lib/services/patientService';

describe('Sprint 4: Patient Registration & Roster Unit Tests', () => {
  it('should register a patient with DSM-5 primary focus and tags', async () => {
    const res = await createPatient({
      first_name: 'Marcus',
      last_name: 'Aurelius',
      primary_ailment: 'Generalized Anxiety Disorder',
      secondary_ailments: ['Mild Depression'],
      tags: ['Stoicism', 'High-Stress']
    });

    expect(res.error).toBeNull();
    expect(res.data?.primary_ailment).toBe('Generalized Anxiety Disorder');
    expect(res.data?.tags).toContain('Stoicism');
  });

  it('should update patient demographics and comorbidities', async () => {
    const created = await createPatient({
      first_name: 'Lucius',
      last_name: 'Verus',
      primary_ailment: 'ADHD'
    });

    const updated = await updatePatient(created.data!.id, {
      phone: '555-0199',
      tags: ['Executive Function']
    });

    expect(updated.error).toBeNull();
    expect(updated.data?.phone).toBe('555-0199');
    expect(updated.data?.tags).toContain('Executive Function');
  });
});
