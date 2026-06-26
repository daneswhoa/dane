'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Building,
  FileSpreadsheet,
  TrendingUp,
  Send,
  Paperclip,
  Mic,
  ArrowUpRight,
  CheckCircle2,
  Users,
  Settings,
  Shield,
  FileText,
  MessageSquare,
  Wrench,
  AlertTriangle,
  Play,
  Plus,
  History
} from 'lucide-react';
import { io } from 'socket.io-client';
import ErrorModal from './ErrorModal';

interface Message {
  id: string;
  sender: 'sophia' | 'user';
  text: string;
  timestamp: string;
  widget?: React.ReactNode;
  isDrafting?: boolean;
  successCount?: number;
  failureCount?: number;
  actions?: ActionQueueItem[];
}

interface ActionQueueItem {
  id: string;
  name: string;
  details?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export default function SophiaTab() {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Sophia is ready');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalStack, setModalStack] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [actionsQueue, setActionsQueue] = useState<ActionQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadThreadsList = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/agent/threads', { credentials: 'include' });
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
      const res = await fetch('http://localhost:4000/api/agent/threads', {
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
            text: "Hello! I am Sophia, your virtual property administrator. I can assist you with property batch creation, automated tenant billing, contractor marketplace jobs, and beautiful template email campaigns. How can I help you manage your portfolio today?",
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
      const res = await fetch(`http://localhost:4000/api/agent/threads/${threadId}`, { credentials: 'include' });
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
              text: "Hello! I am Sophia, your virtual property administrator. I can assist you with property batch creation, automated tenant billing, contractor marketplace jobs, and beautiful template email campaigns. How can I help you manage your portfolio today?",
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
      const res = await fetch(`http://localhost:4000/api/agent/threads/${threadId}`, {
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

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:4000/api/properties/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.success && data.photoUrl) {
        setUploadedImageUrl(data.photoUrl);
      } else {
        throw new Error('Server returned unsuccessful upload');
      }
    } catch (err: any) {
      setModalTitle('Upload Error');
      setModalMessage(err.message || 'Failed to upload the cover photo.');
      setModalStack('Code: FILE_UPLOAD_FAIL\nStatus: Error returned by upload controller.');
      setModalOpen(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        await handleUploadFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await handleUploadFile(file);
      }
    }
  };

  // Initial greeting
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'sophia',
      text: "Hello! I am Sophia, your virtual property administrator. I can assist you with property batch creation, automated tenant billing, contractor marketplace jobs, and beautiful template email campaigns. How can I help you manage your portfolio today?",
      timestamp: '09:00 AM'
    }
  ]);

  // Connect to WebSockets events gateway
  useEffect(() => {
    const socketClient = io('http://localhost:4000/events', {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socketClient);

    socketClient.on('sophia-thread-sync', (data: { conversationId: number }) => {
      setActiveConversationId(data.conversationId);
      loadThreadsList();
    });

    socketClient.on('sophia-status', (data: { status: string; message: string }) => {
      if (data.status === 'thinking' || data.status === 'tool') {
        setIsTyping(true);
        setStatusMessage(data.message);
      } else {
        setIsTyping(false);
        setStatusMessage('Ready');
      }
    });

    socketClient.on('sophia-token', (data: { text: string }) => {
      setIsTyping(false);
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia' && !lastMsg.isDrafting) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              text: lastMsg.text + data.text
            }
          ];
        } else {
          return [
            ...prev,
            {
              id: 'sophia-' + Date.now(),
              sender: 'sophia',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
      });
    });

    socketClient.on('sophia-token-metrics', (data: { successCount: number; failureCount: number }) => {
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

    socketClient.on('sophia-action-start', (data: { id: string; name: string; details?: string; timestamp: string }) => {
      setActionsQueue(prev => [
        {
          id: data.id,
          name: data.name,
          details: data.details,
          status: 'pending',
          timestamp: data.timestamp
        },
        ...prev
      ]);

      setMessages(prev => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia') {
          const currentActions = lastMsg.actions || [];
          if (currentActions.some(act => act.id === data.id)) return prev;
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              actions: [
                ...currentActions,
                {
                  id: data.id,
                  name: data.name,
                  details: data.details,
                  status: 'pending',
                  timestamp: data.timestamp
                }
              ]
            }
          ];
        }
        return prev;
      });
    });

    socketClient.on('sophia-action-end', (data: { id: string; status: 'completed' | 'failed' }) => {
      setActionsQueue(prev =>
        prev.map(act => act.id === data.id ? { ...act, status: data.status } : act)
      );

      setMessages(prev =>
        prev.map(msg => {
          if (msg.sender === 'sophia' && msg.actions && msg.actions.some(act => act.id === data.id)) {
            return {
              ...msg,
              actions: msg.actions.map(act => act.id === data.id ? { ...act, status: data.status } : act)
            };
          }
          return msg;
        })
      );
    });

    socketClient.on('sophia-widget', (widgetData: { type: string; data: any; title?: string; content?: string }) => {
      let customWidget: React.ReactNode;

      if (widgetData.type === 'portfolio') {
        const metrics = widgetData.data;
        customWidget = (
          <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
            <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Portfolio Summary</div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-paper-500">Properties:</span>
                <span className="font-semibold text-paper-900 dark:text-white">{metrics.totalProperties}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paper-500">Total Units:</span>
                <span className="font-semibold text-paper-900 dark:text-white">{metrics.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paper-500">Occupancy:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{metrics.occupancyRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paper-500">Arrears:</span>
                <span className="font-semibold text-amber-500">€{metrics.outstandingArrears}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paper-500">Active Tickets:</span>
                <span className="font-semibold text-coral-500">{metrics.activeTickets}</span>
              </div>
            </div>
          </div>
        );
      } else if (widgetData.type === 'finances') {
        const finances = widgetData.data;
        customWidget = (
          <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
            <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Company Balance Sheet</div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-paper-500">Gross Rent Collected:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">€{finances.grossCollections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-paper-500">Upkeep Expenses:</span>
                <span className="font-semibold text-coral-600 dark:text-coral-400">-€{finances.totalExpenses}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-paper-200 dark:border-ink-700 pt-1.5">
                <span className="text-paper-900 dark:text-white">Net Income:</span>
                <span className={finances.netOperatingIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-coral-500"}>
                  €{finances.netOperatingIncome}
                </span>
              </div>
            </div>
          </div>
        );
      } else if (widgetData.type === 'notifications') {
        const notes = widgetData.data || [];
        customWidget = (
          <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
            <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Notifications Log ({notes.length})</div>
            {notes.length === 0 ? (
              <p className="text-[10px] text-paper-400 italic">No notifications found.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {notes.map((n: any) => (
                  <div key={n.id} className="border-b border-paper-100 dark:border-ink-800 pb-1.5 last:border-none">
                    <p className="text-[11px] font-bold text-paper-800 dark:text-white">{n.title}</p>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 leading-tight mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      } else if (widgetData.type === 'ticket') {
        const tk = widgetData.data;
        customWidget = (
          <div className="mt-3 border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 rounded-lg p-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-paper-900 dark:text-emerald-100">Ticket Created</h4>
              <p className="text-[10px] text-paper-550 dark:text-ink-400">ID: {tk.ticketId} • {tk.message}</p>
            </div>
          </div>
        );
      } else if (widgetData.type === 'contractors') {
        const contractors = widgetData.data || [];
        customWidget = (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-paper-900 dark:text-white mb-1">Marketplace Contractors</div>
            {contractors.length === 0 ? (
              <p className="text-[10px] text-paper-400 italic">No matching contractors found.</p>
            ) : (
              contractors.map((c: any) => (
                <div key={c.id} className="bg-paper-50 dark:bg-ink-900/80 border border-paper-200 dark:border-ink-700 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-paper-900 dark:text-white">{c.name}</h4>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Rate: €{c.hourlyRate}/hr • {c.specialty}</p>
                  </div>
                  <button 
                    onClick={() => handleSendMessage(`Bookmark contractor ID ${c.id}`)}
                    className="px-2 py-1 bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-[10px] font-medium rounded hover:bg-paper-300"
                  >
                    Bookmark
                  </button>
                </div>
              ))
            )}
          </div>
        );
      } else if (widgetData.type === 'invoices') {
        const invoices = widgetData.data || [];
        customWidget = (
          <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
            <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Recent Invoices</div>
            {invoices.length === 0 ? (
              <p className="text-[10px] text-paper-400 italic">No invoices found.</p>
            ) : (
              <div className="space-y-1.5 text-[10px] font-mono">
                {invoices.slice(0, 5).map((inv: any) => (
                  <div key={inv.id} className="flex justify-between border-b border-paper-100 dark:border-ink-850 pb-1 last:border-none">
                    <span>{inv.invoiceNumber}</span>
                    <span className={inv.status === 'paid' ? "text-emerald-500" : "text-amber-500 font-bold"}>
                      €{inv.amount} ({inv.status})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      if (customWidget) {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.sender === 'sophia') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                widget: customWidget
              }
            ];
          }
          return prev;
        });
      }
    });

    socketClient.on('sophia-error', (err: { message: string }) => {
      setModalTitle('Sophia Operational Block');
      setModalMessage(err.message || 'Sophia failed to process this step.');
      setModalStack('Code: SOCKET_GATEWAY_FAIL\nStatus: Error thrown by orchestrator loop.');
      setModalOpen(true);
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    const initThreads = async () => {
      const list = await loadThreadsList();
      if (list.length > 0) {
        const mostRecent = list[list.length - 1];
        await handleLoadThread(mostRecent.id);
      } else {
        await handleNewChat();
      }
    };
    initThreads();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() && !uploadedImageUrl) return;

    let fullText = text;
    if (uploadedImageUrl) {
      fullText = text.trim() 
        ? `${text.trim()}\n[Attached Image: ${uploadedImageUrl}]` 
        : `[Attached Image: ${uploadedImageUrl}]`;
    }

    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: fullText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setUploadedImageUrl(null);
    setIsTyping(true);

    if (socket) {
      const historyStr = localStorage.getItem('sophia_navigation_history') || '[]';
      socket.emit('sophia-message', {
        message: fullText,
        conversationId: activeConversationId || undefined,
        navigationHistory: JSON.parse(historyStr)
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  return (
    <div 
      className="flex-1 flex overflow-hidden z-10 w-full h-[calc(100vh-3.5rem)] relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-10 pointer-events-none"></div>

      {/* Chat History Panel (Drawer on the left of chat view) */}
      {isHistoryOpen && (
        <div className="w-64 bg-white/95 dark:bg-ink-950/95 backdrop-blur-md border-r border-paper-200/50 dark:border-ink-800/50 flex flex-col h-full z-20 relative animate-slide-in">
          <div className="p-4 border-b border-paper-200/50 dark:border-ink-800/50 bg-white/80 dark:bg-ink-900/80 flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-paper-900 dark:text-white flex items-center gap-1.5 font-mono">
              <History className="w-3.5 h-3.5 text-coral-500" /> Chat History
            </h3>
            <button 
              onClick={() => setIsHistoryOpen(false)}
              className="text-[10px] text-paper-400 hover:text-paper-600 font-mono"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {threads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[10px] text-paper-400 italic">No past chats found.</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div 
                  key={thread.id}
                  onClick={() => handleLoadThread(thread.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left flex justify-between items-center group ${
                    activeConversationId === thread.id
                      ? 'bg-coral-500/10 border-coral-500/30 text-coral-600 dark:text-coral-400 font-medium'
                      : 'bg-paper-50/50 dark:bg-ink-900/40 border-paper-200/50 dark:border-ink-800/50 text-paper-700 dark:text-ink-200 hover:bg-paper-100/50 dark:hover:bg-ink-800/50'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[10px] font-mono truncate leading-tight">{thread.title}</p>
                    <span className="text-[8px] text-paper-400 dark:text-ink-500">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded text-[9px] transition-all font-bold font-mono"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-paper-200/50 dark:border-ink-800/50 h-full relative">
        {/* Chat Header */}
        <div className="p-3 px-4 border-b border-paper-200/50 dark:border-ink-800/50 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-semibold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Sophia AI Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleNewChat}
              className="px-2 py-1 rounded bg-coral-500/10 text-coral-500 hover:bg-coral-500/20 text-[9px] font-bold font-mono transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> NEW CHAT
            </button>
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`p-1.5 rounded hover:bg-paper-100 dark:hover:bg-ink-800 transition-all ${isHistoryOpen ? 'text-coral-500 bg-coral-500/5' : 'text-paper-500 dark:text-ink-300'}`}
              title="Chat History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Drag Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-coral-500/20 dark:bg-coral-500/10 backdrop-blur-sm border-2 border-dashed border-coral-500 rounded-xl z-50 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
            <div className="bg-white dark:bg-ink-850 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-coral-100 dark:bg-coral-950/40 flex items-center justify-center text-coral-600 dark:text-coral-400">
                <Paperclip className="w-6 h-6 animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-paper-900 dark:text-white">Drop property photo to upload</p>
              <p className="text-xs text-paper-400">Supports JPEG, PNG, WEBP</p>
            </div>
          </div>
        )}

        {/* Chat Scroll Area (Flexible content fills space naturally) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col scroll-smooth">
          <div className="flex flex-col items-center justify-center py-10 opacity-90">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-lg shadow-coral-500/20 mb-4 animate-[float_3s_ease-in-out_infinite]">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-paper-900 dark:text-white mb-1.5">Sophia Workspace</h1>
            <p className="text-paper-600 dark:text-ink-300 text-center max-w-md text-xs leading-relaxed">
              System status: <span className="text-emerald-500 font-semibold">{statusMessage}</span>
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span className="text-[9px] uppercase font-semibold tracking-widest text-paper-400 dark:text-ink-500 bg-paper-100 dark:bg-ink-850 px-3 py-1 rounded-full border border-paper-200 dark:border-ink-700/50">Conversations</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end justify-end' : ''
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
                  <FormattedMessage text={msg.text} />

                  {/* Visual Stepper for Sophia multi-step executions */}
                  {msg.sender === 'sophia' && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3.5 border border-paper-200/50 dark:border-ink-750 bg-paper-50/60 dark:bg-ink-950/40 rounded-xl p-3.5 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between border-b border-paper-200/40 dark:border-ink-800/80 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-paper-600 dark:text-ink-400 font-mono flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-coral-500 animate-spin-slow" /> Steps Run
                        </span>
                        <span className="text-[9px] font-mono text-paper-400">
                          {msg.actions.filter(a => a.status === 'completed').length}/{msg.actions.length} Completed
                        </span>
                      </div>
                      
                      <div className="relative pl-4 space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-paper-200 dark:before:bg-ink-850">
                        {msg.actions.map((act, stepIdx) => {
                          const isPending = act.status === 'pending';
                          const isFailed = act.status === 'failed';
                          const isCompleted = act.status === 'completed';

                          return (
                            <div key={act.id} className="relative group text-left animate-fade-in">
                              {/* Step Node dot */}
                              <div className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                isPending
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)] animate-pulse'
                                  : isFailed
                                  ? 'bg-red-500/10 border-red-500 text-red-550 dark:text-red-400'
                                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                              }`}>
                                {isPending ? (
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                ) : isFailed ? (
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                ) : (
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                )}
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                  <span className={`text-[11px] font-bold font-mono ${
                                    isPending ? 'text-amber-600 dark:text-amber-500' : isFailed ? 'text-red-550 dark:text-red-400' : 'text-paper-900 dark:text-white'
                                  }`}>
                                    {act.name}
                                  </span>
                                  <span className="text-[8px] text-paper-400 font-mono">{act.timestamp}</span>
                                </div>
                                {act.details && (
                                  <p className="text-[9px] text-paper-550 dark:text-ink-400 font-mono mt-0.5 break-all max-w-full leading-relaxed">
                                    {act.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {msg.widget && msg.widget}
                </div>

                {/* Execution Metrics logs beneath every message block */}
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
                  
                  {/* Active Subagents Working Dots */}
                  {actionsQueue.filter(act => act.status === 'pending').length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-paper-100 dark:border-ink-700/50">
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
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area (Natural flex block at the bottom, no overlaps!) */}
        <div className="p-4 border-t border-paper-200/50 dark:border-ink-800/50 bg-paper-50 dark:bg-ink-900 pb-6 z-20">
          {/* Smart Suggestions */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar px-1 max-w-4xl mx-auto">
            <button 
              onClick={() => handleSendMessage("Show my portfolio metrics summary")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:border-coral-300 dark:hover:border-coral-500/50 hover:text-coral-600 dark:hover:text-coral-400 active:scale-95 transition-all whitespace-nowrap shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> View Portfolio Summary
            </button>
            <button 
              onClick={() => handleSendMessage("Calculate: 2500 * 12 - (450 * 6)")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:border-coral-300 dark:hover:border-coral-500/50 hover:text-coral-600 dark:hover:text-coral-400 active:scale-95 transition-all whitespace-nowrap shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Lease Calculator
            </button>
            <button 
              onClick={() => handleSendMessage("Show donut-chart of property shares and table of arrears")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:border-coral-300 dark:hover:border-coral-500/50 hover:text-coral-600 dark:hover:text-coral-400 active:scale-95 transition-all whitespace-nowrap shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-500" /> Analyze Rent Shares
            </button>
          </div>

          {/* Upload Status / Image Preview */}
          {(isUploading || uploadedImageUrl) && (
            <div className="max-w-4xl mx-auto mb-3 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                {isUploading ? (
                  <div className="w-10 h-10 rounded bg-paper-100 dark:bg-ink-900 flex items-center justify-center animate-pulse">
                    <span className="w-4 h-4 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <img src={uploadedImageUrl!} alt="Attached preview" className="w-10 h-10 object-cover rounded border border-paper-200 dark:border-ink-700" />
                )}
                <div>
                  <p className="text-xs font-semibold text-paper-900 dark:text-white">
                    {isUploading ? 'Uploading cover photo...' : 'Cover photo ready'}
                  </p>
                  <p className="text-[10px] text-paper-400 truncate max-w-[250px]">
                    {isUploading ? 'Sending file to secure server...' : uploadedImageUrl}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button 
                  onClick={() => setUploadedImageUrl(null)}
                  className="px-2.5 py-1 hover:bg-paper-100 dark:hover:bg-ink-900 text-coral-500 hover:text-coral-600 rounded text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Command Input Field */}
          <div className="relative rounded-xl bg-gradient-to-r from-coral-500 via-coral-400 to-coral-500 p-[1px] shadow-md shadow-coral-500/5 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-ink-800 flex items-center p-1.5 rounded-xl transition-all duration-300">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200 transition-all rounded-md"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sophia to analyze data, draft documents, or automate tasks..." 
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm px-2 text-paper-900 dark:text-white placeholder-paper-400 dark:placeholder-ink-500 font-sans"
              />
              <button className="p-2 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200 transition-all rounded-md mr-1">
                <Mic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleSendMessage(inputValue)}
                className="p-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg hover:opacity-90 shadow-sm shadow-coral-500/20 active:scale-95 transition-all flex items-center justify-center group"
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
          <div className="text-center mt-2.5">
            <span className="text-[9px] text-paper-400 dark:text-ink-500 font-sans">Sophia AI operations are logged. Verification is recommended on financial actions.</span>
          </div>
        </div>
      </div>

      {/* Right Pane: Actions Queue Stream */}
      <div className="w-[300px] flex-shrink-0 bg-white/50 dark:bg-ink-950/50 backdrop-blur-md border-l border-paper-200/50 dark:border-ink-800/50 flex flex-col h-full z-10 relative">
        <div className="p-4 border-b border-paper-200/50 dark:border-ink-800/50 bg-white/80 dark:bg-ink-900/80 flex justify-between items-center sticky top-0 transition-all">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-paper-900 dark:text-white flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-coral-500" /> Actions Stream
          </h2>
          <span className="px-2 py-0.5 rounded bg-coral-500/10 text-coral-500 text-[9px] font-mono font-bold">Live</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {actionsQueue.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[10px] text-paper-450 dark:text-ink-500 italic">No tools currently in execution queue.</p>
            </div>
          ) : (
            actionsQueue.map((act) => (
              <div 
                key={act.id} 
                className={`p-3 rounded-xl border transition-all text-xs font-mono ${
                  act.status === 'pending'
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                    : act.status === 'failed'
                    ? 'bg-red-500/5 border-red-500/20 text-red-550 dark:text-red-400'
                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold truncate text-[10px]">{act.name}</span>
                  <span className="text-[9px] text-paper-400">{act.timestamp}</span>
                </div>
                <p className="text-[9px] text-paper-500 dark:text-ink-400 truncate max-w-full mb-2">
                  {act.details || 'Invoking handler...'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold tracking-widest">
                    {act.status}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 flex items-center justify-center">
                    {act.status === 'pending' ? (
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    ) : act.status === 'failed' ? (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ErrorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        callStack={modalStack}
      />
    </div>
  );
}

// Chart Components
interface DonutData {
  label: string;
  value: number;
  color?: string;
}

function DonutChart({ data }: { data: DonutData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let accumulatedPercent = 0;
  const colors = ['#FF5A5F', '#3182CE', '#38A169', '#ECC94B', '#805AD5'];

  return (
    <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-3 flex items-center gap-4 my-2 max-w-sm">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="3" />
          {data.map((item, idx) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            const strokeDash = `${percent} ${100 - percent}`;
            const strokeOffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;
            const color = item.color || colors[idx % colors.length];

            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={color}
                strokeWidth="3.5"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 space-y-0.5">
        {data.map((item, idx) => {
          const color = item.color || colors[idx % colors.length];
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          return (
            <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-paper-700 dark:text-ink-200 truncate">{item.label}</span>
              </div>
              <span className="font-semibold text-paper-900 dark:text-white">{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LineData {
  label: string;
  value: number;
}

function LineChart({ data }: { data: LineData[] }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 10);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = maxVal - minVal || 10;

  const width = 240;
  const height = 80;
  const padding = 12;

  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-3 my-2 max-w-sm">
      <div className="relative w-full h-20">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />

          <path d={pathD} fill="none" stroke="#FF5A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill="#FFFFFF"
              stroke="#FF5A5F"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-paper-400 font-mono">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: any[][] }) {
  return (
    <div className="overflow-x-auto border border-paper-200 dark:border-ink-750 rounded-xl my-2 shadow-sm max-w-lg">
      <table className="min-w-full divide-y divide-paper-200 dark:divide-ink-750 text-left text-xs">
        <thead className="bg-paper-50 dark:bg-ink-850">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-paper-100 dark:divide-ink-800 bg-white dark:bg-ink-800">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-paper-50 dark:hover:bg-ink-750/50">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-1.5 text-paper-750 dark:text-ink-200 font-mono text-[10px]">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Inline Formatter Components
function FormattedMessage({ text }: { text: string }) {
  const regex = /(\[chart-donut:\s*[\s\S]*?\]|\[chart-line:\s*[\s\S]*?\]|\[table:\s*[\s\S]*?\]|\[Attached Image:\s*[\s\S]*?\])/g;
  const splitParts = text.split(regex);

  return (
    <div className="space-y-3">
      {splitParts.map((part, idx) => {
        if (part.startsWith('[chart-donut:')) {
          try {
            const jsonStr = part.replace('[chart-donut:', '').replace(/\]$/, '').trim();
            const data = JSON.parse(jsonStr);
            return <DonutChart key={idx} data={data} />;
          } catch (e) {
            return <p key={idx} className="text-xs text-red-500">Failed to parse donut chart.</p>;
          }
        }
        if (part.startsWith('[chart-line:')) {
          try {
            const jsonStr = part.replace('[chart-line:', '').replace(/\]$/, '').trim();
            const data = JSON.parse(jsonStr);
            return <LineChart key={idx} data={data} />;
          } catch (e) {
            return <p key={idx} className="text-xs text-red-500">Failed to parse line chart.</p>;
          }
        }
        if (part.startsWith('[table:')) {
          try {
            const jsonStr = part.replace('[table:', '').replace(/\]$/, '').trim();
            const data = JSON.parse(jsonStr);
            return <DataTable key={idx} columns={data.columns} rows={data.rows} />;
          } catch (e) {
            return <p key={idx} className="text-xs text-red-500">Failed to parse data table.</p>;
          }
        }
        if (part.startsWith('[Attached Image:')) {
          const url = part.replace('[Attached Image:', '').replace(/\]$/, '').trim();
          return (
            <div key={idx} className="mt-2 rounded-xl overflow-hidden max-w-sm border border-paper-200 dark:border-ink-700 shadow-md transition-all hover:opacity-95">
              <img src={url} alt="User Uploaded Attached" className="max-h-48 w-full object-cover" />
            </div>
          );
        }

        return <FormattedText key={idx} text={part} />;
      })}
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h4 key={idx} className="text-xs font-bold text-coral-500 mt-2">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} className="text-sm font-bold text-coral-500 mt-3">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-2 text-xs">
              <span className="text-coral-500 mt-0.5">•</span>
              <span>{parseInlineMarkdown(line.replace('- ', ''))}</span>
            </div>
          );
        }
        return <p key={idx} className="text-xs leading-relaxed">{parseInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function parseInlineMarkdown(text: string) {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const matches = text.split(regex);
  
  return matches.map((match, i) => {
    if (match.startsWith('**') && match.endsWith('**')) {
      return <strong key={i} className="font-bold text-coral-600 dark:text-coral-400">{match.slice(2, -2)}</strong>;
    }
    if (match.startsWith('*') && match.endsWith('*')) {
      return <em key={i} className="italic text-paper-700 dark:text-ink-200">{match.slice(1, -1)}</em>;
    }
    if (match.startsWith('`') && match.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-paper-100 dark:bg-ink-900 font-mono text-[11px] text-pink-500">{match.slice(1, -1)}</code>;
    }
    return match;
  });
}
