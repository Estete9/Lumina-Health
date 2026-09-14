# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sprints/sprint2_calendar.spec.ts >> Sprint 2: Session Scheduler & Calendar E2E >> should allow toggling completion status and undoing completion on calendar appointments
- Location: e2e/sprints/sprint2_calendar.spec.ts:22:7

# Error details

```
Error: expect(received).not.toEqual(expected) // deep equality

Expected: not "Undo Completion"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e9]:
        - heading "Lumina Health" [level=1] [ref=e10]
        - paragraph [ref=e11]: Practitioner Portal
      - button [ref=e12] [cursor=pointer]
      - navigation [ref=e15]:
        - link "Dashboard" [ref=e16] [cursor=pointer]:
          - /url: /
        - link "Patient Roster" [ref=e23] [cursor=pointer]:
          - /url: /patients
        - link "Schedule & Calendar" [ref=e30] [cursor=pointer]:
          - /url: /calendar
        - link "Clinical Notes" [ref=e34] [cursor=pointer]:
          - /url: /notes
        - link "Analytics" [ref=e39] [cursor=pointer]:
          - /url: /analytics
      - generic [ref=e43]:
        - link "Settings" [ref=e44] [cursor=pointer]:
          - /url: /settings
        - button "Sign Out" [ref=e49] [cursor=pointer]
    - generic [ref=e54]:
      - banner [ref=e55]:
        - textbox "Search patients, primary ailments, or tags (e.g. @mild)..." [ref=e62]
        - generic [ref=e63]:
          - button "Notifications" [ref=e64] [cursor=pointer]
          - button "DS Dr. Sarah Jenkins Clinical Psychology" [ref=e70] [cursor=pointer]:
            - generic [ref=e71]: DS
            - generic [ref=e72]:
              - generic [ref=e73]:
                - generic [ref=e74]: Dr. Sarah Jenkins
                - generic "HIPAA Compliant Session" [ref=e75]
              - paragraph [ref=e79]: Clinical Psychology
      - main [ref=e80]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]: Time
            - generic [ref=e87]:
              - generic [ref=e88]: Mon
              - generic [ref=e89]: "7"
            - generic [ref=e90]:
              - generic [ref=e91]: Tue
              - generic [ref=e92]: "8"
            - generic [ref=e93]:
              - generic [ref=e94]: Wed
              - generic [ref=e95]: "9"
            - generic [ref=e96]:
              - generic [ref=e97]: Thu
              - generic [ref=e98]: "10"
            - generic [ref=e99]:
              - generic [ref=e100]: Fri
              - generic [ref=e101]: "11"
            - generic [ref=e102]:
              - generic [ref=e103]: Sat
              - generic [ref=e104]: "12"
            - generic [ref=e105]:
              - generic [ref=e106]: Sun
              - generic [ref=e107]: "13"
          - generic [ref=e108]:
            - generic [ref=e109]: 8:00 AM
            - generic [ref=e119]:
              - generic [ref=e120]: 9:00 AM
              - generic [ref=e123] [cursor=pointer]:
                - generic [ref=e124]:
                  - generic [ref=e125]: Sophia Chen
                  - paragraph [ref=e130]: Individual Therapy
                - generic [ref=e131]:
                  - generic [ref=e132]: 50m
                  - generic [ref=e136]:
                    - button "Undo Completion" [active] [ref=e137]
                    - button "Cancel Session" [ref=e141]
            - generic [ref=e152]:
              - generic [ref=e153]: 10:00 AM
              - generic [ref=e161] [cursor=pointer]:
                - generic [ref=e162]:
                  - generic [ref=e163]: Patricia Brown
                  - paragraph [ref=e168]: Individual Therapy
                - generic [ref=e169]:
                  - generic [ref=e170]: 50m
                  - generic [ref=e174]:
                    - button "Undo Completion" [ref=e175]
                    - button "Cancel Session" [ref=e179]
            - generic [ref=e185]:
              - generic [ref=e186]: 11:00 AM
              - generic [ref=e194] [cursor=pointer]:
                - generic [ref=e195]:
                  - generic [ref=e196]: James Smith
                  - paragraph [ref=e201]: Individual Therapy
                - generic [ref=e202]:
                  - generic [ref=e203]: 50m
                  - generic [ref=e207]:
                    - button "Undo Completion" [ref=e208]
                    - button "Cancel Session" [ref=e212]
              - generic [ref=e218] [cursor=pointer]:
                - generic [ref=e219]:
                  - generic [ref=e220]: Maria Garcia
                  - paragraph [ref=e225]: Individual Therapy
                - generic [ref=e226]:
                  - generic [ref=e227]: 50m
                  - generic [ref=e231]:
                    - button "Mark Completed" [ref=e232]
                    - button "Cancel Session" [ref=e236]
            - generic [ref=e241]: 12:00 PM
            - generic [ref=e251]: 1:00 PM
            - generic [ref=e261]:
              - generic [ref=e262]: 2:00 PM
              - generic [ref=e270] [cursor=pointer]:
                - generic [ref=e271]:
                  - generic [ref=e272]: Rachel Green
                  - paragraph [ref=e277]: Individual Therapy
                - generic [ref=e278]:
                  - generic [ref=e279]: 50m
                  - generic [ref=e283]:
                    - button "Undo Completion" [ref=e284]
                    - button "Cancel Session" [ref=e288]
            - generic [ref=e294]:
              - generic [ref=e295]: 3:00 PM
              - generic [ref=e300] [cursor=pointer]:
                - generic [ref=e301]:
                  - generic [ref=e302]: Rachel Green
                  - paragraph [ref=e307]: Individual Therapy
                - generic [ref=e308]:
                  - generic [ref=e309]: 50m
                  - generic [ref=e313]:
                    - button "Undo Completion" [ref=e314]
                    - button "Cancel Session" [ref=e318]
            - generic [ref=e327]:
              - generic [ref=e328]: 4:00 PM
              - generic [ref=e331] [cursor=pointer]:
                - generic [ref=e332]:
                  - generic [ref=e333]: Arthur Pendelton
                  - paragraph [ref=e338]: Individual Therapy
                - generic [ref=e339]:
                  - generic [ref=e340]: 50m
                  - generic [ref=e344]:
                    - button "Mark Completed" [ref=e345]
                    - button "Cancel Session" [ref=e349]
              - generic [ref=e358] [cursor=pointer]:
                - generic [ref=e359]:
                  - generic [ref=e360]: Elena Rostova
                  - paragraph [ref=e365]: Individual Therapy
                - generic [ref=e366]:
                  - generic [ref=e367]: 50m
                  - generic [ref=e371]:
                    - button "Undo Completion" [ref=e372]
                    - button "Cancel Session" [ref=e376]
            - generic [ref=e383]: 5:00 PM
            - generic [ref=e393]: 6:00 PM
    - button [ref=e404] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e411] [cursor=pointer]
  - alert [ref=e415]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sprint 2: Session Scheduler & Calendar E2E', () => {
  4  |   test('should navigate to /calendar and open booking modal', async ({ page }) => {
  5  |     await page.goto('/calendar');
  6  |     await expect(page.locator('body')).toContainText(/Calendar|Appointments|Schedule/i);
  7  | 
  8  |     // Look for New Appointment button
  9  |     const newApptBtn = page.locator('button', { hasText: /New Appointment|Schedule Session/i });
  10 |     if (await newApptBtn.count() > 0) {
  11 |       await newApptBtn.click();
  12 |       await expect(page.locator('h2', { hasText: /Schedule Therapy Session/i })).toBeVisible();
  13 | 
  14 |       // Verify close button dismisses modal
  15 |       const closeBtn = page.locator('button[title="Close modal"]');
  16 |       await expect(closeBtn).toBeVisible();
  17 |       await closeBtn.click();
  18 |       await expect(page.locator('h2', { hasText: /Schedule Therapy Session/i })).toHaveCount(0);
  19 |     }
  20 |   });
  21 | 
  22 |   test('should allow toggling completion status and undoing completion on calendar appointments', async ({ page }) => {
  23 |     await page.goto('/calendar');
  24 |     
  25 |     // Look for completion toggle button by title ("Mark Completed" or "Undo Completion")
  26 |     const toggleBtn = page.locator('button[title="Mark Completed"], button[title="Undo Completion"]').first();
  27 |     if (await toggleBtn.count() > 0) {
  28 |       const initialTitle = await toggleBtn.getAttribute('title');
  29 |       await toggleBtn.click();
  30 |       
  31 |       // Verify that after click, the title toggles to the opposite action
  32 |       const newTitle = await toggleBtn.getAttribute('title');
> 33 |       expect(newTitle).not.toEqual(initialTitle);
     |                            ^ Error: expect(received).not.toEqual(expected) // deep equality
  34 | 
  35 |       // Click again to undo / revert status
  36 |       await toggleBtn.click();
  37 |       const revertedTitle = await toggleBtn.getAttribute('title');
  38 |       expect(revertedTitle).toEqual(initialTitle);
  39 |     }
  40 |   });
  41 | 
  42 |   test('should open appointment modal globally via speed dial FAB', async ({ page }) => {
  43 |     await page.goto('/');
  44 |     
  45 |     // Find global speed dial FAB toggle button
  46 |     const fabToggle = page.locator('div.fixed.bottom-8.right-8 button').last();
  47 |     if (await fabToggle.count() > 0) {
  48 |       await fabToggle.click();
  49 |       
  50 |       // Click 'Book a Session' button inside open FAB menu
  51 |       const bookSessionBtn = page.locator('button[title="Book a Session"]').first();
  52 |       if (await bookSessionBtn.count() > 0) {
  53 |         await bookSessionBtn.click();
  54 |         await expect(page.locator('h2', { hasText: /Schedule Therapy Session/i })).toBeVisible();
  55 |       }
  56 |     }
  57 |   });
  58 | });
  59 | 
  60 | 
  61 | 
```