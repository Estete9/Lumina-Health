'use client';

import { ClinicalNote } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function RecentNotes({ notes }: { notes: (ClinicalNote & { patient_name: string })[] }) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Notes Status</h2>
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-500">No recent notes.</p>
        ) : (
          notes.slice(0, 3).map((note) => {
            const formattedDate = new Date(note.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
            // Extract a summary from discoveries or raw_notes
            let summary = 'No detailed notes provided.';
            if (Array.isArray(note.discoveries) && note.discoveries.length > 0) {
              summary = note.discoveries[0];
            } else if (note.raw_notes) {
              summary = note.raw_notes;
            }

            return (
              <div 
                key={note.id} 
                className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 p-2 -mx-2 rounded-lg cursor-pointer transition-colors group"
                onClick={() => router.push(`/patients/${note.patient_id}`)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-slate-800">{note.patient_name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{formattedDate}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{summary}</p>
              </div>
            );
          })
        )}
      </div>
      <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
        All patient observations are encrypted and isolated under RLS policies.
      </p>
    </div>
  );
}
