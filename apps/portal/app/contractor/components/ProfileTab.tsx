import React, { useState } from 'react';
import { 
  Pencil, 
  BadgeCheck, 
  Star, 
  CheckCircle2, 
  Eye, 
  Network, 
  Wrench, 
  Siren, 
  Plus, 
  Users,
  Building2,
  MessageSquareQuote,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { ContractorProfile, MaintenanceJob } from '../types';

interface ProfileTabProps {
  profile: ContractorProfile | null;
  jobs: MaintenanceJob[];
  onEditProfile: () => void;
}

export default function ProfileTab({ profile, jobs, onEditProfile }: ProfileTabProps) {
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  
  const handleStatusUpdate = async (newStatus: 'active' | 'offline') => {
    if (!profile?.id) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/contractor/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, status: newStatus })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };
  const standardRate = Number(profile?.hourlyRate || 50);
  const emergencyRate = Math.round(standardRate * 1.5);

  const defaultSpecialtyTags = [
    profile?.specialty || 'General Maintenance',
    'Pipe Leak Repair',
    'Emergency Repairs'
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 pb-20">
      
      {/* Hero Identity Card */}
      <div className="bg-gradient-to-br from-ink-800 to-ink-950 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-ink-700/80">
          {/* Decorative Glow Orbs */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-coral-500/15 blur-[50px] pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-blue-500/10 blur-[50px] pointer-events-none"></div>
          
          {/* Edit Profile Button */}
          <button 
            onClick={onEditProfile} 
            className="absolute top-5 right-5 z-20 flex items-center gap-2 px-3 py-1.5 bg-ink-950/50 hover:bg-ink-900 border border-ink-700/60 hover:border-coral-500/50 rounded-lg text-xs font-medium text-white shadow-sm backdrop-blur-md trans-subtle group"
          >
              <Pencil className="w-3.5 h-3.5 text-coral-400 group-hover:text-coral-300 trans-subtle" /> Edit Profile
          </button>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-5 text-left">
                  <div className="relative">
                      <img 
                        src={profile?.photoUrl || `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=150&h=150`} 
                        alt="Avatar" 
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-ink-600/50" 
                      />
                      {/* Status Indicator Pip */}
                      <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 border-[3px] border-ink-900 rounded-full shadow-sm ${
                        profile?.status === 'active' ? 'bg-emerald-500' : 'bg-ink-600'
                      }`}></div>
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                          {profile?.name || 'Create Your Profile'} <BadgeCheck className="w-5 h-5 text-blue-400" />
                      </h1>
                      <p className="text-ink-300 text-sm mt-1 font-medium">
                        {profile?.specialty || 'General Contractor'} • {profile?.locationName || 'Service Area'}
                      </p>
                  </div>
              </div>

              {/* Status Toggle Segments */}
              <div className="flex items-center bg-ink-950/80 border border-ink-700/60 p-1 rounded-xl backdrop-blur-md shadow-inner">
                  <button 
                    onClick={() => handleStatusUpdate('active')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 trans-subtle ${
                      profile?.status !== 'offline' 
                        ? 'bg-ink-800 text-white shadow-sm border border-ink-600/50' 
                        : 'text-ink-400 hover:text-white hover:bg-ink-800/50'
                    }`}
                  >
                      <span className={`w-2 h-2 rounded-full ${profile?.status !== 'offline' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-emerald-400'}`}></span> Available
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('offline')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 trans-subtle ${
                      profile?.status === 'offline' 
                        ? 'bg-ink-800 text-white shadow-sm border border-ink-600/50' 
                        : 'text-ink-400 hover:text-white hover:bg-ink-800/50'
                    }`}
                  >
                      <span className="w-2 h-2 rounded-full bg-ink-600"></span> Off-Duty
                  </button>
              </div>
          </div>

          {/* Subtle Divider */}
          <div className="relative z-10 h-px w-full bg-gradient-to-r from-ink-700/0 via-ink-600/50 to-ink-700/0 my-8"></div>

          {/* Key Metrics Row */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              {/* Rating Metric */}
              <div className="flex flex-col">
                  <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Average Rating
                  </span>
                  <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white tracking-tight">NA</span>
                      <span className="text-[11px] text-ink-400 font-medium">No reviews yet</span>
                  </div>
              </div>
              
              {/* Jobs Metric */}
              <div className="flex flex-col border-l border-ink-700/40 pl-6">
                  <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Jobs Completed
                  </span>
                  <span className="text-3xl font-bold text-white tracking-tight">{completedCount}</span>
              </div>

              {/* Profile Views Metric */}
              <div className="flex flex-col border-l border-ink-700/40 pl-6">
                  <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> Profile Views
                  </span>
                  <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-ink-300 tracking-tight">NA FOR ADDED</span>
                  </div>
              </div>

              {/* Network Metric */}
              <div className="flex flex-col border-l border-ink-700/40 pl-6">
                  <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-indigo-400" /> PM Bookmarks
                  </span>
                  <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-ink-300 tracking-tight">NA FOR ADDED</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Two Column Layout below Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Services & Pricing */}
          <div className="space-y-6">
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm trans-theme flex flex-col h-full text-left">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-paper-100 dark:border-ink-700/50 trans-theme">
                      <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-paper-500" /> Services & Pricing
                      </h3>
                      <button onClick={onEditProfile} className="text-xs font-medium text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 trans-subtle">
                          Edit Settings
                      </button>
                  </div>

                  {/* Rates Config */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-paper-50 dark:bg-ink-900/50 rounded-lg border border-paper-200 dark:border-ink-700 trans-theme">
                          <p className="text-[10px] text-paper-500 dark:text-ink-400 font-semibold uppercase tracking-wider mb-1">Standard Rate</p>
                          <p className="text-xl font-bold text-paper-900 dark:text-white">${standardRate}<span className="text-xs text-paper-500 font-normal">/hr</span></p>
                      </div>
                      <div className="p-3 bg-coral-50 dark:bg-coral-500/10 rounded-lg border border-coral-200 dark:border-coral-500/20 trans-theme">
                          <p className="text-[10px] text-coral-600 dark:text-coral-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Siren className="w-3 h-3" /> Emergency Rate
                          </p>
                          <p className="text-xl font-bold text-coral-700 dark:text-coral-300">${emergencyRate}<span className="text-xs text-coral-600/70 font-normal">/hr</span></p>
                      </div>
                  </div>

                  {/* Offered Services Tags */}
                  <div>
                      <p className="text-xs font-medium text-paper-900 dark:text-white mb-3">Publicly Listed Services</p>
                      <div className="flex flex-wrap gap-2">
                          {defaultSpecialtyTags.map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-600 rounded-md text-xs text-paper-700 dark:text-ink-200 shadow-sm trans-theme">
                              {tag}
                            </span>
                          ))}
                          <button onClick={onEditProfile} className="px-2.5 py-1 border border-dashed border-paper-300 dark:border-ink-600 text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white hover:border-paper-400 dark:hover:border-ink-500 rounded-md text-xs font-medium trans-subtle flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Add Tag
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Column: Network & Recent Reviews */}
          <div className="space-y-6 text-left">
              
              {/* My Network Card */}
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm trans-theme">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-paper-500" /> My PM Network
                      </h3>
                      <button className="w-7 h-7 flex items-center justify-center bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 rounded-md hover:bg-coral-100 trans-subtle">
                          <Plus className="w-4 h-4" />
                      </button>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-paper-100 dark:border-ink-700/50 hover:border-paper-300 dark:hover:border-ink-600 trans-subtle group">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-coral-500 text-white flex items-center justify-center shadow-sm">
                                  <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                  <p className="text-xs font-bold text-paper-900 dark:text-white">landlord.nl Mgmt</p>
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-Approval Enabled</p>
                              </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 text-paper-400 hover:text-paper-900 dark:hover:text-white trans-subtle">
                              <MoreHorizontal className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Highlighted Reviews Snippet */}
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden shadow-sm trans-theme">
                  <div className="px-5 py-3 border-b border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 flex justify-between items-center trans-theme">
                      <h3 className="text-xs font-semibold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <MessageSquareQuote className="w-4 h-4 text-paper-500" /> Tenant Feedback
                      </h3>
                  </div>
                  
                  <div className="p-5">
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                              SJ
                          </div>
                          <div>
                              <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1 text-amber-500">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                  </div>
                                  <span className="text-[10px] text-paper-400 dark:text-ink-500">2 days ago</span>
                              </div>
                              <p className="text-sm text-paper-700 dark:text-ink-200 italic mb-2 leading-relaxed">
                                  "Fixed the issue quickly and professionally. Extremely clean and polite throughout the repair work."
                              </p>
                              <p className="text-[10px] text-paper-500 dark:text-ink-400 font-medium">— Sarah Jenkins, Grandview Apts</p>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>
      
    </div>
  );
}
