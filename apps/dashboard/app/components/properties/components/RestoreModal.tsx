import React from 'react';
import { BadgeInfo } from 'lucide-react';

interface RestoreModalProps {
  propertyName: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export function RestoreModal({ propertyName, onRestore, onDiscard }: RestoreModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in animate-reveal">
      <div className="bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-700 max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 flex items-center justify-center text-coral-600 dark:text-coral-400">
          <BadgeInfo className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-paper-900 dark:text-white">Restore Saved Progress?</h3>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            We found unsaved setup progress for <span className="font-semibold text-coral-500">{propertyName || 'unnamed property'}</span>. Would you like to restore it or start fresh?
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRestore}
            className="flex-1 py-2 text-xs font-semibold bg-coral-500 text-white rounded-lg hover:bg-coral-600 active:scale-95 transition-all shadow-md shadow-coral-500/10"
          >
            Restore Progress
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 py-2 text-xs font-semibold border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-300 rounded-lg hover:bg-paper-100 dark:hover:bg-ink-900 transition-all"
          >
            Discard & Restart
          </button>
        </div>
      </div>
    </div>
  );
}
