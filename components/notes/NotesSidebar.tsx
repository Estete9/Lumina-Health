import React, { useMemo } from 'react';
import { Patient, Appointment } from '@/lib/types';
import { Search, Calendar, User, ChevronRight } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface NotesSidebarProps {
  patients: Patient[];
  appointments: Appointment[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

export function NotesSidebar({
  patients,
  appointments,
  searchQuery,
  setSearchQuery,
  selectedPatientId,
  onSelectPatient
}: NotesSidebarProps) {

  const { todayPatients, otherPatients } = useMemo(() => {
    const todayIds = new Set(
      appointments
        .filter(app => app.scheduled_at && isToday(parseISO(app.scheduled_at)))
        .map(app => app.patient_id)
    );

    const activePatients = patients.filter(p => p.status === 'active');
    
    // Apply search filter
    const q = searchQuery.toLowerCase();
    const filtered = activePatients.filter(p => {
      const name = `${p.first_name} ${p.last_name}`.toLowerCase();
      return name.includes(q);
    });

    const today = filtered.filter(p => todayIds.has(p.id));
    const others = filtered.filter(p => !todayIds.has(p.id));

    return { todayPatients: today, otherPatients: others };
  }, [patients, appointments, searchQuery]);

  return (
    <div className="w-full md:w-[320px] lg:w-[360px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
        
        {todayPatients.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-3 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
              <Calendar size={14} className="text-teal-700" />
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Appointments Today
              </span>
            </div>
            {todayPatients.map(p => (
              <PatientListItem
                key={p.id}
                patient={p}
                isSelected={p.id === selectedPatientId}
                onClick={() => onSelectPatient(p.id)}
                isToday
              />
            ))}
          </div>
        )}

        <div>
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <User size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              All Active Patients
            </span>
          </div>
          
          {otherPatients.length === 0 && todayPatients.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No patients found.
            </div>
          ) : (
            otherPatients.map(p => (
              <PatientListItem
                key={p.id}
                patient={p}
                isSelected={p.id === selectedPatientId}
                onClick={() => onSelectPatient(p.id)}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

function PatientListItem({ patient, isSelected, onClick, isToday }: { 
  patient: Patient; 
  isSelected: boolean; 
  onClick: () => void;
  isToday?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-100 flex items-center justify-between transition-colors ${
        isSelected 
          ? (isToday ? 'bg-teal-100/50' : 'bg-slate-100') 
          : 'hover:bg-slate-50 bg-white'
      }`}
    >
      <div>
        <div className={`font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
          {patient.first_name} {patient.last_name}
        </div>
        {patient.primary_ailment && (
          <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
            {patient.primary_ailment}
          </div>
        )}
      </div>
      <ChevronRight size={16} className={`shrink-0 ${isSelected ? 'text-slate-800' : 'text-slate-300'}`} />
    </button>
  );
}
