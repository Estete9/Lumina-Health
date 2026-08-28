# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sprints/sprint13_notes_hub.spec.ts >> Sprint 13: Clinical Notes Hub Overhaul E2E >> should filter patients in sidebar by search query
- Location: e2e/sprints/sprint13_notes_hub.spec.ts:45:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder="Search patients..."]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[placeholder="Search patients..."]')

```

```yaml
- img
- heading "Welcome to Lumina Health" [level=2]
- paragraph: Sign in to access your practitioner dashboard
- text: Email address
- img
- textbox "Email address":
  - /placeholder: practitioner@lumina.com
- text: Password
- img
- textbox "Password":
  - /placeholder: ••••••••
- button "Sign in"
- text: New to Lumina Health?
- link "Create an account":
  - /url: /register
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sprint 13: Clinical Notes Hub Overhaul E2E', () => {
  4  |   test('should render Split-Pane Master-Detail layout with sidebar and timeline', async ({ page }) => {
  5  |     // 1. Navigate to Clinical Notes Hub page
  6  |     await page.goto('/notes');
  7  |     await page.waitForLoadState('networkidle');
  8  | 
  9  |     // 2. Verify Search Input in Sidebar
  10 |     const searchInput = page.locator('input[placeholder="Search patients..."]');
  11 |     await expect(searchInput).toBeVisible();
  12 | 
  13 |     // 3. Verify initial state before patient selection (shows placeholder message)
  14 |     await expect(page.locator('body')).toContainText(/Select a patient from the sidebar/i);
  15 | 
  16 |     // 4. Click a patient from the sidebar list
  17 |     const patientButton = page.locator('div.flex-1.overflow-y-auto button').first();
  18 |     
  19 |     if (await patientButton.isVisible()) {
  20 |       await patientButton.click();
  21 |       await page.waitForTimeout(300);
  22 | 
  23 |       // 5. Verify timeline on main stage renders for selected patient
  24 |       await expect(page.locator('body')).toContainText(/Clinical History/i);
  25 | 
  26 |       // 6. Check for Create Note button and click it
  27 |       const createNoteBtn = page.locator('button', { hasText: /Create Note for Today's Session|Create Note for Today|Create first note/i }).first();
  28 |       
  29 |       if (await createNoteBtn.isVisible()) {
  30 |         await createNoteBtn.click();
  31 |         await page.waitForTimeout(300);
  32 | 
  33 |         // 7. Verify modal opens with structured clinical note form
  34 |         await expect(page.locator('body')).toContainText(/Add Structured Clinical Note/i);
  35 | 
  36 |         // Close modal
  37 |         const cancelBtn = page.locator('button', { hasText: /Cancel/i }).first();
  38 |         if (await cancelBtn.isVisible()) {
  39 |           await cancelBtn.click();
  40 |         }
  41 |       }
  42 |     }
  43 |   });
  44 | 
  45 |   test('should filter patients in sidebar by search query', async ({ page }) => {
  46 |     await page.goto('/notes');
  47 |     await page.waitForLoadState('networkidle');
  48 | 
  49 |     const searchInput = page.locator('input[placeholder="Search patients..."]');
> 50 |     await expect(searchInput).toBeVisible();
     |                               ^ Error: expect(locator).toBeVisible() failed
  51 | 
  52 |     await searchInput.fill('NonExistentPatientXYZ99');
  53 |     await page.waitForTimeout(300);
  54 | 
  55 |     await expect(page.locator('body')).toContainText(/No patients found/i);
  56 | 
  57 |     await searchInput.fill('');
  58 |     await page.waitForTimeout(300);
  59 |   });
  60 | });
  61 | 
```