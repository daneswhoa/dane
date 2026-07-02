import React from 'react';
import { Share2, Users, Zap, Paperclip, Bell, CheckCircle2, Calendar, LayoutGrid, Folder } from 'lucide-react';

export default function DockWidget() {
  return (
    <div className="flex justify-center mb-32 reveal-scale">
      <div className="glass-panel px-8 py-4 rounded-2xl flex gap-6 items-center shadow-2xl shadow-black/50 transform hover:scale-[1.02] transition-transform duration-500">
        <Share2 className="w-5 h-5 text-coral hover:text-coral-hover cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        <Users className="w-5 h-5 text-primary hover:text-primary/80 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        <Zap className="w-5 h-5 text-amber-500 hover:text-amber-400 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        
        <div className="relative group cursor-pointer animate-pulse">
          <div className="w-12 h-12 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center text-primary text-xl shadow-[0_0_15px_rgba(233,93,42,0.4)] transition-all group-hover:bg-primary/30 group-hover:scale-110">
            <Paperclip className="w-5 h-5 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
          </div>
          <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 bg-dark-700 border border-white/10 text-[10px] px-2.5 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:bottom-[-30px] transition-all duration-300 flex items-center gap-1 z-20 shadow-xl text-white">
            <Paperclip className="w-3 h-3 text-primary" /> Centralize Files
          </div>
          <div className="absolute bottom-[-10px] right-[-10px] text-coral text-lg z-30 pointer-events-none drop-shadow-md animate-bounce">
            🖲️
          </div>
        </div>

        <Bell className="w-5 h-5 text-yellow-600 hover:text-yellow-500 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        <CheckCircle2 className="w-5 h-5 text-orange-600 hover:text-orange-500 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        <Calendar className="w-5 h-5 text-emerald-600 hover:text-emerald-500 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        <LayoutGrid className="w-5 h-5 text-purple-600 hover:text-purple-500 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
        <Folder className="w-5 h-5 text-red-600 hover:text-red-500 cursor-pointer transition-colors hover:-translate-y-1 transform duration-200" />
      </div>
    </div>
  );
}
