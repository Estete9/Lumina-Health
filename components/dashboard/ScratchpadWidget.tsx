'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Pin, PinOff, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { ScratchpadNote, ScratchpadCategory, CreateScratchpadInput, UpdateScratchpadInput } from '@/lib/types';
import { getScratchpadNotes, createScratchpadNote, updateScratchpadNote, deleteScratchpadNote } from '@/lib/services/scratchpadService';

const CATEGORY_COLORS: Record<ScratchpadCategory, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  clinical: 'bg-teal-100 text-teal-800 border-teal-200',
  follow_up: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  supervision: 'bg-amber-100 text-amber-800 border-amber-200',
};

const CATEGORY_LABELS: Record<ScratchpadCategory, string> = {
  admin: 'Admin',
  clinical: 'Clinical',
  follow_up: 'Follow-up',
  supervision: 'Supervision',
};

type FilterType = 'all' | ScratchpadCategory;

export default function ScratchpadWidget() {
  const [notes, setNotes] = useState<ScratchpadNote[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ScratchpadCategory>('clinical');
  const [newIsPinned, setNewIsPinned] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await getScratchpadNotes();
      if (res.data) {
        setNotes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortNotes = (items: ScratchpadNote[]) => {
    return [...items].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const input: CreateScratchpadInput = {
      content: newContent.trim(),
      category: newCategory,
      is_pinned: newIsPinned,
      is_completed: false,
    };

    const tempId = `temp-${Date.now()}`;
    const newNote: ScratchpadNote = {
      id: tempId,
      practitioner_id: 'prac-1',
      content: input.content,
      category: input.category,
      is_pinned: input.is_pinned,
      is_completed: input.is_completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => sortNotes([newNote, ...prev]));
    setNewContent('');
    setNewIsPinned(false);

    try {
      const res = await createScratchpadNote(input);
      if (res.data) {
        setNotes((prev) => sortNotes(prev.map((n) => (n.id === tempId ? res.data! : n))));
      } else {
        fetchNotes();
      }
    } catch (error) {
      console.error(error);
      fetchNotes();
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? { ...n, is_completed: !currentStatus } : n))));
    try {
      if (!id.startsWith('temp-')) {
        await updateScratchpadNote(id, { is_completed: !currentStatus });
      }
    } catch (e) {
      fetchNotes();
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? { ...n, is_pinned: !currentPinStatus } : n))));
    try {
      if (!id.startsWith('temp-')) {
        await updateScratchpadNote(id, { is_pinned: !currentPinStatus });
      }
    } catch (e) {
      fetchNotes();
    }
  };

  const handleDelete = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      if (!id.startsWith('temp-')) {
        await deleteScratchpadNote(id);
      }
    } catch (e) {
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter((n) => filter === 'all' || n.category === filter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px] max-h-[600px]">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Scratchpad</h2>
      </div>

      <div className="p-4 border-b border-slate-200">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <textarea
            className="w-full resize-none rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            rows={2}
            placeholder="Jot down a quick note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                className="text-sm border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ScratchpadCategory)}
              >
                <option value="clinical">Clinical</option>
                <option value="admin">Admin</option>
                <option value="follow_up">Follow-up</option>
                <option value="supervision">Supervision</option>
              </select>
              <button
                type="button"
                onClick={() => setNewIsPinned(!newIsPinned)}
                className={`p-1.5 rounded-md transition-colors border border-transparent ${
                  newIsPinned ? 'bg-amber-100 text-amber-600 border-amber-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
                title={newIsPinned ? 'Unpin note' : 'Pin note'}
              >
                {newIsPinned ? <Pin size={18} className="fill-amber-500" /> : <PinOff size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={!newContent.trim()}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              Add Note
            </button>
          </div>
        </form>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterPill label="Clinical" active={filter === 'clinical'} onClick={() => setFilter('clinical')} />
        <FilterPill label="Admin" active={filter === 'admin'} onClick={() => setFilter('admin')} />
        <FilterPill label="Follow-up" active={filter === 'follow_up'} onClick={() => setFilter('follow_up')} />
        <FilterPill label="Supervision" active={filter === 'supervision'} onClick={() => setFilter('supervision')} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center text-slate-400 py-8 text-sm">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-slate-400 py-8 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
              <Pin size={24} className="text-slate-300" />
            </div>
            <p className="text-sm">No notes found for this category.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group relative flex items-start gap-3 p-3 rounded-lg border transition-all ${
                note.is_completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
              }`}
            >
              <button
                onClick={() => handleToggleComplete(note.id, !!note.is_completed)}
                className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                {note.is_completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm whitespace-pre-wrap ${
                    note.is_completed ? 'text-slate-500 line-through' : 'text-slate-700'
                  }`}
                >
                  {note.content}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      note.category ? CATEGORY_COLORS[note.category] : CATEGORY_COLORS['clinical']
                    }`}
                  >
                    {note.category ? CATEGORY_LABELS[note.category] : 'Clinical'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleTogglePin(note.id, !!note.is_pinned)}
                  className={`p-1.5 rounded-md transition-colors ${
                    note.is_pinned ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                  title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin size={16} className={note.is_pinned ? 'fill-amber-500' : ''} />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors border focus:outline-none ${
        active ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}
