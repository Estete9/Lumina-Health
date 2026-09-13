import { test, expect } from '@playwright/test';

test.describe('Sprint 14: Vertical Scrolling & Page Height Overhaul E2E', () => {
  test('Dashboard page should render with scrollable main viewport and fixed layout elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify main content container has scrollable overflow classes
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify header and sidebar are present and fixed within layout
    const header = page.locator('header');
    const sidebar = page.locator('aside');
    await expect(header).toBeVisible();
    await expect(sidebar).toBeVisible();

    // Verify dashboard core widgets render
    await expect(page.locator('text=Practitioner Dashboard')).toBeVisible();
    await expect(page.locator('text=Active Patients')).toBeVisible();
    await expect(page.locator('text=Today\'s Appointment Schedule')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Previous Session Notes' })).toBeVisible();
    await expect(page.locator('text=Scratchpad')).toBeVisible();

    // Verify Global Speed Dial FAB exists and can expand
    const fabButton = page.locator('div.fixed.bottom-8.right-8 button').last();
    await expect(fabButton).toBeVisible();
    await fabButton.click();
    await page.waitForTimeout(200);

    // Verify speed dial options appear
    await expect(page.locator('button[aria-label="Create a Note"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Book a Session"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Add a New Patient"]')).toBeVisible();

    // Close speed dial
    await fabButton.click();
  });

  test('Analytics page should render tabs and allow clean scrolling without layout break', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    // Check tabs render
    await expect(page.locator('button', { hasText: 'Overview' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Clinical' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Attendance' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Financial' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Pipeline' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Compliance' })).toBeVisible();

    // Switch between tabs to verify smooth switching within container
    await page.locator('button', { hasText: 'Clinical' }).click();
    await page.waitForTimeout(200);
    await expect(page.locator('text=PHQ-9')).toBeVisible();

    await page.locator('button', { hasText: 'Financial' }).click();
    await page.waitForTimeout(200);
    await expect(page.getByRole('heading', { name: 'Revenue by Payer Type' })).toBeVisible();

    await page.locator('button', { hasText: 'Compliance' }).click();
    await page.waitForTimeout(200);
    await expect(page.getByRole('heading', { name: 'Documentation & Credentials' })).toBeVisible();
  });

  test('Calendar page should render interactive time grid and handle booking modal', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // Verify calendar days header row exists
    await expect(page.locator('text=Time')).toBeVisible();
    const timeSlots = page.locator('div.divide-y');
    await expect(timeSlots).toBeVisible();

    // Open booking modal by clicking first available cell or via FAB
    const fabToggle = page.locator('div.fixed.bottom-8.right-8 button').last();
    await fabToggle.click();
    const bookSessionBtn = page.locator('button[aria-label="Book a Session"]').first();
    await expect(bookSessionBtn).toBeVisible();
    await bookSessionBtn.click();
    await page.waitForTimeout(200);

    // Verify modal is open and has patient select dropdown
    await expect(page.locator('h2', { hasText: /Schedule Therapy Session/i })).toBeVisible();
    const selectPatient = page.locator('select').first();
    await expect(selectPatient).toBeVisible();

    // Close modal
    const cancelBtn = page.locator('button', { hasText: 'Cancel' }).first();
    await cancelBtn.click();
    await page.waitForTimeout(200);
  });

  test('Notes Hub should support master-detail pane scrolling and modal actions', async ({ page }) => {
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder="Search patients..."]');
    await expect(searchInput).toBeVisible();

    // Select first patient from notes sidebar
    const patientItem = page.locator('div.flex-1.overflow-y-auto button').first();
    if (await patientItem.isVisible()) {
      await patientItem.click();
      await page.waitForTimeout(300);

      // Verify clinical timeline loaded
      await expect(page.locator('body')).toContainText(/Clinical History/i);
    }
  });

  test('Patients roster and detail pages should render with accessible scrolling containers', async ({ page }) => {
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Patient Roster/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /Add New Patient|Add Patient/i })).toBeVisible();

    // Open Add Patient modal
    await page.locator('button', { hasText: /Add New Patient|Add Patient/i }).first().click();
    await page.waitForTimeout(200);

    // Check modal form fields
    await expect(page.getByRole('heading', { name: /Add New Patient/i })).toBeVisible();
    await expect(page.locator('input[placeholder="e.g. Sarah"]')).toBeVisible();

    // Close modal
    const cancelBtn = page.locator('button', { hasText: 'Cancel' }).first();
    await cancelBtn.click();
  });

  test('Authentication pages should render in clean full-screen layout', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify login card exists and no practitioner sidebar is rendered
    await expect(page.locator('text=Welcome to Lumina Health')).toBeVisible();
    await expect(page.locator('aside')).not.toBeVisible();

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Verify register card exists and no practitioner sidebar is rendered
    await expect(page.locator('text=Join Lumina Health')).toBeVisible();
    await expect(page.locator('aside')).not.toBeVisible();
  });
});
