import React, { useState } from 'react';
import { 
  X, Settings, User, History, Building, Mail, Phone, ShieldCheck, 
  ShieldAlert, Shield, FileText, AlertTriangle, Ban, Trash2, ChevronDown, 
  AlertCircle, Briefcase, MailOpen, UserMinus, ToggleLeft, ToggleRight, Check,
  Lock, Key, Globe, CreditCard
} from 'lucide-react';

export interface MemberPermissions {
  manageProperties: boolean;
  syndicateListings: boolean;
  viewBilling: boolean;
  inviteStaff: boolean;
  modifyBankAccounts: boolean;
  editApiKeys: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Guest';
  joinedDate: string;
  permissions: MemberPermissions;
}

export interface PastMember {
  name: string;
  email: string;
  formerRole: string;
  exitDate: string;
  reason: string;
}

export interface PendingInvite {
  email: string;
  roleOffered: string;
  dateSent: string;
  dateExpiring: string;
  referrer: string;
  status: 'Pending' | 'Expired' | 'Revoked';
}

export interface OrgProperty {
  name: string;
  address: string;
  units: number;
  occupied: number;
  maintenanceTickets: number;
  grossRevenue: number;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  billingTier: string;
  paymentStatus: string;
  warningsCount: number;
  foundedDate: string;
  businessLicense: string;
  taxId: string;
  hqAddress: string;
  verification: 'Verified' | 'Suspended';
  properties: Array<OrgProperty>;
  members: Array<Member>;
  pastMembers: Array<PastMember>;
  pendingInvites: Array<PendingInvite>;
}

interface OrganizationManagerModalProps {
  organization: Organization;
  onClose: () => void;
  onRestrict: (orgId: string, message: string) => void;
  onDelete: (orgId: string) => void;
}

const RESTRICT_TEMPLATES = [
  { id: 'org1', title: 'Terms of Service Violation', message: 'Organization account has been restricted due to actions that violate our platform Terms of Service.' },
  { id: 'org2', title: 'Syndication Spamming / Duplicate Ads', message: 'Syndication capability deactivated due to duplicate ad postings and listing spam policies.' },
  { id: 'org3', title: 'Corporate Payment Default', message: 'Organization suspended due to billing default or expired subscription transaction issues.' },
  { id: 'org4', title: 'Custom Access Block', message: '' }
];

export default function OrganizationManagerModal({
  organization,
  onClose,
  onRestrict,
  onDelete
}: OrganizationManagerModalProps) {
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'properties' | 'members' | 'past' | 'invites'>('profile');
  
  // Selected member to view / modify platform moderation permissions in modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Restriction confirmation state
  const [showRestrictConfirm, setShowRestrictConfirm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('org1');
  const [customRestrictMessage, setCustomRestrictMessage] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmRestrict = () => {
    const selectedTemplate = RESTRICT_TEMPLATES.find(t => t.id === selectedTemplateId);
    const message = selectedTemplateId === 'org4' ? customRestrictMessage : (selectedTemplate?.message || '');
    onRestrict(organization.id, message);
    setShowRestrictConfirm(false);
  };

  const handleConfirmDelete = () => {
    onDelete(organization.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={() => {
          if (!showRestrictConfirm && !showDeleteConfirm) onClose();
        }}
        className="absolute inset-0 bg-black/35 dark:bg-black/65 dark:backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Body */}
      <div className="relative bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col z-10 animate-fade-in trans-theme max-h-[90vh]">
        
        {/* Cover Gradient Header */}
        <div className="h-20 bg-gradient-to-r from-coral-500 to-coral-600 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5 text-white">
            <Settings className="w-5 h-5 animate-pulse-slow" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Organization Administration Terminal</span>
              <span className="text-[10px] text-coral-100 block mt-0.5">{organization.name} • ID: {organization.id}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/10 hover:bg-black/25 text-white backdrop-blur-sm transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/60 px-6 shrink-0 trans-theme">
          {[
            { id: 'profile', label: 'Compliance & Profile', icon: User },
            { id: 'properties', label: `Properties (${organization.properties.length})`, icon: Building },
            { id: 'members', label: `Current Members (${organization.members.length})`, icon: Shield },
            { id: 'past', label: `Past Members (${organization.pastMembers.length})`, icon: UserMinus },
            { id: 'invites', label: `Pending Invites (${organization.pendingInvites.length})`, icon: MailOpen }
          ].map(tab => {
            const isActive = activeModalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModalTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all relative ${
                  isActive 
                    ? 'text-coral-500 border-b-2 border-coral-500' 
                    : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Content Context */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: COMPLIANCE PROFILE */}
          {activeModalTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-100 dark:border-ink-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    {organization.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-paper-900 dark:text-white leading-tight">{organization.name}</h3>
                    <p className="text-xs text-paper-500 dark:text-ink-400 mt-1 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Business License: {organization.businessLicense}</p>
                    <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Tax ID: {organization.taxId}</p>
                  </div>
                </div>
                <div>
                  {organization.verification === 'Verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Organization Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500 uppercase tracking-wide">
                      <Shield className="w-4 h-4 text-red-500" /> Suspended Lock
                    </span>
                  )}
                </div>
              </div>

              {/* Data Fields Grid: ~15 items showing org metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Billing tier plan</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-coral-500" /> {organization.billingTier}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Billing status</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">{organization.paymentStatus}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Founded Date</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1">{organization.foundedDate}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Policy Warning Count</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1">{organization.warningsCount} Warnings</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">HQ Address</p>
                  <p className="text-xs font-semibold text-paper-700 dark:text-ink-200 mt-1 truncate">{organization.hqAddress}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Auto-Renew Status</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1">Enabled</p>
                </div>
              </div>

              {/* Action Board */}
              <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Platform Moderation actions</h4>
                </div>
                <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                  Locking corporate registrations suspends access for all sub-members (managers, contractors) registered under this business node.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => setShowRestrictConfirm(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend Organization Account
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Organization Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPERTIES */}
          {activeModalTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Properties Managed Portfolio</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Registered Assets ({organization.properties.length})</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-2.5">Property Name</th>
                        <th className="px-4 py-2.5">Address</th>
                        <th className="px-4 py-2.5">Units / Occupied</th>
                        <th className="px-4 py-2.5">Open Tickets</th>
                        <th className="px-4 py-2.5 text-right">Est. Gross Billing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {organization.properties.map((prop, idx) => (
                        <tr key={idx} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3 font-bold text-paper-900 dark:text-white">{prop.name}</td>
                          <td className="px-4 py-3 text-paper-600 dark:text-ink-300">{prop.address}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-paper-800 dark:text-ink-100">{prop.units} Units</span>
                            <span className="text-paper-400 dark:text-ink-500 ml-1">({Math.round((prop.occupied / prop.units) * 100)}% Occ)</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-amber-500">{prop.maintenanceTickets} Tickets</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-paper-900 dark:text-white">${prop.grossRevenue.toLocaleString()}/mo</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CURRENT MEMBERS */}
          {activeModalTab === 'members' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Active Corporate Members</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Access Directory</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Members list */}
                <div className="border border-paper-200 dark:border-ink-800 rounded-2xl bg-white dark:bg-ink-900 trans-theme divide-y divide-paper-100 dark:divide-ink-800/50">
                  {organization.members.map((member) => (
                    <div 
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`p-3.5 cursor-pointer hover:bg-paper-50/50 dark:hover:bg-ink-800/10 flex items-center justify-between transition-colors ${
                        selectedMember?.id === member.id ? 'bg-coral-50/20 dark:bg-coral-500/5 border-l-2 border-coral-500' : ''
                      }`}
                    >
                      <div>
                        <div className="font-bold text-paper-900 dark:text-white leading-tight">{member.name}</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{member.email}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          member.role === 'Owner' 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : member.role === 'Admin'
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {member.role}
                        </span>
                        <p className="text-[8px] text-paper-400 mt-1">Joined {member.joinedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Permissions viewer */}
                <div className="border border-paper-200 dark:border-ink-800 rounded-2xl bg-paper-50 dark:bg-ink-950/60 p-4 space-y-4 trans-theme">
                  {selectedMember ? (
                    <>
                      <div className="border-b border-paper-200 dark:border-ink-800 pb-2">
                        <h5 className="text-xs font-bold text-paper-900 dark:text-white flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-coral-500" /> Member Permissions</h5>
                        <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Auditing security level for <strong>{selectedMember.name}</strong></p>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { key: 'manageProperties', label: 'Manage Properties & Units' },
                          { key: 'syndicateListings', label: 'Syndicate Vacant Listings' },
                          { key: 'viewBilling', label: 'View Billing Ledger & Statements' },
                          { key: 'inviteStaff', label: 'Invite Corporate Staff' },
                          { key: 'modifyBankAccounts', label: 'Modify Bank Payout Details' },
                          { key: 'editApiKeys', label: 'Configure API Integrations' }
                        ].map(perm => {
                          const hasPerm = selectedMember.permissions[perm.key as keyof MemberPermissions];
                          return (
                            <div key={perm.key} className="flex items-center justify-between text-xs py-1">
                              <span className="text-paper-700 dark:text-ink-200">{perm.label}</span>
                              {hasPerm ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase"><Check className="w-3.5 h-3.5 text-emerald-500" /> Allowed</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase"><Lock className="w-3.5 h-3.5 text-red-500" /> Locked</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-paper-400 dark:text-ink-600 py-10">
                      <Key className="w-8 h-8 mb-2" />
                      <p className="text-xs">Select a member from the directory to review their permission tokens.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAST MEMBERS */}
          {activeModalTab === 'past' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Audit log: Past Member registrations</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Archived Staff ({organization.pastMembers.length})</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-2.5">Staff Name</th>
                        <th className="px-4 py-2.5">Email</th>
                        <th className="px-4 py-2.5">Former Role</th>
                        <th className="px-4 py-2.5">Exit Date</th>
                        <th className="px-4 py-2.5 text-right">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {organization.pastMembers.map((past, idx) => (
                        <tr key={idx} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3 font-bold text-paper-900 dark:text-white">{past.name}</td>
                          <td className="px-4 py-3 text-paper-500 dark:text-ink-400">{past.email}</td>
                          <td className="px-4 py-3 text-paper-800 dark:text-ink-100">{past.formerRole}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-paper-500 dark:text-ink-400">{past.exitDate}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                              past.reason.includes('Removed') 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : 'bg-paper-100 dark:bg-ink-950 text-paper-500 dark:text-ink-400'
                            }`}>
                              {past.reason}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {organization.pastMembers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-paper-400 dark:text-ink-500">
                            No past members archived.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PENDING INVITES */}
          {activeModalTab === 'invites' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Pending Team Invitations</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Invites feed ({organization.pendingInvites.length})</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-2.5">Invited Email</th>
                        <th className="px-4 py-2.5">Offered Role</th>
                        <th className="px-4 py-2.5">Sent On</th>
                        <th className="px-4 py-2.5">Expires On</th>
                        <th className="px-4 py-2.5">Invited By</th>
                        <th className="px-4 py-2.5 text-right">Referral Token Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {organization.pendingInvites.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3 font-bold text-paper-900 dark:text-white">{inv.email}</td>
                          <td className="px-4 py-3 text-paper-800 dark:text-ink-100">{inv.roleOffered}</td>
                          <td className="px-4 py-3 text-[10px] text-paper-500 dark:text-ink-400">{inv.dateSent}</td>
                          <td className="px-4 py-3 text-[10px] text-paper-500 dark:text-ink-400">{inv.dateExpiring}</td>
                          <td className="px-4 py-3 text-paper-700 dark:text-ink-200">{inv.referrer}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase border tracking-wider ${
                              inv.status === 'Pending' 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {organization.pendingInvites.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-paper-400 dark:text-ink-500">
                            No pending invites.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-paper-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/40 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-paper-200 hover:bg-paper-300 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-100 text-xs font-bold rounded-lg trans-subtle"
          >
            Close
          </button>
        </div>

        {/* RESTRICT CONFIRMATION MODAL OVERLAY */}
        {showRestrictConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/75 dark:backdrop-blur-sm p-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in trans-theme">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h5 className="font-bold text-sm">Apply Corporate Node Lock</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Select a platform violation template. This applies a global suspension lock across the entire organization.
              </p>

              <div className="space-y-3 pt-1">
                {/* Violation Template selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Violation Template</label>
                  <div className="relative">
                    <select 
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-2 text-xs text-paper-700 dark:text-ink-100 outline-none appearance-none font-semibold cursor-pointer"
                    >
                      {RESTRICT_TEMPLATES.map(tmpl => (
                        <option key={tmpl.id} value={tmpl.id}>{tmpl.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-paper-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Custom input text if needed */}
                {selectedTemplateId === 'org4' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Custom Message</label>
                    <textarea 
                      value={customRestrictMessage}
                      onChange={(e) => setCustomRestrictMessage(e.target.value)}
                      rows={3}
                      placeholder="Enter custom suspension details..."
                      className="w-full bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1.5 text-xs text-paper-700 dark:text-ink-100 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  onClick={() => setShowRestrictConfirm(false)}
                  className="px-3.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRestrict}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Lock Organization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL OVERLAY */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/75 dark:backdrop-blur-sm p-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-fade-in trans-theme">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h5 className="font-bold text-sm">Purge Corporate Nodes</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Are you sure you want to permanently delete <strong>{organization.name}</strong> and all related records? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-750 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Purge Permanently
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
