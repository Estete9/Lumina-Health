const fs = require('fs');

const path = './next_steps.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Add completed feature
data.completed_features.push({
  "sprint": "Sprint 15",
  "title": "Dynamic Analytics Service & UI Integration",
  "scope": "Rewrote lib/services/analyticsService.ts to dynamically calculate Activity Feed, Attention Items, No-Show Trend, Funnel, and Compliance using real fetched Supabase data instead of hardcoded mock arrays. Added robust empty-state fallback UI components to components/analytics/.",
  "completed_at": "2026-09-12",
  "layman_summary": "Your Analytics Dashboard is now directly connected to your live patient data! We replaced the placeholder charts with real-time calculations. The dashboard now dynamically generates your Activity Feed based on recent sessions, automatically flags any 'Attention Items' (like a completed session missing a clinical note), and calculates your real no-show trends. We also added sleek 'empty state' messages so the dashboard still looks beautiful even when you don't have enough data to generate a chart yet."
});

// Update issue log based on QA Verifier report
data.issue_log.push({
  "sprint": "Sprint 15",
  "agent": "QA Verifier / Backend Architect",
  "problem": "TypeScript compilation errors due to union mismatch for ActivityItem instances and missing required schema properties (practitioner_id and duration_minutes) in test mock fixtures.",
  "resolution": "Refactored event extraction loop in analyticsService.ts to strictly type ActivityItem and updated mock test fixtures in sprint15_dynamic_analytics.test.ts to include the missing schema properties."
});

// Remove "Patient Roster Inline Quick-Add" and "CSV Export Utility" from proposed if needed, but since they weren't selected, maybe keep them? The rule says: "State Tracking & Backlog Alignment: Maintain completed_features (accomplished sprints) and pending_options...". The user requested this feature out of band. I will just keep proposed_features as is for now, or clear them so the Strategist can propose new ones next time.

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log('Successfully updated next_steps.json');
