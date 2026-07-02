'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from '@repo/auth';
import { 
  Building2, ShieldCheck, Mail, ArrowRight, UserCheck, AlertTriangle, 
  Loader2, HelpCircle, LogIn, UserPlus, Sun, Moon, Home, Shield
} from 'lucide-react';

interface InviteDetails {
  email: string;
  targetRole: string;
  propertyName: string;
  managerName: string;
  unitDetails: string;
  monthlyRent: string;
  nextInvoiceDate: string;
  propertyId: string | null;
  unitId: string | null;
}

// ----------------------------------------------------
// Large Abstract Geometric Background (Sun, orbits, triangles, clouds - No text or numbers)
// ----------------------------------------------------
function AbstractGeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <svg className="w-full h-full min-w-[1024px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 dark:opacity-20" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Background Fill */}
        <rect width="1000" height="800" fill="#fcfbf9" className="transition-colors duration-300 dark:hidden" />
        <rect width="1000" height="800" fill="#0b0c0f" className="transition-colors duration-300 hidden dark:block" />

        {/* Coral Sun */}
        <circle cx="280" cy="220" r="85" fill="#ff6b6b" opacity="0.85" />
        
        {/* Floating Charcoal Triangles */}
        <polygon points="460,110 490,160 430,160" fill="#343d50" />
        <polygon points="190,280 210,310 170,310" fill="#343d50" opacity="0.8" />
        <polygon points="720,200 770,280 670,280" stroke="#343d50" strokeWidth="2" />

        {/* Abstract Lines & Orbits */}
        <path d="M100,360 L900,360" stroke="#343d50" strokeWidth="1.5" opacity="0.15" />
        <path d="M400,180 L900,180" stroke="#343d50" strokeWidth="1.5" opacity="0.15" />
        <path d="M380,240 L850,240" stroke="#343d50" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />
        <path d="M600,100 L750,250 M650,80 L800,230" stroke="#ffc2c2" strokeWidth="2" opacity="0.5" />
        <circle cx="380" cy="280" r="16" stroke="#343d50" strokeWidth="1.5" opacity="0.3" />
        
        {/* Peach Circles */}
        <circle cx="480" cy="290" r="18" fill="#ffc2c2" />
        <circle cx="510" cy="220" r="28" fill="#ffdede" opacity="0.5" />
        <circle cx="780" cy="310" r="38" fill="#ffdede" />

        {/* Minimalist Cloud Silhouettes */}
        <path d="M620,130 C640,110 670,110 690,130 C700,120 720,120 730,130 L730,140 L610,140 Z" fill="#ffdede" opacity="0.3" />
        <path d="M180,380 C195,365 215,365 230,380 C238,373 252,373 260,380 L260,388 L170,388 Z" fill="#ffdede" opacity="0.4" />

        {/* Ground Line Art Elements at the bottom */}
        <line x1="50" y1="640" x2="950" y2="640" stroke="#343d50" strokeWidth="2" />
        <line x1="50" y1="650" x2="950" y2="650" stroke="#343d50" strokeWidth="1" opacity="0.4" />
        
        {/* Abstract Minimalist Tree / Geometric Shapes */}
        <circle cx="150" cy="580" r="28" fill="#ffdede" opacity="0.85" />
        <line x1="150" y1="580" x2="150" y2="640" stroke="#343d50" strokeWidth="2" />
        
        <circle cx="850" cy="560" r="34" stroke="#343d50" strokeWidth="1.5" />
        <line x1="850" y1="560" x2="850" y2="640" stroke="#343d50" strokeWidth="2" />

        <polygon points="500,520 520,560 480,560" fill="#343d50" />
        <line x1="500" y1="560" x2="500" y2="640" stroke="#343d50" strokeWidth="2" />
        
        <circle cx="280" cy="625" r="8" fill="#ff6b6b" />
        <circle cx="720" cy="620" r="12" fill="#ffdede" />
      </svg>
    </div>
  );
}

function LoadingIllustration() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
      <div className="absolute inset-0 bg-coral-500/20 blur-xl rounded-full w-16 h-16 animate-pulse"></div>
      <div className="absolute w-20 h-20 rounded-full border border-paper-200 dark:border-ink-800 border-t-coral-500 animate-spin" style={{ animationDuration: '1.2s' }}></div>
      <div className="absolute w-16 h-16 rounded-full border border-paper-200 dark:border-ink-800 border-b-coral-400 animate-spin" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}></div>
      <div className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 text-white flex items-center justify-center shadow-lg shadow-coral-500/30">
        <Building2 className="w-4.5 h-4.5" />
      </div>
    </div>
  );
}

function ErrorIllustration() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
      <div className="absolute inset-0 bg-coral-500/10 blur-xl rounded-full w-16 h-16"></div>
      <div className="absolute w-20 h-20 rounded-full border border-paper-200 dark:border-ink-800 border-t-coral-500" />
      <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 text-white flex items-center justify-center shadow-lg shadow-coral-500/30">
        <AlertTriangle className="w-5 h-5" />
      </div>
    </div>
  );
}

function SuccessIllustration() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full w-16 h-16"></div>
      <div className="absolute w-20 h-20 rounded-full border border-paper-200 dark:border-ink-800 border-t-emerald-500" />
      <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <UserCheck className="w-5 h-5" />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Invite Page Content
// ----------------------------------------------------
function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { data: session, isPending: sessionPending } = useSession();

  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                  localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if (!code) {
      setError('Invitation code is missing. Please check your invite link.');
      setLoadingInvite(false);
      return;
    }

    const verifyInvite = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants/invites/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const contentType = res.headers.get('content-type');
        let data: any;
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || `Verify failed with status ${res.status}.`);
        }

        if (!res.ok) {
          throw new Error(data?.message || 'Invalid or expired invitation code.');
        }

        setInviteDetails(data);
      } catch (err: any) {
        setError(err.message || 'Failed to verify invitation code.');
      } finally {
        setLoadingInvite(false);
      }
    };

    verifyInvite();
  }, [code]);

  const handleSignOutAndRedirect = async () => {
    try {
      await signOut();
      window.location.href = `${portalUrl}/login?redirect=${encodeURIComponent(getRedirectUrl())}`;
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  const handleAccept = async () => {
    if (!code || !inviteDetails) return;
    setAccepting(true);
    setError(null);

    const isTenant = inviteDetails.targetRole === 'tenant';
    const endpoint = isTenant 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants/invites/accept`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/invites/accept`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const contentType = res.headers.get('content-type');
      let data: any;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Accept failed with status ${res.status}.`);
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to accept invitation.');
      }

      setSuccessMsg(isTenant ? 'Invitation accepted! Redirecting to your portal...' : 'Joined team successfully! Redirecting...');
      
      setTimeout(() => {
        if (isTenant) {
          window.location.href = `${portalUrl}/tenant`;
        } else {
          window.location.href = '/overview';
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation.');
      setAccepting(false);
    }
  };

  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/invite?code=${code}`;
    }
    return '';
  };

  const renderTopbar = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-ink-950/70 backdrop-blur-md border-b border-paper-100 dark:border-ink-800 z-50 flex items-center justify-between px-6 sm:px-12 transition-colors duration-300">
      <div className="flex items-center gap-2 select-none">
        <img 
          src="/dane_wordmark.png" 
          className="h-5 sm:h-6 object-contain dark:invert-0 invert transition-all" 
          alt="Dane Properties" 
        />
      </div>
      <button 
        onClick={toggleDarkMode} 
        className="p-2 rounded-lg bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 border border-paper-200 dark:border-ink-700 hover:bg-paper-50 dark:hover:bg-ink-700 transition-colors shadow-sm"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun className="w-4 h-4 text-coral-500" /> : <Moon className="w-4 h-4 text-paper-700" />}
      </button>
    </header>
  );

  const renderFooter = () => (
    <footer className="w-full py-4 text-center text-[10px] text-paper-400 dark:text-ink-400 relative z-10 transition-colors duration-300">
      <div className="max-w-md mx-auto px-6 flex justify-between items-center gap-4 border-t border-paper-200 dark:border-ink-800/80 pt-4">
        <div>© 2026 Dane Properties.</div>
        <div className="flex gap-4 font-semibold">
          <a href="#" className="hover:text-paper-700 dark:hover:text-ink-200">Terms</a>
          <a href="#" className="hover:text-paper-700 dark:hover:text-ink-200">Privacy</a>
          <a href="#" className="hover:text-paper-700 dark:hover:text-ink-200">Support</a>
        </div>
      </div>
    </footer>
  );

  // loading state
  if (loadingInvite || sessionPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfbf9] dark:bg-ink-950 text-paper-900 dark:text-white px-4 relative overflow-hidden transition-colors duration-300">
        {renderTopbar()}
        <AbstractGeometricBackground />
        <div className="w-full max-w-sm bg-white/90 dark:bg-ink-900/90 backdrop-blur-md border border-paper-200 dark:border-ink-800 rounded-2xl p-8 shadow-2xl text-center z-10 relative">
          <LoadingIllustration />
          <h2 className="text-xs font-bold tracking-widest uppercase text-paper-900 dark:text-white animate-pulse">
            Verifying Invitation
          </h2>
          <p className="text-[10px] text-paper-400 dark:text-ink-400 mt-2">Connecting to secure access gate...</p>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcfbf9] dark:bg-ink-950 relative overflow-hidden transition-colors duration-300">
        {renderTopbar()}
        <AbstractGeometricBackground />
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 mt-16 z-10">
          <div className="w-full max-w-sm bg-white/95 dark:bg-ink-900/95 backdrop-blur-md border border-paper-200 dark:border-ink-800 rounded-2xl p-8 shadow-2xl text-center mb-6">
            <ErrorIllustration />
            <h2 className="text-base font-extrabold text-paper-900 dark:text-white flex items-center justify-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-coral-500" /> Invitation Error
            </h2>
            <p className="text-xs text-paper-700 dark:text-ink-300 mb-6 leading-relaxed max-w-xs mx-auto">
              {error.includes('Unexpected token') ? 'The verify request encountered an unhandled gateway response. This invite may be invalid or obsolete.' : error}
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => router.push('/')}
                className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-coral-500/10 active:scale-95"
              >
                Return to Homepage
              </button>
              <a
                href={`mailto:support@daneproperties.nl`}
                className="text-[10px] text-paper-450 hover:text-paper-700 dark:text-ink-500 dark:hover:text-ink-300 underline font-semibold flex items-center justify-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Contact Support
              </a>
            </div>
          </div>
          {renderFooter()}
        </div>
      </div>
    );
  }

  // success redirection
  if (successMsg) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcfbf9] dark:bg-ink-950 relative overflow-hidden transition-colors duration-300">
        {renderTopbar()}
        <AbstractGeometricBackground />
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 mt-16 z-10">
          <div className="w-full max-w-sm bg-white/95 dark:bg-ink-900/95 backdrop-blur-md border border-paper-200 dark:border-ink-800 rounded-2xl p-8 shadow-2xl text-center mb-6">
            <SuccessIllustration />
            <h2 className="text-base font-extrabold text-paper-900 dark:text-white flex items-center justify-center gap-1.5 mb-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> Access Granted
            </h2>
            <p className="text-xs text-paper-700 dark:text-ink-300 mb-6 leading-relaxed max-w-xs mx-auto">
              {successMsg}
            </p>
            <div className="flex items-center justify-center gap-2 text-paper-400 dark:text-ink-400 text-[10px] font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-coral-500" />
              <span>Redirecting...</span>
            </div>
          </div>
          {renderFooter()}
        </div>
      </div>
    );
  }

  const isTenantInvite = inviteDetails?.targetRole === 'tenant';

  // default accept page
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbf9] dark:bg-ink-950 relative overflow-hidden transition-colors duration-300">
      {renderTopbar()}
      <AbstractGeometricBackground />

      {/* Centered High Fidelity Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 mt-24 mb-8 z-10">
        <div className="w-full max-w-sm bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in relative mb-6">
          {/* Subtle Glow Backdrop inside card */}
          <div className="absolute -right-20 -bottom-20 w-52 h-52 bg-coral-500/10 blur-[50px] rounded-full pointer-events-none" />

          {/* Header Panel */}
          <div className="bg-[#0b0c0f] border-b border-coral-500/20 px-6 py-8 text-center relative overflow-hidden group">
            {/* Cinematic background light */}
            <div className="absolute -right-20 -bottom-20 w-44 h-44 bg-coral-500/10 blur-[40px] rounded-full pointer-events-none"></div>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-coral-500/30">
              {isTenantInvite ? <Building2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            
            <h1 className="text-lg font-bold text-white tracking-tight">
              {isTenantInvite ? 'Tenant Portal Invitation' : 'Team Portal Invitation'}
            </h1>
            
            <p className="text-[11px] text-coral-400 mt-2 font-medium">
              You've been invited by <span className="font-extrabold text-white">{inviteDetails?.managerName || 'Operations Lead'}</span>
            </p>
          </div>

          {/* Body details */}
          <div className="p-6 space-y-6 relative z-10">
            <div className="bg-paper-50 dark:bg-ink-950 rounded-xl p-4 border border-paper-200/60 dark:border-ink-850/60 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-paper-400 dark:text-ink-400 uppercase tracking-wider text-[9px]">Company</span>
                <span className="font-extrabold text-paper-900 dark:text-white">{inviteDetails?.propertyName}</span>
              </div>

              {isTenantInvite ? (
                <>
                  <div className="w-full h-px bg-paper-200 dark:bg-ink-800/40 my-1" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-paper-400 dark:text-ink-400 uppercase tracking-wider text-[9px]">Unit</span>
                    <span className="font-semibold text-paper-900 dark:text-white">{inviteDetails?.unitDetails}</span>
                  </div>
                  
                  <div className="w-full h-px bg-paper-200 dark:bg-ink-800/40 my-1" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-paper-400 dark:text-ink-400 uppercase tracking-wider text-[9px]">Monthly Rent</span>
                    <span className="font-extrabold text-coral-500 font-mono">{inviteDetails?.monthlyRent}</span>
                  </div>

                  <div className="w-full h-px bg-paper-200 dark:bg-ink-800/40 my-1" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-paper-400 dark:text-ink-400 uppercase tracking-wider text-[9px]">Payments Start</span>
                    <span className="font-semibold text-paper-900 dark:text-white">{inviteDetails?.nextInvoiceDate}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-px bg-paper-200 dark:bg-ink-800/40 my-1" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-paper-400 dark:text-ink-400 uppercase tracking-wider text-[9px]">Access Role</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {inviteDetails?.targetRole}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Custom login verification messaging */}
            {session && inviteDetails && session.user?.email?.toLowerCase() !== inviteDetails.email?.toLowerCase() ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 p-3.5 bg-coral-500/5 border border-coral-500/20 rounded-lg text-xs text-paper-700 dark:text-ink-200">
                  <AlertTriangle className="w-4 h-4 text-coral-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    This invitation was sent to <strong className="font-extrabold text-paper-900 dark:text-white">{inviteDetails.email}</strong>, but you are signed in as <strong className="font-extrabold text-paper-900 dark:text-white">{session.user?.email}</strong>.
                  </span>
                </div>

                <button
                  onClick={handleSignOutAndRedirect}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(255,107,107,0.3)] hover:shadow-[0_0_20px_rgba(255,107,107,0.5)] active:scale-95"
                >
                  Switch Accounts
                </button>
              </div>
            ) : session ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-paper-700 dark:text-ink-200">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="leading-relaxed">
                    You are signed in as <strong className="font-extrabold text-paper-900 dark:text-white">{session.user?.email}</strong>. Press Accept below to join this workspace.
                  </span>
                </div>

                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(255,107,107,0.3)] hover:shadow-[0_0_20px_rgba(255,107,107,0.5)] active:scale-95"
                >
                  {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept & Join'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[11px] text-paper-700 dark:text-ink-300 text-center font-semibold leading-relaxed max-w-xs mx-auto">
                  To accept this invitation and configure your portal access, please sign in or register a new account.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`${portalUrl}/login?redirect=${encodeURIComponent(getRedirectUrl())}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg hover:bg-paper-100 dark:hover:bg-ink-800 transition-all text-center bg-white dark:bg-ink-850 shadow-sm active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </a>
                  <a
                    href={`${portalUrl}/register?redirect=${encodeURIComponent(getRedirectUrl())}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-coral-500/10 text-center active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
        {renderFooter()}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfbf9] dark:bg-ink-950 text-paper-900 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin text-coral-500 mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading invitation portal...</p>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
