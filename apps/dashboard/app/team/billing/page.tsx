'use client';

import React from 'react';
import { CreditCard, Download, ExternalLink, ShieldCheck, ArrowUpRight, Zap, CheckCircle2, Activity } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column - Current Plan & Usage */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Plan Header Card */}
        <div className="bg-gradient-to-r from-ink-950 to-black dark:from-ink-900 dark:to-ink-950 rounded-xl p-6 relative overflow-hidden border border-ink-800 shadow-xl">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-semibold text-[10px] uppercase tracking-widest">Active Subscription</span>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-tight mb-1.5">Enterprise Multi-Family</h2>
              <p className="text-xs text-ink-300 font-medium max-w-sm leading-relaxed">
                You are currently on the annual enterprise tier. Your next billing date is <span className="text-white font-semibold">Jan 1, 2027</span> for <span className="text-white font-semibold">$4,999.00</span>.
              </p>
            </div>
            
            <div className="flex flex-col gap-2.5 min-w-[180px]">
              <button className="w-full px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Upgrade Capacity
              </button>
              <button className="w-full px-4 py-2.5 bg-ink-900/50 border border-ink-700 hover:bg-ink-800 text-ink-200 text-xs font-semibold rounded-lg transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Resource Limits Matrix */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 flex justify-between items-center bg-paper-50 dark:bg-ink-900/50">
            <div>
              <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-coral-500" /> Resource Utilization
              </h3>
              <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Real-time tracking of your allocated infrastructure limits.</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {/* Limit Item */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-semibold text-paper-900 dark:text-white mb-0.5">Managed Units</div>
                  <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest">Active Properties</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-paper-900 dark:text-white">142</span>
                  <span className="text-[11px] font-medium text-paper-400 dark:text-ink-500"> / 500</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-paper-100 dark:bg-ink-900 rounded-full overflow-hidden border border-paper-200 dark:border-ink-800">
                <div className="h-full bg-blue-500 w-[28.4%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              </div>
            </div>

            {/* Limit Item */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-semibold text-paper-900 dark:text-white mb-0.5">Asset Storage</div>
                  <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest">Documents & Media</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-paper-900 dark:text-white">45 GB</span>
                  <span className="text-[11px] font-medium text-paper-400 dark:text-ink-500"> / 100 GB</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-paper-100 dark:bg-ink-900 rounded-full overflow-hidden border border-paper-200 dark:border-ink-800">
                <div className="h-full bg-emerald-500 w-[45%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
            </div>

            {/* Limit Item */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-semibold text-paper-900 dark:text-white mb-0.5">Automations</div>
                  <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest">Monthly Executions</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-paper-900 dark:text-white">8,402</span>
                  <span className="text-[11px] font-medium text-paper-400 dark:text-ink-500"> / 10k</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-paper-100 dark:bg-ink-900 rounded-full overflow-hidden border border-paper-200 dark:border-ink-800">
                <div className="h-full bg-amber-500 w-[84%] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              </div>
            </div>

            {/* Limit Item */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-semibold text-paper-900 dark:text-white mb-0.5">SMS / Voice</div>
                  <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest">Outbound Credits</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-paper-900 dark:text-white">12.5k</span>
                  <span className="text-[11px] font-medium text-paper-400 dark:text-ink-500"> / 20k</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-paper-100 dark:bg-ink-900 rounded-full overflow-hidden border border-paper-200 dark:border-ink-800">
                <div className="h-full bg-coral-500 w-[62.5%] rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Payments & History */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Payment Methods */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 flex justify-between items-center bg-paper-50 dark:bg-ink-900/50">
            <div>
              <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Payment Source</h3>
            </div>
            <button className="text-[9px] font-medium text-coral-500 hover:text-coral-600 uppercase tracking-widest transition-colors">
              Add New
            </button>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-3">
            {/* Primary Card */}
            <div className="p-4 rounded-lg border border-coral-500 bg-coral-50/30 dark:bg-coral-500/10 relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-7 bg-black rounded border border-ink-800 flex items-center justify-center shadow-md">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div className="bg-coral-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">
                  Primary
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-[11px] font-medium text-paper-500 dark:text-ink-400 tracking-[0.15em] mb-1">•••• •••• •••• 4242</div>
                <div className="flex justify-between items-end">
                  <div className="text-xs font-semibold text-paper-900 dark:text-white">Mastercard</div>
                  <div className="text-[11px] font-medium text-paper-500 dark:text-ink-400">12/28</div>
                </div>
              </div>
            </div>

            {/* Secondary Bank */}
            <div className="p-3.5 rounded-lg border border-paper-200 dark:border-ink-700 hover:border-paper-300 dark:hover:border-ink-600 bg-paper-50 dark:bg-ink-900/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-white dark:bg-ink-950 rounded flex items-center justify-center border border-paper-200 dark:border-ink-700 shadow-sm">
                  <span className="font-bold text-paper-400 dark:text-ink-500 text-[9px] tracking-widest">ACH</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-paper-900 dark:text-white mb-0.5">Chase Bank</div>
                  <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest">Ending in 9911</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 flex justify-between items-center bg-paper-50 dark:bg-ink-900/50">
            <div>
              <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Billing History</h3>
            </div>
            <button className="text-[9px] font-medium text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y divide-paper-100 dark:divide-ink-700/50">
              {[
                { date: 'Jan 1, 2026', desc: 'Enterprise Annual', amount: '$4,999.00' },
                { date: 'Dec 1, 2025', desc: 'Overage: SMS', amount: '$150.00' },
                { date: 'Jan 1, 2025', desc: 'Enterprise Annual', amount: '$4,999.00' },
              ].map((inv, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors group cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-paper-900 dark:text-white mb-0.5">{inv.amount}</div>
                    <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest">{inv.desc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[9px] font-medium text-paper-400 dark:text-ink-500 uppercase tracking-widest text-right">{inv.date}</div>
                    <button className="w-6 h-6 rounded-md bg-paper-100 dark:bg-ink-700/50 flex items-center justify-center text-paper-500 dark:text-ink-400 group-hover:bg-coral-500 group-hover:text-white transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
