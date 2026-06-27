import React, { useState } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  HeartPulse, 
  Plus, 
  PhoneCall, 
  FileText, 
  IdCard, 
  FileBadge, 
  ChevronRight, 
  CheckCircle2, 
  Map, 
  Download, 
  Calendar, 
  Settings,
  X,
  Search,
  Building,
  Home,
  Receipt
} from 'lucide-react';
import { TenantProfile } from '../types';

interface ProfileTabProps {
  profile: TenantProfile | null;
}

export default function ProfileTab({ profile }: ProfileTabProps) {
  const isMockProperty = profile?.building === 'Grandview Apts' || !profile?.building;
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security'>('profile');
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveCode, setLeaveCode] = useState('');
  const [leaveRequested, setLeaveRequested] = useState(false);
  const [leaveReqCode, setLeaveReqCode] = useState('');

  const handleRequestLeave = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenant/leave/request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveReqCode(data.code);
        setLeaveRequested(true);
        setIsLeaveModalOpen(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to request leave code.');
      }
    } catch (e) {
      setError('Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLeave = async () => {
    if (!profile?.id || !leaveCode.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenant/leave/confirm`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          code: leaveCode.trim(),
        }),
      });
      if (res.ok) {
        setIsLeaveModalOpen(false);
        setLeaveCode('');
        setLeaveRequested(false);
        window.location.reload();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Invalid confirmation code.');
      }
    } catch (e) {
      setError('Failed to contact server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckCode = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter a valid code');
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invites/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteDetails(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Invalid invite code. Please check and try again.');
      }
    } catch (e) {
      setError('Connection to backend failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!profile?.id) {
      setError('No profile ID found. Please update your profile first.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invites/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inviteCode.trim(),
          tenantId: profile.id,
        }),
      });
      if (res.ok) {
        setIsInviteModalOpen(false);
        setInviteDetails(null);
        setInviteCode('');
        window.location.reload();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to accept invite. Please try again.');
      }
    } catch (e) {
      setError('Failed to contact server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6 pb-20 animate-fade-in relative">
      {/* Hero Identity Card */}
      <div className="bg-gradient-to-br from-ink-800 to-ink-950 border border-ink-700/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-coral-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
          <div className="relative shrink-0 group cursor-pointer">
            <img src={profile?.photoUrl || `https://placehold.co/120x120/1e2129/ffffff?text=${profile?.name?.charAt(0) || 'U'}`} className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-ink-700 shadow-xl object-cover trans-subtle group-hover:border-coral-500/50 group-hover:shadow-[0_0_20px_rgba(255,107,107,0.15)]" />
            <div className="absolute inset-0 bg-ink-950/40 rounded-2xl opacity-0 group-hover:opacity-100 trans-subtle flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-ink-900 rounded-full shadow-sm"></span>
          </div>
          
          <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{profile?.name || 'Resident'}</h1>
                <p className="text-ink-300 text-xs md:text-sm flex items-center justify-center md:justify-start gap-1.5 mt-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Landlord.nl Resident
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-ink-400 uppercase font-semibold tracking-wider">Member Since</span>
                <span className="text-white font-mono text-sm mt-0.5">
                  {profile?.moveInDate ? new Date(profile.moveInDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New Resident'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-5 justify-center md:justify-start">
              <div className="px-3 py-1.5 bg-ink-900/80 border border-ink-700/50 rounded-lg text-xs font-medium text-ink-200 flex items-center gap-2 backdrop-blur-sm hover:border-ink-600 trans-subtle cursor-pointer">
                <Mail className="w-3.5 h-3.5 text-coral-400" /> {profile?.email || 'email@example.com'}
              </div>
              <div className="px-3 py-1.5 bg-ink-900/80 border border-ink-700/50 rounded-lg text-xs font-medium text-ink-200 flex items-center gap-2 backdrop-blur-sm hover:border-ink-600 trans-subtle cursor-pointer">
                <Phone className="w-3.5 h-3.5 text-coral-400" /> {profile?.phone || 'Not provided'}
              </div>
              {!isMockProperty && (
                <div className="px-3 py-1.5 bg-ink-900/80 border border-ink-700/50 rounded-lg text-xs font-medium text-ink-200 flex items-center gap-2 backdrop-blur-sm hover:border-ink-600 trans-subtle cursor-pointer">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> {profile?.building}, {profile?.unit}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-6 border-b border-paper-250 dark:border-ink-750 pb-px">
        <button 
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider trans-subtle border-b-2 px-1 ${activeSubTab === 'profile' ? 'border-coral-500 text-coral-500 font-bold' : 'border-transparent text-paper-400 hover:text-paper-600 dark:text-ink-400 dark:hover:text-ink-200'}`}
        >
          Profile Details
        </button>
        <button 
          onClick={() => setActiveSubTab('security')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider trans-subtle border-b-2 px-1 flex items-center gap-1.5 ${activeSubTab === 'security' ? 'border-coral-500 text-coral-500 font-bold' : 'border-transparent text-paper-400 hover:text-paper-600 dark:text-ink-400 dark:hover:text-ink-200'}`}
        >
          <Settings className="w-3.5 h-3.5" /> Security & Settings
        </button>
      </div>

      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Emergency Contacts */}
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm trans-theme relative overflow-hidden group">
            <div className="absolute inset-0 bg-coral-500/0 group-hover:bg-coral-500/[0.02] trans-subtle pointer-events-none"></div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 flex items-center gap-2">
                <div className="p-1 rounded bg-coral-50 dark:bg-coral-500/10 text-coral-500">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
                Emergency Contacts
              </h3>
              <button className="text-paper-400 hover:text-coral-500 trans-subtle">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {profile?.emergencyContacts && profile.emergencyContacts.length > 0 ? (
                profile.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-paper-100 dark:border-ink-700/50 bg-paper-50/50 dark:bg-ink-900/50 hover:border-paper-300 dark:hover:border-ink-600 trans-subtle cursor-default">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-sm font-semibold text-paper-900 dark:text-white">{contact.name}</h4>
                        <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-medium mt-0.5">{contact.relation}</p>
                      </div>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-paper-200/50 dark:border-ink-700/50">
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs font-medium text-paper-700 dark:text-ink-300 hover:text-coral-500 trans-subtle">
                          <PhoneCall className="w-3.5 h-3.5" /> {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-paper-500 dark:text-ink-400 italic">No emergency contacts listed.</p>
              )}
            </div>
          </div>
          
          {/* Documents Widget */}
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm trans-theme">
            <h3 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-4 flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                <FileText className="w-3.5 h-3.5" />
              </div>
              Identity Documents
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded hover:bg-paper-50 dark:hover:bg-ink-900/50 trans-subtle cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-paper-100 dark:bg-ink-900 flex items-center justify-center text-paper-500 dark:text-ink-400 group-hover:text-blue-500 trans-subtle">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-paper-900 dark:text-white">Driver's License</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400">Verified</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-paper-50 dark:hover:bg-ink-900/50 trans-subtle cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-paper-100 dark:bg-ink-900 flex items-center justify-center text-paper-500 dark:text-ink-400 group-hover:text-blue-500 trans-subtle">
                    <FileBadge className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-paper-900 dark:text-white">Background Check</p>
                    <p className="text-[9px] text-paper-400 dark:text-ink-500">Completed 2021</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-paper-300 dark:text-ink-600 group-hover:text-paper-500 dark:group-hover:text-ink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 md:p-6 shadow-sm trans-theme">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 flex items-center gap-2">
                <div className="p-1 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-500">
                  <Map className="w-3.5 h-3.5" />
                </div>
                Rental Overview
              </h3>
              <button className="flex items-center gap-1.5 text-xs font-medium text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white trans-subtle">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-2 bg-paper-50 dark:bg-ink-900/50 p-4 rounded-xl border border-paper-100 dark:border-ink-700/50">
                <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider">Total Rent Paid (Lifetime)</p>
                <p className="text-2xl font-bold text-paper-900 dark:text-white font-mono mt-1.5 tracking-tight">{isMockProperty ? '$0' : '$68,450'}<span className="text-sm text-paper-400 dark:text-ink-500 font-sans font-normal ml-1">.00</span></p>
              </div>
              <div className="bg-paper-50 dark:bg-ink-900/50 p-4 rounded-xl border border-paper-100 dark:border-ink-700/50 flex flex-col justify-center">
                <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider">Properties</p>
                <p className="text-2xl font-bold text-paper-900 dark:text-white mt-1.5">{isMockProperty ? '0' : '2'}</p>
              </div>
              <div className="bg-paper-50 dark:bg-ink-900/50 p-4 rounded-xl border border-paper-100 dark:border-ink-700/50 flex flex-col justify-center">
                <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider">On-Time Rate</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{isMockProperty ? '-' : '100%'}</p>
              </div>
            </div>

            <h4 className="text-[11px] font-semibold text-paper-900 dark:text-white mb-4 border-b border-paper-100 dark:border-ink-700 pb-2">Residence History</h4>
            
            {isMockProperty ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-paper-100 dark:bg-ink-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-paper-200 dark:border-ink-800">
                  <Home className="w-6 h-6 text-paper-400 dark:text-ink-500" />
                </div>
                <h5 className="text-sm font-bold text-paper-900 dark:text-white">No Active Property</h5>
                <p className="text-xs text-paper-500 dark:text-ink-400 mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">
                  You haven't been placed in any active properties yet. If you have an invite code from your property manager, enter it below to join your unit.
                </p>
                <button 
                  onClick={() => setIsInviteModalOpen(true)} 
                  className="px-5 py-2 bg-coral-500 hover:bg-coral-600 active:scale-95 text-white text-xs font-semibold rounded-lg trans-subtle shadow-sm shadow-coral-500/20"
                >
                  Enter Invite Code
                </button>
              </div>
            ) : (
              <div className="relative pl-4 space-y-6">
                <div className="absolute left-[7px] top-2 bottom-4 w-px bg-paper-200 dark:bg-ink-700"></div>

                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 bg-coral-500 rounded-full border-2 border-white dark:border-ink-800 shadow-[0_0_8px_rgba(255,107,107,0.5)]"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
                        {profile?.building || 'Grandview Apts'}, Unit {profile?.unit || '4B'}
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-500/20">Current</span>
                      </h5>
                      <p className="text-[11px] text-paper-600 dark:text-ink-300 mt-0.5">Aug 2022 — Present</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] flex items-center gap-1 text-paper-500 dark:text-ink-400 bg-paper-50 dark:bg-ink-900 px-2 py-1 rounded border border-paper-100 dark:border-ink-700">
                          <Calendar className="w-3 h-3" /> 14 Months
                        </span>
                        <button 
                          onClick={handleRequestLeave}
                          className="text-[10px] font-medium text-coral-600 dark:text-coral-400 hover:underline bg-transparent border-none cursor-pointer p-0"
                        >
                          Leave Property &rarr;
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold">Monthly Rent</p>
                      <p className="text-sm font-bold text-paper-900 dark:text-white font-mono mt-0.5">$1,850</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm trans-theme">
            <h3 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-4 flex items-center gap-2">
              <div className="p-1 rounded bg-slate-100 dark:bg-ink-700 text-slate-500 dark:text-ink-300">
                <Settings className="w-3.5 h-3.5" />
              </div>
              Account Preferences
            </h3>
            
            <div className="divide-y divide-paper-100 dark:divide-ink-700/50">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-paper-900 dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <button className="px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium trans-subtle hover:bg-emerald-100 dark:hover:bg-emerald-500/20">
                  Enabled
                </button>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-paper-900 dark:text-white">SMS Notifications</h4>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Receive text alerts for rent due dates and maintenance updates.</p>
                </div>
                <button className="w-9 h-5 rounded-full bg-coral-500 relative trans-subtle">
                  <span className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>)}

      {activeSubTab === 'security' && (
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-6 shadow-sm trans-theme max-w-2xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-paper-900 dark:text-white mb-2">Security & Settings</h3>
            <p className="text-xs text-paper-500 dark:text-ink-400">Manage your credentials, authentication methods, and active sessions.</p>
          </div>

          <div className="space-y-6">
            {/* Email Address */}
            <div className="p-4 rounded-xl border border-paper-100 dark:border-ink-700/50 bg-paper-50/50 dark:bg-ink-900/50 flex justify-between items-center">
              <div>
                <label className="block text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-1">Email Address</label>
                <p className="text-sm text-paper-800 dark:text-ink-200 font-medium">{profile?.email || 'email@example.com'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider bg-paper-100 dark:bg-ink-950 px-2 py-1 rounded">Locked</span>
              </div>
            </div>

            {/* Password */}
            <div className="p-4 rounded-xl border border-paper-100 dark:border-ink-700/50 bg-paper-50/50 dark:bg-ink-900/50 flex justify-between items-center">
              <div>
                <label className="block text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-1">Password</label>
                <p className="text-sm text-paper-400 dark:text-ink-500 font-mono tracking-widest">••••••••••••</p>
              </div>
              <button 
                disabled 
                className="px-3 py-1.5 bg-paper-100 dark:bg-ink-950 text-paper-400 dark:text-ink-500 text-xs font-bold rounded-lg cursor-not-allowed border border-paper-200 dark:border-ink-700/50"
                title="Password changes are managed by the identity provider."
              >
                Change Password
              </button>
            </div>

            {/* MFA */}
            <div className="p-4 rounded-xl border border-paper-100 dark:border-ink-700/50 bg-paper-50/50 dark:bg-ink-900/50">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <label className="block text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-1">Multi-Factor Authentication (MFA)</label>
                  <p className="text-xs text-paper-500 dark:text-ink-400">Secure your account with two-step login codes.</p>
                </div>
                <div className="w-10 h-6 bg-paper-200 dark:bg-ink-950 rounded-full relative p-1 cursor-not-allowed">
                  <div className="w-4 h-4 bg-paper-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-[10px] text-paper-400 dark:text-ink-500 italic mt-1">Managed by organizational authentication policy. Disabled.</p>
            </div>

            {/* Active Sessions */}
            <div className="p-4 rounded-xl border border-paper-100 dark:border-ink-700/50 bg-paper-50/50 dark:bg-ink-900/50">
              <label className="block text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-3">Active Sessions & Devices</label>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-ink-950 border border-paper-150 dark:border-ink-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center text-coral-500">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-paper-900 dark:text-white font-sans">Windows Chrome</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400">Current Session - Active Now</p>
                    </div>
                  </div>
                  <button 
                    disabled 
                    className="px-2.5 py-1 bg-paper-100 dark:bg-ink-900 text-paper-400 dark:text-ink-500 text-[10px] font-bold rounded-lg cursor-not-allowed"
                  >
                    Revoke
                  </button>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-ink-950 border border-paper-150 dark:border-ink-800 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-paper-100 dark:bg-ink-900 flex items-center justify-center text-paper-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-paper-900 dark:text-white font-sans">iPhone Safari</p>
                      <p className="text-[9px] text-paper-400 dark:text-ink-500">Last accessed: 2 hours ago</p>
                    </div>
                  </div>
                  <button 
                    disabled 
                    className="px-2.5 py-1 bg-paper-100 dark:bg-ink-900 text-paper-400 dark:text-ink-500 text-[10px] font-bold rounded-lg cursor-not-allowed"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)}></div>
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-paper-100 dark:border-ink-800">
              <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-coral-500" />
                Join a Property
              </h2>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-paper-400 hover:bg-paper-100 dark:hover:bg-ink-800 trans-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!inviteDetails ? (
                <>
                  <p className="text-xs text-paper-500 dark:text-ink-400 mb-5 leading-relaxed">
                    Enter the unique 8-character invite code provided by your property manager to link your account to your residential unit.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-1.5">Invite Code</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. A7X9-P2M4" 
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm font-mono text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle"
                        />
                        <Search className="w-4 h-4 text-paper-400 dark:text-ink-500 absolute left-3.5 top-3" />
                      </div>
                      {error && <p className="text-[10px] text-coral-500 mt-1.5 font-medium">{error}</p>}
                    </div>
                    
                    <button 
                      onClick={handleCheckCode}
                      disabled={isLoading || !inviteCode}
                      className="w-full py-2.5 bg-paper-900 dark:bg-white text-white dark:text-ink-900 text-xs font-bold rounded-xl hover:bg-paper-800 dark:hover:bg-paper-100 active:scale-[0.98] trans-subtle disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? 'Verifying Code...' : 'Check Invite Code'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-fade-in space-y-5">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 text-center relative overflow-hidden">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-20 absolute -right-2 -top-2" />
                    <h3 className="text-sm font-bold text-paper-900 dark:text-white relative z-10">Valid Invite Found!</h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 relative z-10">Review your lease details below before accepting.</p>
                  </div>
                  
                  <div className="space-y-3 bg-paper-50 dark:bg-ink-900/50 p-4 rounded-xl border border-paper-100 dark:border-ink-800">
                    <div className="flex items-start gap-3 pb-3 border-b border-paper-200/50 dark:border-ink-700/50">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Property Name</p>
                        <p className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">{inviteDetails.propertyName}</p>
                        <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Manager: {inviteDetails.managerName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 pb-3 border-b border-paper-200/50 dark:border-ink-700/50">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Your Unit</p>
                        <p className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">{inviteDetails.unitDetails}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="w-full">
                        <p className="text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-2">Move-in Financial Overview</p>
                        
                        <div className="bg-white dark:bg-ink-950 rounded-lg p-3 border border-paper-100 dark:border-ink-800 space-y-2 mb-3 shadow-inner">
                           <div className="flex justify-between text-xs">
                             <span className="text-paper-600 dark:text-ink-300">Base Rent</span>
                             <span className="font-semibold text-paper-900 dark:text-white">${inviteDetails.rentNum?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} <span className="text-[9px] text-paper-400">/mo</span></span>
                           </div>
                           
                           {inviteDetails.recurringDetails?.map((f: any, i: number) => (
                             <div key={'r'+i} className="flex justify-between text-xs">
                               <span className="text-paper-600 dark:text-ink-300">{f.name}</span>
                               <span className="font-semibold text-paper-900 dark:text-white">${Number(f.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-paper-400">/mo</span></span>
                             </div>
                           ))}

                           {(inviteDetails.depositNum > 0 || (inviteDetails.moveInDetails && inviteDetails.moveInDetails.length > 0)) && (
                             <div className="pt-2 mt-2 border-t border-dashed border-paper-200 dark:border-ink-700 space-y-2">
                               {inviteDetails.depositNum > 0 && (
                                 <div className="flex justify-between text-xs">
                                   <span className="text-paper-600 dark:text-ink-300">Security Deposit <span className="text-[9px] text-emerald-500 ml-1 font-semibold">(Refundable)</span></span>
                                   <span className="font-semibold text-paper-900 dark:text-white">${inviteDetails.depositNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                 </div>
                               )}
                               {inviteDetails.moveInDetails?.map((f: any, i: number) => (
                                 <div key={'m'+i} className="flex justify-between text-xs">
                                   <span className="text-paper-600 dark:text-ink-300">{f.name}</span>
                                   <span className="font-semibold text-paper-900 dark:text-white">${Number(f.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                        
                        <div className="flex justify-between items-center px-3 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                           <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Total Move-in Due</span>
                           <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                             ${((inviteDetails.rentNum || 0) + (inviteDetails.recurringTotal || 0) + (inviteDetails.moveInTotal || 0) + (inviteDetails.depositNum || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </span>
                        </div>
                        
                        <p className="text-[9px] text-paper-500 dark:text-ink-400 mt-2.5 italic">
                          By accepting, an initial itemized invoice will be generated in your Payments tab. You can securely pay the balance later.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {error && <p className="text-[10px] text-coral-500 mt-1 text-center font-medium">{error}</p>}
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setInviteDetails(null)}
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-300 text-xs font-bold rounded-xl hover:bg-paper-200 dark:hover:bg-ink-700 trans-subtle disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAcceptInvite}
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-coral-500 text-white text-xs font-bold rounded-xl hover:bg-coral-600 active:scale-[0.98] trans-subtle shadow-sm shadow-coral-500/20 disabled:opacity-50"
                    >
                      {isLoading ? 'Accepting...' : 'Accept & Join'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave Property Verification Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-paper-100 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
                Leave Property Verification
              </h2>
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-paper-400 hover:bg-paper-100 dark:hover:bg-ink-800 trans-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">
                A verification code has been generated. Enter it below to confirm unlinking from your current unit.
              </p>
              
              {leaveReqCode && (
                <div className="p-3 bg-coral-50 dark:bg-coral-500/5 border border-coral-200 dark:border-coral-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-paper-500 dark:text-ink-400 block uppercase font-bold tracking-wider">Verification Code (Simulated Email)</span>
                  <span className="text-lg font-bold font-mono text-coral-600 dark:text-coral-400 mt-1 block">{leaveReqCode}</span>
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider mb-1.5">Verification Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. LAVE-1234" 
                  value={leaveCode}
                  onChange={(e) => setLeaveCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm font-mono text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle"
                />
                {error && <p className="text-[10px] text-coral-500 mt-1.5 font-medium">{error}</p>}
              </div>
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsLeaveModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-300 text-xs font-bold rounded-xl hover:bg-paper-200 dark:hover:bg-ink-700 trans-subtle disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmLeave}
                  disabled={isLoading || !leaveCode}
                  className="flex-1 py-2.5 bg-coral-500 text-white text-xs font-bold rounded-xl hover:bg-coral-600 active:scale-[0.98] trans-subtle shadow-sm shadow-coral-500/20 disabled:opacity-50"
                >
                  {isLoading ? 'Confirming...' : 'Confirm & Leave'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
