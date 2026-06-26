'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Home, SearchX, Wallet, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coral-500/10 via-ink-950 to-ink-950 pointer-events-none opacity-50"></div>
      
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
        {/* Abstract 404 Icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-32 h-32 bg-coral-500/10 rounded-full animate-ping"></div>
          <div className="absolute w-24 h-24 border border-coral-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="relative z-10 w-16 h-16 bg-ink-900 border border-ink-800 rounded-2xl flex items-center justify-center shadow-xl shadow-coral-500/10">
            <SearchX className="w-8 h-8 text-coral-500" />
          </div>
        </div>

        <h1 className="text-6xl font-black text-white tracking-tight mb-4">404</h1>
        <h2 className="text-xl font-bold text-ink-200 mb-3">Sector Not Found</h2>
        <p className="text-sm text-ink-400 max-w-md mx-auto mb-10 leading-relaxed">
          The dashboard module or property record you are looking for has been moved, deleted, or does not exist. 
        </p>

        {/* Quick Recovery Options */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-left">
          <Link href="/properties" className="flex items-start gap-3 p-4 bg-ink-900/50 hover:bg-ink-800 border border-ink-800 hover:border-ink-700 rounded-xl transition-all group">
            <div className="w-8 h-8 rounded-lg bg-coral-500/10 flex items-center justify-center text-coral-500 group-hover:bg-coral-500 group-hover:text-white transition-colors shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Properties</h3>
              <p className="text-xs text-ink-400">View your portfolio</p>
            </div>
          </Link>

          <Link href="/finance/expenses" className="flex items-start gap-3 p-4 bg-ink-900/50 hover:bg-ink-800 border border-ink-800 hover:border-ink-700 rounded-xl transition-all group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Financial Ledger</h3>
              <p className="text-xs text-ink-400">Review expenses & income</p>
            </div>
          </Link>

          <Link href="/sophia" className="flex items-start gap-3 p-4 bg-ink-900/50 hover:bg-ink-800 border border-ink-800 hover:border-ink-700 rounded-xl transition-all group">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/><path d="M9 13h.01"/><path d="M15 13h.01"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Sophia AI</h3>
              <p className="text-xs text-ink-400">Ask your assistant</p>
            </div>
          </Link>

          <Link href="/settings" className="flex items-start gap-3 p-4 bg-ink-900/50 hover:bg-ink-800 border border-ink-800 hover:border-ink-700 rounded-xl transition-all group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Settings</h3>
              <p className="text-xs text-ink-400">System configuration</p>
            </div>
          </Link>
        </div>

        {/* Global Back Action */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to previous page
        </button>
      </div>
    </div>
  );
}
