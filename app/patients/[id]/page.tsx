import { notFound } from 'next/navigation';
import { getPatientById } from '@/lib/services/patientService';
import { getAppointmentsByPatientId } from '@/lib/services/appointmentService';
import { getNotesByPatientId } from '@/lib/services/noteService';
import { PatientProfileHeader } from '@/components/patients/PatientProfileHeader';
import { PatientDetailTabs } from '@/components/patients/PatientDetailTabs';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = await params;

  const [patientRes, appointmentsRes, notesRes] = await Promise.all([
    getPatientById(id),
    getAppointmentsByPatientId(id),
    getNotesByPatientId(id),
  ]);

  if (patientRes.error || !patientRes.data) {
    notFound();
  }

  const patient = patientRes.data;
  const appointments = appointmentsRes.data || [];
  const notes = notesRes.data || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Patient Header Section */}
      <PatientProfileHeader patient={patient} />

      {/* Patient Detail Tabs & Section Container */}
      <PatientDetailTabs 
        patient={patient} 
        appointments={appointments} 
        notes={notes} 
      />
    </div>
  );
}
