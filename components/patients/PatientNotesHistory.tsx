"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClinicalNote } from '@/lib/types';
import { FileText, Sparkles, CheckSquare, AlertCircle, Calendar, Plus } from 'lucide-react';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';

interface PatientNotesHistoryProps {
  notes: ClinicalNote[];
  patientId: string;
}

export function PatientNotesHistory({ notes, patientId }: PatientNotesHistoryProps) {
  const router = useRouter();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [notesList, setNotesList] = useState<ClinicalNote[]>(notes);

  useEffect(() => {
    const incomingNotes = notes || [];
    setNotesList((prev) => {
      const incomingIds = new Set(incomingNotes.map((n) => n.id));
      const localOnlyNotes = prev.filter((n) => !incomingIds.has(n.id));
      return [...localOnlyNotes, ...incomingNotes];
    });
  }, [notes]);

  useEffect(() => {
    const handleNoteCreated = (event: Event) => {
      const customEvent = event as CustomEvent<ClinicalNote>;
      const newNote = customEvent.detail;
      if (newNote && newNote.patient_id === patientId) {
        setNotesList((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
        router.refresh();
      }
    };

    window.addEventListener('clinical_note_created', handleNoteCreated);
    return () => window.removeEventListener('clinical_note_created', handleNoteCreated);
  }, [patientId, router]);

  const handleNoteSuccess = (newNote?: ClinicalNote) => {
    if (newNote && newNote.patient_id === patientId) {
      setNotesList((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
      router.refresh();
    }
    setIsNoteModalOpen(false);
  };

  if (notesList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm relative">
        <button
          onClick={() => setIsNoteModalOpen(true)}
          className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
        <p className="text-slate-500 text-sm mt-4">No clinical notes recorded yet for this patient chart.</p>
        <NewClinicalNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSuccess={handleNoteSuccess}
          initialPatientId={patientId}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Clinical Progress Notes & Timeline</h2>
          <p className="text-xs text-slate-500">Discoveries, daily actions, and clinical observations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            {notesList.length} Total Notes
          </span>
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {notesList.map((note) => {
          const discoveriesList = Array.isArray(note.discoveries)
            ? note.discoveries
            : typeof note.discoveries === 'string'
            ? [note.discoveries]
            : [];

          const dailyActionsList = Array.isArray(note.daily_actions)
            ? note.daily_actions
            : typeof note.daily_actions === 'string'
            ? [note.daily_actions]
            : [];

          const ailmentsList = Array.isArray(note.ailments)
            ? note.ailments
            : typeof note.ailments === 'string'
            ? [note.ailments]
            : [];

          const dateStr = note.session_date || note.created_at;
          const formattedDate = dateStr
            ? new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            : 'Session Entry';

          return (
            <div
              key={note.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
            >
              {/* Header Date & Ailments */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Session Date: {formattedDate}</span>
                </div>
                {ailmentsList.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ailmentsList.map((ailment, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60"
                      >
                        {ailment}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Discoveries Section */}
              {discoveriesList.length > 0 && (
               <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Clinical Discoveries & Observations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {discoveriesList.map((disc, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg font-medium"
                      >
                        @{disc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Actions (Client Homework) */}
              {dailyActionsList.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                    Assigned Daily Actions (Homework)
                  </h4>
                  <ul className="space-y-1">
                    {dailyActionsList.map((action, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raw Session Notes */}
              {note.raw_notes && (
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Clinical Session Summary
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200/60 p-3 rounded-xl whitespace-pre-wrap">
                    {note.raw_notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NewClinicalNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={handleNoteSuccess}
        initialPatientId={patientId}
      />
    </div>
  );
}
