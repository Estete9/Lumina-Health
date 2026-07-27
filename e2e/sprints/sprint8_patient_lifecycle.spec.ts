import { test, expect } from '@playwright/test';

test.describe('Sprint 8: Patient Status Lifecycle & Tab Filtering E2E', () => {
  test('should render status filter tab bar on patient roster view', async ({ page }) => {
    await page.goto('/patients');

    await expect(page.locator('body')).toContainText(/All Patients/i);
    await expect(page.locator('body')).toContainText(/Active/i);
    await expect(page.locator('body')).toContainText(/Completed/i);
    await expect(page.locator('body')).toContainText(/Archived/i);
  });
});
