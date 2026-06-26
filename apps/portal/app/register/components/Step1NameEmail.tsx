'use client';

import React, { useMemo } from 'react';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface Step1Props {
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  onContinue: () => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (errors: Record<string, string>) => void;
  activeClass: string;
}

const POPULAR_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

export default function Step1NameEmail({
  fullName,
  setFullName,
  email,
  setEmail,
  onContinue,
  fieldErrors,
  setFieldErrors,
  activeClass
}: Step1Props) {
  // Compute suggestions based on input email prefix
  const emailSuggestions = useMemo(() => {
    if (!email || email.includes('@') && email.split('@')[1]?.includes('.')) {
      return [];
    }
    const prefix = email.split('@')[0];
    if (!prefix) return [];
    return POPULAR_DOMAINS.map(domain => `${prefix}@${domain}`);
  }, [email]);

  return (
    <div className={activeClass}>
      <h1>Let's get started.</h1>
      <p className="step-subtitle">We'll use this to set up your personal profile.</p>

      <div className="step-form">
        <div>
          <label className="step-field-label">What is your full name?</label>
          <input
            type="text"
            id="fullname"
            className={`styled-input ${fieldErrors.fullname ? 'has-error' : ''}`}
            placeholder="e.g., Jane Doe"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullname) {
                const next = { ...fieldErrors };
                delete next.fullname;
                setFieldErrors(next);
              }
            }}
          />
          {fieldErrors.fullname && (
            <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.fullname}</div>
          )}
        </div>
        <div>
          <label className="step-field-label">And your best email address?</label>
          <input
            type="email"
            id="email"
            className={`styled-input ${fieldErrors.email ? 'has-error' : ''}`}
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                const next = { ...fieldErrors };
                delete next.email;
                setFieldErrors(next);
              }
            }}
          />
          {emailSuggestions.length > 0 && (
            <div className="email-suggestions">
              {emailSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="email-suggestion-chip"
                  onClick={() => {
                    setEmail(suggestion);
                    if (fieldErrors.email) {
                      const next = { ...fieldErrors };
                      delete next.email;
                      setFieldErrors(next);
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {fieldErrors.email && (
            <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.email}</div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onContinue} className="step-btn-primary">
          Continue <ArrowRight size={18} />
        </button>
        <div className="step-security-note">
          <ShieldCheck size={14} />
          <span>Your data is securely encrypted.</span>
        </div>
      </div>
    </div>
  );
}
