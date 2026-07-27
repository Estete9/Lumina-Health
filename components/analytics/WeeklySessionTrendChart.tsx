import { WeeklyTrendItem } from '@/lib/types';

export function WeeklySessionTrendChart({ data }: { data: WeeklyTrendItem[] }) {
  const maxScheduled = Math.max(...data.map(d => d.scheduledSessions), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">Weekly Session Trends</h3>
      <div className="flex h-48 items-end gap-2 justify-between">
        {data.map((item, i) => {
          const heightPctScheduled = (item.scheduledSessions / maxScheduled) * 100;
          const heightPctCompleted = (item.completedSessions / maxScheduled) * 100;
          
          return (
            <div key={i} className="flex flex-col items-center gap-2 w-full flex-1">
              <div className="relative flex h-full w-full justify-center">
                <div 
                  className="absolute bottom-0 w-3 rounded-t-sm bg-slate-200 transition-all" 
                  style={{ height: `${heightPctScheduled}%` }} 
                  title={`Scheduled: ${item.scheduledSessions}`}
                />
                <div 
                  className="absolute bottom-0 w-3 rounded-t-sm bg-teal-500 transition-all" 
                  style={{ height: `${heightPctCompleted}%` }} 
                  title={`Completed: ${item.completedSessions}`}
                />
              </div>
              <span className="text-xs text-slate-500">{item.dayOrWeek}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-slate-200"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-teal-500"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
