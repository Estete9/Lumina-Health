import { getPractitionerAnalytics } from '@/lib/services/analyticsService';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';

export default async function AnalyticsPage() {
  const analyticsRes = await getPractitionerAnalytics();

  if (analyticsRes.error || !analyticsRes.data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-rose-600">Error loading analytics</h2>
          <p className="text-slate-500">{analyticsRes.error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-slate-50">
      <AnalyticsView data={analyticsRes.data} />
    </div>
  );
}
