'use client';

import React, { useState } from 'react';
import { ClinicalOutcomesData } from '@/lib/types';
import { Activity, TrendingDown, CheckCircle2, HeartPulse } from 'lucide-react';
import { CircularKPICard } from './CircularKPICard';

interface Props {
  data: ClinicalOutcomesData;
}

export const ClinicalOutcomesTab: React.FC<Props> = ({ data }) => {
  const [severityExpanded, setSeverityExpanded] = useState(false);
  const displaySeverity = severityExpanded ? data.severityTrends : data.severityTrends.slice(0, 5);

  const [ailmentExpanded, setAilmentExpanded] = useState(false);
  const displayAilment = ailmentExpanded ? data.ailmentDistribution : data.ailmentDistribution.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CircularKPICard
          title="Overall Improvement"
          subtext="Average severity reduction"
          percentage={65}
          colorHex="#e11d48"
          legendActive="Improved"
          legendGoal="Target"
        />
        <CircularKPICard
          title="Symptom Remission"
          subtext="Patients reaching sub-clinical"
          percentage={82}
          colorHex="#0284c7"
          legendActive="Remission"
          legendGoal="Target"
        />
        <CircularKPICard
          title="Outcome Tracking"
          subtext="Patients with active tracking"
          percentage={90}
          colorHex="#d97706"
          legendActive="Tracked"
          legendGoal="Expected"
        />
      </div>
      {/* Severity Line Trend & Ailment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Line Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            Symptom Severity Trend (PHQ-9 / GAD-7)
          </h3>
          <div className="space-y-4">
            {displaySeverity.map(point => (
              <div key={point.period} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{point.period}</span>
                  <span className="text-teal-700 font-bold">{point.avgSeverityScore} / 10 Avg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                  <div style={{ width: `${(point.severeCount / 14) * 100}%` }} className="bg-rose-500" title="Severe" />
                  <div style={{ width: `${(point.moderateCount / 14) * 100}%` }} className="bg-amber-500" title="Moderate" />
                  <div style={{ width: `${(point.mildCount / 14) * 100}%` }} className="bg-sky-500" title="Mild" />
                  <div style={{ width: `${(point.remissionCount / 14) * 100}%` }} className="bg-emerald-500" title="Remission" />
                </div>
              </div>
            ))}
          </div>
          {data.severityTrends.length > 5 && (
            <button
              onClick={() => setSeverityExpanded(!severityExpanded)}
              className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {severityExpanded ? "Show Less" : `+ Show All (${data.severityTrends.length})`}
            </button>
          )}
        </div>

        {/* DSM-5 Ailment Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Ailment Response & Improvement Rate
          </h3>
          <div className="space-y-4">
            {displayAilment.map(item => (
              <div key={item.ailment} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{item.ailment} ({item.count} patients)</span>
                  <span className="text-emerald-600 font-bold">-{item.improvementRate}% Severity</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
          {data.ailmentDistribution.length > 5 && (
            <button
              onClick={() => setAilmentExpanded(!ailmentExpanded)}
              className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {ailmentExpanded ? "Show Less" : `+ Show All (${data.ailmentDistribution.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
