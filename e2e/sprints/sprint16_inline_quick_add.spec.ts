import { test, expect } from '@playwright/test';

test.describe('Sprint 16: Inline Quick-Add Patient E2E', () => {
  test('should successfully add a patient via inline form and see them in roster', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    // Generate a unique patient name to avoid false positives
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `TestFirst${uniqueId}`;
    const lastName = `TestLast${uniqueId}`;
    const ailment = `Ailment${uniqueId}`;
    const phoneNumber = `555-01${uniqueId}`;

    await page.goto('/patients');

    // Fill in the inline form
    await page.getByPlaceholder('First Name', { exact: true }).fill(firstName);
    await page.getByPlaceholder('Last Name', { exact: true }).fill(lastName);
    await page.getByPlaceholder('Phone Number', { exact: true }).fill(phoneNumber);
    await page.getByPlaceholder('Primary Ailment', { exact: true }).fill(ailment);

    // The add button might be found by text "Add Patient" or by its type="submit" in the form
    // Let's use the text or the placeholder container
    const addButton = page.locator('button[type="submit"]', { hasText: 'Add Patient' });
    await addButton.click();

    // Wait for the patient to appear in the list first, which confirms submission is complete
    const patientRow = page.locator(`text=${firstName} ${lastName}`);
    await expect(patientRow).toBeVisible({ timeout: 10000 });

    // Verify the inputs are cleared after submission
    await expect(page.getByPlaceholder('First Name', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Last Name', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Phone Number', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Primary Ailment', { exact: true })).toHaveValue('');
  });
});
