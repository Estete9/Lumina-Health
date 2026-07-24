'use client';

import React, { useState } from 'react';
import { Patient, PatientStatus } from '@/lib/types';
import { User, Mail, Phone, Calendar, Stethoscope, ChevronDown, Check } from 'lucide-react';
import { updatePatientStatus } from '@/lib/services/patientService';

interface PatientProfileHeaderProps {
  patient: Patient;
}

export function PatientProfileHeader({ patient: initialPatient }: PatientProfileHeaderProps) {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const formattedDob = patient.date_of_birth
    ? new Date(patient.date_of_birth).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not provided';

  const secondaryList = Array.isArray(patient.secondary_ailments)
    ? patient.secondary_ailments
    : typeof patient.secondary_ailments === 'string'
    ? [patient.secondary_ailments]
    : [];

  const handleStatusChange = async (newStatus: PatientStatus) => {
    if (newStatus === patient.status) {
      setIsStatusDropdownOpen(false);
      return;
    }

    setUpdating(true);
    const res = await updatePatientStatus(patient.id, newStatus);
    setUpdating(false);
    setIsStatusDropdownOpen(false);

    if (res.data) {
      setPatient(res.data);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('patient_status_updated', {
            detail: { id: patient.id, status: newStatus }
          })
        );
      }
    }
  };

  const getStatusBadgeStyle = (status: PatientStatus) => {
    switch (status) {
      case 'active':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'completed':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'archived':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusOptions: { value: PatientStatus; label: string; description: string }[] = [
    { value: 'active', label: 'Active Care', description: 'Currently receiving active therapy sessions' },
    { value: 'inactive', label: 'Inactive / On Pause', description: 'Therapy paused or pending next session' },
    { value: 'completed', label: 'Completed Therapy', description: 'Successfully completed clinical goals' },
    { value: 'archived', label: 'Archived Record', description: 'Historical chart closed & archived' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl shadow-2xs">
            {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-slate-900">
                {patient.first_name} {patient.last_name}
              </h1>

              {/* Status Badge Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  disabled={updating}
                  className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all shadow-2xs ${getStatusBadgeStyle(
                    patient.status
                  )} ${updating ? 'opacity-50 cursor-wait' : 'hover:scale-105'}`}
                >
                  <span className="capitalize">{patient.status === 'completed' ? 'Completed Therapy' : patient.status}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 space-y-1">
                    <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Update Therapy Status
                    </div>
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleStatusChange(opt.value)}
                        className={`w-full text-left p-2 rounded-xl transition-colors flex items-start justify-between group ${
                          patient.status === opt.value ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{opt.label}</p>
                          <p className="text-[10px] text-slate-400">{opt.description}</p>
                        </div>
                        {patient.status === opt.value && <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Patient ID: {patient.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Primary Focus: {patient.primary_ailment || 'General Assessment'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Email Contact</p>
            <p className="font-semibold text-slate-800">{patient.email || 'Not provided'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Phone Number</p>
            <p className="font-semibold text-slate-800">{patient.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Date of Birth</p>
            <p className="font-semibold text-slate-800">{formattedDob}</p>
          </div>
        </div>
      </div>

      {secondaryList.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Secondary Comorbidities:</span>
          {secondaryList.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200/80 font-medium"
            >
              @{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
