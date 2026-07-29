import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      {/* Back Button */}
      <div className="flex items-center">
        <Link 
          href="/patients" 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors bg-white hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roster
        </Link>
      </div>

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
