import React from 'react';
import { Layers } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <Layers className="w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Landlord</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-paper-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <a href="/login" className="text-sm font-medium text-paper-300 hover:text-white transition-colors">Login</a>
        <a href="/register" className="bg-white text-dark-900 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-paper-100 transition-colors">Sign Up</a>
      </div>
    </nav>
  );
}
