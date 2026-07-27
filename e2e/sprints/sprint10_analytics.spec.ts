import { test, expect } from '@playwright/test';

test.describe('Sprint 10: Decision-Making Clinical & Practice Analytics Hub E2E', () => {
  test('should navigate to /analytics and render analytics header and KPI cards', async ({ page }) => {
    await page.goto('/analytics');

    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('body')).toContainText(/Practitioner Analytics & Progress Overview/i);

    // KPI metric card headings
    await expect(page.locator('body')).toContainText(/Active Caseload/i);
    await expect(page.locator('body')).toContainText(/Completion Rate/i);
    await expect(page.locator('body')).toContainText(/Patient Engagement/i);
  });

  test('should support interactive tab switching between the 3 Category Views', async ({ page }) => {
    await page.goto('/analytics');

    // 1. Default Tab: 🩺 Clinical Outcomes
    const clinicalTab = page.locator('button', { hasText: /Clinical Outcomes/i });
    await expect(clinicalTab).toBeVisible();
    await clinicalTab.click();

    await expect(page.locator('[data-testid="view-clinical-outcomes"]')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Symptom Severity Line Trend/i);
    await expect(page.locator('body')).toContainText(/DSM-5 Diagnostic Distribution/i);

    // 2. Tab 2: 📈 Practice Dynamics
    const practiceTab = page.locator('button', { hasText: /Practice Dynamics/i });
    await expect(practiceTab).toBeVisible();
    await practiceTab.click();

    await expect(page.locator('[data-testid="view-practice-dynamics"]')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Treatment Retention Funnel Chart/i);
    await expect(page.locator('body')).toContainText(/Monthly Attendance & Cancellations/i);

    // 3. Tab 3: ⚡ Caseload & Capacity
    const caseloadTab = page.locator('button', { hasText: /Caseload & Capacity/i });
    await expect(caseloadTab).toBeVisible();
    await caseloadTab.click();

    await expect(page.locator('[data-testid="view-caseload-capacity"]')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Bandwidth Capacity Dial Gauge/i);
    await expect(page.locator('body')).toContainText(/Weekly Workload Density Heatmap/i);
  });

  test('should allow navigation to Analytics via sidebar link', async ({ page }) => {
    await page.goto('/');

    const analyticsLink = page.locator('a[href="/analytics"]');
    await expect(analyticsLink).toBeVisible();
    await analyticsLink.click();

    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('body')).toContainText(/Practitioner Analytics & Progress Overview/i);
  });

  test('should display circular KPI progress cards and support list expansion/truncation', async ({ page }) => {
    await page.goto('/analytics');

    // Verify SVG circular progress elements exist
    const kpiSvgs = page.locator('svg.transform');
    await expect(kpiSvgs.first()).toBeVisible();

    // Switch to Caseload & Capacity tab
    const caseloadTab = page.locator('button', { hasText: /Caseload & Capacity/i });
    await caseloadTab.click();

    // Check burnout risk section header
    await expect(page.locator('body')).toContainText(/Burnout Risk & Recommended Interventions/i);

    // Test list expansion toggle if present
    const showAllBtn = page.locator('button', { hasText: /Show All/i });
    if (await showAllBtn.first().isVisible().catch(() => false)) {
      await showAllBtn.first().click();
      await expect(page.locator('button', { hasText: /Show Less/i }).first()).toBeVisible();
      await page.locator('button', { hasText: /Show Less/i }).first().click();
      await expect(showAllBtn.first()).toBeVisible();
    }
  });
});

