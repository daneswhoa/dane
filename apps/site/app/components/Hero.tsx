import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center flex flex-col items-center relative z-10">
      <div className="badge mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        Next-Generation Property Management
      </div>

      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight mb-6 max-w-4xl text-white">
        Manage Properties <br />
        <span className="font-serif italic text-paper-300 font-normal">Smarter, Faster,</span> Better
      </h1>

      <p className="text-paper-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Experience next-generation rental administration with automated workflows, real-time insights, and a seamless tenant-contractor network.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
        <a href="https://app.danesproperties.com/register" className="bg-white text-dark-900 px-8 py-3.5 rounded-full font-semibold flex items-center gap-2 hover:bg-paper-100 transition-all hover:scale-105 w-full sm:w-auto justify-center shadow-lg">
          Start Free Trial <ArrowUpRight className="w-4 h-4 text-dark-900" />
        </a>
        <a href="#features" className="px-8 py-3.5 rounded-full font-medium text-white flex items-center gap-2 hover:bg-white/5 transition-all border border-transparent hover:border-white/10 w-full sm:w-auto justify-center">
          Learn More
        </a>
      </div>
    </section>
  );
}
