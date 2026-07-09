'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@repo/auth';
import { 
  Camera, TrendingUp, Users, Home, Zap, MapPin, Save, AlertTriangle, 
  Mail, CheckCircle2, Loader2, Shield, MoreVertical, BookOpen, Plus, 
  Copy, Check, Info, Lock, ShieldAlert, Settings, Wrench, Wallet, Building, CreditCard, Crown, Coins
} from 'lucide-react';
import { InviteTenantModal } from '../../components/tenants/InviteTenantModal';
import { SubscriptionTab } from './components/SubscriptionTab';
import { CreditsWalletTab } from './components/CreditsWalletTab';
import { RolesMatrixTab } from './components/RolesMatrixTab';

const MODULE_TABS = [
  { name: 'Properties', actions: ['View Properties', 'List New', 'Edit', 'Delete'] },
  { name: 'Tenants', actions: ['View Tenants', 'Add Tenant', 'Manage Leases', 'Evictions'] },
  { name: 'Finance', actions: ['View Ledgers', 'Process Payments', 'Issue Refunds'] },
  { name: 'Maintenance', actions: ['View Tickets', 'Assign Contractor', 'Approve Invoices'] },
  { name: 'Contractors', actions: ['View Directory', 'Add Contractor', 'Pay Contractor'] },
  { name: 'Communication', actions: ['Send Messages', 'Create Announcements', 'Manage Templates'] },
  { name: 'Security and Audit', actions: ['View Audit Logs', 'Manage Roles', 'Export Data'] },
];

export default function OrganizationPage() {
  const { data: session, refetch } = useSession();
  const user = session?.user as any;

  const [activeTab, setActiveTab] = useState<'profile' | 'members' | 'roles' | 'subscription' | 'credits'>('profile');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUnits: 0,
    activeTenants: 0,
    occupancyRate: '0%',
    aumValue: '$0',
    geography: []
  });

  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Tab 2: Members Directory State
  const [copied, setCopied] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTenantInviteModalOpen, setIsTenantInviteModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamInvites, setTeamInvites] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Property Manager');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [isAllProperties, setIsAllProperties] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);

  // Invite Permissions state
  const [invitePermissions, setInvitePermissions] = useState<Record<string, { access: 'none' | 'read' | 'full' | 'custom', actions: string[] }>>({
    Properties: { access: 'full', actions: MODULE_TABS[0].actions },
    Tenants: { access: 'full', actions: MODULE_TABS[1].actions },
    Finance: { access: 'full', actions: MODULE_TABS[2].actions },
    Maintenance: { access: 'full', actions: MODULE_TABS[3].actions },
    Contractors: { access: 'full', actions: MODULE_TABS[4].actions },
    Communication: { access: 'full', actions: MODULE_TABS[5].actions },
    'Security and Audit': { access: 'full', actions: MODULE_TABS[6].actions },
  });

  // Edit Member Access State
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editProperties, setEditProperties] = useState<string[]>([]);
  const [editIsAllProperties, setEditIsAllProperties] = useState(true);
  const [editPermissions, setEditPermissions] = useState<Record<string, { access: 'none' | 'read' | 'full' | 'custom', actions: string[] }>>({});
  const [isSavingAccess, setIsSavingAccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Tab 4: Billing & Subscriptions State
  const [billingData, setBillingData] = useState<any>({
    subscription: { tier: 'free', status: 'active', expiresAt: null },
    tokenBalance: 0,
    usage: []
  });
  const [billingLoading, setBillingLoading] = useState(false);
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [selectedTeammateFilter, setSelectedTeammateFilter] = useState('all');
  const [creditRechargeAmount, setCreditRechargeAmount] = useState(1500);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setOrgName(user.organizationName || '');
      setUsername(user.username || '');
    }
  }, [user]);

  const getPresetActions = (module: string, accessType: 'read' | 'full') => {
    const modObj = MODULE_TABS.find(m => m.name === module);
    if (!modObj) return [];
    if (accessType === 'full') return [...modObj.actions];
    if (accessType === 'read') {
      return modObj.actions.filter(act => act.startsWith('View') || act.includes('Logs') || act.includes('Directory'));
    }
    return [];
  };

  const getRolePresetPermissions = (roleName: string) => {
    const updated = {
      Properties: { access: 'none', actions: [] },
      Tenants: { access: 'none', actions: [] },
      Finance: { access: 'none', actions: [] },
      Maintenance: { access: 'none', actions: [] },
      Contractors: { access: 'none', actions: [] },
      Communication: { access: 'none', actions: [] },
      'Security and Audit': { access: 'none', actions: [] },
    } as any;

    if (roleName === 'Landlord (Read-Only)') {
      Object.keys(updated).forEach(module => {
        updated[module] = { access: 'read', actions: getPresetActions(module, 'read') };
      });
    } else if (roleName === 'Property Manager') {
      Object.keys(updated).forEach(module => {
        updated[module] = { access: 'full', actions: getPresetActions(module, 'full') };
      });
    } else if (roleName === 'Maintenance Tech') {
      Object.keys(updated).forEach(module => {
        if (module === 'Maintenance' || module === 'Contractors') {
          updated[module] = { access: 'full', actions: getPresetActions(module, 'full') };
        } else if (module === 'Properties' || module === 'Tenants') {
          updated[module] = { access: 'read', actions: getPresetActions(module, 'read') };
        } else {
          updated[module] = { access: 'none', actions: [] };
        }
      });
    } else if (roleName === 'Operations Lead' || roleName === 'landlord' || roleName === 'manager') {
      Object.keys(updated).forEach(module => {
        updated[module] = { access: 'full', actions: getPresetActions(module, 'full') };
      });
    }
    return updated;
  };

  // Adjust invite permissions preset on role selection change
  useEffect(() => {
    setInvitePermissions(getRolePresetPermissions(inviteRole));
  }, [inviteRole]);

  // Adjust edit permissions preset on role selection change
  const handleEditRolePresetChange = (newRole: string) => {
    setEditRole(newRole);
    setEditPermissions(getRolePresetPermissions(newRole));
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/org-stats`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch org stats', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
        setTeamInvites(data.invites || []);
      }
    } catch (e) {
      console.error('Failed to fetch team roster:', e);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProperties(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch properties:', e);
    }
  };

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    const form = e.target as HTMLFormElement;
    const orgNameInput = (form.elements.namedItem('orgName') as HTMLInputElement).value;
    const usernameInput = (form.elements.namedItem('username') as HTMLInputElement).value;
    const logoInput = form.elements.namedItem('logo') as HTMLInputElement;

    const formData = new FormData();
    formData.append('organizationName', orgNameInput);
    formData.append('username', usernameInput);
    formData.append('userId', user.id);
    if (logoInput.files && logoInput.files[0]) {
      formData.append('logo', logoInput.files[0]);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/setup`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create organization');
      }

      window.location.reload();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organization');
    } finally {
      setCreateLoading(false);
    }
  };

  const fetchBillingInfo = async () => {
    setBillingLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/billing-info`;
      const queryParams: string[] = [];
      if (dateFilterStart) queryParams.push(`startDate=${dateFilterStart}`);
      if (dateFilterEnd) queryParams.push(`endDate=${dateFilterEnd}`);
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
      }
    } catch (e) {
      console.error('Failed to fetch billing info:', e);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleCancelPremium = async () => {
    if (!confirm('Are you sure you want to cancel your Premium subscription? Your limits will be reduced to 3 properties, and access to Sophia AI will be disabled.')) return;
    setBillingLoading(true);
    setBillingMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/billing/cancel-subscription`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setBillingMessage('Premium subscription has been cancelled.');
        fetchBillingInfo();
      } else {
        throw new Error('Failed to cancel subscription.');
      }
    } catch (err: any) {
      setBillingMessage(err.message || 'Action failed.');
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscription' || activeTab === 'credits') {
      fetchBillingInfo();
    }
  }, [activeTab, dateFilterStart, dateFilterEnd]);

  useEffect(() => {
    fetchStats();
    fetchTeam();
    fetchProperties();
  }, []);

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !username) return;

    setIsSaving(true);
    setSaveStatus('saving');
    setErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/org-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName: orgName, username }),
        credentials: 'include'
      });

      if (res.ok) {
        setSaveStatus('success');
        if (refetch) {
          await refetch();
        }
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update organization settings.');
      }
    } catch (e: any) {
      console.error(e);
      setSaveStatus('error');
      setErrorMessage(e.message || 'Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setIsSubmittingInvite(true);
    setModalError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: inviteEmail, 
          role: inviteRole, 
          allowedProperties: isAllProperties ? 'all' : selectedProperties,
          permissions: invitePermissions 
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
      setIsSubmittingInvite(false);
    }
  };

  // Open "Manage Access" Editor
  const startEditingAccess = (member: any) => {
    setEditingMember(member);
    setEditRole(member.role || 'Property Manager');
    setEditIsAllProperties(!member.allowedProperties || member.allowedProperties === 'all');
    setEditProperties(!member.allowedProperties || member.allowedProperties === 'all' ? [] : member.allowedProperties.split(','));
    
    // Parse permissions
    let parsedPerms = {} as any;
    if (member.permissions) {
      try {
        parsedPerms = typeof member.permissions === 'string' 
          ? JSON.parse(member.permissions) 
          : member.permissions;
      } catch (e) {
        console.error('Failed to parse member permissions', e);
      }
    }
    
    // Merge with defaults if modules are missing
    const merged = { ...getRolePresetPermissions(member.role || 'Property Manager') };
    Object.keys(parsedPerms).forEach(k => {
      merged[k] = parsedPerms[k];
    });
    setEditPermissions(merged);
    setEditError(null);
  };

  // Save "Manage Access" Editor
  const handleSaveAccess = async () => {
    if (!editingMember) return;
    setIsSavingAccess(true);
    setEditError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/members/${editingMember.id}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: editRole,
          allowedProperties: editIsAllProperties ? 'all' : editProperties,
          permissions: editPermissions
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEditingMember(null);
        fetchTeam();
      } else {
        setEditError(data.message || 'Failed to update member access settings.');
      }
    } catch (e: any) {
      console.error(e);
      setEditError(e.message || 'Network communication error.');
    } finally {
      setIsSavingAccess(false);
    }
  };

  const getPropertyScopeLabel = (scope: string) => {
    if (!scope || scope === 'all') return 'Global (All)';
    const ids = scope.split(',');
    const names = ids.map(id => properties.find(p => p.id === id)?.name || id);
    if (names.length === 0) return 'None';
    if (names.length <= 2) return names.join(', ');
    return `${names.length} Scoped Properties`;
  };

  if (!user) return null;

  if (!user.organizationName) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12 mt-10">
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-coral-50 dark:bg-coral-500/10 rounded-full flex items-center justify-center mx-auto border border-coral-100 dark:border-coral-500/20 shadow-inner">
            <Building className="w-8 h-8 text-coral-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">Create your Organization</h2>
            <p className="text-xs text-paper-500 dark:text-ink-400 mt-2 max-w-sm mx-auto">
              You are not associated with any organization yet. Register one below to activate your dashboard.
            </p>
          </div>

          <form onSubmit={handleCreateOrganization} className="space-y-4 text-left pt-4">
            {createError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900/50">
                {createError}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Organization Name *</label>
              <input type="text" name="orgName" placeholder="e.g. Westside Realty Group" required className="w-full px-4 py-2.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Your Username *</label>
              <input type="text" name="username" defaultValue={user.username || ''} required className="w-full px-4 py-2.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Organization Logo (Optional)</label>
              <div className="flex items-center justify-center w-full mt-1">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-paper-200 dark:border-ink-700 border-dashed rounded-lg cursor-pointer bg-paper-50 dark:bg-ink-955 hover:bg-paper-100 dark:hover:bg-ink-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 text-paper-500 dark:text-ink-400">
                    <Camera className="w-6 h-6 mb-1 text-paper-400 dark:text-ink-500" />
                    <p className="text-[10px] font-medium">Click to upload logo</p>
                  </div>
                  <input type="file" name="logo" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
            
            <div className="pt-4">
              <button type="submit" disabled={createLoading} className="w-full px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-coral-500/20 transition-all disabled:opacity-50">
                {createLoading ? 'Creating organization...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-paper-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-coral-500" /> Organization Centre
          </h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            Administer identity settings, define granular permission matrices, and scope team property boundaries.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border border-paper-200 dark:border-ink-700 rounded-md p-1 bg-paper-50 dark:bg-ink-950/40">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
          >
            Profile & Identity
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'members' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
          >
            Members & Security
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'roles' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
          >
            Roles Matrix
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${activeTab === 'subscription' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
          >
            <Crown className="w-3 h-3" /> Plan
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${activeTab === 'credits' ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'}`}
          >
            <Coins className="w-3 h-3" /> Credits
          </button>
        </div>
      </div>

      {/* Tab 1: Profile & Identity Settings */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile Hero Banner */}
          <div 
            className="bg-ink-950 dark:bg-black rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-sm min-h-[140px]"
            style={{
              backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(5, 8, 11, 0.95)), url("/profile_identity_banner.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" /> Organization Identity
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Profile & Brand Settings</h2>
              <p className="text-[11px] text-ink-300 leading-relaxed">
                Manage your organization's legal name, unique username, logo, and public-facing metadata. Monitor portfolio statistics and geographic distribution.
              </p>
            </div>
            <div className="relative z-10 flex gap-2 flex-shrink-0">
              <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-3.5 flex flex-col justify-center min-w-[200px]">
                <div className="text-[9px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Quick Stats</div>
                <div className="space-y-1 mt-1 text-[11px] text-ink-300">
                  <div>• {stats.totalUnits} total units managed</div>
                  <div>• {stats.activeTenants} active tenants</div>
                  <div>• {stats.occupancyRate} occupancy rate</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Core Identity & Stats */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                <div className="relative group cursor-pointer">
                  <div className="w-16 h-16 rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-900 flex items-center justify-center text-xl font-bold text-paper-400 dark:text-ink-500 shadow-sm overflow-hidden transform group-hover:scale-105 transition-all duration-300">
                    {user.image ? (
                      <img src={user.image} alt={orgName} className="w-full h-full object-cover" />
                    ) : (
                      orgName?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white mb-0.5" />
                    <span className="text-[9px] text-white font-medium uppercase tracking-widest">Update</span>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-base font-semibold text-paper-900 dark:text-white tracking-tight">{orgName}</h2>
                  <div className="text-xs font-medium text-coral-500 mt-0.5 mb-1">@{username || 'company'}</div>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-relaxed px-2">
                    Enterprise real estate management firm specializing in high-yield multi-family residential portfolios.
                  </p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-paper-200 dark:via-ink-700 to-transparent my-2" />
                
                <div className="flex justify-between w-full text-left px-1">
                  <div>
                    <div className="text-[9px] font-medium text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-0.5">Owner</div>
                    <div className="text-xs font-medium text-paper-900 dark:text-white">{user.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-medium text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-0.5">Established</div>
                    <div className="text-xs font-medium text-paper-900 dark:text-white">June 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dense Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
                <Home className="w-4 h-4 text-blue-500 mb-2" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
                ) : (
                  <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.totalUnits}</div>
                )}
                <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">Total Units</div>
              </div>
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
                <Users className="w-4 h-4 text-emerald-500 mb-2" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
                ) : (
                  <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.activeTenants}</div>
                )}
                <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">Active Tenants</div>
              </div>
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
                <Zap className="w-4 h-4 text-coral-500 mb-2" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
                ) : (
                  <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.occupancyRate}</div>
                )}
                <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">Occupancy</div>
              </div>
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
                <TrendingUp className="w-4 h-4 text-purple-500 mb-2" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
                ) : (
                  <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.aumValue}</div>
                )}
                <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">AUM Value</div>
              </div>
            </div>

          </div>

          {/* Right Column - Geography Map & settings */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Geography */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-4 sm:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-coral-500" /> Portfolio Geography
                  </h3>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Geographic distribution of your managed assets.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {loading ? (
                  <div className="col-span-3 py-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
                  </div>
                ) : stats.geography && stats.geography.length > 0 ? (
                  stats.geography.map((loc: any, i: number) => (
                    <div key={i} className="p-3 rounded-md bg-paper-50 dark:bg-ink-900/50 border border-paper-200 dark:border-ink-700 hover:border-coral-500/30 transition-colors">
                      <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2">{loc.region}</div>
                      <div className="flex justify-between items-end mb-1.5">
                        <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Units</div>
                        <div className="text-xs font-semibold text-paper-900 dark:text-white">{loc.units}</div>
                      </div>
                      <div className="flex justify-between items-end mb-2.5">
                        <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Revenue</div>
                        <div className="text-xs font-semibold text-paper-900 dark:text-white">{loc.revenue}</div>
                      </div>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-medium uppercase tracking-wider rounded font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> {loc.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-6 text-xs text-paper-400">No geographic data found.</div>
                )}
              </div>
            </div>

            {/* Brand Settings */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50">
                <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Organization Identity</h3>
                <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Manage your company's core profile, branding, and public metadata.</p>
              </div>
              
              <form onSubmit={handleSaveIdentity} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                    Legal Entity Name <span className="text-coral-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={orgName} 
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 focus:border-coral-500 outline-none shadow-sm transition-all" 
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                    Unique Identifier (Username) <span className="text-coral-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-paper-400 dark:text-ink-500 font-medium">@</span>
                    </div>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 focus:border-coral-500 outline-none shadow-sm transition-all" 
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                    Primary Contact Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Mail className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
                    </div>
                    <input 
                      type="email" 
                      defaultValue={user.email} 
                      disabled 
                      className="w-full pl-8 pr-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs font-medium text-paper-500 dark:text-ink-500 cursor-not-allowed shadow-sm" 
                    />
                  </div>
                </div>

                {saveStatus === 'success' && (
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium animate-fade-in">
                    Changes saved successfully!
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium animate-fade-in">
                    {errorMessage}
                  </div>
                )}
                
                <div className="flex justify-end pt-4 border-t border-paper-200 dark:border-ink-700">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-4 py-2 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-semibold rounded-md shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Identity Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-lg p-5 relative overflow-hidden shadow-sm">
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                  </h3>
                  <p className="text-[11px] text-red-500/80 dark:text-red-400/80 font-medium max-w-lg leading-relaxed">
                    Permanently delete this organization, terminate all tenant access, erase historical ledgers, and cancel subscriptions. This action cannot be reversed.
                  </p>
                </div>
                <button className="flex-shrink-0 px-4 py-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-md border border-red-200 dark:border-red-500/20 transition-colors">
                  Delete Organization
                </button>
              </div>
            </div>

          </div>
        </div>
        </div>
      )}

      {/* Tab 2: Members Directory & granular access management */}
      {activeTab === 'members' && (
        <div className="space-y-6 animate-fade-in">
          {/* Info Banner */}
          <div 
            className="bg-ink-950 dark:bg-black rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-sm min-h-[140px]"
            style={{
              backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.88), rgba(5, 8, 11, 0.98)), url("/org_guide_bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> Workspace Hierarchies
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Security & Delegated Portfolio Management</h2>
              <p className="text-[11px] text-ink-300 leading-relaxed">
                Control which team members can list properties, manage tenant contracts, process collections, or pay contractors. Use predefined roles to set safe defaults, or construct individual module override rules.
              </p>
            </div>
            <div className="relative z-10 flex gap-2 flex-shrink-0">
              <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-3.5 flex flex-col justify-center min-w-[200px]">
                <div className="text-[9px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Workspace Security</div>
                <div className="space-y-1 mt-1 text-[11px] text-ink-300">
                  <div>• Invite links are valid for 7 days</div>
                  <div>• Auditing records all role edits</div>
                  <div>• Property scopes enforce row isolation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-paper-200 dark:border-ink-700 flex justify-between items-center bg-paper-50 dark:bg-ink-900/50">
              <div>
                <h3 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider">Active Workspace Personnel</h3>
                <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Edit roles, customized permissions, and allowed properties scope.</p>
              </div>
              {user.role === 'landlord' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsTenantInviteModalOpen(true)}
                    className="px-3 py-1.5 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs font-semibold rounded-md hover:bg-paper-50 dark:hover:bg-ink-900 transition-colors"
                  >
                    Invite Tenant
                  </button>
                  <button 
                    onClick={() => { setModalError(null); setIsInviteModalOpen(true); }}
                    className="px-3 py-1.5 bg-coral-500 text-white text-xs font-semibold rounded-md hover:bg-coral-600 shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Invite Team Member
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper-50 dark:bg-ink-950/20 text-[9px] uppercase font-bold text-paper-500 dark:text-ink-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Name & Email</th>
                    <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Assigned Role</th>
                    <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700">Property Scope</th>
                    <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700 text-center">Status</th>
                    <th className="px-4 py-3 border-b border-paper-200 dark:border-ink-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-100 dark:divide-ink-700/50">
                  {teamMembers.map((member, i) => {
                    const isOwner = member.role === 'landlord';
                    const isSelf = member.id === user.id;
                    return (
                      <tr key={member.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${isOwner ? 'bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                              {member.initials || member.name?.substring(0, 2).toUpperCase() || 'TM'}
                            </div>
                            <div>
                              <div className="font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                                {member.name || member.email.split('@')[0]}
                                {isSelf && <span className="bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide font-semibold">You</span>}
                              </div>
                              <div className="text-[11px] text-paper-500 dark:text-ink-400">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${isOwner ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                            {isOwner ? <Shield className="w-3 h-3" /> : <Settings className="w-3 h-3" />} 
                            {member.role || 'Member'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-paper-600 dark:text-ink-300 font-medium text-[11px]">
                          {getPropertyScopeLabel(member.allowedProperties)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-semibold uppercase tracking-wider rounded">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isSelf ? (
                            <span className="text-[10px] text-paper-400 dark:text-ink-500 italic">Locked</span>
                          ) : user.role === 'landlord' ? (
                            <button 
                              onClick={() => startEditingAccess(member)}
                              className="px-2.5 py-1 text-[10px] font-bold text-coral-500 bg-coral-50 dark:bg-coral-500/10 rounded border border-coral-200/50 dark:border-coral-500/20 hover:bg-coral-100 transition-colors"
                            >
                              Manage Access
                            </button>
                          ) : (
                            <span className="text-[10px] text-paper-400 dark:text-ink-500 italic">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Pending Invites */}
                  {teamInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
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
                      <td className="px-4 py-3 text-paper-600 dark:text-ink-300 font-medium text-[11px]">
                        {getPropertyScopeLabel(invite.allowedProperties)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[9px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Pending</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[10px] text-paper-400 dark:text-ink-500 italic">No actions</span>
                      </td>
                    </tr>
                  ))}

                  {teamMembers.length === 0 && teamInvites.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-paper-500 dark:text-ink-400">
                        No team members registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Predefined Roles Matrix */}
      {activeTab === 'roles' && (
        <RolesMatrixTab />
      )}

      {/* Tab 4: Billing & Subscriptions Tab */}
      {activeTab === 'subscription' && (
        <SubscriptionTab
          billingData={billingData}
          billingLoading={billingLoading}
          handleCancelPremium={handleCancelPremium}
          billingMessage={billingMessage}
          setBillingMessage={setBillingMessage}
          onRefresh={fetchBillingInfo}
        />
      )}

      {activeTab === 'credits' && (
        <CreditsWalletTab
          billingData={billingData}
          billingLoading={billingLoading}
          dateFilterStart={dateFilterStart}
          setDateFilterStart={setDateFilterStart}
          dateFilterEnd={dateFilterEnd}
          setDateFilterEnd={setDateFilterEnd}
          selectedTeammateFilter={selectedTeammateFilter}
          setSelectedTeammateFilter={setSelectedTeammateFilter}
          teamMembers={teamMembers}
          creditRechargeAmount={creditRechargeAmount}
          setCreditRechargeAmount={setCreditRechargeAmount}
          billingMessage={billingMessage}
          setBillingMessage={setBillingMessage}
          onRefresh={fetchBillingInfo}
        />
      )}

      {/* Edit Member Access Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-5 backdrop-blur-sm bg-paper-900/80 dark:bg-ink-950/90 animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-slide-up">
            <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center bg-paper-50 dark:bg-ink-950/50 flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-coral-500" /> Manage Member Access Settings
                </h3>
                <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">
                  Modifying {editingMember.name || editingMember.email}'s role, properties scope, and capabilities.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-semibold text-paper-600 dark:text-ink-400">Preset:</span>
                <select 
                  value={editRole}
                  onChange={(e) => handleEditRolePresetChange(e.target.value)}
                  className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 text-paper-900 dark:text-white text-xs font-semibold rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-coral-500"
                >
                  <option>Landlord (Read-Only)</option>
                  <option>Property Manager</option>
                  <option>Maintenance Tech</option>
                  <option>Operations Lead</option>
                </select>
                <button onClick={() => setEditingMember(null)} className="px-3 py-1 bg-paper-200 dark:bg-ink-800 hover:bg-paper-300 dark:hover:bg-ink-700 text-paper-800 dark:text-white text-xs font-semibold rounded-md transition-colors ml-1">
                  Cancel
                </button>
                <button onClick={handleSaveAccess} disabled={isSavingAccess} className="px-3 py-1 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5">
                  {isSavingAccess && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Settings
                </button>
              </div>
            </div>
            
            {editError && (
              <div className="px-5 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-between flex-shrink-0">
                <span>Error: {editError}</span>
                <button onClick={() => setEditError(null)} className="text-[10px] underline hover:no-underline font-bold">Dismiss</button>
              </div>
            )}
            
            <div className="p-4 border-b border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-900 flex flex-col md:flex-row gap-4 flex-shrink-0">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300">Member Identity Details</label>
                <div className="text-xs font-medium text-paper-600 dark:text-ink-400 bg-paper-50 dark:bg-ink-950/40 p-2.5 rounded-md border border-paper-200 dark:border-ink-800">
                  <div className="font-semibold text-paper-900 dark:text-white">{editingMember.name || 'Member'}</div>
                  <div className="mt-0.5">{editingMember.email}</div>
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-paper-700 dark:text-ink-300 block">Property Scope Access</label>
                <div className="flex items-center gap-3 h-[38px]">
                  <label className="flex items-center gap-1.5 text-xs text-paper-700 dark:text-ink-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editPropScope" 
                      checked={editIsAllProperties} 
                      onChange={() => setEditIsAllProperties(true)}
                      className="accent-coral-500 cursor-pointer animate-none"
                    />
                    <span>Global (All Properties)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-paper-700 dark:text-ink-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editPropScope" 
                      checked={!editIsAllProperties} 
                      onChange={() => setEditIsAllProperties(false)}
                      className="accent-coral-500 cursor-pointer animate-none"
                    />
                    <span>Scoped (Selected Properties)</span>
                  </label>
                </div>
              </div>
            </div>

            {!editIsAllProperties && (
              <div className="px-4 py-3 bg-paper-50 dark:bg-ink-950/40 border-b border-paper-200 dark:border-ink-800 flex-shrink-0 animate-fade-in">
                <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 block mb-2 tracking-wider">Tick Applicable Properties</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-28 overflow-y-auto pr-1">
                  {properties.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer group bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800/80 px-2 py-1.5 rounded-md hover:border-paper-300 dark:hover:border-ink-700 transition-all">
                      <input 
                        type="checkbox"
                        checked={editProperties.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditProperties([...editProperties, p.id]);
                          } else {
                            setEditProperties(editProperties.filter(id => id !== p.id));
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
                  const currentAccess = editPermissions[module.name]?.access || 'none';
                  const currentSelectedActions = editPermissions[module.name]?.actions || [];
                  
                  const handleAccessChange = (val: 'none' | 'read' | 'full' | 'custom') => {
                    const updated = { ...editPermissions };
                    let acts: string[] = [];
                    if (val === 'full') acts = [...module.actions];
                    else if (val === 'read') acts = getPresetActions(module.name, 'read');
                    updated[module.name] = { access: val, actions: acts };
                    setEditPermissions(updated);
                  };

                  const handleActionToggle = (action: string, isChecked: boolean) => {
                    const updated = { ...editPermissions };
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
                    setEditPermissions(updated);
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

      {/* Add Team Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-5 backdrop-blur-sm bg-paper-900/80 dark:bg-ink-950/90 animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-slide-up">
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
                <button onClick={handleSendInvite} disabled={isSubmittingInvite || !inviteEmail} className="px-3 py-1 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5">
                  {isSubmittingInvite && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
                    className="w-full pl-8 pr-3 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs focus:ring-1 focus:ring-coral-500 focus:border-coral-500 dark:text-white transition-colors" 
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
                      className="accent-coral-500 cursor-pointer animate-none"
                    />
                    <span>Global (All Properties)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-paper-700 dark:text-ink-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="propScope" 
                      checked={!isAllProperties} 
                      onChange={() => setIsAllProperties(false)}
                      className="accent-coral-500 cursor-pointer animate-none"
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
                  const currentAccess = invitePermissions[module.name]?.access || 'none';
                  const currentSelectedActions = invitePermissions[module.name]?.actions || [];
                  
                  const handleAccessChange = (val: 'none' | 'read' | 'full' | 'custom') => {
                    const updated = { ...invitePermissions };
                    let acts: string[] = [];
                    if (val === 'full') acts = [...module.actions];
                    else if (val === 'read') acts = getPresetActions(module.name, 'read');
                    updated[module.name] = { access: val, actions: acts };
                    setInvitePermissions(updated);
                  };

                  const handleActionToggle = (action: string, isChecked: boolean) => {
                    const updated = { ...invitePermissions };
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
                    setInvitePermissions(updated);
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
