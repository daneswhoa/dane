import React, { useState } from 'react';
import { X, User, ShieldCheck, Laptop, Building, KeyRound, Smartphone, LogOut, AlertTriangle, Check, Camera, Users, Settings2, UserPlus } from 'lucide-react';

interface ProfileSettingsModalProps {
  user: any;
  onClose: () => void;
  onSignOut: () => void;
}

export default function ProfileSettingsModal({ user, onClose, onSignOut }: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'organization'>('profile');

  // Initials for avatar
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PM';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm bg-paper-900/40 dark:bg-ink-950/60">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[800px] animate-slide-up"
      >
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 bg-paper-50 dark:bg-ink-950 border-r border-paper-200 dark:border-ink-800 p-4 flex flex-col flex-shrink-0">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-lg font-bold text-paper-900 dark:text-white">Account Settings</h2>
            <button onClick={onClose} className="p-2 bg-paper-200 dark:bg-ink-800 rounded-lg text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="text-lg font-bold text-paper-900 dark:text-white mb-6 hidden md:block px-2">Account Settings</h2>
          
          <nav className="flex-1 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-white dark:bg-ink-800 text-coral-600 dark:text-coral-400 shadow-sm border border-paper-200 dark:border-ink-700' 
                  : 'text-paper-600 dark:text-ink-300 hover:bg-paper-200/50 dark:hover:bg-ink-800/50'
              }`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security' 
                  ? 'bg-white dark:bg-ink-800 text-coral-600 dark:text-coral-400 shadow-sm border border-paper-200 dark:border-ink-700' 
                  : 'text-paper-600 dark:text-ink-300 hover:bg-paper-200/50 dark:hover:bg-ink-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Security & Access
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sessions' 
                  ? 'bg-white dark:bg-ink-800 text-coral-600 dark:text-coral-400 shadow-sm border border-paper-200 dark:border-ink-700' 
                  : 'text-paper-600 dark:text-ink-300 hover:bg-paper-200/50 dark:hover:bg-ink-800/50'
              }`}
            >
              <Laptop className="w-4 h-4" /> Active Sessions
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'organization' 
                  ? 'bg-white dark:bg-ink-800 text-coral-600 dark:text-coral-400 shadow-sm border border-paper-200 dark:border-ink-700' 
                  : 'text-paper-600 dark:text-ink-300 hover:bg-paper-200/50 dark:hover:bg-ink-800/50'
              }`}
            >
              <Building className="w-4 h-4" /> {user?.organizationName || 'Organization'}
            </button>
          </nav>
          
          <div className="pt-4 mt-4 border-t border-paper-200 dark:border-ink-800">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-paper-600 dark:text-ink-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-ink-900 relative">
          <div className="absolute top-4 right-4 hidden md:block">
            <button onClick={onClose} className="p-2 hover:bg-paper-100 dark:hover:bg-ink-800 rounded-lg text-paper-400 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto space-y-10 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-paper-900 dark:text-white mb-1">My Profile</h3>
                  <p className="text-sm text-paper-500 dark:text-ink-400">Manage your personal information and contact details.</p>
                </div>
                
                {/* Profile Header Card */}
                <div className="p-6 border border-paper-200 dark:border-ink-700 rounded-xl bg-paper-50 dark:bg-ink-950 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-coral-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                  
                  <div className="relative group cursor-pointer">
                    <img 
                      src={`https://placehold.co/120x120/1a1d24/ffffff?text=${userInitials}`} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-ink-800 object-cover shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left z-10">
                    <h4 className="text-xl font-bold text-paper-900 dark:text-white">{user?.name || 'Jane Doe'}</h4>
                    <p className="text-sm text-coral-600 dark:text-coral-400 font-medium mb-3">{user?.role === 'manager' ? 'Property Manager' : 'Admin'}</p>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-sm">
                      <Building className="w-4 h-4 text-paper-400 dark:text-ink-400" />
                      <span className="text-xs font-semibold text-paper-700 dark:text-ink-200">14 Properties Managed</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Full Name</label>
                    <input type="text" defaultValue={user?.name || ''} className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Email Address</label>
                    <input type="email" defaultValue={user?.email || ''} disabled className="w-full px-3 py-2 bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg text-sm text-paper-500 dark:text-ink-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Phone Number</label>
                    <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Company / Agency</label>
                    <input type="text" defaultValue="Westside Realty Group" className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-paper-100 dark:border-ink-800">
                  <button className="px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold rounded-lg shadow-[0_4px_12px_rgba(255,107,107,0.3)] transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-2xl mx-auto space-y-10 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-paper-900 dark:text-white mb-1">Security & Access</h3>
                  <p className="text-sm text-paper-500 dark:text-ink-400">Keep your account secure with multi-factor authentication and strong passwords.</p>
                </div>

                {/* MFA Section */}
                <div className="p-6 border border-paper-200 dark:border-ink-700 rounded-xl bg-paper-50 dark:bg-ink-950">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-sm font-bold text-paper-900 dark:text-white">Multi-Factor Authentication (MFA)</h4>
                      </div>
                      <p className="text-xs text-paper-500 dark:text-ink-400 mt-2 max-w-md leading-relaxed">
                        Add an extra layer of security to your account. When enabled, you'll be required to enter a code from your authenticator app during sign in.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="px-4 py-2 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-700 text-paper-900 dark:text-white text-xs font-semibold rounded-lg transition-colors">
                        Enable MFA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="space-y-5 pt-4 border-t border-paper-100 dark:border-ink-800">
                  <h4 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-paper-400 dark:text-ink-400" /> Change Password
                  </h4>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-paper-700 dark:text-ink-300">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                    </div>
                    <button className="px-5 py-2.5 bg-paper-900 dark:bg-white text-white dark:text-ink-900 text-sm font-semibold rounded-lg hover:bg-paper-800 dark:hover:bg-paper-100 transition-colors mt-2">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 p-6 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Danger Zone
                      </h4>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 max-w-md">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-ink-950 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-semibold rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-paper-900 dark:text-white mb-1">Active Sessions</h3>
                  <p className="text-sm text-paper-500 dark:text-ink-400">Manage the devices and browsers that are currently signed into your account.</p>
                </div>

                <div className="space-y-4">
                  {/* Current Session */}
                  <div className="p-4 border border-coral-200 dark:border-coral-500/30 rounded-xl bg-coral-50/50 dark:bg-coral-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-coral-100 dark:bg-coral-500/20 flex items-center justify-center text-coral-600 dark:text-coral-400">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-2">
                          Windows • Chrome
                          <span className="text-[9px] uppercase tracking-wider font-bold bg-coral-100 dark:bg-coral-500/20 text-coral-700 dark:text-coral-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Current
                          </span>
                        </p>
                        <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Amsterdam, NL • IP: 192.168.1.1</p>
                      </div>
                    </div>
                  </div>

                  {/* Other Session */}
                  <div className="p-4 border border-paper-200 dark:border-ink-700 rounded-xl bg-white dark:bg-ink-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-paper-100 dark:bg-ink-800 flex items-center justify-center text-paper-500 dark:text-ink-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-paper-900 dark:text-white">iPhone 14 Pro • Safari</p>
                        <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Rotterdam, NL • Last active 2 hours ago</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-paper-100 dark:bg-ink-800 hover:bg-paper-200 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-300 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto">
                      Log Out
                    </button>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-paper-100 dark:border-ink-800 flex justify-end">
                  <button className="px-4 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 hover:bg-paper-50 dark:hover:bg-ink-800 text-paper-700 dark:text-ink-200 text-sm font-semibold rounded-lg transition-colors">
                    Sign Out of All Other Sessions
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-10">
                {!user?.organizationName ? (
                  <div className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-2xl p-8 text-center space-y-6 shadow-sm">
                    <div className="w-16 h-16 bg-coral-50 dark:bg-coral-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-coral-100 dark:border-coral-500/20">
                      <Building className="w-8 h-8 text-coral-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-paper-900 dark:text-white mb-2">Setup Your Organization</h3>
                      <p className="text-sm text-paper-500 dark:text-ink-400 max-w-md mx-auto">
                        It looks like you haven't linked your account to an organization yet. Please provide your organization details to continue.
                      </p>
                    </div>
                    
                    <form className="max-w-sm mx-auto space-y-4 text-left pt-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Organization Name *</label>
                        <input type="text" placeholder="e.g. Westside Realty Group" required className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Your Username *</label>
                        <input type="text" defaultValue={user?.username || ''} required className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Organization Logo (Optional)</label>
                        <div className="flex items-center justify-center w-full mt-1">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-paper-200 dark:border-ink-700 border-dashed rounded-lg cursor-pointer bg-paper-50 dark:bg-ink-950/50 hover:bg-paper-100 dark:hover:bg-ink-900 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-paper-500 dark:text-ink-400">
                              <Camera className="w-6 h-6 mb-2" />
                              <p className="text-xs">Click to upload logo</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button type="button" className="w-full px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold rounded-lg shadow-[0_4px_12px_rgba(255,107,107,0.3)] transition-all">
                          Create Organization
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-paper-900 dark:text-white mb-1">Organization Details</h3>
                        <p className="text-sm text-paper-500 dark:text-ink-400">Manage your organization profile and branding.</p>
                      </div>
                    </div>

                    <div className="p-6 border border-paper-200 dark:border-ink-700 rounded-xl bg-white dark:bg-ink-950 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-xl border-2 border-paper-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 flex items-center justify-center text-xl font-bold text-paper-400 dark:text-ink-500 shadow-sm overflow-hidden">
                          {user.organizationName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4 w-full">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-paper-700 dark:text-ink-300">Organization Name</label>
                          <input type="text" defaultValue={user.organizationName} className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors dark:text-white" />
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <button className="px-5 py-2 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-sm font-semibold rounded-lg transition-colors">
                            Update Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
