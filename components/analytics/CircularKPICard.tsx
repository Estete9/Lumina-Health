import React from 'react';

interface CircularKPICardProps {
  title: string;
  subtext: string;
  percentage: number;
  colorHex: string;
  legendActive: string;
  legendGoal: string;
}

export function CircularKPICard({ title, subtext, percentage, colorHex, legendActive, legendGoal }: CircularKPICardProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-between text-center">
      {/* Top Section: Circular Donut Ring */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-slate-100"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={colorHex}
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
        </div>
      </div>

      {/* Middle Section: Title & Subtext */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtext}</p>
      </div>

      {/* Bottom Section: Legend */}
      <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 w-full pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorHex }}></span>
          <span>{legendActive}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
          <span>{legendGoal}</span>
        </div>
      </div>
    </div>
  );
}
