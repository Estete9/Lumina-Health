'use server';

import { PractitionerDashboardStats, ServiceResponse } from '../types';
import { getPatients } from './patientService';
import { getAppointments } from './appointmentService';
import { getNotes } from './noteService';

export async function getDashboardStats(practitionerId?: string): Promise<ServiceResponse<PractitionerDashboardStats>> {
  const [patientsRes, appointmentsRes, notesRes] = await Promise.all([
    getPatients(practitionerId),
    getAppointments(practitionerId),
    getNotes(practitionerId)
  ]);

  if (patientsRes.error || appointmentsRes.error || notesRes.error) {
    return { data: null, error: 'Failed to fetch dashboard data' };
  }

  const patients = patientsRes.data || [];
  const appointments = appointmentsRes.data || [];
  const notes = notesRes.data || [];

  const activePatientsCount = patients.filter(p => p.status === 'active').length;
  
  const now = new Date();
  
  // Appointments scheduled for today (comparing local date parts)
  const todayAppointments = appointments.filter(a => {
    if (a.status === 'cancelled') return false;
    const aptDate = new Date(a.scheduled_at);
    return (
      aptDate.getDate() === now.getDate() &&
      aptDate.getMonth() === now.getMonth() &&
      aptDate.getFullYear() === now.getFullYear()
    );
  });

  const upcomingAppointmentsCount = todayAppointments.length;

  // Pending Notes: past or completed appointments that do NOT have a note
  const pastOrCompletedAppointments = appointments.filter(a => {
    return a.status === 'completed' || new Date(a.scheduled_at) < now;
  });

  const pendingNotesCount = pastOrCompletedAppointments.filter(apt => {
    const aptDate = new Date(apt.scheduled_at);
    const aptYear = aptDate.getFullYear();
    const aptMonth = aptDate.getMonth();
    const aptDay = aptDate.getDate();

    const hasNote = notes.some(n => {
      if (!n.session_date) return false;
      
      let noteYear, noteMonth, noteDay;
      
      if (n.session_date.length === 10) {
        // It's a strict YYYY-MM-DD string from the date picker (in-memory)
        const parts = n.session_date.split('-');
        noteYear = parseInt(parts[0], 10);
        noteMonth = parseInt(parts[1], 10) - 1;
        noteDay = parseInt(parts[2], 10);
      } else {
        // It's a full ISO string from Supabase (timestamptz). 
        // Because we insert 'YYYY-MM-DD', Supabase stores it as UTC midnight.
        // We must extract the UTC date components to get the original string back.
        const noteDate = new Date(n.session_date);
        noteYear = noteDate.getUTCFullYear();
        noteMonth = noteDate.getUTCMonth();
        noteDay = noteDate.getUTCDate();
      }

      return (
        n.patient_id === apt.patient_id &&
        noteYear === aptYear &&
        noteMonth === aptMonth &&
        noteDay === aptDay
      );
    });
    return !hasNote;
  }).length;

  // Today's schedule sorted by time ascending (soonest first)
  const recentAppointments = [...todayAppointments]
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  // Recent Notes mapping (Previous Session Notes for Today's Patients)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const uniqueTodayPatientIds = Array.from(new Set(todayAppointments.map(a => a.patient_id)));
  
  const previousNotesList = [];

  for (const patientId of uniqueTodayPatientIds) {
    const patientNotes = notes.filter(n => n.patient_id === patientId);
    
    const pastNotes = patientNotes.filter(n => {
      if (!n.session_date) return false;
      
      let noteYear, noteMonth, noteDay;
      if (n.session_date.length === 10) {
        const parts = n.session_date.split('-');
        noteYear = parseInt(parts[0], 10);
        noteMonth = parseInt(parts[1], 10) - 1;
        noteDay = parseInt(parts[2], 10);
      } else {
        const noteDate = new Date(n.session_date);
        noteYear = noteDate.getUTCFullYear();
        noteMonth = noteDate.getUTCMonth();
        noteDay = noteDate.getUTCDate();
      }

      const noteDateObj = new Date(noteYear, noteMonth, noteDay);
      return noteDateObj.getTime() < startOfToday.getTime();
    });

    pastNotes.sort((a, b) => {
      const dateA = new Date(a.session_date as string).getTime();
      const dateB = new Date(b.session_date as string).getTime();
      return dateB - dateA;
    });

    if (pastNotes.length > 0) {
      previousNotesList.push(pastNotes[0]);
    }
  }

  const recentNotes = previousNotesList.map(note => {
    const patient = patients.find(p => p.id === note.patient_id);
    return {
      ...note,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'
    };
  });

  return {
    data: {
      activePatientsCount,
      upcomingAppointmentsCount,
      notesWrittenThisWeek: pendingNotesCount, // Renamed in metric title, kept the interface key for now
      recentAppointments,
      recentNotes
    },
    error: null
  };
}
