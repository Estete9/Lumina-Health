"use client";

import { useEffect, useState } from 'react';
import { ClinicalDiscoveryFrequencyItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ClinicalDiscoveriesChart({ data }: { data: ClinicalDiscoveryFrequencyItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setColumns(3);
      } else if (window.innerWidth >= 768) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxItems = columns * 2;
  const displayData = isExpanded ? data : data.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Clinical Discoveries</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-col items-start gap-1 overflow-hidden w-full">
              <span className="font-medium text-slate-700 truncate w-full" title={item.tagOrDiscovery}>
                {item.tagOrDiscovery}
              </span>
              <span 
                className={cn(
                  "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1",
                  item.category === 'cbt_insight' && "bg-purple-100 text-purple-700",
                  item.category === 'symptom' && "bg-rose-100 text-rose-700",
                  item.category === 'intervention' && "bg-emerald-100 text-emerald-700"
                )}
              >
                {item.category === 'cbt_insight' ? 'CBT Insight' : item.category === 'symptom' ? 'Symptom' : 'Intervention'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-slate-500" 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{item.count}</span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-full py-4 text-center text-sm text-slate-500">
            No clinical discoveries found.
          </div>
        )}
      </div>
      {data.length > maxItems && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          {isExpanded ? "Show Less" : `+ Show All (${data.length})`}
        </button>
      )}
    </div>
  );
}
