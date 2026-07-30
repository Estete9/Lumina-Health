import React, { useState } from 'react';
import { ClinicalNote, Patient } from '@/lib/types';
import { EditClinicalNoteModal } from './EditClinicalNoteModal';
import { Calendar, Tag, CheckCircle2, User, FileText, Edit } from 'lucide-react';

interface ClinicalNoteCardProps {
  note: ClinicalNote;
  patient: Patient;
}

export function ClinicalNoteCard({ note, patient }: ClinicalNoteCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<ClinicalNote>(note);

  const handleUpdate = (updatedNote?: ClinicalNote) => {
    if (updatedNote) {
      setCurrentNote(updatedNote);
    }
  };

  const discoveriesList = Array.isArray(currentNote.discoveries)
    ? currentNote.discoveries
    : typeof currentNote.discoveries === 'string'
    ? [currentNote.discoveries]
    : [];

  const actionsList = Array.isArray(currentNote.daily_actions)
    ? currentNote.daily_actions
    : typeof currentNote.daily_actions === 'string'
    ? [currentNote.daily_actions]
    : [];

  const sessionDate = currentNote.session_date 
    ? new Date(currentNote.session_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown Date';

  return (
    <>
      <div 
        onClick={() => setIsEditModalOpen(true)}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {patient.first_name} {patient.last_name}
              </h3>
              <div className="flex items-center text-xs text-slate-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {sessionDate}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Edit Note"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {discoveriesList.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center mb-2">
              <Tag className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Discoveries
            </h4>
            <div className="flex flex-wrap gap-2">
              {discoveriesList.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50"
                >
                  @{tag.replace(/^@/, '')}
                </span>
              ))}
            </div>
          </div>
        )}

        {actionsList.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Daily Actions
            </h4>
            <ul className="space-y-1.5">
              {actionsList.map((action, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 mr-2 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentNote.raw_notes && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center mb-2">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              Notes Summary
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap p-3 bg-slate-50 rounded-xl border border-slate-100">
              {currentNote.raw_notes}
            </p>
          </div>
        )}
      </div>

      <EditClinicalNoteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={currentNote}
        onSuccess={handleUpdate}
      />
    </>
  );
}
