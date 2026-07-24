'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPatients } from '@/lib/services/patientService';
import { createNote } from '@/lib/services/noteService';
import { Patient, ClinicalNote } from '@/lib/types';
import { X, FileText, CheckCircle2, Plus, Trash2, Tag, Calendar, User } from 'lucide-react';

interface NewClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNote?: ClinicalNote) => void;
  initialPatientId?: string;
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

export function NewClinicalNoteModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId,
}: NewClinicalNoteModalProps) {
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Discoveries Tags
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [discoveryInput, setDiscoveryInput] = useState('');
  
  // Assigned Daily Actions (Homework)
  const [dailyActions, setDailyActions] = useState<string[]>([]);
  const [actionInput, setActionInput] = useState('');

  // Raw Notes / Summary
  const [rawNotes, setRawNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    async function loadPatients() {
      const res = await getPatients();
      if (res.data) {
        setPatients(res.data);
        if (!initialPatientId && res.data.length > 0) {
          setSelectedPatientId(res.data[0].id);
        }
      }
    }
    loadPatients();
  }, [initialPatientId]);

  if (!isOpen || !mounted) return null;

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

    if (!selectedPatientId) {
      setErrorMsg('Please select a patient for this clinical note.');
      return;
    }
    if (!sessionDate) {
      setErrorMsg('Session Date is required.');
      return;
    }
    if (!rawNotes.trim() && discoveries.length === 0 && dailyActions.length === 0) {
      setErrorMsg('Please enter clinical notes summary or add discoveries/daily actions.');
      return;
    }

    setLoading(true);

    const res = await createNote({
      patient_id: selectedPatientId,
      session_date: sessionDate,
      discoveries: discoveries,
      daily_actions: dailyActions,
      ailments: [],
      raw_notes: rawNotes.trim(),
    });

    setLoading(false);

    if (res.error || !res.data) {
      setErrorMsg(res.error || 'Failed to save clinical note');
    } else {
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
            <h2 className="text-lg font-bold text-slate-900">Add Structured Clinical Note</h2>
            <p className="text-xs text-slate-500">Record session findings, client homework, and clinical observations</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 py-1 [scrollbar-width:thin]">
            {/* Patient & Session Date Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Select Patient</span> <span className="text-rose-500">*</span>
                </label>
                {initialPatientId ? (
                  <input
                    type="text"
                    disabled
                    value={patients.find((p) => p.id === initialPatientId) ? `${patients.find((p) => p.id === initialPatientId)?.first_name} ${patients.find((p) => p.id === initialPatientId)?.last_name}` : 'Selected Patient'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-700 font-semibold"
                  />
                ) : (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none font-medium"
                    required
                  >
                    <option value="" disabled>-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.primary_ailment})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Session Date</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Clinical Discoveries Tags */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Clinical Discoveries & Observations</span>
              </label>

              {/* Suggestions */}
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

              {/* Tag Input Box */}
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

            {/* Assigned Daily Actions (Client Homework) */}
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

            {/* Session Notes Summary */}
            <div className="pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Session Notes & Progress Summary
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Patient demonstrated cognitive reframing techniques during consultation. Discussed anxiety triggers and assigned daily breathing homework..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
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
              <span>{loading ? 'Saving Note...' : 'Save Clinical Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
