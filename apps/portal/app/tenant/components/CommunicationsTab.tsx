import React from 'react';
import { 
  Search, 
  Wrench, 
  CreditCard, 
  Building, 
  Phone, 
  MoreVertical, 
  BellRing, 
  ArrowRight, 
  CheckCheck, 
  Paperclip, 
  Smile, 
  Send, 
  Lock 
} from 'lucide-react';
import { TenantProfile } from '../types';

interface CommunicationsTabProps {
  profile: TenantProfile | null;
}

export default function CommunicationsTab({ profile }: CommunicationsTabProps) {
  return (
    <div className="p-4 md:p-6 w-full h-[calc(100vh-3rem)] max-w-7xl mx-auto flex flex-col pb-4 animate-fade-in">
      <div className="flex-1 flex gap-6 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-coral-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

        {/* LEFT PANE: Inbox List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white/50 dark:bg-ink-950/50 backdrop-blur-xl border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden z-10 trans-theme">
          
          <div className="p-4 border-b border-paper-200 dark:border-ink-800 flex items-center gap-2">
            <button className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-500/20 trans-subtle">
              Direct (2)
            </button>
            <button className="flex-1 py-1.5 text-xs font-medium rounded-lg text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-900 border border-transparent trans-subtle">
              Broadcasts
            </button>
          </div>

          <div className="p-3">
            <div className="relative">
              <Search className="w-4 h-4 text-paper-400 dark:text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-3 py-2 bg-paper-100 dark:bg-ink-900 border border-transparent focus:border-coral-500/50 rounded-xl text-xs text-paper-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-coral-500/50 trans-theme placeholder-paper-500 dark:placeholder-ink-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Active Thread */}
            <div className="p-3 rounded-xl bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 shadow-sm cursor-pointer trans-subtle relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral-500"></div>
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img src="https://placehold.co/40x40/1e2129/ffffff?text=PM" className="w-10 h-10 rounded-full border border-paper-200 dark:border-ink-700 object-cover" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-ink-800 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-paper-900 dark:text-white truncate">Jane Doe</h4>
                    <span className="text-[10px] font-medium text-coral-600 dark:text-coral-400">10:42 AM</span>
                  </div>
                  <p className="text-[11px] font-medium text-paper-900 dark:text-white truncate mt-0.5">Will I need to be home?</p>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 uppercase tracking-wider font-semibold">Property Management</p>
                </div>
              </div>
            </div>

            {/* Unread Thread */}
            <div className="p-3 rounded-xl hover:bg-paper-100 dark:hover:bg-ink-900 border border-transparent cursor-pointer trans-subtle">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-paper-900 dark:text-white truncate">Maintenance Team</h4>
                    <span className="text-[10px] text-paper-500 dark:text-ink-500">Yesterday</span>
                  </div>
                  <p className="text-[11px] font-medium text-paper-900 dark:text-white truncate mt-0.5">Ticket #4092 has been scheduled...</p>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 uppercase tracking-wider font-semibold">Support</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-coral-500 mt-1.5 shadow-[0_0_6px_rgba(255,107,107,0.6)]"></div>
              </div>
            </div>

            {/* Read Thread */}
            <div className="p-3 rounded-xl hover:bg-paper-100 dark:hover:bg-ink-900 border border-transparent cursor-pointer trans-subtle opacity-70 hover:opacity-100">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-paper-900 dark:text-white truncate">Billing Dept</h4>
                    <span className="text-[10px] text-paper-500 dark:text-ink-500">Oct 12</span>
                  </div>
                  <p className="text-[11px] text-paper-600 dark:text-ink-300 truncate mt-0.5">Your receipt for Oct is ready.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANE: Chat View */}
        <div className="hidden md:flex flex-1 flex-col bg-white/60 dark:bg-ink-900/60 backdrop-blur-xl border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden z-10 trans-theme">
          
          <div className="h-16 px-6 border-b border-paper-200 dark:border-ink-800 flex items-center justify-between bg-white/50 dark:bg-ink-950/50 trans-theme">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src="https://placehold.co/40x40/1e2129/ffffff?text=PM" className="w-10 h-10 rounded-full border border-paper-200 dark:border-ink-700 object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-ink-950 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-paper-900 dark:text-white">Jane Doe</h3>
                <p className="text-[11px] text-paper-500 dark:text-ink-400 flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-coral-500" /> Property Manager
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-paper-500 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 hover:text-paper-900 dark:hover:text-white trans-subtle">
                <Phone className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-paper-500 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 hover:text-paper-900 dark:hover:text-white trans-subtle">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 bg-paper-100 dark:bg-ink-800 rounded-full text-[10px] font-semibold uppercase tracking-wider text-paper-500 dark:text-ink-400 border border-paper-200 dark:border-ink-700">Today</span>
            </div>

            <div className="flex gap-3 max-w-[80%]">
              <img src="https://placehold.co/32x32/1e2129/ffffff?text=PM" className="w-8 h-8 rounded-full border border-paper-200 dark:border-ink-700 mt-1" />
              <div className="flex flex-col gap-1 items-start">
                <div className="px-4 py-2.5 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl rounded-tl-sm text-sm text-paper-900 dark:text-ink-50 shadow-sm">
                  Hi {profile?.name?.split(' ')[0] || 'Sarah'}, just a quick reminder that we will be doing annual fire alarm testing tomorrow between 10 AM and 2 PM.
                </div>
                <span className="text-[10px] text-paper-400 dark:text-ink-500 ml-1">10:15 AM</span>
              </div>
            </div>

            <div className="flex gap-3 max-w-[80%]">
              <img src="https://placehold.co/32x32/1e2129/ffffff?text=PM" className="w-8 h-8 rounded-full border border-paper-200 dark:border-ink-700 mt-1" />
              <div className="flex flex-col gap-1 items-start w-full">
                <div className="p-4 bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700/50 rounded-2xl rounded-tl-sm text-sm text-white shadow-lg w-full relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-coral-500/20 blur-2xl rounded-full"></div>
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <div className="p-1.5 rounded-lg bg-coral-500 text-white shadow-sm">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm tracking-tight">Building Notice</h4>
                  </div>
                  <p className="text-ink-200 text-xs leading-relaxed relative z-10 mb-3">
                    Please ensure all pets are secured during the testing window. The alarms will sound intermittently.
                  </p>
                  <button className="text-xs font-semibold text-coral-400 hover:text-coral-300 flex items-center gap-1 trans-subtle relative z-10">
                    View Full Schedule <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] text-paper-400 dark:text-ink-500 ml-1">10:15 AM</span>
              </div>
            </div>

            <div className="flex gap-3 max-w-[80%] ml-auto justify-end">
              <div className="flex flex-col gap-1 items-end">
                <div className="px-4 py-2.5 bg-gradient-to-br from-coral-500 to-coral-600 border border-coral-400/50 rounded-2xl rounded-tr-sm text-sm text-white shadow-[0_4px_12px_rgba(255,107,107,0.2)]">
                  Thanks for the heads up! Will I need to be home?
                </div>
                <span className="text-[10px] text-paper-400 dark:text-ink-500 mr-1 flex items-center gap-1">
                  10:42 AM <CheckCheck className="w-3 h-3 text-coral-500" />
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 max-w-[80%]">
              <img src="https://placehold.co/32x32/1e2129/ffffff?text=PM" className="w-8 h-8 rounded-full border border-paper-200 dark:border-ink-700 mt-1 opacity-70" />
              <div className="px-4 py-3 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-paper-400 dark:bg-ink-500 animate-bounce" style={{animationDelay: '0s'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-paper-400 dark:bg-ink-500 animate-bounce" style={{animationDelay: '0.15s'}}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-paper-400 dark:bg-ink-500 animate-bounce" style={{animationDelay: '0.3s'}}></span>
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-paper-200 dark:border-ink-800 bg-white/50 dark:bg-ink-950/50 trans-theme">
            <div className="relative flex items-end gap-2 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-2xl p-1.5 pr-2 shadow-sm focus-within:border-coral-500/50 focus-within:ring-1 focus-within:ring-coral-500/50 trans-subtle">
              
              <button className="p-2 text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white rounded-xl hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>
              
              <textarea rows={1} placeholder="Type a message..." className="w-full bg-transparent border-none focus:outline-none text-sm text-paper-900 dark:text-white py-2 resize-none placeholder-paper-400 dark:placeholder-ink-500 max-h-32" style={{minHeight: '40px'}}></textarea>
              
              <button className="p-2 text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white rounded-xl hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle flex-shrink-0 mb-0.5">
                <Smile className="w-4 h-4" />
              </button>
              
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-coral-500 hover:bg-coral-600 text-white flex-shrink-0 mb-0.5 shadow-sm shadow-coral-500/30 trans-subtle active:scale-95">
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-paper-400 dark:text-ink-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> End-to-end encrypted communication
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
