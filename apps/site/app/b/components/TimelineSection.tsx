import React from 'react';

export default function TimelineSection() {
  const steps = [
    { num: 'Step 01', title: 'Feed it your properties', desc: 'Connect your listings, import tenant details, or sync with existing utility systems. Landlord integrates your entire workflow in minutes.' },
    { num: 'Step 02', title: 'Set up billing automation', desc: 'Set up security deposits, monthly rent, late fees, and auto-reminders. Enable partial payments dynamically depending on your rules.' },
    { num: 'Step 03', title: 'Activate Sophia AI', desc: 'Deploy Sophia as your 24/7 dispatcher. Tenants report maintenance issues via chat; Sophia automatically screens, registers, and books contractors.' },
    { num: 'Step 04', title: 'Sit back and yield returns', desc: 'Every rental transaction auto-reconciles in your ledger. Landlord keeps you compliant, organized, and informed without manual data entry.' },
  ];

  return (
    <section className="py-32 relative overflow-hidden min-h-[800px] border-b border-white/5 scroll-trigger" id="features">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-20">
        <div className="pixel-text pixel-text-gradient transform rotate-[-5deg] scale-150 select-none parallax-bg" data-speed="0.25">10 Mins</div>
      </div>
      <div className="absolute left-[-20%] top-[30%] w-[600px] h-[600px] blur-blob blob-primary opacity-20 mix-blend-screen parallax-bg" data-speed="-0.1"></div>
      
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 timeline-container">
        <div className="reveal-up">
          <h2 className="text-3xl font-medium mb-4">How It Works</h2>
          <p className="text-paper-300 text-sm max-w-sm">One simple platform to manage your team, tasks, and workflows — all in one place.</p>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-4 bottom-4 w-px bg-white/20 timeline-line"></div>
          
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-10 reveal-up" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-white/30 transition-colors duration-500 hover:bg-white hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                <div className="glass-panel p-6 bg-white/5 hover:bg-white/10 transition-colors transform hover:translate-x-2 duration-300">
                  <p className="text-[10px] text-primary uppercase tracking-wider mb-2">{step.num}</p>
                  <h4 className="text-lg font-medium mb-2 text-white">{step.title}</h4>
                  <p className="text-xs text-paper-300 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
