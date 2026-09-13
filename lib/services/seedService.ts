'use server';

import { createClient } from '../supabase/server';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_CLINICAL_NOTES } from './mockData';

export async function seedLiveDatabase() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error('Supabase client is not available.');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated.');
  }

  // Clean up existing data for this user
  await supabase.from('clinical_notes').delete().eq('practitioner_id', user.id);
  await supabase.from('appointments').delete().eq('practitioner_id', user.id);
  await supabase.from('patients').delete().eq('practitioner_id', user.id);

  // Insert patients
  const patientsToInsert = MOCK_PATIENTS.map(p => {
    const { id, practitioner_id, ...rest } = p;
    return { ...rest, practitioner_id: user.id };
  });

  const { data: insertedPatients, error: patientError } = await supabase
    .from('patients')
    .insert(patientsToInsert)
    .select('id, email, first_name, last_name');

  if (patientError) {
    throw new Error(`Failed to insert patients: ${patientError.message}`);
  }

  // Create mapping from mock patient id to new real UUID
  const patientIdMap = new Map<string, string>();
  if (insertedPatients) {
    MOCK_PATIENTS.forEach(mockPatient => {
      // Find the inserted patient matching the mock patient's email or name
      const realPatient = insertedPatients.find(
        (p) => p.email === mockPatient.email || (p.first_name === mockPatient.first_name && p.last_name === mockPatient.last_name)
      );
      if (realPatient) {
        patientIdMap.set(mockPatient.id, realPatient.id);
      }
    });
  }

  // Insert appointments
  const appointmentsToInsert = MOCK_APPOINTMENTS.map(a => {
    const { id, patient_id, practitioner_id, ...rest } = a;
    return {
      ...rest,
      patient_id: patientIdMap.get(patient_id) || null,
      practitioner_id: user.id
    };
  });

  if (appointmentsToInsert.length > 0) {
    const { error: aptError } = await supabase
      .from('appointments')
      .insert(appointmentsToInsert);
    if (aptError) {
      throw new Error(`Failed to insert appointments: ${aptError.message}`);
    }
  }

  // Insert clinical notes
  const notesToInsert = MOCK_CLINICAL_NOTES.map(n => {
    const { id, patient_id, practitioner_id, ...rest } = n;
    return {
      ...rest,
      patient_id: patientIdMap.get(patient_id) || null,
      practitioner_id: user.id
    };
  });

  if (notesToInsert.length > 0) {
    const { error: noteError } = await supabase
      .from('clinical_notes')
      .insert(notesToInsert);
    if (noteError) {
      throw new Error(`Failed to insert clinical notes: ${noteError.message}`);
    }
  }

  return { success: true, message: 'Database seeded successfully.' };
}
