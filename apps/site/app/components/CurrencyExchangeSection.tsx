import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import CurrencyExchangeWidget from './CurrencyExchangeWidget';

export default function CurrencyExchangeSection() {
  const stats = [
    { value: '10K+', label: 'Active Leases' },
    { value: '4.9/5', label: 'App Rating' },
    { value: '24/7', label: 'Sophia AI Support' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center gap-16 border-t border-white/5">
      <div className="flex-1 w-full relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-dark-600/50 rounded-full blur-[60px] pointer-events-none"></div>
        <CurrencyExchangeWidget />
      </div>

      <div className="flex-1">
        <div className="badge mb-4">Smart Rent Splitting</div>
        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Take Control of Your <span className="font-serif italic font-normal text-paper-300">Rental Income</span></h2>
        <p className="text-paper-300 text-sm max-w-md mb-8 leading-relaxed">Automate payouts directly to owners, cover utility splits automatically, and retain maintenance budgets in isolated secure reserve accounts.</p>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-3xl font-bold mb-1 text-white">{stat.value}</h3>
              <p className="text-xs text-paper-300">{stat.label}</p>
            </div>
          ))}
        </div>

        <a href="https://app.danesproperties.com/register" className="inline-flex items-center gap-2 bg-white text-dark-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-paper-100 transition-all hover:scale-105">
          Explore Features <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
