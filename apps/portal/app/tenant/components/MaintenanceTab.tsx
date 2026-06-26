import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  MessageSquare, 
  Check, 
  BadgeCheck, 
  Key, 
  Filter, 
  Wind, 
  ChevronRight, 
  Blinds, 
  CheckCircle2,
  ChevronDown,
  Wrench,
  AlertTriangle,
  Siren,
  Star,
  Plus,
  Loader2,
  X,
  Upload,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Hammer
} from 'lucide-react';
import { TenantProfile } from '../types';

interface MaintenanceTabProps {
  profile: TenantProfile | null;
  onNewRequest: () => void;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  urgency: string;
  category: string;
  status: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  contractorId: string | null;
  contractorName: string | null;
  amount: number | null;
  hourlyRate: string | null;
  maxAuthorization: string | null;
  photoUrl: string | null;
  rating: number | null;
  ratingComment: string | null;
  scheduledAt: string | null;
  quoteAmount: string | null;
  quoteStatus: string | null;
  contractorMessage: string | null;
  proofPhotoUrl: string | null;
  createdAt: string;
  propertyName: string | null;
  unitLabel: string | null;
}

const getCategoryIcon = (category: string = '') => {
  const clean = category.toLowerCase();
  if (clean.includes('plumb')) return Droplet;
  if (clean.includes('elect')) return Wrench;
  if (clean.includes('hvac') || clean.includes('cool') || clean.includes('heat') || clean.includes('vent')) return Wind;
  if (clean.includes('roof')) return Hammer;
  return Hammer;
};

const getUrgencyDetails = (urgency: string = '') => {
  const clean = urgency.toLowerCase();
  if (clean === 'emergency' || clean === 'critical') {
    return { label: 'Emergency', bgClass: 'border-coral-500/30 bg-coral-500/20 text-coral-400', isEmergency: true };
  }
  if (clean === 'urgent' || clean === 'high') {
    return { label: 'Urgent', bgClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400', isEmergency: false };
  }
  return { label: urgency || 'Standard', bgClass: 'border-ink-700/50 bg-ink-800 text-ink-300', isEmergency: false };
};

export default function MaintenanceTab({ profile, onNewRequest }: MaintenanceTabProps) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Resolution Modal State
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState('');
  const [proofPhotoFile, setProofPhotoFile] = useState<File | null>(null);
  const [uploadedProofUrl, setUploadedProofUrl] = useState('');
  const [uploadingProgress, setUploadingProgress] = useState(false);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // Detail Modal State
  const [selectedPastTicket, setSelectedPastTicket] = useState<MaintenanceTicket | null>(null);

  // Filter State
  const [timeFilter, setTimeFilter] = useState('all');

  const fetchTickets = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/dashboard/maintenance?tenantId=${profile.id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch maintenance requests.');
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load your maintenance tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchTickets();
    }
    
    // Listen for custom event to trigger refresh from other components (like MaintenanceModal)
    const handleRefresh = () => {
      if (profile?.id) fetchTickets();
    };
    
    window.addEventListener('refreshMaintenanceTickets', handleRefresh);
    return () => window.removeEventListener('refreshMaintenanceTickets', handleRefresh);
  }, [profile?.id]);

  // Handle Photo Proof Upload to Google Cloud Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProgress(true);
    try {
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!signRes.ok) throw new Error('Failed to generate upload URL');
      const data = await signRes.json();
      const { uploadUrl, publicUrl } = data;

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`);

      setUploadedProofUrl(publicUrl);
      setProofPhotoFile(file);
    } catch (err: any) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploadingProgress(false);
    }
  };

  // Submit Completion & Settle
  const handleConfirmResolved = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId) return;

    setIsSubmittingResolution(true);
    try {
      const res = await fetch(`http://localhost:4000/api/dashboard/maintenance/${resolvingTicketId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          rating,
          ratingComment,
          proofPhotoUrl: uploadedProofUrl || undefined,
        }),
      });

      if (!res.ok) throw new Error('Could not submit resolution.');
      setResolvingTicketId(null);
      setRating(5);
      setRatingComment('');
      setUploadedProofUrl('');
      setProofPhotoFile(null);
      await fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to submit resolution.');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  // Filter lists
  const activeTickets = tickets.filter(t => t.status !== 'completed' && t.status !== 'paid');
  const resolvedTickets = tickets.filter(t => t.status === 'completed' || t.status === 'paid');

  const openCount = activeTickets.length;
  const resolvedCount = resolvedTickets.length;

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-20 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">Maintenance & Repairs</h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            Track active requests or submit a new work order for Unit {profile?.unit || 'N/A'}.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-ink-800 p-1.5 rounded-lg border border-paper-200 dark:border-ink-700 shadow-sm trans-theme self-start md:self-auto">
          <div className="flex flex-col px-3 py-1 border-r border-paper-200 dark:border-ink-700">
            <span className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider font-mono">Active</span>
            <span className="text-lg font-bold text-coral-600 dark:text-coral-400 leading-none mt-0.5">{openCount}</span>
          </div>
          <div className="flex flex-col px-3 py-1 border-r border-paper-200 dark:border-ink-700">
            <span className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider font-mono">Resolved</span>
            <span className="text-lg font-bold text-paper-900 dark:text-white leading-none mt-0.5">{resolvedCount}</span>
          </div>
          <button 
            onClick={onNewRequest}
            className="px-3 py-1.5 bg-coral-500 hover:bg-coral-600 text-white rounded-md text-xs font-bold shadow flex items-center gap-1 ml-2 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Request Maintenance
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 text-coral-600 dark:text-coral-400 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-coral-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Active Requests */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-3 ml-1 font-mono">Active Requests</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
            <span className="text-xs text-paper-500 dark:text-ink-400">Loading work orders...</span>
          </div>
        ) : activeTickets.length === 0 ? (
          <div className="bg-white dark:bg-ink-800 border border-dashed border-paper-200 dark:border-ink-700 rounded-2xl p-10 text-center trans-theme">
            <Wrench className="w-8 h-8 mx-auto text-paper-300 dark:text-ink-600 mb-2" />
            <p className="text-xs text-paper-500 dark:text-ink-400 font-semibold">No active maintenance requests</p>
            <p className="text-[11px] text-paper-400 dark:text-ink-500 mt-1">If something is broken, request maintenance above to get it scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTickets.map((ticket) => {
              const Icon = getCategoryIcon(ticket.category);
              const urgency = getUrgencyDetails(ticket.urgency);

              // Stepper Step completion logic
              const step1 = true; // Submitted is always true
              const step2 = !!ticket.contractorId || ticket.status === 'assigned' || ticket.status === 'quote_submitted' || ticket.status === 'quote_negotiating' || ticket.status === 'in_progress';
              const step3 = ticket.status === 'in_progress';
              const step4 = ticket.status === 'completed' || ticket.status === 'paid';

              return (
                <div 
                  key={ticket.id}
                  className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-750 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden group trans-theme"
                >
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-coral-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-coral-500/10 trans-subtle"></div>
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-paper-50 dark:bg-ink-900 text-coral-500 flex items-center justify-center border border-paper-150 dark:border-ink-700 shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h3 className="text-base font-bold text-paper-900 dark:text-white">{ticket.title}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-[9px] font-mono text-paper-500 dark:text-ink-400">#{ticket.id.substring(0, 8).toUpperCase()}</span>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${urgency.bgClass}`}>
                              {urgency.label}
                            </span>
                          </div>
                          <p className="text-xs text-paper-600 dark:text-ink-300 max-w-2xl leading-relaxed">{ticket.description}</p>
                        </div>
                      </div>
                      
                      {ticket.contractorId && (
                        <div className="shrink-0 self-end md:self-start">
                          <button 
                            onClick={() => {
                              setResolvingTicketId(ticket.id);
                              setUploadedProofUrl('');
                              setRating(5);
                              setRatingComment('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stepper Progress Bar */}
                    <div className="bg-paper-50/50 dark:bg-ink-900/40 border border-paper-150/40 dark:border-ink-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-6 relative px-4">
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-paper-200 dark:bg-ink-800 z-0"></div>
                        <div 
                          className="absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-coral-500 z-0 shadow-[0_0_8px_rgba(255,107,107,0.5)] transition-all duration-500"
                          style={{
                            right: step3 ? '8px' : step2 ? '50%' : '100%'
                          }}
                        ></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm text-white ${step1 ? 'bg-coral-500 border-coral-500' : 'bg-paper-200 dark:bg-ink-800 border-white dark:border-ink-800'}`}>
                            <Check className="w-3 h-3" />
                          </div>
                          <div className="text-center absolute top-8 w-24 -ml-9">
                            <p className="text-[10px] font-bold text-paper-900 dark:text-white uppercase tracking-wider">Submitted</p>
                            <p className="text-[9px] text-paper-400 dark:text-ink-500 mt-0.5">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm text-white transition-all ${
                            step2 ? 'bg-coral-500 border-coral-500' : 'bg-paper-100 dark:bg-ink-900 border-paper-250 dark:border-ink-750 text-paper-400'
                          }`}>
                            {step2 ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                          </div>
                          <div className="text-center absolute top-8 w-24 -ml-9">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${step2 ? 'text-paper-900 dark:text-white' : 'text-paper-400 dark:text-ink-500'}`}>Reviewed</p>
                            {ticket.contractorId && <p className="text-[9px] text-paper-400 dark:text-ink-500 mt-0.5">Partner Assigned</p>}
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${
                            step3 
                              ? 'bg-coral-500 border-coral-500 text-white animate-pulse-slow' 
                              : 'bg-paper-100 dark:bg-ink-900 border-paper-250 dark:border-ink-750 text-paper-400'
                          }`}>
                            {step3 ? <Wrench className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} /> : <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                          </div>
                          <div className="text-center absolute top-8 w-32 -ml-13">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${step3 ? 'text-coral-500' : 'text-paper-400 dark:text-ink-500'}`}>
                              {urgency.isEmergency ? 'On It' : 'Scheduled'}
                            </p>
                            {ticket.scheduledAt ? (
                              <p className="text-[9px] font-semibold text-paper-900 dark:text-white mt-0.5">{ticket.scheduledAt}</p>
                            ) : step3 ? (
                              <p className="text-[9px] text-paper-400 dark:text-ink-500 mt-0.5">Mobilizing Dispatch...</p>
                            ) : null}
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm ${
                            step4 ? 'bg-coral-500 border-coral-500 text-white' : 'bg-paper-100 dark:bg-ink-900 border-paper-250 dark:border-ink-750 text-paper-400'
                          }`}>
                            {step4 ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 bg-current rounded-full opacity-50"></span>}
                          </div>
                          <div className="text-center absolute top-8 w-24 -ml-9">
                            <p className={`text-[10px] font-semibold uppercase tracking-wider ${step4 ? 'text-paper-900 dark:text-white' : 'text-paper-400 dark:text-ink-500'}`}>Resolved</p>
                          </div>
                        </div>
                      </div>
                      
                      {ticket.contractorId && (
                        <div className="mt-10 pt-4 border-t border-paper-200/50 dark:border-ink-700/50 flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center text-[10px] font-bold border border-coral-500/20">
                              {ticket.contractorName ? ticket.contractorName.slice(0,2).toUpperCase() : 'CO'}
                            </div>
                            <div>
                              <p className="text-[9px] text-paper-500 dark:text-ink-400 uppercase font-semibold leading-none">Assigned Trade Partner</p>
                              <p className="text-xs font-bold text-paper-900 dark:text-white flex items-center gap-1 mt-0.5">
                                {ticket.contractorName || 'Technician'} <BadgeCheck className="w-3 h-3 text-blue-500" />
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            {ticket.quoteAmount && (
                              <div className="text-right">
                                <p className="text-[9px] text-paper-500 dark:text-ink-400 uppercase font-semibold leading-none">Accepted Price</p>
                                <p className="text-xs font-bold text-emerald-500 mt-0.5">{ticket.quoteAmount}</p>
                              </div>
                            )}
                            <div className="text-right">
                              <p className="text-[9px] text-paper-500 dark:text-ink-400 uppercase font-semibold leading-none">Access Mode</p>
                              <p className="text-xs font-medium text-paper-900 dark:text-white flex items-center gap-1 mt-0.5 justify-end">
                                <Key className="w-3 h-3 text-coral-500" /> Standard Entry Permit
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved History */}
      <div className="pt-4 border-t border-paper-200 dark:border-ink-800 trans-theme text-left">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 ml-1 font-mono">Past Requests</h2>
          <div className="relative">
            <Filter className="w-3 h-3 text-paper-400 dark:text-ink-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="pl-6 pr-6 py-1 text-[10px] font-medium border border-paper-200 dark:border-ink-700 rounded-md bg-transparent text-paper-700 dark:text-ink-200 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All History</option>
              <option value="recent">Recent (Last 30 Days)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-paper-400 dark:text-ink-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {resolvedTickets.length === 0 ? (
          <div className="bg-paper-50 dark:bg-ink-900/30 border border-paper-150 dark:border-ink-800 rounded-xl p-6 text-center text-xs text-paper-400 dark:text-ink-500">
            No completed requests in history logs.
          </div>
        ) : (
          <div className="space-y-2">
            {resolvedTickets.map((ticket) => {
              const Icon = getCategoryIcon(ticket.category);
              return (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedPastTicket(ticket)}
                  className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-750 rounded-xl p-3.5 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 trans-subtle hover:border-paper-350 dark:hover:border-ink-650 cursor-pointer text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-md bg-paper-50 dark:bg-ink-900 text-paper-500 dark:text-ink-400 flex items-center justify-center border border-paper-150 dark:border-ink-700 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-paper-900 dark:text-white">{ticket.title}</h4>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-medium uppercase tracking-wider border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {ticket.status === 'paid' ? 'Paid & Settled' : 'Resolved'}
                        </span>
                      </div>
                      <p className="text-[10px] text-paper-500 dark:text-ink-400">Completed • Ticket #{ticket.id.substring(0,8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-paper-100 dark:border-ink-700 pt-3 md:pt-0 md:pl-4">
                    <div className="text-right">
                      <p className="text-[10px] text-paper-400 dark:text-ink-500">Contractor</p>
                      <p className="text-xs font-semibold text-paper-700 dark:text-ink-200">{ticket.contractorName || 'Technician'}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-paper-50 dark:bg-ink-900 hover:bg-paper-150 dark:hover:bg-ink-750 text-paper-400 dark:text-ink-400 trans-subtle">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Mark as Resolved & Settle */}
      {resolvingTicketId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-6 max-w-md w-full shadow-xl text-left space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-paper-100 dark:border-ink-700">
              <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider">Confirm Issue Resolved</h3>
              <button 
                onClick={() => setResolvingTicketId(null)}
                className="text-paper-400 hover:text-paper-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolved} className="space-y-4 text-left">
              {/* Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-widest">Rate the Trade Partner</label>
                <div className="flex items-center gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= (hoverRating ?? rating) ? 'fill-amber-500 text-amber-500' : 'text-paper-250 dark:text-ink-600'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-widest">Feedback / Review Comments</label>
                <textarea
                  required
                  placeholder="Share a short note about the fix quality, responsiveness, cleanliness, etc."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg p-2.5 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 h-24 resize-none"
                />
              </div>

              {/* Photo Proof Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-widest">Upload Photo Proof (Optional)</label>
                <div className="relative border-2 border-dashed border-paper-200 dark:border-ink-700 rounded-xl p-4 flex flex-col items-center justify-center hover:border-coral-500 dark:hover:border-coral-400 transition-colors cursor-pointer bg-paper-50 dark:bg-ink-900">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadingProgress ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-coral-500" />
                      <span className="text-[10px] text-paper-500 dark:text-ink-400">Uploading photo to Google Cloud...</span>
                    </div>
                  ) : uploadedProofUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-6 h-6 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-bold">Photo Uploaded Successfully!</span>
                      <img src={uploadedProofUrl} alt="Uploaded Proof" className="w-20 h-20 object-cover rounded-lg mt-1 border border-paper-200" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-paper-400" />
                      <span className="text-xs text-paper-600 dark:text-ink-300 font-semibold">Drop or Select image</span>
                      <span className="text-[9px] text-paper-400 dark:text-ink-500">Supports PNG, JPEG, HEIC</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-paper-100 dark:border-ink-700">
                <button
                  type="button"
                  onClick={() => setResolvingTicketId(null)}
                  className="px-4 py-2 text-xs text-paper-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-750 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolution || uploadingProgress}
                  className="px-4 py-2 text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 rounded-lg shadow transition-all flex items-center gap-1"
                >
                  {isSubmittingResolution ? (
                    <>Submitting... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
                  ) : (
                    <>Submit & Settle Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Resolved Request Detail Modal */}
      {selectedPastTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-6 max-w-md w-full shadow-xl text-left space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-paper-100 dark:border-ink-700">
              <div>
                <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider">Past Request Details</h3>
                <span className="text-[9px] font-mono text-paper-400">REQ-#{selectedPastTicket.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <button 
                onClick={() => setSelectedPastTicket(null)}
                className="text-paper-400 hover:text-paper-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-paper-600 dark:text-ink-200">
              <div>
                <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase tracking-widest block font-bold">Issue Title</span>
                <span className="text-sm font-bold text-paper-900 dark:text-white">{selectedPastTicket.title}</span>
              </div>

              <div>
                <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase tracking-widest block font-bold">Reported Problem</span>
                <p className="p-2.5 bg-paper-50 dark:bg-ink-900 border border-paper-150 dark:border-ink-750 rounded text-[11px] leading-relaxed whitespace-pre-wrap mt-0.5">
                  {selectedPastTicket.description}
                </p>
              </div>

              {selectedPastTicket.contractorName && (
                <div className="p-3 bg-coral-500/5 border border-coral-500/20 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase tracking-widest block leading-none">Tradesman Professional</span>
                      <span className="font-bold text-paper-900 dark:text-white text-xs mt-1 block">{selectedPastTicket.contractorName}</span>
                    </div>
                    {selectedPastTicket.amount && (
                      <div className="text-right">
                        <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase tracking-widest block leading-none">Settled Cost</span>
                        <span className="font-mono font-bold text-emerald-500 text-xs mt-1 block">${selectedPastTicket.amount}</span>
                      </div>
                    )}
                  </div>

                  {selectedPastTicket.contractorMessage && (
                    <div className="pt-2 border-t border-coral-500/10 text-[11px] leading-normal italic text-paper-500 dark:text-ink-300">
                      <span className="font-bold block not-italic text-[9px] uppercase tracking-wider text-paper-400 mb-0.5">Contractor Resolution Note:</span>
                      "{selectedPastTicket.contractorMessage}"
                    </div>
                  )}

                  {selectedPastTicket.proofPhotoUrl && (
                    <div className="pt-2 border-t border-coral-500/10 space-y-1">
                      <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase tracking-widest block font-bold">Proof of Fix Photo</span>
                      <img 
                        src={selectedPastTicket.proofPhotoUrl} 
                        alt="Proof of Fix" 
                        className="w-full max-h-40 object-cover rounded-lg border border-paper-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedPastTicket.rating !== null && selectedPastTicket.rating !== undefined && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                  <span className="text-[9px] text-amber-500 uppercase tracking-widest block font-bold">Resident Rating & Review</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < (selectedPastTicket.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-paper-250 dark:text-ink-700'
                        }`} 
                      />
                    ))}
                    <span className="text-[10px] font-bold text-paper-500 ml-1">({selectedPastTicket.rating}/5)</span>
                  </div>
                  {selectedPastTicket.ratingComment && (
                    <p className="text-[11px] text-paper-500 dark:text-ink-300 italic mt-1 leading-normal">
                      "{selectedPastTicket.ratingComment}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-paper-100 dark:border-ink-700">
              <button
                onClick={() => setSelectedPastTicket(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 rounded-lg shadow transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
