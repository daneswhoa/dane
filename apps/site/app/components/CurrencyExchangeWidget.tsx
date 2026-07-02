import React from 'react';
import { ArrowDownUp } from 'lucide-react';

export default function CurrencyExchangeWidget() {
  return (
    <div className="glass-card rounded-3xl p-6 border border-white/10 w-full max-w-sm mx-auto relative z-10 shadow-2xl">
      <h3 className="font-semibold text-white text-lg mb-6">Split Payments</h3>
      
      <div className="space-y-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-paper-300 mb-2">Primary Rent Balance</p>
          <div className="flex justify-between items-center">
            <input type="text" value="€1,200.00" className="bg-transparent border-none outline-none text-xl font-medium w-1/2 text-white" disabled />
            <button className="flex items-center gap-1 bg-dark-700 hover:bg-dark-600 transition-colors px-3 py-1.5 rounded-lg border border-white/5 text-xs text-white">
              EUR
            </button>
          </div>
        </div>

        <div className="relative h-4 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-white/5"></div>
          <div className="w-8 h-8 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-paper-300 text-xs relative z-10 hover:text-white cursor-pointer transition-all">
            <ArrowDownUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-paper-300 mb-2">Payout Split (Owner Wallet)</p>
          <div className="flex justify-between items-center">
            <input type="text" value="€1,000.00" className="bg-transparent border-none outline-none text-xl font-medium w-1/2 text-white" disabled />
            <button className="flex items-center gap-1 bg-dark-700 hover:bg-dark-600 transition-colors px-3 py-1.5 rounded-lg border border-white/5 text-xs text-white">
              EUR
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs px-2 py-2">
          <span className="text-paper-300">Transaction Fee</span>
          <span className="font-medium text-white">€0.00</span>
        </div>
        
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3.5 rounded-xl transition-colors mt-2 shadow-lg shadow-primary/25">
          Withdraw Funds
        </button>
      </div>
    </div>
  );
}
