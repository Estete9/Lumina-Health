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
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toLocaleString('default', { month: 'short' }));

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
          <div className="grid gap-6 lg:grid-cols-5">
            {/* DSM-5 Diagnostic Distribution */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">DSM-5 Diagnostic Distribution</h3>
                  <p className="text-xs text-slate-500">Breakdown of primary diagnostic classifications & symptom progress</p>
                </div>
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>

              <div className="space-y-4">
                {(() => {
                  const items = clinicalData?.ailmentDistribution || [
                    { ailment: 'Generalized Anxiety Disorder', count: 8, percentage: 44, avgInitialSeverity: 7.2, avgCurrentSeverity: 3.4, improvementRate: 52.8 },
                    { ailment: 'Major Depressive Disorder', count: 6, percentage: 33, avgInitialSeverity: 8.0, avgCurrentSeverity: 4.1, improvementRate: 48.7 },
                    { ailment: 'Panic Disorder', count: 4, percentage: 23, avgInitialSeverity: 6.8, avgCurrentSeverity: 2.9, improvementRate: 57.3 },
                  ];
                  const displayedItems = expandedLists['ailmentDistribution'] ? items : items.slice(0, 5);
                  return (
                    <>
                      {displayedItems.map((item, index) => (
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
                      {items.length > 5 && (
                        <button 
                          onClick={() => toggleList('ailmentDistribution')}
                          className="mt-2 text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
                        >
                          {expandedLists['ailmentDistribution'] ? (
                            <><ChevronUp className="h-3 w-3" /> Show Less</>
                          ) : (
                            <><ChevronDown className="h-3 w-3" /> Show All ({items.length})</>
                          )}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Symptom Severity Line Trend Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Symptom Severity Line Trend</h3>
                  <p className="text-xs text-slate-500">Weekly average GAD-7 / PHQ-9 severity scores</p>
                </div>
                <Stethoscope className="h-5 w-5 text-teal-600" />
              </div>

              <div className="space-y-4">
                {(() => {
                  const items = clinicalData?.severityTrends || [
                    { period: 'Week 1', avgSeverityScore: 7.8, severeCount: 8, moderateCount: 4, mildCount: 2, remissionCount: 0 },
                    { period: 'Week 2', avgSeverityScore: 6.5, severeCount: 5, moderateCount: 6, mildCount: 3, remissionCount: 0 },
                    { period: 'Week 3', avgSeverityScore: 5.1, severeCount: 3, moderateCount: 7, mildCount: 4, remissionCount: 1 },
                    { period: 'Week 4', avgSeverityScore: 3.9, severeCount: 1, moderateCount: 5, mildCount: 7, remissionCount: 2 },
                  ];
                  const displayedItems = expandedLists['severityTrends'] ? items : items.slice(0, 5);
                  return (
                    <>
                      {displayedItems.map((pt, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-700">{pt.period}</span>
                            <span className="text-slate-600 font-semibold">{pt.avgSeverityScore} / 10</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
                            <div 
                              className="bg-teal-500 h-full transition-all" 
                              style={{ width: `${(pt.avgSeverityScore / 10) * 100}%` }}
                            />
                          </div>
                          <div className="flex gap-3 text-xs text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1" title="Severe">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              {pt.severeCount}
                            </span>
                            <span className="flex items-center gap-1" title="Moderate">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              {pt.moderateCount}
                            </span>
                            <span className="flex items-center gap-1" title="Mild">
                              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                              {pt.mildCount}
                            </span>
                            <span className="flex items-center gap-1 text-teal-600 font-medium" title="Remission">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {pt.remissionCount}
                            </span>
                          </div>
                        </div>
                      ))}
                      {items.length > 5 && (
                        <button 
                          onClick={() => toggleList('severityTrends')}
                          className="mt-2 text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
                        >
                          {expandedLists['severityTrends'] ? (
                            <><ChevronUp className="h-3 w-3" /> Show Less</>
                          ) : (
                            <><ChevronDown className="h-3 w-3" /> Show All ({items.length})</>
                          )}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                title="Billable Clinical Hours"
                subtext={practiceData.billableMetrics ? `${practiceData.billableMetrics.totalBillableHours} hrs logged this month` : "Clinical hours vs target"}
                percentage={practiceData.billableMetrics?.billablePercentage ?? 85}
                colorHex="#10b981"
                legendActive="Logged"
                legendGoal="Target"
              />
              <CircularKPICard
                title="Documentation Compliance"
                subtext={practiceData.documentationCompliance ? `${practiceData.documentationCompliance.compliancePercentage}% on-time completion` : "Notes completed on time"}
                percentage={practiceData.documentationCompliance?.compliancePercentage ?? 92}
                colorHex="#8b5cf6"
                legendActive="Compliant"
                legendGoal="Goal"
              />
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-between text-center">
                <div className="relative flex flex-col justify-center w-full h-32 mb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 w-28 text-left truncate" title="Late Cancellation">Late Cancellation</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">35%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 w-28 text-left truncate" title="Financial">Financial</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">20%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 w-28 text-left truncate" title="No Show">No Show</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">15%</span>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Top Cancellation Reasons</h3>
                  <p className="text-sm text-slate-500 mt-1">{practiceData.cancellationMetrics.cancellationRate}% cancellation rate</p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs font-medium text-transparent w-full pt-4 border-t border-slate-100 select-none"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-transparent"></span><span>Align</span></div></div>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Treatment Retention Funnel Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
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
                      <span className="flex items-center gap-1" title="Conversion"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{stage.conversionRate}%</span>
                      <span className="flex items-center gap-1" title="Drop-off"><span className="w-2 h-2 rounded-full bg-rose-500"></span>{stage.dropoffRate}%</span>
                      <span>Avg {stage.avgSessionsInStage} sessions in stage</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Attendance / Cancellations Chart */}
            {(() => {
              const baseSessions = selectedMonth === 'Jan' ? 85 : 75;
              const dataToUse = [
                { label: 'Week 1', attendedSessions: baseSessions, cancelledSessions: 12, noShowSessions: 3 },
                { label: 'Week 2', attendedSessions: baseSessions + 5, cancelledSessions: 8, noShowSessions: 2 },
                { label: 'Week 3', attendedSessions: baseSessions - 10, cancelledSessions: 15, noShowSessions: 5 },
                { label: 'Week 4', attendedSessions: baseSessions + 15, cancelledSessions: 5, noShowSessions: 1 },
              ];
              const maxSessions = Math.max(...dataToUse.map(d => d.attendedSessions + d.cancelledSessions + d.noShowSessions));
              
              let totalAttended = 0;
              let totalCancelled = 0;
              let totalNoShow = 0;
              dataToUse.forEach(d => {
                totalAttended += d.attendedSessions;
                totalCancelled += d.cancelledSessions;
                totalNoShow += d.noShowSessions;
              });
              const attendancePercentage = Math.round((totalAttended / (totalAttended + totalCancelled + totalNoShow)) * 100);

              return (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="flex flex-col mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 w-full mb-2">Monthly Attendance & Cancellations</h3>
                    <div className="flex items-center justify-between w-full">
                      <div className="text-4xl font-bold text-slate-900">
                        {attendancePercentage}%
                      </div>
                      <div className="relative">
                        <select 
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium py-1.5 pl-3 pr-8 rounded-md cursor-pointer hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="h-4 w-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col h-[256px] mt-2">
                    <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 mb-2 pt-4">
                      {dataToUse.map((m, idx) => {
                        const total = m.attendedSessions + m.cancelledSessions + (m.noShowSessions || 0);
                        const heightPct = Math.max(8, (total / (maxSessions || 1)) * 100);
                        const attendedPct = (m.attendedSessions / total) * 100;
                        const cancelledPct = (m.cancelledSessions / total) * 100;
                        const noShowPct = ((m.noShowSessions || 0) / total) * 100;

                        return (
                          <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                            <div 
                              className="w-full max-w-[40px] flex flex-col justify-end rounded-t-md overflow-hidden relative shadow-sm" 
                              style={{ height: `${heightPct}%` }}
                            >
                              <div 
                                className="bg-indigo-200 transition-all group-hover:brightness-95 border-b-2 border-white/80 relative"
                                style={{ height: `${noShowPct}%` }}
                                title={`No-Show: ${m.noShowSessions || 0}`}
                              />
                              <div 
                                className="bg-indigo-500 transition-all group-hover:brightness-110 border-b-2 border-white/80 relative"
                                style={{ height: `${cancelledPct}%` }}
                                title={`Cancelled: ${m.cancelledSessions}`}
                              />
                              <div 
                                className="bg-indigo-900 transition-all group-hover:brightness-125 relative"
                                style={{ height: `${attendedPct}%` }}
                                title={`Attended: ${m.attendedSessions}`}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-medium mt-3 whitespace-nowrap">{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-center gap-5 text-[11px] sm:text-xs font-medium text-slate-600 mt-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-900 shadow-sm"></span> Attended</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm"></span> Cancelled</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-200 shadow-sm"></span> No-Show</div>
                    </div>
                  </div>
                </div>
              );
            })()}
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
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Weekly Workload Density Heatmap */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
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

            {/* Bandwidth Capacity Dial Gauge */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
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
                  <ul className="space-y-1 text-xs text-amber-800">
                    {caseloadData.burnoutRisk.contributingFactors.slice(0, expandedLists['stressors'] ? undefined : 5).map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>{factor}</li>
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
                  <ul className="space-y-1 text-xs text-emerald-800">
                    {caseloadData.burnoutRisk.recommendedActions.slice(0, expandedLists['actions'] ? undefined : 5).map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>{action}</li>
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
