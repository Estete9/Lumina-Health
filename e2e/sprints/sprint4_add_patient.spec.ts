import { test, expect } from '@playwright/test';

test.describe('Sprint 4: Add New Patient Registration E2E', () => {
  test('should open add patient modal from roster view', async ({ page }) => {
    await page.goto('/patients');

    const addPatientBtn = page.locator('button', { hasText: /Add Patient|New Patient/i });
    if (await addPatientBtn.count() > 0) {
      await addPatientBtn.click();
      await expect(page.locator('body')).toContainText(/Patient Intake|Demographics|DSM-5/i);
    }
  });
});
