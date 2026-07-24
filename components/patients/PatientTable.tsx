import { Patient } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FileText, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

export function PatientTable({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-500">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-4">Patient Name</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Primary Ailment</th>
              <th scope="col" className="px-6 py-4">Last Updated</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => {
              const isActive = patient.status === 'active';
              return (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{patient.email || 'No email provided'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        isActive
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-800'
                      )}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="truncate max-w-[200px] inline-block">
                      {patient.primary_ailment || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(patient.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded" title="View Notes">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button type="button" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Schedule">
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded ml-2"
                        title="View Profile"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
