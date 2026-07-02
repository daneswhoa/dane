import React from 'react';
import { Shapes, Terminal, Bookmark, MessageSquare, Zap, Cpu } from 'lucide-react';

export default function PartnerLogos() {
  const partners = [
    { icon: Shapes, name: 'Framer' },
    { icon: Terminal, name: 'Notion' },
    { icon: Bookmark, name: 'Stripe' },
    { icon: MessageSquare, name: 'Slack' },
    { icon: Zap, name: 'Pendo' },
    { icon: Cpu, name: 'Trello' },
  ];

  return (
    <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 hover:opacity-80 transition-all duration-500 max-w-6xl mx-auto px-6">
      {partners.map((partner, idx) => {
        const Icon = partner.icon;
        return (
          <div key={idx} className="flex items-center gap-2 text-xl font-bold tracking-tight text-white select-none">
            <Icon className="w-5 h-5 text-primary" />
            {partner.name}
          </div>
        );
      })}
    </div>
  );
}
