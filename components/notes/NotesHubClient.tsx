'use client';

import React, { useState, useMemo } from 'react';
import { ClinicalNote, Patient, Appointment } from '@/lib/types';
import { NotesSidebar } from './NotesSidebar';
import { PatientClinicalTimeline } from './PatientClinicalTimeline';
import { BookOpen } from 'lucide-react';

interface NotesHubClientProps {
  notes: ClinicalNote[];
  patients: Patient[];
  appointments: Appointment[];
}

export function NotesHubClient({ notes, patients, appointments }: NotesHubClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Derive selected patient
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  // Derive notes for selected patient
  const selectedPatientNotes = useMemo(() => {
    if (!selectedPatientId) return [];
    return notes.filter(n => n.patient_id === selectedPatientId);
  }, [selectedPatientId, notes]);

  // Derive appointments for selected patient
  const selectedPatientAppointments = useMemo(() => {
    if (!selectedPatientId) return [];
    return appointments.filter(a => a.patient_id === selectedPatientId);
  }, [selectedPatientId, appointments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 h-[calc(100vh-8rem)] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Left Sidebar */}
      <NotesSidebar
        patients={patients}
        appointments={appointments}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPatientId={selectedPatientId}
        onSelectPatient={setSelectedPatientId}
      />

      {/* Main Stage */}
      <div className="md:col-span-4 flex flex-col h-full overflow-hidden bg-slate-50">
        {selectedPatient ? (
          <PatientClinicalTimeline
            patient={selectedPatient}
            notes={selectedPatientNotes}
            appointments={selectedPatientAppointments}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Clinical Notes Hub</h3>
            <p className="text-slate-500 max-w-md">
              Select a patient from the sidebar to view their clinical timeline, review past notes, and create new session records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
