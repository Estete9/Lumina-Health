'use client';

import { Patient } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function RecentNotes({ patients }: { patients: Patient[] }) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Notes Status</h2>
      <div className="space-y-4">
        {patients.length === 0 ? (
          <p className="text-sm text-slate-500">No recent notes.</p>
        ) : (
          patients.slice(0, 3).map((patient) => (
            <div 
              key={patient.id} 
              className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 p-2 -mx-2 rounded-lg cursor-pointer transition-colors group"
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              <p className="font-medium text-sm text-slate-800">{patient.first_name} {patient.last_name}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{patient.notes_summary || 'No recent summary available.'}</p>
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
        All patient observations are encrypted and isolated under RLS policies.
      </p>
    </div>
  );
}
