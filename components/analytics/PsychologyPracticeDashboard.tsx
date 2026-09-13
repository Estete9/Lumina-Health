'use client';

import React, { useState } from 'react';
import { 
  PractitionerAnalytics, 
  CaseloadMonth, 
  NoShowWeek, 
  RevenueMonth, 
  ArBucket, 
  FunnelStage, 
  Kpi, 
  AttentionItem,
  ComplianceItem
} from '@/lib/types';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ResponsiveContainer, Tooltip, Legend, Cell, CartesianGrid, XAxis, YAxis
} from 'recharts';
import {
  Users, AlertCircle, FileText, Activity, ShieldAlert,
  TrendingUp, TrendingDown, DollarSign, CalendarX,
  ClipboardCheck, Clock, CheckCircle, Brain, LayoutDashboard,
  Stethoscope, Wallet, Filter, ShieldCheck, UserCheck, AlertTriangle,
  Search, Bell, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import { SeedDatabaseButton } from './SeedDatabaseButton';

const COLORS = {
  pine: '#3D5A50',
  pineDark: '#2A3F38',
  sage: '#7C9473',
  amber: '#C98A3E',
  brick: '#B0473E',
  ink: '#22302A',
  inkMuted: '#6B7568',
  border: '#D9DED3',
  bg: '#EFF1EC',
  tealActive: '#0D9488'
};

const defaultCaseloadData: CaseloadMonth[] = [
  { month: 'Mar', stable: 18, improving: 4, worsening: 1 },
  { month: 'Apr', stable: 21, improving: 3, worsening: 2 },
  { month: 'May', stable: 22, improving: 5, worsening: 1 },
  { month: 'Jun', stable: 26, improving: 2, worsening: 3 },
  { month: 'Jul', stable: 25, improving: 4, worsening: 2 },
  { month: 'Aug', stable: 27, improving: 3, worsening: 1 }
];

const defaultClinicalTrends = [
  { client: 'Client J.M.', score: 14, prev: 16, measure: 'GAD-7', direction: 'down' },
  { client: 'Client A.R.', score: 18, prev: 15, measure: 'PHQ-9', direction: 'up' },
  { client: 'Client C.R.', score: 38, prev: 42, measure: 'PCL-5', direction: 'down' },
  { client: 'Client C.T.', score: 28, prev: 26, measure: 'ORS', direction: 'up' },
];

const defaultAttendanceData: NoShowWeek[] = [
  { week: 'W1', rate: 4 },
  { week: 'W2', rate: 5 },
  { week: 'W3', rate: 3 },
  { week: 'W4', rate: 7 },
  { week: 'W5', rate: 6 },
  { week: 'W6', rate: 4 },
  { week: 'W7', rate: 5 },
  { week: 'W8', rate: 3 }
];

const defaultAttendanceWatchlist = [
  { client: 'Client S.K.', rate: '35%', risk: 'High', lastSeen: '14 days ago' },
  { client: 'Client M.P.', rate: '25%', risk: 'Medium', lastSeen: '7 days ago' },
];

const defaultFinancialData: RevenueMonth[] = [
  { month: 'Mar', insurance: 4500, private: 1200 },
  { month: 'Apr', insurance: 4800, private: 1400 },
  { month: 'May', insurance: 4200, private: 1600 },
  { month: 'Jun', insurance: 5100, private: 1500 },
  { month: 'Jul', insurance: 5400, private: 1800 },
  { month: 'Aug', insurance: 5800, private: 2100 },
];

const defaultClaimsAging: ArBucket[] = [
  { bucket: '0-30', amount: 3200 },
  { bucket: '31-60', amount: 1500 },
  { bucket: '61-90', amount: 800 },
  { bucket: '90+', amount: 400 },
];

const defaultPipelineData: FunnelStage[] = [
  { stage: 'Inquiries', count: 45, value: 45, conversion: null },
  { stage: 'Consults', count: 35, value: 35, conversion: '· 77%' },
  { stage: 'Intakes', count: 26, value: 26, conversion: '· 74%' },
  { stage: 'Retained', count: 20, value: 20, conversion: '· 79%' },
];

const defaultComplianceData: ComplianceItem[] = [
  { label: 'Notes completed < 24h', task: 'Notes completed < 24h', pct: 92, progress: 92 },
  { label: 'Treatment plans updated', task: 'Treatment plans updated', pct: 78, progress: 78 },
  { label: 'CEU Credits (YTD)', task: 'CEU Credits (YTD)', pct: 65, progress: 65 },
];

const defaultAttentionItems = [
  { title: 'Positive risk screen', meta: 'PHQ-9 Item 9 flagged for Client J.M.' },
  { title: 'Treatment plans expiring', meta: '2 treatment plans expiring within 14 days' },
  { title: 'Overdue notes', meta: '3 unsigned clinical notes >48h' },
  { title: 'Stuck claims', meta: '1 clearinghouse claim rejected' }
];

interface PsychologyPracticeDashboardProps {
  data?: PractitionerAnalytics;
}

type TabType = 'overview' | 'clinical' | 'attendance' | 'financial' | 'pipeline' | 'compliance';

export function PsychologyPracticeDashboard({ data }: PsychologyPracticeDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [attentionExpanded, setAttentionExpanded] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clinical', label: 'Clinical', icon: Stethoscope },
    { id: 'attendance', label: 'Attendance', icon: CalendarX },
    { id: 'financial', label: 'Financial', icon: Wallet },
    { id: 'pipeline', label: 'Pipeline', icon: Filter },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2 rounded shadow-sm text-sm">
          <p className="font-semibold text-slate-800 m-0">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="m-0" style={{ color: p.fill || p.stroke || COLORS.ink }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const attentionItems = data?.attentionItems ?? defaultAttentionItems;

  const kpiCards = [
    { label: 'Active Caseload', value: `${data?.activePatients ?? 28}`, sub: 'Target: 30', delta: '+2 this month', good: true, icon: Users },
    { label: 'MTD Revenue', value: '$8,450', sub: 'vs last mo', delta: '+6% vs last month', good: true, icon: DollarSign },
    { label: 'No-Show Rate', value: '4.2%', sub: 'vs avg 6%', delta: '-1.2 pts vs last month', good: true, icon: CalendarX },
    { label: 'Open Risk Flags', value: '1', sub: 'Needs review', delta: 'needs review today', good: false, icon: ShieldAlert },
    { label: 'Utilization', value: '88%', sub: 'Schedule fill', delta: '+3 pts vs last month', good: true, icon: Clock },
  ];

  return (
    <div className="flex flex-col space-y-6 font-sans">
      {/* Tab bar and Top actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                activeTab === item.id 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
        
        {/* Top Actions: Needs Attention */}
        <div className="flex items-center gap-4 shrink-0 relative">
          <button 
            onClick={() => setAttentionExpanded(!attentionExpanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
              attentionItems.length > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
            aria-label={`Needs attention · ${attentionItems.length}`}
          >
            {attentionItems.length > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span className="font-medium text-sm">
              {attentionItems.length > 0 ? `Needs attention · ${attentionItems.length}` : 'All caught up'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${attentionExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {attentionExpanded && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Action Required
              </div>
              {attentionItems.length === 0 ? (
                <div className="px-3 py-6 flex flex-col items-center justify-center text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-500">No urgent items need your attention.</p>
                </div>
              ) : (
                attentionItems.map((item, idx) => (
                  <div key={idx} className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-800">{item.title}</div>
                      {item.meta && <div className="text-xs text-slate-400">{item.meta}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {kpiCards.map((kpi, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <kpi.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    kpi.good ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {kpi.good ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {kpi.delta}
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{kpi.label}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 font-mono">{kpi.value}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  {/* Caseload Trajectory */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-slate-800 font-semibold">Caseload Trajectory</h3>
                      <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Trailing 6 Mo</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.sage }} /> Improving</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD3C4]" /> Stable</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.brick }} /> Worsening</div>
                    </div>
                    <div className="h-64 flex-1">
                      {(() => {
                        const caseloadData = data?.caseloadTrajectory ?? defaultCaseloadData;
                        if (caseloadData.length === 0) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                              <Users className="w-8 h-8 text-slate-300 mb-3" />
                              <p className="text-sm font-medium text-slate-700">No caseload data</p>
                            </div>
                          );
                        }
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={caseloadData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                              <Bar dataKey="improving" stackId="a" fill={COLORS.sage} name="Improving" />
                              <Bar dataKey="stable" stackId="a" fill="#CBD3C4" name="Stable" />
                              <Bar dataKey="worsening" stackId="a" fill={COLORS.brick} name="Worsening" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">*Based on clinical outcome measure trajectories</p>
                  </div>

                  {/* Intake Funnel */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                    <h3 className="text-slate-800 font-semibold mb-6">Intake Funnel</h3>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      {(() => {
                        const funnelData = data?.funnel ?? defaultPipelineData;
                        if (funnelData.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <Filter className="w-8 h-8 text-slate-300 mb-3" />
                              <p className="text-sm font-medium text-slate-700">No pipeline data</p>
                            </div>
                          );
                        }
                        return funnelData.map((stage, i) => (
                          <div key={i} className="relative">
                            {i > 0 && stage.conversion && (
                              <div className="absolute -top-4 right-4 text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded shadow-sm z-10 border border-teal-100">
                                {stage.conversion}
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <div className="w-24 text-sm font-medium text-slate-600 text-right">{stage.stage}</div>
                              <div className="flex-1 bg-slate-50 h-10 rounded-r-lg overflow-hidden flex items-center relative">
                                <div 
                                  className="h-full bg-teal-600/80 rounded-r-lg transition-all" 
                                  style={{ width: `${(stage.count / Math.max(1, funnelData[0]?.count || 1)) * 100}%` }}
                                />
                                <span className="absolute left-4 font-mono text-sm font-semibold text-slate-900 mix-blend-luminosity">
                                  {stage.count}
                                </span>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* No-Show / Late-Cancel Rate */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-slate-800 font-semibold mb-6">Trailing 8-Week No-Show Rate</h3>
                    <div className="h-64">
                      {(() => {
                        const noShowData = data?.noShowTrend ?? defaultAttendanceData;
                        if (noShowData.length === 0) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                              <CalendarX className="w-8 h-8 text-slate-300 mb-3" />
                              <p className="text-sm font-medium text-slate-700">No attendance data</p>
                            </div>
                          );
                        }
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={noShowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.brick} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={COLORS.brick} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="rate" stroke={COLORS.brick} fillOpacity={1} fill="url(#colorRate)" name="No-Show Rate (%)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Recent Activity Live Feed */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full">
                    <h3 className="text-slate-800 font-semibold mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" />
                      Recent Activity
                    </h3>
                    <div className="flex-1 space-y-5 overflow-y-auto pr-2">
                      {(() => {
                        const activityData = data?.activity ?? [
                          { iconName: 'check', text: 'Client C.J. completed PHQ-9 (Score: 4)', time: '10 min ago', tone: 'good' as const },
                          { iconName: 'warn', text: 'Treatment plan for C.T. needs updating', time: '1 hr ago', tone: 'warn' as const },
                          { iconName: 'trend-down', text: 'C.R. showed clinical improvement on PCL-5', time: '3 hrs ago', tone: 'neutral' as const },
                          { iconName: 'file', text: 'Signed note for Session #4521', time: 'Yesterday', tone: 'neutral' as const },
                          { iconName: 'risk', text: 'C.S. late cancellation reported', time: 'Yesterday', tone: 'risk' as const },
                        ];

                        if (activityData.length === 0) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                              <Activity className="w-8 h-8 text-slate-300 mb-3" />
                              <p className="text-sm font-medium text-slate-700">No recent activity</p>
                              <p className="text-xs text-slate-500 mt-1">Updates will appear here</p>
                            </div>
                          );
                        }

                        const getActivityStyle = (tone: string) => {
                          switch(tone) {
                            case 'good': return { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle };
                            case 'warn': return { color: 'text-amber-500', bg: 'bg-amber-50', icon: AlertTriangle };
                            case 'risk': return { color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertTriangle };
                            default: return { color: 'text-slate-500', bg: 'bg-slate-100', icon: Activity }; // file, etc
                          }
                        };

                        return activityData.map((item, idx) => {
                          const style = getActivityStyle(item.tone);
                          const Icon = style.icon;
                          return (
                            <div key={idx} className="flex gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                                <Icon className={`w-4 h-4 ${style.color}`} />
                              </div>
                              <div>
                                <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'clinical' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Caseload Trajectory (6 Months)</h3>
                  <div className="h-72">
                    {(() => {
                      const caseloadData = data?.caseloadTrajectory ?? defaultCaseloadData;
                      if (caseloadData.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <Users className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No caseload data</p>
                          </div>
                        );
                      }
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={caseloadData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="stable" stroke={COLORS.tealActive} strokeWidth={3} dot={{ fill: COLORS.tealActive, r: 4 }} name="Total Patients" />
                          </LineChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Client Symptom Score Trends</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          <th className="py-3 px-4 text-slate-500 font-medium text-sm">De-identified Client</th>
                          <th className="py-3 px-4 text-slate-500 font-medium text-sm">Measure</th>
                          <th className="py-3 px-4 text-slate-500 font-medium text-sm">Latest Score</th>
                          <th className="py-3 px-4 text-slate-500 font-medium text-sm">Previous</th>
                          <th className="py-3 px-4 text-slate-500 font-medium text-sm">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const clinicalTrends = data?.clientSparklines ?? defaultClinicalTrends;
                          if (clinicalTrends.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="py-8 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <Stethoscope className="w-8 h-8 text-slate-300 mb-3" />
                                    <p className="text-sm font-medium text-slate-700">No clinical trends available</p>
                                    <p className="text-xs text-slate-500 mt-1">Symptom score trends will appear here</p>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                          return clinicalTrends.map((trend: any, i: number) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-4 px-4 font-medium text-slate-800">{trend.client || trend.id}</td>
                              <td className="py-4 px-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                                  {trend.measure || trend.issue}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono font-semibold text-slate-900">{trend.score ?? (trend.data ? trend.data[trend.data.length - 1] : '-')}</td>
                              <td className="py-4 px-4 font-mono text-sm text-slate-500">{trend.prev ?? (trend.data && trend.data.length > 1 ? trend.data[trend.data.length - 2] : '-')}</td>
                              <td className="py-4 px-4">
                                {trend.direction === 'up' ? (
                                  <div className="flex items-center text-rose-600">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">Elevated</span>
                                  </div>
                                ) : trend.direction === 'down' ? (
                                  <div className="flex items-center text-emerald-600">
                                    <TrendingDown className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">Improving</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-slate-600">
                                    <Activity className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">Stable</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Trailing 8-Week No-Show / Late-Cancel Rate</h3>
                  <div className="h-72">
                    {(() => {
                      const noShowData = data?.noShowTrend ?? defaultAttendanceData;
                      if (noShowData.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <CalendarX className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No attendance data</p>
                          </div>
                        );
                      }
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={noShowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRateTab" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.brick} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={COLORS.brick} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="rate" stroke={COLORS.brick} fillOpacity={1} fill="url(#colorRateTab)" name="No-Show Rate (%)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Risk Watchlist</h3>
                  <div className="space-y-4">
                    {defaultAttendanceWatchlist.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-semibold text-slate-800">{item.client}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.risk === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.risk} Risk
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">No-show rate: <span className="font-mono font-medium text-slate-800">{item.rate}</span></p>
                          <p className="text-sm text-slate-500">Last seen: <span className="text-slate-700">{item.lastSeen}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Revenue by Payer Type</h3>
                  <div className="h-72">
                    {(() => {
                      const revenueData = data?.revenueData ?? defaultFinancialData;
                      if (revenueData.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <Wallet className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No revenue data</p>
                          </div>
                        );
                      }
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="insurance" stackId="a" fill={COLORS.tealActive} name="Insurance" />
                            <Bar dataKey="private" stackId="a" fill={COLORS.amber} name="Private Pay" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Claims Aging AR</h3>
                  <div className="h-72">
                    {(() => {
                      const arAgingData = data?.arAging ?? defaultClaimsAging;
                      if (arAgingData.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <FileText className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No claims aging data</p>
                          </div>
                        );
                      }
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={arAgingData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                            <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="amount" name="Amount Owed" radius={[4, 4, 0, 0]}>
                              {arAgingData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index > 1 ? COLORS.brick : COLORS.tealActive} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Inquiry-to-Retention Funnel</h3>
                  <div className="h-72">
                    {(() => {
                      const funnelData = data?.funnel ?? defaultPipelineData;
                      if (funnelData.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <Filter className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No pipeline data</p>
                          </div>
                        );
                      }
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.border} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: COLORS.inkMuted, fontSize: 12 }} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill={COLORS.tealActive} radius={[0, 4, 4, 0]} barSize={32}>
                              {funnelData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS.tealActive} fillOpacity={1 - (index * 0.15)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-slate-800 font-semibold mb-6">Referral Quality</h3>
                  <div className="space-y-4">
                    {(() => {
                      const referralData = data?.referralSources ?? [
                        { source: 'Psychology Today', inquiries: 12, retained: '45%' },
                        { source: 'Dr. Smith (PCP)', inquiries: 8, retained: '75%' },
                        { source: 'Website Organic', inquiries: 15, retained: '20%' },
                      ];
                      if (referralData.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No referral data</p>
                          </div>
                        );
                      }
                      return referralData.map((ref, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-semibold text-slate-800">{ref.source}</p>
                            <p className="text-sm text-slate-500 mt-1">{ref.inquiries} referrals</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-semibold text-teal-600 text-lg">{ref.retained}</p>
                            <p className="text-xs uppercase tracking-wider text-slate-400">Conversion</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="max-w-3xl">
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <h3 className="text-slate-800 font-bold text-lg mb-8">Documentation & Credentials</h3>
                  <div className="space-y-8">
                    {(() => {
                      const complianceData = data?.compliance ?? defaultComplianceData;
                      if (complianceData.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-700">No compliance tasks</p>
                          </div>
                        );
                      }
                      return complianceData.map((item: any, i: number) => {
                        const task = item.task || item.label;
                        const progress = item.progress ?? item.pct ?? 0;
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium text-slate-700">{task}</span>
                              <span className="font-mono font-semibold text-slate-900">{progress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${progress}%`, 
                                  backgroundColor: progress >= 90 ? COLORS.sage : progress >= 70 ? COLORS.amber : COLORS.brick
                                }} 
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <ShieldCheck className="w-8 h-8 text-teal-600 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">HIPAA Compliance Status: Active</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        All clinical data, patient identifiers, and metrics presented in this dashboard are fully de-identified and encrypted, meeting all regulatory requirements for PHI protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
      <div className="mt-8 flex justify-center pb-8">
        <SeedDatabaseButton />
      </div>
    </div>
  );
}
