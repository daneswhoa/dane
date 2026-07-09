'use client';

import React, { useState } from 'react';
import { Search, HelpCircle, ChevronRight, MessageSquare, AlertCircle, Wrench, Shield, Wallet, Sparkles } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export function FaqSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'setup', name: 'Setup & Properties', icon: Shield },
    { id: 'billing', name: 'Billing & Wallet', icon: Wallet },
    { id: 'ai', name: 'Sophia AI Assistant', icon: Sparkles },
    { id: 'maintenance', name: 'Maintenance & Tickets', icon: Wrench },
  ];

  const faqs: FaqItem[] = [
    {
      category: 'setup',
      q: 'Why can\'t I add more than 3 properties to my portfolio?',
      a: 'Free plan accounts are limited to listing 3 properties at a time. To list more properties or add additional team members, you need to upgrade your organization workspace to the Premium plan via the Plan tab.'
    },
    {
      category: 'setup',
      q: 'How do I invite workspace personnel and assign roles?',
      a: 'Go to the Organization page, select the Members & Security tab, and click "Invite Member". Enter their email address, choose a role, and scope their property access limit. Once they register, they will gain access to your workspace.'
    },
    {
      category: 'billing',
      q: 'What happens if my credit balance falls to zero?',
      a: 'If your credit wallet runs out of funds, automated operations like Sophia AI chat conversations, spreadsheets data parsing, and email campaign broadcasts will be paused until you top up your credits in the Credits tab.'
    },
    {
      category: 'billing',
      q: 'Is Stripe card checkout secure?',
      a: 'Yes. All payments are processed through secure Stripe Checkout elements. Card details are transmitted directly to Stripe over encrypted channels and are never stored on our local servers.'
    },
    {
      category: 'ai',
      q: 'Can Sophia AI execute database modifications without my approval?',
      a: 'No. Sophia AI operates under strict authorization hooks. She will always present a structured breakdown of the planned changes (e.g. creating units, assigning tickets) and require your explicit click confirmation before committing modifications.'
    },
    {
      category: 'ai',
      q: 'What is the credit charge rate for talking to Sophia AI?',
      a: 'Sophia AI turn charges depend on the task being executed. Standard text turns cost 5 credits. Performing active database tool actions costs an extra 10 credits, while parsing analytics files carries a 45-credit surcharge.'
    },
    {
      category: 'maintenance',
      q: 'How do maintenance requests reach contractors?',
      a: 'When a tenant reports a maintenance issue, it shows up in your Maintenance tab. You can browse local contractors in the directory and click "Assign Job". The contractor receives the details on their portal to schedule the repair.'
    },
    {
      category: 'maintenance',
      q: 'Can I reverse a ledger transaction if it was logged incorrectly?',
      a: 'In the Moderator Credits Console, administrators can paste a block TXID to verify cryptographic ledger links. If valid and authorized, they can append a ledger reversal transaction block to correct balances.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-paper-50 dark:bg-ink-950/40 p-4 border border-paper-200 dark:border-ink-800 rounded-lg">
        <div>
          <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-coral-500" /> Search Help Articles
          </h3>
          <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Find answers to common questions about rent billing, Sophia AI, and property configuration.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs outline-none focus:ring-1 focus:ring-coral-500 focus:border-coral-500"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left: Category filters */}
        <div className="md:col-span-1 space-y-1">
          <div className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest px-2.5 pb-2 border-b border-paper-100 dark:border-ink-750 mb-2">
            Categories
          </div>
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveFaq(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all ${
                  isActive 
                    ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-500 font-semibold' 
                    : 'text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-900/50'
                }`}
              >
                <CatIcon className="w-4 h-4 shrink-0" />
                <span className="text-[11.5px]">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Collapsible Accordion List */}
        <div className="md:col-span-3 space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center text-left p-4 text-xs font-bold text-paper-900 dark:text-white hover:text-coral-500 dark:hover:text-coral-400 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-paper-400 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-coral-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-paper-100 dark:border-ink-750 bg-paper-50/20 dark:bg-ink-900/20">
                    <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-8 text-center text-paper-500 dark:text-ink-400">
              <AlertCircle className="w-8 h-8 text-paper-350 dark:text-ink-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">No help articles found matching your query.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} 
                className="mt-2 text-xs text-coral-500 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
