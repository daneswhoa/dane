import React from 'react';
import { Layers } from 'lucide-react';

export default function NavbarB() {
  return (
    <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20 reveal-fade active">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-sm text-white tracking-tight">Landlord</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-xs font-medium text-paper-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div>
        <a href="/register" className="bg-white text-dark-900 px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-paper-100 transition-colors">
          Get Started
        </a>
      </div>
    </nav>
  );
}
