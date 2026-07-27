import { PractitionerAnalytics } from '@/lib/types';
import { DiagnosticDistributionChart } from './DiagnosticDistributionChart';
import { WeeklySessionTrendChart } from './WeeklySessionTrendChart';
import { ClinicalDiscoveriesChart } from './ClinicalDiscoveriesChart';
import { Users, CheckCircle2, FileText, Calendar } from 'lucide-react';

export function AnalyticsDashboard({ data }: { data: PractitionerAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Practitioner Analytics & Progress Overview</h2>
          <p className="text-sm text-slate-500">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Caseload Ratio */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Active Caseload</h3>
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.activeCaseloadRatio}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {data.activePatients} of {data.totalPatients} patients
          </p>
        </div>

        {/* Session Completion Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Completion Rate</h3>
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.sessionCompletionRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
             Sessions completed
          </p>
        </div>

        {/* Avg Notes / Patient */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Avg Notes / Patient</h3>
            <FileText className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.avgNotesPerPatient}</div>
          <p className="text-xs text-slate-500 mt-1">
            Notes per patient
          </p>
        </div>

        {/* Total Completed Sessions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Completed Sessions</h3>
            <Calendar className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.totalSessionsCompleted}</div>
          <p className="text-xs text-slate-500 mt-1">
            Total completed
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DiagnosticDistributionChart data={data.diagnosticDistribution} />
        <WeeklySessionTrendChart data={data.weeklyTrends} />
      </div>

      <div className="w-full">
        <ClinicalDiscoveriesChart data={data.topDiscoveries} />
      </div>
    </div>
  );
}
