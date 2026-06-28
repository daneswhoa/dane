import React, { useState, useEffect } from 'react';
import { Database, Trash2, BrainCircuit, RefreshCw, X } from 'lucide-react';

interface SophiaSavedInfoProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export function SophiaSavedInfo({ isOpen, onClose, apiBase }: SophiaSavedInfoProps) {
  const [memory, setMemory] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMemory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/agent/memory`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.memory) {
        setMemory(data.memory);
      }
    } catch (err) {
      console.error('Failed to load Sophia memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMemory = async () => {
    if (!window.confirm('Are you sure you want to clear Sophia\'s long-term memory? This removes all personalized preferences and saved information.')) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiBase}/api/agent/memory`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMemory({});
      }
    } catch (err) {
      console.error('Failed to clear Sophia memory:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMemory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const memoryKeys = Object.keys(memory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-ink-950 border border-paper-250 dark:border-ink-850 w-full max-w-md h-full rounded-2xl shadow-2xl flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-coral-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white font-mono">Sophia's Memory Bank</h3>
              <p className="text-[9px] text-paper-400">Long-term context and portfolio insights saved by AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-paper-150 dark:hover:bg-ink-850 text-paper-400 hover:text-paper-600 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-paper-400">
              <RefreshCw className="w-6 h-6 animate-spin text-coral-500" />
              <span className="text-[10px] font-mono">Querying memory cells...</span>
            </div>
          ) : memoryKeys.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <Database className="w-10 h-10 text-paper-250 dark:text-ink-800 mx-auto" />
              <p className="text-xs text-paper-450 dark:text-ink-400 font-medium">Memory is empty.</p>
              <p className="text-[10px] text-paper-400 max-w-[240px] mx-auto leading-relaxed">
                As you chat with Sophia, she automatically remembers preferences, context records, and custom portfolio preferences to serve you better.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {memoryKeys.map((key) => (
                <div
                  key={key}
                  className="p-3 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl space-y-1 hover:border-coral-300 dark:hover:border-coral-800/50 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-coral-500">{key}</span>
                  </div>
                  <p className="text-xs text-paper-800 dark:text-ink-200 leading-relaxed font-sans">{memory[key]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {memoryKeys.length > 0 && (
          <div className="p-4 border-t border-paper-200 dark:border-ink-850 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
            <span className="text-[9px] text-paper-400 font-mono">Total insights: {memoryKeys.length}</span>
            <button
              onClick={handleClearMemory}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 dark:text-red-400 hover:text-red-650 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
