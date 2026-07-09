'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ModLayout from '../../../components/ModLayout';
import { TxDetailsModal } from '../../../components/TxDetailsModal';
import { 
  Coins, Key, ShieldCheck, Check, X, AlertTriangle, Wallet,
  HelpCircle, RefreshCw, Layers, PlusCircle, Calendar,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface MintLogItem {
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

export default function CreditsReservePage() {
  const [reserveBalance, setReserveBalance] = useState<number>(0);
  const [spentBalance, setSpentBalance] = useState<number>(0);
  const [mintHistory, setMintHistory] = useState<MintLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Selected transaction detail modal state
  const [selectedTx, setSelectedTx] = useState<MintLogItem | null>(null);

  // Form states
  const [mintAmount, setMintAmount] = useState<number>(10000);
  const [mintDesc, setMintDesc] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchReserveData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/reserve-info');
      if (res.ok) {
        const data = await res.json();
        setReserveBalance(data.reserveBalance || 0);
        setSpentBalance(data.spentBalance || 0);
        setMintHistory(data.mintHistory || []);
      } else {
        triggerToast('Failed to retrieve reserve ledger history');
      }
    } catch (e) {
      triggerToast('Error connecting to database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReserveData();
  }, []);

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mintAmount <= 0) {
      triggerToast('Mint amount must be positive');
      return;
    }

    setIsMinting(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: mintAmount, description: mintDesc })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tx) {
          triggerToast(`Mint block appended successfully: ${mintAmount.toLocaleString()} tokens`);
          setMintAmount(10000);
          setMintDesc('');
          fetchReserveData();
        } else {
          triggerToast(data.message || 'Mint execution failed on ledger');
        }
      } else {
        const errData = await res.json();
        triggerToast(errData.message || 'Failed to authorize mint block');
      }
    } catch (e) {
      triggerToast('Minting failed: network connectivity issue');
    } finally {
      setIsMinting(false);
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
          fetchReserveData();
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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(mintHistory.length / itemsPerPage));
  const paginatedMintHistory = mintHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ModLayout title="System / Credits & Ledger / Central Reserve">
      <div className="space-y-6 w-full pb-10">
        
        {/* TOAST SYSTEM */}
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
            <span className="text-xs font-bold uppercase tracking-wider text-coral-500 border-b-2 border-coral-500 pb-2.5 cursor-pointer">
              Central Reserve
            </span>
          </Link>
          <Link href="/system/credits/users">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              User Allocations
            </span>
          </Link>
          <Link href="/system/credits/tracer">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Block Tracer
            </span>
          </Link>
        </div>

        {/* TOP METRICS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-ink-900 p-6 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Reserve Wallet Balance</p>
              <h3 className="text-2xl font-black text-paper-900 dark:text-white mt-1 font-mono tracking-tight">
                {isLoading ? '...' : reserveBalance.toLocaleString()}
              </h3>
              <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Genesis minted supply.
              </p>
            </div>
            <Coins className="w-8 h-8 text-coral-500 opacity-80" />
          </div>

          <div className="bg-white dark:bg-ink-900 p-6 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Spent Account Balance</p>
              <h3 className="text-2xl font-black text-paper-900 dark:text-white mt-1 font-mono tracking-tight">
                {isLoading ? '...' : Math.abs(spentBalance).toLocaleString()}
              </h3>
              <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-1.5 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-blue-500" /> Credits used by managers.
              </p>
            </div>
            <Wallet className="w-8 h-8 text-blue-500 opacity-80" />
          </div>

          {/* MINTING CONSOLE */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <PlusCircle className="w-4 h-4 text-coral-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">Mint Supply Console</span>
            </div>

            <form onSubmit={handleMintSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  value={mintAmount} 
                  onChange={(e) => setMintAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Tokens amount"
                  className="w-full px-2.5 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                  required
                />
                <input 
                  type="text" 
                  value={mintDesc} 
                  onChange={(e) => setMintDesc(e.target.value)}
                  placeholder="Audit reference note"
                  className="w-full px-2.5 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isMinting || mintAmount <= 0}
                className="w-full py-1.5 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isMinting ? 'Writing mint block...' : 'Execute Mint Transaction'}
              </button>
            </form>
          </div>
        </div>

        {/* RESERVE MINT HISTORY & AUDIT LOGS */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/50 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-coral-500" /> Chronological Reserve Mint Logs (Page {currentPage} of {totalPages})
              </h3>
              <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Click any row to open hash traces, verify parent hashes, or counterbalance transactions.</p>
            </div>
            <button 
              onClick={fetchReserveData}
              disabled={isLoading}
              className="p-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg text-paper-700 dark:text-ink-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9.5px] font-black uppercase tracking-wider text-paper-500 dark:text-ink-400">
                  <th className="px-6 py-3.5">Block Transaction ID</th>
                  <th className="px-6 py-3.5">Block Sender</th>
                  <th className="px-6 py-3.5">Receiver</th>
                  <th className="px-6 py-3.5">Mint Value</th>
                  <th className="px-6 py-3.5">Description Annotations</th>
                  <th className="px-6 py-3.5 text-right">Mint Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/40 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-500">
                      Loading reserve logs...
                    </td>
                  </tr>
                ) : paginatedMintHistory.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedTx(log)}
                    className="hover:bg-paper-50/50 dark:hover:bg-ink-800/10 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5 font-mono text-[10.5px] text-paper-500 dark:text-ink-400 select-all">
                      {log.id.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {log.senderUsername}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-paper-900 dark:text-white">
                      {log.receiverUsername}
                    </td>
                    <td className="px-6 py-3.5 font-black text-coral-500">
                      +{log.amount.toLocaleString()} tkn
                    </td>
                    <td className="px-6 py-3.5 text-paper-600 dark:text-ink-300 font-semibold">
                      {log.description || 'System Liquidity Refill'}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-paper-400 dark:text-ink-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!isLoading && mintHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-500">
                      No reserve mint logs registered in ledger database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400">
              <span>Showing {paginatedMintHistory.length} of {mintHistory.length} transactions</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold px-2">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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
