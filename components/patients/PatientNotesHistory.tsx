"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClinicalNote } from '@/lib/types';
import { FileText, Sparkles, CheckSquare, Calendar, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';
import { EditClinicalNoteModal } from '@/components/notes/EditClinicalNoteModal';
import { deleteNote } from '@/lib/services/noteService';

interface PatientNotesHistoryProps {
  notes?: ClinicalNote[];
  initialNotes?: ClinicalNote[];
  patientId: string;
}

export function PatientNotesHistory({
  notes,
  initialNotes: initialNotesProp,
  patientId,
}: PatientNotesHistoryProps) {
  const router = useRouter();
  const initialNotes = initialNotesProp || notes || [];
  const [notesList, setNotesList] = useState<ClinicalNote[]>(initialNotes);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const rawIncoming = initialNotesProp || notes || [];
    const incomingNotes = rawIncoming.filter((n) => !deletedIds.has(n.id));
    setNotesList((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      const merged = incomingNotes.map((inc) => {
        const existing = prevMap.get(inc.id);
        if (existing && new Date(existing.updated_at).getTime() >= new Date(inc.updated_at).getTime()) {
          return existing;
        }
        return inc;
      });
      const incomingIds = new Set(incomingNotes.map((n) => n.id));
      const localOnly = prev.filter((n) => !incomingIds.has(n.id) && !deletedIds.has(n.id));
      return [...localOnly, ...merged];
    });
  }, [notes, initialNotesProp, deletedIds]);

  useEffect(() => {
    const handleNoteCreated = (event: Event) => {
      const customEvent = event as CustomEvent<ClinicalNote>;
      const newNote = customEvent.detail;
      if (newNote && newNote.patient_id === patientId && !deletedIds.has(newNote.id)) {
        setNotesList((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
        router.refresh();
      }
    };

    const handleNoteUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<ClinicalNote>;
      const updatedNote = customEvent.detail;
      if (updatedNote && updatedNote.patient_id === patientId && !deletedIds.has(updatedNote.id)) {
        setNotesList((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
        router.refresh();
      }
    };

    const handleNoteDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const deletedId = customEvent.detail;
      if (deletedId) {
        setDeletedIds((prev) => new Set([...Array.from(prev), deletedId]));
        setNotesList((prev) => prev.filter((n) => n.id !== deletedId));
        router.refresh();
      }
    };

    window.addEventListener('clinical_note_created', handleNoteCreated);
    window.addEventListener('clinical_note_updated', handleNoteUpdated);
    window.addEventListener('clinical_note_deleted', handleNoteDeleted);

    return () => {
      window.removeEventListener('clinical_note_created', handleNoteCreated);
      window.removeEventListener('clinical_note_updated', handleNoteUpdated);
      window.removeEventListener('clinical_note_deleted', handleNoteDeleted);
    };
  }, [patientId, router, deletedIds]);

  const handleNoteSuccess = (newNote?: ClinicalNote) => {
    if (newNote && newNote.patient_id === patientId) {
      setNotesList((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
      router.refresh();
    }
    setIsNoteModalOpen(false);
  };

  const handleEditSuccess = (updatedNote?: ClinicalNote) => {
    if (updatedNote && updatedNote.patient_id === patientId) {
      setNotesList((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
      router.refresh();
    }
    setEditingNote(null);
  };

  const confirmDeleteNote = async () => {
    if (!deletingNoteId) return;
    setIsDeleting(true);
    const targetId = deletingNoteId;
    const res = await deleteNote(targetId);
    setIsDeleting(false);

    if (!res.error) {
      setDeletedIds((prev) => new Set([...Array.from(prev), targetId]));
      setNotesList((prev) => prev.filter((n) => n.id !== targetId));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinical_note_deleted', { detail: targetId }));
      }
      router.refresh();
    }
    setDeletingNoteId(null);
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
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4 relative group"
            >
              {/* Header Date & Action Controls */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Session Date: {formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  {ailmentsList.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mr-2">
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

                  <button
                    type="button"
                    onClick={() => setEditingNote(note)}
                    className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all"
                    title="Edit Clinical Note"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingNoteId(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete Clinical Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

      {/* New Note Modal */}
      <NewClinicalNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={handleNoteSuccess}
        initialPatientId={patientId}
      />

      {/* Edit Note Modal */}
      <EditClinicalNoteModal
        isOpen={Boolean(editingNote)}
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deletingNoteId && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Clinical Note?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this clinical session note? This action will permanently remove the observations and homework items from this patient chart.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingNoteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteNote}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
