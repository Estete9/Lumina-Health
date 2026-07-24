import { Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { RecentNotes } from '@/components/dashboard/RecentNotes';
import { getDashboardStats } from '@/lib/services/dashboardService';

export default async function DashboardPage() {
  const { data: stats, error } = await getDashboardStats();

  if (error || !stats) {
    return <div className="p-4 text-rose-500">Failed to load dashboard statistics.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Practitioner Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, Dr. Jenkins. Here is your daily overview.</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-700 transition-colors"
        >
          + New Clinical Note
        </button>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Patients"
          value={stats.activePatientsCount}
          change="Updated just now"
          icon={Users}
          accentColor="teal"
        />
        <StatCard
          title="Today's Sessions"
          value={stats.upcomingAppointmentsCount}
          change="Scheduled"
          icon={Calendar}
          accentColor="indigo"
        />
        <StatCard
          title="Pending Notes"
          value={stats.notesWrittenThisWeek}
          change="Written this week"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Attention Flags"
          value="1"
          change="Urgent review"
          icon={AlertCircle}
          accentColor="rose"
        />
      </div>

      {/* Dashboard Main Grid Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UpcomingAppointments appointments={stats.recentAppointments} />
        <RecentNotes patients={stats.recentPatients} />
      </div>
    </div>
  );
}
