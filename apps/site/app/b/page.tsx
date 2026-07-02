'use client';

import React from 'react';
import NavbarB from './components/NavbarB';
import HeroB from './components/HeroB';
import PartnerLogosB from './components/PartnerLogosB';
import ValueProposition from './components/ValueProposition';
import DockWidget from './components/DockWidget';
import IntegrationSection from './components/IntegrationSection';
import TimelineSection from './components/TimelineSection';
import ConnectionMockup from './components/ConnectionMockup';
import FooterB from './components/FooterB';
import { useScrollReveal } from './hooks/useScrollReveal';
import './b.css';

export default function ABTestLandingPage() {
  useScrollReveal();

  return (
    <div className="relative antialiased min-h-screen pb-10 bg-dark-900 text-white font-sans overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-10]" id="bg-container">
        <div className="blur-blob blob-primary w-[600px] h-[400px] top-[-100px] right-[-100px] parallax-bg" data-speed="0.2"></div>
        <div className="blur-blob blob-coral w-[500px] h-[500px] top-[30%] left-[-200px] opacity-30 parallax-bg" data-speed="0.1"></div>
      </div>

      <NavbarB />
      <main>
        <HeroB />
        <PartnerLogosB />
        <ValueProposition />
        <DockWidget />
        <IntegrationSection />
        <TimelineSection />
        <ConnectionMockup />
      </main>
      <FooterB />
    </div>
  );
}
