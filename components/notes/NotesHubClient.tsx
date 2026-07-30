'use client';

import React, { useState, useMemo } from 'react';
import { ClinicalNote, Patient } from '@/lib/types';
import { ClinicalNoteCard } from './ClinicalNoteCard';
import { Search, BookOpen } from 'lucide-react';

interface NoteData {
  note: ClinicalNote;
  patient: Patient;
}

interface NotesHubClientProps {
  initialNotes: NoteData[];
}

export function NotesHubClient({ initialNotes }: NotesHubClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    let results = initialNotes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(({ note, patient }) => {
        const patientName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
        
        let inDiscoveries = false;
        if (Array.isArray(note.discoveries)) {
          inDiscoveries = note.discoveries.some(d => d.toLowerCase().includes(q));
        } else if (typeof note.discoveries === 'string') {
          inDiscoveries = note.discoveries.toLowerCase().includes(q);
        }

        const inRawNotes = note.raw_notes?.toLowerCase().includes(q);

        return patientName.includes(q) || inDiscoveries || inRawNotes;
      });
    }

    return results;
  }, [initialNotes, searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto">


      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, discoveries, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No notes found</h3>
          <p className="text-slate-500 text-sm">
            {searchQuery ? 'Try adjusting your search terms.' : 'You have not created any clinical notes yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNotes.map((data) => (
            <ClinicalNoteCard
              key={data.note.id}
              note={data.note}
              patient={data.patient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
