import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Cpu, History, Plus } from 'lucide-react';
import { FormattedMessage } from './SophiaMessageFormatter';
import { SophiaWidgets } from './SophiaWidgets';
import { SophiaVoiceWaveform } from './SophiaVoiceWaveform';

interface ContentBlock {
  type: 'text' | 'action' | 'widget';
  text?: string;
  actionId?: string;
  actionName?: string;
  actionStatus?: 'pending' | 'completed' | 'failed';
  actionDetails?: string;
  actionTimestamp?: string;
  widgetData?: any;
}

interface Message {
  id: string;
  sender: 'sophia' | 'user';
  text: string;
  timestamp: string;
  widget?: React.ReactNode;
  widgetData?: any;
  isDrafting?: boolean;
  successCount?: number;
  failureCount?: number;
  actions?: any[];
  audioBase64?: string;
  audioMimeType?: string;
  duration?: number;
  blocks?: ContentBlock[];
}

interface SophiaMessageListProps {
  messages: Message[];
  isTyping: boolean;
  statusMessage: string;
  actionsQueue: any[];
  activePropertyCreation: boolean;
  activePropertySetup: boolean;
  liveStep: number;
  onSendMessage: (msg: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  setIsSavedInfoOpen: (open: boolean) => void;
  onNewChat: () => void;
}

export default function SophiaMessageList({
  messages,
  isTyping,
  statusMessage,
  actionsQueue,
  activePropertyCreation,
  activePropertySetup,
  liveStep,
  onSendMessage,
  chatEndRef,
  isHistoryOpen,
  setIsHistoryOpen,
  setIsSavedInfoOpen,
  onNewChat
}: SophiaMessageListProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full relative">
      {/* Chat Header */}
      <div className="p-3 px-4 border-b border-paper-200/50 dark:border-ink-800/50 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-semibold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Sophia AI Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 rounded hover:bg-paper-100 dark:hover:bg-ink-800 transition-all ${isHistoryOpen ? 'text-coral-500 bg-coral-500/5' : 'text-paper-500 dark:text-ink-300'}`}
            title="Toggle Chat History"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsSavedInfoOpen(true)}
            className="px-2 py-1 rounded bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-750 text-paper-700 dark:text-ink-200 text-[9px] font-bold font-mono transition-all flex items-center gap-1"
            title="View Sophia's long-term memory"
          >
            <Cpu className="w-3.5 h-3.5" /> Saved Info
          </button>
          <button 
            onClick={onNewChat}
            className="px-2 py-1 rounded bg-coral-500/10 text-coral-500 hover:bg-coral-500/20 text-[9px] font-bold font-mono transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> NEW CHAT
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-paper-50/50 dark:bg-ink-950/20 scrollbar-thin">
        <div className="flex items-center justify-center">
          <span className="text-[9px] uppercase font-semibold tracking-widest text-paper-400 dark:text-ink-500 bg-paper-100 dark:bg-ink-850 px-3 py-1 rounded-full border border-paper-200 dark:border-ink-700/50">Conversations</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'self-end justify-end ml-auto' : ''
            }`}
          >
            {msg.sender === 'sophia' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-100 to-coral-200 dark:from-coral-900/40 dark:to-coral-800/40 flex items-center justify-center flex-shrink-0 border border-coral-200 dark:border-coral-700/50 shadow-sm mt-1 relative">
                <Sparkles className="w-4 h-4 text-coral-600 dark:text-coral-400" />
              </div>
            )}

            <div className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : ''}`}>
              <span className="text-[10px] font-semibold text-paper-900 dark:text-white px-1">
                {msg.sender === 'sophia' ? 'Sophia' : 'You'}
              </span>
              
              <div className={`text-[13px] leading-relaxed p-4 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-paper-800 dark:bg-ink-200 text-white dark:text-ink-900 rounded-tr-sm'
                  : 'bg-white/60 dark:bg-ink-800/60 backdrop-blur-md border border-paper-200/50 dark:border-ink-700/50 text-paper-800 dark:text-ink-100 rounded-tl-sm'
              }`}>
                {msg.blocks && msg.blocks.length > 0 ? (
                  <div className="space-y-4">
                    {msg.blocks.map((block, bIdx) => {
                      if (block.type === 'text') {
                        return <FormattedMessage key={bIdx} text={block.text || ''} />;
                      }
                      if (block.type === 'action') {
                        const isPending = block.actionStatus === 'pending';
                        const isCompleted = block.actionStatus === 'completed';
                        const isFailed = block.actionStatus === 'failed';
                        return (
                          <div 
                            key={bIdx} 
                            className={`my-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono transition-all duration-300 ${
                              isPending 
                                ? 'bg-amber-550/10 dark:bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse'
                                : isCompleted
                                  ? 'bg-emerald-550/10 dark:bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-red-550/10 dark:bg-red-500/5 border-red-500/20 text-red-650 dark:text-red-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isPending && <span className="w-1.5 h-1.5 bg-amber-550 dark:bg-amber-500 rounded-full animate-ping" />}
                              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                              {isFailed && <AlertTriangle className="w-3.5 h-3.5 text-red-505" />}
                              <span className="font-bold uppercase tracking-wider">{block.actionName}</span>
                              {block.actionDetails && <span className="opacity-70 truncate">- {block.actionDetails}</span>}
                            </div>
                            <span className="opacity-50 text-[9px]">{block.actionTimestamp}</span>
                          </div>
                        );
                      }
                      if (block.type === 'widget') {
                        return (
                          <SophiaWidgets 
                            key={bIdx}
                            widgetData={block.widgetData} 
                            onSendMessage={onSendMessage} 
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : msg.audioBase64 ? (
                  <SophiaVoiceWaveform
                    audioBase64={msg.audioBase64}
                    audioMimeType={msg.audioMimeType}
                    duration={msg.duration}
                  />
                ) : (
                  <FormattedMessage text={msg.text} />
                )}

                {!msg.blocks && msg.widget && msg.widget}
                {!msg.blocks && msg.widgetData && (
                  <SophiaWidgets 
                    widgetData={msg.widgetData} 
                    onSendMessage={onSendMessage} 
                  />
                )}
              </div>

              {/* Execution Metrics logs */}
              {msg.sender === 'sophia' && (msg.successCount !== undefined || msg.failureCount !== undefined) && (
                <div className="flex items-center gap-3 mt-1.5 px-1 text-[10px] text-paper-500 dark:text-ink-400 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Executed: {msg.successCount || 0}
                  </span>
                  {(msg.failureCount && msg.failureCount > 0) ? (
                    <span className="flex items-center gap-1 text-red-500 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Failed: {msg.failureCount}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full border border-paper-200 dark:border-ink-700 bg-coral-100 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-semibold flex items-center justify-center shadow-sm text-xs mt-1">
                JD
              </div>
            )}
          </div>
        ))}

        {/* Typing / Subagents Working Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 max-w-[85%] animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-100 to-coral-200 dark:from-coral-900/40 dark:to-coral-800/40 flex items-center justify-center flex-shrink-0 border border-coral-200 dark:border-coral-700/50 shadow-sm mt-1 relative">
              <Sparkles className="w-4 h-4 text-coral-600 dark:text-coral-400 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-paper-900 dark:text-white px-1">
                Sophia <span className="text-[9px] text-paper-400 font-normal italic ml-1">{statusMessage}</span>
              </span>
              <div className="bg-white/60 dark:bg-ink-800/60 backdrop-blur-md border border-paper-200/50 dark:border-ink-700/50 text-paper-800 dark:text-ink-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-coral-400 dark:bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-coral-400 dark:bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-coral-400 dark:bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                
                {/* Active Subagents Working Steps */}
                {actionsQueue.filter(act => act.status === 'pending').length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-paper-100 dark:border-ink-700/50">
                    {activePropertyCreation || activePropertySetup ? (
                      <div className="space-y-3 w-64 pt-1 animate-fade-in">
                        <div className="text-[9px] font-bold text-coral-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-ping"></span>
                          {activePropertyCreation ? 'Creation Pipeline' : 'Setup Pipeline'}
                        </div>
                        <div className="space-y-2.5 relative pl-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-paper-200 dark:before:bg-ink-700">
                          {(activePropertyCreation
                            ? [
                                { label: "Validating input parameters" },
                                { label: "Writing record to database" },
                                { label: "Assigning illustration assets" },
                                { label: "Registering audit trail logs" }
                              ]
                            : [
                                { label: "Verifying property configuration" },
                                { label: "Reconciling unit structures" },
                                { label: "Writing monthly rent & fee rules" },
                                { label: "Updating system status & security logs" }
                              ]
                          ).map((step, idx) => {
                            const isCompleted = idx < liveStep;
                            const isCurrent = idx === liveStep;
                            return (
                              <div key={idx} className="relative flex flex-col">
                                <span className={`absolute -left-[14.5px] top-[2px] w-[9px] h-[9px] rounded-full border border-white dark:border-ink-900 transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-emerald-500' 
                                    : isCurrent 
                                      ? 'bg-coral-500 animate-pulse scale-110' 
                                      : 'bg-paper-200 dark:bg-ink-700'
                                }`} />
                                <span className={`text-[10px] leading-none transition-colors duration-300 ${
                                  isCompleted 
                                    ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                                    : isCurrent 
                                      ? 'font-semibold text-paper-950 dark:text-white' 
                                      : 'text-paper-400 dark:text-ink-500'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-paper-500 dark:text-ink-400">Subagents at work:</span>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: Math.min(actionsQueue.filter(act => act.status === 'pending').length, 5) }).map((_, idx) => (
                            <span
                              key={idx}
                              className="w-2 h-2 rounded-full bg-coral-500 animate-pulse"
                              style={{ animationDelay: `${idx * 150}ms` }}
                            />
                          ))}
                          {actionsQueue.filter(act => act.status === 'pending').length > 5 && (
                            <span className="text-[9px] font-bold text-coral-500 ml-1">
                              +{actionsQueue.filter(act => act.status === 'pending').length - 5} others
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
