import { test, expect } from '@playwright/test';

test.describe('Sprint 10: Analytics Clean Slate Reset E2E', () => {
  test('should navigate to /analytics and render fresh reset AnalyticsView with stats and blank canvas', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/analytics');

    await expect(page).toHaveURL(/\/analytics/);

    // Verify main header and subtitle
    await expect(page.getByRole('heading', { name: 'Practice Analytics & Insights' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Clean canvas ready for custom clinical and operational metrics.');

    // Verify KPI metric cards
    await expect(page.locator('body')).toContainText('Total Patients');
    await expect(page.locator('body')).toContainText('Active Caseload');
    await expect(page.locator('body')).toContainText('Total Sessions Completed');
    await expect(page.locator('body')).toContainText('Total Notes Logged');

    // Verify blank canvas "Ready to Build" section
    await expect(page.getByRole('heading', { name: 'Ready to Build' })).toBeVisible();
    await expect(page.locator('body')).toContainText(
      'The analytics hub is reset and ready for purpose-built practitioner metrics.'
    );

    // Verify no unhandled console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should navigate to Analytics via sidebar link', async ({ page }) => {
    await page.goto('/');

    const analyticsLink = page.locator('a[href="/analytics"]');
    await expect(analyticsLink).toBeVisible();
    await analyticsLink.click();

    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByRole('heading', { name: 'Practice Analytics & Insights' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Total Patients');
  });
});
