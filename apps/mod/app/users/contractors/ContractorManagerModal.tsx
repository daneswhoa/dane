import React, { useState } from 'react';
import { 
  X, Settings, User, History, Receipt, Wrench, Mail, Phone, ShieldCheck, 
  ShieldAlert, Shield, FileText, AlertTriangle, Ban, Trash2, ChevronDown, 
  AlertCircle, Briefcase, Star
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  date: string;
  status: string;
  cost: number;
}

interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  company: string;
  rating: number;
  completedJobs: number;
  joined: string;
  verification: string;
  lastActive: string;
  avatar: string;
  activeTickets: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    priority: string;
  }>;
  jobHistory: Array<Job>;
}

interface ContractorManagerModalProps {
  contractor: Contractor;
  onClose: () => void;
  onRestrict: (contractorId: string, message: string) => void;
  onDelete: (contractorId: string) => void;
}

const RESTRICT_TEMPLATES = [
  { id: 'c1', title: 'Terms of Service Violation', message: 'Your account has been restricted due to actions that violate our platform Terms of Service.' },
  { id: 'c2', title: 'Poor Service / Fraud Reports', message: 'Access is suspended pending investigation into recurring fraud reports or excessive contract disputes.' },
  { id: 'c3', title: 'Offensive Communication', message: 'Account suspended due to reports of abusive, threatening, or offensive communication with tenants or managers.' },
  { id: 'c4', title: 'Suspicious Security Lock', message: 'Security lock applied due to suspicious device logouts or credential sharing behaviors.' },
  { id: 'c5', title: 'Custom Moderation Lock', message: '' }
];

export default function ContractorManagerModal({
  contractor,
  onClose,
  onRestrict,
  onDelete
}: ContractorManagerModalProps) {
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'history' | 'orders'>('profile');
  
  // Restriction confirmation state
  const [showRestrictConfirm, setShowRestrictConfirm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('c1');
  const [customRestrictMessage, setCustomRestrictMessage] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmRestrict = () => {
    const selectedTemplate = RESTRICT_TEMPLATES.find(t => t.id === selectedTemplateId);
    const message = selectedTemplateId === 'c5' ? customRestrictMessage : (selectedTemplate?.message || '');
    onRestrict(contractor.id, message);
    setShowRestrictConfirm(false);
  };

  const handleConfirmDelete = () => {
    onDelete(contractor.id);
    setShowDeleteConfirm(false);
  };

  // Compute total service income
  const totalCost = contractor.jobHistory.reduce((acc, job) => acc + job.cost, 0);

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
      <div className="relative bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col z-10 animate-fade-in trans-theme max-h-[90vh]">
        
        {/* Cover Gradient Header */}
        <div className="h-20 bg-gradient-to-r from-coral-500 to-coral-600 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5 text-white">
            <Settings className="w-5 h-5 animate-pulse-slow" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Contractor Security Console</span>
              <span className="text-[10px] text-coral-100 block mt-0.5">{contractor.name} • {contractor.specialty} Trade</span>
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
        <div className="flex border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/60 px-6 shrink-0 trans-theme">
          {[
            { id: 'profile', label: 'Platform Profile', icon: User },
            { id: 'history', label: 'Service History', icon: History },
            { id: 'orders', label: 'Active Work Orders', icon: Wrench }
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
          
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeModalTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-100 dark:border-ink-800 pb-5">
                <div className="flex items-center gap-3">
                  <img src={contractor.avatar} alt={contractor.name} className="w-14 h-14 rounded-2xl object-cover border border-paper-200 dark:border-ink-800 shadow-md" />
                  <div>
                    <h3 className="text-lg font-black text-paper-900 dark:text-white leading-tight">{contractor.name}</h3>
                    <p className="text-xs text-paper-500 dark:text-ink-400 mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {contractor.email}</p>
                    <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {contractor.phone}</p>
                  </div>
                </div>
                <div>
                  {contractor.verification === 'Verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Specialist Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500 uppercase tracking-wide">
                      <Shield className="w-4 h-4 text-red-500" /> Account Suspended
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 trans-theme">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Specialty & Firm</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1.5 leading-snug">
                    {contractor.specialty} • {contractor.company}
                  </p>
                </div>
                
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 trans-theme">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Platform Rating</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1.5 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {contractor.rating} / 5.0
                  </p>
                </div>

                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 trans-theme">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Jobs Completed</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1.5">
                    {contractor.completedJobs} Work Dispatches
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Platform Moderation Actions</h4>
                </div>
                <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                  As a moderator, you oversee work quality and safety compliance. You can lock contractor credentials or remove the specialist record entirely.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => setShowRestrictConfirm(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend Contractor Account
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Specialist Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE HISTORY */}
          {activeModalTab === 'history' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Recent Completed Dispatches</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Gross Billing: ${totalCost.toLocaleString()}</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-2.5">Job ID</th>
                        <th className="px-4 py-2.5">Date Completed</th>
                        <th className="px-4 py-2.5">Dispatch Task</th>
                        <th className="px-4 py-2.5">Billed Amount</th>
                        <th className="px-4 py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {contractor.jobHistory.map((job, idx) => (
                        <tr key={idx} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3 font-mono font-bold text-[10px] text-paper-900 dark:text-white">{job.id}</td>
                          <td className="px-4 py-3 text-[10px] text-paper-500 dark:text-ink-400">{job.date}</td>
                          <td className="px-4 py-3 text-paper-800 dark:text-ink-100">{job.title}</td>
                          <td className="px-4 py-3 font-mono font-bold">${job.cost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {contractor.jobHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-paper-400 dark:text-ink-500">
                            No dispatch history recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE WORK ORDERS */}
          {activeModalTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Active Dispatches & Orders</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Assigned Work Queue</span>
              </div>

              <div className="space-y-3">
                {contractor.activeTickets.map((tkt, idx) => (
                  <div key={idx} className="p-4 border border-paper-200 dark:border-ink-800 rounded-2xl bg-white dark:bg-ink-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 trans-theme hover:border-coral-400/30 trans-subtle">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-paper-400 dark:text-ink-500">{tkt.id}</span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          tkt.priority === 'High' 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : tkt.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {tkt.priority} PRIORITY
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-paper-800 dark:text-ink-100 mt-1">{tkt.title}</h5>
                      <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Assigned on {tkt.date}</p>
                    </div>
                    
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border tracking-wider bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse">
                        <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                        {tkt.status}
                      </span>
                    </div>
                  </div>
                ))}

                {contractor.activeTickets.length === 0 && (
                  <div className="p-8 border border-dashed border-paper-300 dark:border-ink-800 rounded-2xl text-center text-paper-400 dark:text-ink-500 text-xs">
                    No active dispatches currently assigned.
                  </div>
                )}
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
                <h5 className="font-bold text-sm">Apply Profile Suspension</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Select a policy violation template reason below. The suspended status notice will restrict their dispatch log access.
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
                {selectedTemplateId === 'c5' && (
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
                  Restrict Account
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
                <h5 className="font-bold text-sm">Delete Account Credential</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Are you sure you want to permanently delete <strong>{contractor.name}</strong>'s platform membership? This action cannot be undone.
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
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
