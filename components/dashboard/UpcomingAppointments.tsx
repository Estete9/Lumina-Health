'use client';

import { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function UpcomingAppointments({ appointments }: { appointments: Appointment[] }) {
  const router = useRouter();

  return (
    <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Appointment Schedule</h2>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
        ) : (
          appointments.map((apt) => {
            const isCompleted = apt.status === 'completed';
            const date = new Date(apt.scheduled_at);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={apt.id} 
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3.5 hover:bg-teal-50/50 hover:border-teal-300 cursor-pointer transition-all shadow-2xs group"
                onClick={() => router.push(`/patients/${apt.patient_id}`)}
              >
                <div>
                  <p className="font-medium text-slate-800">Session with {apt.patient_name || 'Unknown Patient'}</p>
                  <p className="text-xs text-slate-500">
                    {apt.session_type} • {timeString} ({apt.duration_minutes} min)
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-teal-100 text-teal-800'
                  )}
                >
                  {apt.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
