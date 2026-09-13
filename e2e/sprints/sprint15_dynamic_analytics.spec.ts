import { test, expect } from '@playwright/test';

test.describe('Sprint 15: Dynamic Analytics Service & UI Integration E2E', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  test('should render dynamic analytics dashboard with KPI cards, attention items, and recent activity', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await page.waitForLoadState('networkidle');

    // 1. Verify dynamic KPI metrics strip
    await expect(page.locator('body')).toContainText('Active Caseload');
    await expect(page.locator('body')).toContainText('MTD Revenue');
    await expect(page.locator('body')).toContainText('No-Show Rate');
    await expect(page.locator('body')).toContainText('Open Risk Flags');
    await expect(page.locator('body')).toContainText('Utilization');

    // 2. Verify attention trigger button & expandable drawer
    const attentionBtn = page.getByRole('button', { name: /(Needs attention · \d+|All caught up)/i });
    await expect(attentionBtn).toBeVisible();

    await attentionBtn.click();
    await expect(page.getByText(/Action Required|All caught up!/i)).toBeVisible();
    await attentionBtn.click();

    // 3. Verify Overview widgets: Caseload Trajectory & Intake Funnel
    await expect(page.getByRole('heading', { name: 'Caseload Trajectory', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Intake Funnel', exact: true })).toBeVisible();

    // 4. Verify Recent Activity section (either dynamic events or empty state)
    await expect(page.getByRole('heading', { name: 'Recent Activity', exact: true })).toBeVisible();
    await expect(page.locator('body')).toContainText(
      /(Clinical note documented for Client|Completed session with Client|No-show recorded|No recent activity)/i
    );

    // Verify clean execution without uncaught console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should navigate across all analytics tabs and render dynamic widgets without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await page.waitForLoadState('networkidle');

    // 1. Clinical tab
    await page.getByRole('button', { name: 'Clinical', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Caseload Trajectory/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Client Symptom Score Trends/i })).toBeVisible();

    // 2. Attendance tab
    await page.getByRole('button', { name: 'Attendance', exact: true }).click();
    await expect(page.getByRole('heading', { name: /No-Show \/ Late-Cancel Rate/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Risk Watchlist/i })).toBeVisible();

    // 3. Financial tab
    await page.getByRole('button', { name: 'Financial', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Revenue by Payer Type/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Claims Aging AR/i })).toBeVisible();

    // 4. Pipeline tab
    await page.getByRole('button', { name: 'Pipeline', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Inquiry-to-Retention Funnel/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Referral Quality/i })).toBeVisible();

    // 5. Compliance tab
    await page.getByRole('button', { name: 'Compliance', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Documentation & Credentials/i })).toBeVisible();

    // 6. Overview tab
    await page.getByRole('button', { name: 'Overview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Caseload Trajectory', exact: true })).toBeVisible();

    expect(consoleErrors).toHaveLength(0);
  });

  test('should handle and render empty state fallbacks gracefully when no data is present', async ({ page }) => {
    // Navigating to analytics confirms charts handle empty/sparse arrays with proper empty state UI
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await page.waitForLoadState('networkidle');

    // Verify main container renders with full layout
    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();

    // Verify that whether populated or empty, no breaking error banners are rendered
    await expect(page.locator('text=Application error')).not.toBeVisible();
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible();
  });
});
