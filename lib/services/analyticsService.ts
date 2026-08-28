import { PractitionerAnalytics, ServiceResponse } from '../types';
import { handleServiceResponse } from './baseService';
import { getPatients } from './patientService';
import { getAppointments } from './appointmentService';
import { getNotes } from './noteService';

export async function getPractitionerAnalytics(
  practitionerId?: string
): Promise<ServiceResponse<PractitionerAnalytics>> {
  try {
    const [patientsRes, apptsRes, notesRes] = await Promise.all([
      getPatients(practitionerId),
      getAppointments(practitionerId),
      getNotes(practitionerId)
    ]);

    const patients = patientsRes.data || [];
    const appointments = apptsRes.data || [];
    const notes = notesRes.data || [];

    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    
    const totalSessionsCompleted = appointments.filter(a => a.status === 'completed').length;
    
    const totalNotesCount = notes.length;

    const analytics: PractitionerAnalytics = {
      practitionerId: practitionerId || 'prac-1',
      totalPatients,
      activePatients,
      totalSessionsCompleted,
      totalNotesCount,
      lastUpdated: new Date().toISOString()
    };

    return handleServiceResponse<PractitionerAnalytics>(analytics, null);
  } catch (error) {
    return handleServiceResponse<PractitionerAnalytics>(
      null, 
      error instanceof Error ? error.message : 'Failed to generate analytics'
    );
  }
}
