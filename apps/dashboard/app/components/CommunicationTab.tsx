'use client';

import React, { useState } from 'react';
import { Megaphone, MessageSquare, History, Plus, Users, Search, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { ComposeBroadcastModal } from './communication/ComposeBroadcastModal';

export default function CommunicationTab() {
  const [activeSubTab, setActiveSubTab] = useState<'broadcasts' | 'templates'>('broadcasts');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-paper-900 dark:text-white tracking-tight">Communication</h1>
          <p className="text-paper-500 dark:text-ink-400 mt-1">Send broadcasts and manage messaging templates across your portfolio.</p>
        </div>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-coral-500/20"
        >
          <Plus className="w-4 h-4" /> Compose Broadcast
        </button>
      </div>

      <div className="flex border-b border-paper-200 dark:border-ink-800">
        <button
          onClick={() => setActiveSubTab('broadcasts')}
          className={`px-5 py-3 text-sm font-semibold transition-colors relative ${activeSubTab === 'broadcasts' ? 'text-coral-500' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><Megaphone className="w-4 h-4" /> Broadcast History</div>
          {activeSubTab === 'broadcasts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral-500 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`px-5 py-3 text-sm font-semibold transition-colors relative ${activeSubTab === 'templates' ? 'text-coral-500' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Templates</div>
          {activeSubTab === 'templates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral-500 rounded-t-full" />}
        </button>
      </div>

      {activeSubTab === 'broadcasts' && (
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-paper-500 dark:text-ink-400" /> Recent Broadcasts
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search broadcasts..." className="w-56 pl-8 pr-3 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors" />
            </div>
          </div>
          
          <div className="divide-y divide-paper-100 dark:divide-ink-800/50">
            {/* Empty State / Mock Data */}
            <div className="p-5 flex items-center justify-between hover:bg-paper-50 dark:hover:bg-ink-800/30 transition-colors cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-paper-900 dark:text-white">Q3 Water Shutoff Notice</h4>
                    <span className="px-2 py-0.5 rounded-full bg-paper-100 dark:bg-ink-800 text-[10px] font-medium text-paper-600 dark:text-ink-300 border border-paper-200 dark:border-ink-700">Specific Property: Westview</span>
                  </div>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1 line-clamp-1 max-w-xl">
                    Dear residents, please be advised that water will be shut off for 2 hours on Thursday...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-medium text-paper-500 dark:text-ink-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 42 Recipients</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Sent yesterday at 10:00 AM</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-paper-300 dark:text-ink-600 group-hover:text-coral-500 transition-colors" />
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'templates' && (
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-8 text-center text-paper-500 dark:text-ink-400">
          Templates feature coming soon.
        </div>
      )}

      {isComposeOpen && (
        <ComposeBroadcastModal onClose={() => setIsComposeOpen(false)} />
      )}
    </div>
  );
}
