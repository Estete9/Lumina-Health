import { Patient, Appointment, ClinicalNote, PractitionerDashboardStats } from '../types';

function getRelativeDateISO(offsetDays: number, hour: number = 9, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p-101',
    practitioner_id: 'prac-1',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 234-5678',
    date_of_birth: '1990-04-12',
    gender: 'Female',
    status: 'active',
    primary_ailment: 'Generalized Anxiety Disorder',
    notes_summary: 'Showing steady progress with CBT mindfulness exercises. Sleep schedule improved.',
    created_at: getRelativeDateISO(-180),
    updated_at: getRelativeDateISO(-2)
  },
  {
    id: 'p-102',
    practitioner_id: 'prac-1',
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 876-5432',
    date_of_birth: '1985-11-03',
    gender: 'Male',
    status: 'active',
    primary_ailment: 'Major Depressive Disorder (Mild)',
    notes_summary: 'Reported low motivation during work hours. Assigned behavioral activation tracking sheet.',
    created_at: getRelativeDateISO(-120),
    updated_at: getRelativeDateISO(-4)
  },
  {
    id: 'p-103',
    practitioner_id: 'prac-1',
    first_name: 'Sophia',
    last_name: 'Chen',
    email: 'sophia.chen@example.com',
    phone: '+1 (555) 345-6789',
    date_of_birth: '1998-07-25',
    gender: 'Female',
    status: 'active',
    primary_ailment: 'Social Anxiety & Adjustment',
    notes_summary: 'Working on exposure ladder for workplace team presentations.',
    created_at: getRelativeDateISO(-90),
    updated_at: getRelativeDateISO(-1)
  },
  {
    id: 'p-104',
    practitioner_id: 'prac-1',
    first_name: 'David',
    last_name: 'Miller',
    email: 'david.miller@example.com',
    phone: '+1 (555) 901-2345',
    date_of_birth: '1979-02-19',
    gender: 'Male',
    status: 'inactive',
    primary_ailment: 'Post-Traumatic Stress Disorder',
    notes_summary: 'Completed 12-session EMDR therapy sequence. On maintenance hiatus.',
    created_at: getRelativeDateISO(-200),
    updated_at: getRelativeDateISO(-30)
  },
  {
    id: 'p-105',
    practitioner_id: 'prac-1',
    first_name: 'Juan',
    last_name: 'Perez',
    email: 'juan.perez@example.com',
    phone: '+1 (555) 555-5555',
    date_of_birth: '1995-04-12',
    gender: 'Male',
    status: 'active',
    primary_ailment: 'Generalized Anxiety Disorder',
    notes_summary: 'Showing steady progress with CBT mindfulness exercises. Sleep schedule improved.',
    created_at: getRelativeDateISO(-5),
    updated_at: getRelativeDateISO(0)
  },
  {
    id: 'p-106',
    practitioner_id: 'prac-1',
    first_name: 'Rachel',
    last_name: 'Green',
    email: 'rachel.green@example.com',
    phone: '+1 (555) 432-1098',
    date_of_birth: '1992-09-15',
    gender: 'Female',
    status: 'completed',
    primary_ailment: 'Panic Disorder',
    notes_summary: 'Therapy goals achieved. Completed 16 CBT exposure sessions successfully. Discharge filed.',
    created_at: getRelativeDateISO(-250),
    updated_at: getRelativeDateISO(-10)
  },
  {
    id: 'p-107',
    practitioner_id: 'prac-1',
    first_name: 'Arthur',
    last_name: 'Pendelton',
    email: 'arthur.pendelton@example.com',
    phone: '+1 (555) 789-0123',
    date_of_birth: '1970-12-01',
    gender: 'Male',
    status: 'archived',
    primary_ailment: 'Generalized Anxiety Disorder',
    notes_summary: 'Patient record archived following out-of-state relocation.',
    created_at: getRelativeDateISO(-400),
    updated_at: getRelativeDateISO(-90)
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patient_id: 'p-101',
    practitioner_id: 'prac-1',
    patient_name: 'Elena Rostova',
    scheduled_at: getRelativeDateISO(0, 9, 0), // Today 09:00 AM
    duration_minutes: 50,
    status: 'scheduled',
    session_type: 'Individual CBT',
    notes: 'Focus on panic trigger exposure homework review.',
    telehealth_url: 'https://meet.google.com/lum-health-elena',
    telehealth_provider: 'meet',
    created_at: getRelativeDateISO(-2)
  },
  {
    id: 'apt-2',
    patient_id: 'p-102',
    practitioner_id: 'prac-1',
    patient_name: 'Marcus Vance',
    scheduled_at: getRelativeDateISO(0, 11, 0), // Today 11:00 AM
    duration_minutes: 50,
    status: 'scheduled',
    session_type: 'Behavioral Activation',
    notes: 'Review weekly activity schedule compliance.',
    telehealth_url: 'https://zoom.us/j/9876543210',
    telehealth_provider: 'zoom',
    created_at: getRelativeDateISO(-2)
  },
  {
    id: 'apt-3',
    patient_id: 'p-103',
    practitioner_id: 'prac-1',
    patient_name: 'Sophia Chen',
    scheduled_at: getRelativeDateISO(0, 14, 0), // Today 02:00 PM
    duration_minutes: 50,
    status: 'scheduled',
    session_type: 'Social Anxiety Exposure',
    notes: 'Roleplay workplace presentation Q&A.',
    created_at: '2026-07-21T09:00:00Z'
  },
  {
    id: 'apt-4',
    patient_id: 'p-104',
    practitioner_id: 'prac-1',
    patient_name: 'David Miller',
    scheduled_at: getRelativeDateISO(0, 16, 0), // Today 04:00 PM
    duration_minutes: 50,
    status: 'scheduled',
    session_type: 'Clinical Assessment',
    notes: 'Quarterly therapy check-in.',
    created_at: getRelativeDateISO(-1)
  },
  {
    id: 'apt-5',
    patient_id: 'p-101',
    practitioner_id: 'prac-1',
    patient_name: 'Elena Rostova',
    scheduled_at: getRelativeDateISO(-1, 10, 0), // Yesterday 10:00 AM
    duration_minutes: 50,
    status: 'completed',
    session_type: 'Individual CBT',
    notes: 'Completed session successfully.',
    created_at: getRelativeDateISO(-3)
  },
  {
    id: 'apt-6',
    patient_id: 'p-103',
    practitioner_id: 'prac-1',
    patient_name: 'Sophia Chen',
    scheduled_at: getRelativeDateISO(1, 10, 0), // Tomorrow 10:00 AM
    duration_minutes: 50,
    status: 'scheduled',
    session_type: 'Follow-Up Exposure',
    notes: 'Workplace presentation reflection.',
    created_at: getRelativeDateISO(0)
  },
  {
    id: 'apt-7',
    patient_id: 'p-105',
    practitioner_id: 'prac-1',
    patient_name: 'Juan Perez',
    scheduled_at: getRelativeDateISO(0, 10, 0), // Today 10:00 AM
    duration_minutes: 50,
    status: 'scheduled',
    session_type: 'Individual CBT',
    notes: 'Focus on panic trigger exposure homework review.',
    created_at: getRelativeDateISO(-2)
  },
];

export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: 'note-101',
    patient_id: 'p-101',
    practitioner_id: 'prac-1',
    session_date: getRelativeDateISO(-1, 10, 0),
    discoveries: ['Identified automatic thoughts triggering nocturnal panic attacks', 'Sleep hygiene disruption linked to late work emails'],
    daily_actions: ['Practice 4-7-8 breathing 10 mins before bed', 'Turn off work notifications after 8 PM'],
    ailments: ['Panic Disorder symptoms', 'Nocturnal Anxiety'],
    raw_notes: 'Elena reported two panic episodes over the weekend. We worked through cognitive restructuring of catastrophic thoughts regarding work deadlines.',
    created_at: getRelativeDateISO(-1, 11, 0),
    updated_at: getRelativeDateISO(-1, 11, 0)
  },
  {
    id: 'note-102',
    patient_id: 'p-101',
    practitioner_id: 'prac-1',
    session_date: getRelativeDateISO(-7, 10, 0),
    discoveries: ['Physical tension in shoulders precedes anxious arousal by 15 mins'],
    daily_actions: ['Complete progressive muscle relaxation log daily'],
    ailments: ['Somatic Anxiety Tension'],
    raw_notes: 'Reviewed body awareness scan. Client is gaining insight into early physiological signals.',
    created_at: getRelativeDateISO(-7, 11, 0),
    updated_at: getRelativeDateISO(-7, 11, 0)
  },
  {
    id: 'note-103',
    patient_id: 'p-102',
    practitioner_id: 'prac-1',
    session_date: getRelativeDateISO(-4, 11, 0),
    discoveries: ['Low mood correlates strongly with social isolation during weekends'],
    daily_actions: ['Schedule at least one social coffee or walk on Saturday'],
    ailments: ['Mild Depressive Episode', 'Social Isolation'],
    raw_notes: 'Marcus discussed feeling detached from peers. Introduced behavioral activation tracking matrix.',
    created_at: getRelativeDateISO(-4, 12, 0),
    updated_at: getRelativeDateISO(-4, 12, 0)
  },
  {
    id: 'note-104',
    patient_id: 'p-103',
    practitioner_id: 'prac-1',
    session_date: getRelativeDateISO(-2, 14, 0),
    discoveries: ['Catastrophizing audience reaction during team Q&A sessions'],
    daily_actions: ['Ask 1 question in Monday morning standup meeting'],
    ailments: ['Social Evaluation Phobia'],
    raw_notes: 'Roleplayed Q&A scenario. Sophia successfully rated anxiety reduction from 8/10 to 4/10 after 3 repetitions.',
    created_at: getRelativeDateISO(-2, 15, 0),
    updated_at: getRelativeDateISO(-2, 15, 0)
  }
];

export function getDashboardStatsData(): PractitionerDashboardStats {
  const today = new Date();
  const todayAppointments = MOCK_APPOINTMENTS.filter((a) => {
    const aptDate = new Date(a.scheduled_at);
    return isSameDay(aptDate, today);
  });

  return {
    activePatientsCount: MOCK_PATIENTS.filter((p) => p.status === 'active').length,
    upcomingAppointmentsCount: todayAppointments.length,
    notesWrittenThisWeek: 18,
    recentAppointments: todayAppointments,
    recentNotes: MOCK_CLINICAL_NOTES.filter((p) => p.practitioner_id === 'prac-1').map(note => {
      const p = MOCK_PATIENTS.find(pat => pat.id === note.patient_id);
      return { ...note, patient_name: p ? `${p.first_name} ${p.last_name}` : 'Unknown Patient' };
    })
  };
}
