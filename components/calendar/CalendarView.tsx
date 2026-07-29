'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Appointment, Patient, AppointmentStatus } from '@/lib/types';
import { updateAppointmentStatus } from '@/lib/services/appointmentService';
import { NewAppointmentModal } from './NewAppointmentModal';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Plus, CheckCircle, XCircle, Copy, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  initialAppointments: Appointment[];
  patients: Patient[];
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function CalendarView({ initialAppointments, patients }: CalendarViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('new') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);
  
  const currentDate = new Date();
  
  // Calculate start of week (Monday)
  const startOfWeek = useMemo(() => {
    const day = new Date(currentDate);
    const dayOfWeek = day.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    day.setDate(day.getDate() + diffToMonday);
    day.setHours(0, 0, 0, 0);
    return day;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [startOfWeek]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
    const res = await updateAppointmentStatus(id, newStatus);
    if (res.data) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-4">


      {/* Main Calendar View Container */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Week Days Header Row */}
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 sticky top-0 z-10 shrink-0">
          <div className="py-3 px-2 border-r border-slate-200 flex items-center justify-center">Time</div>
          {weekDays.map((day, idx) => {
            const activeToday = isToday(day);
            return (
              <div
                key={idx}
                className={cn(
                  'py-2 px-2 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center',
                  activeToday && 'bg-teal-50/80 text-teal-900'
                )}
              >
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                    activeToday ? 'bg-teal-600 text-white' : 'text-slate-800'
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hourly Grid Slots */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100">
          {HOURS.map((hour) => {
            const formattedHour = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

            return (
              <div key={hour} className="grid grid-cols-8 min-h-[5rem]">
                {/* Time Label Column */}
                <div className="p-2 border-r border-slate-200 text-right text-xs text-slate-400 font-medium bg-slate-50/50">
                  {formattedHour}
                </div>

                {/* 7 Day Columns for this Hour */}
                {weekDays.map((day, dayIdx) => {
                  const cellAppointments = appointments.filter((apt) => {
                    if (apt.status === 'cancelled') return false;
                    const aptDate = new Date(apt.scheduled_at);
                    return (
                      aptDate.getDate() === day.getDate() &&
                      aptDate.getMonth() === day.getMonth() &&
                      aptDate.getFullYear() === day.getFullYear() &&
                      aptDate.getHours() === hour
                    );
                  });

                  return (
                    <div
                      key={dayIdx}
                      className="border-r border-slate-100 last:border-r-0 p-1 relative group hover:bg-slate-50/60 transition-colors"
                    >
                      {cellAppointments.map((apt) => {
                        const isCompleted = apt.status === 'completed';
                        const isCancelled = apt.status === 'cancelled';

                        return (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className={cn(
                              'p-2 mb-1 rounded-lg border text-xs shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md cursor-pointer hover:border-teal-300',
                              apt.status === 'scheduled' && 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100/80',
                              apt.status === 'completed' && 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/80 opacity-75 line-through',
                              apt.status === 'cancelled' && 'bg-rose-50 border-rose-200 text-rose-950 opacity-75 line-through hover:bg-rose-100/80',
                              apt.status === 'no_show' && 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100/80'
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between font-semibold text-slate-900 truncate">
                                <span className="truncate">{apt.patient_name || 'Client Session'}</span>
                                {apt.telehealth_url && <Video className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />}
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                {apt.session_type}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/50">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {apt.duration_minutes}m
                              </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              {!isCancelled && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt.id, isCompleted ? 'scheduled' : 'completed'); }}
                                  className={cn(
                                    "p-1 rounded transition-colors",
                                    isCompleted 
                                      ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200" 
                                      : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                  )}
                                  title={isCompleted ? "Undo Completion" : "Mark Completed"}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!isCancelled && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt.id, 'cancelled'); }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Cancel Session"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Appointment Detail Modal */}
      {selectedAppointment && (() => {
        const previousApt = appointments
          .filter((a) => a.patient_id === selectedAppointment.patient_id && a.status === 'completed' && new Date(a.scheduled_at) < new Date(selectedAppointment.scheduled_at))
          .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0];

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
            onClick={() => setSelectedAppointment(null)}
          >
            <div 
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Session Details</h2>
                    <p className="text-xs text-slate-500">{new Date(selectedAppointment.scheduled_at).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Patient</label>
                  <div className="text-sm font-medium text-slate-900">{selectedAppointment.patient_name}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Session Type</label>
                  <div className="text-sm text-slate-800">{selectedAppointment.session_type}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Duration</label>
                  <div className="text-sm text-slate-800">{selectedAppointment.duration_minutes} minutes</div>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Notes</label>
                    <div className="text-sm text-slate-800">{selectedAppointment.notes}</div>
                  </div>
                )}
                
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Previous Session Notes</label>
                  <div className="text-sm text-slate-700 italic">
                    {previousApt?.notes ? previousApt.notes : "No previous session notes found"}
                  </div>
                </div>
                
                {selectedAppointment.telehealth_url && (
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 block mb-2">Telehealth Session</label>
                    <div className="flex flex-col gap-2">
                      <a
                        href={selectedAppointment.telehealth_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join {selectedAppointment.telehealth_provider === 'meet' ? 'Google Meet' : selectedAppointment.telehealth_provider === 'zoom' ? 'Zoom' : selectedAppointment.telehealth_provider === 'teams' ? 'MS Teams' : 'Video Call'}
                      </a>
                      <button
                        onClick={() => handleCopyLink(selectedAppointment.telehealth_url!)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                      >
                        {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? 'Link Copied!' : 'Copy Meeting Link'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
