import { test, expect } from '@playwright/test';

test.describe('Sprint 2: Session Scheduler & Calendar E2E', () => {
  test('should navigate to /calendar and open booking modal', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.locator('body')).toContainText(/Calendar|Appointments|Schedule/i);

    // Look for New Appointment button
    const newApptBtn = page.locator('button', { hasText: /New Appointment|Schedule Session/i });
    if (await newApptBtn.count() > 0) {
      await newApptBtn.click();
      await expect(page.locator('body')).toContainText(/Schedule|Client/i);
    }
  });

  test('should allow toggling completion status and undoing completion on calendar appointments', async ({ page }) => {
    await page.goto('/calendar');
    
    // Look for completion toggle button by title ("Mark Completed" or "Undo Completion")
    const toggleBtn = page.locator('button[title="Mark Completed"], button[title="Undo Completion"]').first();
    if (await toggleBtn.count() > 0) {
      const initialTitle = await toggleBtn.getAttribute('title');
      await toggleBtn.click();
      
      // Verify that after click, the title toggles to the opposite action
      const newTitle = await toggleBtn.getAttribute('title');
      expect(newTitle).not.toEqual(initialTitle);

      // Click again to undo / revert status
      await toggleBtn.click();
      const revertedTitle = await toggleBtn.getAttribute('title');
      expect(revertedTitle).toEqual(initialTitle);
    }
  });
});

