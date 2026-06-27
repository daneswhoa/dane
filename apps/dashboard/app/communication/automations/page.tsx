'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Sparkles, Calendar, AlertTriangle, Play, Pause, Settings, 
  ChevronRight, ArrowRight, Loader2, Mail, CheckCircle2, History,
  FileText, ToggleLeft, ToggleRight, Info, AlertCircle, Clock
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  isSystem: boolean;
}

interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  triggerOffsetDays: number;
  triggerCondition: 'before' | 'after' | 'on_event';
  templateId: string;
  isActive: boolean;
  channel: 'Email' | 'SMS' | 'Both';
  lastRun: string | null;
  totalDispatched: number;
}

interface ActivityLog {
  id: string;
  flowName: string;
  recipient: string;
  property: string;
  timestamp: string;
  status: 'delivered' | 'pending' | 'failed';
  details: string;
}

export default function CommunicationAutomationsPage() {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  // Drawer/Edit State
  const [editingFlow, setEditingFlow] = useState<AutomationFlow | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [offsetDays, setOffsetDays] = useState(0);
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'Both'>('Email');
  const [isSaving, setIsSaving] = useState(false);

  // Mock Activity Log
  const [activityLogs] = useState<ActivityLog[]>([
    { id: '1', flowName: 'Rent Reminder', recipient: 'Thomas Mulder', property: 'Keizersgracht 142, Apt A', timestamp: '10 minutes ago', status: 'delivered', details: 'Rent due notice sent via Email' },
    { id: '2', flowName: 'Late Rent (Arrears) Alert', recipient: 'Anouk de Jong', property: 'Prinsengracht 89', timestamp: '2 hours ago', status: 'delivered', details: 'Unpaid notice sent (2 days overdue)' },
    { id: '3', flowName: 'Maintenance Progress Sync', recipient: 'Sven Bakker (Contractor)', property: 'Singel 204', timestamp: 'Yesterday', status: 'delivered', details: 'Ticket status changed to Assigned' },
    { id: '4', flowName: 'Lease Renewal Prompt', recipient: 'Lars van der Meer', property: 'Keizersgracht 142, Apt C', timestamp: '2 days ago', status: 'delivered', details: '60-day lease expiration warning sent' },
    { id: '5', flowName: 'Move-In Welcome Sequence', recipient: 'Emma Visser', property: 'Herengracht 412, Apt 3', timestamp: '3 days ago', status: 'delivered', details: 'Welcome instructions & check-in keys sent' }
  ]);

  // Load Flows & Templates
  useEffect(() => {
    // 1. Fetch workflows from API
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/automations`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('API unreachable');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setFlows(data);
        }
      })
      .catch((e) => {
        console.error('Failed to load automations from API:', e);
      });

    // 2. Fetch templates from API
    setTemplatesLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/email-templates`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('API unreachable');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Map API templates
          const mapped = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            subject: t.subject,
            isSystem: t.isSystem
          }));
          
          // Prepend some default placeholders
          const withDefaults = [
            { id: 'rent-reminder-default', name: 'Rent Due Notice (Default System)', subject: 'Notice: Rent Payment Due Soon', isSystem: true },
            { id: 'late-rent-default', name: 'Late Rent Notice (Default System)', subject: 'Urgent: Overdue Rent Notice', isSystem: true },
            { id: 'lease-renewal-default', name: 'Lease Expiration notice (Default System)', subject: 'Options regarding your upcoming lease expiration', isSystem: true },
            { id: 'ticket-update-default', name: 'Maintenance Status Update (Default System)', subject: 'Update on Maintenance Ticket #{id}', isSystem: true },
            { id: 'welcome-default', name: 'Tenant Welcome Package (Default System)', subject: 'Welcome to your new home!', isSystem: true },
            ...mapped
          ];
          setTemplates(withDefaults);
        }
      })
      .catch(() => {
        // Fallback default templates
        setTemplates([
          { id: 'rent-reminder-default', name: 'Rent Due Notice (Default System)', subject: 'Notice: Rent Payment Due Soon', isSystem: true },
          { id: 'late-rent-default', name: 'Late Rent Notice (Default System)', subject: 'Urgent: Overdue Rent Notice', isSystem: true },
          { id: 'lease-renewal-default', name: 'Lease Expiration notice (Default System)', subject: 'Options regarding your upcoming lease expiration', isSystem: true },
          { id: 'ticket-update-default', name: 'Maintenance Status Update (Default System)', subject: 'Update on Maintenance Ticket #{id}', isSystem: true },
          { id: 'welcome-default', name: 'Tenant Welcome Package (Default System)', subject: 'Welcome to your new home!', isSystem: true }
        ]);
      })
      .finally(() => {
        setTemplatesLoading(false);
        setLoading(false);
      });
  }, []);

  // Toggle active/paused state
  const handleToggleActive = async (id: string) => {
    const flow = flows.find(f => f.id === id);
    if (!flow) return;

    const newActiveState = !flow.isActive;

    // Optimistic update
    setFlows(prev => prev.map(f => f.id === id ? { ...f, isActive: newActiveState } : f));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/automations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: newActiveState,
          triggerOffsetDays: flow.triggerOffsetDays,
          templateId: flow.templateId,
          channel: flow.channel
        }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to toggle automation');
    } catch (err) {
      console.error(err);
      // Revert on error
      setFlows(prev => prev.map(f => f.id === id ? { ...f, isActive: !newActiveState } : f));
    }
  };

  // Open Configuration Drawer
  const handleConfigureClick = (flow: AutomationFlow) => {
    setEditingFlow(flow);
    setSelectedTemplateId(flow.templateId);
    setOffsetDays(flow.triggerOffsetDays);
    setChannel(flow.channel);
  };

  // Save Flow Changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlow) return;

    setIsSaving(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/automations/${editingFlow.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: editingFlow.isActive,
          triggerOffsetDays: offsetDays,
          templateId: selectedTemplateId,
          channel: channel
        }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to update automation');
      
      setFlows(prev => prev.map(f => {
        if (f.id === editingFlow.id) {
          return {
            ...f,
            templateId: selectedTemplateId,
            triggerOffsetDays: offsetDays,
            channel
          };
        }
        return f;
      }));
      setEditingFlow(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to resolve template name
  const getTemplateName = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    return tpl ? tpl.name : 'System Default Template';
  };

  // Aggregate stats
  const activeCount = flows.filter(f => f.isActive).length;
  const totalSent = flows.reduce((sum, f) => sum + f.totalDispatched, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Premium Header Row */}
        <div className="relative overflow-hidden bg-ink-950 border border-ink-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/3 translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                Automated Flows
              </h2>
              <p className="text-sm text-ink-300 max-w-xl leading-relaxed">
                Configure background notifications that trigger automatically based on tenant events, lease conditions, and invoice deadlines.
              </p>
            </div>
            
            <div className="flex items-center gap-2 pr-2 text-xs font-semibold text-ink-400">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 border border-ink-800 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Flows', value: `${activeCount} / ${flows.length}`, description: 'Running trigger sequences' },
            { label: 'Total Dispatched', value: totalSent.toLocaleString(), description: 'Notifications sent by system' },
            { label: 'Delivery Rate', value: '99.6%', description: 'Successful message deliveries' },
            { label: 'Pending Queue', value: '0', description: 'Messages scheduled to send' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-ink-950 p-5 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm">
              <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-paper-900 dark:text-white mt-1">{stat.value}</p>
              <p className="text-[10px] text-paper-400 dark:text-ink-500 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Main Workflows Section */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
              <p className="text-xs text-paper-500 dark:text-ink-400 font-medium">Initializing automation rules...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Workflows List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-paper-700 dark:text-white uppercase tracking-wider">Flow Configurator</h3>
                <span className="text-[11px] text-paper-500 dark:text-ink-400 font-medium">Toggle active status or customize parameters</span>
              </div>
              
              {flows.map((flow) => {
                const isSelected = editingFlow?.id === flow.id;
                return (
                  <div 
                    key={flow.id} 
                    className={`group relative bg-white dark:bg-ink-950 border rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                      flow.isActive 
                        ? 'border-paper-200 dark:border-ink-800 hover:border-coral-500/30' 
                        : 'border-paper-200 dark:border-ink-800/40 opacity-75'
                    } ${isSelected ? 'ring-2 ring-coral-500/50 border-coral-500 dark:border-coral-500' : ''}`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-colors ${
                        flow.isActive 
                          ? 'bg-coral-500/10 border-coral-500/20 text-coral-500' 
                          : 'bg-paper-100 dark:bg-ink-900 border-paper-200 dark:border-ink-800 text-paper-400 dark:text-ink-600'
                      }`}>
                        {flow.id === 'rent-reminder' && <Calendar className="w-5 h-5" />}
                        {flow.id === 'late-rent-notice' && <AlertCircle className="w-5 h-5" />}
                        {flow.id === 'lease-expiration' && <Clock className="w-5 h-5" />}
                        {flow.id === 'ticket-status-change' && <CheckCircle2 className="w-5 h-5" />}
                        {flow.id === 'onboarding-welcome' && <Sparkles className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-paper-900 dark:text-white text-base">{flow.name}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            flow.isActive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                              : 'bg-paper-100 dark:bg-ink-900 text-paper-500 dark:text-ink-500 border border-paper-200 dark:border-ink-800/60'
                          }`}>
                            {flow.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed max-w-xl">{flow.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[10px] text-paper-400 dark:text-ink-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 
                            {flow.triggerCondition === 'before' && `Send ${flow.triggerOffsetDays} days before ${flow.triggerEvent}`}
                            {flow.triggerCondition === 'after' && `Send ${flow.triggerOffsetDays} days after ${flow.triggerEvent}`}
                            {flow.triggerCondition === 'on_event' && `Send immediately on ${flow.triggerEvent}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {flow.channel}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> {getTemplateName(flow.templateId)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3.5 border-t border-paper-100 dark:border-ink-900 sm:border-none pt-4 sm:pt-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-paper-400 dark:text-ink-500">Dispatched</p>
                        <p className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">{flow.totalDispatched} msgs</p>
                      </div>

                      {/* Config Button */}
                      <button 
                        onClick={() => handleConfigureClick(flow)}
                        className="p-2 text-paper-400 hover:text-coral-500 dark:text-ink-500 dark:hover:text-coral-400 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-850 hover:border-coral-500/50 dark:hover:border-coral-500/30 rounded-xl transition-all"
                        title="Configure Flow Rules"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      {/* Status Toggle Switch */}
                      <button 
                        onClick={() => handleToggleActive(flow.id)}
                        className="transition-transform active:scale-90"
                      >
                        {flow.isActive ? (
                          <ToggleRight className="w-8 h-8 text-coral-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-paper-300 dark:text-ink-700" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Panel: Live Activity Log */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-paper-700 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-coral-500" /> System Activity
                </h3>
                <span className="text-[10px] text-paper-400 dark:text-ink-500 font-medium">Real-time status</span>
              </div>

              <div className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-2xl p-5 space-y-4">
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative pl-4 border-l-2 border-paper-200 dark:border-ink-800 py-1 space-y-1">
                      {/* Left timeline dot */}
                      <div className="absolute -left-[6px] top-2 w-2.5 h-2.5 rounded-full bg-paper-300 dark:bg-ink-700 border-2 border-white dark:border-ink-950" />
                      
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-paper-800 dark:text-ink-300 uppercase tracking-wider">{log.flowName}</span>
                        <span className="text-[9px] text-paper-400 dark:text-ink-500 font-medium">{log.timestamp}</span>
                      </div>
                      
                      <p className="text-xs font-semibold text-paper-900 dark:text-white">{log.recipient}</p>
                      <p className="text-[10px] text-paper-500 dark:text-ink-400 leading-normal">{log.details} &bull; <span className="italic">{log.property}</span></p>
                      
                      <div className="flex items-center gap-1 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sent successfully
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Configuration Drawer/Modal */}
        {editingFlow && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-paper-900/60 dark:bg-ink-950/80 backdrop-blur-md" onClick={() => setEditingFlow(null)} />
            
            <div className="relative bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-[24px] overflow-hidden shadow-2xl w-full max-w-md animate-slide-up flex flex-col">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-paper-100 dark:border-ink-800 flex justify-between items-center bg-paper-50/50 dark:bg-ink-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-coral-500/10 rounded-xl border border-coral-500/20 flex items-center justify-center text-coral-500">
                    <Settings className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-paper-900 dark:text-white">Configure Flow</h3>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 font-medium mt-0.5">
                      Adjust trigger rules for {editingFlow.name}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveChanges} className="p-6 space-y-5">
                
                {/* Trigger Timing */}
                {editingFlow.triggerCondition !== 'on_event' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                      Trigger Timing
                    </label>
                    <div className="flex items-center gap-3 bg-paper-50 dark:bg-ink-900 p-3.5 rounded-xl border border-paper-100 dark:border-ink-850">
                      <input 
                        type="number"
                        min="1"
                        max="180"
                        value={offsetDays}
                        onChange={(e) => setOffsetDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2.5 py-1.5 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-sm text-center font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                      />
                      <span className="text-xs text-paper-700 dark:text-ink-300 font-medium">
                        days {editingFlow.triggerCondition} the {editingFlow.triggerEvent}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                      Trigger Timing
                    </label>
                    <div className="p-3.5 bg-paper-50 dark:bg-ink-900 rounded-xl border border-paper-100 dark:border-ink-850 flex items-center gap-2 text-xs text-paper-500 dark:text-ink-400 font-medium">
                      <Info className="w-4 h-4 text-coral-500 flex-shrink-0" />
                      <span>This flow triggers instantly when the {editingFlow.triggerEvent} status changes.</span>
                    </div>
                  </div>
                )}

                {/* Select Template */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest">
                    Linked Message Template
                  </label>
                  <select 
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-3 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-coral-500/50 dark:text-white transition-all"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Channel */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest">
                    Delivery Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Email', 'SMS', 'Both'] as const).map((mode) => {
                      const isActiveMode = channel === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setChannel(mode)}
                          className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            isActiveMode 
                              ? 'bg-coral-500/10 border-coral-500 text-coral-600 dark:text-coral-400 font-bold' 
                              : 'bg-paper-50 dark:bg-ink-900 border-paper-200 dark:border-ink-800/80 text-paper-400 dark:text-ink-500 hover:border-paper-300 dark:hover:border-ink-700'
                          }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-paper-100 dark:border-ink-900">
                  <button 
                    type="button"
                    onClick={() => setEditingFlow(null)}
                    className="px-4 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-white text-xs font-bold rounded-xl hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_-3px_rgba(244,114,182,0.4)] transition-all"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
