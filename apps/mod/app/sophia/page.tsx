'use client';

import React, { useState } from 'react';
import ModLayout from '../components/ModLayout';
import { 
  Sparkles, Send, Bot, ShieldCheck, AlertTriangle, Play, RefreshCw, MessageSquare, Terminal, Eye
} from 'lucide-react';

interface AIJob {
  id: string;
  name: string;
  type: string;
  status: 'Running' | 'Idle' | 'Completed';
  lastRun: string;
  recordsAnalyzed: number;
  flagsFound: number;
}

interface AIChatMessage {
  sender: 'user' | 'sophia';
  text: string;
  time: string;
}

const INITIAL_JOBS: AIJob[] = [
  { id: 'JOB-01', name: 'Listing Fraud Detection', type: 'Image/Text Scan', status: 'Running', lastRun: '2026-07-08T00:10:00Z', recordsAnalyzed: 184, flagsFound: 2 },
  { id: 'JOB-02', name: 'Text Sentiment Auditing', type: 'NLP Message Review', status: 'Idle', lastRun: '2026-07-07T22:30:00Z', recordsAnalyzed: 940, flagsFound: 1 },
  { id: 'JOB-03', name: 'Image Safety Checks', type: 'Computer Vision Scan', status: 'Completed', lastRun: '2026-07-07T18:45:00Z', recordsAnalyzed: 342, flagsFound: 0 }
];

const INITIAL_CHAT: AIChatMessage[] = [
  { sender: 'sophia', text: 'Jambo! I am Sophia, your automated moderation partner. I monitor platform listings, check compliance anomalies, and flag risk patterns. What can I help you audit today?', time: '00:30' }
];

export default function SophiaAIPage() {
  const [jobs, setJobs] = useState<AIJob[]>(INITIAL_JOBS);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(INITIAL_CHAT);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: AIChatMessage = {
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response based on query
    setTimeout(() => {
      let replyText = "I have checked my records. Could you clarify which property or unit ID you are referring to?";
      const lower = inputMessage.toLowerCase();
      if (lower.includes('westside') || lower.includes('lofts')) {
        replyText = "Westside Lofts was flagged by the system because the landlord entity 'Riverview Management' listed a unit with missing structural safety clearance records for Kiambu subcounties.";
      } else if (lower.includes('flag') || lower.includes('reports')) {
        replyText = "There are currently 2 unresolved flags matching high risk parameters in the reports queue. One is for an unverified security deposit hold amount at Nyali Sunset Suites.";
      } else if (lower.includes('lumina')) {
        replyText = "The Lumina is currently operating at 98% occupancy. All syndication parameters are verified and clean.";
      }

      setChatMessages(prev => [...prev, {
        sender: 'sophia',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const runJob = (jobId: string) => {
    setRunningJobId(jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Running' } : j));
    
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === jobId ? { 
        ...j, 
        status: 'Completed', 
        lastRun: new Date().toISOString(),
        recordsAnalyzed: j.recordsAnalyzed + 5,
        flagsFound: j.flagsFound + (Math.random() > 0.7 ? 1 : 0)
      } : j));
      setRunningJobId(null);
    }, 1500);
  };

  return (
    <ModLayout title="Sophia AI Assistant">
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        
        {/* Top summary cards */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-5 rounded-2xl shadow-sm trans-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-500 flex items-center justify-center">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                Sophia Copilot <span className="text-[10px] bg-coral-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">AI Moderator</span>
              </h1>
              <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Automating listing safety audits and regional policy checking.</p>
            </div>
          </div>
        </div>

        {/* Dynamic section grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chat Assistant Pane (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden flex flex-col shadow-sm trans-theme h-[500px]">
            
            {/* Header */}
            <div className="px-5 py-3 border-b border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between">
              <span className="text-xs font-bold text-paper-800 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-coral-500" /> Sophia Live Console
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {chatMessages.map((msg, idx) => {
                const isAI = msg.sender === 'sophia';
                return (
                  <div key={idx} className={`flex items-start gap-3 ${!isAI ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                      isAI ? 'bg-coral-500 text-white' : 'bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-200'
                    }`}>
                      {isAI ? <Bot className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                    </div>
                    
                    <div className="space-y-1 max-w-[75%]">
                      <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                        isAI 
                          ? 'bg-paper-50 dark:bg-ink-950 border-paper-200 dark:border-ink-850 text-paper-800 dark:text-ink-100 rounded-tl-none' 
                          : 'bg-coral-500 border-coral-600 text-white rounded-tr-none'
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-[9px] text-paper-400 dark:text-ink-500 ${!isAI ? 'text-right' : ''}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-paper-400 dark:text-ink-500 pl-10">
                  <Bot className="w-4 h-4 animate-spin text-coral-500" />
                  <span>Sophia is searching audit indices...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/20 flex gap-2">
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about flagged listings, organizations, safety audits..."
                className="flex-1 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
              />
              <button 
                type="submit"
                className="p-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Automated Jobs Panel (1 col) */}
          <div className="space-y-4">
            
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm trans-theme space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1">
                <Terminal className="w-4 h-4 text-purple-500" /> Automated Jobs
              </h3>
              
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="p-3 border border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-paper-900 dark:text-white">{job.name}</h4>
                        <span className="text-[10px] text-paper-400 dark:text-ink-500">{job.type}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        job.status === 'Running' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : job.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[9px] text-paper-500 dark:text-ink-400 pt-1 border-t border-paper-100 dark:border-ink-800">
                      <span>Analyzed: <strong>{job.recordsAnalyzed}</strong></span>
                      <span className="text-red-500">Flags: <strong>{job.flagsFound}</strong></span>
                    </div>

                    <button 
                      onClick={() => runJob(job.id)}
                      disabled={runningJobId === job.id}
                      className="w-full py-1 bg-paper-200 hover:bg-paper-350 dark:bg-ink-850 dark:hover:bg-ink-800 border border-paper-300 dark:border-ink-750 rounded-lg text-[10px] font-bold text-paper-700 dark:text-ink-200 flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <Play className="w-3 h-3 text-coral-500" /> Run Scan
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit log banner */}
            <div className="bg-gradient-to-br from-coral-500 to-coral-600 rounded-3xl p-5 text-white shadow-lg shadow-coral-500/15 space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Policy Auditor</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Sophia runs continuous scans across all regional vacancy feeds in Kiambu, Nairobi, Machakos, Mombasa, and Nakuru counties to guarantee structural integrity parameters are maintained.
              </p>
            </div>

          </div>

        </div>

      </div>
    </ModLayout>
  );
}
