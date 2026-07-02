import React from 'react';
import { Sparkles, Users, UserCheck, CreditCard } from 'lucide-react';

export default function ConnectionMockup() {
  const portalItems = [
    { title: 'Tenant Portal', desc: 'Secure billing & lease management.', icon: Users, color: 'text-coral border-coral/30' },
    { title: 'Sophia Agent', desc: 'Autonomous dispatch assistant.', icon: Sparkles, color: 'text-primary border-primary/50 shadow-[0_0_20px_rgba(233,93,42,0.3)] bg-primary/10', isActive: true },
    { title: 'Contractors', desc: 'Pre-screened marketplace network.', icon: UserCheck, color: 'text-blue-400 border-blue-400/30' },
    { title: 'Payouts', desc: 'Stripe splitting and YTD charts.', icon: CreditCard, color: 'text-emerald-400 border-emerald-400/30' },
  ];

  return (
    <section className="py-32 px-6 relative overflow-hidden scroll-trigger" id="solutions">
      <div className="absolute left-[10%] bottom-[10%] w-[800px] h-[500px] blur-blob blob-primary opacity-30 mix-blend-screen parallax-bg" data-speed="0.2"></div>
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight reveal-up">Connected to<br />everything. Dependent<br />on nothing.</h2>
          <p className="text-paper-300 text-sm max-w-md mb-8 reveal-up delay-100">Sophia AI pulls context from maintenance logs and updates ledgers directly. Payout splits are dispatched automatically — no manual reconciliation.</p>
          <div className="flex gap-4 mb-12 reveal-up delay-200">
            <a href="/register" className="bg-white text-dark-900 px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-paper-100 transition-all hover:scale-105 active:scale-95">Get Started</a>
          </div>
        </div>

        <div className="flex-1 w-full reveal-scale delay-300">
          <div className="glass-panel p-6 rounded-2xl relative shadow-2xl border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl animate-pulse">
            <div className="grid grid-cols-2 gap-4 relative">
              {portalItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className={`rounded-xl p-4 flex flex-col justify-between h-32 border transition-all cursor-default select-none ${item.color} ${item.isActive ? 'transform scale-105' : 'bg-white/5 opacity-70 hover:opacity-100 hover:bg-white/10'}`}>
                    <Icon className="w-6 h-6 shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                      <p className="text-[9px] text-paper-300 mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
