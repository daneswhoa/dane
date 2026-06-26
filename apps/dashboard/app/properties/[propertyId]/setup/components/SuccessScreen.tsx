'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function SuccessScreen({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-paper-900 dark:text-white mb-2">Setup Complete!</h2>
        <p className="text-sm text-paper-500 dark:text-ink-400 max-w-md mx-auto leading-relaxed">
          The property, units, and initial tenant invoices have been successfully configured. You can now manage this property directly from your portfolio.
        </p>
      </div>
      <button
        onClick={() => router.push(`/properties/${propertyId}`)}
        className="flex items-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-coral-500/20"
      >
        View Property <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
