import React from 'react';
import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative">
      <div className="flex items-center gap-2">
        <img src="/dane_logomark.png" alt="Dane Properties Logo" className="w-6 h-6 object-contain" />
        <span className="font-semibold text-sm text-white">Dane Properties</span>
      </div>
      <p className="text-xs text-paper-300">© 2026 Dane Properties. All rights reserved.</p>
      <div className="flex gap-6 text-xs text-paper-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>
    </footer>
  );
}
