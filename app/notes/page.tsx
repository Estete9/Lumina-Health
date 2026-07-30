import React from 'react';
import { getAllNotes } from '@/lib/services/noteService';
import { getPatients } from '@/lib/services/patientService';
import { NotesHubClient } from '@/components/notes/NotesHubClient';
import { ClinicalNote, Patient } from '@/lib/types';

export const metadata = {
  title: 'Clinical Notes | Lumina Health',
  description: 'Review and manage your clinical sessions and discoveries',
};

export default async function NotesPage() {
  const [notesRes, patientsRes] = await Promise.all([
    getAllNotes(),
    getPatients()
  ]);

  const notes = notesRes.data || [];
  const patients = patientsRes.data || [];

  const patientMap = new Map<string, Patient>();
  patients.forEach(p => patientMap.set(p.id, p));

  const combinedData = notes.map(note => {
    // If a patient is not found, we create a fallback patient object
    const patient = patientMap.get(note.patient_id) || {
      id: note.patient_id,
      first_name: 'Unknown',
      last_name: 'Patient',
      practitioner_id: note.practitioner_id,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Patient;

    return { note, patient };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <NotesHubClient initialNotes={combinedData} />
    </main>
  );
}
