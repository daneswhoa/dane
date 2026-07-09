'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ModLayout from '../../../components/ModLayout';
import { 
  Coins, Key, ShieldCheck, Check, X, AlertTriangle, ArrowRightLeft, 
  HelpCircle, RefreshCw, Search, Undo, Calendar
} from 'lucide-react';

interface TxVerificationResult {
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

export default function CreditsTracerPage() {
  const [verifyTxid, setVerifyTxid] = useState<string>('');
  const [verifiedTx, setVerifiedTx] = useState<TxVerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTxid.trim()) return;

    setIsLoading(true);
    setVerifiedTx(null);
    setVerifyError(null);

    try {
      const res = await fetch(`/api/dashboard/security/credits/verify-tx/${verifyTxid.trim()}`);
      if (res.ok) {
        const tx = await res.json();
        setVerifiedTx(tx);
        triggerToast('Cryptographic block signature verified successfully!');
      } else {
        const data = await res.json();
        setVerifyError(data.message || 'Transaction hash ID not found in ledger database');
      }
    } catch (e) {
      setVerifyError('Error querying database server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverseClick = async (txid: string) => {
    if (!confirm('WARNING: Reversing blocks modifies the ledger. This will append a counterbalance transaction block to offset the original state. Continue?')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/reverse-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reverseTx) {
          triggerToast('Transaction successfully reversed in ledger!');
          setVerifiedTx(null);
          setVerifyTxid('');
        } else {
          triggerToast(data.message || 'Failed to reverse transaction block');
        }
      } else {
        const errData = await res.json();
        triggerToast(errData.message || 'Ledger transaction reversal failed');
      }
    } catch (e) {
      triggerToast('Reversal failed: connection timeout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModLayout title="System / Credits & Ledger / Block Tracer">
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
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Central Reserve
            </span>
          </Link>
          <Link href="/system/credits/users">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              User Allocations
            </span>
          </Link>
          <Link href="/system/credits/tracer">
            <span className="text-xs font-bold uppercase tracking-wider text-coral-500 border-b-2 border-coral-500 pb-2.5 cursor-pointer">
              Block Tracer
            </span>
          </Link>
        </div>

        {/* TRACER SEARCH CONSOLE */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-6">
          <div className="border-b border-paper-100 dark:border-ink-800/80 pb-4 mb-5 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">Cryptographic Transaction Verification & Tracer</h3>
              <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Inspect hash parent relationships, timestamps, block signatures, and execute reversals.</p>
            </div>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex gap-3">
            <input 
              type="text" 
              value={verifyTxid}
              onChange={(e) => setVerifyTxid(e.target.value)}
              placeholder="Enter SHA-256 block hash ID..." 
              className="flex-1 px-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !verifyTxid.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
            >
              Verify Block
            </button>
          </form>

          {verifyError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{verifyError}</span>
            </div>
          )}

          {verifiedTx && (
            <div className="mt-6 p-4 rounded-xl border border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/40 space-y-4 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse-slow" /> Block Signature Match
                </span>
                <button
                  onClick={() => handleReverseClick(verifiedTx.id)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <Undo className="w-3.5 h-3.5" /> Append Reversal Block
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Sender Username</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white">{verifiedTx.senderUsername}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Receiver Username</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white">{verifiedTx.receiverUsername}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Block Value</span>
                  <span className="font-mono font-black text-coral-500">{verifiedTx.amount} tokens</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Transaction Type</span>
                  <span className="px-1.5 py-0.5 bg-paper-200 dark:bg-ink-900 text-paper-700 dark:text-ink-300 rounded font-semibold uppercase text-[9.5px]">
                    {verifiedTx.transactionType}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Operation Category</span>
                  <span className="font-semibold text-paper-800 dark:text-ink-100">{verifiedTx.operationCategory || 'manual_adjust'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Timestamp</span>
                  <span className="font-medium text-paper-800 dark:text-ink-100">{new Date(verifiedTx.timestamp).toLocaleString()}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Previous Block Hash (Parent)</span>
                  <span className="font-mono font-medium text-paper-450 dark:text-ink-450 break-all select-all">{verifiedTx.previousTxid || 'GENESIS_ROOT'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Block Hash (Signature)</span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 break-all select-all">{verifiedTx.id}</span>
                </div>
                {verifiedTx.description && (
                  <div className="md:col-span-2">
                    <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Description Metadata</span>
                    <span className="font-semibold text-paper-800 dark:text-ink-100">{verifiedTx.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </ModLayout>
  );
}
