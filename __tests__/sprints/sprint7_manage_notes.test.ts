import { createNote, updateNote, deleteNote, getNotesByPatientId } from '../../lib/services/noteService';
import { createPatient } from '../../lib/services/patientService';

describe('Sprint 7: Clinical Note Editing & Management Unit Tests', () => {
  it('should update existing clinical note contents', async () => {
    const p = await createPatient({ first_name: 'Arthur', last_name: 'Dent', primary_ailment: 'Generalized Anxiety Disorder' });
    const n = await createNote({ patient_id: p.data!.id, session_date: '2026-07-27', raw_notes: 'Initial session' });
    
    const updated = await updateNote(n.data!.id, { raw_notes: 'Updated progress notes' });
    expect(updated.error).toBeNull();
    expect(updated.data?.raw_notes).toBe('Updated progress notes');
  });

  it('should soft/hard delete note and exclude it from patient notes history', async () => {
    const p = await createPatient({ first_name: 'Ford', last_name: 'Prefect', primary_ailment: 'Generalized Anxiety Disorder' });
    const n = await createNote({ patient_id: p.data!.id, session_date: '2026-07-27', raw_notes: 'To be erased' });

    const noteId = n.data!.id;
    const deleteRes = await deleteNote(noteId);
    expect(deleteRes.error).toBeNull();

    const fetchedNotes = await getNotesByPatientId(p.data!.id);
    expect(fetchedNotes.data?.some(note => note.id === noteId)).toBe(false);
  });
});
