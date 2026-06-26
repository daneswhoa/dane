import React, { useState } from 'react';
import { X, Siren, Clock, DollarSign, CheckCircle2, ChevronRight, MessageSquareX, Banknote, Calendar, Loader2 } from 'lucide-react';
import { MaintenanceJob } from '../types';

interface JobWorkflowModalProps {
  job: MaintenanceJob;
  onClose: () => void;
  onAcceptImmediate: (jobId: string) => Promise<void>;
  onScheduleQuote: (jobId: string, quote: string, schedule: string) => Promise<void>;
  onDecline: (jobId: string, reason: string, negotiatedQuote?: string) => Promise<void>;
  isCounterOffer?: boolean;
  onAcceptCounter?: (jobId: string, finalAmount: string) => Promise<void>;
}

export default function JobWorkflowModal({
  job,
  onClose,
  onAcceptImmediate,
  onScheduleQuote,
  onDecline,
  isCounterOffer,
  onAcceptCounter
}: JobWorkflowModalProps) {
  const [view, setView] = useState<'initial' | 'schedule' | 'decline' | 'success_accept' | 'success_decline'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule / Quote Form State
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');

  // Decline State
  const [declineReason, setDeclineReason] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiatedQuote, setNegotiatedQuote] = useState('');
  const [declineError, setDeclineError] = useState('');

  const isEmergency = job.urgency?.toLowerCase() === 'emergency' || job.urgency?.toLowerCase() === 'critical';

  const handleImmediateStart = async () => {
    setIsSubmitting(true);
    try {
      await onAcceptImmediate(job.id);
      setView('success_accept');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleDate || !scheduleTime || !quoteAmount) return;
    setIsSubmitting(true);
    try {
      await onScheduleQuote(job.id, `$${quoteAmount}`, `${scheduleDate} at ${scheduleTime}`);
      setView('success_accept');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      setDeclineError('Please provide a reason for declining.');
      return;
    }
    if (isNegotiating && !negotiatedQuote) {
      setDeclineError('Please provide your negotiated rate.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onDecline(job.id, declineReason, isNegotiating ? `$${negotiatedQuote}` : undefined);
      setView('success_decline');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-xl bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up trans-theme">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-paper-200 dark:border-ink-800 bg-white/50 dark:bg-ink-950/50 backdrop-blur-md flex justify-between items-center trans-theme shrink-0">
          <h2 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            Job Review
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-paper-100 dark:bg-ink-800 text-paper-500 dark:text-ink-400 hover:bg-paper-200 dark:hover:bg-ink-700 trans-subtle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto">

          {/* ==================================================== */}
          {/* VIEW: INITIAL REVIEW */}
          {/* ==================================================== */}
          {view === 'initial' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-paper-900 dark:text-white">{job.title}</h3>
                <p className="text-sm text-paper-500 dark:text-ink-400">
                  {job.propertyName || 'Common Area'} {job.unitLabel ? `• Unit ${job.unitLabel}` : ''}
                </p>
              </div>
              
              <div className="p-4 bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-750 rounded-2xl trans-theme">
                <p className="text-sm text-paper-700 dark:text-ink-200 leading-relaxed">"{job.description}"</p>
              </div>

              {isCounterOffer && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Counter-Offer Details</h4>
                  <p className="text-sm font-semibold text-amber-400 mb-1">Proposed Final Price: {job.quoteAmount}</p>
                  {job.contractorMessage && (
                    <p className="text-xs text-amber-500/80 italic">"{job.contractorMessage}"</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 pt-2">
                {isCounterOffer ? (
                  <button 
                    onClick={async () => {
                      setIsSubmitting(true);
                      await onAcceptCounter?.(job.id, job.quoteAmount ? job.quoteAmount.replace(/[^0-9.]/g, '') : '');
                      setIsSubmitting(false);
                      setView('success_accept');
                    }}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white trans-subtle group border border-emerald-400 shadow-lg shadow-emerald-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Accept Counter-Offer</p>
                        <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Agreed at {job.quoteAmount}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 trans-subtle" />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleImmediateStart}
                      disabled={isSubmitting}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-white trans-subtle group border shadow-lg ${
                        isEmergency 
                          ? 'bg-coral-500 hover:bg-coral-600 border-coral-400 shadow-coral-500/20' 
                          : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 shadow-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          {isEmergency ? <Siren className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">Accept & Start Immediately</p>
                          <p className={`text-[10px] uppercase tracking-wider ${isEmergency ? 'text-coral-100' : 'text-emerald-100'}`}>
                            {isEmergency ? 'Dispatching Now' : 'I am available now'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 trans-subtle" />
                    </button>

                    <button 
                      onClick={() => setView('schedule')}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-ink-800 hover:bg-paper-50 dark:hover:bg-ink-750 border border-paper-200 dark:border-ink-700 rounded-2xl text-paper-900 dark:text-white trans-subtle group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-paper-100 dark:bg-ink-900 flex items-center justify-center text-paper-600 dark:text-ink-300">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">Schedule for Later</p>
                          <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider">Set date, time, and quote</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 trans-subtle text-paper-400" />
                    </button>
                  </>
                )}

                <button 
                  onClick={() => setView('decline')}
                  className="w-full mt-4 flex justify-center py-3 text-xs font-bold text-paper-500 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white trans-subtle"
                >
                  Decline Job / Negotiate
                </button>
              </div>
            </div>
          )}


          {/* ==================================================== */}
          {/* VIEW: SCHEDULE & QUOTE */}
          {/* ==================================================== */}
          {view === 'schedule' && (
            <div className="space-y-6 animate-slide-left">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-paper-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> Set Schedule
                </h3>
                <p className="text-xs text-paper-500 dark:text-ink-400">Propose a date, time, and total quote for this job.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider pl-1">Date</label>
                    <input 
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 trans-theme"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider pl-1">Time</label>
                    <input 
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 trans-theme"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider pl-1">Proposed Quote</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-400 font-bold">$</span>
                    <input 
                      type="number"
                      placeholder="e.g. 150"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 trans-theme"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setView('initial')}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-paper-700 dark:text-ink-300 bg-paper-100 dark:bg-ink-800 hover:bg-paper-200 dark:hover:bg-ink-700 trans-subtle"
                >
                  Back
                </button>
                <button 
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || !scheduleTime || !quoteAmount || isSubmitting}
                  className="flex-[2] py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed trans-subtle flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept & Propose'}
                </button>
              </div>
            </div>
          )}


          {/* ==================================================== */}
          {/* VIEW: DECLINE / NEGOTIATE */}
          {/* ==================================================== */}
          {view === 'decline' && (
            <div className="space-y-6 animate-slide-left">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-paper-900 dark:text-white flex items-center gap-2">
                  <MessageSquareX className="w-5 h-5 text-coral-500" /> Decline Request
                </h3>
                <p className="text-xs text-paper-500 dark:text-ink-400">Please provide a reason so the landlord knows why you cannot take this job.</p>
              </div>

              <div className="space-y-4">
                <textarea
                  placeholder="e.g. Fully booked this week, or outside service area..."
                  rows={4}
                  value={declineReason}
                  onChange={(e) => {
                    setDeclineReason(e.target.value);
                    setDeclineError('');
                  }}
                  className="w-full p-4 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-xl text-sm resize-none focus:ring-2 focus:ring-coral-500 trans-theme"
                />

                <label className="flex items-start gap-3 p-4 bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-750 rounded-xl cursor-pointer hover:border-coral-300 trans-subtle group">
                  <input 
                    type="checkbox" 
                    checked={isNegotiating}
                    onChange={(e) => setIsNegotiating(e.target.checked)}
                    className="mt-0.5 rounded text-coral-500 focus:ring-coral-500 bg-paper-100 border-paper-300" 
                  />
                  <div>
                    <p className="text-sm font-bold text-paper-900 dark:text-white group-hover:text-coral-500 trans-subtle">I want to negotiate a higher rate</p>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1">If the base rate is too low, you can decline the original offer and submit a counter-proposal.</p>
                  </div>
                </label>

                {isNegotiating && (
                  <div className="animate-fade-in space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider pl-1">Negotiated Rate</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-400 font-bold">$</span>
                      <input 
                        type="number"
                        placeholder="e.g. 200"
                        value={negotiatedQuote}
                        onChange={(e) => {
                          setNegotiatedQuote(e.target.value);
                          setDeclineError('');
                        }}
                        className="w-full pl-8 pr-4 py-3 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-coral-500 trans-theme"
                      />
                    </div>
                  </div>
                )}
                
                {declineError && (
                  <p className="text-xs font-semibold text-coral-500">{declineError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setView('initial')}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-paper-700 dark:text-ink-300 bg-paper-100 dark:bg-ink-800 hover:bg-paper-200 dark:hover:bg-ink-700 trans-subtle"
                >
                  Back
                </button>
                <button 
                  onClick={handleDeclineSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-3 px-4 rounded-xl text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 disabled:opacity-50 flex items-center justify-center gap-2 trans-subtle"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isNegotiating ? 'Submit Counter-Offer' : 'Decline Job')}
                </button>
              </div>
            </div>
          )}


          {/* ==================================================== */}
          {/* VIEW: SUCCESS ACCEPT */}
          {/* ==================================================== */}
          {view === 'success_accept' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-5 animate-slide-up text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-paper-900 dark:text-white tracking-tight">Job Accepted!</h3>
              <p className="text-sm text-paper-600 dark:text-ink-300 max-w-sm mx-auto leading-relaxed">
                Your contact details have been shared with the tenant and they have been notified of your schedule. 
                You can now view this job in your Active Pipeline.
              </p>
              <button 
                onClick={onClose}
                className="mt-4 w-full max-w-[200px] py-3 rounded-xl bg-paper-900 dark:bg-white text-white dark:text-ink-900 text-xs font-bold hover:bg-paper-800 dark:hover:bg-paper-200 trans-subtle"
              >
                Go to Pipeline
              </button>
            </div>
          )}


          {/* ==================================================== */}
          {/* VIEW: SUCCESS DECLINE */}
          {/* ==================================================== */}
          {view === 'success_decline' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-5 animate-slide-up text-center">
              <div className="w-20 h-20 rounded-full bg-paper-100 dark:bg-ink-800 border-4 border-paper-200 dark:border-ink-700 flex items-center justify-center text-paper-500 dark:text-ink-400 mb-2">
                <MessageSquareX className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-paper-900 dark:text-white tracking-tight">
                {isNegotiating ? 'Counter-Offer Sent' : 'Job Declined'}
              </h3>
              <p className="text-sm text-paper-600 dark:text-ink-300 max-w-sm mx-auto leading-relaxed">
                {isNegotiating 
                  ? 'Your counter-offer has been sent to the property manager for review.' 
                  : 'We have notified the property manager that you are unable to take this job.'}
              </p>
              <button 
                onClick={onClose}
                className="mt-4 w-full max-w-[200px] py-3 rounded-xl bg-paper-900 dark:bg-white text-white dark:text-ink-900 text-xs font-bold hover:bg-paper-800 dark:hover:bg-paper-200 trans-subtle"
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
