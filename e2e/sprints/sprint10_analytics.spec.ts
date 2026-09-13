import { test, expect } from '@playwright/test';

test.describe('Sprint 10: Psychology Practice Analytics Dashboard V2 E2E', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });
  test('should render Psychology Practice Analytics dashboard with 5 KPI cards and expandable attention risk items', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await page.waitForLoadState('networkidle');

    // 1. Verify 5 KPI cards with delta trends
    await expect(page.locator('body')).toContainText('Active Caseload');
    await expect(page.locator('body')).toContainText('+2 this month');

    await expect(page.locator('body')).toContainText('MTD Revenue');
    await expect(page.locator('body')).toContainText('+6% vs last month');

    await expect(page.locator('body')).toContainText('No-Show Rate');
    await expect(page.locator('body')).toContainText('-1.2 pts vs last month');

    await expect(page.locator('body')).toContainText('Open Risk Flags');
    await expect(page.locator('body')).toContainText('needs review today');

    await expect(page.locator('body')).toContainText('Utilization');
    await expect(page.locator('body')).toContainText('+3 pts vs last month');

    // 2. Verify "Needs attention · X" button and expandable dropdown
    const attentionBtn = page.getByRole('button', { name: /Needs attention · \d+/ });
    await expect(attentionBtn).toBeVisible();

    // Dropdown should initially not show action items
    await expect(page.getByText('Action Required')).not.toBeVisible();

    // Click to expand dropdown
    await attentionBtn.click();
    await expect(page.getByText('Action Required')).toBeVisible();
    await expect(page.getByText(/Positive risk screen/i)).toBeVisible();
    await expect(page.getByText(/Treatment plan/i)).toBeVisible();
    await expect(page.getByText(/Overdue/i)).toBeVisible();

    // Click again to close dropdown
    await attentionBtn.click();
    await expect(page.getByText('Action Required')).not.toBeVisible();

    // Verify no unhandled console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render Overview tab components: stacked bar chart, intake funnel, no-show rate area chart, and recent activity feed', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);

    // Overview tab is active by default
    // 1. Caseload trajectory stacked bar chart (Improving vs. Stable vs. Worsening)
    await expect(page.getByRole('heading', { name: 'Caseload Trajectory', exact: true })).toBeVisible();
    await expect(page.locator('body')).toContainText('Improving');
    await expect(page.locator('body')).toContainText('Stable');
    await expect(page.locator('body')).toContainText('Worsening');

    // 2. Intake funnel with stage counts and step-by-step conversion %
    await expect(page.getByRole('heading', { name: 'Intake Funnel', exact: true })).toBeVisible();
    await expect(page.locator('body')).toContainText('Inquiries');
    await expect(page.locator('body')).toContainText('Consults');
    await expect(page.locator('body')).toContainText('Intakes');
    await expect(page.locator('body')).toContainText('Retained');
    await expect(page.locator('body')).toContainText(/· \d+%/);

    // 3. Trailing 8-Week no-show rate area chart below the fold
    await expect(page.getByRole('heading', { name: 'Trailing 8-Week No-Show Rate', exact: true })).toBeVisible();

    // 4. Recent activity live feed
    await expect(page.getByRole('heading', { name: 'Recent Activity', exact: true })).toBeVisible();
    await expect(page.locator('body')).toContainText(/Clinical note documented for Client|Completed session with Client|No-show recorded|No recent activity/);

    // Verify no unhandled console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should navigate across all 6 tab views and render corresponding widgets without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);

    // 1. Overview Tab (default view)
    await expect(page.getByRole('heading', { name: 'Caseload Trajectory', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Intake Funnel', exact: true })).toBeVisible();

    // 2. Clinical Outcomes Tab
    await page.getByRole('button', { name: 'Clinical', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Caseload Trajectory (6 Months)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Client Symptom Score Trends' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Client J.M.');
    await expect(page.locator('body')).toContainText('GAD-7');
    await expect(page.locator('body')).toContainText('PHQ-9');
    await expect(page.locator('body')).toContainText('Improving');
    await expect(page.locator('body')).toContainText('Elevated');

    // 3. Attendance & Risk Tab
    await page.getByRole('button', { name: 'Attendance', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Trailing 8-Week No-Show / Late-Cancel Rate' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Risk Watchlist' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Client S.K.');
    await expect(page.locator('body')).toContainText('High Risk');
    await expect(page.locator('body')).toContainText('Client M.P.');
    await expect(page.locator('body')).toContainText('Medium Risk');

    // 4. Financial Tab
    await page.getByRole('button', { name: 'Financial', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Revenue by Payer Type' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Claims Aging AR' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Insurance');
    await expect(page.locator('body')).toContainText('Private Pay');

    // 5. Pipeline Tab
    await page.getByRole('button', { name: 'Pipeline', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Inquiry-to-Retention Funnel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Referral Quality' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Psychology Today');
    await expect(page.locator('body')).toContainText('Primary Care');
    await expect(page.locator('body')).toContainText('Word of Mouth');

    // 6. Compliance Tab
    await page.getByRole('button', { name: 'Compliance', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Documentation & Credentials' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Notes completed < 24h');
    await expect(page.locator('body')).toContainText('Treatment plans updated');
    await expect(page.locator('body')).toContainText('CEU Credits (YTD)');
    await expect(page.locator('body')).toContainText('HIPAA Compliance Status: Active');

    // Verify no unhandled console errors during tab switching
    expect(consoleErrors).toHaveLength(0);
  });

  test('should navigate to Analytics via sidebar link', async ({ page }) => {
    await page.goto('/');

    const analyticsLink = page.locator('a[href="/analytics"]').first();
    await expect(analyticsLink).toBeVisible();
    await analyticsLink.click();

    await expect(page).toHaveURL(/\/analytics/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText('Active Caseload');
    await expect(page.locator('body')).toContainText('Needs attention');
  });
});
