'use client';

import React, { useState } from 'react';
import { seedLiveDatabase } from '@/lib/services/seedService';

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedLiveDatabase();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to seed database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
          Seeding Database...
        </>
      ) : (
        'Seed Live Database'
      )}
    </button>
  );
}
