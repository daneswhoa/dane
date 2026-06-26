import React from 'react';
import { 
  CreditCard, 
  CalendarClock, 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  Wifi, 
  Wrench, 
  Megaphone, 
  Droplet, 
  PartyPopper 
} from 'lucide-react';
import { TenantProfile } from '../types';

interface HomeTabProps {
  profile: TenantProfile | null;
  onPayRent: () => void;
  onViewDetails: () => void;
}

export default function HomeTab({ profile, onPayRent, onViewDetails }: HomeTabProps) {
  return (
    <div className="p-6 w-full max-w-full space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">Good morning, {profile?.name?.split(' ')[0] || 'Resident'}.</h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">Here is the latest for {profile?.building || 'your building'}, Unit {profile?.unit || 'N/A'}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* The "Black Card" Rent Hero */}
        <div className="lg:col-span-2 bg-[#0b0c0f] border border-coral-500/30 rounded-2xl p-6 shadow-xl shadow-coral-500/10 relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-coral-500/15 blur-[50px] rounded-full pointer-events-none group-hover:bg-coral-500/25 transition-all duration-700 ease-in-out"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2 text-ink-300">
                <CreditCard className="w-5 h-5 text-coral-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-ink-200">Current Balance</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-ink-800/80 border border-ink-700 text-[10px] font-semibold text-ink-200 flex items-center gap-1.5 backdrop-blur-sm">
                <div className={`w-6 h-3.5 ${profile?.autopayEnabled ? 'bg-emerald-500' : 'bg-ink-600'} rounded-full relative shadow-inner`}>
                  <div className={`absolute ${profile?.autopayEnabled ? 'right-0.5' : 'left-0.5'} top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow`}></div>
                </div>
                {profile?.autopayEnabled ? 'Autopay Enabled' : 'Autopay Off'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-5xl font-bold text-white tracking-tight mb-2">
                  ${(profile?.owedAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.')[0]}
                  <span className="text-2xl text-ink-400 font-medium">.{(profile?.owedAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.')[1]}</span>
                </h2>
                <p className="text-sm font-medium text-coral-400 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4" /> 
                  {profile?.rentDueDate ? `Due ${new Date(profile.rentDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'No upcoming due dates'}
                </p>
                {Boolean(profile?.deposit && profile.deposit > 0) && (
                  <p className="text-[11px] text-ink-300 flex items-center gap-1.5 mt-3 pt-3 border-t border-ink-700/50">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">Deposit Secured:</span>
                    <span>${profile?.deposit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} on file</span>
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button onClick={onViewDetails} className="px-5 py-2.5 rounded-lg bg-ink-800 text-white hover:bg-ink-700 border border-ink-700 text-sm font-semibold trans-subtle flex items-center gap-2">
                  View Details
                </button>
                <button onClick={onPayRent} className="px-5 py-2.5 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold shadow-[0_0_15px_rgba(255,107,107,0.3)] hover:shadow-[0_0_20px_rgba(255,107,107,0.5)] active:scale-95 trans-subtle flex items-center gap-2">
                  Pay Rent Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Property Manager Card */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-5 shadow-sm trans-theme flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <h3 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-4">Your Property Manager</h3>
          
          <div className="flex items-center gap-3 mb-5">
            <img src={profile?.managerName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.managerName)}&background=3b82f6&color=fff` : "https://placehold.co/48x48/3b82f6/ffffff?text=PM"} alt="PM" className="w-12 h-12 rounded-full border-2 border-paper-100 dark:border-ink-700 object-cover" />
            <div>
              <p className="text-sm font-bold text-paper-900 dark:text-white">{profile?.managerName || 'Jane Doe'}</p>
              <p className="text-[10px] text-paper-500 dark:text-ink-400">{profile?.managerEmail || 'Westside Realty Group'}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <a href={`mailto:${profile?.managerEmail || ''}`} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 hover:bg-paper-200 dark:hover:bg-ink-700 rounded-lg text-xs font-semibold text-paper-800 dark:text-ink-100 trans-subtle">
              <MessageSquare className="w-3.5 h-3.5" /> Send Message
            </a>
            <a href={profile?.managerPhone ? `tel:${profile.managerPhone}` : '#'} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 hover:bg-paper-200 dark:hover:bg-ink-700 rounded-lg text-xs font-semibold text-paper-800 dark:text-ink-100 trans-subtle">
              <Phone className="w-3.5 h-3.5" /> Emergency Call
            </a>
          </div>
          
          <div className="mt-4 pt-3 border-t border-paper-100 dark:border-ink-700 flex justify-between items-center text-[10px] text-paper-500 dark:text-ink-400">
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Lobby WiFi:</span>
            <span className="font-mono text-paper-900 dark:text-white font-medium bg-paper-100 dark:bg-ink-900 px-1.5 py-0.5 rounded">Grandview_Guest</span>
          </div>
        </div>
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Maintenance */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden shadow-sm trans-theme flex flex-col h-full">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 flex justify-between items-center trans-theme">
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-coral-500" /> Maintenance Status
            </h3>
            <button className="text-[10px] font-semibold text-coral-600 dark:text-coral-400 hover:text-coral-700 trans-subtle flex items-center gap-1">
              View History <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 p-2 space-y-1">
            {/* Active Ticket */}
            {profile?.latestTicket ? (
              <div className="p-3 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-coral-300 dark:hover:border-coral-500/50 trans-subtle cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-bold text-paper-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 trans-subtle">
                    {profile.latestTicket.title}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[9px] font-semibold tracking-wide uppercase trans-theme">
                    {profile.latestTicket.status === 'in_progress' && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                      </span>
                    )}
                    {profile.latestTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-paper-500 dark:text-ink-300 leading-relaxed mb-3 line-clamp-2">
                  {profile.latestTicket.description}
                </p>
                <div className="flex items-center justify-between text-[10px] border-t border-paper-100 dark:border-ink-700/50 pt-2">
                  <span className="text-paper-400 dark:text-ink-500">Ticket #{profile.latestTicket.id.split('-').pop()?.toUpperCase()}</span>
                  <span className="font-medium text-paper-700 dark:text-ink-200 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3 text-paper-400" /> 
                    Reported: {new Date(profile.latestTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center text-paper-500 dark:text-ink-400 text-xs">
                No active maintenance requests.
              </div>
            )}
          </div>
        </div>

        {/* Community Announcements */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden shadow-sm trans-theme flex flex-col h-full">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 flex justify-between items-center trans-theme">
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-500" /> Building Announcements
            </h3>
          </div>
          
          <div className="flex-1 p-2 space-y-1">
            {/* Announcement 1 */}
            <div className="p-3 rounded-lg hover:bg-paper-50 dark:hover:bg-ink-900/50 trans-subtle cursor-pointer flex gap-3">
              <div className="mt-0.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                  <Droplet className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 border-b border-paper-100 dark:border-ink-700/50 pb-3">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-xs font-bold text-paper-900 dark:text-white">Scheduled Water Shutoff</h4>
                  <span className="text-[9px] text-paper-400 dark:text-ink-500">Yesterday</span>
                </div>
                <p className="text-[10px] text-paper-600 dark:text-ink-300 leading-snug">Water will be shut off for the entire building this Tuesday between 10 AM and 2 PM for mandatory pump maintenance.</p>
              </div>
            </div>

            {/* Announcement 2 */}
            <div className="p-3 rounded-lg hover:bg-paper-50 dark:hover:bg-ink-900/50 trans-subtle cursor-pointer flex gap-3">
              <div className="mt-0.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                  <PartyPopper className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-xs font-bold text-paper-900 dark:text-white">Rooftop Lounge Open</h4>
                  <span className="text-[9px] text-paper-400 dark:text-ink-500">Oct 12</span>
                </div>
                <p className="text-[10px] text-paper-600 dark:text-ink-300 leading-snug">The renovations are finally complete! The rooftop lounge and grills are now open for resident use from 8 AM to 10 PM daily.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
