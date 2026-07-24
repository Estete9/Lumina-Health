import { getPatients } from '@/lib/services/patientService';
import { PatientRosterView } from '@/components/patients/PatientRosterView';

export default async function PatientsPage() {
  const { data: patients, error } = await getPatients();

  if (error || !patients) {
    return <div className="p-4 text-rose-500">Failed to load patients list.</div>;
  }

  return <PatientRosterView initialPatients={patients} />;
}
