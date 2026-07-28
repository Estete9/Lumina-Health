import React from 'react';
import { Appointment } from '@/lib/types';
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientAppointmentHistoryProps {
  appointments: Appointment[];
}

export function PatientAppointmentHistory({ appointments }: PatientAppointmentHistoryProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-500 text-sm">No appointment history found for this patient.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Session & Appointment History</h2>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
          {appointments.length} Total Sessions
        </span>
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => {
          const isCompleted = apt.status === 'completed';
          const isCancelled = apt.status === 'cancelled';
          const dateObj = new Date(apt.scheduled_at);

          return (
            <div
              key={apt.id}
              className={cn(
                'p-4 rounded-xl border transition-all flex items-center justify-between',
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : isCancelled
                  ? 'bg-rose-50/30 border-rose-200/60 opacity-75'
                  : 'bg-slate-50 border-slate-200/80'
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-teal-600 shadow-2xs">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {apt.session_type}
                    {apt.telehealth_url && <Video className="w-3.5 h-3.5 text-teal-600" />}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration_minutes} mins)
                    </span>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-slate-500 italic mt-1 font-mono">
                      "{apt.notes}"
                    </p>
                  )}
                </div>
              </div>

              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : isCancelled
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-teal-100 text-teal-800'
                )}
              >
                {apt.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
