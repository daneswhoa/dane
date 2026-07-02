import React from 'react';
import IntegrationNodes from './IntegrationNodes';

export default function IntegrationSection() {
  return (
    <section className="py-24 px-6 border-b border-white/5 scroll-trigger overflow-hidden relative">
      <div className="absolute right-[20%] bottom-[-100px] w-[500px] h-[300px] blur-blob blob-primary opacity-30 parallax-bg" data-speed="0.15"></div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative scroll-trigger">
        <div>
          <h2 className="text-3xl md:text-4xl font-medium mb-4 reveal-up">
            Your Existing Stack, <span className="text-primary relative inline-block">Unified.<span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary transform scale-x-0 origin-left transition-transform duration-1000 delay-500 reveal-line"></span></span>
          </h2>
          <p className="text-paper-300 text-sm max-w-sm mb-8 reveal-up delay-100">
            Plays well with others. Connect Landlord to the payment gateways, messaging tools, and banks your team already uses to eliminate context switching.
          </p>
          <div className="reveal-up delay-200">
            <a href="/register" className="bg-white text-dark-900 px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-paper-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5">
              Get Started
            </a>
          </div>
        </div>

        <IntegrationNodes />
      </div>
    </section>
  );
}
