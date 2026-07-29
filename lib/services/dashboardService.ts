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
  
  // Date boundaries for "Today" (local time string comparison is easiest since we store ISODate strings)
  const todayStr = now.toISOString().split('T')[0];

  // Appointments scheduled for today
  const todayAppointments = appointments.filter(a => {
    return a.scheduled_at.startsWith(todayStr) && a.status !== 'cancelled';
  });

  const upcomingAppointmentsCount = todayAppointments.length;

  // Pending Notes: past or completed appointments that do NOT have a note
  const pastOrCompletedAppointments = appointments.filter(a => {
    return a.status === 'completed' || new Date(a.scheduled_at) < now;
  });

  const pendingNotesCount = pastOrCompletedAppointments.filter(apt => {
    const hasNote = notes.some(n => 
      n.patient_id === apt.patient_id && 
      n.session_date && 
      n.session_date.split('T')[0] === apt.scheduled_at.split('T')[0]
    );
    return !hasNote;
  }).length;

  // Today's schedule sorted by time ascending (soonest first)
  const recentAppointments = [...todayAppointments]
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  // Recent Notes mapping
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(note => {
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
