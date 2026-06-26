'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Copy, Check, Wand2 } from 'lucide-react';

interface Step2Props {
  password: string;
  setPassword: (val: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (errors: Record<string, string>) => void;
  isLoading: boolean;
  activeClass: string;
}

export default function Step2Password({
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  showPassword,
  setShowPassword,
  onBack,
  onContinue,
  fieldErrors,
  setFieldErrors,
  isLoading,
  activeClass
}: Step2Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = () => {
    if (!password) return;
    setPasswordConfirm(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Clear mismatch error if present
    if (fieldErrors.passwordConfirm) {
      const next = { ...fieldErrors };
      delete next.passwordConfirm;
      setFieldErrors(next);
    }
  };

  const handleGeneratePassword = () => {
    // Generate a secure 12 character password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setPasswordConfirm(generated);
    // Clear errors
    const next = { ...fieldErrors };
    delete next.password;
    delete next.passwordConfirm;
    setFieldErrors(next);
  };

  return (
    <div className={activeClass}>
      <div className="step-back-btn">
        <button onClick={onBack}><ArrowLeft size={14} /> Back</button>
      </div>

      <h1>Secure your account.</h1>
      <p className="step-subtitle">Create a strong password to protect your profile.</p>

      <div className="step-form">
        <div>
          <label className="step-field-label">Create a password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`styled-input ${fieldErrors.password ? 'has-error' : ''}`}
              style={{ paddingRight: '100px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  const next = { ...fieldErrors };
                  delete next.password;
                  setFieldErrors(next);
                }
              }}
            />
            <div className="password-actions">
              <button
                type="button"
                className="password-action-btn"
                title="Generate secure password"
                onClick={handleGeneratePassword}
              >
                <Wand2 size={16} />
              </button>
              <button
                type="button"
                className="password-action-btn"
                title="Toggle visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {fieldErrors.password && (
            <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.password}</div>
          )}
        </div>

        <div>
          <label className="step-field-label">Confirm your password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password-confirm"
              className={`styled-input ${fieldErrors.passwordConfirm ? 'has-error' : ''}`}
              style={{ paddingRight: '64px' }}
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                if (fieldErrors.passwordConfirm) {
                  const next = { ...fieldErrors };
                  delete next.passwordConfirm;
                  setFieldErrors(next);
                }
              }}
            />
            <div className="password-actions">
              <button
                type="button"
                className="password-action-btn"
                title="Copy from first field"
                disabled={!password}
                onClick={handleCopyPassword}
              >
                {copied ? <Check size={16} style={{ color: 'var(--green)' }} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          {fieldErrors.passwordConfirm && (
            <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.passwordConfirm}</div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onContinue} disabled={isLoading} className="step-btn-secondary">
          {isLoading ? (
            <>Creating Account... <Loader2 size={18} className="spin-animation" /></>
          ) : (
            <>Create Account <ArrowRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}
