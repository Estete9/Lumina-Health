import { Patient } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mail, Phone, Calendar } from 'lucide-react';

export function PatientCard({ patient }: { patient: Patient }) {
  const isActive = patient.status === 'active';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {patient.first_name} {patient.last_name}
          </h3>
          <span
            className={cn(
              'mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'
            )}
          >
            {patient.status}
          </span>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
          {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>{patient.email || 'No email'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <span>{patient.phone || 'No phone'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>DOB: {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Primary Ailment</p>
        <p className="text-sm font-medium text-slate-800">{patient.primary_ailment || 'Not specified'}</p>
      </div>
    </div>
  );
}
