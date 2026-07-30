'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  HeartPulse,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patient Roster', href: '/patients', icon: Users },
  { name: 'Schedule & Calendar', href: '/calendar', icon: Calendar },
  { name: 'Clinical Notes', href: '/notes', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className={cn(
      "flex h-screen flex-col border-r border-slate-200 bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-slate-800 px-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-slate-950 font-bold">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className={cn("overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out", isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3")}>
          <h1 className="text-base font-bold tracking-tight text-white">Lumina Health</h1>
          <p className="text-xs text-slate-400">Practitioner Portal</p>
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-5 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-400"
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-full overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-sm font-medium',
                isActive
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
              <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out", isCollapsed ? "w-0 opacity-0" : "opacity-100")}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account Settings */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <Link
          href="/settings"
          title={isCollapsed ? "Settings" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out"
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out", isCollapsed ? "w-0 opacity-0" : "opacity-100")}>Settings</span>
        </Link>
        <button
          type="button"
          title={isCollapsed ? "Sign Out" : undefined}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out", isCollapsed ? "w-0 opacity-0" : "opacity-100")}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
