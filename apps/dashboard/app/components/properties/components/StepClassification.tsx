import React from 'react';
import { Sparkles, Building2, Landmark } from 'lucide-react';

interface StepClassificationProps {
  setupMode: 'single' | 'multi';
  onChangeMode: (mode: 'single' | 'multi') => void;
}

export function StepClassification({ setupMode, onChangeMode }: StepClassificationProps) {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-coral-500" /> Real Estate Classification
        </h2>
        <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
          Specify how this asset is organized. This is critical for invoicing models and landlord permission controls.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onChangeMode('single')}
          className={`border-2 rounded-xl p-4 cursor-pointer hover:border-coral-500/50 transition-all flex flex-col gap-2 bg-paper-50/50 dark:bg-ink-900/30 ${
            setupMode === 'single' ? 'border-coral-500 shadow-md shadow-coral-500/5' : 'border-paper-200 dark:border-ink-700'
          }`}
        >
          <Building2 className={`w-6 h-6 ${setupMode === 'single' ? 'text-coral-500' : 'text-paper-400'}`} />
          <div>
            <h3 className="text-xs font-bold text-paper-900 dark:text-white">Single-Family Asset</h3>
            <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5 leading-relaxed">
              A detached single house or townhouse. Sets up as one unified unit.
            </p>
          </div>
        </div>

        <div
          onClick={() => onChangeMode('multi')}
          className={`border-2 rounded-xl p-4 cursor-pointer hover:border-coral-500/50 transition-all flex flex-col gap-2 bg-paper-50/50 dark:bg-ink-900/30 ${
            setupMode === 'multi' ? 'border-coral-500 shadow-md shadow-coral-500/5' : 'border-paper-200 dark:border-ink-700'
          }`}
        >
          <Landmark className={`w-6 h-6 ${setupMode === 'multi' ? 'text-coral-500' : 'text-paper-400'}`} />
          <div>
            <h3 className="text-xs font-bold text-paper-900 dark:text-white">Multi-Unit / Scattered Houses</h3>
            <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5 leading-relaxed">
              Apartments, commercial blocks, or multiple houses managed under one group name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
