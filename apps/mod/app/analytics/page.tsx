'use client';

import React from 'react';
import ModLayout from '../components/ModLayout';
import { 
  BarChart3, TrendingUp, Landmark, Globe, MapPin, CheckCircle, ArrowUpRight
} from 'lucide-react';

const COUNTY_DISTRIBUTION = [
  { county: 'Nairobi', share: '45%', properties: 42, color: 'bg-coral-500' },
  { county: 'Kiambu', share: '20%', properties: 18, color: 'bg-purple-500' },
  { county: 'Mombasa', share: '15%', properties: 14, color: 'bg-blue-500' },
  { county: 'Machakos', share: '10%', properties: 10, color: 'bg-amber-500' },
  { county: 'Nakuru', share: '10%', properties: 8, color: 'bg-emerald-500' }
];

export default function AnalyticsPage() {
  return (
    <ModLayout title="Platform Analytics">
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        
        {/* Top metrics summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">Total Platform GMV</span>
            <span className="text-lg font-black text-paper-900 dark:text-white block mt-1 font-mono">KES 2,475,000</span>
            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +12.4% MoM growth
            </span>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">Average Occupancy</span>
            <span className="text-lg font-black text-coral-500 block mt-1 font-mono">92%</span>
            <span className="text-[9px] text-paper-400 dark:text-ink-500 block mt-1">Across 102 units in registry</span>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">Active Syndications</span>
            <span className="text-lg font-black text-purple-500 block mt-1 font-mono">84%</span>
            <span className="text-[9px] text-paper-400 dark:text-ink-500 block mt-1">Portals online syndication rate</span>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">Audit Clearance Index</span>
            <span className="text-lg font-black text-emerald-500 block mt-1 font-mono">98.2%</span>
            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
              <CheckCircle className="w-3 h-3" /> Under policy limits
            </span>
          </div>
        </div>

        {/* Region & Properties Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regional shares */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm trans-theme space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coral-500" /> County Registry Shares
            </h3>
            
            <div className="space-y-3.5">
              {COUNTY_DISTRIBUTION.map(item => (
                <div key={item.county} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-paper-900 dark:text-white">
                    <span>{item.county} County</span>
                    <span className="font-mono text-paper-500 dark:text-ink-400">{item.properties} Properties ({item.share})</span>
                  </div>
                  <div className="w-full bg-paper-100 dark:bg-ink-950 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: item.share }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm trans-theme flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-purple-500" /> Revenue Stream Channels
              </h3>
              <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">Distribution of payments processed via integrated ecosystem services.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-paper-50 dark:bg-ink-950 rounded-xl border border-paper-200/50 dark:border-ink-850 flex justify-between items-center">
                <span className="font-bold text-paper-850 dark:text-white">Mobile Payments (M-PESA)</span>
                <span className="font-mono text-coral-500 font-bold">82%</span>
              </div>
              <div className="p-3 bg-paper-50 dark:bg-ink-950 rounded-xl border border-paper-200/50 dark:border-ink-850 flex justify-between items-center">
                <span className="font-bold text-paper-850 dark:text-white">Credit Card (Stripe)</span>
                <span className="font-mono text-purple-500 font-bold">12%</span>
              </div>
              <div className="p-3 bg-paper-50 dark:bg-ink-950 rounded-xl border border-paper-200/50 dark:border-ink-850 flex justify-between items-center">
                <span className="font-bold text-paper-850 dark:text-white">Direct Ledger Credits</span>
                <span className="font-mono text-blue-500 font-bold">6%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ModLayout>
  );
}
