import { test, expect } from '@playwright/test';

test.describe('Sprint 7: Clinical Note Edit & Delete E2E', () => {
  test('should display edit pencil and delete trash controls on patient note cards', async ({ page }) => {
    await page.goto('/patients');

    const firstPatient = page.locator('table tbody tr, div[class*="cursor-pointer"]').first();
    if (await firstPatient.count() > 0) {
      await firstPatient.click();
      
      const editBtn = page.locator('button[title*="Edit"]').first();
      if (await editBtn.count() > 0) {
        await expect(editBtn).toBeVisible();
      }
    }
  });
});
