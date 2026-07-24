'use client';

import React from 'react';
import { Patient } from '@/lib/types';
import { Mail, Phone, Calendar as CalendarIcon, User, Plus, FileText, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

interface PatientProfileHeaderProps {
  patient: Patient;
}

export function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
  const initials = `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`;
  const isActive = patient.status === 'active';

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Roster</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-700 text-xl shadow-xs shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  isActive
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {patient.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-0.5">
              {patient.primary_ailment && (
                <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  Primary Diagnosis: {patient.primary_ailment}
                </span>
              )}
              {patient.secondary_ailments && patient.secondary_ailments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <div className="flex flex-wrap gap-1">
                    {patient.secondary_ailments.map((sec, idx) => (
                      <span key={idx} className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-amber-200/60">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>DOB: {patient.date_of_birth}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/calendar`}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
