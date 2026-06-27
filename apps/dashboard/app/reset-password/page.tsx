'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '@repo/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (!token) {
      setError('Invalid or expired password reset token.');
      return;
    }

    if (!password) {
      setFieldError('Password is required');
      return;
    }

    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authClient.resetPassword({
        newPassword: password,
        token: token,
      }, {
        onSuccess: () => {
          setLoading(false);
          setSuccess(true);
        },
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message || 'Failed to reset password. The link may have expired.');
        }
      });
    } catch (err: any) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            landlord<span>.</span>hu
          </div>
          <div className="auth-subtitle">Invalid Request</div>
        </div>
        <div className="auth-global-error" style={{ marginBottom: '24px' }}>
          This link is invalid or has expired. Please request a new password reset link.
        </div>
        <button
          type="button"
          className="auth-submit-btn"
          onClick={() => router.push(process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal-production-7904.up.railway.app')}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      {loading && (
        <div className="global-loading-overlay">
          <div className="global-loading-spinner" />
          <div className="global-loading-text">Saving...</div>
        </div>
      )}

      <div className="auth-header">
        <div className="auth-logo">
          landlord<span>.</span>hu
        </div>
        <div className="auth-subtitle">Choose your new password</div>
      </div>

      {error && <div className="auth-global-error">{error}</div>}

      {success ? (
        <div>
          <div className="auth-global-success" style={{ marginBottom: '24px' }}>
            Your password has been successfully updated.
          </div>
          <button
            type="button"
            className="auth-submit-btn"
            onClick={() => router.push(process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal-production-7904.up.railway.app')}
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-group">
            <label className="auth-label">New Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className={`auth-input ${fieldError ? 'has-error' : ''}`}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldError) setFieldError('');
                }}
              />
            </div>
            {fieldError && <span className="auth-input-error">{fieldError}</span>}
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Confirm New Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="auth-input"
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">
            Update Password
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="auth-container">
      <div className="auth-bg-glow" />
      <div className="auth-bg-glow-2" />
      <Suspense fallback={
        <div className="global-loading-overlay">
          <div className="global-loading-spinner" />
          <div className="global-loading-text">Loading Page...</div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
