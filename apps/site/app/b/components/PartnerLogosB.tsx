import React from 'react';
import { Shapes, Terminal, Bookmark, MessageSquare, Zap, Cpu } from 'lucide-react';

export default function PartnerLogosB() {
  const partners = [
    { name: 'Groupe', icon: Shapes },
    { name: 'Alexun', icon: Terminal },
    { name: 'Wation', icon: Bookmark },
    { name: 'Journey', icon: MessageSquare },
    { name: 'GrowthView', icon: Zap },
    { name: 'AIVA', icon: Cpu },
  ];

  return (
    <section className="py-10 border-b border-white/5 reveal-fade scroll-trigger">
      <p className="text-center text-sm text-paper-300 mb-6">Trusted By</p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 px-6 overflow-hidden">
        {partners.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div key={idx} className="flex items-center gap-2 text-sm font-medium hover:text-white hover:opacity-100 transition-all duration-300 cursor-default select-none">
              <Icon className="w-4 h-4 text-primary" /> {p.name}
            </div>
          );
        })}
      </div>
    </section>
  );
}
