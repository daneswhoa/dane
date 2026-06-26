import React, { useState, useEffect } from 'react';
import { Copy, Plus, Mail, Check, Shield, Users, Building, MoreVertical, Loader2, BookOpen } from 'lucide-react';
import { InviteTenantModal } from '../tenants/InviteTenantModal';

const MODULE_TABS = [
  { name: 'Properties', actions: ['View Properties', 'List New', 'Edit', 'Delete'] },
  { name: 'Tenants', actions: ['View Tenants', 'Add Tenant', 'Manage Leases', 'Evictions'] },
  { name: 'Finance', actions: ['View Ledgers', 'Process Payments', 'Issue Refunds'] },
  { name: 'Maintenance', actions: ['View Tickets', 'Assign Contractor', 'Approve Invoices'] },
  { name: 'Contractors', actions: ['View Directory', 'Add Contractor', 'Pay Contractor'] },
  { name: 'Communication', actions: ['Send Messages', 'Create Announcements', 'Manage Templates'] },
  { name: 'Security and Audit', actions: ['View Audit Logs', 'Manage Roles', 'Export Data'] },
];

export default function TeamRoster() {
  const [copied, setCopied] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTenantInviteModalOpen, setIsTenantInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamInvites, setTeamInvites] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Property Manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [isAllProperties, setIsAllProperties] = useState(true);
  
  const [permissions, setPermissions] = useState<Record<string, { access: 'none' | 'read' | 'full' | 'custom', actions: string[] }>>({
    Properties: { access: 'full', actions: MODULE_TABS[0].actions },
    Tenants: { access: 'full', actions: MODULE_TABS[1].actions },
    Finance: { access: 'full', actions: MODULE_TABS[2].actions },
    Maintenance: { access: 'full', actions: MODULE_TABS[3].actions },
    Contractors: { access: 'full', actions: MODULE_TABS[4].actions },
    Communication: { access: 'full', actions: MODULE_TABS[5].actions },
    'Security and Audit': { access: 'full', actions: MODULE_TABS[6].actions },
  });

  const getPresetActions = (module: string, accessType: 'read' | 'full') => {
    const modObj = MODULE_TABS.find(m => m.name === module);
    if (!modObj) return [];
    if (accessType === 'full') return [...modObj.actions];
    if (accessType === 'read') {
      return modObj.actions.filter(act => act.startsWith('View') || act.includes('Logs') || act.includes('Directory'));
    }
    return [];
  };

  // Adjust permissions dynamically when Preset Role changes
  useEffect(() => {
    const updated = { ...permissions };
    if (inviteRole === 'Landlord (Read-Only)') {
      Object.keys(updated).forEach(module => {
        updated[module] = { access: 'read', actions: getPresetActions(module, 'read') };
      });
    } else if (inviteRole === 'Property Manager') {
      Object.keys(updated).forEach(module => {
        updated[module] = { access: 'full', actions: getPresetActions(module, 'full') };
      });
    } else if (inviteRole === 'Maintenance Tech') {
      Object.keys(updated).forEach(module => {
        if (module === 'Maintenance' || module === 'Contractors') {
          updated[module] = { access: 'full', actions: getPresetActions(module, 'full') };
        } else if (module === 'Properties' || module === 'Tenants') {
          updated[module] = { access: 'read', actions: getPresetActions(module, 'read') };
        } else {
          updated[module] = { access: 'none', actions: [] };
        }
      });
    } else if (inviteRole === 'Operations Lead') {
      Object.keys(updated).forEach(module => {
        updated[module] = { access: 'full', actions: getPresetActions(module, 'full') };
      });
    }
    setPermissions(updated);
  }, [inviteRole]);

  const fetchTeam = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/team', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
        setTeamInvites(data.invites || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/properties', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProperties(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchProperties();
  }, []);

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/team/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: inviteEmail, 
          role: inviteRole, 
          allowedProperties: isAllProperties ? 'all' : selectedProperties,
          permissions: permissions 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setInviteEmail('');
        setSelectedProperties([]);
        setIsAllProperties(true);
        setIsInviteModalOpen(false);
        fetchTeam();
      } else {
        setModalError(data.message || 'Failed to create team invite.');
      }
    } catch (e: any) {
      console.error(e);
      setModalError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPropertyScopeLabel = (scope: string) => {
    if (!scope || scope === 'all') return 'Global (All)';
    const ids = scope.split(',');
    const names = ids.map(id => properties.find(p => p.id === id)?.name || id);
    if (names.length === 0) return 'None';
    if (names.length <= 2) return names.join(', ');
    return `${names.length} Scoped Properties`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Organization Setup & Management Guides */}
      <div 
        className="bg-ink-950 dark:bg-black rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-xl min-h-[160px]"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(5, 8, 11, 0.95)), url("/org_guide_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Platform Reference Guides
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Managing Your Organization</h2>
          <p className="text-xs text-ink-300 leading-relaxed">
            Learn how to structure roles, define custom property scopes, invite tenants, and automate notifications. Landlord.nl organizations support hierarchical access levels to delegate portfolio operations efficiently.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-ink-400">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
              <span>Invite links are single-use for security</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-400">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
              <span>Granular tab controls protect sensitive data</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-400">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
              <span>Audit logs record all workspace actions</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-2 flex-shrink-0">
          <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-4 flex flex-col justify-center min-w-[220px]">
            <div className="text-[10px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Quick Reference Docs</div>
            <div className="space-y-1.5 mt-1">
              <div className="text-xs font-semibold text-white hover:text-coral-400 cursor-pointer transition-colors">
                • Role Configuration
              </div>
              <div className="text-xs font-semibold text-white hover:text-coral-400 cursor-pointer transition-colors">
                • Scoped Property Setup
              </div>
              <div className="text-xs font-semibold text-white hover:text-coral-400 cursor-pointer transition-colors">
                • Audit Logging Standards
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Team Roster */}
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-paper-200 dark:border-ink-700 flex justify-between items-center bg-paper-50 dark:bg-ink-900/50">
          <div>
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Active Team Roster</h3>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Manage the personnel who have access to your portfolio.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsTenantInviteModalOpen(true)}
              className="px-3.5 py-1.5 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs font-semibold rounded-md hover:bg-paper-50 dark:hover:bg-ink-900 transition-colors"
            >
              Invite Tenant
            </button>
            <button 
              onClick={() => { setModalError(null); setIsInviteModalOpen(true); }}
              className="px-3.5 py-1.5 bg-coral-500 text-white text-xs font-semibold rounded-md hover:bg-coral-600 transition-colors shadow-lg shadow-coral-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Team Member
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-50 dark:bg-ink-950/20 text-[9px] uppercase font-medium text-paper-500 dark:text-ink-400 tracking-wider">
              <tr>
                <th className="px-4 py-2.5 border-b border-paper-200 dark:border-ink-700">Team Member</th>
                <th className="px-4 py-2.5 border-b border-paper-200 dark:border-ink-700">Assigned Role</th>
                <th className="px-4 py-2.5 border-b border-paper-200 dark:border-ink-700">Property Scope</th>
                <th className="px-4 py-2.5 border-b border-paper-200 dark:border-ink-700 text-center">Security (2FA)</th>
                <th className="px-4 py-2.5 border-b border-paper-200 dark:border-ink-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-100 dark:divide-ink-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-paper-500 dark:text-ink-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-coral-500" />
                      <span className="text-xs">Loading team roster...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {teamMembers.map((member, i) => (
                    <tr key={member.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${i === 0 ? 'bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                            {member.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                              {member.name || member.email.split('@')[0]}
                              {i === 0 && <span className="bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide font-medium">You</span>}
                            </div>
                            <div className="text-[11px] text-paper-500 dark:text-ink-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${i === 0 ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                          {i === 0 ? <Shield className="w-3 h-3" /> : <Building className="w-3 h-3" />} 
                          {member.role || 'Member'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-paper-600 dark:text-ink-300 font-medium text-[11px] truncate max-w-[180px]">
                        {getPropertyScopeLabel(member.allowedProperties)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 hover:bg-paper-100 dark:hover:bg-ink-700 rounded text-paper-400 dark:text-ink-500 transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {teamInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">
                            {invite.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-paper-900 dark:text-white">Invited User</div>
                            <div className="text-[11px] text-paper-500 dark:text-ink-400">{invite.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                          <Users className="w-3 h-3" /> {invite.role}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-paper-600 dark:text-ink-300 font-medium text-[11px] truncate max-w-[180px]">
                        {getPropertyScopeLabel(invite.allowedProperties)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[9px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Pending Setup</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 hover:bg-paper-100 dark:hover:bg-ink-700 rounded text-paper-400 dark:text-ink-500 transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {teamMembers.length === 0 && teamInvites.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-paper-500 dark:text-ink-400">
                        No team members found. Start building your team!
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-5 animate-fade-in backdrop-blur-sm bg-paper-900/80 dark:bg-ink-950/90">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full animate-slide-up max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center bg-paper-50 dark:bg-ink-950/50 flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-coral-500" /> Invite Team Member & Configure Roles
                </h3>
                <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Granularly configure exact module capabilities for this invitation.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-paper-600 dark:text-ink-400">Preset:</span>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 text-paper-900 dark:text-white text-xs font-semibold rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-coral-500"
                >
                  <option>Landlord (Read-Only)</option>
                  <option>Property Manager</option>
                  <option>Maintenance Tech</option>
                  <option>Operations Lead</option>
                </select>
                <button onClick={() => setIsInviteModalOpen(false)} className="px-3 py-1 bg-paper-200 dark:bg-ink-800 hover:bg-paper-300 dark:hover:bg-ink-700 text-paper-800 dark:text-white text-xs font-semibold rounded-md transition-colors ml-1">
                  Cancel
                </button>
                <button onClick={handleSendInvite} disabled={isSubmitting || !inviteEmail} className="px-3 py-1 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5">
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Send Invite
                </button>
              </div>
            </div>
            
            {modalError && (
              <div className="px-5 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-between flex-shrink-0 animate-fade-in">
                <span>Error: {modalError}</span>
                <button onClick={() => setModalError(null)} className="text-[10px] underline hover:no-underline font-bold">Dismiss</button>
              </div>
            )}
            
            <div className="p-4 border-b border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-900 flex flex-col md:flex-row gap-4 flex-shrink-0">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300">Invitee Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Mail className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
                  </div>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com" 
                    className="w-full pl-8 pr-3 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs focus:ring-1 focus:ring-coral-500 focus:border-coral-500 transition-colors dark:text-white" 
                  />
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300 block">Property Scope Access</label>
                <div className="flex items-center gap-3 h-[30px]">
                  <label className="flex items-center gap-1.5 text-xs text-paper-700 dark:text-ink-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="propScope" 
                      checked={isAllProperties} 
                      onChange={() => setIsAllProperties(true)}
                      className="accent-coral-500 animate-none cursor-pointer"
                    />
                    <span>Global (All Properties)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-paper-700 dark:text-ink-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="propScope" 
                      checked={!isAllProperties} 
                      onChange={() => setIsAllProperties(false)}
                      className="accent-coral-500 animate-none cursor-pointer"
                    />
                    <span>Scoped (Selected Properties)</span>
                  </label>
                </div>
              </div>
            </div>

            {!isAllProperties && (
              <div className="px-4 py-3 bg-paper-50 dark:bg-ink-950/40 border-b border-paper-200 dark:border-ink-800 flex-shrink-0 animate-fade-in">
                <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 block mb-2 tracking-wider">Tick Applicable Properties</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-28 overflow-y-auto pr-1">
                  {properties.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer group bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800/80 px-2 py-1.5 rounded-md hover:border-paper-300 dark:hover:border-ink-700 transition-all">
                      <input 
                        type="checkbox"
                        checked={selectedProperties.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProperties([...selectedProperties, p.id]);
                          } else {
                            setSelectedProperties(selectedProperties.filter(id => id !== p.id));
                          }
                        }}
                        className="accent-coral-500 w-3 h-3 rounded bg-white dark:bg-ink-900 border-paper-300 dark:border-ink-700" 
                      />
                      <span className="text-[11px] text-paper-600 dark:text-ink-300 group-hover:text-paper-900 dark:group-hover:text-white font-medium transition-colors truncate">{p.name}</span>
                    </label>
                  ))}
                  {properties.length === 0 && (
                    <span className="text-[10px] text-paper-400">No properties found. Add properties first.</span>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 p-4 pt-0 mt-4">
              <div className="space-y-3">
                {MODULE_TABS.map((module, idx) => {
                  const currentAccess = permissions[module.name]?.access || 'none';
                  const currentSelectedActions = permissions[module.name]?.actions || [];
                  
                  const handleAccessChange = (val: 'none' | 'read' | 'full' | 'custom') => {
                    const updated = { ...permissions };
                    let acts: string[] = [];
                    if (val === 'full') acts = [...module.actions];
                    else if (val === 'read') acts = getPresetActions(module.name, 'read');
                    updated[module.name] = { access: val, actions: acts };
                    setPermissions(updated);
                  };

                  const handleActionToggle = (action: string, isChecked: boolean) => {
                    const updated = { ...permissions };
                    const currentActions = updated[module.name]?.actions || [];
                    let newActions = [...currentActions];
                    if (isChecked) {
                      if (!newActions.includes(action)) newActions.push(action);
                    } else {
                      newActions = newActions.filter(a => a !== action);
                    }
                    updated[module.name] = { 
                      access: 'custom', 
                      actions: newActions 
                    };
                    setPermissions(updated);
                  };

                  return (
                    <div key={idx} className="bg-paper-50 dark:bg-ink-950/30 border border-paper-200 dark:border-ink-800 rounded-lg p-3 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-semibold text-paper-900 dark:text-white">{module.name}</h4>
                          <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">
                            {currentSelectedActions.length > 0 
                              ? `Active capabilities: ${currentSelectedActions.join(', ')}`
                              : 'No access permitted'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <select 
                            value={currentAccess}
                            onChange={(e) => handleAccessChange(e.target.value as any)}
                            className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-paper-900 dark:text-white text-[11px] font-semibold rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-coral-500 w-full sm:w-auto"
                          >
                            <option value="none">No Access</option>
                            <option value="read">Read-Only</option>
                            <option value="full">Full Access</option>
                            <option value="custom">Custom Permissions</option>
                          </select>
                        </div>
                      </div>
                      
                      {(currentAccess === 'custom' || currentAccess === 'read') && (
                        <div className="pt-3 mt-1 border-t border-paper-200 dark:border-ink-800">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {module.actions.map((action, actIdx) => {
                              const isChecked = currentSelectedActions.includes(action);
                              return (
                                <label key={actIdx} className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={(e) => handleActionToggle(action, e.target.checked)}
                                    className="accent-coral-500 w-3 h-3 rounded bg-white dark:bg-ink-900 border-paper-300 dark:border-ink-700" 
                                  />
                                  <span className="text-[10px] font-medium text-paper-600 dark:text-ink-300 group-hover:text-paper-900 dark:group-hover:text-white transition-colors">{action}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isTenantInviteModalOpen && (
        <InviteTenantModal onClose={() => setIsTenantInviteModalOpen(false)} />
      )}
    </div>
  );
}
