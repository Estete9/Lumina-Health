import { getPractitionerAnalytics, getDecisionAnalyticsHubData } from '@/lib/services/analyticsService';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const [analyticsRes, hubRes] = await Promise.all([
    getPractitionerAnalytics(),
    getDecisionAnalyticsHubData()
  ]);

  if (analyticsRes.error || !analyticsRes.data || hubRes.error || !hubRes.data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-rose-600">Error loading analytics</h2>
          <p className="text-slate-500">{analyticsRes.error || hubRes.error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <AnalyticsDashboard data={analyticsRes.data} hubData={hubRes.data} />
    </div>
  );
}
