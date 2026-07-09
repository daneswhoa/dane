'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ModLayout from '../../../components/ModLayout';
import { TxDetailsModal } from '../../../components/TxDetailsModal';
import { 
  Coins, Key, ShieldCheck, Check, X, AlertTriangle, ArrowRightLeft, 
  HelpCircle, RefreshCw, Search, Users, Activity, Wallet,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface PurchaseLogItem {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  amount: number;
  transactionType: string;
  operationCategory: string | null;
  description: string | null;
  previousTxid: string | null;
  timestamp: string;
}

interface ResolvedUserItem {
  id: string;
  name: string | null;
  username: string;
  email: string;
  organizationId: string | null;
  organizationName: string | null;
  role: string;
  balance: number;
}

export default function CreditsUsersPage() {
  const [recentPurchases, setRecentPurchases] = useState<PurchaseLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Pagination for purchases
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Selected transaction detail modal state
  const [selectedTx, setSelectedTx] = useState<PurchaseLogItem | null>(null);

  // Search User Balance resolver
  const [userQuery, setUserQuery] = useState<string>('');
  const [resolvedUsers, setResolvedUsers] = useState<ResolvedUserItem[]>([]);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Adjustment form states
  const [targetUsername, setTargetUsername] = useState<string>('');
  const [adjustAmount, setAdjustAmount] = useState<number>(1500);
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPurchasesData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/reserve-info');
      if (res.ok) {
        const data = await res.json();
        setRecentPurchases(data.recentPurchases || []);
      } else {
        triggerToast('Failed to retrieve user refill logs');
      }
    } catch (e) {
      triggerToast('Error connecting to database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasesData();
  }, []);

  const handleSearchResolver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setIsResolving(true);
    setResolvedUsers([]);
    try {
      const res = await fetch(`/api/dashboard/security/credits/resolve-user?query=${encodeURIComponent(userQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResolvedUsers(data);
        if (data.length === 0) {
          triggerToast('No users or organizations match this query');
        }
      } else {
        triggerToast('Error resolving user directory');
      }
    } catch (e) {
      triggerToast('Lookup failed: connection timeout');
    } finally {
      setIsResolving(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || adjustAmount <= 0) {
      triggerToast('Valid target identifier and amount are required');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername.trim(),
          amount: adjustAmount,
          action: adjustAction
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tx) {
          triggerToast(`Successfully recorded adjustment block: ${adjustAction === 'credit' ? '+' : '-'}${adjustAmount} tokens`);
          setTargetUsername('');
          setAdjustAmount(1500);
          fetchPurchasesData();
          setResolvedUsers([]);
          setUserQuery('');
        } else {
          triggerToast(data.message || 'Ledger adjustment failed');
        }
      } else {
        const errData = await res.json();
        triggerToast(errData.message || 'Authorized adjustment declined by system rules');
      }
    } catch (e) {
      triggerToast('Adjustment failed: network issue');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReverseTx = async (txid: string) => {
    try {
      const res = await fetch('/api/dashboard/security/credits/reverse-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          triggerToast('Transaction block successfully reversed!');
          fetchPurchasesData();
        } else {
          triggerToast(data.message || 'Failed to reverse transaction');
        }
      } else {
        const errData = await res.json();
        triggerToast(errData.message || 'Ledger transaction reversal failed');
      }
    } catch (e) {
      triggerToast('Network error during transaction reversal');
    }
  };

  const selectUserForAdjustment = (username: string) => {
    setTargetUsername(username);
    triggerToast(`Selected target: ${username}`);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(recentPurchases.length / itemsPerPage));
  const paginatedPurchases = recentPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ModLayout title="System / Credits & Ledger / User Allocations">
      <div className="space-y-6 w-full pb-10">
        
        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/35 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB NAVIGATION HEADER */}
        <div className="flex border-b border-paper-200 dark:border-ink-800 pb-px gap-6">
          <Link href="/system/credits">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Overview & Pricing
            </span>
          </Link>
          <Link href="/system/credits/reserve">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Central Reserve
            </span>
          </Link>
          <Link href="/system/credits/users">
            <span className="text-xs font-bold uppercase tracking-wider text-coral-500 border-b-2 border-coral-500 pb-2.5 cursor-pointer">
              User Allocations
            </span>
          </Link>
          <Link href="/system/credits/tracer">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Block Tracer
            </span>
          </Link>
        </div>

        {/* GRID ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block: Search & Adjustment Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. LOOKUP AND SEARCH TOOL */}
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-6">
              <div className="border-b border-paper-100 dark:border-ink-800/80 pb-4 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">User Directory & Balance Lookup</h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Search organization by name, ID, username or email to inspect balances and copy details.</p>
                </div>
              </div>

              <form onSubmit={handleSearchResolver} className="flex gap-3 mb-4">
                <input 
                  type="text" 
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Enter organization ID, name, email or username..." 
                  className="flex-1 px-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner"
                  required
                />
                <button
                  type="submit"
                  disabled={isResolving || !userQuery}
                  className="px-4 py-2 bg-blue-550 hover:bg-blue-600 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-800 dark:text-ink-200 text-xs font-bold rounded-xl transition-all"
                >
                  {isResolving ? 'Querying...' : 'Search Directory'}
                </button>
              </form>

              {resolvedUsers.length > 0 && (
                <div className="overflow-hidden border border-paper-200 dark:border-ink-800/80 rounded-xl divide-y divide-paper-100 dark:divide-ink-850">
                  {resolvedUsers.map((u) => (
                    <div key={u.id} className="p-3 hover:bg-paper-50 dark:hover:bg-ink-950/40 transition-colors flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                          <span>{u.name || u.username}</span>
                          {u.organizationName && (
                            <span className="px-1.5 py-0.5 bg-paper-150 dark:bg-ink-900 text-paper-600 dark:text-ink-400 rounded text-[9px] uppercase tracking-wide">
                              Org: {u.organizationName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-paper-405 dark:text-ink-500 mt-0.5">
                          Email: {u.email} | Org ID: {u.organizationId || 'None'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-paper-400 uppercase">Ledger Balance</div>
                          <div className="font-mono font-black text-coral-500">{u.balance.toLocaleString()} tkn</div>
                        </div>
                        <button
                          onClick={() => selectUserForAdjustment(u.username)}
                          className="px-2.5 py-1 bg-coral-500 hover:bg-coral-600 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. CREDIT / DEBIT ADJUSTMENTS FORM */}
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-6">
              <div className="border-b border-paper-100 dark:border-ink-800/80 pb-4 mb-5 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-coral-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">Allocate / Adjust User Credits</h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Authorize direct ledger adjustments. Credits move from Reserve; debits return to Reserve.</p>
                </div>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-50 block">Target Username / Email</label>
                    <input 
                      type="text" 
                      value={targetUsername} 
                      onChange={(e) => setTargetUsername(e.target.value)}
                      placeholder="Enter target username..."
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-50 block">Tokens Amount</label>
                    <input 
                      type="number" 
                      value={adjustAmount} 
                      onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-50 block">Adjustment Action</label>
                    <select 
                      value={adjustAction} 
                      onChange={(e) => setAdjustAction(e.target.value as any)}
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white cursor-pointer"
                    >
                      <option value="credit">Credit Organization (from Reserve)</option>
                      <option value="debit">Debit Organization (return to Reserve)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isActionLoading || !targetUsername || adjustAmount <= 0}
                  className="px-4 py-2 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  {isActionLoading ? 'Processing transaction...' : 'Apply Ledger Transaction Block'}
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: 10 Recent Refill Purchases */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full justify-between">
              <div>
                <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-coral-500" /> Recent User Purchases
                  </h3>
                </div>

                <div className="divide-y divide-paper-100 dark:divide-ink-850 overflow-y-auto max-h-[420px]">
                  {isLoading ? (
                    <div className="p-6 text-center text-paper-400 dark:text-ink-500 text-xs">
                      Loading recent purchase logs...
                    </div>
                  ) : paginatedPurchases.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="p-4 space-y-2 text-[11px] hover:bg-paper-50 dark:hover:bg-ink-950/30 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-paper-900 dark:text-white truncate max-w-[130px]">{tx.receiverUsername}</span>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">+{tx.amount.toLocaleString()} tkn</span>
                      </div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-500 leading-relaxed font-semibold">
                        {tx.description || 'Stripe credit package refill'}
                      </div>
                      <div className="flex justify-between text-[9px] text-paper-400 dark:text-ink-550">
                        <span className="font-mono">TX: {tx.id.substring(0, 10)}...</span>
                        <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {!isLoading && recentPurchases.length === 0 && (
                    <div className="p-6 text-center text-paper-400 dark:text-ink-500 text-xs">
                      No recent Stripe refill logs identified.
                    </div>
                  )}
                </div>
              </div>

              {/* PAGINATION PANEL */}
              {!isLoading && totalPages > 1 && (
                <div className="px-4 py-3 border-t border-paper-100 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400">
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold">{currentPage}/{totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* SELECTED TRANSACTION DETAIL MODAL */}
      {selectedTx && (
        <TxDetailsModal 
          tx={selectedTx} 
          onClose={() => setSelectedTx(null)} 
          onReverse={handleReverseTx}
        />
      )}
    </ModLayout>
  );
}
