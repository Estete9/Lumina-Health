import { test, expect } from '@playwright/test';

test.describe('Sprint 11: Analytics Refinement & Practice Metrics E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('lumina_explicit_logout');
      window.localStorage.setItem('lumina_mock_session', JSON.stringify({
        user: {
          id: 'prac-1',
          email: 'sarah.jenkins@lumina.local',
          name: 'Dr. Sarah Jenkins',
          specialty: 'General Practice',
          created_at: new Date().toISOString()
        },
        session_id: 'mock-session-test'
      }));
    });
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('body')).toContainText(/Practitioner Analytics & Progress Overview/i);
  });

  test('should render Clinical Outcomes tab with DSM-5 distribution, Top Discoveries, and no duplicate charts', async ({ page }) => {
    // Navigate to Clinical Outcomes tab
    const clinicalTab = page.locator('[data-testid="tab-clinical-outcomes"]');
    await expect(clinicalTab).toBeVisible();
    await clinicalTab.click();

    const clinicalView = page.locator('[data-testid="view-clinical-outcomes"]');
    await expect(clinicalView).toBeVisible();

    // Verify presence of DSM-5 Diagnostic Distribution
    const dsm5Heading = page.getByRole('heading', { name: /DSM-5 Diagnostic Distribution/i });
    await expect(dsm5Heading).toHaveCount(1);
    await expect(dsm5Heading).toBeVisible();

    // Verify presence of Symptom Severity Line Trend
    const severityHeading = page.getByRole('heading', { name: /Symptom Severity Line Trend/i });
    await expect(severityHeading).toHaveCount(1);
    await expect(severityHeading).toBeVisible();

    // Verify presence of Top Clinical Discoveries chart
    const discoveriesHeading = page.getByRole('heading', { name: /Top Clinical Discoveries/i });
    await expect(discoveriesHeading).toHaveCount(1);
    await expect(discoveriesHeading).toBeVisible();

    // Verify clinical outcome KPI metric cards
    await expect(clinicalView).toContainText(/Overall Improvement/i);
    await expect(clinicalView).toContainText(/Tracked Patients/i);

    // Verify absence of duplicate chart panels
    const dsm5Card = page.locator('div.rounded-xl').filter({ has: dsm5Heading });
    await expect(dsm5Card).toHaveCount(1);
    await expect(dsm5Card).toBeVisible();

    const severityCard = page.locator('div.rounded-xl').filter({ has: severityHeading });
    await expect(severityCard).toHaveCount(1);
    await expect(severityCard).toBeVisible();

    const discoveriesCard = page.locator('div.rounded-xl').filter({ has: discoveriesHeading });
    await expect(discoveriesCard).toHaveCount(1);
    await expect(discoveriesCard).toBeVisible();
  });

  test('should navigate to Practice Dynamics tab and verify all enriched KPIs and metrics', async ({ page }) => {
    // Navigate to Practice Dynamics tab
    const practiceTab = page.locator('[data-testid="tab-practice-dynamics"]');
    await expect(practiceTab).toBeVisible();
    await practiceTab.click();

    const practiceView = page.locator('[data-testid="view-practice-dynamics"]');
    await expect(practiceView).toBeVisible();

    // 1. Verify Retention Rate KPI card
    await expect(practiceView.getByText('Retention Rate', { exact: true })).toBeVisible();
    await expect(practiceView).toContainText(/Patients completing planned protocol/i);

    // 2. Verify Session Cadence KPI card
    await expect(practiceView.getByText('Session Cadence', { exact: true })).toBeVisible();
    await expect(practiceView).toContainText(/Mean interval between sessions/i);

    // 3. Verify Billable Hours KPI card (Sprint 11 addition)
    await expect(practiceView.getByText(/Billable Clinical Hours/i)).toBeVisible();
    await expect(practiceView).toContainText(/hrs logged this month|Clinical hours vs target/i);

    // 4. Verify Documentation Compliance KPI card (Sprint 11 addition)
    await expect(practiceView.getByText(/Documentation Compliance/i)).toBeVisible();
    await expect(practiceView).toContainText(/on-time completion|Notes completed on time/i);

    // 5. Verify Top Cancellation Reasons card
    const cancellationReasonsHeading = practiceView.getByRole('heading', { name: /Top Cancellation Reasons/i });
    await expect(cancellationReasonsHeading).toBeVisible();
    await expect(practiceView).toContainText(/cancellation rate/i);
    await expect(practiceView).toContainText(/Late Cancellation/i);
    await expect(practiceView).toContainText(/Financial/i);
    await expect(practiceView).toContainText(/No Show/i);

    // 6. Verify Retention Funnel & Monthly Attendance charts
    const retentionFunnelHeading = practiceView.getByRole('heading', { name: /Treatment Retention Funnel Chart/i });
    await expect(retentionFunnelHeading).toBeVisible();

    const attendanceHeading = practiceView.getByRole('heading', { name: /Monthly Attendance & Cancellations/i });
    await expect(attendanceHeading).toBeVisible();
  });

  test('should support interactive filtering and month selection in Practice Dynamics', async ({ page }) => {
    // Switch to Practice Dynamics tab
    const practiceTab = page.locator('[data-testid="tab-practice-dynamics"]');
    await practiceTab.click();

    const practiceView = page.locator('[data-testid="view-practice-dynamics"]');
    await expect(practiceView).toBeVisible();

    // Select different months and verify update
    const monthSelect = practiceView.locator('select');
    await expect(monthSelect).toBeVisible();

    await monthSelect.selectOption('Jan');
    await expect(monthSelect).toHaveValue('Jan');

    await monthSelect.selectOption('Feb');
    await expect(monthSelect).toHaveValue('Feb');

    await monthSelect.selectOption('Mar');
    await expect(monthSelect).toHaveValue('Mar');
  });
});
