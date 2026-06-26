'use client';

import React from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

interface AccessDeniedOverlayProps {
  moduleName: string;
  actionName: string;
  onClose?: () => void;
}

export function AccessDeniedOverlay({ moduleName, actionName, onClose }: AccessDeniedOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-paper-50/90 dark:bg-ink-950/90 backdrop-blur-sm animate-fade-in rounded-xl">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6 text-coral-500" />
        </div>
        
        <h3 className="text-lg font-bold text-paper-900 dark:text-white mb-2">Access Restricted</h3>
        
        <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed mb-6">
          You do not have the required permissions to perform <span className="font-semibold text-paper-900 dark:text-white">"{actionName}"</span> within the <span className="font-semibold text-coral-500">{moduleName}</span> module. 
          Please contact your Organization Owner to elevate your access level.
        </p>

        <div className="flex flex-col gap-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-paper-100 dark:bg-ink-800 hover:bg-paper-200 dark:hover:bg-ink-700 text-paper-900 dark:text-white text-xs font-semibold rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          )}
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-transparent hover:bg-paper-50 dark:hover:bg-ink-900 text-paper-500 dark:text-ink-400 text-[11px] font-medium rounded-md transition-colors"
          >
            <Lock className="w-3 h-3" /> Request Elevation
          </button>
        </div>
      </div>
    </div>
  );
}
