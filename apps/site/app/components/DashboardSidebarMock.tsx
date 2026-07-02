import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Building,
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  CreditCard,
  Wrench,
  HardHat,
  MessageSquare,
  Megaphone,
  Send,
  Cpu,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Building2,
  ChevronDown
} from 'lucide-react';

export default function DashboardSidebarMock() {
  return (
    <div className="w-52 hidden lg:flex flex-col gap-0.5 pr-2 border-r border-white/5 max-h-[480px] overflow-y-auto scrollbar-thin">
      {/* Primary Section */}
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded text-primary text-xs font-semibold">
        <LayoutDashboard className="w-3.5 h-3.5" /> Overview
      </a>
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-primary" /> Sophia AI
      </a>
      
      {/* Core Section */}
      <div className="text-[9px] text-paper-300 font-bold uppercase tracking-wider mt-3 mb-1 px-2.5">Core</div>
      <a href="#" className="flex items-center justify-between px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <div className="flex items-center gap-2">
          <Building className="w-3.5 h-3.5" /> Properties
        </div>
        <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.5 rounded leading-none text-paper-300">4</span>
      </a>
      <a href="#" className="flex items-center justify-between px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> Tenants
        </div>
        <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.5 rounded leading-none text-paper-300">12</span>
      </a>

      {/* Finance Section */}
      <div className="flex flex-col gap-0.5 mt-1">
        <div className="flex items-center justify-between px-2.5 py-1 text-white text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-primary" /> Finance
          </div>
          <ChevronDown className="w-3 h-3 text-paper-300" />
        </div>
        <div className="flex flex-col gap-0.5 pl-3 border-l border-white/5 ml-4">
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <TrendingUp className="w-3 h-3" /> Payments & Expenses
          </a>
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <Receipt className="w-3 h-3" /> Invoices
          </a>
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <CreditCard className="w-3 h-3" /> Wallet
          </a>
        </div>
      </div>

      {/* Operations Section */}
      <div className="text-[9px] text-paper-300 font-bold uppercase tracking-wider mt-3 mb-1 px-2.5">Operations</div>
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <Wrench className="w-3.5 h-3.5" /> Maintenance
      </a>
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <HardHat className="w-3.5 h-3.5" /> Contractors
      </a>

      {/* Communication Section */}
      <div className="flex flex-col gap-0.5 mt-1">
        <div className="flex items-center justify-between px-2.5 py-1 text-white text-xs font-semibold">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-primary" /> Communication
          </div>
          <ChevronDown className="w-3 h-3 text-paper-300" />
        </div>
        <div className="flex flex-col gap-0.5 pl-3 border-l border-white/5 ml-4">
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <Megaphone className="w-3 h-3" /> Announcements
          </a>
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <Send className="w-3 h-3" /> Email Broadcasts
          </a>
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <Cpu className="w-3 h-3" /> Automations
          </a>
          <a href="#" className="flex items-center gap-2 px-2 py-0.5 text-paper-300 hover:text-white text-[11px] transition-colors">
            <ClipboardList className="w-3 h-3" /> Templates
          </a>
        </div>
      </div>

      {/* Administration Section */}
      <div className="text-[9px] text-paper-300 font-bold uppercase tracking-wider mt-3 mb-1 px-2.5">Administration</div>
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <BarChart3 className="w-3.5 h-3.5" /> Analytics
      </a>
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <ShieldCheck className="w-3.5 h-3.5" /> Security & Audit
      </a>
      <a href="#" className="flex items-center gap-2 px-2.5 py-1 text-paper-300 hover:text-white text-xs font-medium transition-colors">
        <Building2 className="w-3.5 h-3.5" /> Team
      </a>
    </div>
  );
}
