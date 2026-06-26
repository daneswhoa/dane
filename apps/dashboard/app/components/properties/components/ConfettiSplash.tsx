import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ConfettiSplashProps {
  propertyName: string;
  unitCount: number;
}

export function ConfettiSplash({ propertyName, unitCount }: ConfettiSplashProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-ink-950 z-50 flex flex-col items-center justify-center text-center animate-fade-in p-6">
      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">Property Launched Successfully!</h2>
      <p className="text-xs text-paper-500 dark:text-ink-400 max-w-sm mt-1">
        Integrating <span className="font-semibold text-coral-500">{propertyName}</span> with {unitCount} units. Rebuilding dashboard feed...
      </p>
    </div>
  );
}
