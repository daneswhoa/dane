import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Users, Building2, AlertTriangle, Send, Calendar, 
  Clock, Loader2, Sparkles, Filter, ChevronRight, ChevronLeft, 
  Check, Info, FileText, LayoutTemplate, HelpCircle, HardDriveDownload 
} from 'lucide-react';

interface ComposeBroadcastModalProps {
  onClose: () => void;
}

export function ComposeBroadcastModal({ onClose }: ComposeBroadcastModalProps) {
  const [step, setStep] = useState(1); // 1: Audience, 2: Message, 3: Review/Schedule
  
  const [audienceType, setAudienceType] = useState('all'); // all, team, property, arrears, specific_tenants, lease_expiring
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  // Specific Property Advanced options
  const [targetPropertyUnitsMode, setTargetPropertyUnitsMode] = useState<'all' | 'specific_units' | 'specific_tenants' | 'arrears' | 'lease_expiring'>('all');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  
  const [units, setUnits] = useState<any[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Fetch properties
    setPropertiesLoading(true);
    fetch('http://localhost:4000/api/dashboard/properties', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProperties(data);
      })
      .catch((e) => console.error('Error loading properties:', e))
      .finally(() => setPropertiesLoading(false));

    // Fetch all active tenants
    setTenantsLoading(true);
    fetch('http://localhost:4000/api/dashboard/tenants', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTenants(data);
      })
      .catch((e) => console.error('Error loading tenants:', e))
      .finally(() => setTenantsLoading(false));

    // Fetch all units
    setUnitsLoading(true);
    fetch('http://localhost:4000/api/dashboard/units', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUnits(data);
      })
      .catch((e) => console.error('Error loading units:', e))
      .finally(() => setUnitsLoading(false));

    // Fetch team
    setTeamLoading(true);
    fetch('http://localhost:4000/api/dashboard/team', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeamMembers(data);
      })
      .catch((e) => console.error('Error loading team:', e))
      .finally(() => setTeamLoading(false));

    // Fetch email templates
    setTemplatesLoading(true);
    fetch('http://localhost:4000/api/dashboard/email-templates', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch((e) => console.error('Error loading templates:', e))
      .finally(() => setTemplatesLoading(false));
  }, []);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setContent(tpl.body);
    }
  };

  const insertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newContent = text.substring(0, start) + tag + text.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
    }, 0);
  };

  const handleSend = async () => {
    if (!subject || !content) return;
    
    setIsSubmitting(true);
    setError('');

    // Serialize targetId depending on unit selections
    let finalTargetId = selectedPropertyId;
    if (audienceType === 'property') {
      if (targetPropertyUnitsMode === 'specific_units') {
        finalTargetId = JSON.stringify({
          propertyId: selectedPropertyId,
          unitIds: selectedUnitIds
        });
      } else if (targetPropertyUnitsMode === 'specific_tenants') {
        finalTargetId = JSON.stringify({
          propertyId: selectedPropertyId,
          tenantIds: selectedTenantIds
        });
      } else if (targetPropertyUnitsMode === 'arrears' || targetPropertyUnitsMode === 'lease_expiring') {
        finalTargetId = JSON.stringify({
          propertyId: selectedPropertyId,
          filter: targetPropertyUnitsMode
        });
      }
    }

    try {
      const res = await fetch('http://localhost:4000/api/dashboard/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: subject,
          subject,
          body: content,
          audienceType,
          targetId: finalTargetId,
          targetIds: audienceType === 'specific_tenants' ? selectedTenantIds : undefined,
          scheduleDate: isScheduling && scheduleDate ? new Date(scheduleDate).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create campaign');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while queueing the broadcast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to compute matched recipients and profiles with missing emails
  const computeRecipientEstimates = () => {
    let matchedList: any[] = [];
    
    if (audienceType === 'all') {
      matchedList = tenants;
    } else if (audienceType === 'team') {
      matchedList = teamMembers;
    } else if (audienceType === 'property') {
      if (selectedPropertyId) {
        if (targetPropertyUnitsMode === 'all') {
          // Tenants in property
          matchedList = tenants.filter(t => {
            const unitObj = units.find(u => u.id === t.unitId);
            return unitObj?.propertyId === selectedPropertyId;
          });
        } else if (targetPropertyUnitsMode === 'specific_units') {
          // Tenants in specific units
          matchedList = tenants.filter(t => selectedUnitIds.includes(t.unitId));
        } else if (targetPropertyUnitsMode === 'specific_tenants') {
          matchedList = tenants.filter(t => selectedTenantIds.includes(t.id));
        } else if (targetPropertyUnitsMode === 'arrears') {
          matchedList = tenants.filter(t => {
            const unitObj = units.find(u => u.id === t.unitId);
            return unitObj?.propertyId === selectedPropertyId && Number(t.arrears || 0) > 0;
          });
        } else if (targetPropertyUnitsMode === 'lease_expiring') {
          const today = new Date();
          const sixtyDaysFromNow = new Date();
          sixtyDaysFromNow.setDate(today.getDate() + 60);

          matchedList = tenants.filter(t => {
            const unitObj = units.find(u => u.id === t.unitId);
            if (!unitObj || unitObj.propertyId !== selectedPropertyId) return false;
            if (!t.leaseEnd) return false;
            const d = new Date(t.leaseEnd);
            return d >= today && d <= sixtyDaysFromNow;
          });
        }
      }
    } else if (audienceType === 'arrears') {
      matchedList = tenants.filter(t => Number(t.arrears || 0) > 0);
    } else if (audienceType === 'lease_expiring') {
      const today = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(today.getDate() + 60);

      matchedList = tenants.filter(t => {
        if (!t.leaseEnd) return false;
        const d = new Date(t.leaseEnd);
        return d >= today && d <= sixtyDaysFromNow;
      });
    }

    const estimatedCount = matchedList.length;
    const missingEmails = matchedList.filter(m => !m.email || m.email.trim() === '');
    
    return {
      total: estimatedCount,
      valid: estimatedCount - missingEmails.length,
      missingCount: missingEmails.length,
      missingNames: missingEmails.map(m => m.name || 'Unnamed Tenant')
    };
  };

  const getAudienceLabel = () => {
    switch (audienceType) {
      case 'all': return 'All Active Tenants';
      case 'team': return 'Internal Team Members';
      case 'property': 
        const prop = properties.find(p => p.id === selectedPropertyId);
        let suffix = ' (All Units)';
        if (targetPropertyUnitsMode === 'specific_units') suffix = ` (${selectedUnitIds.length} select units)`;
        if (targetPropertyUnitsMode === 'specific_tenants') suffix = ` (${selectedTenantIds.length} select tenants)`;
        if (targetPropertyUnitsMode === 'arrears') suffix = ' (In Arrears)';
        if (targetPropertyUnitsMode === 'lease_expiring') suffix = ' (Lease Expiring)';
        return `Tenants at ${prop ? prop.name : 'Selected Property'}${suffix}`;
      case 'arrears': return 'Tenants with Unpaid Invoices';
      case 'lease_expiring': return 'Tenants with Leases Expiring in 60 Days';
      default: return 'Custom Audience';
    }
  };

  const toggleTenantSelection = (id: string) => {
    if (selectedTenantIds.includes(id)) {
      setSelectedTenantIds(selectedTenantIds.filter(tid => tid !== id));
    } else {
      setSelectedTenantIds([...selectedTenantIds, id]);
    }
  };

  const toggleUnitSelection = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
    } else {
      setSelectedUnitIds([...selectedUnitIds, unitId]);
    }
  };

  const isStepValid = (currentStep: number) => {
    if (currentStep === 1) {
      if (audienceType === 'property') {
        if (!selectedPropertyId) return false;
        if (targetPropertyUnitsMode === 'specific_units' && selectedUnitIds.length === 0) return false;
      }
      if (audienceType === 'specific_tenants' && selectedTenantIds.length === 0) return false;
      return true;
    }
    if (currentStep === 2) {
      return !!subject.trim() && !!content.trim();
    }
    if (currentStep === 3) {
      if (isScheduling && !scheduleDate) return false;
      return true;
    }
    return true;
  };

  const estimates = computeRecipientEstimates();

  if (success) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-5 animate-fade-in backdrop-blur-sm bg-paper-900/80 dark:bg-ink-950/90">
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full animate-slide-up p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-paper-900 dark:text-white mb-2">Campaign Broadcast Scheduled</h3>
          <p className="text-xs text-paper-500 dark:text-ink-400 mb-6">
            Your campaign has been stored and registered with Google Cloud Tasks. Delivery will be dynamically throttled to ensure Resend limits are respected.
          </p>
          <button 
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-5 animate-fade-in backdrop-blur-sm bg-paper-900/80 dark:bg-ink-950/90">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center bg-paper-50 dark:bg-ink-950/50 flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-coral-500 animate-pulse" /> Compose Campaign Broadcast
            </h3>
            <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Create a highly targeted email sequence dynamically dispatched in the background.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-paper-200 dark:hover:bg-ink-800 rounded-lg text-paper-400 dark:text-ink-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="px-6 py-3.5 bg-paper-50/50 dark:bg-ink-950/20 border-b border-paper-200/60 dark:border-ink-800/60 flex items-center justify-between text-xs font-medium flex-shrink-0">
          <div className="flex items-center gap-6 w-full max-w-md mx-auto">
            {/* Step 1 */}
            <button 
              type="button" 
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center gap-1.5 transition-colors ${step >= 1 ? 'text-coral-500' : 'text-paper-400 dark:text-ink-500'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                step > 1 ? 'bg-coral-500 border-coral-500 text-white' : step === 1 ? 'border-coral-500 text-coral-500' : 'border-paper-300 dark:border-ink-700'
              }`}>
                {step > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span>Audience</span>
            </button>

            <div className={`h-px flex-1 ${step > 1 ? 'bg-coral-500' : 'bg-paper-200 dark:bg-ink-800'}`} />

            {/* Step 2 */}
            <button 
              type="button" 
              disabled={step < 2}
              onClick={() => step > 2 && setStep(2)}
              className={`flex items-center gap-1.5 transition-colors ${step >= 2 ? 'text-coral-500' : 'text-paper-400 dark:text-ink-500'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                step > 2 ? 'bg-coral-500 border-coral-500 text-white' : step === 2 ? 'border-coral-500 text-coral-500' : 'border-paper-300 dark:border-ink-700'
              }`}>
                {step > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span>Message</span>
            </button>

            <div className={`h-px flex-1 ${step > 2 ? 'bg-coral-500' : 'bg-paper-200 dark:bg-ink-800'}`} />

            {/* Step 3 */}
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-coral-500' : 'text-paper-400 dark:text-ink-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                step === 3 ? 'border-coral-500 text-coral-500' : 'border-paper-300 dark:border-ink-700'
              }`}>
                3
              </span>
              <span>Schedule</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: AUDIENCE SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h4 className="text-xs font-semibold text-paper-900 dark:text-white uppercase tracking-wider mb-3">Choose Target Segment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: All Tenants */}
                  <div 
                    onClick={() => setAudienceType('all')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      audienceType === 'all' 
                        ? 'bg-coral-50/40 dark:bg-coral-500/5 border-coral-500/60 shadow-md shadow-coral-500/5' 
                        : 'bg-white dark:bg-ink-950 border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${audienceType === 'all' ? 'bg-coral-100 dark:bg-coral-500/20 text-coral-500' : 'bg-paper-100 dark:bg-ink-800 text-paper-400 dark:text-ink-500'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-paper-800 dark:text-white">All Tenants</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Send to every active tenant across all properties</div>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Internal Team */}
                  <div 
                    onClick={() => setAudienceType('team')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      audienceType === 'team' 
                        ? 'bg-purple-50/40 dark:bg-purple-500/5 border-purple-500/60 shadow-md shadow-purple-500/5' 
                        : 'bg-white dark:bg-ink-950 border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${audienceType === 'team' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-500' : 'bg-paper-100 dark:bg-ink-800 text-paper-400 dark:text-ink-500'}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-paper-800 dark:text-white">Internal Team</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Send to staff and sub-managers in your organization</div>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Specific Property */}
                  <div 
                    onClick={() => setAudienceType('property')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      audienceType === 'property' 
                        ? 'bg-blue-50/40 dark:bg-blue-500/5 border-blue-500/60 shadow-md shadow-blue-500/5' 
                        : 'bg-white dark:bg-ink-950 border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${audienceType === 'property' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-500' : 'bg-paper-100 dark:bg-ink-800 text-paper-400 dark:text-ink-500'}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-paper-800 dark:text-white">Specific Property</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Target a specific building or apartment complex</div>
                      </div>
                    </div>
                  </div>

                  {/* Option 4: Unpaid Invoices / Arrears */}
                  <div 
                    onClick={() => setAudienceType('arrears')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      audienceType === 'arrears' 
                        ? 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-500/60 shadow-md shadow-amber-500/5' 
                        : 'bg-white dark:bg-ink-950 border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${audienceType === 'arrears' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-500' : 'bg-paper-100 dark:bg-ink-800 text-paper-400 dark:text-ink-500'}`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-paper-800 dark:text-white">Unpaid Invoices</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Target only tenants currently in rent arrears</div>
                      </div>
                    </div>
                  </div>


                  {/* Option 6: Lease Expiring */}
                  <div 
                    onClick={() => setAudienceType('lease_expiring')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      audienceType === 'lease_expiring' 
                        ? 'bg-rose-50/40 dark:bg-rose-500/5 border-rose-500/60 shadow-md shadow-rose-500/5' 
                        : 'bg-white dark:bg-ink-950 border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${audienceType === 'lease_expiring' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500' : 'bg-paper-100 dark:bg-ink-800 text-paper-400 dark:text-ink-500'}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-paper-800 dark:text-white">Lease Expirations</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Tenants with lease endings within the next 60 days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Property Dropdown with Sub Options (Units Targeting) */}
              {audienceType === 'property' && (
                <div className="p-4 bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800/80 rounded-xl space-y-4 animate-slide-down">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-coral-500" />
                    <span className="text-xs font-bold text-paper-800 dark:text-white">Target Building Setup</span>
                  </div>
                  {propertiesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-paper-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-coral-500" />
                      <span>Loading active portfolio properties...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select 
                        value={selectedPropertyId}
                        onChange={(e) => {
                          setSelectedPropertyId(e.target.value);
                          setSelectedUnitIds([]);
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-750 rounded-lg text-xs focus:ring-1 focus:ring-coral-500 outline-none dark:text-white"
                      >
                        <option value="">Select a property from your active roster...</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      {/* Units option selector displays if property selected */}
                      {selectedPropertyId && (
                        <div className="border-t border-paper-200 dark:border-ink-800/60 pt-3 space-y-3 animate-fade-in">
                          <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-wider block">Target Specific Segment?</label>
                          <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                name="unitsMode" 
                                checked={targetPropertyUnitsMode === 'all'} 
                                onChange={() => setTargetPropertyUnitsMode('all')}
                                className="accent-coral-500"
                              />
                              <span className="text-paper-700 dark:text-ink-300 font-medium">All Units in this property</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                name="unitsMode" 
                                checked={targetPropertyUnitsMode === 'specific_units'} 
                                onChange={() => setTargetPropertyUnitsMode('specific_units')}
                                className="accent-coral-500"
                              />
                              <span className="text-paper-700 dark:text-ink-300 font-medium">Target Specific Units</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                name="unitsMode" 
                                checked={targetPropertyUnitsMode === 'specific_tenants'} 
                                onChange={() => setTargetPropertyUnitsMode('specific_tenants')}
                                className="accent-coral-500"
                              />
                              <span className="text-paper-700 dark:text-ink-300 font-medium">Target Specific Tenants</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                name="unitsMode" 
                                checked={targetPropertyUnitsMode === 'arrears'} 
                                onChange={() => setTargetPropertyUnitsMode('arrears')}
                                className="accent-coral-500"
                              />
                              <span className="text-paper-700 dark:text-ink-300 font-medium">Tenants in Arrears (Unpaid Invoices)</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                name="unitsMode" 
                                checked={targetPropertyUnitsMode === 'lease_expiring'} 
                                onChange={() => setTargetPropertyUnitsMode('lease_expiring')}
                                className="accent-coral-500"
                              />
                              <span className="text-paper-700 dark:text-ink-300 font-medium">Leases Expiring in 60 Days</span>
                            </label>
                          </div>

                          {/* Specific units multi-select list */}
                          {targetPropertyUnitsMode === 'specific_units' && (
                            <div className="space-y-2 animate-fade-in">
                              {unitsLoading ? (
                                <div className="text-[10px] text-paper-400">Loading units list...</div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto border border-paper-200 dark:border-ink-800 p-2 rounded-lg bg-white dark:bg-ink-900">
                                  {units
                                    .filter(u => u.propertyId === selectedPropertyId)
                                    .map(u => {
                                      const isSelected = selectedUnitIds.includes(u.id);
                                      return (
                                        <div 
                                          key={u.id}
                                          onClick={() => toggleUnitSelection(u.id)}
                                          className={`p-2 rounded-lg border text-center text-xs cursor-pointer transition-all ${
                                            isSelected 
                                              ? 'bg-coral-50/40 dark:bg-coral-500/5 border-coral-500/60 text-coral-700 dark:text-coral-400 font-bold' 
                                              : 'bg-paper-50/30 dark:bg-ink-950/20 border-paper-100 dark:border-ink-850 hover:bg-paper-50 text-paper-600 dark:text-ink-400'
                                          }`}
                                        >
                                          <div>{u.label}</div>
                                          <div className="text-[9px] text-paper-400 mt-0.5 truncate">
                                            {u.tenantName || 'Vacant'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Specific tenants list */}
                          {targetPropertyUnitsMode === 'specific_tenants' && (
                            <div className="space-y-2 animate-fade-in">
                              {tenantsLoading ? (
                                <div className="text-[10px] text-paper-400">Loading tenants list...</div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto border border-paper-200 dark:border-ink-800 p-2 rounded-lg bg-white dark:bg-ink-900">
                                  {tenants
                                    .filter(t => {
                                      const unitObj = units.find(u => u.id === t.unitId);
                                      return unitObj?.propertyId === selectedPropertyId;
                                    })
                                    .map(t => {
                                      const isSelected = selectedTenantIds.includes(t.id);
                                      return (
                                        <div 
                                          key={t.id}
                                          onClick={() => toggleTenantSelection(t.id)}
                                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                            isSelected 
                                              ? 'bg-emerald-50/40 dark:bg-emerald-500/5 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-bold' 
                                              : 'bg-paper-50/30 dark:bg-ink-950/20 border-paper-100 dark:border-ink-850 hover:bg-paper-50 text-paper-600 dark:text-ink-400'
                                          }`}
                                        >
                                          <div className="flex flex-col">
                                            <span>{t.name}</span>
                                            <span className="text-[9px] font-normal text-paper-400">{t.email || 'No email provided'}</span>
                                          </div>
                                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-paper-300 dark:border-ink-600'}`}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {audienceType === 'arrears' && (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-xl flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px]">
                    <strong>Dynamic Filters Applied:</strong> This filter runs dynamically at dispatch time. If a tenant settles their debts during a scheduled campaign wait period, they will automatically be skipped during delivery.
                  </p>
                </div>
              )}

              {audienceType === 'lease_expiring' && (
                <div className="p-3 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px]">
                    <strong>Dynamic Filters Applied:</strong> This filter queries active tenants whose lease expiration date falls within 60 days from dispatch execution, ensuring timely lease renewal offerings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MESSAGE DESIGN */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              {/* Template Selection */}
              <div className="bg-paper-50 dark:bg-ink-950/40 p-4 border border-paper-200/60 dark:border-ink-800/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-paper-800 dark:text-white">
                  <LayoutTemplate className="w-4 h-4 text-coral-500" />
                  <span>Choose Template Layout</span>
                </div>
                {templatesLoading ? (
                  <div className="flex items-center gap-2 text-[10px] text-paper-400">
                    <Loader2 className="w-3 h-3 animate-spin text-coral-500" />
                    <span>Loading templates...</span>
                  </div>
                ) : (
                  <select 
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-750 rounded-lg text-xs focus:ring-1 focus:ring-coral-500 outline-none dark:text-white"
                  >
                    <option value="">Start from scratch (blank message)</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-wider">Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Urgent Rent Payment Reminder or Scheduled Maintenance Notice" 
                  className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-xs focus:ring-1 focus:ring-coral-500 dark:text-white"
                  required
                />
              </div>

              {/* Content Composer */}
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-wider">Message Content</label>
                  
                  {/* Floating placeholders */}
                  <div className="flex gap-1.5 text-[9px] items-center">
                    <span className="text-paper-400">Insert tag:</span>
                    <button 
                      type="button" 
                      onClick={() => insertPlaceholder('{name}')}
                      className="px-1.5 py-0.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 rounded text-paper-700 dark:text-ink-300 font-mono transition-colors active:scale-95"
                    >
                      {`{name}`}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => insertPlaceholder('{property}')}
                      className="px-1.5 py-0.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 rounded text-paper-700 dark:text-ink-300 font-mono transition-colors active:scale-95"
                    >
                      {`{property}`}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => insertPlaceholder('{amount}')}
                      className="px-1.5 py-0.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 rounded text-paper-700 dark:text-ink-300 font-mono transition-colors active:scale-95"
                    >
                      {`{amount}`}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => insertPlaceholder('{date}')}
                      className="px-1.5 py-0.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 rounded text-paper-700 dark:text-ink-300 font-mono transition-colors active:scale-95"
                    >
                      {`{date}`}
                    </button>
                  </div>
                </div>
                
                <textarea 
                  ref={textareaRef}
                  id="broadcast-body"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear {name}, Please be advised that your unit at {property}..." 
                  className="w-full px-4 py-3 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs min-h-[160px] focus:ring-1 focus:ring-coral-500 dark:text-white font-mono leading-relaxed"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULING & REVIEW */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: Scheduling Config */}
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-coral-500" />
                        <span className="text-xs font-bold text-paper-800 dark:text-white">Delivery Schedule</span>
                      </div>
                      
                      {/* Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isScheduling}
                          onChange={(e) => setIsScheduling(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-paper-300 peer-focus:outline-none dark:bg-ink-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-paper-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-ink-600 peer-checked:bg-coral-500"></div>
                      </label>
                    </div>

                    <p className="text-[10px] text-paper-500 dark:text-ink-400">
                      {isScheduling 
                        ? 'Queue broadcast with Cloud Tasks for dispatch at a specific timestamp.' 
                        : 'Dispatch campaign queue instantly.'}
                    </p>

                    {isScheduling && (
                      <div className="space-y-1.5 animate-fade-in pt-1">
                        <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-coral-500" /> Date & Time
                        </label>
                        <input 
                          type="datetime-local" 
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-750 rounded-lg text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Estimated recipients check */}
                  <div className="p-4 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-paper-800 dark:text-white">Delivery Safety Check</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-paper-100 dark:bg-ink-800 rounded text-paper-600 dark:text-ink-400">
                        {estimates.total} matched
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-paper-500">Recipients receiving email:</span>
                        <span className="font-bold text-emerald-600">{estimates.valid}</span>
                      </div>
                      
                      {estimates.missingCount > 0 && (
                        <div className="p-2.5 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 rounded-lg space-y-1 text-[10px]">
                          <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{estimates.missingCount} profiles missing emails</span>
                          </div>
                          <p className="text-paper-500 dark:text-ink-400">
                            These individuals match the targeting criteria but do not have an email registered. They will not receive this campaign:
                          </p>
                          <div className="font-medium text-paper-700 dark:text-ink-300 max-h-[50px] overflow-y-auto mt-1 space-y-0.5">
                            {estimates.missingNames.map((name, idx) => (
                              <div key={idx}>• {name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Campaign Review Card */}
                <div className="p-5 bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800/80 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-paper-800 dark:text-white uppercase tracking-wider border-b border-paper-200 dark:border-ink-800 pb-2">Campaign Summary</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-0.5">
                      <span className="text-paper-500 dark:text-ink-400 text-[10px]">Audience:</span>
                      <span className="font-bold text-paper-800 dark:text-white text-[10px] truncate max-w-[200px]">{getAudienceLabel()}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-paper-500 dark:text-ink-400 text-[10px]">Template Used:</span>
                      <span className="font-semibold text-paper-700 dark:text-ink-300 text-[10px]">
                        {templates.find(t => t.id === selectedTemplateId)?.name || 'Custom (Blank Layout)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-paper-500 dark:text-ink-400 text-[10px]">Delivery Mode:</span>
                      <span className="font-semibold text-paper-700 dark:text-ink-300 text-[10px] flex items-center gap-1">
                        {isScheduling ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{scheduleDate ? new Date(scheduleDate).toLocaleString() : 'Scheduled'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 text-emerald-500" />
                            <span>Immediate Delivery</span>
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="h-px bg-paper-200 dark:bg-ink-800 w-full my-2" />

                    <div className="space-y-1">
                      <span className="text-paper-500 dark:text-ink-400 text-[9px] uppercase tracking-wider block">Subject Preview:</span>
                      <p className="font-semibold text-paper-900 dark:text-white text-[10px] line-clamp-1 bg-white dark:bg-ink-900 px-2 py-1 rounded border border-paper-100 dark:border-ink-800">{subject || '(No Subject)'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/50 flex justify-between items-center flex-shrink-0">
          <div>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                type="button" 
                className="px-4 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-white text-xs font-semibold rounded-lg hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button onClick={onClose} type="button" className="px-4 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-white text-xs font-semibold rounded-lg hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors">
              Cancel
            </button>

            {step < 3 ? (
              <button 
                onClick={() => isStepValid(step) && setStep(step + 1)}
                type="button"
                disabled={!isStepValid(step)}
                className="px-5 py-2 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-coral-500/10"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={handleSend}
                disabled={isSubmitting || !isStepValid(3)}
                className="px-6 py-2 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isScheduling ? 'Schedule Dispatch' : 'Queue Dispatch'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
