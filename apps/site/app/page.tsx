import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import PartnerLogos from './components/PartnerLogos';
import FeaturesHeader from './components/FeaturesHeader';
import FeaturesGrid from './components/FeaturesGrid';
import FeaturesSplit from './components/FeaturesSplit';
import CurrencyExchangeSection from './components/CurrencyExchangeSection';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="relative antialiased min-h-screen pb-10">
      <div className="hero-bg"></div>
      <div className="hero-gradient-overlay"></div>
      
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <PartnerLogos />
        
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 mt-20">
          <FeaturesHeader />
          <FeaturesGrid />
        </section>
        
        <FeaturesSplit />
        <CurrencyExchangeSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
