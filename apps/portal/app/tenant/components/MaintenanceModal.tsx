import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  Camera, 
  ShieldCheck, 
  AlertTriangle,
  ChevronDown,
  CreditCard,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useTenant } from '../TenantContext';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MaintenanceModal({ isOpen, onClose }: MaintenanceModalProps) {
  const { profile } = useTenant();
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('routine');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [willPay, setWillPay] = useState(false);
  const [allowEntry, setAllowEntry] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe the issue in detail.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:4000/api/dashboard/maintenance', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim(),
          urgency: priority,
          category: category || 'other',
          propertyId: profile?.propertyId || null,
          unitId: profile?.unitId || null,
          ownerId: profile?.ownerId || 'user-default-owner',
          tenantId: profile?.id || null,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refreshMaintenanceTickets'));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to submit request.');
      }
    } catch (e) {
      setError('Connection to backend failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        
        <div className="bg-white dark:bg-ink-900 w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 flex flex-col items-center text-center border border-paper-200 dark:border-ink-700 animate-slide-up trans-theme">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-paper-900 dark:text-white mb-2">Request Submitted</h3>
          <p className="text-xs text-paper-500 dark:text-ink-400 mb-6 leading-relaxed">
            Your maintenance request has been successfully filed and routed to the manager's dashboard.
          </p>
          <button 
            onClick={() => {
              setIsSuccess(false);
              setTitle('');
              setDescription('');
              setCategory('');
              setPriority('routine');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-ink-900 w-full max-w-md rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden border border-paper-200 dark:border-ink-700 animate-slide-up trans-theme">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 flex items-center justify-between bg-paper-50 dark:bg-ink-950 trans-theme">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center shadow-sm border border-coral-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-paper-900 dark:text-white leading-tight">New Request</h2>
              <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">You may be required to pay for this request.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-paper-400 hover:text-paper-900 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-[10px] font-bold text-paper-700 dark:text-ink-300 uppercase tracking-widest mb-1.5">Category</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-700 text-sm rounded-xl px-3 py-2.5 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>Select Issue Type</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC / AC / Heating</option>
                    <option value="electrical">Electrical</option>
                    <option value="appliances">Appliances</option>
                    <option value="pest">Pest Control</option>
                    <option value="structural">Doors / Windows / Structural</option>
                    <option value="internet">Internet / Cable</option>
                    <option value="landscaping">Landscaping / Exterior</option>
                    <option value="locksmith">Locksmith / Keys</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-paper-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
             </div>
             <div className="flex-1">
                <label className="block text-[10px] font-bold text-paper-700 dark:text-ink-300 uppercase tracking-widest mb-1.5">Priority</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-700 text-sm rounded-xl px-3 py-2.5 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="routine">Routine / Normal</option>
                    <option value="medium">Medium / Standard</option>
                    <option value="urgent">Urgent / Immediate</option>
                    <option value="emergency">Emergency / Critical</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-paper-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
             </div>
          </div>

          {(priority === 'urgent' || priority === 'emergency') && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-start gap-3 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-red-800 dark:text-red-400 mb-0.5">
                  {priority === 'emergency' ? 'Emergency Dispatch' : 'Urgent Request'}
                </p>
                <p className="text-[10px] text-red-600 dark:text-red-300/80 leading-relaxed">
                  {priority === 'emergency' 
                    ? 'Emergency requests attract additional fees but guarantee priority routing and immediate dispatch.' 
                    : 'Urgent requests are prioritized for manager review and scheduled as quickly as possible.'}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-paper-700 dark:text-ink-300 uppercase tracking-widest mb-1.5">Issue Details</label>
            <input 
              type="text" 
              placeholder="Brief Title (e.g. Broken Sink)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-t-xl border border-paper-200 dark:border-ink-700 border-b-0 bg-white dark:bg-ink-950 text-sm focus:outline-none text-paper-900 dark:text-white placeholder-paper-400 dark:placeholder-ink-600"
            />
            <textarea 
              rows={3}
              placeholder="Describe the issue in detail..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-b-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm focus:outline-none resize-none text-paper-900 dark:text-white placeholder-paper-400 dark:placeholder-ink-600"
            ></textarea>
          </div>

          {/* Permissions & Payment */}
          <div className="border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden bg-paper-50 dark:bg-ink-950/50">
             
             <div className="p-3 flex items-center justify-between cursor-pointer border-b border-paper-200 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-900 trans-subtle" onClick={() => setAllowEntry(!allowEntry)}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${allowEntry ? 'bg-coral-500 border-coral-500 text-white' : 'border-paper-300 dark:border-ink-600'}`}>
                    {allowEntry && <ShieldCheck className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-paper-900 dark:text-white">Allow Entry</p>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400">Team may enter if you aren't home.</p>
                  </div>
                </div>
             </div>

             <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-paper-100 dark:hover:bg-ink-900 trans-subtle" onClick={() => setWillPay(!willPay)}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${willPay ? 'bg-coral-500 border-coral-500 text-white' : 'border-paper-300 dark:border-ink-600'}`}>
                    {willPay && <CreditCard className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-paper-900 dark:text-white">I will pay for this</p>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400">Pay cash or directly to the contractor.</p>
                  </div>
                </div>
             </div>

             {willPay && (
               <div className="bg-coral-50 dark:bg-coral-500/10 p-3 flex items-start gap-2 border-t border-coral-200 dark:border-coral-500/20 animate-fade-in">
                 <Zap className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-[10px] text-coral-800 dark:text-coral-300 font-medium leading-relaxed">A contractor will be deployed immediately and won't be queued for manager approval.</p>
                 </div>
               </div>
             )}

          </div>

          <div className="flex items-center justify-center p-4 border-2 border-dashed border-paper-200 dark:border-ink-700 rounded-xl cursor-pointer hover:bg-paper-50 dark:hover:bg-ink-900/50 trans-subtle">
             <div className="text-center">
               <Camera className="w-5 h-5 text-paper-400 dark:text-ink-500 mx-auto mb-1" />
               <p className="text-xs font-medium text-paper-700 dark:text-ink-300">Attach Photos (Optional)</p>
             </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 flex justify-end gap-3 trans-theme">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-xs font-semibold hover:bg-paper-50 dark:hover:bg-ink-800 trans-subtle text-paper-700 dark:text-ink-200 disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold shadow-sm active:scale-95 trans-subtle disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
