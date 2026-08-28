import { getPractitionerAnalytics } from './lib/services/analyticsService';

async function test() {
  const res = await getPractitionerAnalytics('prac-1');
  console.log('Analytics data:', JSON.stringify(res.data, null, 2));
}

test();
