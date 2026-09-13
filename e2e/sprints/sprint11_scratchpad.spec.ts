import { test, expect } from '@playwright/test';

test.describe('Sprint 11: Dashboard Quick Notes & Scratchpad Widget E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Practitioner Dashboard' })).toBeVisible();
  });

  test('should render Scratchpad widget with title and category filters', async ({ page }) => {
    // 1. Verify widget header
    const scratchpadHeading = page.getByRole('heading', { name: 'Scratchpad', exact: true });
    await expect(scratchpadHeading).toBeVisible();

    // 2. Verify category filter pills
    const allFilter = page.getByRole('button', { name: 'All', exact: true });
    const clinicalFilter = page.getByRole('button', { name: 'Clinical', exact: true });
    const adminFilter = page.getByRole('button', { name: 'Admin', exact: true });
    const followUpFilter = page.getByRole('button', { name: 'Follow-up', exact: true });
    const supervisionFilter = page.getByRole('button', { name: 'Supervision', exact: true });

    await expect(allFilter).toBeVisible();
    await expect(clinicalFilter).toBeVisible();
    await expect(adminFilter).toBeVisible();
    await expect(followUpFilter).toBeVisible();
    await expect(supervisionFilter).toBeVisible();

    // 3. Verify textarea and add button exist
    const textarea = page.getByPlaceholder('Jot down a quick note...');
    await expect(textarea).toBeVisible();
    const addBtn = page.getByRole('button', { name: /Add Note/i });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeDisabled();
  });

  test('should filter notes by category correctly', async ({ page }) => {
    // Click 'Follow-up' filter
    const followUpFilter = page.getByRole('button', { name: 'Follow-up', exact: true });
    await followUpFilter.click();

    // Should display follow-up note (mock contains 'Follow up with Patient A regarding new medication.')
    await expect(page.getByText('Follow up with Patient A regarding new medication.')).toBeVisible();

    // Click 'Supervision' filter (which might be empty initially)
    const supervisionFilter = page.getByRole('button', { name: 'Supervision', exact: true });
    await supervisionFilter.click();

    // Notes for clinical/follow_up should not be visible in supervision view
    await expect(page.getByText('Follow up with Patient A regarding new medication.')).not.toBeVisible();

    // Return to 'All' filter
    const allFilter = page.getByRole('button', { name: 'All', exact: true });
    await allFilter.click();
    await expect(page.getByText('Follow up with Patient A regarding new medication.')).toBeVisible();
  });

  test('should create a new quick note with content and category', async ({ page }) => {
    const uniqueNoteText = `Supervision discussion item ${Date.now()}`;
    const textarea = page.getByPlaceholder('Jot down a quick note...');
    
    // Type note content
    await textarea.fill(uniqueNoteText);

    // Select category 'supervision'
    const categorySelect = page.locator('select').filter({ hasText: /Clinical/i });
    await categorySelect.selectOption('supervision');

    // Click Add Note button
    const addBtn = page.getByRole('button', { name: /Add Note/i });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    // Verify textarea is cleared
    await expect(textarea).toHaveValue('');

    // Verify note is rendered in the list
    const newNote = page.getByText(uniqueNoteText);
    await expect(newNote).toBeVisible();

    // Filter by Supervision to ensure correct category was assigned
    const supervisionFilter = page.getByRole('button', { name: 'Supervision', exact: true });
    await supervisionFilter.click();
    await expect(page.getByText(uniqueNoteText)).toBeVisible();
  });

  test('should toggle completion on a note', async ({ page }) => {
    const noteText = `Task completion test note ${Date.now()}`;
    const textarea = page.getByPlaceholder('Jot down a quick note...');
    await textarea.fill(noteText);
    await page.getByRole('button', { name: /Add Note/i }).click();

    // Locate note container
    const noteParagraph = page.getByText(noteText);
    await expect(noteParagraph).toBeVisible();
    const noteCard = page.locator('div.group', { hasText: noteText }).first();

    // Check that note text does NOT initially have line-through
    await expect(noteParagraph).not.toHaveClass(/line-through/);

    // Toggle complete
    const toggleCompleteBtn = noteCard.locator('button').first();
    await toggleCompleteBtn.click();

    // Verify note text now has line-through style
    await expect(noteParagraph).toHaveClass(/line-through/);

    // Toggle again to uncomplete
    await toggleCompleteBtn.click();
    await expect(noteParagraph).not.toHaveClass(/line-through/);
  });

  test('should toggle pin status on a note', async ({ page }) => {
    const noteText = `Pin test note ${Date.now()}`;
    const textarea = page.getByPlaceholder('Jot down a quick note...');
    await textarea.fill(noteText);
    await page.getByRole('button', { name: /Add Note/i }).click();

    const noteParagraph = page.getByText(noteText);
    await expect(noteParagraph).toBeVisible();

    const noteCard = page.locator('div.group', { hasText: noteText }).first();
    await noteCard.hover();

    // Find the pin button
    const pinBtn = noteCard.locator('button[title="Pin note"], button[title="Unpin note"]');
    await expect(pinBtn).toBeAttached();

    // Toggle pin
    await pinBtn.click({ force: true });

    // Verify pinned state changed (title should be "Unpin note")
    await expect(noteCard.locator('button[title="Unpin note"]')).toBeAttached();

    // Toggle unpin
    const unpinBtn = noteCard.locator('button[title="Unpin note"]');
    await unpinBtn.click({ force: true });
    await expect(noteCard.locator('button[title="Pin note"]')).toBeAttached();
  });

  test('should delete a note', async ({ page }) => {
    const noteToDelete = `Delete test note ${Date.now()}`;
    const textarea = page.getByPlaceholder('Jot down a quick note...');
    await textarea.fill(noteToDelete);
    await page.getByRole('button', { name: /Add Note/i }).click();

    // Ensure note is visible
    await expect(page.getByText(noteToDelete)).toBeVisible();

    const noteCard = page.locator('div.group', { hasText: noteToDelete }).first();
    await noteCard.hover();

    // Click delete button
    const deleteBtn = noteCard.locator('button[title="Delete note"]');
    await deleteBtn.click({ force: true });

    // Verify note is no longer in the DOM
    await expect(page.getByText(noteToDelete)).not.toBeVisible();
  });
});
