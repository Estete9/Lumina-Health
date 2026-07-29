"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getSession } from '@/lib/services/authService';
import { Plus, X, FileText, Calendar, UserPlus } from 'lucide-react';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';
import { AddPatientModal } from '@/components/patients/AddPatientModal';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
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
      
      {/* Global Speed Dial FAB */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {isFabOpen && (
          <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200 items-center">
            <div className="relative group flex items-center justify-center">
              <div className="absolute right-full mr-4 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                Create a Note
              </div>
              <button
                onClick={() => { setIsNoteModalOpen(true); setIsFabOpen(false); }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 shadow-lg border border-teal-200 hover:bg-teal-100 transition-colors text-teal-700 hover:text-teal-900"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative group flex items-center justify-center">
              <div className="absolute right-full mr-4 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                Book a Session
              </div>
              <button
                onClick={() => { router.push('/calendar?new=true'); setIsFabOpen(false); }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 shadow-lg border border-teal-200 hover:bg-teal-100 transition-colors text-teal-700 hover:text-teal-900"
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            <div className="relative group flex items-center justify-center">
              <div className="absolute right-full mr-4 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                Add a New Patient
              </div>
              <button
                onClick={() => { setIsPatientModalOpen(true); setIsFabOpen(false); }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 shadow-lg border border-teal-200 hover:bg-teal-100 transition-colors text-teal-700 hover:text-teal-900"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all relative"
        >
          {isFabOpen ? <X className="w-5 h-5 animate-in spin-in-180 duration-300" /> : <Plus className="w-5 h-5 animate-in spin-in-180 duration-300" />}
        </button>
      </div>

      {/* Global Modals */}
      <NewClinicalNoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSuccess={() => {
          setIsNoteModalOpen(false);
          if (pathname === '/notes') window.location.reload();
        }}
      />
      <AddPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={(newPatient) => {
          setIsPatientModalOpen(false);
          if (newPatient) router.push(`/patients/${newPatient.id}`);
        }}
      />
    </div>
  );
}
