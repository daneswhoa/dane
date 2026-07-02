import React from 'react';
import { Building, ArrowUpRight } from 'lucide-react';
import FlagWidgetMock from './FlagWidgetMock';

export default function FeaturesSplit() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16" id="solutions">
      <div className="flex-1">
        <div className="badge mb-4">Financial Overview</div>
        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Built for Individuals <span className="font-serif italic font-normal text-paper-300">and</span> Businesses</h2>
        
        <div className="space-y-6 mt-8">
          <div className="flex gap-4">
            <div className="mt-1">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs border border-primary/30">
                <Building className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Tailored for Portfolios of Any Size</h4>
              <p className="text-sm text-paper-300">Whether you manage single-family rentals or commercial apartment complexes, our tools adapt to your scale.</p>
            </div>
          </div>
        </div>

        <a href="/register" className="inline-flex items-center gap-2 bg-white text-dark-900 px-6 py-2.5 rounded-full text-sm font-semibold mt-8 hover:bg-paper-100 transition-all hover:scale-105">
          Explore More <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="flex-1 w-full relative flex justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
        <FlagWidgetMock />
      </div>
    </section>
  );
}
