'use client';

import React from 'react';
import { ClinicalOutcomesData } from '@/lib/types';
import { Activity, TrendingDown, CheckCircle2, HeartPulse } from 'lucide-react';

interface Props {
  data: ClinicalOutcomesData;
}

export const ClinicalOutcomesTab: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.metrics.map(metric => (
          <div key={metric.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-medium">{metric.title}</span>
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {metric.currentValue}{metric.unit}
            </div>
            <div className="flex items-center text-xs mt-2 text-emerald-600 font-medium">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>+{metric.changePercentage}% improvement vs baseline ({metric.baselineAvg})</span>
            </div>
          </div>
        ))}
        {/* Extra Card for Active Tracked Patients to match typical 3-card layout */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Active Tracked Patients</span>
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {data.activeTrackedPatients}
          </div>
          <div className="flex items-center text-xs mt-2 text-slate-500 font-medium">
            <span>Currently enrolled in outcome tracking</span>
          </div>
        </div>
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
            {data.severityTrends.map(point => (
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
        </div>

        {/* DSM-5 Ailment Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Ailment Response & Improvement Rate
          </h3>
          <div className="space-y-4">
            {data.ailmentDistribution.map(item => (
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
        </div>
      </div>
    </div>
  );
};
