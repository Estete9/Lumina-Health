'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchGlobalResources } from '@/lib/services/searchService';
import { SearchResultItem } from '@/lib/types';
import { Search, X, User, FileText, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    const normalized = trimmed.replace(/^[@#]/, '').trim();

    if (!normalized && !trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchGlobalResources(query);
      if (res.data) {
        setResults(res.data);
        setIsOpen(true);
      }
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  const patientResults = results.filter((r) => r.type === 'patient');
  const noteResults = results.filter((r) => r.type === 'note');
  const appointmentResults = results.filter((r) => r.type === 'appointment');

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            const normalized = query.trim().replace(/^[@#]/, '').trim();
            if (normalized.length >= 1 || query.trim().length >= 1) setIsOpen(true);
          }}
          placeholder="Search patients, primary ailments, or tags (e.g. @mild)..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Dropdown Results Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 max-h-[75vh] flex flex-col">
          <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {loading ? 'Searching Practice Records...' : `Results (${results.length} found)`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Press Esc to dismiss</span>
          </div>

          <div className="overflow-y-auto p-2 space-y-3 [scrollbar-width:thin]">
            {results.length === 0 && !loading && (
              <div className="p-6 text-center text-slate-500 text-xs">
                No matching patients, clinical notes, or sessions found for "<span className="font-semibold text-slate-700">{query}</span>".
              </div>
            )}

            {/* Patients Category */}
            {patientResults.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-teal-600" />
                  <span>Patients ({patientResults.length})</span>
                </div>
                {patientResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md capitalize">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Clinical Notes Category */}
            {noteResults.length > 0 && (
              <div className="space-y-1 border-t border-slate-100 pt-2">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-600" />
                  <span>Clinical Notes ({noteResults.length})</span>
                </div>
                {noteResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-800 transition-colors flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{item.title}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}

            {/* Appointments Category */}
            {appointmentResults.length > 0 && (
              <div className="space-y-1 border-t border-slate-100 pt-2">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <span>Appointments ({appointmentResults.length})</span>
                </div>
                {appointmentResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-800 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md capitalize">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
