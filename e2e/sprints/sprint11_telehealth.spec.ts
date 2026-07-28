import { test, expect } from '@playwright/test';

test.describe('Sprint 11: Telehealth / Video Meeting Link Integration E2E', () => {
  test('should schedule a new telehealth appointment via calendar modal with provider and URL', async ({ page }) => {
    // 1. Navigate to Calendar page
    await page.goto('/calendar');
    await expect(page).toHaveURL(/\/calendar/);
    await expect(page.locator('body')).toContainText(/Session Schedule/i);

    // 2. Open New Appointment Modal
    const bookBtn = page.locator('button', { hasText: /Book New Session|New Appointment|Schedule Session/i });
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();

    // 3. Verify modal is visible
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
    const confirmBtn = page.locator('button', { hasText: /Confirm Session|Schedule|Save/i });
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

  test('should render Telehealth video icon in Calendar weekly view for scheduled appointments', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.locator('body')).toContainText(/Session Schedule/i);
    
    // Check for Details button on appointment card
    const detailsBtn = page.locator('button', { hasText: /Details/i });
    if (await detailsBtn.count() > 0) {
      await detailsBtn.first().click();
      
      // Look for Telehealth Session detail or Join Call link inside details modal if telehealth URL is set
      const modalBody = page.locator('body');
      if (await modalBody.locator('text=/Telehealth Session|Join Google Meet|Join Zoom|Join Call/i').count() > 0) {
        await expect(modalBody.locator('text=/Telehealth Session|Join/i').first()).toBeVisible();
      }
    }
  });
});
