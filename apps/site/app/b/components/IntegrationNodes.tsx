import React from 'react';
import { Github, Slack, Terminal, Briefcase, Database, MessageCircle, Layers } from 'lucide-react';

export default function IntegrationNodes() {
  return (
    <div className="integration-grid h-[400px] relative w-full max-w-md mx-auto svg-container reveal-scale delay-300">
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
        <line className="svg-connector delay-200" pathLength="1" x1="50%" y1="50%" x2="30%" y2="20%" stroke="rgba(233,93,42,0.25)" strokeWidth="1.5" />
        <line className="svg-connector delay-300" pathLength="1" x1="50%" y1="50%" x2="70%" y2="20%" stroke="rgba(233,93,42,0.25)" strokeWidth="1.5" />
        <line className="svg-connector delay-400" pathLength="1" x1="50%" y1="50%" x2="90%" y2="50%" stroke="rgba(233,93,42,0.25)" strokeWidth="1.5" />
        <line className="svg-connector delay-500" pathLength="1" x1="50%" y1="50%" x2="30%" y2="80%" stroke="rgba(233,93,42,0.25)" strokeWidth="1.5" />
        <line className="svg-connector delay-600" pathLength="1" x1="50%" y1="50%" x2="70%" y2="80%" stroke="rgba(233,93,42,0.25)" strokeWidth="1.5" />
      </svg>
      
      <div className="integration-icon w-16 h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_rgba(233,93,42,0.35)] border-primary/50 bg-dark-800 z-20 animate-pulse">
        <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-white"><Layers className="w-4 h-4" /></div>
      </div>

      <div className="absolute top-[20%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="integration-icon w-12 h-12 text-xl text-white hover:text-primary transition-colors"><Github className="w-5 h-5" /></div>
      </div>
      <div className="absolute top-[20%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="integration-icon w-12 h-12 text-xl text-pink-500"><Slack className="w-5 h-5" /></div>
      </div>
      <div className="absolute top-[50%] left-[90%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="integration-icon w-12 h-12 text-xl text-coral"><Terminal className="w-5 h-5" /></div>
      </div>
      <div className="absolute top-[80%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="integration-icon w-12 h-12 text-xl text-blue-500"><Briefcase className="w-5 h-5" /></div>
      </div>
      <div className="absolute top-[80%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="integration-icon w-12 h-12 text-xl text-orange-500"><Database className="w-5 h-5" /></div>
      </div>
      
      <div className="absolute top-[10%] left-[90%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="integration-icon w-10 h-10 text-lg text-emerald-400 opacity-60"><MessageCircle className="w-4 h-4" /></div>
      </div>
    </div>
  );
}
