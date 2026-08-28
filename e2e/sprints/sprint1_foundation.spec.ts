import { test, expect } from '@playwright/test';

test.describe('Sprint 1: Practitioner Shell & Dashboard E2E', () => {
  test('should load main practitioner dashboard and patient roster', async ({ page }) => {
    await page.goto('/');

    // Verify main header/branding and page readiness
    await expect(page.locator('body')).toContainText(/Practitioner Dashboard/i);

    // Verify sidebar navigation links
    const rosterLink = page.locator('a[href="/patients"]').first();
    await expect(rosterLink).toBeVisible();
    await rosterLink.click();
    await expect(page).toHaveURL(/\/patients/);
  });
});
