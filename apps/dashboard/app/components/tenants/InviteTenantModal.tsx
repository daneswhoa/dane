import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Mail, Copy, Check, Loader2 } from 'lucide-react';

interface Property {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  propertyId: string;
  label: string;
  status: string;
}

interface InviteTenantModalProps {
  onClose: () => void;
  ownerId?: string;
}

export function InviteTenantModal({ onClose, ownerId = 'current-user-id' }: InviteTenantModalProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch properties and units on mount
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setProperties(data) : [])
      .catch(() => {});
      
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/units`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setUnits(data) : [])
      .catch(() => {});
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedPropertyId || !selectedUnitId) {
      setError('Please select a property and unit.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          unitId: selectedUnitId,
          ownerId: ownerId,
          email: tenantEmail ? tenantEmail.trim() : null,
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate invite');
      
      setGeneratedCode(data.code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    const inviteLink = `${window.location.origin}/invite?code=${generatedCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredUnits = units.filter(u => u.propertyId === selectedPropertyId && u.status === 'vacant');
  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/invite?code=${generatedCode}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-900/80 dark:bg-ink-950/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-2xl max-w-md w-full animate-slide-up">
        <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center bg-paper-50 dark:bg-ink-950/50">
          <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Invite New Tenant</h3>
          <button onClick={onClose} className="text-paper-400 hover:text-paper-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          {generatedCode ? (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-paper-900 dark:text-white">Invite Generated!</h4>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1">Share either the invite code or the secure link below with your tenant.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">Invite Code</span>
                  <div className="flex items-center justify-between bg-paper-50 dark:bg-ink-950/50 rounded-md p-2.5 border border-paper-200 dark:border-ink-800">
                    <code className="text-coral-500 font-mono font-bold text-sm pl-1">{generatedCode}</code>
                    <button 
                      type="button"
                      onClick={copyCode}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-paper-200 dark:bg-ink-800 hover:bg-paper-300 dark:hover:bg-ink-700 text-paper-700 dark:text-white text-[10px] font-semibold rounded transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">Invite Link (Whatsapp / SMS)</span>
                  <div className="flex items-center justify-between bg-paper-50 dark:bg-ink-950/50 rounded-md p-2.5 border border-paper-200 dark:border-ink-800">
                    <span className="text-[11px] truncate pr-4 text-paper-600 dark:text-ink-300">{inviteLink}</span>
                    <button 
                      type="button"
                      onClick={copyLink}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-paper-200 dark:bg-ink-800 hover:bg-paper-300 dark:hover:bg-ink-700 text-paper-700 dark:text-white text-[10px] font-semibold rounded transition-colors flex-shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={onClose} className="w-full px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-md transition-colors mt-6">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              {error && <div className="p-2.5 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs rounded border border-red-200 dark:border-red-500/20">{error}</div>}
              
              <div className="text-[11px] text-paper-500 dark:text-ink-400 bg-paper-50 dark:bg-ink-950/60 p-2.5 rounded-lg border border-paper-100 dark:border-ink-800 space-y-1">
                <span className="font-semibold text-paper-700 dark:text-ink-200 block">Choose how to invite:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  <li>Provide an email to automatically send a branded invitation link.</li>
                  <li>Or, leave the email blank to copy the invite code & link to share manually (e.g. via WhatsApp).</li>
                </ul>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300">Target Property</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-paper-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedPropertyId}
                    onChange={e => { setSelectedPropertyId(e.target.value); setSelectedUnitId(''); }}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs focus:ring-1 focus:ring-coral-500 outline-none dark:text-white"
                  >
                    <option value="">Select Property...</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300">Target Unit</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-paper-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedUnitId}
                    onChange={e => setSelectedUnitId(e.target.value)}
                    disabled={!selectedPropertyId}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs focus:ring-1 focus:ring-coral-500 outline-none disabled:opacity-50 dark:text-white"
                  >
                    <option value="">Select Unit...</option>
                    {filteredUnits.map(u => <option key={u.id} value={u.id}>Unit {u.label}</option>)}
                  </select>
                </div>
                {selectedPropertyId && filteredUnits.length === 0 && (
                  <span className="text-[10px] text-coral-500 mt-1 block">No vacant units available for this property.</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300">Tenant Email (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-paper-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                    placeholder="tenant@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs focus:ring-1 focus:ring-coral-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !selectedPropertyId || !selectedUnitId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Invite'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
