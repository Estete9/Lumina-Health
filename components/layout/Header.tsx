"use client";

import React, { useState } from 'react';
import { Search, Bell, UserCheck, Plus } from 'lucide-react';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';

export function Header() {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients, notes, schedules..."
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* Practitioner Right Controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsNoteModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>

        <button
          type="button"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-500" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Practitioner User Profile Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-semibold text-sm border border-teal-200">
            Dr
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-800">Dr. Sarah Jenkins</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-teal-600" /> Clinical Psychologist
            </p>
          </div>
        </div>
      </div>
      <NewClinicalNoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSuccess={() => setIsNoteModalOpen(false)}
      />
    </header>
  );
}
