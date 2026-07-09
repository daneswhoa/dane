'use client';

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardGuide } from '../components/support/DashboardGuide';
import { FaqSection } from '../components/support/FaqSection';
import { 
  HelpCircle, BookOpen, MessageSquare, Clock, Send, CheckCircle2, 
  HelpCircle as QuestionIcon, FileText
} from 'lucide-react';

export default function SupportPage() {
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'faq' | 'contact'>('guide');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubmitted(true);
      setTicketSubject('');
      setTicketMessage('');
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto animate-fade-in pb-20">
        
        {/* Support Page Main Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-paper-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-coral-500" /> Support & Resources
            </h1>
            <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
              Access workspace documentation, search help articles, or message our operations helpdesk.
            </p>
          </div>
          
          {/* Sub Navigation Tabs */}
          <div className="flex border border-paper-200 dark:border-ink-700 rounded-md p-1 bg-paper-50 dark:bg-ink-950/40">
            <button
              onClick={() => setActiveSubTab('guide')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeSubTab === 'guide' 
                  ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' 
                  : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> User Guide
            </button>
            <button
              onClick={() => setActiveSubTab('faq')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeSubTab === 'faq' 
                  ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' 
                  : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Help FAQs
            </button>
            <button
              onClick={() => setActiveSubTab('contact')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeSubTab === 'contact' 
                  ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' 
                  : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>
        </div>

        {/* Content Rendering based on Active Subtab */}
        <div className="space-y-6">
          {activeSubTab === 'guide' && <DashboardGuide />}
          
          {activeSubTab === 'faq' && <FaqSection />}

          {activeSubTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Column (3/5): Contact Overview Banner & Hours */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Contact Page Hero Banner */}
                <div 
                  className="bg-ink-950 dark:bg-black rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-sm min-h-[140px]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(5, 8, 11, 0.95)), url("/support_illustration.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="relative z-10 space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5" /> Helpdesk Communications
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Direct Help & Inquiries</h2>
                    <p className="text-[11px] text-ink-300 leading-relaxed">
                      Submit support inquiries regarding credit refill statuses, subscription packages, and property setup.
                    </p>
                  </div>
                  <div className="relative z-10 flex gap-2 flex-shrink-0">
                    <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-3.5 flex flex-col justify-center min-w-[200px]">
                      <div className="text-[9px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Support Hours</div>
                      <div className="space-y-1 mt-1 text-[11px] text-ink-300">
                        <div>• Mon - Fri: 8:00 AM - 6:00 PM</div>
                        <div>• Sat: 9:00 AM - 1:00 PM</div>
                        <div>• Sun: Closed (Emergency only)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Chat Panel (Offline) */}
                <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm flex flex-col min-h-[300px]">
                  <div className="px-4 py-3.5 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-paper-300 dark:bg-ink-600"></div>
                      <h3 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider">Live Chat</h3>
                    </div>
                    <span className="text-[9px] bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-750 px-1.5 py-0.5 rounded uppercase tracking-wider text-paper-500 dark:text-ink-400 font-semibold">
                      Offline
                    </span>
                  </div>
                  
                  <div className="flex-1 p-5 flex flex-col justify-center items-center text-center bg-paper-50/30 dark:bg-ink-950/20">
                    <div className="w-12 h-12 rounded-full bg-paper-100 dark:bg-ink-900 flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-paper-400 dark:text-ink-550" />
                    </div>
                    <h4 className="text-xs font-bold text-paper-800 dark:text-ink-200">Chat agents are currently away</h4>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 max-w-[220px] leading-relaxed">
                      Support is closed right now. Ask Sophia AI for instant help or submit a service ticket on the form.
                    </p>
                  </div>

                  {/* Chat Input Placeholder */}
                  <div className="p-3 border-t border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900">
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        placeholder="Live chat is offline..."
                        className="w-full pl-3 pr-10 py-2.5 bg-paper-50 dark:bg-ink-950/50 border border-paper-200 dark:border-ink-800 rounded-lg text-xs cursor-not-allowed text-paper-400 dark:text-ink-600 outline-none font-medium"
                      />
                      <button disabled className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-paper-300 dark:text-ink-700">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (2/5): Ticket submission Form */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
                  <div className="px-4 py-3.5 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50">
                    <h3 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider">Submit Support Ticket</h3>
                  </div>
                  
                  {ticketSubmitted ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-paper-900 dark:text-white">Ticket Submitted!</h4>
                      <p className="text-[10px] text-paper-500 dark:text-ink-400 max-w-[240px] mx-auto leading-relaxed">
                        We've received your ticket. A support specialist will respond to your workspace email within 12 business hours.
                      </p>
                      <button 
                        onClick={() => setTicketSubmitted(false)}
                        className="mt-2 text-[10px] text-coral-500 font-bold hover:underline"
                      >
                        Submit another ticket
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="p-4 space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-paper-500 dark:text-ink-450 uppercase tracking-widest">Inquiry Subject</label>
                        <input 
                          type="text" 
                          required
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="e.g. Credit Top-up Issue"
                          className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-paper-500 dark:text-ink-450 uppercase tracking-widest">Detail Message</label>
                        <textarea 
                          rows={4}
                          required
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          placeholder="Please supply specific transaction IDs or details of the issue..."
                          className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 outline-none resize-none"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="w-3.5 h-3.5 animate-spin" /> Submitting...
                          </>
                        ) : (
                          'Submit Ticket'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
