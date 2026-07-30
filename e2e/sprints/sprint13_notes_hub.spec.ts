import { test, expect } from '@playwright/test';

test.describe('Sprint 13: Clinical Notes Hub Overhaul E2E', () => {
  test('should render Split-Pane Master-Detail layout with sidebar and timeline', async ({ page }) => {
    // 1. Navigate to Clinical Notes Hub page
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');

    // 2. Verify Search Input in Sidebar
    const searchInput = page.locator('input[placeholder="Search patients..."]');
    await expect(searchInput).toBeVisible();

    // 3. Verify initial state before patient selection (shows placeholder message)
    await expect(page.locator('body')).toContainText(/Select a patient from the sidebar/i);

    // 4. Click a patient from the sidebar list
    const patientButton = page.locator('div.flex-1.overflow-y-auto button').first();
    
    if (await patientButton.isVisible()) {
      await patientButton.click();
      await page.waitForTimeout(300);

      // 5. Verify timeline on main stage renders for selected patient
      await expect(page.locator('body')).toContainText(/Clinical History/i);

      // 6. Check for Create Note button and click it
      const createNoteBtn = page.locator('button', { hasText: /Create Note for Today's Session|Create Note for Today|Create first note/i }).first();
      
      if (await createNoteBtn.isVisible()) {
        await createNoteBtn.click();
        await page.waitForTimeout(300);

        // 7. Verify modal opens with structured clinical note form
        await expect(page.locator('body')).toContainText(/Add Structured Clinical Note/i);

        // Close modal
        const cancelBtn = page.locator('button', { hasText: /Cancel/i }).first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
    }
  });

  test('should filter patients in sidebar by search query', async ({ page }) => {
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder="Search patients..."]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('NonExistentPatientXYZ99');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toContainText(/No patients found/i);

    await searchInput.fill('');
    await page.waitForTimeout(300);
  });
});
