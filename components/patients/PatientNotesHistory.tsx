import React from 'react';
import { ClinicalNote } from '@/lib/types';
import { FileText, Sparkles, CheckSquare, AlertCircle, Calendar } from 'lucide-react';

interface PatientNotesHistoryProps {
  notes: ClinicalNote[];
}

export function PatientNotesHistory({ notes }: PatientNotesHistoryProps) {
  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-500 text-sm">No clinical notes recorded yet for this patient chart.</p>
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
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
          {notes.length} Total Notes
        </span>
      </div>

      <div className="space-y-6">
        {notes.map((note) => {
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

              {/* Discoveries Grid */}
              {discoveriesList.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Key Discoveries & Clinical Insights</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {discoveriesList.map((disc, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-teal-50 text-teal-900 px-3 py-1 rounded-xl border border-teal-200/60 font-medium"
                      >
                        {disc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Actions Assigned */}
              {dailyActionsList.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Assigned Daily Actions</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {dailyActionsList.map((act, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raw Notes Body */}
              {note.raw_notes && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Practitioner Session Notes</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 italic">
                    "{note.raw_notes}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
