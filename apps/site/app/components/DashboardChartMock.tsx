import React from 'react';

export default function DashboardChartMock() {
  return (
    <div className="md:col-span-2 bg-dark-800 rounded-xl p-5 border border-white/5 flex flex-col justify-between relative">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-white text-sm">Rent Yield Summary</h4>
        <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-1">
          <button className="px-3 py-1 text-xs text-paper-300 rounded-md hover:bg-dark-600 transition-colors">Monthly</button>
          <button className="px-3 py-1 text-xs bg-dark-600 text-white rounded-md shadow">Yearly</button>
        </div>
      </div>

      <div className="relative h-44 w-full mt-4">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <line x1="0" y1="10" x2="100" y2="10" stroke="#16181f" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="#16181f" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#16181f" strokeWidth="0.3" strokeDasharray="1 1" />
          
          <path d="M0,40 L0,25 C10,15 15,30 25,20 C35,10 40,25 50,15 C60,5 65,20 75,10 C85,0 90,15 100,5 L100,40 Z" fill="url(#gradIncome)" opacity="0.15" />
          
          <path d="M0,25 C10,15 15,30 25,20 C35,10 40,25 50,15 C60,5 65,20 75,10 C85,0 90,15 100,5" fill="none" stroke="#E95D2A" strokeWidth="1" />
          <path d="M0,35 C15,30 20,38 35,32 C50,26 55,35 70,28 C85,21 90,30 100,25" fill="none" stroke="#d5d0c5" strokeWidth="0.5" strokeDasharray="1 1" />

          <defs>
            <linearGradient id="gradIncome" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E95D2A" stopOpacity="1" />
              <stop offset="100%" stopColor="#E95D2A" stopOpacity="0" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="15" r="1.2" fill="#E95D2A" stroke="#0b0c0f" strokeWidth="0.5" />
        </svg>

        <div className="absolute top-[8%] left-[45%] bg-dark-700 border border-white/10 rounded px-2.5 py-1.5 shadow-lg flex flex-col gap-1 -translate-x-1/2 -translate-y-full pointer-events-none">
          <span className="text-[8px] text-paper-300 whitespace-nowrap">Current Yield</span>
          <div className="flex items-center gap-1.5 text-[10px] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Collected: <span className="font-semibold">€24,450</span>
          </div>
        </div>
      </div>
    </div>
  );
}
