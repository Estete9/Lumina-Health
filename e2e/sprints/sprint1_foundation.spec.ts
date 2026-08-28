import { test, expect } from '@playwright/test';

test.describe('Sprint 1: Practitioner Shell & Dashboard E2E', () => {
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
  });

  test('should load main practitioner dashboard and patient roster', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify main header/branding
    await expect(page.locator('body')).toContainText(/Lumina/i);

    // Verify sidebar navigation links
    const rosterLink = page.locator('a[href="/patients"]').first();
    await expect(rosterLink).toBeVisible();
    await rosterLink.click();
    await expect(page).toHaveURL(/\/patients/);
  });
});
