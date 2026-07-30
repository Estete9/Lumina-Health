'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Patient, Appointment } from '@/lib/types';
import { createAppointment, getAppointments } from '@/lib/services/appointmentService';
import { getPatients } from '@/lib/services/patientService';
import { X, Calendar as CalendarIcon, CheckCircle2, Video } from 'lucide-react';
import { TelehealthProvider } from '@/lib/types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients?: Patient[];
  appointments?: Appointment[];
  defaultDate?: Date;
  onSuccess: () => void;
}

export function NewAppointmentModal({ isOpen, onClose, patients = [], appointments = [], defaultDate, onSuccess }: NewAppointmentModalProps) {
  const [internalPatients, setInternalPatients] = useState<Patient[]>([]);
  const [internalAppointments, setInternalAppointments] = useState<Appointment[]>([]);
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [sessionType, setSessionType] = useState('Individual CBT');
  
  // Compute initial time based on defaultDate prop or fallback
  const initialDate = defaultDate || new Date();
  if (!defaultDate) {
    initialDate.setHours(10, 0, 0, 0); // 10 AM by default today if no slot clicked
  }
  
  const [dateStr, setDateStr] = useState(initialDate.toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState(initialDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [duration, setDuration] = useState(50);
  const [notes, setNotes] = useState('');
  const [enableTelehealth, setEnableTelehealth] = useState(false);
  const [telehealthProvider, setTelehealthProvider] = useState<TelehealthProvider>('meet');
  const [telehealthUrl, setTelehealthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const [pRes, aRes] = await Promise.all([getPatients(), getAppointments()]);
        if (pRes.data) {
          const patientsData = pRes.data;
          setInternalPatients(patientsData);
          setPatientId((prev) => prev || (patientsData[0]?.id || ''));
        }
        if (aRes.data) {
          setInternalAppointments(aRes.data);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // React to prop changes if modal opens with a new defaultDate
  React.useEffect(() => {
    if (isOpen && defaultDate) {
      setDateStr(defaultDate.toISOString().split('T')[0]);
      setTimeStr(defaultDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }
  }, [isOpen, defaultDate]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const selectedPatient = internalPatients.find((p) => p.id === patientId);
    const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Client Session';
    const scheduledAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
    const scheduledTime = new Date(`${dateStr}T${timeStr}:00`).getTime();

    // Check for conflicts
    const hasConflict = internalAppointments.some(apt => {
      if (apt.status === 'cancelled') return false;
      const aptTime = new Date(apt.scheduled_at).getTime();
      const aptEnd = aptTime + (apt.duration_minutes * 60000);
      const newEnd = scheduledTime + (duration * 60000);
      
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return scheduledTime < aptEnd && newEnd > aptTime;
    });

    if (hasConflict) {
      setLoading(false);
      setErrorMsg('Warning: This time slot is already booked for another session.');
      return;
    }

    const response = await createAppointment({
      patient_id: patientId,
      patient_name: patientName,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      session_type: sessionType,
      notes: notes,
      telehealth_url: enableTelehealth && telehealthUrl ? telehealthUrl : undefined,
      telehealth_provider: enableTelehealth ? telehealthProvider : undefined,
    });

    setLoading(false);

    if (response.error) {
      setErrorMsg(response.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white text-slate-600 hover:text-slate-900 shadow-md border border-slate-200 transition-all z-50 hover:scale-105" title="Close modal"><X className="w-5 h-5" /></button>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
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
              {internalPatients.map((p) => (
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

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-slate-500" />
                <label className="text-sm font-semibold text-slate-800">Enable Telehealth Video Link</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableTelehealth}
                  onChange={(e) => setEnableTelehealth(e.target.checked)}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
            
            {enableTelehealth && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provider</label>
                  <select
                    value={telehealthProvider}
                    onChange={(e) => setTelehealthProvider(e.target.value as TelehealthProvider)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">MS Teams</option>
                    <option value="custom">Custom Link</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting URL</label>
                  <input
                    type="url"
                    value={telehealthUrl}
                    onChange={(e) => setTelehealthUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                    required={enableTelehealth}
                  />
                </div>
              </div>
            )}
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
              <span>{loading ? 'Booking...' : 'Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
