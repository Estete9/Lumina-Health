import {
  getScratchpadNotes,
  createScratchpadNote,
  updateScratchpadNote,
  deleteScratchpadNote
} from '../../lib/services/scratchpadService';

describe('Sprint 11: Scratchpad Service', () => {
  it('should retrieve scratchpad notes and sort pinned first', async () => {
    const res = await getScratchpadNotes('prac_123');
    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data!.length).toBeGreaterThan(0);
    // sp_1 is pinned, sp_2 is not, so sp_1 should be first
    expect(res.data![0].is_pinned).toBe(true);
  });

  it('should create a new scratchpad note', async () => {
    const newNote = {
      content: 'Test Note',
      category: 'admin' as const,
      is_pinned: false
    };
    const res = await createScratchpadNote(newNote, 'prac_123');
    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data!.content).toBe('Test Note');
    expect(res.data!.category).toBe('admin');
    expect(res.data!.is_pinned).toBe(false);
    expect(res.data!.is_completed).toBe(false);
  });

  it('should update an existing scratchpad note', async () => {
    // create one first
    const createRes = await createScratchpadNote({ content: 'To be updated' }, 'prac_123');
    const noteId = createRes.data!.id;

    const updateRes = await updateScratchpadNote(noteId, { content: 'Updated Note', is_completed: true });
    expect(updateRes.error).toBeNull();
    expect(updateRes.data).toBeDefined();
    expect(updateRes.data!.content).toBe('Updated Note');
    expect(updateRes.data!.is_completed).toBe(true);
  });

  it('should delete a scratchpad note', async () => {
    // create one first
    const createRes = await createScratchpadNote({ content: 'To be deleted' }, 'prac_123');
    const noteId = createRes.data!.id;

    const deleteRes = await deleteScratchpadNote(noteId);
    expect(deleteRes.error).toBeNull();
    expect(deleteRes.data).toBe(true);

    // try to get it, it should not be in the list
    const getRes = await getScratchpadNotes('prac_123');
    const found = getRes.data!.find(n => n.id === noteId);
    expect(found).toBeUndefined();
  });

  it('should return error when updating non-existent note', async () => {
    const res = await updateScratchpadNote('non-existent-id', { content: 'fail' });
    expect(res.error).toBe('Note not found');
    expect(res.data).toBeNull();
  });

  it('should return error when deleting non-existent note', async () => {
    const res = await deleteScratchpadNote('non-existent-id');
    expect(res.error).toBe('Note not found');
    expect(res.data).toBeNull();
  });
});
