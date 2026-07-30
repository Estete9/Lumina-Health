'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Appointment, Patient, AppointmentStatus } from '@/lib/types';
import { updateAppointmentStatus } from '@/lib/services/appointmentService';
import { NewAppointmentModal } from './NewAppointmentModal';
import { SessionDetailsModal } from './SessionDetailsModal';
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
  const [defaultBookingDate, setDefaultBookingDate] = useState<Date | undefined>(undefined);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hoveredAptId, setHoveredAptId] = useState<string | null>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredAptId(id);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredAptId(null);
  };

  useEffect(() => {
    if (searchParams?.get('new') === 'true') {
      setIsModalOpen(true);
      // Strip ?new=true from the URL so it doesn't reopen on refresh
      router.replace('/calendar');
    }
  }, [searchParams, router]);
  
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

  const handleGridClick = (day: Date, hour: number) => {
    const bookingDate = new Date(day);
    bookingDate.setHours(hour, 0, 0, 0);
    const clickMs = bookingDate.getTime();
    
    // Check if there's already an active appointment overlapping this hour slot
    // We assume a default 50-minute slot for the click check
    const clickEnd = clickMs + (50 * 60000);
    
    const isOccupied = appointments.some(apt => {
      if (apt.status === 'cancelled') return false;
      const aptStart = new Date(apt.scheduled_at).getTime();
      const aptEnd = aptStart + (apt.duration_minutes * 60000);
      return clickMs < aptEnd && clickEnd > aptStart;
    });

    if (isOccupied) return;

    setDefaultBookingDate(bookingDate);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">


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
        <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-200">
          {HOURS.map((hour) => {
            const formattedHour = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

            return (
              <div key={hour} className="grid grid-cols-8 h-[5.5rem] hover:bg-slate-50/40 transition-colors group">
                {/* Time Label Column */}
                <div className="p-2 border-r border-slate-200 text-right text-xs text-slate-500 font-semibold bg-slate-50/80 flex flex-col justify-start">
                  <span className="mt-[-8px] bg-slate-50/80 px-1 rounded">{formattedHour}</span>
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
                      className="border-r border-slate-200 last:border-r-0 p-1.5 relative transition-colors cursor-pointer hover:bg-slate-100/50"
                      onClick={() => handleGridClick(day, hour)}
                    >
                      {cellAppointments.map((apt) => {
                        const isCompleted = apt.status === 'completed';
                        const isCancelled = apt.status === 'cancelled';
                        const aptDate = new Date(apt.scheduled_at);
                        
                        // Calculate position
                        const topPercentage = (aptDate.getMinutes() / 60) * 100;
                        const heightPercentage = (apt.duration_minutes / 60) * 100;

                        const isHoverExpanded = hoveredAptId === apt.id;

                        return (
                          <div
                            key={apt.id}
                            onMouseEnter={() => handleMouseEnter(apt.id)}
                            onMouseLeave={handleMouseLeave}
                            onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                            style={{
                              top: `${topPercentage}%`,
                              minHeight: `max(40px, calc(${heightPercentage}% - 4px))`,
                              maxHeight: isHoverExpanded ? '500px' : `max(40px, calc(${heightPercentage}% - 4px))`
                            }}
                            className={cn(
                              'absolute left-1 right-1 p-2 rounded-lg border text-xs shadow-sm flex flex-col justify-between transition-all duration-300 ease-in-out cursor-pointer overflow-hidden',
                              isHoverExpanded ? 'z-50 shadow-lg border-teal-300' : 'z-10',
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

                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-auto pt-1 border-t border-slate-200/50 shrink-0">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {apt.duration_minutes}m
                              </span>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-1">
                                {!isCancelled && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt.id, isCompleted ? 'scheduled' : 'completed'); }}
                                    className={cn(
                                      "p-0.5 rounded transition-colors",
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
                                    className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="Cancel Session"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
        onClose={() => {
          setIsModalOpen(false);
          setDefaultBookingDate(undefined);
        }}
        defaultDate={defaultBookingDate}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Appointment Detail Modal */}
      <SessionDetailsModal
        selectedAppointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointments={appointments}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
