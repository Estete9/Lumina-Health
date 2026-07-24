'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateNote } from '@/lib/services/noteService';
import { ClinicalNote } from '@/lib/types';
import { X, FileText, CheckCircle2, Plus, Trash2, Tag, Calendar } from 'lucide-react';

interface EditClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedNote?: ClinicalNote) => void;
  note: ClinicalNote | null;
}

const DISCOVERY_SUGGESTIONS = [
  'CBT-Insight',
  'AnxietyTrigger',
  'EmotionalRegulation',
  'Copingskill',
  'BehavioralActivation',
  'MindfulnessPractice',
  'CognitiveReframing',
  'ProgressMade',
];

const formatForDateInput = (dateStr?: string | null) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function EditClinicalNoteModal({
  isOpen,
  onClose,
  onSuccess,
  note,
}: EditClinicalNoteModalProps) {
  const [mounted, setMounted] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [dailyActions, setDailyActions] = useState<string[]>([]);
  const [actionInput, setActionInput] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (note && isOpen) {
      setSessionDate(formatForDateInput(note.session_date || note.created_at));
      
      const discList = Array.isArray(note.discoveries)
        ? note.discoveries
        : typeof note.discoveries === 'string'
        ? [note.discoveries]
        : [];
      setDiscoveries(discList);

      const actionList = Array.isArray(note.daily_actions)
        ? note.daily_actions
        : typeof note.daily_actions === 'string'
        ? [note.daily_actions]
        : [];
      setDailyActions(actionList);

      setRawNotes(note.raw_notes || '');
      setErrorMsg('');
    }
  }, [note, isOpen]);

  if (!isOpen || !mounted || !note) return null;

  const handleAddDiscovery = (tagToAdd?: string) => {
    const val = (tagToAdd || discoveryInput).trim().replace(/^@/, '');
    if (val && !discoveries.includes(val)) {
      setDiscoveries((prev) => [...prev, val]);
      setDiscoveryInput('');
    }
  };

  const handleRemoveDiscovery = (idx: number) => {
    setDiscoveries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddAction = () => {
    if (actionInput.trim() && !dailyActions.includes(actionInput.trim())) {
      setDailyActions((prev) => [...prev, actionInput.trim()]);
      setActionInput('');
    }
  };

  const handleRemoveAction = (idx: number) => {
    setDailyActions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sessionDate) {
      setErrorMsg('Session Date is required.');
      return;
    }

    setLoading(true);

    const res = await updateNote(note.id, {
      session_date: sessionDate,
      discoveries: discoveries,
      daily_actions: dailyActions,
      raw_notes: rawNotes.trim(),
    });

    setLoading(false);

    if (res.error || !res.data) {
      setErrorMsg(res.error || 'Failed to update clinical note');
    } else {
      if (typeof window !== 'undefined' && res.data) {
        window.dispatchEvent(new CustomEvent('clinical_note_updated', { detail: res.data }));
      }
      onSuccess(res.data);
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 !m-0 !top-0 overflow-hidden"
      onClick={onClose}
      style={{ top: 0, marginTop: 0 }}
    >
      <button 
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white text-slate-600 hover:text-slate-900 shadow-md border border-slate-200 transition-all z-50 hover:scale-105"
        title="Close modal"
      >
        <X className="w-5 h-5" />
      </button>

      <div 
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col max-h-[85vh] m-0 my-auto overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Clinical Progress Note</h2>
            <p className="text-xs text-slate-500">Update session observations, client homework, and clinical findings</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 py-1 [scrollbar-width:thin]">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Session Date</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Clinical Discoveries & Observations</span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {DISCOVERY_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddDiscovery(sug)}
                    className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors border border-slate-200/60 font-medium"
                  >
                    + @{sug}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-teal-500 focus-within:bg-white">
                {discoveries.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-lg font-medium">
                    <span>@{tag}</span>
                    <button type="button" onClick={() => handleRemoveDiscovery(idx)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input
                  type="text"
                  value={discoveryInput}
                  onChange={(e) => setDiscoveryInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDiscovery(); } }}
                  placeholder={discoveries.length === 0 ? "Type tag & press Enter..." : "Add discovery tag..."}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Assigned Daily Actions (Client Homework)</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAction(); } }}
                  placeholder="e.g. Practice 10-minute diaphragmatic breathing before sleep"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action</span>
                </button>
              </div>

              {dailyActions.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {dailyActions.map((action, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                        <span>{action}</span>
                      </span>
                      <button type="button" onClick={() => handleRemoveAction(idx)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Session Notes & Progress Summary
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Patient demonstrated cognitive reframing techniques during consultation..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 mt-auto border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
