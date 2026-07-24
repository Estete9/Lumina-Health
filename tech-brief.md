# Lumina Health — Technical Brief & Audit Report

## Technical Audit: Note Disappearance Issue

### 1. Root Cause Diagnosis
- In `components/patients/PatientNotesHistory.tsx`, the `useEffect` hook listening to changes in `[notes]` directly overwrote the component's internal `notesList` state with the server-passed `notes` prop via `setNotesList(notes)`.
- When `router.refresh()` executed following a note creation event, server-side re-rendering invoked `getNotesByPatientId`. In mock or fallback environments where Supabase persistence was bypassed or un-synced, `getNotesByPatientId` returned the static server array (which lacked the newly created client note).
- As a consequence, the incoming prop update triggered `useEffect`, wiping out newly created notes stored in client-side state.

---

### 2. Fix Specification

#### A. `components/patients/PatientNotesHistory.tsx`
Merge incoming server `notes` with existing local state to preserve client-created notes that may not yet exist in the server prop payload:

```tsx
useEffect(() => {
  setNotesList((prev) => {
    const serverIds = new Set(notes.map((n) => n.id));
    const localNewNotes = prev.filter((n) => !serverIds.has(n.id));
    return [...localNewNotes, ...notes];
  });
}, [notes]);
```

#### B. `lib/services/noteService.ts`
Ensure `inMemoryNotes.unshift(newNote)` is unconditionally executed within `createNote()` prior to database operations so that in-memory fallback state holds created notes consistently across both server and client execution contexts:

```typescript
export async function createNote(input: CreateNoteInput, practitionerId: string = 'prac-1'): Promise<ServiceResponse<ClinicalNote>> {
  const newNote: ClinicalNote = {
    id: `note-${Date.now()}`,
    patient_id: input.patient_id,
    practitioner_id: practitionerId,
    session_date: input.session_date,
    discoveries: input.discoveries,
    daily_actions: input.daily_actions,
    ailments: input.ailments,
    raw_notes: input.raw_notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Always retain in memory for client/server fallbacks
  inMemoryNotes.unshift(newNote);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: newNote, error: null };
  }
  // ... rest of Supabase insertion logic
}
```

---

## Architectural & Technical Specifications

### Recommended Packages & Versions
- **Framework**: Next.js 14+ / 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4+ / 4.x
- **Icons**: Lucide React (`lucide-react`)
- **Backend / Database Client**: `@supabase/supabase-js` v2 & `@supabase/ssr`

---

### Directory Structure Conventions

```
Lumina_Health/
├── app/                      # App Router pages and layouts
│   ├── layout.tsx            # Root layout wrapper
│   ├── page.tsx              # Landing / Dashboard root
│   ├── patients/             # Patient chart routes
│   └── api/                  # API routes (if needed)
├── components/               # React UI Components
│   ├── navigation/           # Sidebar, Header, Navigation Shell
│   ├── patients/             # Patient-specific views & history components
│   └── notes/                # Note modal & clinical entry UI
├── lib/                      # Core business logic & abstraction
│   ├── services/             # Service abstraction layer (noteService, etc.)
│   ├── supabase/             # Supabase clients (browser & server helpers)
│   └── types/                # TypeScript interfaces and domain schemas
```

---

### Service Layer Abstraction & Supabase Client Setup

#### Browser Client Helper (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
```

#### Server Client Helper (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Handled in Server Components
        }
      },
    },
  });
}
```

---

### Type Safety & UI Abstraction Guidelines
1. **Service Layer Isolation**: Components must never query database tables directly. All data access must pass through `lib/services/` modules returning standard `ServiceResponse<T>` shapes (`{ data: T | null, error: Error | null }`).
2. **Fallback & Resiliency**: Service operations must provide standard in-memory fallbacks when Supabase environment variables are absent.
3. **State Reconciliation**: Client state that syncs with server props must use state-merging strategies rather than outright replacement to preserve optimistic client updates across `router.refresh()`.
