import React from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { getAppointments } from '@/lib/services/appointmentService';
import { getPatients } from '@/lib/services/patientService';
import { ShieldAlert } from 'lucide-react';

export default async function CalendarPage() {
  // Strict UI Abstraction: Call data via service layer
  const { data: appointments, error: aptError } = await getAppointments();
  const { data: patients, error: patError } = await getPatients();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {(aptError || patError) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Notice: {aptError || patError}</span>
        </div>
      )}

      <CalendarView
        initialAppointments={appointments || []}
        patients={patients || []}
      />
    </div>
  );
}
