'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@repo/auth';
import { ShieldAlert, RefreshCw, LogIn, Database, Key } from 'lucide-react';

interface DiagnosticStep {
  name: string;
  status: 'pending' | 'success' | 'failed';
  details: string;
}

export function AuthDebugger() {
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    { name: 'Environment Variables', status: 'pending', details: 'Checking NEXT_PUBLIC_API_URL...' },
    { name: 'Document Cookies', status: 'pending', details: 'Reading non-HttpOnly cookies...' },
    { name: 'Better Auth Client Session', status: 'pending', details: 'Querying authClient.getSession()...' },
    { name: 'Direct Fetch (CORS & Session)', status: 'pending', details: 'Testing direct API fetch with credentials...' },
  ]);
  const [rawSession, setRawSession] = useState<any>(null);
  const [cookieData, setCookieData] = useState<string>('');
  const [apiResponseText, setApiResponseText] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const updatedSteps = [...steps];

    // 1. Env Variables
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      updatedSteps[0] = {
        name: 'Environment Variables',
        status: apiUrl ? 'success' : 'failed',
        details: apiUrl 
          ? `NEXT_PUBLIC_API_URL is configured: "${apiUrl}"` 
          : 'NEXT_PUBLIC_API_URL is missing! Requests will fallback to localhost:4000.',
      };
    } catch (err: any) {
      updatedSteps[0] = { name: 'Environment Variables', status: 'failed', details: err.message };
    }
    setSteps([...updatedSteps]);

    // 2. Document Cookies
    try {
      const cookies = typeof document !== 'undefined' ? document.cookie : '';
      setCookieData(cookies || '(No client-accessible cookies found)');
      updatedSteps[1] = {
        name: 'Document Cookies',
        status: 'success',
        details: `Found ${cookies ? cookies.split(';').length : 0} client-readable cookie(s). Note: HttpOnly session tokens will not be visible here for security, but we verified the cookie string exists.`,
      };
    } catch (err: any) {
      updatedSteps[1] = { name: 'Document Cookies', status: 'failed', details: err.message };
    }
    setSteps([...updatedSteps]);

    // 3. Better Auth Client Session
    try {
      const sessionRes = await authClient.getSession();
      setRawSession(sessionRes);
      if (sessionRes?.data?.user) {
        updatedSteps[2] = {
          name: 'Better Auth Client Session',
          status: 'success',
          details: `Logged in as: ${sessionRes.data.user.email} (${(sessionRes.data.user as any).role || 'unknown'})`,
        };
      } else {
        updatedSteps[2] = {
          name: 'Better Auth Client Session',
          status: 'failed',
          details: `No active session returned. Error details: ${JSON.stringify(sessionRes.error || 'None')}`,
        };
      }
    } catch (err: any) {
      updatedSteps[2] = {
        name: 'Better Auth Client Session',
        status: 'failed',
        details: `Exception thrown during session check: ${err.message}`,
      };
    }
    setSteps([...updatedSteps]);

    // 4. Direct Fetch to auth endpoint
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-2a04.up.railway.app';
      const res = await fetch(`${apiUrl}/api/auth/get-session`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      const text = await res.text();
      setApiResponseText(text);

      if (res.ok) {
        const hasSession = text && text !== 'null';
        updatedSteps[3] = {
          name: 'Direct Fetch (CORS & Session)',
          status: hasSession ? 'success' : 'failed',
          details: `HTTP ${res.status} OK. ${hasSession ? 'Session cookie verified and accepted by API.' : 'API connection successful, but API returned null (no session cookie was sent by browser).'}`
        };
      } else {
        updatedSteps[3] = {
          name: 'Direct Fetch (CORS & Session)',
          status: 'failed',
          details: `API returned HTTP ${res.status}. Response: ${text.slice(0, 100)}`
        };
      }
    } catch (err: any) {
      updatedSteps[3] = {
        name: 'Direct Fetch (CORS & Session)',
        status: 'failed',
        details: `CORS Block or Network Failure: Failed to contact the backend API. Check if CORS_ORIGINS is set on Railway to include this origin. Details: ${err.message}`
      };
    }
    setSteps([...updatedSteps]);
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center font-mono text-xs selection:bg-rose-500 selection:text-white">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Authentication Diagnostic Console</h2>
              <p className="text-[10px] text-slate-400">Verifying session persistence and cookie transport</p>
            </div>
          </div>
          <button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 rounded border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
            Diagnostics
          </button>
        </div>

        {/* Diagnostic Steps */}
        <div className="space-y-3">
          <h3 className="text-white font-bold uppercase tracking-wider text-[10px]">Redirection Guard Checklist</h3>
          <div className="grid gap-2">
            {steps.map((step, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{step.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    step.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    step.status === 'failed' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{step.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Session Information */}
        <div className="space-y-2">
          <h3 className="text-white font-bold uppercase tracking-wider text-[10px]">Returned Auth Session Details</h3>
          <pre className="p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-[10px] text-slate-300">
            {JSON.stringify(rawSession, null, 2)}
          </pre>
        </div>

        {/* Direct Fetch Response */}
        <div className="space-y-2">
          <h3 className="text-white font-bold uppercase tracking-wider text-[10px]">Direct Fetch Response Text</h3>
          <pre className="p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-[10px] text-slate-300">
            {apiResponseText || '(No response retrieved yet)'}
          </pre>
        </div>

        {/* Client Cookie Stats */}
        <div className="space-y-2">
          <h3 className="text-white font-bold uppercase tracking-wider text-[10px]">Client Accessible Cookies</h3>
          <pre className="p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-[10px] text-slate-300 break-all whitespace-pre-wrap">
            {cookieData}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
          <button 
            onClick={() => window.location.href = '/login'}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded transition"
          >
            <LogIn size={14} />
            Go to Login Page
          </button>
        </div>

      </div>
    </div>
  );
}
