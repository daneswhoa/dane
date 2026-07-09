'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, X, AlertTriangle, Undo } from 'lucide-react';

interface TxDetails {
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

interface TxDetailsModalProps {
  tx: TxDetails;
  onClose: () => void;
  onReverse?: (txid: string) => void;
}

export function TxDetailsModal({ tx, onClose, onReverse }: TxDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [isReversing, setIsReversing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReverse = async () => {
    if (!onReverse) return;
    setIsReversing(true);
    try {
      await onReverse(tx.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsReversing(false);
    }
  };

  const isGenesis = tx.senderUsername === 'SYSTEM' && tx.receiverUsername === 'RESERVE';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 dark:bg-black/90 animate-fade-in">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full animate-scale-up">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-paper-100 dark:border-ink-850/80 bg-paper-50 dark:bg-ink-950/60 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-coral-500">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Cryptographic Block Specifications</span>
          </div>
          <button onClick={onClose} className="text-paper-400 hover:text-paper-900 dark:text-ink-500 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Sender Account</span>
              <span className="font-mono font-bold text-paper-900 dark:text-white break-all select-all">{tx.senderUsername}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Receiver Account</span>
              <span className="font-mono font-bold text-paper-900 dark:text-white break-all select-all">{tx.receiverUsername}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-paper-100 dark:border-ink-850/85 pt-3">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Block Value</span>
              <span className="font-mono font-black text-coral-500 text-sm">{tx.amount.toLocaleString()} tokens</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Transaction Type</span>
              <span className="inline-flex px-1.5 py-0.5 bg-paper-100 dark:bg-ink-900 text-paper-700 dark:text-ink-300 rounded font-semibold uppercase text-[9px] tracking-wider mt-0.5">
                {tx.transactionType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-paper-100 dark:border-ink-850/85 pt-3">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Operation Category</span>
              <span className="font-semibold text-paper-800 dark:text-ink-100 uppercase tracking-wide text-[9.5px]">
                {tx.operationCategory || 'manual_adjust'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Timestamp</span>
              <span className="font-medium text-paper-800 dark:text-ink-100">{new Date(tx.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-1 border-t border-paper-100 dark:border-ink-850/85 pt-3">
            <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Transaction Block ID (TXID)</span>
            <div className="flex gap-2 items-center bg-paper-50 dark:bg-ink-950 px-3 py-1.5 rounded-lg border border-paper-250 dark:border-ink-800">
              <span className="font-mono text-paper-700 dark:text-ink-400 break-all select-all flex-1 text-[10.5px]">{tx.id}</span>
              <button 
                onClick={handleCopy}
                className="p-1 text-paper-400 hover:text-paper-900 dark:text-ink-500 dark:hover:text-white shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Previous Block Hash (Parent)</span>
            <span className="font-mono text-paper-450 dark:text-ink-450 break-all select-all block py-1 bg-paper-50/50 dark:bg-ink-950/20 px-2 rounded">{tx.previousTxid || 'GENESIS_ROOT'}</span>
          </div>

          {tx.description && (
            <div className="space-y-0.5 border-t border-paper-100 dark:border-ink-850 pt-3">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Description Metadata</span>
              <span className="font-semibold text-paper-750 dark:text-ink-200">{tx.description}</span>
            </div>
          )}

          {/* Action Footer */}
          {onReverse && !isGenesis && (
            <div className="pt-4 border-t border-paper-100 dark:border-ink-850 flex justify-between items-center gap-3">
              <div className="text-[10px] text-paper-400 dark:text-ink-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Reversing appends a counterbalance block.</span>
              </div>
              <button
                onClick={handleReverse}
                disabled={isReversing}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all"
              >
                {isReversing ? 'Reversing...' : 'Reverse Block'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
