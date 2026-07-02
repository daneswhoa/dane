'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession, authClient } from '@repo/auth';
import {
  Building2,
  Sun,
  Moon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  MailQuestion,
  LifeBuoy,
  Loader2
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl');

  const { data: session } = useSession();
  const [showAlreadyLoggedInModal, setShowAlreadyLoggedInModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setShowAlreadyLoggedInModal(true);
    }
  }, [session]);

  const getRoleLabel = (role: string) => {
    if (role === 'contractor') return 'Contractor';
    if (role === 'tenant') return 'Tenant';
    return 'Manager';
  };

  const handleGoToDashboard = (role: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (role === 'contractor') {
      router.push('/contractor');
    } else if (role === 'tenant') {
      router.push('/tenant');
    } else {
      router.push(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    }
  };

  const handleSwitchRole = async (newRole: string) => {
    if (!session?.user?.email) return;
    setSwitchingRole(newRole);
    setErrorMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/update-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error('Role update failed on backend.');

      await authClient.getSession();
      setShowOptionsModal(false);
      handleGoToDashboard(newRole);
    } catch (err: any) {
      setErrorMessage(err.message || 'We could not switch your profile role. Please try again.');
      setSwitchingRole(null);
      setShowOptionsModal(false);
    }
  };

  const handleLogoutAndStay = async () => {
    try {
      await signOut();
      setShowAlreadyLoggedInModal(false);
      setShowOptionsModal(false);
    } catch (err) {
      // Swallowed
    }
  };

  // Theme state
  const [isDark, setIsDark] = useState(true);

  // View state
  const [view, setView] = useState<'login' | 'help' | 'forgot-password' | 'forgot-email'>('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.getAttribute('data-theme') === 'dark');
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);

    try {
      await signIn.email({
        email,
        password,
        rememberMe: rememberMe
      }, {
        onSuccess: (ctx: any) => {
          setIsLoading(false);
          handleGoToDashboard(ctx.data?.user?.role || 'tenant');
        },
        onError: (ctx: any) => {
          setIsLoading(false);
          setErrorMessage(ctx.error.message || 'Incorrect email or password. Please try again.');
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      }, {
        onSuccess: () => {
          setIsLoading(false);
          setSuccessMessage('A password reset link has been sent to your email address.');
          setEmail('');
        },
        onError: (ctx: any) => {
          setIsLoading(false);
          setErrorMessage(ctx.error.message || 'Failed to request password reset.');
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <>
      {/* Theme Toggle */}
      <button onClick={toggleTheme} type="button" className="login-theme-toggle">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Form Container */}
      <div className="login-form-wrapper">
        <div className="login-form-inner">
          
          {/* Mobile Logo */}
          <div className="login-mobile-logo">
            <div className="login-mobile-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logomark.png" alt="landlord.hu" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
            </div>
            <span>landlord.hu</span>
          </div>

          {/* Global Alert Banners */}
          {errorMessage && (
            <div className="auth-global-error" style={{ marginBottom: '24px' }}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="auth-global-success" style={{ marginBottom: '24px' }}>
              {successMessage}
            </div>
          )}

          {/* ─── LOGIN VIEW ─── */}
          {view === 'login' && (
            <div className="login-animate-in">
              <h2 className="login-heading">Welcome back</h2>
              <p className="login-subheading">Enter your details to access your dashboard.</p>

              <form onSubmit={handleSignIn}>
                {/* Email */}
                <div className="login-field">
                  <label className="login-field-label">Email address</label>
                  <div className="login-input-wrap">
                    <div className="login-input-icon">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="login-input"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="login-field">
                  <label className="login-field-label">Password</label>
                  <div className="login-input-wrap">
                    <div className="login-input-icon">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-input login-input--password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-eye-toggle">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Options Row */}
                <div className="login-options-row">
                  <label className="login-checkbox-label">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="login-checkbox"
                      />
                      <Check size={12} className="login-checkbox-check" />
                    </div>
                    <span className="login-checkbox-text">Remember me</span>
                  </label>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="login-submit-btn">
                  {isLoading ? (
                    <>Signing in... <Loader2 size={16} className="spin-animation" /></>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="login-divider">
                <div className="login-divider-line" />
                <span className="login-divider-text">OR</span>
                <div className="login-divider-line" />
              </div>

              {/* Actions */}
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setView('help')} className="login-link" style={{ display: 'block', margin: '0 auto 16px' }}>
                  Can't sign in?
                </button>
                <span className="login-text-muted">
                  New to landlord.hu?{' '}
                  <button onClick={() => router.push('/register')} className="login-link">
                    Create an account
                  </button>
                </span>
              </div>
            </div>
          )}

          {/* ─── HELP VIEW ─── */}
          {view === 'help' && (
            <div className="login-animate-in">
              <button onClick={() => setView('login')} className="login-back-btn">
                <ArrowLeft size={14} /> Back to sign in
              </button>

              <h2 className="login-heading">Trouble signing in?</h2>
              <p className="login-subheading">Don't worry, it happens. Select what you need help with below.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Forgot Password */}
                <button onClick={() => setView('forgot-password')} className="login-help-card">
                  <div className="login-help-icon">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="login-help-title">I forgot my password</h3>
                    <p className="login-help-desc">We'll send a reset link to your registered email address.</p>
                  </div>
                </button>

                {/* Forgot Email */}
                <button onClick={() => setView('forgot-email')} className="login-help-card login-help-card--blue">
                  <div className="login-help-icon">
                    <MailQuestion size={20} />
                  </div>
                  <div>
                    <h3 className="login-help-title">I forgot my email</h3>
                    <p className="login-help-desc">Recover your account using your profile settings or verification contacts.</p>
                  </div>
                </button>
              </div>

              <div className="login-support-box">
                <LifeBuoy size={20} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                <p>
                  Still stuck? Contact our <a href="#">support team</a> and we'll help get you back into your portfolio.
                </p>
              </div>
            </div>
          )}

          {/* ─── FORGOT PASSWORD FORM ─── */}
          {view === 'forgot-password' && (
            <div className="login-animate-in">
              <button onClick={() => setView('help')} className="login-back-btn">
                <ArrowLeft size={14} /> Back to recovery options
              </button>

              <h2 className="login-heading">Reset your password</h2>
              <p className="login-subheading">Enter your registered email address to receive a secure reset link.</p>

              <form onSubmit={handleForgotPassword}>
                <div className="login-field">
                  <label className="login-field-label">Email address</label>
                  <div className="login-input-wrap">
                    <div className="login-input-icon">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="login-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="login-submit-btn">
                  {isLoading ? (
                    <>Requesting... <Loader2 size={16} className="spin-animation" /></>
                  ) : (
                    <>Send reset link <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ─── FORGOT EMAIL INFO ─── */}
          {view === 'forgot-email' && (
            <div className="login-animate-in">
              <button onClick={() => setView('help')} className="login-back-btn">
                <ArrowLeft size={14} /> Back to recovery options
              </button>

              <h2 className="login-heading">Forgot email address</h2>
              <p className="login-subheading">If you don't recall which email you used, we can help look it up with your organization details.</p>

              <div className="login-support-box" style={{ marginTop: 0 }}>
                <p>
                  Please reach out directly to your account administrator or contact <a href="#">landlord.hu Support</a> with verification of identity to recover access.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} landlord.hu. All rights reserved.</p>
        </div>
      </div>

      {showAlreadyLoggedInModal && session?.user && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '420px' }}>
            <h3 className="modal-title">Already Signed In</h3>
            <p className="modal-desc" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: '1.6', marginBottom: '24px' }}>
              You are currently signed in as <strong style={{ color: 'var(--text-primary)' }}>{session.user.name}</strong> ({session.user.email}).
            </p>
            <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="step-btn-primary"
                style={{ width: '100%', margin: 0, padding: '12px', fontSize: 'var(--text-xs)' }}
                onClick={() => {
                  setShowAlreadyLoggedInModal(false);
                  setShowOptionsModal(true);
                }}
              >
                See your options
              </button>
            </div>
          </div>
        </div>
      )}

      {showOptionsModal && session?.user && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Choose your path</h3>
            </div>
            
            <p className="modal-desc" style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.5', marginBottom: '20px' }}>
              Manage your active session or switch to another view.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Option 1: Go to Current Dashboard */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Proceed to active view
                </span>
                <button
                  type="button"
                  className="step-btn-primary"
                  style={{ width: '100%', margin: 0, padding: '10px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => handleGoToDashboard((session.user as any).role || 'tenant')}
                >
                  Proceed to {getRoleLabel((session.user as any).role || 'tenant')} Dashboard
                </button>
              </div>

              {/* Option 2: Switch Roles */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Switch profiles
                </span>
                
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '10px' }}>
                  Your data in the previous dashboard is safe and will be restored next time you switch back.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['tenant', 'contractor', 'manager']
                    .filter(role => role !== ((session.user as any).role || 'tenant'))
                    .map(role => (
                      <button
                        key={role}
                        type="button"
                        className="step-btn-ghost"
                        disabled={switchingRole !== null}
                        style={{ 
                          width: '100%', 
                          margin: 0, 
                          padding: '10px', 
                          fontSize: '11px', 
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onClick={() => handleSwitchRole(role)}
                      >
                        {switchingRole === role ? 'Switching...' : `Switch role to ${getRoleLabel(role)}`}
                      </button>
                    ))}
                </div>
              </div>

              {/* Option 3: Logout */}
              <div>
                <span style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Account
                </span>
                <button
                  type="button"
                  className="step-btn-ghost"
                  style={{ width: '100%', margin: 0, padding: '10px', fontSize: '11px', border: '1px solid var(--border-color)', color: '#ef4444' }}
                  onClick={handleLogoutAndStay}
                >
                  Logout and login/signup with a new account
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="login-page">
      {/* Left Side: Visuals */}
      <div className="login-sidebar">
        <div className="login-sidebar-bg" />
        <div className="login-sidebar-gradient" />
        <div className="login-sidebar-blob login-sidebar-blob--coral" />
        <div className="login-sidebar-blob login-sidebar-blob--green" />
        <div className="login-sidebar-blob login-sidebar-blob--blue" />

        <div className="login-sidebar-content">
          <div className="login-sidebar-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logomark.png" alt="landlord.hu" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          </div>
          <h1 className="login-sidebar-title">
            Manage properties with <span>Sophia, your AI property assistant.</span>
          </h1>
          <p className="login-sidebar-description">
            Welcome to the new standard of real estate management. Streamline operations, automate maintenance workflows, and support your residents 24/7.
          </p>

          {/* Floating Stats Card */}
          <div className="login-stats-card">
            <div className="login-stats-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" />
              <div className="login-avatar-more">+2k</div>
            </div>
            <div className="login-stats-text">
              <strong>Trusted by landlords</strong>
              <small>Across 14 countries</small>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="login-form-area">
        <Suspense fallback={
          <div className="global-loading-overlay">
            <div className="global-loading-spinner" />
            <div className="global-loading-text">Loading Portal...</div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
