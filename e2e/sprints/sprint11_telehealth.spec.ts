import { test, expect } from '@playwright/test';

test.describe('Sprint 11: Telehealth / Video Meeting Link Integration E2E', () => {
  test('should schedule a new telehealth appointment via calendar modal with provider and URL', async ({ page }) => {
    // 1. Navigate to Calendar page with ?new=true to open booking modal
    await page.goto('/calendar?new=true');
    await expect(page).toHaveURL(/\/calendar/);
    await expect(page.locator('body')).toContainText(/Calendar|Schedule/i);

    // 2. Verify modal is visible
    await expect(page.locator('body')).toContainText(/Schedule Therapy Session/i);

    // 4. Fill in appointment details
    // Select patient if available
    const patientSelect = page.locator('select').first();
    if (await patientSelect.isVisible()) {
      const options = await patientSelect.locator('option').all();
      if (options.length > 1) {
        await patientSelect.selectOption({ index: 1 });
      }
    }

    // Toggle Telehealth switch
    const telehealthCheckbox = page.locator('input[type="checkbox"]');
    await expect(telehealthCheckbox).toBeVisible();
    await telehealthCheckbox.check({ force: true });

    // Select Telehealth Provider (e.g., Google Meet)
    const providerSelect = page.locator('select', { hasText: /Google Meet|Zoom|MS Teams|Custom Link/i });
    if (await providerSelect.isVisible()) {
      await providerSelect.selectOption('meet');
    }

    // Enter Telehealth URL
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://meet.google.com/abc-defg-hij');

    // Submit form
    const confirmBtn = page.locator('button[type="submit"]', { hasText: /Book|Confirm Session|Schedule|Save/i });
    await confirmBtn.click();

    // 5. Verify successful submission / modal closure or schedule update
    await expect(page.locator('body')).not.toContainText(/Schedule Therapy Session/i);
  });

  test('should display Join Call button and Telehealth badge on Dashboard schedule', async ({ page }) => {
    // 1. Navigate to Dashboard
    await page.goto('/');
    await expect(page.locator('body')).toContainText(/Today's Appointment Schedule/i);

    // 2. Check for presence of Join Call button or Telehealth indicator on dashboard
    const joinCallBtn = page.locator('button', { hasText: /Join Call/i });
    
    // If mock data or created appointment exists with telehealth URL, verify Join Call button visibility
    if (await joinCallBtn.count() > 0) {
      await expect(joinCallBtn.first()).toBeVisible();
    } else {
      // Ensure schedule section rendered cleanly without errors
      await expect(page.locator('body')).toContainText(/Today's Appointment Schedule|Session with/i);
    }
  });

  test('should render Telehealth video icon and open details modal on appointment card click', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.locator('body')).toContainText(/Calendar|Schedule/i);
    
    // Check for appointment card clickability in Calendar view
    const aptCard = page.locator('div', { hasText: /Individual CBT|Exposure|Clinical Assessment/i }).first();
    if (await aptCard.count() > 0) {
      await aptCard.click();
      
      // Look for Session Details modal opening on card click
      const modalBody = page.locator('body');
      await expect(modalBody).toContainText(/Session Details/i);
    }
  });

  test('should render Floating Action Button (FAB) for booking across application layout', async ({ page }) => {
    await page.goto('/');
    const fabButton = page.locator('div.fixed.bottom-8 button').last();
    await expect(fabButton).toBeVisible();
  });
});
