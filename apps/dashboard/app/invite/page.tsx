'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from '@repo/auth';
import { Building2, ShieldCheck, Mail, ArrowRight, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';

interface InviteDetails {
  targetRole: string;
  propertyName: string;
  managerName: string;
  unitDetails: string;
  monthlyRent: string;
  nextInvoiceDate: string;
  propertyId: string | null;
  unitId: string | null;
}

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

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!code) {
      setError('Invitation code is missing. Please check your invite link.');
      setLoadingInvite(false);
      return;
    }

    const verifyInvite = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/dashboard/tenants/invites/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Invalid or expired invitation code.');
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

  const handleAccept = async () => {
    if (!code || !inviteDetails) return;
    setAccepting(true);
    setError(null);

    const isTenant = inviteDetails.targetRole === 'tenant';
    const endpoint = isTenant 
      ? 'http://localhost:4000/api/dashboard/tenants/invites/accept'
      : 'http://localhost:4000/api/dashboard/team/invites/accept';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to accept invitation.');
      }

      setSuccessMsg(isTenant ? 'Invitation accepted! Redirecting to your portal...' : 'Joined team successfully! Redirecting...');
      
      // Delay to let user see success message before redirect
      setTimeout(() => {
        if (isTenant) {
          window.location.href = `${portalUrl}/tenant`;
        } else {
          window.location.href = '/finance/ledger';
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

  if (loadingInvite || sessionPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin text-coral-500 mb-4" />
        <p className="text-sm font-medium animate-pulse">Verifying invitation code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-paper-50 dark:bg-ink-950 px-4">
        <div className="w-full max-w-md bg-white dark:bg-ink-900 border border-coral-500/20 rounded-xl p-8 shadow-xl text-center">
          <div className="w-12 h-12 bg-coral-500/10 text-coral-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-paper-900 dark:text-white mb-2">Invitation Error</h2>
          <p className="text-xs text-paper-500 dark:text-ink-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (successMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-paper-50 dark:bg-ink-950 px-4">
        <div className="w-full max-w-md bg-white dark:bg-ink-900 border border-green-500/20 rounded-xl p-8 shadow-xl text-center animate-fade-in">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-paper-900 dark:text-white mb-2">Welcome Aboard!</h2>
          <p className="text-xs text-paper-500 dark:text-ink-400 mb-4">{successMsg}</p>
          <Loader2 className="w-5 h-5 animate-spin text-green-500 mx-auto" />
        </div>
      </div>
    );
  }

  const isTenantInvite = inviteDetails?.targetRole === 'tenant';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper-50 dark:bg-ink-950 px-4 py-12">
      {/* Background blobs for premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-coral-500 rounded-full filter blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-2xl relative z-10">
        {/* Header/Banner */}
        <div className="bg-gradient-to-r from-coral-500/10 to-blue-500/10 px-8 py-6 border-b border-paper-200 dark:border-ink-800 text-center">
          <div className="w-12 h-12 bg-coral-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-coral-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-base font-bold text-paper-900 dark:text-white">
            {isTenantInvite ? 'Tenant Invitation' : 'Team Invitation'}
          </h1>
          <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1">
            You've been invited by <span className="font-semibold text-paper-700 dark:text-ink-200">{inviteDetails?.managerName}</span>
          </p>
        </div>

        {/* Details Card */}
        <div className="p-8 space-y-6">
          <div className="bg-paper-50 dark:bg-ink-950 rounded-xl p-4 border border-paper-100 dark:border-ink-800/50 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-paper-400 tracking-wider">Organization / Property</span>
              <p className="text-xs font-bold text-paper-800 dark:text-white mt-0.5">{inviteDetails?.propertyName}</p>
            </div>

            {isTenantInvite ? (
              <>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-paper-400 tracking-wider">Unit Details</span>
                  <p className="text-xs font-semibold text-paper-800 dark:text-white mt-0.5">{inviteDetails?.unitDetails}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-paper-200 dark:border-ink-800/40">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-paper-400 tracking-wider">Monthly Rent</span>
                    <p className="text-xs font-bold text-coral-500 mt-0.5">{inviteDetails?.monthlyRent}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-paper-400 tracking-wider">Payments Start</span>
                    <p className="text-xs font-semibold text-paper-800 dark:text-white mt-0.5">{inviteDetails?.nextInvoiceDate}</p>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <span className="text-[10px] uppercase font-semibold text-paper-400 tracking-wider">Assigned Role</span>
                <p className="text-xs font-bold text-blue-500 mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> {inviteDetails?.targetRole}
                </p>
              </div>
            )}
          </div>

          {/* Conditional CTAs based on login state */}
          {session ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>
                  Accepting as <strong className="font-semibold">{session.user?.email}</strong>
                </span>
              </div>

              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-coral-500/15"
              >
                {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept & Join'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] text-paper-500 dark:text-ink-400 text-center leading-relaxed">
                To accept this invitation and set up your portal access, please sign in or create an account.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`${portalUrl}/login?redirect=${encodeURIComponent(getRedirectUrl())}`}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 text-xs font-semibold rounded-lg hover:bg-paper-50 dark:hover:bg-ink-950 transition-colors text-center"
                >
                  Sign In
                </a>
                <a
                  href={`${portalUrl}/register?redirect=${encodeURIComponent(getRedirectUrl())}`}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-coral-500/10 text-center"
                >
                  Register <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin text-coral-500 mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading invitation portal...</p>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
