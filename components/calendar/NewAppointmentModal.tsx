'use client';

import React, { useState } from 'react';
import { Patient } from '@/lib/types';
import { createAppointment } from '@/lib/services/appointmentService';
import { X, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSuccess: () => void;
}

export function NewAppointmentModal({ isOpen, onClose, patients, onSuccess }: NewAppointmentModalProps) {
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [sessionType, setSessionType] = useState('Individual CBT');
  
  // Compute default time to next available slot
  const defaultDate = new Date();
  defaultDate.setHours(10, 0, 0, 0); // 10 AM by default today
  
  const [dateStr, setDateStr] = useState(defaultDate.toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('10:00');
  const [duration, setDuration] = useState(50);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const selectedPatient = patients.find((p) => p.id === patientId);
    const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Client Session';
    const scheduledAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();

    const response = await createAppointment({
      patient_id: patientId,
      patient_name: patientName,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      session_type: sessionType,
      notes: notes
    }, 'prac-1');

    setLoading(false);

    if (response.error) {
      setErrorMsg(response.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Schedule Therapy Session</h2>
              <p className="text-xs text-slate-500">Book a clinical appointment for your patient</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.primary_ailment || 'Active Patient'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="Individual CBT">Individual CBT</option>
                <option value="Behavioral Activation">Behavioral Activation</option>
                <option value="Exposure Therapy">Exposure Therapy</option>
                <option value="EMDR Session">EMDR Session</option>
                <option value="Clinical Assessment">Clinical Assessment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value={30}>30 Minutes</option>
                <option value={50}>50 Minutes (Standard)</option>
                <option value={90}>90 Minutes (Extended)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes / Agenda (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Review anxiety exposure ladder homework..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Booking...' : 'Confirm Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
