'use client';

import React, { useState } from 'react';
import { Patient, Appointment, ClinicalNote } from '@/lib/types';
import { PatientNotesHistory } from './PatientNotesHistory';
import { PatientAppointmentHistory } from './PatientAppointmentHistory';
import { FileText, Calendar, User, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientDetailTabsProps {
  patient: Patient;
  appointments: Appointment[];
  notes: ClinicalNote[];
}

export function PatientDetailTabs({ patient, appointments, notes }: PatientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'appointments'>('overview');

  return (
    <div className="space-y-6">
      {/* Tabs Navigation Header */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 py-3.5 px-4 text-sm font-semibold border-b-2 transition-all',
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <User className="w-4 h-4" />
          <span>Clinical Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            'flex items-center gap-2 py-3.5 px-4 text-sm font-semibold border-b-2 transition-all',
            activeTab === 'notes'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Clinical Notes History</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {notes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={cn(
            'flex items-center gap-2 py-3.5 px-4 text-sm font-semibold border-b-2 transition-all',
            activeTab === 'appointments'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointment History</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {appointments.length}
          </span>
        </button>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Demographics Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Patient Clinical Profile & Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Full Name</span>
                  <span className="text-slate-800 font-medium text-sm">{patient.first_name} {patient.last_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Primary Diagnosis / Focus</span>
                  <span className="text-slate-800 font-medium text-sm">{patient.primary_ailment || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Contact Email</span>
                  <span className="text-slate-800 font-medium">{patient.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Phone Number</span>
                  <span className="text-slate-800 font-medium">{patient.phone || 'N/A'}</span>
                </div>
              </div>

              {patient.notes_summary && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Practitioner Progress Summary</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 italic">
                    "{patient.notes_summary}"
                  </p>
                </div>
              )}
            </div>

            {/* Recent Notes Preview */}
            <PatientNotesHistory notes={notes} patientId={patient.id} />
          </div>

          {/* Sidebar Column: Appointments */}
          <div className="space-y-6">
            <PatientAppointmentHistory appointments={appointments} />
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <PatientNotesHistory notes={notes} patientId={patient.id} />
      )}

      {activeTab === 'appointments' && (
        <PatientAppointmentHistory appointments={appointments} />
      )}
    </div>
  );
}
