import React from 'react';
import { History, Plus, Trash2, X } from 'lucide-react';

interface SophiaChatHistoryProps {
  isOpen: boolean;
  threads: any[];
  activeConversationId: number | null;
  onClose: () => void;
  onLoadThread: (id: number) => void;
  onDeleteThread: (id: number) => void;
  onNewChat: () => void;
}

export function SophiaChatHistory({
  isOpen,
  threads,
  activeConversationId,
  onClose,
  onLoadThread,
  onDeleteThread,
  onNewChat,
}: SophiaChatHistoryProps) {
  if (!isOpen) return null;

  return (
    <div className="w-60 flex-shrink-0 bg-white/50 dark:bg-ink-950/50 backdrop-blur-md border-r border-paper-200/50 dark:border-ink-800/50 flex flex-col h-full z-10 animate-slide-in relative">
      <div className="p-3 border-b border-paper-200/50 dark:border-ink-800/50 bg-white/80 dark:bg-ink-900/80 flex justify-between items-center sticky top-0 transition-all">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-paper-900 dark:text-white flex items-center gap-1.5 font-mono">
          <History className="w-3.5 h-3.5 text-coral-500" /> Chat History
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-paper-100 dark:hover:bg-ink-900 text-paper-400 hover:text-paper-600 rounded transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 border-b border-paper-150 dark:border-ink-850">
        <button
          onClick={onNewChat}
          className="w-full py-2 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-coral-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {threads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[10px] text-paper-450 dark:text-ink-500 italic">No past conversations found.</p>
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onLoadThread(thread.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left flex justify-between items-center group relative ${
                activeConversationId === thread.id
                  ? 'bg-coral-500/10 border-coral-500/30 text-coral-600 dark:text-coral-400 font-semibold shadow-sm'
                  : 'bg-paper-50/50 dark:bg-ink-900/40 border-paper-200/50 dark:border-ink-800/50 text-paper-700 dark:text-ink-200 hover:bg-paper-100/50 dark:hover:bg-ink-800/50'
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[10px] font-semibold truncate leading-tight">{thread.title}</p>
                <span className="text-[8px] text-paper-400 dark:text-ink-500">
                  {new Date(thread.updatedAt).toLocaleDateString()} at {new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteThread(thread.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-paper-400 hover:text-red-500 rounded transition-all flex items-center justify-center flex-shrink-0"
                title="Delete thread"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
