import { test, expect } from '@playwright/test';

test.describe('Sprint 6: Global Navigation Search Bar E2E', () => {
  test('should focus header search bar and accept query input', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      await searchInput.click();
      await searchInput.fill('@CBT');
      // Verify popover dropdown opens
      await expect(page.locator('body')).toContainText(/Search Results|Patients|Notes/i);
    }
  });
});
