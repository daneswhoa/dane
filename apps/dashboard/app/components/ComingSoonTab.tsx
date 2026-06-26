'use client';

import React from 'react';
import { Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ComingSoonTabProps {
  tabName: string;
}

export default function ComingSoonTab({ tabName }: ComingSoonTabProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto text-center px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-coral-500/10 text-coral-500 flex items-center justify-center mb-6 shadow-sm border border-coral-500/20">
        <Building className="w-8 h-8 animate-pulse" />
      </div>
      <h2 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">
        {tabName} Workspace
      </h2>
      <p className="text-xs text-paper-700 dark:text-ink-300 mt-2 max-w-sm leading-relaxed">
        We are currently preparing the {tabName.toLowerCase()} management interfaces. Sophia AI agents are running background tasks to sync this channel.
      </p>
      <button 
        onClick={() => router.push('/properties')}
        className="mt-6 px-4 py-2 bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-paper-900 dark:text-white text-xs font-semibold rounded-md hover:bg-paper-300 dark:hover:bg-ink-700 transition-all duration-150"
      >
        Return to Properties Portfolio
      </button>
    </div>
  );
}
