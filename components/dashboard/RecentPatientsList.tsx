import React from 'react';
import { Patient } from '@/lib/types';
import { User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RecentPatientsListProps {
  patients: Patient[];
}

export default function RecentPatientsList({ patients }: RecentPatientsListProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Patient Files</h2>
          <p className="text-xs text-slate-400">Recently updated clinical charts</p>
        </div>
        <Link 
          href="/patients"
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
        >
          <span>View Roster</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {patients.map((patient) => (
          <div 
            key={patient.id}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-semibold text-teal-700 text-xs">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                  {patient.first_name} {patient.last_name}
                </h4>
                <p className="text-xs text-slate-500">{patient.primary_ailment || 'General Therapy'}</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
