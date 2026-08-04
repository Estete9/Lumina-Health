'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ShieldCheck, LogOut } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import { getCurrentUser, logout } from '@/lib/services/authService';
import { Practitioner } from '@/lib/types';

export function Header() {
  const [user, setUser] = useState<Practitioner | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        // Add a 3-second timeout to prevent infinite hang on dev server restarts
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
        );
        
        const res = await Promise.race([
          getCurrentUser(),
          timeoutPromise
        ]) as { data: Practitioner | null; error: any };
        
        if (res.data) setUser(res.data);
      } catch (e) {
        console.error('Failed to fetch user:', e);
        // No mock fallback anymore
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'P';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
      {/* Global Real-Time Search Bar Component */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <GlobalSearchBar />
      </div>

      {/* Header Actions & Practitioner Profile */}
      <div className="flex items-center gap-4">

        {/* Notifications Icon */}
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Practitioner User Profile Pill */}
        <div className="relative flex items-center gap-3 border-l border-slate-200 pl-4" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 text-left focus:outline-none rounded-md hover:bg-slate-50 p-1 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200 shadow-2xs">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800">{user?.name || 'Loading...'}</span>
                <span title="HIPAA Compliant Session">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{user?.specialty || 'General Practice'}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 top-full w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
                Signed in as<br />
                <span className="font-semibold text-slate-900 truncate block">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
