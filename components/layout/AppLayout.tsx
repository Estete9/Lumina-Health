"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getSession } from '@/lib/services/authService';
import { Plus } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try { 
        const sessionRes = await getSession();
        if (!isMounted) return;
        const hasSession = Boolean(sessionRes.data && sessionRes.data.user);
        if (isAuthPage && hasSession) {
          router.push('/');
        } else if (!isAuthPage && !hasSession) {
          router.push('/login');
        }
      } catch (err) {
        console.error('CRASH:', err);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <React.Suspense fallback={
              <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  <span className="text-sm font-medium animate-pulse">Loading workspace...</span>
                </div>
              </div>
            }>
              {children}
            </React.Suspense>
          </div>
        </main>
      </div>
      
      {/* Global Booking FAB */}
      <button
        onClick={() => router.push('/calendar?new=true')}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Book</span>
      </button>
    </div>
  );
}
