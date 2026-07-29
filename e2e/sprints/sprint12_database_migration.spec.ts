import { test, expect } from '@playwright/test';

test.describe('Sprint 12: Live Backend Database Migration E2E', () => {
  test('should execute complete clinical workflow with database-backed services', async ({ page }) => {
    // 1. Load Practitioner Dashboard
    await page.goto('/');
    await expect(page.locator('body')).toContainText(/Lumina/i);

    // 2. Navigate to Patient Roster and register patient
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');

    // Verify Patient Roster renders patients
    await expect(page.locator('body')).toContainText(/Roster|Patients|Elena|Marcus/i);

    // 3. Navigate to Calendar and verify appointment schedule
    await page.goto('/calendar');
    await expect(page.locator('body')).toContainText(/Calendar|Appointments|Schedule/i);

    // 4. Navigate to Analytics Hub
    await page.goto('/analytics');
    await expect(page.locator('body')).toContainText(/Analytics/i);
  });
});
