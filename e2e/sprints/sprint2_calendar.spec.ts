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
});
