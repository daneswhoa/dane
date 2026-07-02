import React from 'react';
import { Layers } from 'lucide-react';

export default function FooterB() {
  const sections = [
    { title: 'QUICK LINKS', items: ['Features', 'Use Cases', 'Platform', 'Integrations', 'Pricing'] },
    { title: 'SOLUTIONS', items: ['Manager Dashboard', 'Tenant Portals', 'Contractors', 'Accounting Ledger'] },
    { title: 'COMPANY', items: ['About', 'Careers', 'Blog', 'Contact'] },
  ];

  return (
    <footer className="relative overflow-hidden pt-20 pb-10 border-t border-white/10 bg-dark-900 mt-20 scroll-trigger">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 relative z-10">
          <div className="md:col-span-1 reveal-up">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-white"><Layers className="w-3.5 h-3.5" /></div>
              <span className="font-bold text-lg tracking-tight text-white">Landlord</span>
            </div>
            <p className="text-xs text-paper-300 mb-6 max-w-[200px]">Smarter property administration with AI.</p>
            <a href="/register" className="inline-flex items-center gap-2 bg-white text-dark-900 px-4 py-2 rounded-full text-[10px] font-semibold hover:bg-paper-100 transition-all hover:scale-105 active:scale-95">Get Started</a>
          </div>
          
          {sections.map((sec, idx) => (
            <div key={idx} className="reveal-up" style={{ transitionDelay: `${(idx + 1) * 100}ms` }}>
              <h5 className="text-[10px] font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-sm"></span> {sec.title}
              </h5>
              <ul className="space-y-3 text-xs text-paper-300">
                {sec.items.map((item, i) => (
                  <li key={i}><a href="#" className="hover:text-white transition-colors duration-200 inline-block">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="relative w-full h-[20vw] min-h-[150px] mb-10 overflow-hidden flex items-end reveal-up delay-400">
          <div className="pixel-text pixel-text-gradient absolute bottom-[-10%] left-0 text-[25vw] tracking-tighter opacity-100 z-0 parallax-bg select-none" data-speed="0.1">Landlord</div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/10 relative z-10 gap-4 reveal-fade delay-500">
          <p className="text-[10px] text-paper-300">© 2026 Landlord. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
