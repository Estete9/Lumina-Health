# Technical Brief: Lumina Health Sprint 4 - Add New Patient Registration & Patient Roster Management

## 1. Feature Overview & Sprint 4 Objectives

Sprint 4 delivers **Add New Patient Registration & Patient Roster Management** for Lumina Health practitioners. This feature enables healthcare providers to seamlessly onboard new patients, register complete demographic and clinical profile information via an interactive modal dialog, update existing patient details, search and filter the patient roster in real time, and persist patient records to Supabase with automated fallback to local state.

### Core Deliverables
- **Interactive Modal Architecture**: `components/patients/AddPatientModal.tsx` and `components/patients/EditPatientModal.tsx` featuring accessible backdrop overlays, dual-column responsive grid form layouts, real-time input validation, loading spinners, and clean error handling.
- **Dynamic Patient Roster Client Shell**: `components/patients/PatientRosterClient.tsx` providing real-time text search (by name/email), status filter toggles (`all`, `active`, `inactive`), modal trigger controls, and dynamic table rendering.
- **Service Layer Abstraction Extension**:
  - `lib/services/patientService.ts`: Added `createPatient(input: CreatePatientInput)` and `updatePatient(id: string, input: UpdatePatientInput)`.
  - Robust Supabase mutation queries (`insert` / `update`) with automatic fallback to mutable in-memory mock collections (`inMemoryPatients`).
- **TypeScript Domain Contracts**: Extended `lib/types/index.ts` with `CreatePatientInput` and `UpdatePatientInput` interfaces.
- **Strict UI Abstraction & Marker Rules**: Zero direct database or Supabase SDK imports in React components. All developer-written static string labels end with ` HC` for audit transparency.

---

## 2. Recommended Packages & Environment Configuration

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `^15.1.0` | React Framework (App Router, Server & Client Components) |
| `react` / `react-dom` | `^19.0.0` | UI Rendering Engine with standard state & effect hooks |
| `@supabase/supabase-js` | `^2.49.1` | Supabase Client SDK for database CRUD operations |
| `@supabase/ssr` | `^0.5.2` | SSR Helper for Server-Side Supabase Client creation |
| `lucide-react` | `^0.475.0` | Dashboard & Medical Iconography System |
| `clsx` & `tailwind-merge` | `^2.1.1` / `^3.0.1` | Dynamic Utility Class Merging (`cn` helper) |
| `tailwindcss` | `^3.4.17` | Utility-First Styling Engine |
| `typescript` | `^5.7.2` | Static Type Safety & API Domain Contracts |

---

## 3. Directory Structure & File Architecture

```
Lumina_Health/
├── app/
│   ├── calendar/
│   │   └── page.tsx                         # Calendar View (Sprint 2)
│   ├── patients/
│   │   ├── [id]/
│   │   │   └── page.tsx                     # Dynamic Patient Detail Route (Sprint 3)
│   │   └── page.tsx                         # Server Roster Page Entrypoint
│   ├── globals.css                          # Global Tailwind CSS Styles
│   └── layout.tsx                           # Main Practitioner Navigation Shell
├── components/
│   ├── layout/
│   │   ├── Header.tsx                       # Practitioner Top Header Bar
│   │   └── Sidebar.tsx                      # Primary Navigation Drawer
│   └── patients/
│       ├── AddPatientModal.tsx              # Interactive New Patient Registration Modal (Sprint 4)
│       ├── EditPatientModal.tsx             # Interactive Patient Profile Update Modal (Sprint 4)
│       ├── PatientRosterClient.tsx          # Client Roster Shell (Search, Filter, Modal Triggers) (Sprint 4)
│       ├── PatientTable.tsx                 # Roster Data Table Component
│       ├── PatientProfileHeader.tsx         # Patient summary header (Sprint 3)
│       ├── PatientDetailTabs.tsx            # Tabbed sections container (Sprint 3)
│       ├── PatientOverviewSection.tsx       # Demographics & clinical overview (Sprint 3)
│       ├── PatientAppointmentHistory.tsx    # Session log timeline (Sprint 3)
│       └── PatientNotesHistory.tsx          # Clinical notes timeline (Sprint 3)
├── lib/
│   ├── services/
│   │   ├── appointmentService.ts            # Appointment Service Layer
│   │   ├── baseService.ts                   # handleServiceResponse standard wrapper
│   │   ├── dashboardService.ts              # Dashboard Service Layer
│   │   ├── mockData.ts                      # Central mock dataset
│   │   ├── noteService.ts                   # Clinical Notes Service Layer
│   │   └── patientService.ts                # getPatients, getPatientById, createPatient, updatePatient
│   ├── supabase/
│   │   ├── client.ts                        # createBrowserClient helper for client components
│   │   └── server.ts                        # createServerClient helper with next/headers cookies
│   ├── types/
│   │   └── index.ts                         # Patient, CreatePatientInput, UpdatePatientInput types
│   └── utils.ts                             # Class merging utility (cn helper)
└── tech-brief.md                            # Comprehensive Sprint Technical Brief & Architecture Document
```

---

## 4. Next.js App Router Modal Patterns & Tailwind CSS Form Layouts

### 4.1 Next.js App Router Modal Strategy Choice
In Next.js App Router, modal dialogs can be implemented via two primary approaches:
1. **Client Component Controlled Modal** (Selected for Form Modals): Recommended for stateful forms (such as new patient registration and editing patient details) where immediate form validation, field reset, backdrop dismissal, and client state updates are required without triggering full route changes.
2. **Parallel & Intercepting Routes (`@modal`)**: Preferred for deep-linkable URLs (e.g. preview charts). For practitioner registration and profile edits, controlled Client Modals provide superior UX responsiveness and cleaner form lifecycle management.

### 4.2 Accessibility & Modal Lifecycle Guidelines
- **Escape Key Dismissal**: Attach a global `keydown` event listener to close the modal when `Escape` is pressed.
- **Backdrop Focus & Click Dismissal**: Click events on the outer backdrop shadow overlay dismiss the modal, while click events inside `modal-content` stop propagation.
- **Body Scroll Lock**: Prevent background document scroll when modal is open by toggling `document.body.style.overflow = 'hidden'`.
- **Form State Cleanup**: Automatically clear form inputs and error messages whenever the modal transitions from closed to open.

### 4.3 Tailwind CSS Form Layout Conventions
- **Dual-Column Grid**: Use `grid grid-cols-1 md:grid-cols-2 gap-4` for compact, structured input pairing (e.g. First Name / Last Name, Phone / Email, DOB / Gender).
- **Form Input Styling Standard**:
  ```tsx
  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm transition-all"
  ```
- **Label & Field Header Formatting**: `block text-xs font-semibold text-slate-700 mb-1.5`
- **Error Callouts**: Bordered callout container with `bg-rose-50 border-rose-200 text-rose-700 text-xs font-medium rounded-lg p-3 flex items-center gap-2`.

---

## 5. Supabase Mutation Patterns & Service Layer Implementation

### 5.1 Insertion Pattern (`createPatient`)
Supabase JS v2 uses `.from('patients').insert([payload]).select().single()` to persist new rows and return the complete inserted database record:

```typescript
const { data, error } = await supabase
  .from('patients')
  .insert([
    {
      practitioner_id: input.practitioner_id || 'prac-1',
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email || null,
      phone: input.phone || null,
      date_of_birth: input.date_of_birth || null,
      gender: input.gender || null,
      status: input.status || 'active',
      primary_ailment: input.primary_ailment || null,
      notes_summary: input.notes_summary || null,
    },
  ])
  .select()
  .single();
```

### 5.2 Update Pattern (`updatePatient`)
Supabase JS v2 updates records via `.from('patients').update(payload).eq('id', id).select().single()`:

```typescript
const { data, error } = await supabase
  .from('patients')
  .update({
    ...input,
    updated_at: new Date().toISOString(),
  })
  .eq('id', id)
  .select()
  .single();
```

### 5.3 Resilient Mock & Environment Fallback Strategy
To guarantee uninterrupted execution in offline, demo, or non-configured Supabase environments:
- Maintain an in-memory mutable array `inMemoryPatients` seeded with `MOCK_PATIENTS`.
- If environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) or Supabase client initialization fail, execute mutation operations directly on `inMemoryPatients` (prepend via `unshift` for inserts, find/update for updates) and return successful `ServiceResponse<Patient>`.

---

## 6. Verified Domain Types & Implementation Specifications

### 6.1 Domain Contracts: `lib/types/index.ts`

```typescript
// Service Response Wrapper
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Patient Status Enum Type
export type PatientStatus = 'active' | 'inactive' | 'archived';

// Patient Profile Interface
export interface Patient {
  id: string;
  practitioner_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  status: PatientStatus;
  primary_ailment?: string | null;
  notes_summary?: string | null;
  created_at: string;
  updated_at: string;
}

// Create Patient Form Input Payload
export interface CreatePatientInput {
  practitioner_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  status?: PatientStatus;
  primary_ailment?: string;
  notes_summary?: string;
}

// Update Patient Form Input Payload
export interface UpdatePatientInput {
  practitioner_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  status?: PatientStatus;
  primary_ailment?: string;
  notes_summary?: string;
}
```

---

### 6.2 Extended Service Layer: `lib/services/patientService.ts`

```typescript
import { createClient } from '../supabase/server';
import { handleServiceResponse } from './baseService';
import { Patient, CreatePatientInput, UpdatePatientInput, ServiceResponse } from '../types';
import { MOCK_PATIENTS } from './mockData';

let inMemoryPatients: Patient[] = [...MOCK_PATIENTS];

export async function getPatients(practitionerId?: string): Promise<ServiceResponse<Patient[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const filtered = practitionerId 
      ? inMemoryPatients.filter(p => p.practitioner_id === practitionerId || p.practitioner_id === 'prac-1') 
      : inMemoryPatients;
    return { data: filtered, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: inMemoryPatients, error: null };
    }
    let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    const { data, error } = await query;
    if (error) {
      return handleServiceResponse<Patient[]>(inMemoryPatients, null);
    }
    return handleServiceResponse<Patient[]>(data as Patient[], null);
  } catch (error) {
    return handleServiceResponse<Patient[]>(inMemoryPatients, error);
  }
}

export async function getPatientById(id: string): Promise<ServiceResponse<Patient>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const patient = inMemoryPatients.find(p => p.id === id) || null;
    return { data: patient, error: patient ? null : 'Patient not found' };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      const patient = inMemoryPatients.find(p => p.id === id) || null;
      return { data: patient, error: patient ? null : 'Patient not found' };
    }
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
    if (error) {
      const patient = inMemoryPatients.find(p => p.id === id) || null;
      return handleServiceResponse<Patient>(patient, error);
    }
    return handleServiceResponse<Patient>(data as Patient, null);
  } catch (error) {
    const patient = inMemoryPatients.find(p => p.id === id) || null;
    return handleServiceResponse<Patient>(patient, error);
  }
}

export async function createPatient(input: CreatePatientInput): Promise<ServiceResponse<Patient>> {
  const newPatient: Patient = {
    id: `p-${Date.now()}`,
    practitioner_id: input.practitioner_id || 'prac-1',
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email || null,
    phone: input.phone || null,
    date_of_birth: input.date_of_birth || null,
    gender: input.gender || null,
    status: input.status || 'active',
    primary_ailment: input.primary_ailment || null,
    notes_summary: input.notes_summary || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    inMemoryPatients.unshift(newPatient);
    return { data: newPatient, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      inMemoryPatients.unshift(newPatient);
      return { data: newPatient, error: null };
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          practitioner_id: input.practitioner_id || 'prac-1',
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email || null,
          phone: input.phone || null,
          date_of_birth: input.date_of_birth || null,
          gender: input.gender || null,
          status: input.status || 'active',
          primary_ailment: input.primary_ailment || null,
          notes_summary: input.notes_summary || null,
        },
      ])
      .select()
      .single();

    if (error) {
      inMemoryPatients.unshift(newPatient);
      return handleServiceResponse<Patient>(newPatient, null);
    }

    const created = data as Patient;
    inMemoryPatients.unshift(created);
    return handleServiceResponse<Patient>(created, null);
  } catch (error) {
    inMemoryPatients.unshift(newPatient);
    return handleServiceResponse<Patient>(newPatient, error);
  }
}

export async function updatePatient(id: string, input: UpdatePatientInput): Promise<ServiceResponse<Patient>> {
  const existingIdx = inMemoryPatients.findIndex((p) => p.id === id);
  const existing = existingIdx !== -1 ? inMemoryPatients[existingIdx] : null;

  if (!existing && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return { data: null, error: 'Patient record not found' };
  }

  const updatedInMemory: Patient = existing
    ? {
        ...existing,
        ...input,
        updated_at: new Date().toISOString(),
      }
    : {
        id,
        practitioner_id: input.practitioner_id || 'prac-1',
        first_name: input.first_name || '',
        last_name: input.last_name || '',
        email: input.email ?? null,
        phone: input.phone ?? null,
        date_of_birth: input.date_of_birth ?? null,
        gender: input.gender ?? null,
        status: input.status || 'active',
        primary_ailment: input.primary_ailment ?? null,
        notes_summary: input.notes_summary ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (existingIdx !== -1) {
      inMemoryPatients[existingIdx] = updatedInMemory;
    }
    return { data: updatedInMemory, error: null };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      if (existingIdx !== -1) {
        inMemoryPatients[existingIdx] = updatedInMemory;
      }
      return { data: updatedInMemory, error: null };
    }

    const { data, error } = await supabase
      .from('patients')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (existingIdx !== -1) {
        inMemoryPatients[existingIdx] = updatedInMemory;
      }
      return handleServiceResponse<Patient>(updatedInMemory, null);
    }

    const updated = data as Patient;
    if (existingIdx !== -1) {
      inMemoryPatients[existingIdx] = updated;
    }
    return handleServiceResponse<Patient>(updated, null);
  } catch (error) {
    if (existingIdx !== -1) {
      inMemoryPatients[existingIdx] = updatedInMemory;
    }
    return handleServiceResponse<Patient>(updatedInMemory, error);
  }
}
```

---

### 6.3 Add Patient Modal Component: `components/patients/AddPatientModal.tsx`

```tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { Patient, CreatePatientInput, PatientStatus } from '@/lib/types';
import { createPatient } from '@/lib/services/patientService';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated?: (patient: Patient) => void;
}

export function AddPatientModal({ isOpen, onClose, onPatientCreated }: AddPatientModalProps) {
  const [formData, setFormData] = useState<CreatePatientInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Other',
    status: 'active',
    primary_ailment: '',
    notes_summary: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock background scroll and handle Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMsg('First name and last name are required fields. HC');
      return;
    }

    setIsLoading(true);

    try {
      const res = await createPatient(formData);

      if (res.error || !res.data) {
        setErrorMsg(res.error || 'Failed to create patient record. HC');
        setIsLoading(false);
        return;
      }

      // Reset form and notify parent
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'Other',
        status: 'active',
        primary_ailment: '',
        notes_summary: '',
      });
      setIsLoading(false);
      if (onPatientCreated) onPatientCreated(res.data);
      onClose();
    } catch (err) {
      setErrorMsg('An unexpected error occurred during patient registration. HC');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Register New Patient HC</h2>
              <p className="text-xs text-slate-500">Add a new patient chart to your clinical roster. HC</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Layout */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name HC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Jane HC"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name HC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Doe HC"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address HC</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@example.com HC"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number HC</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000 HC"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth HC</label>
              <input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender HC</label>
              <select
                value={formData.gender || 'Other'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              >
                <option value="Female">Female HC</option>
                <option value="Male">Male HC</option>
                <option value="Non-binary">Non-binary HC</option>
                <option value="Other">Other / Prefer not to say HC</option>
              </select>
            </div>

            {/* Patient Roster Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status HC</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              >
                <option value="active">Active HC</option>
                <option value="inactive">Inactive HC</option>
                <option value="archived">Archived HC</option>
              </select>
            </div>

            {/* Primary Diagnosis / Focus Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Diagnosis HC</label>
              <input
                type="text"
                value={formData.primary_ailment || ''}
                onChange={(e) => setFormData({ ...formData, primary_ailment: e.target.value })}
                placeholder="e.g. Generalized Anxiety Disorder HC"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Initial Notes Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Intake Summary HC</label>
            <textarea
              rows={3}
              value={formData.notes_summary || ''}
              onChange={(e) => setFormData({ ...formData, notes_summary: e.target.value })}
              placeholder="Enter initial clinical intake assessment or consultation notes... HC"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel HC
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Patient... HC
                </>
              ) : (
                'Save Patient Record HC'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 6.4 Edit Patient Modal Component: `components/patients/EditPatientModal.tsx`

```tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { Patient, UpdatePatientInput, PatientStatus } from '@/lib/types';
import { updatePatient } from '@/lib/services/patientService';

interface EditPatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onPatientUpdated?: (updatedPatient: Patient) => void;
}

export function EditPatientModal({ isOpen, patient, onClose, onPatientUpdated }: EditPatientModalProps) {
  const [formData, setFormData] = useState<UpdatePatientInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Other',
    status: 'active',
    primary_ailment: '',
    notes_summary: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'Other',
        status: patient.status || 'active',
        primary_ailment: patient.primary_ailment || '',
        notes_summary: patient.notes_summary || '',
      });
    }
  }, [patient]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      setErrorMsg('First name and last name are required fields. HC');
      return;
    }

    setIsLoading(true);

    try {
      const res = await updatePatient(patient.id, formData);

      if (res.error || !res.data) {
        setErrorMsg(res.error || 'Failed to update patient record. HC');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      if (onPatientUpdated) onPatientUpdated(res.data);
      onClose();
    } catch (err) {
      setErrorMsg('An unexpected error occurred while updating patient chart. HC');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Patient Details HC</h2>
              <p className="text-xs text-slate-500">Update demographic and clinical focus for {patient.first_name} {patient.last_name}. HC</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name HC *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name HC *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address HC</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number HC</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth HC</label>
              <input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender HC</label>
              <select
                value={formData.gender || 'Other'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              >
                <option value="Female">Female HC</option>
                <option value="Male">Male HC</option>
                <option value="Non-binary">Non-binary HC</option>
                <option value="Other">Other / Prefer not to say HC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roster Status HC</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              >
                <option value="active">Active HC</option>
                <option value="inactive">Inactive HC</option>
                <option value="archived">Archived HC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Diagnosis HC</label>
              <input
                type="text"
                value={formData.primary_ailment || ''}
                onChange={(e) => setFormData({ ...formData, primary_ailment: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes Summary HC</label>
            <textarea
              rows={3}
              value={formData.notes_summary || ''}
              onChange={(e) => setFormData({ ...formData, notes_summary: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel HC
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Record... HC
                </>
              ) : (
                'Update Patient Record HC'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 6.5 Interactive Roster Client Container: `components/patients/PatientRosterClient.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Patient, PatientStatus } from '@/lib/types';
import { PatientTable } from '@/components/patients/PatientTable';
import { AddPatientModal } from '@/components/patients/AddPatientModal';
import { EditPatientModal } from '@/components/patients/EditPatientModal';
import { Search, Filter, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientRosterClientProps {
  initialPatients: Patient[];
}

export function PatientRosterClient({ initialPatients }: PatientRosterClientProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Filter patient roster based on search query & status filter tab
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const email = (patient.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Patient Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            Patient Roster HC
          </h1>
          <p className="text-sm text-slate-500">Manage active clinical charts and onboard new patients. HC</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Patient HC
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email... HC"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
          />
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors',
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {st === 'all' ? 'All Patients HC' : `${st} HC`}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Data Table Container */}
      <PatientTable 
        patients={filteredPatients} 
        onEditPatient={(patient) => setEditingPatient(patient)} 
      />

      {/* Add New Patient Registration Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

      {/* Edit Patient Profile Modal */}
      <EditPatientModal
        isOpen={!!editingPatient}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onPatientUpdated={handlePatientUpdated}
      />
    </div>
  );
}
```

---

### 6.6 Server Roster Page Entrypoint: `app/patients/page.tsx`

```tsx
import { getPatients } from '@/lib/services/patientService';
import { PatientRosterClient } from '@/components/patients/PatientRosterClient';

export default async function PatientsPage() {
  const { data: patients, error } = await getPatients();

  if (error || !patients) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700 shadow-sm">
        Failed to load clinical patient roster. HC
      </div>
    );
  }

  return <PatientRosterClient initialPatients={patients} />;
}
```

---

## 7. UI Abstraction & Hardcoded Marker Guidelines (` HC`)

To enforce clean architectural boundaries and code clarity across Lumina Health:

1. **Strict Service Abstraction**:
   - UI Components (`AddPatientModal`, `EditPatientModal`, `PatientRosterClient`, `PatientTable`) must **NEVER** import or invoke Supabase clients (`createClient`) directly.
   - All backend database operations are mediated exclusively through `lib/services/patientService.ts`.

2. **Hardcoded String Visibility Rule (` HC`)**:
   - All static developer-written UI string labels, input field headers, placeholder texts, button titles, and tab text MUST explicitly terminate with ` HC` (e.g. `Add Patient HC`, `First Name HC`, `Save Patient Record HC`).
   - Dynamic user-entered data returned from services or form state (such as patient names, email addresses, primary diagnoses, clinical intake notes) MUST remain clean without ` HC`.

---

## 8. Verification & Build Validation

Before delivering sprint code changes, execute full codebase verification:

```bash
# 1. Type-check TypeScript codebase for strict adherence
npm run type-check

# 2. Run Next.js production build verification
npm run build
```
