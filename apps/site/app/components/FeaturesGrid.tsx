import React from 'react';
import { Bot, FileText, BarChart, ChevronRight } from 'lucide-react';

export default function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="features">
      <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-64 hover:border-white/10 transition-colors group">
        <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-white border border-white/5 group-hover:bg-primary/20 transition-colors">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Sophia AI Assistant</h4>
          <p className="text-paper-300 text-sm mb-6">Autonomous dispatch, bookmarking, and automated tenant chat routing.</p>
          <a href="#" className="text-xs font-semibold text-white flex items-center gap-2 group-hover:text-primary transition-colors">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]"><ChevronRight className="w-3 h-3" /></span> Learn more
          </a>
        </div>
      </div>

      <div className="rounded-2xl p-6 flex flex-col justify-between h-64 relative overflow-hidden group border border-primary/30">
        <div className="absolute inset-0 bg-[url('/marketting/poster_sophia_autopilot.png')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-800/80 to-dark-900 pointer-events-none"></div>
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 relative z-10">
          <FileText className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <h4 className="text-lg font-semibold text-white mb-2">Smart Invoicing</h4>
          <p className="text-paper-300 text-sm mb-6">Arrears tracking, partial payments support, and auto-reminders.</p>
          <a href="#" className="text-xs font-semibold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]"><ChevronRight className="w-3 h-3" /></span> Learn more
          </a>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-64 hover:border-white/10 transition-colors group">
        <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-white border border-white/5 group-hover:bg-primary/20 transition-colors">
          <BarChart className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h4>
          <p className="text-paper-300 text-sm mb-6">Financial dashboards, YTD yields, and portfolio metrics.</p>
          <a href="#" className="text-xs font-semibold text-white flex items-center gap-2 group-hover:text-primary transition-colors">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]"><ChevronRight className="w-3 h-3" /></span> Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
