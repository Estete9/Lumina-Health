import React, { useState } from 'react';
import { Patient, ClinicalNote, Appointment } from '@/lib/types';
import { ClinicalNoteTimelineCard } from './ClinicalNoteTimelineCard';
import { NewClinicalNoteModal } from './NewClinicalNoteModal';
import { PlusCircle, Activity, Calendar } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';

interface PatientClinicalTimelineProps {
  patient: Patient;
  notes: ClinicalNote[];
  appointments: Appointment[];
}

export function PatientClinicalTimeline({ patient, notes, appointments }: PatientClinicalTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort notes in reverse chronological order
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = a.session_date ? parseISO(a.session_date).getTime() : parseISO(a.created_at).getTime();
    const dateB = b.session_date ? parseISO(b.session_date).getTime() : parseISO(b.created_at).getTime();
    return dateB - dateA;
  });

  const hasAppointmentToday = appointments.some(app => {
    if (!app.scheduled_at) return false;
    return isToday(parseISO(app.scheduled_at));
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Vitals Banner */}
      <div className="bg-white p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold border border-teal-100">
                <Activity size={16} />
                {patient.primary_ailment || 'No primary ailment'}
              </span>
              <span className="text-slate-500 text-sm">
                Total Sessions: {notes.length}
              </span>
            </div>
            
            {(patient.secondary_ailments && patient.secondary_ailments.length > 0) || (patient.tags && patient.tags.length > 0) ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {patient.secondary_ailments?.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                    {a}
                  </span>
                ))}
                {patient.tags?.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          
          {hasAppointmentToday && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex flex-col items-center justify-center shrink-0">
              <div className="text-teal-800 text-sm font-semibold flex items-center gap-2 mb-2">
                <Calendar size={16} />
                Appointment Today
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                <PlusCircle size={18} />
                Create Note for Today's Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Clinical History</h3>
        
        {sortedNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No clinical notes recorded yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-teal-600 font-medium hover:underline text-sm"
            >
              Create first note
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-slate-200">
            {sortedNotes.map(note => (
              <div key={note.id} className="relative pl-12">
                <div className="absolute left-[13px] top-4 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white shadow-sm z-10" />
                <ClinicalNoteTimelineCard note={note} />
              </div>
            ))}
          </div>
        )}
      </div>

      <NewClinicalNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        initialPatientId={patient.id}
        initialSessionDate={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
}
