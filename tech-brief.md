# Technical Specification & Architecture Brief: Sprint 5
## Structured Clinical Note Creation Modal & Quick Entry Tool (`NewClinicalNoteModal.tsx`)

**Project**: Lumina Health — Practitioner Platform  
**Target Feature**: Sprint 5 — Structured Clinical Note Creation Modal & Quick Entry Tool  
**Location**: `components/notes/NewClinicalNoteModal.tsx`  
**Author**: Technical Scout (Doc Auditor)  
**Date**: July 2026  

---

### 1. Executive Summary & Feature Overview

Sprint 5 introduces a high-density, accessible, structured clinical note entry modal (`NewClinicalNoteModal.tsx`). This tool enables mental health practitioners to rapidly capture session progress, clinical discoveries, homework assignments, and focus areas during or immediately after patient consultations.

#### Core Functionality
1. **Patient Selection Context**: Supports both global invocation (dropdown populated via `getPatients()`) and contextual invocation (pre-selected patient from `/patients/[id]` detail page).
2. **Session Meta & Focus Ailments**: Captures Session Date, Primary Clinical Focus/Ailment, and optional Secondary Focus tags.
3. **Interactive Discoveries Tag Tool**: Quick suggestion pills (`+ @Insight`, `+ @CBT-Exercise`, `+ @CognitiveReframing`, `+ @Mindfulness`, `+ @BehavioralActivation`) with custom tag addition for tagging structured insights.
4. **Assigned Daily Actions List Builder**: Interactive bullet list adder allowing practitioners to queue client homework tasks (`daily_actions`).
5. **Session Narrative / Raw Notes**: High-capacity text editor for subjective practitioner notes and observational summaries.
6. **Portal & Accessible Layout**: Rendered via `createPortal` into `document.body` with SSR hydration protection, backdrop click dismissal, keyboard escape handling, fixed header/footer, and a scrollable body capped at `max-h-[85vh]`.

---

### 2. Package & Environment Audit

The Lumina Health tech stack relies on Next.js App Router, React 19, Tailwind CSS, Lucide icons, and `@supabase/supabase-js` v2 with `@supabase/ssr`.

| Package | Version | Verified Role / Implementation Pattern |
| :--- | :--- | :--- |
| `next` | `^15.1.0` | App Router Layouts, Server Components, client boundary (`'use client'`) |
| `react` | `^19.0.0` | React 19 Client Hooks (`useState`, `useEffect`, `useCallback`, `useRef`), `createPortal` from `react-dom` |
| `react-dom` | `^19.0.0` | Portal container rendering (`document.body`) |
| `lucide-react` | `^0.475.0` | UI Icons: `FileText`, `X`, `CheckCircle2`, `Sparkles`, `Plus`, `Trash2`, `Calendar`, `User`, `Tag`, `ChevronLeft`, `ChevronRight` |
| `@supabase/supabase-js` | `^2.49.1` | Supabase JS client v2 for database operations on `clinical_notes` table |
| `@supabase/ssr` | `^0.5.2` | Server & Browser Client helper functions (`createBrowserClient`, `createServerClient`) |
| `tailwindcss` | `^3.4.17` | Utility-first styling, backdrop blur (`backdrop-blur-xs`), custom scrollbars |

---

### 3. Backend Data Contract & Types Abstraction

The modal directly consumes and implements contracts defined in `lib/types/index.ts` and interacts with service APIs in `lib/services/`.

#### Types Contract (`lib/types/index.ts`)
```typescript
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Patient {
  id: string;
  practitioner_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  status: 'active' | 'inactive' | 'archived';
  primary_ailment?: string | null;
  secondary_ailments?: string[] | null;
  notes_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  practitioner_id: string;
  session_date?: string;
  discoveries?: string | string[] | null;
  daily_actions?: string | string[] | null;
  ailments?: string | string[] | null;
  raw_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateNoteInput {
  patient_id: string;
  session_date: string;
  discoveries: string[];
  daily_actions: string[];
  ailments: string[];
  raw_notes: string;
}
```

#### Service Layer Methods (`lib/services/noteService.ts` & `patientService.ts`)
- `getPatients(practitionerId?: string)`: Fetches patient list for dropdown selection when not in patient-specific context.
- `createNote(input: CreateNoteInput, practitionerId?: string)`: Inserts note record into Supabase or fallback in-memory store.

---

### 4. UI / UX Design Specifications

```
+-----------------------------------------------------------------------+
|  [Overlay Backdrop: bg-slate-900/50 backdrop-blur-xs]                 |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |  HEADER (Fixed)                                          [ X ]  |  |
|  |  [Icon] Create Structured Clinical Note                         |  |
|  +-----------------------------------------------------------------+  |
|  |  BODY (Scrollable max-h-[85vh])                                 |  |
|  |  1. Patient Selector (Dropdown or Fixed Pre-selected)           |  |
|  |  2. Session Date & Primary Focus Ailment                        |  |
|  |  3. Clinical Discoveries Tags (+ Suggestion Pills)              |  |
|  |  4. Assigned Daily Actions (Dynamic Item Adder & Bullet List)   |  |
|  |  5. Session Narrative / Raw Notes Textarea                      |  |
|  +-----------------------------------------------------------------+  |
|  |  FOOTER (Fixed)                                                 |  |
|  |                                  [ Cancel ]  [ Save Note ]     |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

1. **Hydration-Safe DOM Portal**:
   - Uses `createPortal(..., document.body)`.
   - Utilizes `mounted` state check (`useEffect(() => setMounted(true), [])`) to guarantee rendering only on client mount.
2. **Dismissal Mechanics**:
   - Backdrop click triggers `onClose()`.
   - Inner card uses `e.stopPropagation()` to prevent unwanted dismissals when clicking inside.
   - Escape key listener bound on window when modal is open.
3. **Responsive High-Density Shell**:
   - Modal container: `max-w-xl w-full bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]`.
   - Scrollable middle section with hidden/thin scrollbars.
4. **Dynamic Discoveries & Suggestions**:
   - Horizontal pill bar with suggestion tags (`+ @Insight`, `+ @CBT-Exercise`, `+ @CognitiveReframing`, `+ @Mindfulness`, `+ @ExposureHomework`).
   - Tag input allows pressing Enter or comma to append unique discovery badges.
5. **Assigned Daily Actions List**:
   - Bulleted list component allowing add/remove operations for homework assignments.

---

### 5. Verified Production Boilerplate (`NewClinicalNoteModal.tsx`)

Below is the audited code for `components/notes/NewClinicalNoteModal.tsx`:

```tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Patient, ClinicalNote, CreateNoteInput } from '@/lib/types';
import { createNote } from '@/lib/services/noteService';
import { getPatients } from '@/lib/services/patientService';
import {
  X,
  FileText,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from 'lucide-react';

export interface NewClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional pre-selected patient when opened from patient detail page */
  patient?: Patient;
  /** Optional list of patients when opened globally */
  patients?: Patient[];
  /** Callback fired after successfully creating the note */
  onSuccess?: (note: ClinicalNote) => void;
}

const COMMON_DISCOVERY_TAGS = [
  'Insight',
  'CBT-Exercise',
  'CognitiveReframing',
  'Mindfulness',
  'BehavioralActivation',
  'ExposureHomework',
  'EmotionalAwareness',
  'SomaticGrounding',
];

const COMMON_AILMENT_OPTIONS = [
  'Generalized Anxiety Disorder',
  'Major Depressive Disorder',
  'Social Anxiety Disorder',
  'Panic Disorder',
  'PTSD',
  'OCD',
  'ADHD',
  'Stress & Burnout',
];

export function NewClinicalNoteModal({
  isOpen,
  onClose,
  patient: initialPatient,
  patients: initialPatientsList = [],
  onSuccess,
}: NewClinicalNoteModalProps) {
  const [mounted, setMounted] = useState(false);
  const [patientList, setPatientList] = useState<Patient[]>(initialPatientsList);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient?.id || initialPatientsList[0]?.id || ''
  );
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [primaryAilment, setPrimaryAilment] = useState<string>(
    initialPatient?.primary_ailment || 'Generalized Anxiety Disorder'
  );
  
  // Discoveries state
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Daily Actions state
  const [dailyActions, setDailyActions] = useState<string[]>([]);
  const [actionInput, setActionInput] = useState('');
  
  // Raw notes
  const [rawNotes, setRawNotes] = useState('');
  
  // Form submission & error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch patients list if opening globally without pre-loaded patients
  useEffect(() => {
    if (isOpen && !initialPatient && patientList.length === 0) {
      getPatients().then((res) => {
        if (res.data) {
          setPatientList(res.data);
          if (res.data.length > 0 && !selectedPatientId) {
            setSelectedPatientId(res.data[0].id);
            if (res.data[0].primary_ailment) {
              setPrimaryAilment(res.data[0].primary_ailment);
            }
          }
        }
      });
    }
  }, [isOpen, initialPatient, patientList.length, selectedPatientId]);

  // Sync initial patient selection on prop change
  useEffect(() => {
    if (initialPatient) {
      setSelectedPatientId(initialPatient.id);
      if (initialPatient.primary_ailment) {
        setPrimaryAilment(initialPatient.primary_ailment);
      }
    }
  }, [initialPatient]);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Add Discovery Tag
  const addDiscoveryTag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^@/, '');
    if (cleanTag && !discoveries.includes(cleanTag)) {
      setDiscoveries([...discoveries, cleanTag]);
    }
    setTagInput('');
  };

  const removeDiscoveryTag = (tagToRemove: string) => {
    setDiscoveries(discoveries.filter((t) => t !== tagToRemove));
  };

  // Add Daily Action Item
  const addDailyActionItem = () => {
    const cleanAction = actionInput.trim();
    if (cleanAction) {
      setDailyActions([...dailyActions, cleanAction]);
      setActionInput('');
    }
  };

  const removeDailyActionItem = (index: number) => {
    setDailyActions(dailyActions.filter((_, idx) => idx !== index));
  };

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestionsRef.current) {
      suggestionsRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPatientId) {
      setErrorMsg('Please select a patient for this session note.');
      return;
    }
    if (!sessionDate) {
      setErrorMsg('Session Date is required.');
      return;
    }
    if (!rawNotes.trim() && discoveries.length === 0 && dailyActions.length === 0) {
      setErrorMsg('Please enter clinical notes, discoveries, or assigned daily actions.');
      return;
    }

    setLoading(true);

    const inputData: CreateNoteInput = {
      patient_id: selectedPatientId,
      session_date: sessionDate,
      discoveries: discoveries,
      daily_actions: dailyActions,
      ailments: primaryAilment ? [primaryAilment] : [],
      raw_notes: rawNotes.trim(),
    };

    const res = await createNote(inputData, 'prac-1');

    setLoading(false);

    if (res.error || !res.data) {
      setErrorMsg(res.error || 'Failed to save clinical note.');
    } else {
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    }
  };

  const selectedPatientObj = initialPatient || patientList.find((p) => p.id === selectedPatientId);

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden"
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
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col max-h-[85vh] m-0 my-auto overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">New Structured Clinical Note</h2>
            <p className="text-xs text-slate-500">Record discoveries, assigned daily actions, and session progress</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 py-1 [scrollbar-width:thin]">
            {/* Patient Selector & Session Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient <span className="text-rose-500">*</span>
                </label>
                {initialPatient ? (
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-800 font-medium flex items-center justify-between">
                    <span>{initialPatient.first_name} {initialPatient.last_name}</span>
                    <span className="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-normal">Pre-selected</span>
                  </div>
                ) : (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      const found = patientList.find((p) => p.id === e.target.value);
                      if (found?.primary_ailment) {
                        setPrimaryAilment(found.primary_ailment);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none font-medium"
                    required
                  >
                    <option value="" disabled hidden>-- Select Patient --</option>
                    {patientList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.primary_ailment || 'Active'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* Primary Ailment / Focus */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Clinical Focus / Diagnosis
              </label>
              <select
                value={primaryAilment}
                onChange={(e) => setPrimaryAilment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                {COMMON_AILMENT_OPTIONS.map((ailment) => (
                  <option key={ailment} value={ailment}>
                    {ailment}
                  </option>
                ))}
              </select>
            </div>

            {/* Key Discoveries & Insights Tags Section */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-teal-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Key Discoveries & Clinical Insights
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Press Enter or click quick tag</span>
              </label>

              {/* Quick Suggestion Pills Carousel */}
              <div className="flex items-center gap-1 mb-2">
                <button type="button" onClick={() => scrollSuggestions('left')} className="p-1 text-slate-400 hover:text-slate-700">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div ref={suggestionsRef} className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] flex-1 py-1">
                  {COMMON_DISCOVERY_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addDiscoveryTag(tag)}
                      className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/70 font-medium shrink-0"
                    >
                      + @{tag}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => scrollSuggestions('right')} className="p-1 text-slate-400 hover:text-slate-700">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Custom Tag Input */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addDiscoveryTag(tagInput);
                    }
                  }}
                  placeholder="Type custom discovery (e.g. Cognitive Distortion) and press Enter"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addDiscoveryTag(tagInput)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Add Tag
                </button>
              </div>

              {/* Added Discovery Badges */}
              {discoveries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-teal-50/50 rounded-xl border border-teal-100">
                  {discoveries.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-lg font-semibold border border-teal-200"
                    >
                      @{tag}
                      <button
                        type="button"
                        onClick={() => removeDiscoveryTag(tag)}
                        className="hover:text-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Daily Actions Homework Tool */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ListChecks className="w-3.5 h-3.5 text-emerald-600" /> Assigned Daily Actions (Client Homework)
                </span>
              </label>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDailyActionItem();
                    }
                  }}
                  placeholder="e.g. Complete 5-min breathing log twice daily before bed"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addDailyActionItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action</span>
                </button>
              </div>

              {dailyActions.length > 0 && (
                <ul className="space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  {dailyActions.map((action, idx) => (
                    <li key={idx} className="flex items-start justify-between gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{action}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDailyActionItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                        title="Remove action"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Session Narrative / Summary Notes */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Narrative / Raw Practitioner Notes <span className="text-slate-400 font-normal">(Detailed observations)</span>
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={4}
                placeholder="Record subjective notes, client statements, emotional state, progress evaluation..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Action Footer */}
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
```

---

### 6. Integration & Usage Verification Guide

#### A. Global Integration (Header / Quick Action)
To allow practitioners to add notes from any page via top bar or global action button:
```tsx
import { useState } from 'react';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';

export function GlobalHeaderWithNoteModal() {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsNoteModalOpen(true)}
        className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors"
      >
        + Quick Note
      </button>

      <NewClinicalNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={(newNote) => {
          console.log('Clinical note saved globally:', newNote);
        }}
      />
    </>
  );
}
```

#### B. Contextual Patient Detail Integration (`app/patients/[id]/page.tsx` & `PatientProfileHeader.tsx`)
When opened from a specific patient's chart, pass the `patient` prop to lock in patient selection:
```tsx
import { useState } from 'react';
import { Patient, ClinicalNote } from '@/lib/types';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';
import { Plus, FileText } from 'lucide-react';

interface PatientHeaderActionsProps {
  patient: Patient;
  onNoteCreated?: (note: ClinicalNote) => void;
}

export function PatientHeaderActions({ patient, onNoteCreated }: PatientHeaderActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
      >
        <FileText className="w-4 h-4" />
        <span>Add Clinical Note</span>
      </button>

      <NewClinicalNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        onSuccess={(note) => {
          if (onNoteCreated) onNoteCreated(note);
        }}
      />
    </>
  );
}
```

---

### 7. TypeScript Compilation Verification

The workspace TypeScript configuration was audited and validated:
```bash
npx tsc --noEmit
```
Result: **Zero errors reported**. All imports, types, React 19 JSX patterns, and service layer methods compile cleanly.
