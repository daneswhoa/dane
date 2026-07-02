'use client';

import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Bot, User, Loader2, Sparkles, Plus, Trash2, MessageSquare, Square, Menu, X, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FormattedMessage } from '../components/SophiaMessageFormatter';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
  isDrafting?: boolean;
  successCount?: number;
  failureCount?: number;
  blocks?: ContentBlock[];
}

export default function TenantSophiaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'sophia',
      text: "Hello! I am Sophia, your AI resident assistant. I can help you understand your invoices, submit maintenance requests, check your due balance, and more. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [threads, setThreads] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadThreadsList = async () => {
    try {
      const res = await fetch(`${apiBase}/api/agent/threads`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.threads) {
        setThreads(data.threads);
        return data.threads;
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
    return [];
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch(`${apiBase}/api/agent/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.conversationId) {
        setActiveConversationId(data.conversationId);
        setMessages([
          {
            id: '1',
            sender: 'sophia',
            text: "Hello! I am Sophia, your AI resident assistant. I can help you understand your invoices, submit maintenance requests, check your due balance, and more. How can I help you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        await loadThreadsList();
      }
    } catch (err) {
      console.error('Failed to start new chat:', err);
    }
  };

  const handleLoadThread = async (threadId: number) => {
    try {
      const res = await fetch(`${apiBase}/api/agent/threads/${threadId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setActiveConversationId(threadId);
        if (data.history && data.history.length > 0) {
          const transformed = data.history.map((m: any, idx: number) => ({
            id: String(idx + 1),
            sender: m.sender === 'user' ? 'user' : 'sophia',
            text: m.text || m.content || '',
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(transformed);
        } else {
          setMessages([
            {
              id: '1',
              sender: 'sophia',
              text: "Hello! I am Sophia, your AI resident assistant. I can help you understand your invoices, submit maintenance requests, check your due balance, and more. How can I help you today?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  const handleDeleteThread = async (threadId: number) => {
    try {
      const res = await fetch(`${apiBase}/api/agent/threads/${threadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await loadThreadsList();
        if (activeConversationId === threadId) {
          await handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const handleStopResponse = () => {
    if (socket) {
      socket.emit('sophia-stop');
    }
    setIsTyping(false);
  };

  useEffect(() => {
    const s = io(`${apiBase}/events`, {
      withCredentials: true,
      transports: ['websocket'],
      forceNew: true,
    });

    s.on('connect', () => {
      console.log('Connected to Sophia socket in tenant portal');
    });

    s.on('sophia-token', (data: { text: string }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === 'sophia' && last.isDrafting) {
          const currentBlocks = last.blocks ? [...last.blocks] : [];
          if (currentBlocks.length === 0 && last.text) {
            currentBlocks.push({ type: 'text', text: last.text });
          }
          const lastBlock = currentBlocks[currentBlocks.length - 1];
          if (lastBlock && lastBlock.type === 'text') {
            currentBlocks[currentBlocks.length - 1] = {
              ...lastBlock,
              text: (lastBlock.text || '') + data.text
            };
          } else {
            currentBlocks.push({ type: 'text', text: data.text });
          }

          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            text: last.text + data.text,
            blocks: currentBlocks
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: String(Date.now()),
              sender: 'sophia',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isDrafting: true,
              blocks: [{ type: 'text', text: data.text }]
            }
          ];
        }
      });
    });

    s.on('sophia-status', (payload: { status: string; message: string }) => {
      if (payload.status === 'idle' || payload.status === 'error') {
        setIsTyping(false);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === 'sophia' && last.isDrafting) {
            last.isDrafting = false;
          }
          return updated;
        });
        loadThreadsList(); // Reload thread list to get up-to-date titles/previews
      }
    });

    s.on('sophia-action-start', (data: { id: string; name: string; details?: string; timestamp: string }) => {
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia') {
          const currentBlocks = lastMsg.blocks ? [...lastMsg.blocks] : [];
          if (currentBlocks.length === 0 && lastMsg.text) {
            currentBlocks.push({ type: 'text', text: lastMsg.text });
          }

          if (!currentBlocks.some(b => b.type === 'action' && b.actionId === data.id)) {
            currentBlocks.push({
              type: 'action',
              actionId: data.id,
              actionName: data.name,
              actionStatus: 'pending' as const,
              actionDetails: data.details,
              actionTimestamp: data.timestamp
            });
          }

          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              blocks: currentBlocks
            }
          ];
        }
        return prev;
      });
    });

    s.on('sophia-action-end', (data: { id: string; status: 'completed' | 'failed' }) => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg.sender === 'sophia') {
            const hasActionInBlocks = msg.blocks?.some(b => b.type === 'action' && b.actionId === data.id);
            if (hasActionInBlocks) {
              const updatedBlocks = msg.blocks?.map(block => {
                if (block.type === 'action' && block.actionId === data.id) {
                  return {
                    ...block,
                    actionStatus: data.status
                  };
                }
                return block;
              }) || [];

              return {
                ...msg,
                blocks: updatedBlocks
              };
            }
          }
          return msg;
        })
      );
    });

    s.on('sophia-token-metrics', (data: { successCount: number; failureCount: number }) => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia') {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              successCount: data.successCount,
              failureCount: data.failureCount
            }
          ];
        }
        return prev;
      });
    });

    s.on('sophia-token-reset', () => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setIsTyping(true);
    });

    s.on('sophia-error', (payload: { message: string }) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'sophia',
          text: `Error: ${payload.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    });

    setSocket(s);
    loadThreadsList().then((list) => {
      if (list && list.length > 0) {
        // Load the most recent conversation by default
        handleLoadThread(list[0].id);
      } else {
        handleNewChat();
      }
    });

    return () => {
      s.off('connect');
      s.off('sophia-token');
      s.off('sophia-token-reset');
      s.off('sophia-status');
      s.off('sophia-action-start');
      s.off('sophia-action-end');
      s.off('sophia-token-metrics');
      s.off('sophia-error');
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    socket.emit('sophia-message', {
      message: input,
      conversationId: activeConversationId || undefined
    });

    setInput('');
  };

  return (
    <div className="flex h-full gap-4 p-4 md:p-6 animate-fade-in relative bg-paper-50 dark:bg-ink-950">
      
      {/* Dynamic Collapsible Sidebar for Chat History */}
      {isSidebarOpen && (
        <div className="w-72 shrink-0 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-sm flex flex-col overflow-hidden animate-fade-in-right">
          <div className="p-4 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center gap-2">
            <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-coral-500" />
              Chat History
            </h2>
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg border border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 hover:bg-paper-100 dark:hover:bg-ink-800 text-coral-500 transition-colors shadow-sm flex items-center justify-center"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
            {threads.length === 0 ? (
              <div className="text-center py-8 text-xs text-paper-400 dark:text-ink-500">
                No conversation history.
              </div>
            ) : (
              threads.map((thread) => {
                const isActive = activeConversationId === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleLoadThread(thread.id)}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-coral-50/50 dark:bg-coral-500/10 border-coral-200 dark:border-coral-500/25 text-coral-600 dark:text-coral-400'
                        : 'bg-transparent border-transparent hover:bg-paper-50 dark:hover:bg-ink-950/50 text-paper-700 dark:text-ink-300'
                    }`}
                  >
                    <div className="flex flex-col items-start text-left gap-0.5 overflow-hidden flex-1">
                      <span className="text-xs font-semibold truncate w-full">
                        {thread.title || `Chat #${thread.id}`}
                      </span>
                      <span className="text-[10px] text-paper-400 dark:text-ink-500">
                        {new Date(thread.updatedAt || thread.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-paper-400 hover:text-red-500 transition-all"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-paper-200 dark:border-ink-800 flex items-center justify-between px-6 gap-3 shrink-0 bg-coral-50/50 dark:bg-ink-900/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg border border-paper-200 dark:border-ink-800 text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
              title={isSidebarOpen ? "Hide History" : "Show History"}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-coral-500 flex items-center justify-center text-white shadow-md relative overflow-hidden">
              <Sparkles className="w-5 h-5 relative z-10 animate-spin-slow" />
              <div className="absolute inset-0 bg-gradient-to-tr from-coral-600 to-coral-400 opacity-50" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-paper-900 dark:text-white leading-tight">Sophia AI</h1>
              <p className="text-[10px] font-medium text-coral-600 dark:text-coral-400">Your Resident Assistant</p>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-paper-700 dark:text-ink-300 hover:bg-paper-50 dark:hover:bg-ink-900 hover:text-coral-500 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((msg, idx) => {
            const isSophia = msg.sender === 'sophia';
            return (
              <div key={msg.id || idx} className={`flex ${isSophia ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isSophia ? 'flex-row' : 'flex-row-reverse'}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 shadow-sm ${isSophia ? 'bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-500/30' : 'bg-paper-200 dark:bg-ink-800 text-paper-600 dark:text-ink-300 border border-paper-300 dark:border-ink-700'}`}>
                    {isSophia ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-bold text-paper-900 dark:text-white">{isSophia ? 'Sophia' : 'You'}</span>
                      <span className="text-[9px] text-paper-400 dark:text-ink-500">{msg.timestamp}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${isSophia ? 'bg-white dark:bg-ink-800 text-paper-800 dark:text-ink-100 border border-paper-200 dark:border-ink-700 rounded-tl-sm' : 'bg-coral-500 text-white rounded-tr-sm'}`}>
                      {isSophia ? (
                        <div className="space-y-3">
                          {/* Tool Execution Badge */}
                          {msg.blocks && msg.blocks.some(b => b.type === 'action') && (
                            (() => {
                              const actionBlocks = msg.blocks.filter(b => b.type === 'action');
                              const isAnyFailed = actionBlocks.some(b => b.actionStatus === 'failed');
                              const isAnyPending = actionBlocks.some(b => b.actionStatus === 'pending');
                              const isAllCompleted = actionBlocks.every(b => b.actionStatus === 'completed');

                              let badgeColorClass = 'text-amber-600 dark:text-amber-450 bg-amber-500/5 border-amber-500/10';
                              let statusIcon = <Wrench className="w-3 h-3 animate-pulse" />;
                              let statusText = isAnyPending
                                ? (actionBlocks.length > 1 ? `Checking with tools (${actionBlocks.length})...` : 'Checking with tool...')
                                : (actionBlocks.length > 1 ? `Tools used (${actionBlocks.length})` : 'Tool used');

                              if (isAnyFailed) {
                                badgeColorClass = 'text-red-500 bg-red-500/5 border-red-500/15';
                                statusIcon = <AlertTriangle className="w-3 h-3 text-red-500 animate-bounce" />;
                                statusText = `Tool call failed!`;
                              } else if (isAllCompleted) {
                                badgeColorClass = 'text-emerald-600 dark:text-emerald-450 bg-emerald-500/5 border-emerald-500/10';
                                statusIcon = <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
                              }

                              return (
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold font-mono tracking-wider shadow-sm uppercase ${badgeColorClass}`}>
                                  {statusIcon}
                                  <span>{statusText}</span>
                                </div>
                              );
                            })()
                          )}

                          {msg.blocks && msg.blocks.length > 0 ? (
                            msg.blocks.map((block, bIdx) => {
                              if (block.type === 'text') {
                                return <FormattedMessage key={bIdx} text={block.text || ''} />;
                              }
                              if (block.type === 'action' && block.actionStatus === 'failed') {
                                return (
                                  <div key={bIdx} className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-red-650 dark:text-red-400 font-medium flex items-start gap-2 shadow-sm animate-fade-in">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-bold uppercase tracking-wider text-[9px] text-red-500 font-mono mb-0.5">Tool execution failed</div>
                                      <span className="font-mono bg-red-500/10 px-1 py-0.5 rounded text-[10px]">{block.actionName}</span>
                                      {block.actionDetails && (
                                        <p className="mt-1.5 opacity-90 text-[11px] font-sans leading-relaxed">{block.actionDetails}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <FormattedMessage text={msg.text} />
                          )}
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                      )}
                      {msg.isDrafting && <span className="inline-block w-1.5 h-4 mt-1.5 bg-coral-400 animate-pulse align-middle" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && !messages[messages.length - 1]?.isDrafting && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex gap-3 max-w-[85%] md:max-w-[70%]">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-500/30">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-paper-900 dark:text-white">Sophia</span>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-tl-sm flex items-center gap-2 h-11">
                    <Loader2 className="w-4 h-4 animate-spin text-coral-500" />
                    <span className="text-xs text-paper-500 dark:text-ink-400 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-ink-900 border-t border-paper-200 dark:border-ink-800 flex flex-col gap-3">
          
          {/* Action indicator when generating responses */}
          {isTyping && (
            <div className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 px-3 py-1.5 rounded-lg border border-paper-200 dark:border-ink-800 animate-fade-in">
              <span className="text-xs text-paper-500 dark:text-ink-400 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-coral-500" />
                Sophia is writing a response...
              </span>
              <button
                onClick={handleStopResponse}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all flex items-center gap-1 border border-red-500/20"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop
              </button>
            </div>
          )}

          <div className="relative flex items-center bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl focus-within:border-coral-500/50 focus-within:ring-2 focus-within:ring-coral-500/20 transition-all shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask Sophia anything about your tenancy..."
              className="w-full bg-transparent border-none px-4 py-3.5 text-sm text-paper-900 dark:text-white placeholder-paper-400 focus:outline-none focus:ring-0"
              disabled={isTyping}
            />
            <div className="pr-2 flex items-center">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-lg bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-paper-400 dark:text-ink-500 font-medium tracking-wide">AI-Generated responses. Sophia may make mistakes.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
