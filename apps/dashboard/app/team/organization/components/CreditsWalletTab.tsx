'use client';

import React, { useState } from 'react';
import {
  Wallet, Loader2, ChevronLeft, ChevronRight,
  Copy, Check, X, ShieldCheck, Coins, ArrowDownUp,
  TrendingDown, Clock, Filter, RefreshCw
} from 'lucide-react';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { SuccessWizardModal } from './SuccessWizardModal';

interface CreditsWalletTabProps {
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
  billingMessage: string | null;
  setBillingMessage: (val: string | null) => void;
  onRefresh: () => void;
}

export function CreditsWalletTab({
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
  billingMessage,
  setBillingMessage,
  onRefresh
}: CreditsWalletTabProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessWizard, setShowSuccessWizard] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Transaction details modal
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [copiedTxid, setCopiedTxid] = useState(false);

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
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

  // Pagination calc
  const totalPages = Math.max(1, Math.ceil(filteredUsage.length / itemsPerPage));
  const paginatedUsage = filteredUsage.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeammateFilter, dateFilterStart, dateFilterEnd]);

  // Usage summary stats
  const totalSpent = filteredUsage.reduce((sum: number, u: any) => sum + (u.amount || 0), 0);
  const uniqueUsers = new Set(filteredUsage.map((u: any) => u.teammateEmail)).size;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {billingMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>{billingMessage}</span>
          <button onClick={() => setBillingMessage(null)} className="text-[10px] uppercase underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Credits Hero Banner */}
      <div 
        className="bg-ink-950 dark:bg-black rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-sm min-h-[140px]"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(5, 8, 11, 0.95)), url("/credits_wallet_banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5" /> Credits & Usage
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Wallet & Token Management</h2>
          <p className="text-[11px] text-ink-300 leading-relaxed">
            Monitor your credit balance, track team usage patterns, and refill your wallet. Every operation — AI conversations, email broadcasts, and tool calls — consumes credits from your workspace balance.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 flex-shrink-0">
          <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-3.5 flex flex-col justify-center min-w-[200px]">
            <div className="text-[9px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Wallet Overview</div>
            <div className="space-y-1 mt-1 text-[11px] text-ink-300">
              <div>• Balance: <span className="font-bold text-white">{billingData.tokenBalance?.toLocaleString() || 0} credits</span></div>
              <div>• Rate: <span className="font-bold text-white">1 KES = 6 credits</span></div>
              <div>• Usage: <span className="font-bold text-white">{filteredUsage.length} transactions</span></div>
            </div>
          </div>
        </div>
      </div>

      {billingLoading && !billingData.tokenBalance ? (
        <div className="py-12 flex flex-col items-center justify-center bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-coral-500 mb-2" />
          <div className="text-xs font-medium text-paper-500 dark:text-ink-400">Loading wallet data...</div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Balance Card */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-coral-500/5 rounded-full blur-xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-coral-500" />
                </div>
                <span className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Balance</span>
              </div>
              <div className="text-2xl font-extrabold text-paper-900 dark:text-white font-mono tracking-tight">
                {billingData.tokenBalance?.toLocaleString() || 0}
              </div>
              <div className="text-[9.5px] font-semibold text-coral-500 mt-0.5 uppercase tracking-wide">
                credits available
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Total Spent</span>
              </div>
              <div className="text-2xl font-extrabold text-red-500 font-mono tracking-tight">
                -{totalSpent.toLocaleString()}
              </div>
              <div className="text-[9.5px] font-semibold text-paper-400 dark:text-ink-500 mt-0.5 uppercase tracking-wide">
                {filteredUsage.length} transactions
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <ArrowDownUp className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Active Users</span>
              </div>
              <div className="text-2xl font-extrabold text-paper-900 dark:text-white font-mono tracking-tight">
                {uniqueUsers}
              </div>
              <div className="text-[9.5px] font-semibold text-paper-400 dark:text-ink-500 mt-0.5 uppercase tracking-wide">
                teammates with usage
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Usage Table */}
            <div className="lg:col-span-2 space-y-0">
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-coral-500" /> Usage History
                    </h3>
                    <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Credit consumption by team members. Click a row for details.</p>
                  </div>
                  
                  {/* Filters */}
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
                      className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-750 rounded text-[10px] font-semibold px-2 py-1 text-paper-800 dark:text-white"
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
                        <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Teammate</th>
                        <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Action</th>
                        <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Credits</th>
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
                            -{u.amount}
                          </td>
                          <td className="px-4 py-3 text-right text-paper-400 dark:text-ink-500 text-[10px] font-medium">
                            {new Date(u.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}

                      {filteredUsage.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-paper-400 dark:text-ink-500">
                            No usage logs found for the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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

            {/* Right: Wallet Refill Console */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-coral-500" /> Refill Credits
                  </h3>
                  <button 
                    onClick={onRefresh}
                    className="p-1.5 rounded-md bg-paper-100 dark:bg-ink-900 hover:bg-paper-200 dark:hover:bg-ink-700 border border-paper-200 dark:border-ink-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-paper-500 dark:text-ink-400" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                  {/* Quick Packages */}
                  <div>
                    <label className="text-[9px] font-bold text-paper-500 dark:text-ink-450 uppercase tracking-widest mb-2 block">Choose Package</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { tokens: 600, kes: 100, tag: 'Starter' },
                        { tokens: 1500, kes: 250, tag: 'Standard' },
                        { tokens: 3000, kes: 500, tag: 'Pro' }
                      ].map((pkg) => (
                        <button
                          key={pkg.tokens}
                          onClick={() => setCreditRechargeAmount(pkg.tokens)}
                          className={`p-3 rounded-lg border text-center transition-all ${creditRechargeAmount === pkg.tokens
                            ? 'border-coral-500 bg-coral-50/20 dark:bg-coral-500/10 ring-1 ring-coral-500/30'
                            : 'border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900 hover:border-paper-300 dark:hover:border-ink-600'
                          }`}
                        >
                          <div className="text-[8px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-1">{pkg.tag}</div>
                          <div className="text-sm font-bold text-paper-900 dark:text-white font-mono">{pkg.tokens}</div>
                          <div className="text-[9px] font-semibold text-paper-400 dark:text-ink-450 mt-0.5">{pkg.kes} KES</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-paper-500 dark:text-ink-450 uppercase tracking-widest block">Custom Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={creditRechargeAmount}
                        onChange={(e) => setCreditRechargeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-bold text-paper-900 dark:text-white outline-none focus:ring-1 focus:ring-coral-500 focus:border-coral-500"
                        placeholder="e.g. 500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-semibold text-paper-400 dark:text-ink-500 uppercase">~{Math.round(creditRechargeAmount / 6)} KES</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Info */}
                  <div className="p-3 rounded-lg bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800/80 text-center">
                    <div className="text-[9.5px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider">Exchange Rate</div>
                    <div className="text-xs font-bold text-paper-900 dark:text-white mt-0.5">1 KES = 6 credits</div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-2.5 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-bold rounded-md shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" /> Buy {creditRechargeAmount.toLocaleString()} Credits
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      {showCheckoutModal && (
        <StripeCheckoutModal
          type="credits"
          amount={creditRechargeAmount}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}

      {/* Success Wizard */}
      {showSuccessWizard && (
        <SuccessWizardModal
          type="credits"
          amount={creditRechargeAmount}
          onClose={() => setShowSuccessWizard(false)}
        />
      )}

      {/* Transaction Details Modal */}
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
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Initiated By</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white break-all select-all">{selectedTx.teammateEmail}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Destination</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white">RESERVE_SPENT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-paper-100 dark:border-ink-800/80 pt-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Category</span>
                  <span className="px-1.5 py-0.5 bg-paper-100 dark:bg-ink-900 text-paper-600 dark:text-ink-400 rounded text-[9.5px] font-bold uppercase tracking-wide">
                    {selectedTx.category || 'Sophia'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 block">Credits Deducted</span>
                  <span className="font-mono font-black text-red-500">-{selectedTx.amount}</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-paper-100 dark:border-ink-800/80 pt-3">
                <span className="text-[9px] uppercase font-bold text-paper-400 block">Transaction ID</span>
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
                <span className="text-[9px] uppercase font-bold text-paper-400 block">Description</span>
                <span className="font-semibold text-paper-800 dark:text-white">{selectedTx.description}</span>
              </div>

              <div className="flex justify-between items-center text-[9.5px] text-paper-400 dark:text-ink-500 pt-3 border-t border-paper-100 dark:border-ink-800/80">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified</span>
                <span>{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
