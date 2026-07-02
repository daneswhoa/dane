import React from 'react';
import NodeNetwork from './NodeNetwork';

export default function HeroB() {
  return (
    <section className="relative pt-20 pb-40 overflow-hidden min-h-[85vh] flex flex-col items-center justify-start border-b border-white/10">
      <div className="absolute bottom-0 left-0 w-full h-[500px] pointer-events-none z-[-1]">
        <div className="blur-blob blob-primary w-[800px] h-[300px] bottom-0 left-[-10%] opacity-80 mix-blend-screen parallax-bg" data-speed="0.3"></div>
        <div className="blur-blob blob-coral w-[600px] h-[400px] bottom-[-100px] right-0 opacity-70 mix-blend-screen parallax-bg" data-speed="0.4"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight mb-6 reveal-up active">
          Your Portfolio.<br />
          One Dashboard.<br />
          <span className="text-paper-300">Zero Chaos.</span>
        </h1>
        
        <p className="text-paper-200 text-sm md:text-base max-w-md mx-auto mb-10 reveal-up active delay-100">
          One simple platform to manage your tenants, leases, and maintenance workflows — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center reveal-up active delay-200">
          <a href="/register" className="bg-white text-dark-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-paper-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10">
            Get Started
          </a>
          <a href="#features" className="border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/5 transition-colors">
            Learn More
          </a>
        </div>
      </div>

      <NodeNetwork />
    </section>
  );
}
