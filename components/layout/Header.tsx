'use client';

import React, { useState } from 'react';
import { Bell, Plus, ShieldCheck } from 'lucide-react';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';
import { GlobalSearchBar } from './GlobalSearchBar';

export function Header() {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
      {/* Global Real-Time Search Bar Component */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <GlobalSearchBar />
      </div>

      {/* Header Actions & Practitioner Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Action Button: New Clinical Note */}
        <button
          type="button"
          onClick={() => setIsNoteModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all hover:shadow"
        >
          <Plus className="h-4 w-4" />
          <span>+ Note</span>
        </button>

        {/* Notifications Icon */}
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Practitioner User Profile Pill */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200 shadow-2xs">
            DJ
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800">Dr. Jenkins</span>
              <span title="HIPAA Compliant Session">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Clinical Psychologist</p>
          </div>
        </div>
      </div>

      {/* Global New Clinical Note Modal Portal */}
      <NewClinicalNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={() => setIsNoteModalOpen(false)}
      />
    </header>
  );
}
