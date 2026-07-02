import React from 'react';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  desc: string;
  features: string[];
  isPro?: boolean;
}

export default function PricingCard({ title, price, desc, features, isPro }: PricingCardProps) {
  return (
    <div className={`rounded-2xl p-8 border transition-all ${
      isPro 
        ? 'bg-dark-800 border-2 border-primary shadow-2xl shadow-primary/10 relative transform md:-translate-y-4' 
        : 'glass-card border-white/5 hover:border-white/10'
    }`}>
      {isPro && (
        <div className="bg-primary text-center py-1.5 text-[9px] font-bold uppercase tracking-wider text-white w-full absolute top-0 left-0">
          Dane Recommends
        </div>
      )}
      <div className="flex items-center gap-2 mb-4 text-white font-semibold text-sm">
        <span>{title}</span>
      </div>
      <p className="text-xs text-paper-300 mb-6 h-8">{desc}</p>
      
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-paper-300 text-sm">/month</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold mb-4 text-white">What will you get?</p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-paper-300">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      
      <a href="https://app.danesproperties.com/register" className={`w-full block text-center font-medium py-3 rounded-xl transition-all text-sm ${
        isPro ? 'bg-primary hover:bg-primary/95 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
      }`}>Get Started</a>
    </div>
  );
}
