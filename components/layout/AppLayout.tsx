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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      let sessionRes; try { sessionRes = await getSession(); } catch (err) { console.error('CRASH:', err); sessionRes = { data: null, error: err.message }; }
      if (!isMounted) return;

      const hasSession = Boolean(sessionRes.data && sessionRes.data.user);

      if (isAuthPage && hasSession) {
        // Authenticated users shouldn't see login/register; redirect to dashboard
        router.push('/');
      } else if (!isAuthPage && !hasSession) {
        // Unauthenticated users visiting protected routes; redirect to login
        router.push('/login');
      }

      setIsCheckingAuth(false);
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

  // Brief loading placeholder during initial auth check
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <span>Verifying practice session...</span>
        </div>
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
            {children}
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
