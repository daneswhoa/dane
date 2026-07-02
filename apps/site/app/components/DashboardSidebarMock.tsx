import React from 'react';
import { PieChart, ArrowLeftRight, Wallet, TrendingUp, Target, User } from 'lucide-react';

export default function DashboardSidebarMock() {
  return (
    <div className="w-48 hidden lg:flex flex-col gap-1 pr-4">
      <div className="text-[10px] text-paper-300 font-semibold tracking-wider mb-2 px-3">GENERAL</div>
      <a href="#" className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-primary text-sm font-medium">
        <PieChart className="w-4 h-4" /> Dashboard
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-paper-300 hover:text-white text-sm font-medium transition-colors">
        <ArrowLeftRight className="w-4 h-4" /> Leases
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-paper-300 hover:text-white text-sm font-medium transition-colors">
        <Wallet className="w-4 h-4" /> Invoices
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-paper-300 hover:text-white text-sm font-medium transition-colors">
        <TrendingUp className="w-4 h-4" /> Analytics
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-paper-300 hover:text-white text-sm font-medium transition-colors">
        <Target className="w-4 h-4" /> Dispatch
      </a>
      
      <div className="text-[10px] text-paper-300 font-semibold tracking-wider mt-6 mb-2 px-3">ADMIN</div>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-paper-300 hover:text-white text-sm font-medium transition-colors">
        <User className="w-4 h-4" /> Team members
      </a>
    </div>
  );
}
