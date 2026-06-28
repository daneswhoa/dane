'use client';

import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import ErrorModal from './ErrorModal';
import { SophiaChatHistory } from './sophia/SophiaChatHistory';
import { SophiaSavedInfo } from './sophia/SophiaSavedInfo';
import SophiaMessageList from './sophia/SophiaMessageList';
import SophiaInputArea from './sophia/SophiaInputArea';

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
  actions?: ActionQueueItem[];
  audioBase64?: string;
  audioMimeType?: string;
  duration?: number;
  blocks?: ContentBlock[];
}

interface ActionQueueItem {
  id: string;
  name: string;
  details?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SophiaTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'sophia',
      text: "Hello! I am Sophia, your virtual property administrator. I can assist you with property batch creation, automated tenant billing, contractor marketplace jobs, and email templates. How can I help you manage your portfolio today?",
      timestamp: '09:00 AM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Sophia is ready');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalStack, setModalStack] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [actionsQueue, setActionsQueue] = useState<ActionQueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedInfoOpen, setIsSavedInfoOpen] = useState(false);
  const [liveStep, setLiveStep] = useState(0);

  const activePropertyCreation = actionsQueue.find(
    (act) => act.name === 'createBarebonesProperty' && act.status === 'pending'
  );

  const activePropertySetup = actionsQueue.find(
    (act) => act.name === 'setupOrUpdatePropertyAndUnits' && act.status === 'pending'
  );

  const isPipelineActive = !!activePropertyCreation || !!activePropertySetup;

  useEffect(() => {
    let interval: any;
    if (isPipelineActive) {
      setLiveStep(0);
      interval = setInterval(() => {
        setLiveStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 600);
    } else {
      setLiveStep(0);
    }
    return () => clearInterval(interval);
  }, [isPipelineActive]);

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
            text: "Hello! I am Sophia, your virtual property administrator. I can assist you with property batch creation, automated tenant billing, contractor marketplace jobs, and email templates. How can I help you manage your portfolio today?",
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
            audioBase64: m.audioBase64,
            audioMimeType: m.audioMimeType,
            duration: m.duration,
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(transformed);
        } else {
          setMessages([
            {
              id: '1',
              sender: 'sophia',
              text: "Hello! I am Sophia, your virtual property administrator. I can assist you with property batch creation, automated tenant billing, contractor marketplace jobs, and email templates. How can I help you manage your portfolio today?",
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

  const handleSendMessage = (
    text: string, 
    audioData?: { base64Data: string; mimeType: string; duration: number }, 
    photoUrl?: string
  ) => {
    if (isSending || isTyping) return;

    let fullText = text;
    if (photoUrl) {
      fullText = text.trim() 
        ? `${text.trim()}\n[Attached Image: ${photoUrl}]` 
        : `[Attached Image: ${photoUrl}]`;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: audioData ? '' : fullText,
      timestamp,
      audioBase64: audioData?.base64Data,
      audioMimeType: audioData?.mimeType,
      duration: audioData?.duration
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setIsSending(true);

    if (socket) {
      const historyStr = localStorage.getItem('sophia_navigation_history') || '[]';
      if (audioData) {
        socket.emit('sophia-message', {
          message: '',
          audioData: {
            base64Data: audioData.base64Data,
            mimeType: audioData.mimeType
          },
          duration: audioData.duration,
          conversationId: activeConversationId || undefined,
          navigationHistory: JSON.parse(historyStr)
        });
      } else {
        socket.emit('sophia-message', {
          message: fullText,
          conversationId: activeConversationId || undefined,
          navigationHistory: JSON.parse(historyStr)
        });
      }
    }

    setTimeout(() => setIsSending(false), 1000);
  };

  const handleStopSophia = () => {
    if (socket) {
      socket.emit('sophia-stop');
    }
    setIsTyping(false);
    setIsSending(false);
    setStatusMessage('Interrupted');
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.sender === 'sophia') {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMsg,
            text: lastMsg.text + ' *(Sophia was interrupted)*'
          }
        ];
      }
      return prev;
    });
  };

  // Connect to WebSockets events gateway
  useEffect(() => {
    const socketUrl = apiBase + '/events';
    const socketClient = io(socketUrl, {
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
          const currentBlocks = lastMsg.blocks ? [...lastMsg.blocks] : [];
          if (currentBlocks.length === 0 && lastMsg.text) {
            currentBlocks.push({ type: 'text', text: lastMsg.text });
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

          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              text: lastMsg.text + data.text,
              blocks: currentBlocks
            }
          ];
        } else {
          return [
            ...prev,
            {
              id: 'sophia-' + Date.now(),
              sender: 'sophia',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              blocks: [{ type: 'text', text: data.text }]
            }
          ];
        }
      });
    });

    socketClient.on('sophia-token-reset', () => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setIsTyping(true);
      setStatusMessage('Re-checking with tools...');
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
          status: 'pending' as const,
          timestamp: data.timestamp
        },
        ...prev
      ]);

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

    socketClient.on('sophia-action-end', (data: { id: string; status: 'completed' | 'failed' }) => {
      setActionsQueue(prev =>
        prev.map(act => act.id === data.id ? { ...act, status: data.status } : act)
      );

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

    socketClient.on('sophia-widget', (widgetData: { type: string; data: any; title?: string; content?: string }) => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia') {
          const currentBlocks = lastMsg.blocks ? [...lastMsg.blocks] : [];
          if (currentBlocks.length === 0 && lastMsg.text) {
            currentBlocks.push({ type: 'text', text: lastMsg.text });
          }

          currentBlocks.push({
            type: 'widget',
            widgetData: widgetData
          });

          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              widgetData: widgetData,
              blocks: currentBlocks
            }
          ];
        }
        return prev;
      });
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex overflow-hidden z-10 w-full h-[calc(100vh-3.5rem)] relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-10 pointer-events-none"></div>

      <SophiaChatHistory
        isOpen={isHistoryOpen}
        threads={threads}
        activeConversationId={activeConversationId}
        onClose={() => setIsHistoryOpen(false)}
        onLoadThread={handleLoadThread}
        onDeleteThread={handleDeleteThread}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col min-w-0 border-r border-paper-200/50 dark:border-ink-800/50 h-full relative bg-paper-50/20 dark:bg-ink-950/10">
        <SophiaMessageList
          messages={messages}
          isTyping={isTyping}
          statusMessage={statusMessage}
          actionsQueue={actionsQueue}
          activePropertyCreation={!!activePropertyCreation}
          activePropertySetup={!!activePropertySetup}
          liveStep={liveStep}
          onSendMessage={handleSendMessage}
          chatEndRef={chatEndRef}
          isHistoryOpen={isHistoryOpen}
          setIsHistoryOpen={setIsHistoryOpen}
          setIsSavedInfoOpen={setIsSavedInfoOpen}
          onNewChat={handleNewChat}
        />

        <SophiaInputArea
          apiBase={apiBase}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onStopSophia={handleStopSophia}
          setErrorModal={(title, message, stack) => {
            setModalTitle(title);
            setModalMessage(message);
            setModalStack(stack);
            setModalOpen(true);
          }}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
        />
      </div>

      <SophiaSavedInfo
        isOpen={isSavedInfoOpen}
        onClose={() => setIsSavedInfoOpen(false)}
        apiBase={apiBase}
      />

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
