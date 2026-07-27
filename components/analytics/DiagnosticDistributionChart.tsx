"use client";

import { useState } from 'react';
import { DiagnosticDistributionItem } from '@/lib/types';

export function DiagnosticDistributionChart({ data }: { data: DiagnosticDistributionItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayData = isExpanded ? data : data.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">Diagnostic Distribution</h3>
      <div className="space-y-4">
        {displayData.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.ailment}</span>
              <span className="text-slate-500">{item.percentage}% ({item.count})</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color || '#0d9488',
                }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-sm text-slate-500 py-4 text-center">No diagnostic data available.</div>
        )}
      </div>
      {data.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          {isExpanded ? "Show Less" : `+ Show All (${data.length})`}
        </button>
      )}
    </div>
  );
}
