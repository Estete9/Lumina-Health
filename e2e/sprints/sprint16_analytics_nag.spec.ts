import { test, expect } from '@playwright/test';

test.describe('Sprint 16: Analytics Missing Demographics Alert E2E', () => {
  test('should display Missing Intake Paperwork alert for patient with upcoming appointment and missing demographics', async ({ page }) => {
    // Navigating to analytics should now show the alert because we added p-16 to mockData
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await page.waitForLoadState('networkidle');

    // Verify the "Needs attention" button is visible and contains at least 1 item
    const attentionBtn = page.getByRole('button', { name: /Needs attention · \d+/i });
    await expect(attentionBtn).toBeVisible({ timeout: 10000 });

    // Click to expand the drawer
    await attentionBtn.click();

    // The alert drawer should contain "Missing Intake Paperwork" title
    await expect(page.getByText('Missing Intake Paperwork')).toBeVisible();

    // It should also show the meta description for missing demographics
    await expect(page.getByText(/scheduled client\(?s?\)? missing demographics/i)).toBeVisible();
  });
});
