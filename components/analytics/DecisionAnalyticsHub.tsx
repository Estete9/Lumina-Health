'use client';

import React, { useState } from 'react';
import { DecisionAnalyticsHubData } from '@/lib/types';
import { ClinicalOutcomesTab } from './ClinicalOutcomesTab';
import { PracticeDynamicsTab } from './PracticeDynamicsTab';
import { CaseloadCapacityTab } from './CaseloadCapacityTab';
import { HeartPulse, Users, ShieldCheck } from 'lucide-react';

interface Props {
  initialData: DecisionAnalyticsHubData;
}

export const DecisionAnalyticsHub: React.FC<Props> = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'practice' | 'capacity'>('clinical');

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header and Tabs */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Decision Analytics Hub</h1>
        
        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'clinical'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <HeartPulse className="w-4 h-4 mr-2" />
            Clinical Outcomes
          </button>
          
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'practice'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Practice Dynamics
          </button>

          <button
            onClick={() => setActiveTab('capacity')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'capacity'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Caseload & Capacity
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto pb-8">
        {activeTab === 'clinical' && (
          <ClinicalOutcomesTab data={initialData.clinicalOutcomes} />
        )}
        {activeTab === 'practice' && (
          <PracticeDynamicsTab data={initialData.practiceDynamics} />
        )}
        {activeTab === 'capacity' && (
          <CaseloadCapacityTab data={initialData.caseloadCapacity} />
        )}
      </div>
    </div>
  );
};
