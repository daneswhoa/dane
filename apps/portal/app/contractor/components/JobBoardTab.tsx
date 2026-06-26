import React, { useState } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  User, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  CheckCircle2,
  Phone,
  FileText,
  BellRing,
  Hammer,
  CircleDollarSign,
  Building,
  Siren,
  Check,
  Search,
  Filter,
  Star,
  Calendar
} from 'lucide-react';
import { MaintenanceJob } from '../types';

import JobWorkflowModal from './JobWorkflowModal';

interface JobBoardTabProps {
  jobs: MaintenanceJob[];
  loading: boolean;
  activeSubTab: 'assigned' | 'in_progress' | 'history';
  onSubTabChange: (tab: 'assigned' | 'in_progress' | 'history') => void;
  onViewDetails: (job: MaintenanceJob) => void;
  onAcceptJob: (id: string) => Promise<void>;
  onDeclineJob: (id: string, reason?: string, negotiatedQuote?: string) => Promise<void>;
  onCompleteJob: (job: MaintenanceJob) => void;
  onQuoteSubmit: (id: string, quoteAmount: string, scheduledAt: string) => Promise<void>;
  onAcceptCounterOffer: (id: string, finalAmount: string) => Promise<void>;
}

const getUrgencyDetails = (urgency: string = '') => {
  const clean = urgency.trim().toLowerCase();
  if (clean === 'emergency' || clean === 'critical') {
    return {
      label: 'Emergency',
      bgClass: 'border-coral-500/30 bg-coral-500/20 text-coral-400',
      animatePulse: true,
      isEmergency: true
    };
  }
  if (clean === 'urgent' || clean === 'high') {
    return {
      label: 'Urgent',
      bgClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      animatePulse: false,
      isEmergency: false
    };
  }
  if (clean === 'medium' || clean === 'standard') {
    return {
      label: 'Medium',
      bgClass: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      animatePulse: false,
      isEmergency: false
    };
  }
  return {
    label: 'Low',
    bgClass: 'border-ink-700/50 bg-ink-800 text-ink-300',
    animatePulse: false,
    isEmergency: false
  };
};

const getRelativeTime = (dateStr: string) => {
  try {
    const ms = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Requested just now';
    if (mins < 60) return `Requested ${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Requested ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `Requested ${Math.floor(hrs / 24)} days ago`;
  } catch {
    return 'Requested recently';
  }
};

export default function JobBoardTab({
  jobs,
  loading,
  activeSubTab,
  onSubTabChange,
  onViewDetails,
  onAcceptJob,
  onDeclineJob,
  onCompleteJob,
  onQuoteSubmit,
  onAcceptCounterOffer
}: JobBoardTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const [activeJobWorkflow, setActiveJobWorkflow] = useState<MaintenanceJob | null>(null);

  // 1. Unassigned / Assigned requests that "Require Attention"
  const pendingJobs = jobs.filter((job) => job.status === 'open' || job.status === 'assigned' || job.status === 'quote_negotiating');

  // 2. Active Pipeline: accepted & completed jobs
  const pipelineJobs = jobs.filter((job) => job.status === 'quote_submitted' || job.status === 'in_progress' || job.status === 'completed');

  // Filter pipeline jobs based on search query
  const filteredPipelineJobs = pipelineJobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      (job.description && job.description.toLowerCase().includes(query)) ||
      (job.propertyName && job.propertyName.toLowerCase().includes(query)) ||
      (job.id && job.id.toLowerCase().includes(query))
    );
  });

  // Metric calculations
  const pendingCount = pendingJobs.length;
  const activeCount = jobs.filter(j => j.status === 'in_progress').length;
  const estPayout = jobs.filter(j => j.status === 'in_progress').reduce((sum, j) => sum + Number(j.maxAuthorization || j.amount || 150), 0);

  const renderJobDescription = (job: MaintenanceJob) => {
    const hasPhoto = !!job.photoUrl;
    const isLong = job.description.length > 100;
    if (isLong) {
      return (
        <span className="text-xs text-paper-600 dark:text-ink-200 leading-relaxed">
          "{job.description.substring(0, 100)}..."
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job);
            }}
            className="text-coral-500 hover:text-coral-600 ml-1.5 font-bold hover:underline bg-transparent border-none p-0 inline-flex items-center"
          >
            more details
          </button>
        </span>
      );
    }
    if (hasPhoto) {
      return (
        <span className="text-xs text-paper-600 dark:text-ink-200 leading-relaxed">
          "{job.description}"
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job);
            }}
            className="text-coral-500 hover:text-coral-600 ml-1.5 font-bold hover:underline bg-transparent border-none p-0 inline-flex items-center"
          >
            ...more details
          </button>
        </span>
      );
    }
    return <span className="text-xs text-paper-600 dark:text-ink-200 leading-relaxed">"{job.description}"</span>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 pb-20 text-left">

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-6">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 shadow-sm trans-theme flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-1">Pending Action</p>
            <p className="text-2xl font-bold text-paper-900 dark:text-white">{pendingCount} <span className="text-sm font-medium text-coral-500 ml-1">Requests</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-coral-50 dark:bg-coral-500/10 text-coral-500 flex items-center justify-center border border-coral-100 dark:border-coral-500/20">
            <BellRing className="w-5 h-5" />
          </div>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 shadow-sm trans-theme flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-1">Active Pipeline</p>
            <p className="text-2xl font-bold text-paper-900 dark:text-white">{activeCount} <span className="text-sm font-medium text-emerald-500 ml-1">Jobs</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
            <Hammer className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 shadow-sm trans-theme flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-1">Estimated Payout</p>
            <p className="text-2xl font-bold text-paper-900 dark:text-white">${estPayout.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      {/* SECTION 1: Requires Attention */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
          Requires Attention
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-paper-200 dark:border-ink-800 border-t-coral-500 animate-spin"></div>
            <span className="text-xs text-paper-500 dark:text-ink-400">Loading work orders...</span>
          </div>
        ) : pendingJobs.length === 0 ? (
          <div className="bg-white dark:bg-ink-800 border border-dashed border-paper-200 dark:border-ink-700 rounded-xl p-8 text-center">
            <span className="text-xs text-paper-500 dark:text-ink-400 font-medium">All caught up! No new requests require immediate attention.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingJobs.map((job) => {
              const details = getUrgencyDetails(job.urgency);
              const isCounterOffer = job.status === 'quote_negotiating';

              return (
                <div 
                  key={job.id}
                  className={`border rounded-xl p-5 shadow-lg relative overflow-hidden group trans-subtle ${
                    details.isEmergency 
                      ? 'bg-gradient-to-br from-ink-850 to-ink-950 border-coral-500/50 shadow-coral-500/5' 
                      : 'bg-white dark:bg-ink-800 border-paper-200 dark:border-ink-700'
                  }`}
                >
                  {/* BG Glow for Emergency */}
                  {details.isEmergency && (
                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-coral-500/15 blur-[40px] rounded-full pointer-events-none group-hover:bg-coral-500/25 trans-theme"></div>
                  )}

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center shadow-sm ${
                          details.isEmergency 
                            ? 'bg-coral-500 text-white' 
                            : 'bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200'
                        }`}>
                          {details.isEmergency ? <Siren className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${details.isEmergency ? 'text-white' : 'text-paper-900 dark:text-white'} flex items-center gap-1.5`}>
                            {job.propertyName || 'Common Area'}
                            <span className="inline-flex items-center text-blue-400 font-bold">✓</span>
                          </p>
                          <p className={`text-[10px] ${details.isEmergency ? 'text-ink-300' : 'text-paper-500 dark:text-ink-400'}`}>
                            {getRelativeTime(job.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${details.bgClass}`}>
                          {details.animatePulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                          {details.label}
                        </span>
                        {isCounterOffer && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider">
                            Counter-Offer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details section */}
                    <div className={`mb-5 border-l-2 pl-3 ${details.isEmergency ? 'border-coral-500/50' : 'border-paper-300 dark:border-ink-600'}`}>
                      <h3 className={`text-base font-bold mb-1 ${details.isEmergency ? 'text-white' : 'text-paper-900 dark:text-white'}`}>
                        {job.title}
                      </h3>
                      <div className="mb-2">
                        {renderJobDescription(job)}
                      </div>
                      <div className={`flex items-center gap-4 text-[10px] font-medium ${details.isEmergency ? 'text-ink-300' : 'text-paper-500 dark:text-ink-400'}`}>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> 
                          {job.propertyName || 'Common Area'} {job.unitLabel ? `• Unit ${job.unitLabel}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Landlord Counter Offer Banner */}
                    {isCounterOffer && (
                      <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-amber-500">Proposed Counter:</span>
                          <span className="font-bold text-amber-400 text-sm">{job.quoteAmount}</span>
                        </div>
                        {job.contractorMessage && (
                          <p className="text-paper-500 dark:text-ink-400 italic text-[11px]">
                            "{job.contractorMessage}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Job Details are rendered here, inline form removed */}

                    {/* Footer Actions */}
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      details.isEmergency ? 'border-ink-700/50' : 'border-paper-100 dark:border-ink-700/50'
                    }`}>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-medium ${details.isEmergency ? 'text-ink-400' : 'text-paper-500 dark:text-ink-400'}`}>
                          {job.maxAuthorization ? 'Authorization Limit' : 'Hourly Base Rate'}
                        </span>
                        <span className={`text-sm font-bold font-mono ${details.isEmergency ? 'text-white' : 'text-paper-900 dark:text-white'}`}>
                          {job.maxAuthorization ? `Up to $${job.maxAuthorization}` : `$${job.hourlyRate || '85'}/hr`}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveJobWorkflow(job)}
                          className={`px-6 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 trans-subtle ${
                            details.isEmergency 
                              ? 'bg-coral-500 hover:bg-coral-600 text-white shadow-coral-500/30 border border-coral-400' 
                              : 'bg-paper-900 dark:bg-white text-white dark:text-ink-900 hover:bg-paper-800 dark:hover:bg-paper-200'
                          }`}
                        >
                          Review Job <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Active Pipeline Table */}
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden shadow-sm trans-theme mt-8 text-left">
        <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 flex flex-wrap gap-4 justify-between items-center trans-theme">
          <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-500" /> Active Pipeline
          </h3>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pipeline..." 
                className="w-48 pl-8 pr-3 py-1.5 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme"
              />
            </div>
            <button className="px-3 py-1.5 border border-paper-200 dark:border-ink-700 rounded-lg text-xs font-medium text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 trans-subtle flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-semibold trans-theme bg-paper-50/20 dark:bg-ink-900/10">
                <th className="px-5 py-3">Work Order</th>
                <th className="px-5 py-3">Location / Tenant</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned Date</th>
                <th className="px-5 py-3 text-right">Actions / Review</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 trans-theme">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-paper-500">
                    Loading pipeline...
                  </td>
                </tr>
              ) : filteredPipelineJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-paper-500 dark:text-ink-400 font-medium">
                    No active pipeline jobs found.
                  </td>
                </tr>
              ) : (
                filteredPipelineJobs.map((job) => (
                  <tr 
                    key={job.id}
                    onClick={() => onViewDetails(job)}
                    className="hover:bg-paper-50 dark:hover:bg-ink-700/30 trans-subtle group cursor-pointer"
                  >
                    {/* Work Order Info */}
                    <td className="px-5 py-3">
                      <div className="font-semibold text-paper-900 dark:text-white group-hover:text-coral-500 transition-colors">
                        {job.title}
                      </div>
                      <div className="text-[10px] font-mono text-paper-400 dark:text-ink-500">
                        ID: #{job.id.substring(0, 8).toUpperCase()}
                      </div>
                    </td>

                    {/* Location & Tenant */}
                    <td className="px-5 py-3">
                      <div className="text-paper-900 dark:text-white">
                        {job.propertyName || 'Common Area'} {job.unitLabel ? `• Unit ${job.unitLabel}` : ''}
                      </div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 shrink-0" />
                        {job.tenantName || 'N/A'}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3">
                      {job.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-semibold trans-theme">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                          </span>
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold trans-theme">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Completed
                        </span>
                      )}
                    </td>

                    {/* Assigned Date */}
                    <td className="px-5 py-3 text-paper-700 dark:text-ink-200">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions / Review */}
                    <td className="px-5 py-3 text-right">
                      {job.status === 'in_progress' ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompleteJob(job);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded text-xs font-semibold trans-subtle inline-block"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <div className="inline-block">
                          {job.rating !== undefined && job.rating !== null ? (
                            <div className="flex items-center justify-end gap-1 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${
                                    i < Number(job.rating) ? 'fill-amber-500 text-amber-500' : 'text-paper-300 dark:text-ink-600'
                                  }`} 
                                />
                              ))}
                              <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 ml-1">({job.rating}/5)</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-paper-400 dark:text-ink-500 font-medium">No review yet</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Workflow Modal */}
      {activeJobWorkflow && (
        <JobWorkflowModal
          job={activeJobWorkflow}
          isCounterOffer={activeJobWorkflow.status === 'quote_negotiating'}
          onClose={() => setActiveJobWorkflow(null)}
          onAcceptImmediate={onAcceptJob}
          onScheduleQuote={onQuoteSubmit}
          onDecline={onDeclineJob}
          onAcceptCounter={onAcceptCounterOffer}
        />
      )}
    </div>
  );
}
