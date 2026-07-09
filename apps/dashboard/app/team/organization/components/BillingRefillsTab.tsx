'use client';

import React, { useState } from 'react';
import { 
  Shield, Zap, Loader2, Wallet, ChevronLeft, ChevronRight, 
  Copy, Check, X, ShieldCheck 
} from 'lucide-react';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { SuccessWizardModal } from './SuccessWizardModal';

interface BillingRefillsTabProps {
  billingData: any;
  billingLoading: boolean;
  dateFilterStart: string;
  setDateFilterStart: (val: string) => void;
  dateFilterEnd: string;
  setDateFilterEnd: (val: string) => void;
  selectedTeammateFilter: string;
  setSelectedTeammateFilter: (val: string) => void;
  teamMembers: any[];
  creditRechargeAmount: number;
  setCreditRechargeAmount: (val: number) => void;
  handleCancelPremium: () => void;
  billingMessage: string | null;
  setBillingMessage: (val: string | null) => void;
  onRefresh: () => void;
}

export function BillingRefillsTab({
  billingData,
  billingLoading,
  dateFilterStart,
  setDateFilterStart,
  dateFilterEnd,
  setDateFilterEnd,
  selectedTeammateFilter,
  setSelectedTeammateFilter,
  teamMembers,
  creditRechargeAmount,
  setCreditRechargeAmount,
  handleCancelPremium,
  billingMessage,
  setBillingMessage,
  onRefresh
}: BillingRefillsTabProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'premium' | 'credits'>('premium');
  const [showSuccessWizard, setShowSuccessWizard] = useState(false);
  const [wizardData, setWizardData] = useState<{ type: 'premium' | 'credits'; amount: number } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected teammate log details modal state
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [copiedTxid, setCopiedTxid] = useState(false);

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setWizardData({ type: checkoutType, amount: creditRechargeAmount });
    setShowSuccessWizard(true);
    onRefresh();
  };

  const handleCopyTxid = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(true);
    setTimeout(() => setCopiedTxid(false), 2000);
  };

  // Filtered usage logs
  const filteredUsage = (billingData.usage || []).filter((u: any) => 
    selectedTeammateFilter === 'all' || u.teammateEmail.toLowerCase() === selectedTeammateFilter.toLowerCase()
  );

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsage.length / itemsPerPage));
  const paginatedUsage = filteredUsage.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination if teammate filter is altered
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeammateFilter, dateFilterStart, dateFilterEnd]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {billingMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>{billingMessage}</span>
          <button onClick={() => setBillingMessage(null)} className="text-[10px] uppercase underline font-bold">Dismiss</button>
        </div>
      )}

      {billingLoading && !billingData.tokenBalance ? (
        <div className="py-12 flex flex-col items-center justify-center bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-coral-500 mb-2" />
          <div className="text-xs font-medium text-paper-500 dark:text-ink-400">Syncing billing credentials...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Subscriptions & Credits */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Subscription Tier Panel */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider">Plan & Subscription</h3>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Manage your workspace access limits and billing tiers.</p>
                </div>
                {billingData.subscription?.tier === 'premium' && (
                  <span className="bg-coral-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    Premium Active
                  </span>
                )}
              </div>

              <div className="p-6">
                {billingData.subscription?.tier === 'premium' ? (
                  /* Subscribed state: Show premium status and hide card plans */
                  <div className="space-y-6">
                    <div className="p-5 rounded-lg border border-coral-500 bg-coral-50/20 dark:bg-coral-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex items-center gap-1.5 text-coral-500 font-bold text-xs uppercase tracking-wider">
                          <Shield className="w-4 h-4" /> Active Workspace Plan
                        </div>
                        <h4 className="text-base font-bold text-paper-900 dark:text-white">Premium Tier Subscription</h4>
                        <p className="text-xs text-paper-500 dark:text-ink-400 max-w-md">
                          Your organization has full access to Sophia AI, contractor assignment workflows, unlimited property listings, and team member management.
                        </p>
                        <div className="text-[11px] text-paper-600 dark:text-ink-300 font-medium">
                          Renews automatically on <span className="font-bold text-paper-900 dark:text-white">{billingData.subscription.expiresAt ? new Date(billingData.subscription.expiresAt).toLocaleDateString() : 'Next Month'}</span> for <span className="font-bold text-paper-900 dark:text-white">$2.00 / month</span>.
                        </div>
                      </div>
                      <button
                        onClick={handleCancelPremium}
                        className="px-4 py-2 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20 dark:text-red-400 text-xs font-semibold rounded-md transition-all relative z-10 shrink-0"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Free state: Show plan cards */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Free Card */}
                    <div className="p-5 rounded-lg border border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 flex flex-col justify-between hover:border-paper-300 dark:hover:border-ink-600 transition-all">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-paper-800 dark:text-ink-200">Free Tier</h4>
                          <div className="text-2xl font-bold text-paper-900 dark:text-white mt-1">$0 <span className="text-xs font-medium text-paper-400 dark:text-ink-550">/ forever</span></div>
                        </div>
                        <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-relaxed">
                          Ideal for small-scale landlords managing a minimal portfolio of units.
                        </p>
                        <div className="space-y-1.5 text-[11px] text-paper-600 dark:text-ink-300 font-medium">
                          <div>• Max 3 Properties</div>
                          <div className="text-paper-400 dark:text-ink-500 line-through">• Sophia AI assistant blocked</div>
                          <div className="text-paper-400 dark:text-ink-500 line-through">• Assignment of contractors blocked</div>
                          <div className="text-paper-400 dark:text-ink-500 line-through">• Workspace member invitations blocked</div>
                        </div>
                      </div>
                      <div className="pt-6">
                        <span className="block text-center py-2 bg-paper-250 dark:bg-ink-950/60 text-paper-500 dark:text-ink-400 text-xs font-semibold rounded-md border border-paper-200 dark:border-ink-800">
                          Current Plan
                        </span>
                      </div>
                    </div>

                    {/* Premium Card */}
                    <div className="p-5 rounded-lg border border-coral-500/40 bg-coral-50/10 dark:bg-coral-500/5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-coral-500 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 fill-coral-500" /> Premium Tier
                            </h4>
                            <div className="text-2xl font-bold text-paper-900 dark:text-white mt-1">$2.00 <span className="text-xs font-medium text-paper-400 dark:text-ink-550">/ month</span></div>
                          </div>
                          <span className="bg-coral-505 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                            Popular
                          </span>
                        </div>
                        <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-relaxed">
                          Unlock unlimited scaling, robust team collaboration, and automated AI orchestration.
                        </p>
                        <div className="space-y-1.5 text-[11px] text-paper-600 dark:text-ink-300 font-medium">
                          <div>• **Unlimited properties & unit capacity**</div>
                          <div>• Full conversations with **Sophia AI**</div>
                          <div>• Assign **marketplace contractors** directly</div>
                          <div>• Invite **unlimited team managers**</div>
                        </div>
                      </div>
                      <div className="pt-6">
                        <button
                          onClick={() => { setCheckoutType('premium'); setShowCheckoutModal(true); }}
                          className="w-full py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-md shadow-md shadow-coral-500/10 hover:shadow-coral-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* 2. Teammate Usage Matrix */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm mt-6">
              <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider">Teammate Token Usage Roster</h3>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Audit operation tokens consumed across your workspace personnel. Click row to verify blockchain TXID details.</p>
                </div>
                
                {/* Filters Section */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-paper-400 dark:text-ink-500 font-medium">From:</span>
                    <input 
                      type="date" 
                      value={dateFilterStart} 
                      onChange={(e) => setDateFilterStart(e.target.value)} 
                      className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-750 rounded text-[10px] font-semibold px-2 py-1 text-paper-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-paper-400 dark:text-ink-550 font-medium">To:</span>
                    <input 
                      type="date" 
                      value={dateFilterEnd} 
                      onChange={(e) => setDateFilterEnd(e.target.value)} 
                      className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-750 rounded text-[10px] font-semibold px-2 py-1 text-paper-800 dark:text-white"
                    />
                  </div>
                  <select
                    value={selectedTeammateFilter}
                    onChange={(e) => setSelectedTeammateFilter(e.target.value)}
                    className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-750 rounded text-[10px] font-semibold px-2 py-1 text-paper-800 dark:text-white font-medium"
                  >
                    <option value="all">All Teammates</option>
                    {teamMembers.map(tm => (
                      <option key={tm.id} value={tm.email}>{tm.name || tm.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper-50 dark:bg-ink-950/20 text-[9px] uppercase font-bold text-paper-500 dark:text-ink-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Teammate & Email</th>
                      <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Operation / Action</th>
                      <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Tokens Spent</th>
                      <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-100 dark:divide-ink-700/50">
                    {paginatedUsage.map((u: any) => (
                      <tr 
                        key={u.txid} 
                        onClick={() => setSelectedTx(u)}
                        className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-semibold text-paper-900 dark:text-white">
                          <div>{u.teammateName}</div>
                          <div className="text-[10px] font-medium text-paper-400 dark:text-ink-500">{u.teammateEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-paper-600 dark:text-ink-300 font-medium">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-paper-100 dark:bg-ink-900 text-paper-600 dark:text-ink-400 rounded text-[9.5px] font-semibold tracking-wide uppercase mr-2">
                            {u.category || 'Sophia'}
                          </span>
                          {u.description}
                        </td>
                        <td className="px-4 py-3 font-bold text-red-500 text-xs">
                          -{u.amount} tokens
                        </td>
                        <td className="px-4 py-3 text-right text-paper-400 dark:text-ink-500 text-[10px] font-medium">
                          {new Date(u.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {filteredUsage.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-paper-400 dark:text-ink-500">
                          No usage logs registered for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION PANEL */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400">
                  <span>Showing {paginatedUsage.length} of {filteredUsage.length} entries</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-700 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold">Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-700 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Refill Wallet Console */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Balance & Recharge Card */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-coral-500" /> Wallet Balance
                </h3>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
                {/* Big Balance display */}
                <div className="p-5 rounded-lg bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800/80 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
                  <div className="text-[10px] font-bold text-paper-400 dark:text-ink-550 uppercase tracking-widest mb-1.5">Available Credits</div>
                  <div className="text-3xl font-extrabold text-paper-900 dark:text-white font-mono tracking-tight">
                    {billingData.tokenBalance?.toLocaleString() || 0}
                  </div>
                  <div className="text-[9.5px] font-semibold text-coral-500 mt-1 uppercase tracking-wide">
                    1 KES = 6 tokens
                  </div>
                </div>

                {/* Credit Recharge Console */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-paper-500 dark:text-ink-450 uppercase tracking-widest mb-1.5 block">Refill Credit packages</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { tokens: 600, kes: 100, tag: 'Starter' },
                        { tokens: 1500, kes: 250, tag: 'Standard' },
                        { tokens: 3000, kes: 500, tag: 'Professional' }
                      ].map((pkg) => (
                        <button
                          key={pkg.tokens}
                          onClick={() => setCreditRechargeAmount(pkg.tokens)}
                          className={`p-2.5 rounded-lg border text-center transition-all ${creditRechargeAmount === pkg.tokens ? 'border-coral-500 bg-coral-50/20 dark:bg-coral-500/10' : 'border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900 hover:border-paper-300 dark:hover:border-ink-600'}`}
                        >
                          <div className="text-xs font-bold text-paper-900 dark:text-white font-mono">{pkg.tokens} tkn</div>
                          <div className="text-[9.5px] font-semibold text-paper-400 dark:text-ink-450 mt-0.5">{pkg.kes} KES</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom quantity slider/input */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-paper-500 dark:text-ink-450 uppercase tracking-widest block">Or custom token amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={creditRechargeAmount}
                        onChange={(e) => setCreditRechargeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-bold text-paper-900 dark:text-white outline-none focus:ring-1 focus:ring-coral-500 focus:border-coral-500"
                        placeholder="e.g. 500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-semibold text-paper-400 dark:text-ink-500 uppercase">~{Math.round(creditRechargeAmount / 6)} KES</span>
                      </div>
                    </div>
                  </div>

                  {/* Buy Action */}
                  <button
                    onClick={() => { setCheckoutType('credits'); setShowCheckoutModal(true); }}
                    className="w-full py-2.5 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-bold rounded-md shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    Refill Tokens via Stripe
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Stripe Embedded Payment Modal */}
      {showCheckoutModal && (
        <StripeCheckoutModal
          type={checkoutType}
          amount={creditRechargeAmount}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}

      {/* Success Wizard Pop-up Modal */}
      {showSuccessWizard && wizardData && (
        <SuccessWizardModal
          type={wizardData.type}
          amount={wizardData.amount}
          onClose={() => setShowSuccessWizard(false)}
        />
      )}

      {/* INLINE DETAILS MODAL OVERLAY */}
      {selectedTx && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 dark:bg-black/90 animate-fade-in text-xs font-sans">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-2xl max-w-md w-full">
            <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-750 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
              <span className="font-bold uppercase tracking-wider text-paper-950 dark:text-white">Transaction Details</span>
              <button onClick={() => setSelectedTx(null)} className="text-paper-400 hover:text-paper-800 dark:text-ink-500 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Initiator (Sender)</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white break-all select-all">{selectedTx.teammateEmail}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Recipient Account</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white">RESERVE_SPENT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-paper-100 dark:border-ink-800/80 pt-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Operation category</span>
                  <span className="px-1.5 py-0.5 bg-paper-100 dark:bg-ink-900 text-paper-600 dark:text-ink-400 rounded text-[9.5px] font-bold uppercase tracking-wide">
                    {selectedTx.category || 'Sophia'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Deducted Credits</span>
                  <span className="font-mono font-black text-red-500">-{selectedTx.amount} tokens</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-paper-100 dark:border-ink-800/80 pt-3">
                <span className="text-[9px] uppercase font-bold text-paper-400 block font-bold">Transaction Block ID (TXID)</span>
                <div className="flex gap-2 items-center bg-paper-50 dark:bg-ink-950 p-2 rounded border border-paper-200 dark:border-ink-800">
                  <span className="font-mono text-paper-700 dark:text-ink-400 break-all select-all flex-1 text-[10.5px]">{selectedTx.txid}</span>
                  <button 
                    onClick={() => handleCopyTxid(selectedTx.txid)}
                    className="p-1 text-paper-400 hover:text-paper-800 dark:text-ink-500 dark:hover:text-white shrink-0"
                  >
                    {copiedTxid ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-0.5 border-t border-paper-100 dark:border-ink-800/80 pt-3">
                <span className="text-[9px] uppercase font-bold text-paper-400 block">Usage Reference Description</span>
                <span className="font-semibold text-paper-800 dark:text-white">{selectedTx.description}</span>
              </div>

              <div className="flex justify-between items-center text-[9.5px] text-paper-400 dark:text-ink-500 pt-3 border-t border-paper-100 dark:border-ink-800/80">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secured UTXO block</span>
                <span>{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
