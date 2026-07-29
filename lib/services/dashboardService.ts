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
  const upcomingAppointmentsCount = appointments.filter(a => new Date(a.scheduled_at) > now).length;

  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  const notesWrittenThisWeek = notes.filter(n => new Date(n.created_at) > weekAgo).length;

  const recentPatients = [...patients].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentAppointments = [...appointments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return {
    data: {
      activePatientsCount,
      upcomingAppointmentsCount,
      notesWrittenThisWeek,
      recentAppointments,
      recentPatients
    },
    error: null
  };
}
