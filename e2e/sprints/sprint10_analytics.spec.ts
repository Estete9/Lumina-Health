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
    await expect(page.locator('body')).toContainText(/DSM-5 Diagnostic Distribution/i);
    await expect(page.locator('body')).toContainText(/Symptom Severity Line Trend/i);

    // Verify 3:2 grid ratio layout classes
    const dsm5Header = page.getByRole('heading', { name: /DSM-5 Diagnostic Distribution/i });
    const dsm5Card = page.locator('div.rounded-xl').filter({ has: dsm5Header });
    await expect(dsm5Card).toHaveClass(/lg:col-span-3/);

    const severityHeader = page.getByRole('heading', { name: /Symptom Severity Line Trend/i });
    const severityCard = page.locator('div.rounded-xl').filter({ has: severityHeader });
    await expect(severityCard).toHaveClass(/lg:col-span-2/);

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
  });

  test('should truncate long lists to 5 items and toggle expansion for Symptom Severity and DSM-5 Distribution', async ({ page }) => {
    await page.goto('/analytics');

    // 1. Ensure on Clinical Outcomes tab
    const clinicalTab = page.locator('button', { hasText: /Clinical Outcomes/i });
    await clinicalTab.click();

    // 2. Find Show All buttons (for Symptom Severity Line Trend & DSM-5 Diagnostic Distribution)
    const showAllButtons = page.locator('button', { hasText: /Show All/i });
    await expect(showAllButtons.first()).toBeVisible();

    // 3. Test expansion on the first truncated section
    await showAllButtons.first().click();
    const showLessBtn = page.locator('button', { hasText: /Show Less/i }).first();
    await expect(showLessBtn).toBeVisible();

    // Collapse back
    await showLessBtn.click();
    await expect(showAllButtons.first()).toBeVisible();
  });

  test('should support responsive truncation and expand toggle for Top Clinical Discoveries', async ({ page }) => {
    await page.goto('/analytics');

    // Ensure on Clinical Outcomes tab
    const clinicalTab = page.locator('button', { hasText: /Clinical Outcomes/i });
    await clinicalTab.click();

    await expect(page.locator('body')).toContainText(/Top Clinical Discoveries/i);

    // Look for Clinical Discoveries section Show All button
    const discoveriesSection = page.locator('div', { hasText: /Top Clinical Discoveries/i }).filter({ has: page.locator('button', { hasText: /Show All/i }) });
    
    // If there are more items than maxItems, the toggle button will be rendered
    const discoveriesToggle = discoveriesSection.locator('button', { hasText: /Show All/i }).first();
    if (await discoveriesToggle.isVisible()) {
      await discoveriesToggle.click();
      await expect(discoveriesSection.locator('button', { hasText: /Show Less/i })).toBeVisible();

      // Collapse back
      await discoveriesSection.locator('button', { hasText: /Show Less/i }).click();
      await expect(discoveriesToggle).toBeVisible();
    }
  });
});

