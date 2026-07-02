import React from 'react';

export default function FlagWidgetMock() {
  const items = [
    { country: 'United States', flag: '🇺🇸', label: 'INV-384', code: 'USD', value: '$1,500' },
    { country: 'France', flag: '🇫🇷', label: 'INV-385', code: 'EUR', value: '€1,200', tagColor: 'text-blue-400 bg-blue-400/10' },
    { country: 'United Kingdom', flag: '🇬🇧', label: 'INV-386', code: 'GBP', value: '£900', tagColor: 'text-orange-400 bg-orange-400/10', customTag: 'Pending' },
    { country: 'Canada', flag: '🇨🇦', label: 'INV-387', code: 'CAD', value: '$1,050', tagColor: 'text-emerald-500 bg-emerald-500/10', customTag: 'Completed' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 w-full max-w-sm relative z-10 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-dark-800 rounded-full pl-2.5 pr-3 py-1 border border-white/5">
          <span className="text-xs font-semibold text-white">Latest Transactions</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between text-[10px] text-paper-300">
              <span>{item.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${item.tagColor || 'text-yellow-500 bg-yellow-500/10'}`}>
                {item.customTag || item.code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xl select-none">{item.flag}</span>
                <span className="font-semibold text-sm text-white">{item.country}</span>
              </div>
              <span className="font-semibold text-sm text-white">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
