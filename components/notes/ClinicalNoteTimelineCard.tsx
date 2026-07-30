import React, { useState } from 'react';
import { ClinicalNote } from '@/lib/types';
import { ChevronDown, ChevronUp, FileText, Activity, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ClinicalNoteTimelineCardProps {
  note: ClinicalNote;
}

export function ClinicalNoteTimelineCard({ note }: ClinicalNoteTimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const parsedDate = note.session_date ? parseISO(note.session_date) : parseISO(note.created_at);
  const dateStr = format(parsedDate, 'MMMM d, yyyy');

  // Helper to extract a string summary from potentially string | string[] | null fields
  const extractSummary = (data: string | string[] | null | undefined): string => {
    if (!data) return 'None recorded.';
    if (Array.isArray(data)) return data.join(', ');
    return data;
  };

  const discoveriesStr = extractSummary(note.discoveries);
  const shortDiscoveries = discoveriesStr.length > 80 ? discoveriesStr.substring(0, 80) + '...' : discoveriesStr;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{dateStr}</span>
          </div>
          <p className="text-sm text-slate-600 truncate max-w-xl">
            <span className="font-medium">Discoveries:</span> {shortDiscoveries}
          </p>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
          
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Activity size={16} className="text-teal-600" /> Discoveries & Insights
            </h4>
            <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
              {discoveriesStr}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <BookOpen size={16} className="text-amber-600" /> Daily Actions / Homework
            </h4>
            <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
              {extractSummary(note.daily_actions)}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-600" /> Raw Notes
            </h4>
            <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200 whitespace-pre-wrap">
              {note.raw_notes || 'No raw notes recorded.'}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
