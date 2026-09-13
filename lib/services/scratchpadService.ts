import {
  ScratchpadNote,
  CreateScratchpadInput,
  UpdateScratchpadInput,
  ServiceResponse,
} from '../types';

let mockScratchpadNotes: ScratchpadNote[] = [
  {
    id: 'sp_1',
    practitioner_id: 'prac_123',
    content: 'Follow up with Patient A regarding new medication.',
    category: 'follow_up',
    is_pinned: true,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sp_2',
    practitioner_id: 'prac_123',
    content: 'Review clinical notes for tomorrow\'s sessions.',
    category: 'clinical',
    is_pinned: false,
    is_completed: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  }
];

export async function getScratchpadNotes(practitionerId: string = 'prac_123'): Promise<ServiceResponse<ScratchpadNote[]>> {
  try {
    const notes = mockScratchpadNotes.filter(n => n.practitioner_id === practitionerId);
    // Sort by pinned first, then created_at descending
    notes.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return { data: notes, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createScratchpadNote(
  input: CreateScratchpadInput,
  practitionerId: string = 'prac_123'
): Promise<ServiceResponse<ScratchpadNote>> {
  try {
    const newNote: ScratchpadNote = {
      id: `sp_${Math.random().toString(36).substr(2, 9)}`,
      practitioner_id: practitionerId,
      content: input.content,
      category: input.category,
      is_pinned: input.is_pinned ?? false,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockScratchpadNotes.push(newNote);
    return { data: newNote, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateScratchpadNote(
  id: string,
  updates: UpdateScratchpadInput
): Promise<ServiceResponse<ScratchpadNote>> {
  try {
    const noteIndex = mockScratchpadNotes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      return { data: null, error: 'Note not found' };
    }
    const updatedNote = {
      ...mockScratchpadNotes[noteIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    mockScratchpadNotes[noteIndex] = updatedNote;
    return { data: updatedNote, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function deleteScratchpadNote(id: string): Promise<ServiceResponse<boolean>> {
  try {
    const noteIndex = mockScratchpadNotes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      return { data: null, error: 'Note not found' };
    }
    mockScratchpadNotes.splice(noteIndex, 1);
    return { data: true, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
