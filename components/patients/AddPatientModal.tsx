'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createPatient } from '@/lib/services/patientService';
import { Patient, PatientStatus } from '@/lib/types';
import { X, UserPlus, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient?: Patient) => void;
}

const COMMON_MENTAL_AILMENTS = [
  'Generalized Anxiety Disorder',
  'Major Depressive Disorder (Mild)',
  'Major Depressive Disorder (Moderate/Severe)',
  'Social Anxiety Disorder',
  'Panic Disorder',
  'Post-Traumatic Stress Disorder (PTSD)',
  'Obsessive-Compulsive Disorder (OCD)',
  'Bipolar I / II Disorder',
  'Adjustment Disorder',
  'Attention-Deficit/Hyperactivity Disorder (ADHD)',
  'Borderline Personality Disorder',
  'Persistent Depressive Disorder (Dysthymia)',
  'Specific Phobia',
  'Insomnia & Sleep-Wake Disorder',
  'Other / Unspecified Focus',
];

const SECONDARY_AILMENT_SUGGESTIONS = [
  'Insomnia',
  'PanicAttacks',
  'SocialIsolation',
  'Burnout',
  'SomaticTension',
  'Agoraphobia',
  'EmotionalDysregulation',
  'LowSelfEsteem',
];

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [status, setStatus] = useState<PatientStatus>('active');
  const [primaryAilment, setPrimaryAilment] = useState('');
  
  const [notesSummary, setNotesSummary] = useState('');
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestionsRef.current) {
      suggestionsRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth',
      });
    }
  };

  const handleSuggestionClick = (tag: string) => {
    const cleanTag = tag.replace(/[^a-zA-Z0-9-]/g, '');
    const tagFormat = `@${cleanTag} `;
    if (!notesSummary.includes(tagFormat)) {
      setNotesSummary((prev) => (prev ? `${prev.trim()} ${tagFormat}` : tagFormat));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim()) { setErrorMsg('First Name is required.'); return; }
    if (!lastName.trim()) { setErrorMsg('Last Name is required.'); return; }
    if (!primaryAilment.trim()) { setErrorMsg('Please select a Primary Clinical Ailment.'); return; }
    if (!phone.trim()) { setErrorMsg('Phone Number is required.'); return; }
    if (!dob.trim()) { setErrorMsg('Date of Birth is required.'); return; }
    if (!gender) { setErrorMsg('Gender is required.'); return; }
    if (!status) { setErrorMsg('Status is required.'); return; }
    if (!primaryAilment.trim()) { setErrorMsg('Please select a Primary Clinical Ailment.'); return; }

    setLoading(true);

    const extractedTags = (notesSummary.match(/@[\w-]+/g) || []).map((t) => t.slice(1));

    const res = await createPatient({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date_of_birth: dob,
      gender: gender,
      status: status,
      primary_ailment: primaryAilment,
      secondary_ailments: extractedTags,
      notes_summary: notesSummary.trim() || undefined,
    });

    setLoading(false);

    if (res.error || !res.data) {
      setErrorMsg(res.error || 'Failed to register patient');
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
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white text-slate-500 hover:text-slate-900 shadow-md border border-slate-200 transition-all z-50 hover:scale-105"
        title="Close modal"
      >
        <X className="w-5 h-5" />
      </button>

      <div 
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col max-h-[85vh] m-0 my-auto overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add New Patient Intake</h2>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 py-1 [scrollbar-width:thin]">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Conner"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.conner@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Date of Birth, Gender, Status */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PatientStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed Therapy</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Primary Ailment Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Ailment / Clinical Focus <span className="text-rose-500">*</span>
              </label>
              <select
                value={primaryAilment}
                onChange={(e) => setPrimaryAilment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none font-medium"
                required
              >
                <option value="" disabled hidden>-- Select Primary Clinical Ailment / Focus --</option>
                {COMMON_MENTAL_AILMENTS.map((ailment) => (
                  <option key={ailment} value={ailment}>
                    {ailment}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Initial Clinical Summary with Quick Suggestions */}
            <div className="pt-1 border-t border-slate-100 mt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 mt-1">
                Initial Clinical Summary / Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              
              <div className="flex items-center gap-1 mb-1.5">
                <button type="button" onClick={() => scrollSuggestions('left')} className="p-1 text-slate-400 hover:text-slate-700 font-bold text-xs"><ChevronLeft className="w-4 h-4" /></button>
                <div ref={suggestionsRef} className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 py-1">
                  {SECONDARY_AILMENT_SUGGESTIONS.map((sug) => {
                    const tagValue = sug.replace(/[^a-zA-Z0-9-]/g, '');
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors border border-slate-200/60 shrink-0"
                      >
                        + @{tagValue}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => scrollSuggestions('right')} className="p-1 text-slate-400 hover:text-slate-700 font-bold text-xs"><ChevronRight className="w-4 h-4" /></button>
              </div>

              <textarea
                ref={notesRef}
                value={notesSummary}
                onChange={(e) => setNotesSummary(e.target.value)}
                rows={4}
                placeholder="e.g. Patient presents with severe anxiety. Use @ to add secondary ailments (e.g. @Insomnia @PanicAttacks). Observed initial insight during intake..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons Footer - Fixed Outside Scroll Container */}
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
              <span>{loading ? 'Registering...' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
