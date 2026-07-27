'use client';

import React from 'react';
import { CaseloadCapacityData } from '@/lib/types';
import { Gauge, Flame, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Gauge & Burnout Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bandwidth Capacity Meter */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-800">
              Practitioner Bandwidth & Capacity
            </h3>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
              bandwidth.status === 'Optimal' ? 'bg-teal-50 text-teal-700 border-teal-200' :
              bandwidth.status === 'Near Capacity' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {bandwidth.status}
            </span>
          </div>
          <div className="text-center py-4">
            <div className="text-4xl font-extrabold text-slate-800">
              {bandwidth.currentActivePatients} <span className="text-lg font-normal text-slate-500">/ {bandwidth.maxCapacityThreshold} Patients</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className={`${bandwidth.status === 'Near Capacity' ? 'bg-amber-500' : bandwidth.status === 'Over Capacity' ? 'bg-rose-500' : 'bg-teal-600'} h-4 rounded-full transition-all`}
                style={{ width: `${Math.min(bandwidth.bandwidthPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {bandwidth.weeklySessionHours} weekly direct session hours out of {bandwidth.maxWeeklyHours} max recommended.
            </p>
          </div>
        </div>

        {/* Burnout Risk Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-800">
              Burnout Risk Index
            </h3>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
              burnoutRisk.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              burnoutRisk.riskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {burnoutRisk.riskLevel} ({burnoutRisk.riskScore}/100)
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Contributing Factors:</span>
              <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                {burnoutRisk.contributingFactors.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Recommended Mitigations:</span>
              <ul className="list-disc list-inside text-emerald-700 mt-1 space-y-0.5">
                {burnoutRisk.recommendedActions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
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
