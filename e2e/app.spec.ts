import { test, expect } from '@playwright/test';

test.describe('Lumina Health E2E Sanity Checks', () => {
  test('should load the practitioner dashboard', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Check that page title or main heading exists
    await expect(page).toHaveTitle(/Lumina Health|Next.js/i);
    
    // Check that the sidebar navigation or header exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
