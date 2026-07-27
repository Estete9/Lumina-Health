import { createNote, getAllNotes } from '../../lib/services/noteService';
import { createPatient } from '../../lib/services/patientService';

describe('Sprint 5: Clinical Note Creation Unit Tests', () => {
  it('should create structured clinical note with discoveries & homework', async () => {
    const p = await createPatient({ first_name: 'Elena', last_name: 'Rostova' });
    const pId = p.data!.id;

    const noteRes = await createNote({
      patient_id: pId,
      session_date: '2026-07-25',
      discoveries: ['CBT-Insight', 'Anxiety-Trigger'],
      daily_actions: ['Daily 10-minute mindfulness breathing'],
      raw_notes: 'Client showed great progress in identifying cognitive distortions.'
    });

    expect(noteRes.error).toBeNull();
    expect(noteRes.data?.discoveries).toContain('CBT-Insight');
    expect(noteRes.data?.daily_actions).toContain('Daily 10-minute mindfulness breathing');
  });

  it('should fetch practice-wide clinical notes', async () => {
    const allNotes = await getAllNotes();
    expect(allNotes.error).toBeNull();
    expect(Array.isArray(allNotes.data)).toBe(true);
  });
});
