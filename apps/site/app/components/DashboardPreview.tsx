import React from 'react';
import { Layers, Search, Bell } from 'lucide-react';
import DashboardSidebarMock from './DashboardSidebarMock';
import DashboardStatsMock from './DashboardStatsMock';
import DashboardChartMock from './DashboardChartMock';
import DashboardCardMock from './DashboardCardMock';

export default function DashboardPreview() {
  return (
    <section className="max-w-6xl mx-auto px-6 relative -mt-16 mb-32 z-20">
      <div className="glass-panel rounded-2xl p-4 md:p-6 w-full relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/dane_logomark.png" alt="Dane Properties Logo" className="w-6 h-6 object-contain" />
              <span className="font-semibold text-sm text-white">Dane Properties</span>
            </div>
            <span className="text-paper-300 text-xs hidden sm:inline">&gt; Overview</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-dark-800 rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/5 hidden md:flex">
              <Search className="w-3.5 h-3.5 text-paper-300" />
              <input type="text" placeholder="Search portfolio..." className="bg-transparent border-none outline-none text-xs text-white w-32 placeholder-paper-300" disabled />
            </div>
            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center border border-white/5">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2 bg-dark-800 rounded-full pl-1 pr-3 py-1 border border-white/5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-white font-bold">JD</div>
              <div className="text-[10px] text-left">
                <p className="font-medium text-white leading-none">Sophia</p>
                <p className="text-paper-300 text-[8px] leading-none mt-0.5">Manager</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebarMock />
          <div className="flex-1 flex flex-col gap-6">
            <DashboardStatsMock />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardChartMock />
              <DashboardCardMock />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
