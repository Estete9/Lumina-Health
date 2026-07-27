'use client';

import React, { useState } from 'react';
import { CaseloadCapacityData } from '@/lib/types';
import { Gauge, Flame, ShieldCheck, AlertTriangle, CheckSquare } from 'lucide-react';
import { CircularKPICard } from './CircularKPICard';

interface Props {
  data: CaseloadCapacityData;
}

export const CaseloadCapacityTab: React.FC<Props> = ({ data }) => {
  const { bandwidth, workloadHeatmap, burnoutRisk } = data;

  const getHeatmapColor = (level: string) => {
    switch (level) {
      case 'empty': return 'bg-slate-100 text-slate-400';
      case 'low': return 'bg-emerald-100 text-emerald-800';
      case 'medium': return 'bg-sky-100 text-sky-800';
      case 'high': return 'bg-amber-100 text-amber-800';
      case 'peak': return 'bg-rose-100 text-rose-800 font-bold';
      default: return 'bg-slate-100';
    }
  };

  const [factorsExpanded, setFactorsExpanded] = useState(false);
  const displayFactors = factorsExpanded ? burnoutRisk.contributingFactors : burnoutRisk.contributingFactors.slice(0, 5);

  const [actionsExpanded, setActionsExpanded] = useState(false);
  const displayActions = actionsExpanded ? burnoutRisk.recommendedActions : burnoutRisk.recommendedActions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CircularKPICard
          title="Capacity Utilized"
          subtext={`${bandwidth.currentActivePatients} of ${bandwidth.maxCapacityThreshold} patients`}
          percentage={bandwidth.bandwidthPercentage}
          colorHex="#e11d48"
          legendActive="Utilized"
          legendGoal="Threshold"
        />
        <CircularKPICard
          title="Burnout Risk"
          subtext={`Risk Level: ${burnoutRisk.riskLevel}`}
          percentage={burnoutRisk.riskScore}
          colorHex="#0284c7"
          legendActive="Risk Score"
          legendGoal="Safe"
        />
        <CircularKPICard
          title="Weekly Hours"
          subtext={`${bandwidth.weeklySessionHours} of ${bandwidth.maxWeeklyHours} max hrs`}
          percentage={Math.round((bandwidth.weeklySessionHours / bandwidth.maxWeeklyHours) * 100)}
          colorHex="#d97706"
          legendActive="Logged"
          legendGoal="Max"
        />
      </div>

      {/* Burnout Risk Assessment & Recommendations */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Burnout Risk Factors & Interventions</h3>
        
        <div className="grid gap-6 md:grid-cols-2 mt-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Contributing Factors
            </h4>
            <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
              {displayFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
            {burnoutRisk.contributingFactors.length > 5 && (
              <button
                onClick={() => setFactorsExpanded(!factorsExpanded)}
                className="mt-4 w-full rounded-md border border-amber-200 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                {factorsExpanded ? "Show Less" : `+ Show All (${burnoutRisk.contributingFactors.length})`}
              </button>
            )}
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
            <h4 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              Recommended Actions
            </h4>
            <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
              {displayActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
            {burnoutRisk.recommendedActions.length > 5 && (
              <button
                onClick={() => setActionsExpanded(!actionsExpanded)}
                className="mt-4 w-full rounded-md border border-emerald-200 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                {actionsExpanded ? "Show Less" : `+ Show All (${burnoutRisk.recommendedActions.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Weekly Workload Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Weekly Session Density Workload Heatmap
        </h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-[500px]">
            <div className="text-xs font-bold text-slate-400">Time</div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <div key={day} className="text-xs font-bold text-slate-600 text-center">{day}</div>
            ))}
            {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(hour => (
              <React.Fragment key={hour}>
                <div className="text-xs text-slate-500 flex items-center">{hour}</div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                  const slot = workloadHeatmap.find(s => s.dayOfWeek === day && s.hourSlot === hour);
                  const level = slot ? slot.intensityLevel : 'empty';
                  const count = slot ? slot.sessionCount : 0;
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-9 rounded-md flex items-center justify-center text-xs transition-colors ${getHeatmapColor(level)}`}
                      title={`${day} ${hour}: ${count} session(s)`}
                    >
                      {count > 0 ? `${count} appt` : '-'}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
