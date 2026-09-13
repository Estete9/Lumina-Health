import { getPractitionerAnalytics } from '@/lib/services/analyticsService';
import { PsychologyPracticeDashboard } from '@/components/analytics/PsychologyPracticeDashboard';

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
    <PsychologyPracticeDashboard data={analyticsRes.data} />
  );
}
