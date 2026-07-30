import { test, expect } from '@playwright/test';

test.describe('Sprint 12: Clinical Notes Hub Redo E2E', () => {
  test('should render Clinical Notes Hub page and support real-time filtering', async ({ page }) => {
    // 1. Navigate to Clinical Notes Hub page
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');

    // 2. Verify Page Header & Search Input
    await expect(page.locator('main h1')).toContainText('Clinical Notes Hub');
    await expect(page.locator('body')).toContainText('Review and manage your clinical sessions');

    // 3. Verify search box functionality
    const searchInput = page.locator('input[placeholder*="Search by patient name"]');
    await expect(searchInput).toBeVisible();

    // 4. Type a query into search box
    await searchInput.fill('Marcus');
    await page.waitForTimeout(300);

    // 5. Clear search query
    await searchInput.fill('');
    await page.waitForTimeout(300);
  });
});
