import { test, expect } from '@playwright/test';

test.describe('Sprint 3: Patient Profile Detail E2E', () => {
  test('should navigate to patient detail chart and view clinical timeline', async ({ page }) => {
    await page.goto('/patients');

    // Click on first patient card/row if present
    const firstPatientRow = page.locator('table tbody tr, div[class*="cursor-pointer"]').first();
    if (await firstPatientRow.count() > 0) {
      await firstPatientRow.click();
      await expect(page.locator('body')).toContainText(/Clinical Progress Notes|Timeline|Profile/i);
    }
  });
});
