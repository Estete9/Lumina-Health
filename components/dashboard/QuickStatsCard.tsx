import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  accentColor: 'teal' | 'emerald' | 'indigo';
}

export default function QuickStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor
}: QuickStatsCardProps) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600 border-teal-200/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/50'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
