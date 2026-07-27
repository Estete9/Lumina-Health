'use client';

import React, { useState } from 'react';
import { PracticeDynamicsData } from '@/lib/types';
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { CircularKPICard } from './CircularKPICard';

interface Props {
  data: PracticeDynamicsData;
}

export const PracticeDynamicsTab: React.FC<Props> = ({ data }) => {
  const [funnelExpanded, setFunnelExpanded] = useState(false);
  const displayFunnel = funnelExpanded ? data.retentionFunnel : data.retentionFunnel.slice(0, 5);

  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const displayAttendance = attendanceExpanded ? data.monthlyAttendance : data.monthlyAttendance.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CircularKPICard
          title="Overall Retention"
          subtext="Patients completing protocol"
          percentage={data.overallRetentionRate}
          colorHex="#e11d48"
          legendActive="Retained"
          legendGoal="Target"
        />
        <CircularKPICard
          title="Attendance Rate"
          subtext="Scheduled vs Attended"
          percentage={92}
          colorHex="#0284c7"
          legendActive="Attended"
          legendGoal="Expected"
        />
        <CircularKPICard
          title="Cancellation Rate"
          subtext="Overall cancellation rate"
          percentage={data.cancellationMetrics.cancellationRate}
          colorHex="#d97706"
          legendActive="Cancelled"
          legendGoal="Tolerance"
        />
      </div>

      {/* Retention Funnel Visual */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-600" />
          Patient Retention Treatment Funnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {displayFunnel.map((stage, idx) => (
            <div key={stage.stageId} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center relative">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stage {idx + 1}</span>
              <h4 className="text-sm font-bold text-slate-800 mt-1">{stage.stageName}</h4>
              <div className="text-2xl font-extrabold text-sky-700 mt-2">{stage.patientCount}</div>
              <div className="text-xs text-slate-500 mt-1">{stage.conversionRate}% Retention</div>
              {stage.dropoffRate > 0 && (
                <div className="text-[10px] text-rose-500 font-medium mt-1">-{stage.dropoffRate}% drop-off</div>
              )}
            </div>
          ))}
        </div>
        {data.retentionFunnel.length > 5 && (
          <button
            onClick={() => setFunnelExpanded(!funnelExpanded)}
            className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {funnelExpanded ? "Show Less" : `+ Show All (${data.retentionFunnel.length})`}
          </button>
        )}
      </div>

      {/* Monthly Attendance & Cancellation Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            Monthly Session Attendance Breakdown
          </h3>
          <div className="space-y-4">
            {displayAttendance.map(item => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.month} ({item.scheduledSessions} Scheduled)</span>
                  <span className="text-sky-600">{item.attendanceRate}% Attended</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                  <div style={{ width: `${(item.attendedSessions / item.scheduledSessions) * 100}%` }} className="bg-emerald-500" title="Attended" />
                  <div style={{ width: `${(item.cancelledSessions / item.scheduledSessions) * 100}%` }} className="bg-amber-500" title="Cancelled" />
                  <div style={{ width: `${(item.noShowSessions / item.scheduledSessions) * 100}%` }} className="bg-rose-500" title="No Show" />
                </div>
              </div>
            ))}
          </div>
          {data.monthlyAttendance.length > 5 && (
            <button
              onClick={() => setAttendanceExpanded(!attendanceExpanded)}
              className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {attendanceExpanded ? "Show Less" : `+ Show All (${data.monthlyAttendance.length})`}
            </button>
          )}
        </div>

        {/* Cancellation Metrics Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Cancellation Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500">Overall Cancellation Rate</span>
                <div className="text-2xl font-bold text-slate-800">{data.cancellationMetrics.cancellationRate}%</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(data.cancellationMetrics.cancellationRate * 5, 100)}%` }} />
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Late Cancellations (&lt;24h)</span>
                <div className="text-sm font-semibold text-amber-600">{data.cancellationMetrics.lateCancellations} sessions</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Top Reported Reason</span>
                <div className="text-sm font-medium text-slate-700">{data.cancellationMetrics.topReason}</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-emerald-600 font-medium flex items-center mt-4">
            <span>{data.cancellationMetrics.vsPreviousMonthChange}% vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};
