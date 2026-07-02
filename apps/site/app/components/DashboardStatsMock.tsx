import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardStatsMock() {
  const stats = [
    { title: 'Total Portfolio Value', value: '€2.4M', diff: '+12.5%', isUp: true },
    { title: 'Monthly Rental Income', value: '€32,450', diff: '+8.2%', isUp: true },
    { title: 'Total Collected YTD', value: '€155,890', diff: '+5.4%', isUp: true },
    { title: 'Outstanding Arrears', value: '€1,560', diff: '-2.1%', isUp: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-dark-800 rounded-xl p-4 border border-white/5 relative overflow-hidden">
          <p className="text-paper-300 text-xs mb-2">{stat.title}</p>
          <h4 className="text-xl font-bold mb-2 text-white">{stat.value}</h4>
          <div className="flex items-center gap-1 text-[10px]">
            <span className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
              stat.isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
            }`}>
              {stat.isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />} {stat.diff}
            </span>
            <span className="text-paper-300">VS last month</span>
          </div>
          {!stat.isUp && (
            <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary/30"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
