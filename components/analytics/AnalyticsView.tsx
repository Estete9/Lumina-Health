'use client';

import React from 'react';
import { PractitionerAnalytics } from '@/lib/types';
import { Users, FileText, Activity, CheckCircle } from 'lucide-react';

interface AnalyticsViewProps {
  data: PractitionerAnalytics;
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
  const stats = [
    { name: 'Total Patients', value: data.totalPatients ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Active Caseload', value: data.activePatients ?? 0, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Total Sessions Completed', value: data.totalSessionsCompleted ?? 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Total Notes Logged', value: data.totalNotesCount ?? 0, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice Analytics & Insights</h1>
        <p className="text-slate-500 mt-1 text-sm">Clean canvas ready for custom clinical and operational metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Ready to Build</h2>
          <p className="text-slate-500">
            The analytics hub is reset and ready for purpose-built practitioner metrics. 
            Connect your components here to visualize clinical outcomes and practice dynamics.
          </p>
        </div>
      </div>
    </div>
  );
}
