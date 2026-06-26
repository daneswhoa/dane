import React from 'react';
import { X, Wrench, Calendar, MapPin, BadgeDollarSign, Building2, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';
import { MaintenanceJob } from '../types';

interface JobDetailsModalProps {
  job: MaintenanceJob;
  onClose: () => void;
}

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm bg-ink-950/80">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center text-coral-500 border border-coral-100 dark:border-coral-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-paper-900 dark:text-white">Job Details</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400 font-mono uppercase">WRK-{job.id.substring(0, 6)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-paper-400 hover:text-paper-900 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Status & Payout Header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-paper-50 dark:bg-ink-950/50 border border-paper-200 dark:border-ink-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Payment Status</span>
              {job.status === 'completed' ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Paid Out
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <Clock className="w-4 h-4" /> Pending Approval
                </div>
              )}
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Authorized Amount</span>
              <div className="text-2xl font-bold text-paper-900 dark:text-white">
                ${Number(job.amount || 150).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> Property
              </div>
              <p className="text-sm font-semibold text-paper-900 dark:text-white">{job.propertyName || 'N/A'}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> Unit
              </div>
              <p className="text-sm font-semibold text-paper-900 dark:text-white">{job.unitLabel || 'Common Area'}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" /> Scheduled Date
              </div>
              <p className="text-sm font-semibold text-paper-900 dark:text-white">{job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString() : 'ASAP'}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">
                <BadgeDollarSign className="w-3.5 h-3.5" /> Hourly Rate
              </div>
              <p className="text-sm font-semibold text-paper-900 dark:text-white">${job.hourlyRate || 0}/hr</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Task Description</h3>
            <p className="text-sm text-paper-700 dark:text-ink-200 leading-relaxed bg-paper-50 dark:bg-ink-950 p-4 rounded-xl border border-paper-200 dark:border-ink-800">
              {job.description || 'No description provided by the manager.'}
            </p>
          </div>

          {job.proofPhotoUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Proof of Work
              </h3>
              <div className="w-full aspect-video rounded-xl bg-paper-100 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 overflow-hidden relative group">
                <img src={job.proofPhotoUrl} alt="Work Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900/50 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-paper-900 hover:bg-black dark:bg-white dark:hover:bg-paper-100 dark:text-ink-950 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
