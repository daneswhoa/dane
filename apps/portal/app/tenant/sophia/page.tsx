'use client';

import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Message {
  id: string;
  sender: 'sophia' | 'user';
  text: string;
  timestamp: string;
  isDrafting?: boolean;
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
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io(apiBase, { withCredentials: true, path: '/socket.io' });

    s.on('connect', () => {
      console.log('Connected to Sophia socket in tenant portal');
    });

    s.on('sophia-token', (data: { text: string }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === 'sophia' && last.isDrafting) {
          const updated = [...prev];
          updated[updated.length - 1].text += data.text;
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
      }
    });

    setSocket(s);

    return () => {
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
      conversationId: undefined
    });

    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-paper-50 dark:bg-ink-950 p-4 md:p-6 animate-fade-in relative">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-paper-200 dark:border-ink-800 flex items-center px-6 gap-3 shrink-0 bg-coral-50/50 dark:bg-ink-900/50">
          <div className="w-10 h-10 rounded-full bg-coral-500 flex items-center justify-center text-white shadow-md relative overflow-hidden">
            <Sparkles className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-coral-600 to-coral-400 opacity-50" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-paper-900 dark:text-white leading-tight">Sophia AI</h1>
            <p className="text-[11px] font-medium text-coral-600 dark:text-coral-400">Your Resident Assistant</p>
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
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isSophia ? 'bg-white dark:bg-ink-800 text-paper-800 dark:text-ink-100 border border-paper-200 dark:border-ink-700 rounded-tl-sm' : 'bg-coral-500 text-white rounded-tr-sm'}`}>
                      {msg.text.split('\\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i !== msg.text.split('\\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                      {msg.isDrafting && <span className="inline-block w-1.5 h-4 ml-1 bg-coral-400 animate-pulse align-middle" />}
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
        <div className="p-4 bg-white dark:bg-ink-900 border-t border-paper-200 dark:border-ink-800">
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
