import React from 'react';
import { getAllNotes } from '@/lib/services/noteService';
import { getPatients } from '@/lib/services/patientService';
import { getAppointments } from '@/lib/services/appointmentService';
import { NotesHubClient } from '@/components/notes/NotesHubClient';

export const metadata = {
  title: 'Clinical Notes | Lumina Health',
  description: 'Review and manage your clinical sessions and discoveries',
};

export default async function NotesPage() {
  const [notesRes, patientsRes, appointmentsRes] = await Promise.all([
    getAllNotes(),
    getPatients(),
    getAppointments()
  ]);

  const notes = notesRes.data || [];
  const patients = patientsRes.data || [];
  const appointments = appointmentsRes.data || [];

  return (
    <div className="h-full">
      <NotesHubClient 
        notes={notes} 
        patients={patients} 
        appointments={appointments} 
      />
    </div>
  );
}
