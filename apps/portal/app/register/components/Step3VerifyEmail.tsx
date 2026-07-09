'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MailCheck, Edit2, RotateCw, Loader2 } from 'lucide-react';

interface Step3Props {
  email: string;
  setEmail: (val: string) => void;
  otp: string[];
  handleOtpChange: (val: string, index: number) => void;
  handleOtpKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  handleOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onBack: () => void;
  onContinue: () => void;
  onResend: (targetEmail?: string) => Promise<void>;
  activeClass: string;
  isLoading?: boolean;
}

export default function Step3VerifyEmail({
  email,
  setEmail,
  otp,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  otpRefs,
  onBack,
  onContinue,
  onResend,
  activeClass,
  isLoading
}: Step3Props) {
  const [resendCooldown, setResendCooldown] = useState(60);
  const [showModal, setShowModal] = useState(false);
  const [modalEmail, setModalEmail] = useState(email);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle countdown for resend rate limiting
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(60);
      await onResend(email);
    } catch (err) {
      // Cooldown reset on error to allow user to retry
      setResendCooldown(0);
    }
  };

  const handleOpenModal = () => {
    setModalEmail(email);
    setModalError('');
    setShowModal(false); // Make sure it's fresh
    setShowModal(true);
  };

  const handleSaveEmail = async () => {
    if (!modalEmail.trim() || !modalEmail.includes('@')) {
      setModalError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    setModalError('');
    try {
      // Trigger new OTP for the new email address first
      await onResend(modalEmail);
      setEmail(modalEmail);
      setShowModal(false);
      // Reset OTP fields
      for (let i = 0; i < otp.length; i++) {
        handleOtpChange('', i);
      }
      // Reset countdown as code is resent to the new email
      setResendCooldown(60);
    } catch (err: any) {
      setModalError(err.message || 'Failed to send OTP to the new email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={activeClass}>
        <div className="step-back-btn">
          <button onClick={onBack}><ArrowLeft size={14} /> Back</button>
        </div>

        <div className="step-icon-box step-icon-box--blue">
          <MailCheck size={32} />
        </div>
        
        <h1>Verify your email</h1>
        <p className="step-subtitle" style={{ marginBottom: '8px' }}>
          We've sent a 6-digit verification code to
        </p>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: '16px' }}>
          {email || 'your email address'}
        </p>

        {/* Action triggers to Edit Email or Resend */}
        <div className="otp-meta-actions">
          <button type="button" className="otp-meta-btn" onClick={handleOpenModal}>
            <Edit2 size={12} style={{ marginRight: '4px', display: 'inline' }} /> Edit Email
          </button>
          <button 
            type="button" 
            className="otp-meta-btn" 
            disabled={resendCooldown > 0} 
            onClick={handleResend}
          >
            <RotateCw size={12} style={{ marginRight: '4px', display: 'inline' }} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>

        <div className="otp-input-container" style={{ marginBottom: '32px' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { otpRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="otp-box"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              onPaste={handleOtpPaste}
            />
          ))}
        </div>

        <div className="step-actions">
          <button onClick={onContinue} disabled={isLoading} className="step-btn-primary">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="spin-animation" style={{ display: 'inline' }} /> Verifying...
              </span>
            ) : (
              'Verify Account'
            )}
          </button>
          <button onClick={onContinue} disabled={isLoading} className="step-btn-ghost">
            I'll do this later
          </button>
        </div>
      </div>

      {/* Edit Email Modal popup */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <h3 className="modal-title">Edit Email Address</h3>
            <p className="modal-desc">
              Update your email address. A new 6-digit verification code will be sent to the updated address.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                className={`styled-input ${modalError ? 'has-error' : ''}`}
                value={modalEmail}
                onChange={(e) => {
                  setModalEmail(e.target.value);
                  if (modalError) setModalError('');
                }}
                placeholder="email@example.com"
              />
              {modalError && (
                <div className="field-hint error" style={{ marginTop: '8px' }}>
                  {modalError}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="step-btn-ghost" 
                style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="step-btn-primary" 
                style={{ padding: '8px 16px', fontSize: 'var(--text-xs)', width: 'auto', boxShadow: 'none' }}
                onClick={handleSaveEmail}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
