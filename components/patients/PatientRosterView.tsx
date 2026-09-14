'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Patient, PatientStatus } from '@/lib/types';
import { Search, UserPlus, Users, Stethoscope, Mail, Phone, ArrowRight, ShieldCheck, Tag, Loader2, Plus, Calendar } from 'lucide-react';
import { AddPatientModal } from './AddPatientModal';
import { useRouter } from 'next/navigation';
import { createPatient } from '@/lib/services/patientService';
import { createAppointment } from '@/lib/services/appointmentService';

interface PatientRosterViewProps {
  initialPatients: Patient[];
}

export function PatientRosterView({ initialPatients }: PatientRosterViewProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | PatientStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Inline Quick-Add State
  const [inlineFirstName, setInlineFirstName] = useState('');
  const [inlineLastName, setInlineLastName] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineAilment, setInlineAilment] = useState('');
  const [inlineAppointmentDate, setInlineAppointmentDate] = useState('');
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleInlineSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inlineFirstName.trim() || !inlineLastName.trim()) return;
    
    setIsSubmittingInline(true);
    try {
      const result = await createPatient({
        first_name: inlineFirstName.trim(),
        last_name: inlineLastName.trim(),
        phone: inlinePhone.trim() || undefined,
        primary_ailment: inlineAilment.trim() || 'General Therapy',
        status: 'active',
      });
      
      if (result.data) {
        if (inlineAppointmentDate) {
          try {
            await createAppointment({
              patient_id: result.data.id,
              scheduled_at: new Date(inlineAppointmentDate).toISOString(),
              duration_minutes: 50
            });
          } catch (apptErr) {
            console.error('CREATE APPOINTMENT FAILED:', apptErr);
          }
        }
        
        setPatients((prev) => [result.data!, ...prev]);
        setInlineFirstName('');
        setInlineLastName('');
        setInlinePhone('');
        setInlineAilment('');
        setInlineAppointmentDate('');
        router.refresh();
      } else {
        console.error('CREATE PATIENT FAILED:', result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingInline(false);
    }
  };

  useEffect(() => {
    setPatients(initialPatients);
  }, [initialPatients]);

  useEffect(() => {
    const handleStatusUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; status: PatientStatus }>;
      const detail = customEvent.detail;
      if (detail && detail.id) {
        setPatients((prev) =>
          prev.map((p) => (p.id === detail.id ? { ...p, status: detail.status, updated_at: new Date().toISOString() } : p))
        );
        router.refresh();
      }
    };

    window.addEventListener('patient_status_updated', handleStatusUpdated);
    return () => window.removeEventListener('patient_status_updated', handleStatusUpdated);
  }, [router]);

  const handlePatientCreated = (newPatient?: Patient) => {
    if (newPatient) {
      setPatients((prev) => [newPatient, ...prev]);
    }
    setIsAddModalOpen(false);
    router.refresh();
  };

  // Status Filter counts
  const allCount = patients.length;
  const activeCount = patients.filter((p) => p.status === 'active').length;
  const inactiveCount = patients.filter((p) => p.status === 'inactive').length;
  const completedCount = patients.filter((p) => p.status === 'completed').length;
  const archivedCount = patients.filter((p) => p.status === 'archived').length;

  const filteredPatients = patients.filter((patient) => {
    // Status tab filter
    if (activeTab !== 'all' && patient.status !== activeTab) {
      return false;
    }

    // Search query filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const email = (patient.email || '').toLowerCase();
    const ailment = (patient.primary_ailment || '').toLowerCase();
    const tagsStr = Array.isArray(patient.tags) ? patient.tags.join(' ').toLowerCase() : '';

    return (
      fullName.includes(query) ||
      patient.first_name.toLowerCase().includes(query) ||
      patient.last_name.toLowerCase().includes(query) ||
      email.includes(query) ||
      ailment.includes(query) ||
      tagsStr.includes(query)
    );
  });

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'active':
        return <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">Active</span>;
      case 'inactive':
        return <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Inactive</span>;
      case 'completed':
        return <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">Completed</span>;
      case 'archived':
        return <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Archived</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Active</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Patient Roster & Case Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage active patient profiles, intake records, and therapy statuses</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Patient</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>All Patients</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {allCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Active</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'active' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'inactive'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Inactive</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'inactive' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {inactiveCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Completed Therapy</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'completed' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {completedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'archived'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Archived</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'archived' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {archivedCount}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, email, or diagnosis..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Patient Grid / Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {/* Inline Quick-Add Row */}
          <div className="p-4 bg-slate-50/50">
            <form onSubmit={handleInlineSubmit} className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 shrink-0 hidden md:flex">
                <UserPlus className="w-5 h-5" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={inlineFirstName}
                  onChange={(e) => setInlineFirstName(e.target.value)}
                  disabled={isSubmittingInline}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={inlineLastName}
                  onChange={(e) => setInlineLastName(e.target.value)}
                  disabled={isSubmittingInline}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none disabled:opacity-50"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={inlinePhone}
                  onChange={(e) => setInlinePhone(e.target.value)}
                  disabled={isSubmittingInline}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="Primary Ailment"
                  value={inlineAilment}
                  onChange={(e) => setInlineAilment(e.target.value)}
                  disabled={isSubmittingInline}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none disabled:opacity-50"
                />
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    disabled={isSubmittingInline}
                    className={`w-full h-full rounded-xl border border-slate-300 px-3 py-2 text-sm flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors ${isSubmittingInline ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
                    <span className="truncate whitespace-nowrap">
                      {inlineAppointmentDate 
                        ? new Date(inlineAppointmentDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        : 'Schedule Session'}
                    </span>
                  </button>
                  <input
                    ref={dateInputRef}
                    type="datetime-local"
                    dir="rtl"
                    value={inlineAppointmentDate}
                    onChange={(e) => setInlineAppointmentDate(e.target.value)}
                    disabled={isSubmittingInline}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                </div>
              </div>
              
              <div 
                className="shrink-0 w-full md:w-auto"
                title={!inlineAppointmentDate ? "Please select a session date" : undefined}
              >
                <button
                  type="submit"
                  disabled={isSubmittingInline || !inlineFirstName.trim() || !inlineLastName.trim() || !inlineAppointmentDate}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full h-10"
                >
                  {isSubmittingInline ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span className="md:hidden">Add Patient</span>
                </button>
              </div>
            </form>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No patients match your search or selected status filter (<span className="font-semibold text-slate-700">{activeTab}</span>).
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const secondaryList = Array.isArray(patient.secondary_ailments)
                ? patient.secondary_ailments
                : typeof patient.secondary_ailments === 'string'
                ? [patient.secondary_ailments]
                : [];

              return (
                <div
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="p-5 hover:bg-teal-50/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-base shrink-0">
                      {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        {getStatusBadge(patient.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          {patient.primary_ailment || 'General Therapy'}
                        </span>
                        {patient.email && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Mail className="w-3.5 h-3.5" />
                            {patient.email}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {secondaryList.length > 0 && (
                      <div className="hidden lg:flex items-center gap-1 flex-wrap">
                        {secondaryList.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                            @{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-all">
                      <span>View Chart</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePatientCreated}
      />
    </div>
  );
}
