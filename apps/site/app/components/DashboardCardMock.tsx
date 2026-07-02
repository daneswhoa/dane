import React from 'react';
import { Plus } from 'lucide-react';

export default function DashboardCardMock() {
  return (
    <div className="bg-dark-800 rounded-xl p-5 border border-white/5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-white text-sm">Wallets</h4>
        <button className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-1 rounded">
          <Plus className="w-3 h-3" /> Connect Account
        </button>
      </div>

      <div className="w-full h-36 rounded-xl bg-gradient-to-br from-dark-600 to-dark-800 p-4 relative overflow-hidden border border-white/10 flex flex-col justify-between">
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute right-4 bottom-[-10px] w-16 h-16 rounded-full bg-primary/10 pointer-events-none"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="font-bold italic text-white text-lg tracking-wider">SECURE</div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
          </div>
        </div>

        <div className="relative z-10 mt-4">
          <p className="text-[10px] text-white/70 font-mono tracking-widest mb-1">**** **** **** 4812</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] text-white/40 mb-0.5">Account Owner</p>
              <p className="text-xs text-white font-medium">Sophia Admin</p>
            </div>
            <div>
              <p className="text-[8px] text-white/40 mb-0.5">Status</p>
              <p className="text-xs text-emerald-400 font-medium">Active</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-coral"></div>
      </div>

      <div className="mt-4 flex justify-between items-center px-1">
        <div className="text-xs text-paper-300">Total Payout Account</div>
        <div className="text-sm font-bold text-white">€86,248.00</div>
      </div>
    </div>
  );
}
