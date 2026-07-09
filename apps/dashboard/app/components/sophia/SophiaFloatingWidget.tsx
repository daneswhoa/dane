'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Sparkles, X, Minimize2, Wrench, Send, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormattedMessage } from './SophiaMessageFormatter';

interface Message {
  id: string;
  sender: 'sophia' | 'user';
  text: string;
  timestamp: string;
  isPending?: boolean;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SophiaFloatingWidget() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'sophia',
      text: "Hello! I am here in compact mode. How can I help you quickly?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  
  // Dragging states
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync visibility with custom event
  useEffect(() => {
    const handleToggle = (e: Event & { detail?: { visible: boolean } }) => {
      if (e.detail) {
        setIsVisible(e.detail.visible);
        if (e.detail.visible) {
          setIsMinimized(false);
        }
      }
    };
    window.addEventListener('toggle-sophia-widget', handleToggle as any);
    
    // Load last saved position/visibility state if any
    const savedPos = localStorage.getItem('sophia_widget_position');
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {}
    }
    
    const savedVisible = localStorage.getItem('sophia_widget_visible');
    if (savedVisible === 'true') {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('toggle-sophia-widget', handleToggle as any);
    };
  }, []);

  // Save visibility to localStorage
  useEffect(() => {
    localStorage.setItem('sophia_widget_visible', String(isVisible));
  }, [isVisible]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Connect to websocket when visible
  useEffect(() => {
    if (!isVisible) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = apiBase + '/events';
    const socketClient = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socketClient);

    socketClient.on('sophia-status', (data: { status: string; message: string }) => {
      setIsTyping(data.status === 'thinking' || data.status === 'tool');
    });

    socketClient.on('sophia-token', (data: { text: string }) => {
      setIsTyping(false);
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'sophia' && lastMsg.isPending) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              text: lastMsg.text + data.text,
              isPending: true
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
              isPending: true
            }
          ];
        }
      });
    });

    socketClient.on('sophia-status', (data: { status: string }) => {
      if (data.status === 'idle') {
        // Finalize pending message
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.sender === 'sophia' && lastMsg.isPending) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                isPending: false
              }
            ];
          }
          return prev;
        });
      }
    });

    socketClient.on('sophia-action', (action: { type: string; action?: string }) => {
      if (action.type === 'widget' && action.action) {
        if (action.action === 'show') {
          setIsVisible(true);
          setIsMinimized(false);
        } else if (action.action === 'hide') {
          setIsVisible(false);
        }
      }
    });

    return () => {
      socketClient.disconnect();
    };
  }, [isVisible]);

  // Dragging event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      const newPos = {
        x: dragRef.current.posX + deltaX,
        y: dragRef.current.posY + deltaY
      };
      
      setPosition(newPos);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem('sophia_widget_position', JSON.stringify(position));
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socket) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Retrieve active route information
    const currentTab = window.location.pathname.split('/').filter(Boolean)[0] || 'overview';
    const lastUIAction = localStorage.getItem('sophia_last_ui_action') || 'None';

    socket.emit('sophia-message', {
      message: inputValue.trim(),
      source: 'widget',
      currentTab,
      lastUIAction
    });

    setInputValue('');
  };

  if (!isVisible) return null;

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 9999,
      }}
      className={`w-80 transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-[420px]'
      } bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl border border-paper-200/50 dark:border-ink-800/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
    >
      {/* Header / Grab Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`p-3 bg-gradient-to-r from-coral-500/10 to-coral-650/10 border-b border-paper-200/40 dark:border-ink-800/40 flex items-center justify-between select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-coral-500/15 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-coral-600 dark:text-coral-400" />
          </div>
          <span className="text-xs font-bold text-paper-900 dark:text-white font-mono tracking-wider uppercase">Sophia Mini</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-paper-100 dark:hover:bg-ink-850 rounded text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-paper-100 dark:hover:bg-ink-850 rounded text-coral-500 hover:text-coral-600"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none bg-paper-50/10 dark:bg-ink-950/10">
            {messages.map((msg) => {
              const isSophia = msg.sender === 'sophia';
              return (
                <div key={msg.id} className={`flex ${isSophia ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs shadow-sm leading-relaxed ${
                      isSophia
                        ? 'bg-white dark:bg-ink-900 text-paper-800 dark:text-ink-200 border border-paper-200/50 dark:border-ink-800/50 rounded-tl-none'
                        : 'bg-coral-500 text-white rounded-tr-none'
                    }`}
                  >
                    <FormattedMessage text={msg.text} />
                    <span className={`text-[8px] mt-1 block text-right ${isSophia ? 'text-paper-400 dark:text-ink-500' : 'text-coral-200'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-ink-900 border border-paper-200/50 dark:border-ink-800/50 px-3 py-2 rounded-xl text-xs rounded-tl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-[bounce_0.8s_ease-in-out_infinite_200ms]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-[bounce_0.8s_ease-in-out_infinite_400ms]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick link to main tab if they want full widgets */}
          <div className="px-3 py-1.5 border-t border-paper-200/20 dark:border-ink-800/20 bg-paper-100/20 dark:bg-ink-900/10 flex items-center justify-between">
            <span className="text-[9px] text-paper-450 dark:text-ink-500">Need full view?</span>
            <button
              onClick={() => {
                router.push('/sophia');
                setIsMinimized(true);
              }}
              className="text-[9px] text-coral-600 dark:text-coral-400 font-bold hover:underline flex items-center gap-0.5"
            >
              Open main tab <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Input Panel */}
          <div className="p-2 border-t border-paper-200/40 dark:border-ink-800/40 bg-white dark:bg-ink-900">
            <div className="flex items-center gap-1 bg-paper-50 dark:bg-ink-950 p-1 rounded-xl border border-paper-200/50 dark:border-ink-800/50">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Sophia..."
                className="flex-1 bg-transparent text-xs px-2 py-1 focus:outline-none border-none text-paper-900 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`p-1.5 rounded-lg transition-all ${
                  inputValue.trim()
                    ? 'bg-coral-500 text-white hover:opacity-90 active:scale-95'
                    : 'text-paper-300 dark:text-ink-700 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
