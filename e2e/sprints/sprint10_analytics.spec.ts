import { test, expect } from '@playwright/test';

test.describe('Sprint 10: Practitioner Analytics & Progress Overview E2E', () => {
  test('should navigate to /analytics and render practitioner analytics dashboard', async ({ page }) => {
    await page.goto('/analytics');

    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('body')).toContainText(/Practitioner Analytics & Progress Overview/i);
  });

  test('should render main KPI metric cards on analytics dashboard', async ({ page }) => {
    await page.goto('/analytics');

    // KPI metric card titles/headings
    await expect(page.locator('body')).toContainText(/Active Caseload/i);
    await expect(page.locator('body')).toContainText(/Completion Rate/i);
    await expect(page.locator('body')).toContainText(/Avg Notes \/ Patient/i);
    await expect(page.locator('body')).toContainText(/Completed Sessions/i);
  });

  test('should render Diagnostic Distribution Breakdown chart & Clinical Discoveries ranking cards', async ({ page }) => {
    await page.goto('/analytics');

    // Diagnostic Distribution section
    await expect(page.locator('body')).toContainText(/Diagnostic Distribution/i);

    // Weekly Session Trend section
    await expect(page.locator('body')).toContainText(/Weekly Session Trend/i);

    // Top Clinical Discoveries ranking cards section
    await expect(page.locator('body')).toContainText(/Top Clinical Discoveries/i);
  });

  test('should allow navigation to Analytics via sidebar link', async ({ page }) => {
    await page.goto('/');

    const analyticsLink = page.locator('a[href="/analytics"]');
    await expect(analyticsLink).toBeVisible();
    await analyticsLink.click();

    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('body')).toContainText(/Practitioner Analytics & Progress Overview/i);
  });
});
