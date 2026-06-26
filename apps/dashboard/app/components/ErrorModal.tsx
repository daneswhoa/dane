'use client';

import React from 'react';
import { X, AlertTriangle, Terminal, Layers } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  callStack?: string;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title = 'Something went wrong',
  message,
  callStack,
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="bg-white dark:bg-ink-900 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden border border-red-200 dark:border-red-500/25 animate-scale-up trans-theme">
        
        {/* Brand Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-650/10 to-transparent dark:from-red-950/20 border-b border-paper-100 dark:border-ink-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo */}
            <div className="flex items-center gap-1.5 font-bold text-paper-900 dark:text-white">
              <span className="text-coral-500">Landlord</span>
              <span className="px-1.5 py-0.5 rounded bg-coral-500 text-white text-[10px] font-extrabold tracking-wider uppercase">NL</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-paper-300 dark:bg-ink-700"></div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-500 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Error Notice
            </span>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-paper-400 hover:text-paper-900 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-800 trans-subtle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Icon and Title */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-paper-900 dark:text-white tracking-tight leading-snug">
                {title}
              </h2>
              <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">
                We ran into an unexpected issue while processing this action. Below are the details to help resolve it:
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          <div className="p-4 rounded-xl bg-paper-50 dark:bg-ink-950 border border-paper-150 dark:border-ink-800 text-xs text-paper-700 dark:text-ink-300 font-medium">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-red-500 dark:text-red-400 mb-2">
              <Terminal className="w-3.5 h-3.5" /> Error details
            </div>
            <p className="font-mono text-red-650 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5 p-3 rounded-lg border border-red-100 dark:border-red-950/40 leading-relaxed select-all">
              {message}
            </p>
          </div>

          {/* Call Stack Diagnostics */}
          {callStack && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-paper-400 dark:text-ink-500 flex items-center gap-1.5 ml-1">
                <Layers className="w-3.5 h-3.5" /> Technical description
              </label>
              <pre className="text-[10px] font-mono text-paper-600 dark:text-ink-400 bg-paper-50 dark:bg-ink-950/50 p-4 rounded-xl border border-paper-150 dark:border-ink-800 max-h-40 overflow-y-auto leading-relaxed select-text">
                {callStack}
              </pre>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-paper-50 dark:bg-ink-950/40 border-t border-paper-100 dark:border-ink-800 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-paper-900 dark:bg-white text-white dark:text-paper-900 text-xs font-bold rounded-xl hover:bg-paper-800 dark:hover:bg-paper-100 active:scale-[0.98] trans-subtle shadow-sm shadow-paper-900/10"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
