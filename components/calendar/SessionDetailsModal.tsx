import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { updateAppointmentStatus } from '@/lib/services/appointmentService';
import { Calendar as CalendarIcon, Video, Copy, CheckCircle, XCircle, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewClinicalNoteModal } from '@/components/notes/NewClinicalNoteModal';

interface SessionDetailsModalProps {
  selectedAppointment: Appointment | null;
  onClose: () => void;
  appointments: Appointment[];
  onStatusUpdate: (id: string, status: AppointmentStatus) => void;
}

export function SessionDetailsModal({ selectedAppointment, onClose, appointments, onStatusUpdate }: SessionDetailsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!selectedAppointment) return null;

  const previousApt = appointments
    .filter((a) => a.patient_id === selectedAppointment.patient_id && a.status === 'completed' && new Date(a.scheduled_at) < new Date(selectedAppointment.scheduled_at))
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0];

  const localAptDate = new Date(selectedAppointment.scheduled_at);
  const initialDateStr = `${localAptDate.getFullYear()}-${String(localAptDate.getMonth() + 1).padStart(2, '0')}-${String(localAptDate.getDate()).padStart(2, '0')}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Session Details</h2>
              <p className="text-xs text-slate-500">{new Date(selectedAppointment.scheduled_at).toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Patient</label>
            <div className="text-sm font-medium text-slate-900">{selectedAppointment.patient_name}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Session Type</label>
            <div className="text-sm text-slate-800">{selectedAppointment.session_type}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Duration</label>
            <div className="text-sm text-slate-800">{selectedAppointment.duration_minutes} minutes</div>
          </div>
          {selectedAppointment.notes && (
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Notes</label>
              <div className="text-sm text-slate-800">{selectedAppointment.notes}</div>
            </div>
          )}
          
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500">Previous Session Notes</label>
              {(new Date(selectedAppointment.scheduled_at) < new Date() || selectedAppointment.status === 'completed') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNoteModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  Write Note
                </button>
              )}
            </div>
            <div className="text-sm text-slate-700 italic">
              {previousApt?.notes ? previousApt.notes : "No previous session notes found"}
            </div>
          </div>
          
          {selectedAppointment.telehealth_url && (
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-500 block mb-2">Telehealth Session</label>
              <div className="flex flex-col gap-2">
                <a
                  href={selectedAppointment.telehealth_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join {selectedAppointment.telehealth_provider === 'meet' ? 'Google Meet' : selectedAppointment.telehealth_provider === 'zoom' ? 'Zoom' : selectedAppointment.telehealth_provider === 'teams' ? 'MS Teams' : 'Video Call'}
                </a>
                <button
                  onClick={() => handleCopyLink(selectedAppointment.telehealth_url!)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Link Copied!' : 'Copy Meeting Link'}
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
            {selectedAppointment.status !== 'cancelled' && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onStatusUpdate(selectedAppointment.id, selectedAppointment.status === 'completed' ? 'scheduled' : 'completed');
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  selectedAppointment.status === 'completed' 
                    ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200" 
                    : "text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700"
                )}
              >
                <CheckCircle className="w-4 h-4" />
                {selectedAppointment.status === 'completed' ? "Undo Completion" : "Mark Completed"}
              </button>
            )}
            {selectedAppointment.status !== 'cancelled' && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onStatusUpdate(selectedAppointment.id, 'cancelled');
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel Session
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Note Modal scoped to this component so it stacks cleanly over or next to it */}
      <NewClinicalNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={() => {
          setIsNoteModalOpen(false);
          // Optional: You could reload or optimistically fetch notes here
        }}
        initialPatientId={selectedAppointment.patient_id}
        initialSessionDate={initialDateStr}
      />
    </div>
  );
}
