'use client';

import { useState } from 'react';
import { PractitionerAnalytics, DecisionAnalyticsHubData } from '@/lib/types';
import { DiagnosticDistributionChart } from './DiagnosticDistributionChart';
import { WeeklySessionTrendChart } from './WeeklySessionTrendChart';
import { ClinicalDiscoveriesChart } from './ClinicalDiscoveriesChart';
import { CircularKPICard } from './CircularKPICard';
import { 
  Users, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Stethoscope, 
  TrendingUp, 
  Zap, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  Filter, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AnalyticsDashboardProps {
  data: PractitionerAnalytics;
  hubData?: DecisionAnalyticsHubData;
}

type AnalyticsCategoryTab = 'clinical' | 'practice' | 'caseload';

export function AnalyticsDashboard({ data, hubData }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsCategoryTab>('clinical');
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({});

  const toggleList = (listId: string) => {
    setExpandedLists(prev => ({ ...prev, [listId]: !prev[listId] }));
  };

  const clinicalData = hubData?.clinicalOutcomes;
  const practiceData = hubData?.practiceDynamics;
  const caseloadData = hubData?.caseloadCapacity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Practitioner Analytics & Progress Overview
          </h2>
          <p className="text-sm text-slate-500">
            Decision-Making Clinical & Practice Analytics Hub • Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Global Summary KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CircularKPICard
          title="Active Caseload"
          subtext={`${data.activePatients} of ${data.totalPatients} active patients`}
          percentage={data.activeCaseloadRatio}
          colorHex="#e11d48"
          legendActive="Active"
          legendGoal="Goal"
        />
        <CircularKPICard
          title="Completion Rate"
          subtext="Sessions successfully completed"
          percentage={data.sessionCompletionRate}
          colorHex="#0284c7"
          legendActive="Completed"
          legendGoal="Target"
        />
        <CircularKPICard
          title="Patient Engagement"
          subtext="Consistent session attendance"
          percentage={88}
          colorHex="#d97706"
          legendActive="Engaged"
          legendGoal="Expected"
        />
      </div>

      {/* Category Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3">
        <nav className="flex space-x-4" aria-label="Analytics Category Views">
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            data-testid="tab-clinical-outcomes"
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'clinical'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-md'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <span>🩺</span>
            <span>Clinical Outcomes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            data-testid="tab-practice-dynamics"
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'practice'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-md'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <span>📈</span>
            <span>Practice Dynamics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('caseload')}
            data-testid="tab-caseload-capacity"
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'caseload'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-md'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <span>⚡</span>
            <span>Caseload & Capacity</span>
          </button>
        </nav>
      </div>

      {/* CATEGORY VIEW 1: 🩺 CLINICAL OUTCOMES */}
      {activeTab === 'clinical' && (
        <div className="space-y-6" data-testid="view-clinical-outcomes">
          {/* Top Outcome Highlights */}
          {clinicalData && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CircularKPICard
                title="Overall Improvement"
                subtext="Average symptom severity reduction"
                percentage={clinicalData.overallImprovementRate}
                colorHex="#059669"
                legendActive="Improved"
                legendGoal="Target"
              />
              <CircularKPICard
                title="Tracked Patients"
                subtext="Active outcome monitoring"
                percentage={Math.round((clinicalData.activeTrackedPatients / data.totalPatients) * 100)}
                colorHex="#475569"
                legendActive="Tracked"
                legendGoal="Total"
              />
              {clinicalData.metrics.map(m => (
                <CircularKPICard
                  key={m.id}
                  title={m.title}
                  subtext={`+${m.changePercentage}% vs baseline target`}
                  percentage={Math.min(100, Math.round((m.currentValue / m.targetAvg) * 100))}
                  colorHex="#0d9488"
                  legendActive="Current"
                  legendGoal="Target"
                />
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Symptom Severity Line Trend Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Symptom Severity Line Trend</h3>
                  <p className="text-xs text-slate-500">Weekly average GAD-7 / PHQ-9 severity scores</p>
                </div>
                <Stethoscope className="h-5 w-5 text-teal-600" />
              </div>

              <div className="space-y-4">
                {(clinicalData?.severityTrends || [
                  { period: 'Week 1', avgSeverityScore: 7.8, severeCount: 8, moderateCount: 4, mildCount: 2, remissionCount: 0 },
                  { period: 'Week 2', avgSeverityScore: 6.5, severeCount: 5, moderateCount: 6, mildCount: 3, remissionCount: 0 },
                  { period: 'Week 3', avgSeverityScore: 5.1, severeCount: 3, moderateCount: 7, mildCount: 4, remissionCount: 1 },
                  { period: 'Week 4', avgSeverityScore: 3.9, severeCount: 1, moderateCount: 5, mildCount: 7, remissionCount: 2 },
                ]).map((pt, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{pt.period}</span>
                      <span className="text-slate-600 font-semibold">{pt.avgSeverityScore} / 10 Avg Score</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
                      <div 
                        className="bg-teal-500 h-full transition-all" 
                        style={{ width: `${(pt.avgSeverityScore / 10) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 pt-0.5">
                      <span>Severe: {pt.severeCount}</span>
                      <span>Moderate: {pt.moderateCount}</span>
                      <span>Mild: {pt.mildCount}</span>
                      <span className="text-teal-600 font-medium">Remission: {pt.remissionCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DSM-5 Diagnostic Distribution */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">DSM-5 Diagnostic Distribution</h3>
                  <p className="text-xs text-slate-500">Breakdown of primary diagnostic classifications & symptom progress</p>
                </div>
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>

              <div className="space-y-4">
                {(clinicalData?.ailmentDistribution || [
                  { ailment: 'Generalized Anxiety Disorder', count: 8, percentage: 44, avgInitialSeverity: 7.2, avgCurrentSeverity: 3.4, improvementRate: 52.8 },
                  { ailment: 'Major Depressive Disorder', count: 6, percentage: 33, avgInitialSeverity: 8.0, avgCurrentSeverity: 4.1, improvementRate: 48.7 },
                  { ailment: 'Panic Disorder', count: 4, percentage: 23, avgInitialSeverity: 6.8, avgCurrentSeverity: 2.9, improvementRate: 57.3 },
                ]).map((item, index) => (
                  <div key={index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-800">{item.ailment}</span>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                        {item.percentage}% ({item.count} patients)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Initial: {item.avgInitialSeverity} avg score</span>
                      <span>Current: {item.avgCurrentSeverity} avg score</span>
                      <span className="text-emerald-600 font-semibold">↓ {item.improvementRate}% improvement</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Domain Services Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DiagnosticDistributionChart data={data.diagnosticDistribution} />
            <WeeklySessionTrendChart data={data.weeklyTrends} />
          </div>

          <div className="w-full">
            <ClinicalDiscoveriesChart data={data.topDiscoveries} />
          </div>
        </div>
      )}

      {/* CATEGORY VIEW 2: 📈 PRACTICE DYNAMICS */}
      {activeTab === 'practice' && (
        <div className="space-y-6" data-testid="view-practice-dynamics">
          {/* KPI Metrics */}
          {practiceData && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CircularKPICard
                title="Retention Rate"
                subtext="Patients completing planned protocol"
                percentage={practiceData.overallRetentionRate}
                colorHex="#0284c7"
                legendActive="Retained"
                legendGoal="Goal"
              />
              <CircularKPICard
                title="Session Cadence"
                subtext="Mean interval between sessions"
                percentage={Math.min(100, Math.round((7 / practiceData.averageSessionFrequencyDays) * 100))}
                colorHex="#0284c7"
                legendActive="Current"
                legendGoal="Weekly"
              />
              <CircularKPICard
                title="Cancellation Rate"
                subtext={`${practiceData.cancellationMetrics.vsPreviousMonthChange}% vs previous month`}
                percentage={practiceData.cancellationMetrics.cancellationRate}
                colorHex="#d97706"
                legendActive="Cancelled"
                legendGoal="Total"
              />
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase text-slate-500 mb-2">Top Cancellation Reason</span>
                <div className="text-lg font-bold text-slate-900 truncate mb-1">
                  {practiceData.cancellationMetrics.topReason}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-slate-500">
                  {practiceData.cancellationMetrics.lateCancellations} late cancellations (&lt;24h)
                </p>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Treatment Retention Funnel Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Treatment Retention Funnel Chart</h3>
                  <p className="text-xs text-slate-500">Patient progression across therapeutic stages</p>
                </div>
                <TrendingUp className="h-5 w-5 text-sky-600" />
              </div>

              <div className="space-y-4">
                {(practiceData?.retentionFunnel || [
                  { stageId: 's1', stageName: 'Intake / Onboarding', patientCount: 20, conversionRate: 100, dropoffRate: 0, avgSessionsInStage: 1, color: '#0284c7' },
                  { stageId: 's2', stageName: 'Early Engagement (S1-3)', patientCount: 18, conversionRate: 90, dropoffRate: 10, avgSessionsInStage: 3, color: '#0d9488' },
                  { stageId: 's3', stageName: 'Active Treatment (S4-8)', patientCount: 15, conversionRate: 83, dropoffRate: 17, avgSessionsInStage: 5, color: '#6366f1' },
                  { stageId: 's4', stageName: 'Maintenance / Graduate', patientCount: 12, conversionRate: 80, dropoffRate: 20, avgSessionsInStage: 10, color: '#8b5cf6' },
                ]).map((stage) => (
                  <div key={stage.stageId} className="relative rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-800">{stage.stageName}</span>
                      <span className="font-bold text-slate-900">{stage.patientCount} Patients</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${stage.conversionRate}%`,
                          backgroundColor: stage.color || '#0284c7'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Conversion: {stage.conversionRate}%</span>
                      <span>Drop-off: {stage.dropoffRate}%</span>
                      <span>Avg {stage.avgSessionsInStage} sessions in stage</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Attendance / Cancellations Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Monthly Attendance & Cancellations</h3>
                  <p className="text-xs text-slate-500">Tracking monthly attendance rates and session volumes</p>
                </div>
                <Calendar className="h-5 w-5 text-sky-600" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3 text-center">Scheduled</th>
                      <th className="py-2.5 px-3 text-center">Attended</th>
                      <th className="py-2.5 px-3 text-center">Cancelled</th>
                      <th className="py-2.5 px-3 text-right">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(practiceData?.monthlyAttendance || [
                      { month: 'May', scheduledSessions: 32, attendedSessions: 28, cancelledSessions: 3, noShowSessions: 1, attendanceRate: 87.5 },
                      { month: 'Jun', scheduledSessions: 38, attendedSessions: 33, cancelledSessions: 4, noShowSessions: 1, attendanceRate: 86.8 },
                      { month: 'Jul', scheduledSessions: 42, attendedSessions: 38, cancelledSessions: 3, noShowSessions: 1, attendanceRate: 90.4 },
                    ]).map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-900">{m.month}</td>
                        <td className="py-3 px-3 text-center">{m.scheduledSessions}</td>
                        <td className="py-3 px-3 text-center text-emerald-600 font-medium">{m.attendedSessions}</td>
                        <td className="py-3 px-3 text-center text-rose-500">{m.cancelledSessions}</td>
                        <td className="py-3 px-3 text-right font-bold text-teal-700">{m.attendanceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY VIEW 3: ⚡ CASELOAD & CAPACITY */}
      {activeTab === 'caseload' && (
        <div className="space-y-6" data-testid="view-caseload-capacity">
          {/* KPI Metrics */}
          {caseloadData && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CircularKPICard
                title="Bandwidth Status"
                subtext={`${caseloadData.bandwidth.bandwidthPercentage}% capacity utilized`}
                percentage={caseloadData.bandwidth.bandwidthPercentage}
                colorHex={caseloadData.bandwidth.statusColor || "#f59e0b"}
                legendActive="Utilized"
                legendGoal="Capacity"
              />
              <CircularKPICard
                title="Active vs Threshold"
                subtext="Active caseload limit"
                percentage={Math.round((caseloadData.bandwidth.currentActivePatients / caseloadData.bandwidth.maxCapacityThreshold) * 100)}
                colorHex="#475569"
                legendActive="Active"
                legendGoal="Max"
              />
              <CircularKPICard
                title="Weekly Clinical Hours"
                subtext={`Max limit: ${caseloadData.bandwidth.maxWeeklyHours} hrs/wk`}
                percentage={Math.round((caseloadData.bandwidth.weeklySessionHours / caseloadData.bandwidth.maxWeeklyHours) * 100)}
                colorHex="#475569"
                legendActive="Scheduled"
                legendGoal="Max"
              />
              <CircularKPICard
                title="Burnout Risk Level"
                subtext={caseloadData.burnoutRisk.riskLevel}
                percentage={caseloadData.burnoutRisk.riskScore}
                colorHex="#e11d48"
                legendActive="Risk"
                legendGoal="Max"
              />
            </div>
          )}

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bandwidth Capacity Dial Gauge */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">Bandwidth Capacity Dial Gauge</h3>
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Current clinical caseload saturation gauge versus maximum threshold capacity
                </p>

                {/* Dial Gauge Visual Component */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-8 border-slate-200 bg-white shadow-inner">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-teal-600 transition-all duration-700"
                      style={{ 
                        clipPath: `polygon(0 0, 100% 0, 100% ${caseloadData?.bandwidth.bandwidthPercentage || 72}%, 0 ${caseloadData?.bandwidth.bandwidthPercentage || 72}%)` 
                      }}
                    />
                    <div className="text-center z-10">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {caseloadData?.bandwidth.bandwidthPercentage || 72}%
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mt-1">
                        {caseloadData?.bandwidth.status || 'Optimal'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block uppercase">Active Patients</span>
                  <span className="font-bold text-slate-800 text-sm">{caseloadData?.bandwidth.currentActivePatients || 18}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Max Capacity</span>
                  <span className="font-bold text-slate-800 text-sm">{caseloadData?.bandwidth.maxCapacityThreshold || 25}</span>
                </div>
              </div>
            </div>

            {/* Weekly Workload Density Heatmap */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Weekly Workload Density Heatmap</h3>
                  <p className="text-xs text-slate-500">Hourly session density matrix across the week</p>
                </div>
                <Activity className="h-5 w-5 text-amber-500" />
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                  <div>Time</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                </div>

                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(hour => (
                  <div key={hour} className="grid grid-cols-6 gap-1 items-center text-xs">
                    <div className="font-medium text-slate-500 text-center">{hour}</div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                      const slot = caseloadData?.workloadHeatmap.find(s => s.dayOfWeek === day && s.hourSlot === hour);
                      const count = slot ? slot.sessionCount : 0;
                      
                      // Intensity colors
                      let bgClass = 'bg-slate-100 text-slate-400';
                      if (count === 1) bgClass = 'bg-teal-100 text-teal-800 font-semibold';
                      if (count === 2) bgClass = 'bg-teal-300 text-teal-900 font-semibold';
                      if (count === 3) bgClass = 'bg-teal-500 text-white font-bold';
                      if (count >= 4) bgClass = 'bg-amber-500 text-white font-extrabold shadow-sm';

                      return (
                        <div
                          key={day}
                          className={`h-8 rounded flex items-center justify-center transition-all ${bgClass}`}
                          title={`${day} ${hour}: ${count} session(s)`}
                        >
                          {count > 0 ? count : '-'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-slate-100 border"></div> Empty</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-teal-100"></div> Low</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-teal-300"></div> Medium</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-teal-500"></div> High</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-amber-500"></div> Peak</div>
              </div>
            </div>
          </div>

          {/* Burnout Risk Assessment & Recommendations */}
          {caseloadData && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Burnout Risk & Recommended Interventions</h3>
              <p className="text-xs text-slate-500 mb-4">Proactive clinical workload distribution guidance</p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Contributing Stressors
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                    {caseloadData.burnoutRisk.contributingFactors.slice(0, expandedLists['stressors'] ? undefined : 5).map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                  {caseloadData.burnoutRisk.contributingFactors.length > 5 && (
                    <button 
                      onClick={() => toggleList('stressors')}
                      className="mt-2 text-xs text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1"
                    >
                      {expandedLists['stressors'] ? (
                        <><ChevronUp className="h-3 w-3" /> Show Less</>
                      ) : (
                        <><ChevronDown className="h-3 w-3" /> Show All ({caseloadData.burnoutRisk.contributingFactors.length})</>
                      )}
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                    Recommended Schedule Adjustments
                  </h4>
                  <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
                    {caseloadData.burnoutRisk.recommendedActions.slice(0, expandedLists['actions'] ? undefined : 5).map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                  {caseloadData.burnoutRisk.recommendedActions.length > 5 && (
                    <button 
                      onClick={() => toggleList('actions')}
                      className="mt-2 text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
                    >
                      {expandedLists['actions'] ? (
                        <><ChevronUp className="h-3 w-3" /> Show Less</>
                      ) : (
                        <><ChevronDown className="h-3 w-3" /> Show All ({caseloadData.burnoutRisk.recommendedActions.length})</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
