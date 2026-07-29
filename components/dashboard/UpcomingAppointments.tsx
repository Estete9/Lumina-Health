'use client';

import { Appointment, AppointmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Video } from 'lucide-react';
import { useState } from 'react';
import { SessionDetailsModal } from '../calendar/SessionDetailsModal';
import { updateAppointmentStatus } from '@/lib/services/appointmentService';

export function UpcomingAppointments({ appointments }: { appointments: Appointment[] }) {
  const router = useRouter();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const activeAppointments = appointments.filter(apt => apt.status !== 'cancelled');

  const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
    const res = await updateAppointmentStatus(id, newStatus);
    if (res.data) {
      window.location.reload();
    }
  };

  return (
    <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Appointment Schedule</h2>
      <div className="space-y-3">
        {activeAppointments.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
        ) : (
          activeAppointments.map((apt) => {
            const isCompleted = apt.status === 'completed';
            const date = new Date(apt.scheduled_at);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={apt.id} 
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3.5 shadow-2xs group"
              >
                <div>
                  <p className={cn("font-medium", isCompleted ? "opacity-75 line-through text-slate-800" : "text-slate-800")}>
                    <button 
                      onClick={() => setSelectedAppointment(apt)}
                      className="underline decoration-teal-300 text-teal-700 hover:text-teal-800 hover:decoration-teal-500 transition-colors cursor-pointer focus:outline-none"
                    >
                      Session
                    </button>
                    <span className="text-slate-600 font-normal">{' '}with{' '}</span>
                    <button 
                      onClick={() => router.push(`/patients/${apt.patient_id}`)}
                      className="underline decoration-teal-300 text-teal-700 hover:text-teal-800 hover:decoration-teal-500 transition-colors cursor-pointer focus:outline-none"
                    >
                      {apt.patient_name || 'Unknown Patient'}
                    </button>
                  </p>
                  <p className={cn("text-xs text-slate-500", isCompleted && "opacity-75 line-through")}>
                    {apt.session_type} • {timeString} ({apt.duration_minutes} min)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {apt.telehealth_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(apt.telehealth_url!, '_blank');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Call
                    </button>
                  )}
                  {apt.status !== 'scheduled' && (
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
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <SessionDetailsModal
        selectedAppointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointments={appointments}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
