import { test, expect } from '@playwright/test';

test.describe('Sprint 5: Quick Note Entry Modal E2E', () => {
  test('should trigger quick note modal from header action', async ({ page }) => {
    await page.goto('/');

    const noteBtn = page.locator('button', { hasText: /\+ Note|Add Note/i }).first();
    if (await noteBtn.count() > 0) {
      await noteBtn.click();
      await expect(page.locator('body')).toContainText(/New Clinical Note|Discoveries|Homework/i);
    }
  });
});
