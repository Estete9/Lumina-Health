import { test, expect } from '@playwright/test';

test.describe('Sprint 9: Practitioner Login & Registration Flow E2E', () => {

  test('should navigate to login page and render login form inputs', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('body')).toContainText(/Welcome to Lumina Health/i);
    await expect(page.locator('body')).toContainText(/Sign in to access your practitioner dashboard/i);

    // Verify form input elements
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText(/Sign in/i);

    // Verify link to registration page
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });

  test('should navigate to register page and render registration form inputs', async ({ page }) => {
    await page.goto('/register');

    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('body')).toContainText(/Join Lumina Health/i);
    await expect(page.locator('body')).toContainText(/Create your practitioner account/i);

    // Verify form input elements
    const nameInput = page.locator('input#name');
    const specialtyInput = page.locator('input#specialty');
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');

    await expect(nameInput).toBeVisible();
    await expect(specialtyInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText(/Create account/i);

    // Verify link to login page
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test('should allow navigation between login and register pages via links', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/\/register/);

    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should perform successful login redirection and display header practitioner profile', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input#email', 'sarah.jenkins@lumina.local');
    await page.fill('input#password', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard / root page
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/?$/);

    // Verify header practitioner profile display
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header')).toContainText(/Dr\. Sarah Jenkins/i);
  });

  test('should register a new practitioner and display updated header practitioner profile', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input#name', 'Dr. Alex Vance');
    await page.fill('input#specialty', 'Neuropsychology');
    await page.fill('input#email', 'alex.vance@lumina.local');
    await page.fill('input#password', 'password123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/http:\/\/localhost:3000\/?$/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header')).toContainText(/Dr\. Alex Vance/i);
  });
});
