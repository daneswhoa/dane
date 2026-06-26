import React from 'react';
import { X, Key } from 'lucide-react';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteCodeModal({ isOpen, onClose }: InviteCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-ink-900 w-full max-w-md rounded-2xl shadow-2xl relative z-10 flex flex-col p-6 border border-paper-200 dark:border-ink-700 animate-slide-up trans-theme">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center border border-coral-500/20">
               <Key className="w-5 h-5" />
             </div>
             <h2 className="text-lg font-bold text-paper-900 dark:text-white">Connect Property</h2>
          </div>
          <button onClick={onClose} className="p-2 text-paper-400 hover:bg-paper-100 dark:hover:bg-ink-800 rounded-lg trans-subtle">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <p className="text-sm text-paper-600 dark:text-ink-300 mb-6 leading-relaxed">
          You are currently not connected to an active property. Please enter the invite code provided by your property manager to unlock maintenance requests and rent payments.
        </p>
        <div className="mb-6">
          <label className="text-[10px] font-bold text-paper-700 dark:text-ink-400 uppercase tracking-widest mb-2 block">Invite Code</label>
          <input 
            type="text" 
            placeholder="e.g. LNL-SYNC-..." 
            className="w-full px-4 py-3 border border-paper-200 dark:border-ink-700 rounded-xl bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 font-mono trans-subtle placeholder-paper-400 dark:placeholder-ink-600" 
          />
        </div>
        <button onClick={onClose} className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-sm font-semibold shadow-sm active:scale-95 trans-subtle">
          Submit Code
        </button>
      </div>
    </div>
  )
}
