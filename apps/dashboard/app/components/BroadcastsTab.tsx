'use client';

import React, { useEffect, useState } from 'react';
import {
  Library, PenLine, CheckCircle2, TrendingUp, MailOpen,
  MousePointerClick, Send, Bot, ArrowRight, ChevronDown,
  Users, Check, CornerDownRight, Building, Clock,
  Pencil, XCircle, FileEdit, BarChart2, Loader2, AlertTriangle, Play
} from 'lucide-react';
import { ComposeBroadcastModal } from './communication/ComposeBroadcastModal';
import Link from 'next/link';

export default function BroadcastsTab() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');

  const fetchCampaigns = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/campaigns`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCampaigns(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      })
      .catch(e => console.error('Error fetching campaigns:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleComposeClose = () => {
    setIsComposeOpen(false);
    fetchCampaigns();
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'draft') return c.status === 'draft';
    if (filter === 'scheduled') return c.status === 'scheduled';
    if (filter === 'sent') return c.status === 'sent' || c.status === 'sending';
    return true;
  });

  const sentCampaigns = campaigns.filter(c => c.status === 'sent' || c.status === 'sending');
  const scheduledCampaignsCount = campaigns.filter(c => c.status === 'scheduled').length;
  const draftCampaignsCount = campaigns.filter(c => c.status === 'draft').length;
  
  // Rough estimate of emails sent by counting sent campaigns * avg recipients (mocked for visual effect)
  const estimatedEmailsSent = sentCampaigns.length > 0 ? sentCampaigns.length * 128 : 0;

  const renderStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <Check className="w-3 h-3" /> Sent
          </span>
        );
      case 'sending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            <Play className="w-3 h-3" /> Sending...
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-paper-200 dark:border-ink-600 bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-300 text-[10px] font-bold uppercase tracking-wider">
            <FileEdit className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  const getAudienceLabel = (c: any) => {
    switch (c.audienceType) {
      case 'all': return { label: 'All Active Tenants', sub: 'Global Audience', icon: Users };
      case 'team': return { label: 'Internal Team', sub: 'Staff Members', icon: Users };
      case 'property': return { label: 'Specific Property', sub: 'Targeted Units', icon: Building };
      case 'arrears': return { label: 'Unpaid Invoices', sub: 'In Arrears', icon: AlertTriangle };
      case 'lease_expiring': return { label: 'Lease Expirations', sub: 'Ending in 60d', icon: Clock };
      case 'specific_tenants': return { label: 'Specific Tenants', sub: 'Hand-selected', icon: Users };
      default: return { label: 'Custom', sub: 'Custom Audience', icon: Users };
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full flex-1 animate-fade-in">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-paper-900 dark:text-white tracking-tight">Email Center</h1>
            <span className="px-2 py-0.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-[10px] font-medium text-paper-500 dark:text-ink-400">Powered by Landlord.nl Mail</span>
          </div>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Manage mass communications, newsletters, and view email performance.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link href="/communication/templates" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 rounded-md hover:bg-paper-50 dark:hover:bg-ink-700 active:scale-95 transition-all shadow-sm">
            <Library className="w-3.5 h-3.5" />
            Templates
          </Link>
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-coral-500 text-white rounded-md hover:bg-coral-600 active:scale-95 transition-all shadow-sm shadow-coral-500/20"
          >
            <PenLine className="w-3.5 h-3.5" />
            Compose Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Deliverability */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Deliverability Rate</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2 z-10 relative">
            <span className="text-2xl font-semibold text-paper-900 dark:text-white">99.8%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 0.2%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-emerald-500 fill-current">
              <path d="M0,30 L0,15 Q10,10 20,20 T40,15 T60,5 T80,10 T100,5 L100,30 Z"></path>
            </svg>
          </div>
        </div>

        {/* Average Open Rate */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors shadow-sm opacity-60 grayscale">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Avg. Open Rate</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded text-blue-600 dark:text-blue-400">
              <MailOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-paper-900 dark:text-white">N/A</span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400">Not enough data</span>
          </div>
          <div className="w-full bg-paper-100 dark:bg-ink-900 rounded-full h-1 mt-3">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Average Click Rate */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors shadow-sm opacity-60 grayscale">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Avg. Click Rate</span>
            <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded text-purple-600 dark:text-purple-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-paper-900 dark:text-white">N/A</span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400">Not enough data</span>
          </div>
          <div className="w-full bg-paper-100 dark:bg-ink-900 rounded-full h-1 mt-3">
            <div className="bg-purple-500 h-1 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Emails Sent (30d) */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Emails Sent To Date</span>
            <div className="p-1.5 bg-paper-100 dark:bg-ink-900 rounded text-paper-600 dark:text-ink-300">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-paper-900 dark:text-white">{estimatedEmailsSent.toLocaleString()}</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-ink-800 bg-ink-800 flex items-center justify-center text-[8px] font-bold text-white">L</div>
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-ink-800 bg-ink-700 flex items-center justify-center text-[8px] font-bold text-white">T</div>
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-ink-800 bg-ink-600 flex items-center justify-center text-[8px] font-bold text-white">M</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-sm transition-colors flex flex-col min-h-[400px]">
        
        {/* Filters Bar */}
        <div className="p-3 border-b border-paper-200 dark:border-ink-700 flex flex-wrap items-center gap-3 bg-paper-50/50 dark:bg-ink-900/20 rounded-t-lg">
          <div className="flex items-center bg-paper-100 dark:bg-ink-900/50 p-1 rounded-md border border-paper-200 dark:border-ink-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${filter === 'all' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-ink-200'}`}
            >
              All Broadcasts
            </button>
            <button 
              onClick={() => setFilter('draft')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${filter === 'draft' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-ink-200'}`}
            >
              Drafts ({draftCampaignsCount})
            </button>
            <button 
              onClick={() => setFilter('scheduled')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${filter === 'scheduled' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-ink-200'}`}
            >
              Scheduled ({scheduledCampaignsCount})
            </button>
            <button 
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${filter === 'sent' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-ink-200'}`}
            >
              Sent ({sentCampaigns.length})
            </button>
          </div>

          <div className="h-5 w-px bg-paper-200 dark:bg-ink-700 hidden sm:block mx-1"></div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 transition-all whitespace-nowrap">
              <span className="font-medium text-paper-500 dark:text-ink-400">Audience:</span> All Segments
              <ChevronDown className="w-3 h-3 text-paper-400" />
            </button>
            <button className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 transition-all whitespace-nowrap">
              <span className="font-medium text-paper-500 dark:text-ink-400">Sent Date:</span> Any Time
              <ChevronDown className="w-3 h-3 text-paper-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-paper-50 dark:bg-ink-900/80 border-b border-paper-200 dark:border-ink-700 text-[11px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium transition-colors">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded border-paper-300 dark:border-ink-600 bg-transparent text-coral-500 focus:ring-coral-500 dark:bg-ink-800" />
                </th>
                <th className="px-4 py-3">Campaign / Subject</th>
                <th className="px-4 py-3">Audience Segment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-48">Engagement</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 transition-colors bg-white dark:bg-ink-800">
              
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Loader2 className="w-6 h-6 text-coral-500 animate-spin mx-auto" />
                    <p className="text-xs text-paper-500 mt-2">Loading campaigns...</p>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Send className="w-8 h-8 text-paper-300 dark:text-ink-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-paper-700 dark:text-ink-300">No broadcasts found</p>
                    <p className="text-xs text-paper-500 mt-1">You haven't created any campaigns matching this filter.</p>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const audience = getAudienceLabel(c);
                  const Icon = audience.icon;
                  return (
                    <tr key={c.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-all group">
                      <td className="px-4 py-4 align-middle">
                        <input type="checkbox" className="rounded border-paper-300 dark:border-ink-600 bg-transparent text-coral-500 focus:ring-coral-500 dark:bg-ink-800" />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-paper-900 dark:text-white group-hover:text-coral-500 transition-all cursor-pointer">{c.title}</span>
                          <div className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1.5 line-clamp-1 max-w-md">
                            <CornerDownRight className="w-3 h-3 text-paper-300 dark:text-ink-600" />
                            "{c.subject}"
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 flex items-center justify-center text-paper-600 dark:text-ink-300">
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-paper-800 dark:text-ink-100">{audience.label}</span>
                            <span className="text-[10px] text-paper-500 dark:text-ink-400">{audience.sub}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {renderStatus(c.status)}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {c.status === 'sent' || c.status === 'sending' ? (
                          <div className="flex flex-col gap-1.5 w-full pr-4 opacity-50 grayscale">
                            <div className="flex justify-between text-[10px] font-medium">
                              <span className="text-blue-600 dark:text-blue-400">N/A</span>
                              <span className="text-purple-600 dark:text-purple-400">N/A</span>
                            </div>
                            <div className="w-full h-1.5 bg-paper-100 dark:bg-ink-900 rounded-full flex overflow-hidden">
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-[10px] text-paper-400 dark:text-ink-500 italic">
                            Data available after send
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 align-middle text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-paper-900 dark:text-ink-100 font-medium">
                            {c.scheduledAt 
                              ? new Date(c.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            }
                          </span>
                          <span className="text-[10px] text-paper-500 dark:text-ink-400">
                            {c.scheduledAt 
                              ? new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-right">
                        {c.status === 'scheduled' || c.status === 'draft' ? (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button className="p-1.5 text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-700 rounded transition-all" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-paper-500 hover:text-coral-600 dark:hover:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-500/10 rounded transition-all" title="Cancel">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button className="p-1.5 text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-700 rounded transition-all opacity-0 group-hover:opacity-100" title="View Report">
                            <BarChart2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 border-t border-paper-200 dark:border-ink-700 flex items-center justify-between text-xs bg-paper-50/50 dark:bg-ink-900/20 rounded-b-lg transition-colors mt-auto">
          <span className="text-paper-500 dark:text-ink-400">Showing {filteredCampaigns.length} of {campaigns.length} campaigns</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-paper-200 dark:border-ink-700 text-paper-400 dark:text-ink-500 cursor-not-allowed">Previous</button>
            <button className="px-2 py-1 rounded bg-coral-500 text-white font-medium shadow-sm">1</button>
            <button className="px-2 py-1 rounded border border-paper-200 dark:border-ink-700 text-paper-400 dark:text-ink-500 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      <div className="pb-8"></div>
      
      {isComposeOpen && <ComposeBroadcastModal onClose={handleComposeClose} />}
    </div>
  );
}
