import { computeAnalyticsFromServices } from './lib/services/analyticsService';

async function test() {
  const data = await computeAnalyticsFromServices('prac-1');
  console.log('Weekly Trends:', JSON.stringify(data.weeklyTrends, null, 2));
}

test();
