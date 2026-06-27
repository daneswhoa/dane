'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut, authClient } from '@repo/auth';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Key, Globe, Server, Database, ArrowRight } from 'lucide-react';

export default function DebugPage() {
  const { data: session, isPending, error } = useSession();
  const [directSessionData, setDirectSessionData] = useState<any>(null);
  const [directSessionLoading, setDirectSessionLoading] = useState(false);
  const [directSessionError, setDirectSessionError] = useState<string | null>(null);

  const [cookieData, setCookieData] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [headersData, setHeadersData] = useState<any>(null);
  const [headersLoading, setHeadersLoading] = useState(false);
  const [headersError, setHeadersError] = useState<string | null>(null);

  const [localHeadersData, setLocalHeadersData] = useState<any>(null);
  const [localHeadersLoading, setLocalHeadersLoading] = useState(false);
  const [localHeadersError, setLocalHeadersError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookieData(document.cookie);
    }
  }, []);

  const runDiagnostics = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      // Direct fetch to our proxied endpoint
      const res = await fetch('/api/auth/get-session', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch session');
    } finally {
      setApiLoading(false);
    }
  };

  const fetchDebugHeaders = async () => {
    setHeadersLoading(true);
    setHeadersError(null);
    try {
      const res = await fetch('/api/auth/debug-headers', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setHeadersData(data);
    } catch (err: any) {
      setHeadersError(err.message || 'Failed to fetch debug headers');
    } finally {
      setHeadersLoading(false);
    }
  };

  const fetchLocalHeaders = async () => {
    setLocalHeadersLoading(true);
    setLocalHeadersError(null);
    try {
      const res = await fetch('/api-local/headers');
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setLocalHeadersData(data);
    } catch (err: any) {
      setLocalHeadersError(err.message || 'Failed to fetch local headers');
    } finally {
      setLocalHeadersLoading(false);
    }
  };

  const fetchClientSession = async () => {
    setDirectSessionLoading(true);
    setDirectSessionError(null);
    try {
      const res = await authClient.getSession();
      setDirectSessionData(res);
    } catch (err: any) {
      setDirectSessionError(err.message || 'Failed to get client session');
    } finally {
      setDirectSessionLoading(false);
    }
  };

  // Determine redirection diagnosis
  const getRedirectionDiagnosis = () => {
    if (isPending) return { status: 'loading', text: 'Checking session status...', color: 'text-yellow-400' };
    if (!session) {
      return {
        status: 'redirect',
        text: 'You are not logged in. You will be redirected to the portal login screen.',
        color: 'text-red-400',
        reason: 'No session cookie detected on this subdomain, or the session has expired.',
      };
    }
    const role = (session.user as any)?.role;
    if (role !== 'manager') {
      return {
        status: 'redirect',
        text: `Logged in but redirecting. Your role is "${role || 'undefined'}". Only "manager" role is allowed on this dashboard.`,
        color: 'text-red-400',
        reason: 'Role mismatch. The dashboard layout explicitly redirects anyone whose role is not "manager".',
      };
    }
    return {
      status: 'ok',
      text: 'Session valid and role is "manager". You should not be redirected.',
      color: 'text-green-400',
      reason: 'Everything looks correct for dashboard access.',
    };
  };

  const diagnosis = getRedirectionDiagnosis();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-rose-500/30 selection:text-rose-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                Diagnostic Tool
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
              Authentication & Cookie Inspector
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Verify cross-subdomain sessions, cookies, environment variables, and roles.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold transition"
              id="btn-reload"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Page
            </button>
            {session && (
              <button
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 rounded-lg text-xs font-semibold transition"
                id="btn-signout"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Redirection Diagnosis */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-rose-500" />
            Automatic Redirection Status
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-3">
              {diagnosis.status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : diagnosis.status === 'loading' ? (
                <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold text-sm ${diagnosis.color}`}>
                  {diagnosis.text}
                </p>
                {diagnosis.reason && (
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    <span className="font-semibold text-slate-300">Analysis:</span> {diagnosis.reason}
                  </p>
                )}
              </div>
            </div>

            {session && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">User Details</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Name:</span> <span className="text-white font-medium">{session.user.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="text-white font-medium">{session.user.email}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Database Role:</span> <span className="text-rose-400 font-bold">{ (session.user as any).role || 'Not Set' }</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Organization:</span> <span className="text-white font-medium">{ (session.user as any).organizationName || 'None' }</span></div>
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Session Details</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Session ID:</span> <span className="text-slate-300 truncate max-w-[200px] font-mono">{session.session.id}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Expires:</span> <span className="text-slate-300 font-mono">{new Date(session.session.expiresAt).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Created:</span> <span className="text-slate-300 font-mono">{new Date(session.session.createdAt).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid for Cookie and Env inspection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Cookies */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Subdomain Cookie Access
            </h3>
            <p className="text-slate-400 text-xs">
              Cookies shared across subdomains (e.g. via <code>COOKIE_DOMAIN=.mylandlordservices.com</code>) must be visible below.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 min-h-[100px] max-h-[200px] overflow-y-auto font-mono text-[11px] break-all leading-normal text-slate-300">
              {cookieData ? (
                cookieData.split(';').map((c, i) => (
                  <div key={i} className="py-1 border-b border-slate-900/50 last:border-0">
                    {c.trim()}
                  </div>
                ))
              ) : (
                <span className="text-slate-600 italic">No cookies found on this origin.</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
              <span className="font-semibold text-amber-400">Note:</span> If you see <code>better-auth.session_token</code> (or similar) here, the cookie domain sharing is working. If not, the cookie is scoped only to the portal and is missing from this dashboard.
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Client Environment Variables
            </h3>
            <p className="text-slate-400 text-xs">
              These variables must be baked in correctly. Check if they match your domain configurations.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 font-bold font-mono">NEXT_PUBLIC_API_URL</span>
                  <span className="text-slate-200 font-mono select-all">{process.env.NEXT_PUBLIC_API_URL || <span className="text-rose-500 italic">undefined (using localhost:4000)</span>}</span>
                </div>
                <div className="flex flex-col gap-0.5 pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 font-bold font-mono">NEXT_PUBLIC_APP_URL</span>
                  <span className="text-slate-200 font-mono select-all">{process.env.NEXT_PUBLIC_APP_URL || <span className="text-slate-600 italic">undefined</span>}</span>
                </div>
                <div className="flex flex-col gap-0.5 pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 font-bold font-mono">NEXT_PUBLIC_PORTAL_URL</span>
                  <span className="text-slate-200 font-mono select-all">{process.env.NEXT_PUBLIC_PORTAL_URL || <span className="text-slate-600 italic">undefined</span>}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Diagnostic Actions */}
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            API Diagnostics Console
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Test 1: Fetch session from proxy */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <h4 className="text-xs font-semibold text-white">Proxy Request Check</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Fetches session from <code>/api/auth/get-session</code> (Next.js proxy).
              </p>
              <button
                onClick={runDiagnostics}
                disabled={apiLoading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                id="btn-test-proxy"
              >
                {apiLoading ? 'Requesting...' : 'Fetch via Proxy'}
              </button>
            </div>

            {/* Test 2: Fetch session from authClient */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <h4 className="text-xs font-semibold text-white">Client SDK Check</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Requests session using client-side SDK (<code>authClient.getSession()</code>).
              </p>
              <button
                onClick={fetchClientSession}
                disabled={directSessionLoading}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                id="btn-test-sdk"
              >
                {directSessionLoading ? 'Requesting...' : 'Fetch via Client SDK'}
              </button>
            </div>

            {/* Test 3: Fetch debug-headers */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <h4 className="text-xs font-semibold text-white">Headers Checker</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                View all HTTP request headers that actually reach the backend server.
              </p>
              <button
                onClick={fetchDebugHeaders}
                disabled={headersLoading}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                id="btn-test-headers"
              >
                {headersLoading ? 'Requesting...' : 'View Backend Headers'}
              </button>
            </div>

            {/* Test 4: Fetch local headers */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <h4 className="text-xs font-semibold text-white">Local Cookies Check</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                View headers sent directly by the browser to this dashboard origin.
              </p>
              <button
                onClick={fetchLocalHeaders}
                disabled={localHeadersLoading}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                id="btn-test-local-headers"
              >
                {localHeadersLoading ? 'Requesting...' : 'Check Browser Cookies'}
              </button>
            </div>

          </div>

          {/* Log Outputs */}
          {(apiResponse || apiError || directSessionData || directSessionError || headersData || headersError || localHeadersData || localHeadersError) && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Console Outputs</span>
              
              {/* Proxy output */}
              {(apiResponse || apiError) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Proxy Request Output
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[11px] overflow-x-auto max-h-[200px] text-slate-300 select-all">
                    {apiError ? `Error: ${apiError}` : JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}

              {/* SDK output */}
              {(directSessionData || directSessionError) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                    <ArrowRight className="w-3.5 h-3.5" />
                    SDK Client Output
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[11px] overflow-x-auto max-h-[200px] text-slate-300 select-all">
                    {directSessionError ? `Error: ${directSessionError}` : JSON.stringify(directSessionData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Headers output */}
              {(headersData || headersError) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Headers check Output (from Backend)
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[11px] overflow-x-auto max-h-[250px] text-slate-300 select-all">
                    {headersError ? `Error: ${headersError}` : JSON.stringify(headersData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Local Headers output */}
              {(localHeadersData || localHeadersError) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Local Browser Headers Check (Sent to Dashboard Origin)
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[11px] overflow-x-auto max-h-[250px] text-slate-300 select-all">
                    {localHeadersError ? `Error: ${localHeadersError}` : JSON.stringify(localHeadersData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
