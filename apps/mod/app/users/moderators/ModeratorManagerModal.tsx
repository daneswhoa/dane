import React, { useState } from 'react';
import { 
  X, Settings, User, History, ShieldAlert, Shield, FileText, AlertTriangle, 
  Ban, Trash2, ChevronDown, AlertCircle, Briefcase, Activity, Mail, Phone
} from 'lucide-react';

interface ModLog {
  id: string;
  action: string;
  date: string;
  detail: string;
}

interface Moderator {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  actionsTaken: number;
  joined: string;
  verification: string;
  lastActive: string;
  avatar: string;
  assignedQueues: Array<string>;
  moderationLogs: Array<ModLog>;
}

interface ModeratorManagerModalProps {
  moderator: Moderator;
  onClose: () => void;
  onRestrict: (moderatorId: string, message: string) => void;
  onDelete: (moderatorId: string) => void;
}

const RESTRICT_TEMPLATES = [
  { id: 'mod1', title: 'Security Protocol Revocation', message: 'Moderator permissions suspended due to security credential compromise or failure to report lock status.' },
  { id: 'mod2', title: 'Unauthorized Action / Abuse', message: 'Suspended pending policy investigation into excessive or unauthorized platform ban execution.' },
  { id: 'mod3', title: 'Inactive Staff Lock', message: 'Staff status deactivated due to 60+ days of inactive profile presence.' },
  { id: 'mod4', title: 'Custom Access Revocation', message: '' }
];

export default function ModeratorManagerModal({
  moderator,
  onClose,
  onRestrict,
  onDelete
}: ModeratorManagerModalProps) {
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'logs'>('profile');
  
  // Restriction confirmation state
  const [showRestrictConfirm, setShowRestrictConfirm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('mod1');
  const [customRestrictMessage, setCustomRestrictMessage] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmRestrict = () => {
    const selectedTemplate = RESTRICT_TEMPLATES.find(t => t.id === selectedTemplateId);
    const message = selectedTemplateId === 'mod4' ? customRestrictMessage : (selectedTemplate?.message || '');
    onRestrict(moderator.id, message);
    setShowRestrictConfirm(false);
  };

  const handleConfirmDelete = () => {
    onDelete(moderator.id);
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
      <div className="relative bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col z-10 animate-fade-in trans-theme max-h-[90vh]">
        
        {/* Cover Gradient Header */}
        <div className="h-20 bg-gradient-to-r from-coral-500 to-coral-600 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5 text-white">
            <Settings className="w-5 h-5 animate-pulse-slow" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Staff Operations Control</span>
              <span className="text-[10px] text-coral-100 block mt-0.5">{moderator.name} • {moderator.role}</span>
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
            { id: 'logs', label: 'Moderator Audit Trail', icon: Activity }
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
                  <img src={moderator.avatar} alt={moderator.name} className="w-14 h-14 rounded-2xl object-cover border border-paper-200 dark:border-ink-800 shadow-md" />
                  <div>
                    <h3 className="text-lg font-black text-paper-900 dark:text-white leading-tight">{moderator.name}</h3>
                    <p className="text-xs text-paper-500 dark:text-ink-400 mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {moderator.email}</p>
                    <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {moderator.phone}</p>
                  </div>
                </div>
                <div>
                  {moderator.verification === 'Verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-500" /> Staff Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500 uppercase tracking-wide">
                      <Shield className="w-4 h-4 text-red-500" /> Access Suspended
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 trans-theme">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Operational Role</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1.5 leading-snug">
                    {moderator.role}
                  </p>
                </div>
                
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 trans-theme">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Moderation Actions</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1.5">
                    {moderator.actionsTaken} Incidents Closed
                  </p>
                </div>

                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 trans-theme">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Registered Date</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1.5">
                    {moderator.joined}
                  </p>
                </div>
              </div>

              {/* Assigned Queues */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Assigned Security Queues</h4>
                <div className="flex flex-wrap gap-2">
                  {moderator.assignedQueues.map((q, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-paper-100 dark:bg-ink-950 text-paper-700 dark:text-ink-200 text-xs font-semibold rounded-lg border border-paper-200/50 dark:border-ink-800/80">
                      {q}
                    </span>
                  ))}
                  {moderator.assignedQueues.length === 0 && (
                    <span className="text-xs text-paper-400 dark:text-ink-500">No queues assigned.</span>
                  )}
                </div>
              </div>

              <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200/50 dark:border-red-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Danger Zone / Revoke Permissions</h4>
                </div>
                <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                  Locking credentials immediately blocks staff panel entry. Purging removes all moderator metadata permanently.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => setShowRestrictConfirm(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" /> Revoke Staff Permissions
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Staff Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOGS */}
          {activeModalTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Moderator Audit Trail</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Incident Log</span>
              </div>

              <div className="space-y-3">
                {moderator.moderationLogs.map((log, idx) => (
                  <div key={idx} className="p-4 border border-paper-200 dark:border-ink-800 rounded-2xl bg-white dark:bg-ink-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 trans-theme hover:border-coral-400/30 trans-subtle">
                    <div>
                      <span className="font-mono text-[9px] font-bold text-paper-400 dark:text-ink-500">{log.id}</span>
                      <h5 className="text-xs font-bold text-paper-800 dark:text-ink-100 mt-1">{log.action}</h5>
                      <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5 font-semibold">Details: {log.detail}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-paper-400 dark:text-ink-500 font-mono block">
                        {new Date(log.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {moderator.moderationLogs.length === 0 && (
                  <div className="p-8 border border-dashed border-paper-300 dark:border-ink-800 rounded-2xl text-center text-paper-400 dark:text-ink-500 text-xs">
                    No action logs registered for this staff member.
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
                <h5 className="font-bold text-sm">Deactivate Staff Access</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Select a deactivation reason template. This immediately revokes their security permissions and locks out staff dashboard access.
              </p>

              <div className="space-y-3 pt-1">
                {/* Violation Template selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Revocation Reason</label>
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
                {selectedTemplateId === 'mod4' && (
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
                  Deactivate Access
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
                <h5 className="font-bold text-sm">Delete Staff Account</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Are you sure you want to permanently delete <strong>{moderator.name}</strong>'s staff registration and role permissions? This action cannot be undone.
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

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
