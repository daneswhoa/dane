'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUp, authClient } from '@repo/auth';
import { Sun, Moon, User, Lock, Mail, Shield, Briefcase, Users, Check, Loader2, Circle, AlertCircle } from 'lucide-react';

import Step1NameEmail from './components/Step1NameEmail';
import Step2Password from './components/Step2Password';
import Step3VerifyEmail from './components/Step3VerifyEmail';
import Step4RoleSelection from './components/Step4RoleSelection';
import Step5WorkspaceSetup from './components/Step5WorkspaceSetup';
import Step6InviteTeam from './components/Step6InviteTeam';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Step definitions for the stepper
const BASE_STEPS = [
  { icon: User, label: 'Name' },
  { icon: Lock, label: 'Password' },
  { icon: Mail, label: 'Verify' },
  { icon: Shield, label: 'Role' },
];
const MANAGER_EXTRA_STEPS = [
  { icon: Briefcase, label: 'Workspace' },
  { icon: Users, label: 'Team' },
];

export default function RegisterWizard() {
  return (
    <Suspense fallback={
      <div className="global-loading-overlay">
        <div className="global-loading-spinner" />
        <div className="global-loading-text">Loading Registration Portal...</div>
      </div>
    }>
      <RegisterWizardContent />
    </Suspense>
  );
}

function RegisterWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [isDark, setIsDark] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Inline field errors (per-field)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [prevStep, setPrevStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Processing screen state (between step 2 and 3)
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0); // 0=creating, 1=sending, 2=done

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<'manager' | 'tenant' | 'contractor' | null>(null);

  // Workspace Setup State
  const [workspaceMode, setWorkspaceMode] = useState<'create' | 'join'>('create');
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [invitePreview, setInvitePreview] = useState(false);
  const [invitePreviewData, setInvitePreviewData] = useState<{ orgName: string; inviter: string; role: string } | null>(null);
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);

  // Team Invite State
  const [teamEmails, setTeamEmails] = useState(['', '']);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.getAttribute('data-theme') === 'dark');
  }, []);

  useEffect(() => {
    if (isTransitioning || isProcessing) return;
    if (currentStep === 1) document.getElementById('fullname')?.focus();
    else if (currentStep === 2) document.getElementById('password')?.focus();
    else if (currentStep === 3) otpRefs.current[0]?.focus();
    else if (currentStep === 5) {
      if (workspaceMode === 'create') document.getElementById('orgname')?.focus();
      else document.getElementById('invite-input')?.focus();
    }
  }, [currentStep, workspaceMode, isTransitioning, isProcessing]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) { root.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light'); setIsDark(false); }
    else { root.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); setIsDark(true); }
  };

  const navigateStep = (toStep: number) => {
    if (toStep === currentStep || isTransitioning) return;
    setErrorMessage('');
    setFieldErrors({});
    const direction = toStep > currentStep ? 'forward' : 'backward';
    setSlideDirection(direction);
    setPrevStep(currentStep);
    setIsTransitioning(true);
    setTimeout(() => { setCurrentStep(toStep); setIsTransitioning(false); setSlideDirection(null); }, 600);
  };

  // OTP Handlers
  const handleOtpChange = (val: string, index: number) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal) return;
    const newOtp = [...otp]; newOtp[index] = cleanVal.slice(-1); setOtp(newOtp);
    if (index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') { const newOtp = [...otp]; if (otp[index] !== '') { newOtp[index] = ''; setOtp(newOtp); } else if (index > 0) { newOtp[index - 1] = ''; setOtp(newOtp); otpRefs.current[index - 1]?.focus(); } }
    else if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return; const newOtp = [...otp]; for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i]; setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Step 1: Validate name + email
  const handleContinueFromStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullname = 'We need your name to set up your profile.';
    if (!email.trim() || !email.includes('@')) errors.email = 'A valid email is required to continue.';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    navigateStep(2);
  };

  // Step 2: Register account → show processing screen → go to step 3
  const handleContinueFromStep2 = async () => {
    const errors: Record<string, string> = {};
    if (password.length < 8) errors.password = 'Use at least 8 characters for a strong password.';
    if (password !== passwordConfirm) errors.passwordConfirm = 'These passwords don\'t match.';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});

    // Show processing screen
    setIsProcessing(true);
    setProcessingStage(0);

    try {
      // 1. Check if email already exists
      const checkRes = await fetch(`${API_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      if (checkRes.ok) {
        const { exists } = await checkRes.json();
        if (exists) {
          setIsProcessing(false);
          setErrorModal({
            show: true,
            title: "We couldn't create your account",
            message: "This email address is already in use. If this belongs to you, please sign in instead or contact us at help@mylandlordservices.com."
          });
          return;
        }
      }
    } catch (err: any) {
      // Proceed with registration which will handle its own error reporting
    }

    try {
      // Stage 1: Creating account
      await signUp.email({
        email,
        password,
        name: fullName,
        callbackURL: window.location.origin
      }, {
        onSuccess: () => {
          // Stage 1 complete → Stage 2: Sending verification
          setProcessingStage(1);
          setTimeout(() => {
            // Stage 2 complete → done
            setProcessingStage(2);
            setTimeout(() => {
              setIsProcessing(false);
              navigateStep(3);
            }, 800);
          }, 1500);
        },
        onError: (ctx) => {
          setIsProcessing(false);
          setErrorModal({
            show: true,
            title: "We couldn't create your account",
            message: `${ctx.error.message || 'An unexpected authentication error occurred'}. If this info isn't helpful, please contact us at help@mylandlordservices.com.`
          });
        }
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorModal({
        show: true,
        title: "We couldn't create your account",
        message: `${err.message || 'A network error occurred while connecting to the authentication server'}. If this info isn't helpful, please contact us at help@mylandlordservices.com.`
      });
    }
  };

  const handleResendOtp = async (targetEmail: string = email) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: targetEmail,
        type: 'email-verification'
      });
      if (error) throw new Error(error.message || 'Failed to send verification code.');
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorModal({
        show: true,
        title: "Could not send code",
        message: `${err.message || 'We failed to deliver the 6-digit OTP code to your inbox'}. Please try again or contact us at help@mylandlordservices.com.`
      });
      throw err;
    }
  };

  const handleContinueFromStep3 = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpString
      });

      if (error) {
        throw new Error(error.message || 'The verification code entered is invalid or has expired.');
      }

      setIsLoading(false);
      navigateStep(4);
    } catch (err: any) {
      setIsLoading(false);
      setErrorModal({
        show: true,
        title: "Verification failed",
        message: `${err.message || 'We could not verify your email address'}. If this info isn't helpful, please contact us at help@mylandlordservices.com.`
      });
    }
  };

  const handleContinueFromStep4 = async () => {
    if (!selectedRole) return;
    setIsLoading(true); setErrorMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/update-onboarding`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: selectedRole })
      });
      if (!res.ok) throw new Error('Failed to save your role selection.');
      setIsLoading(false);
      if (selectedRole === 'manager') navigateStep(5);
      else triggerFinalRedirection(selectedRole);
    } catch (err: any) { setIsLoading(false); setErrorMessage(err.message); }
  };

  const handleCheckInvite = () => {
    if (inviteCode.length < 4) return;
    setIsValidatingInvite(true);
    setTimeout(() => {
      setIsValidatingInvite(false);
      setInvitePreview(true);
      setInvitePreviewData({
        orgName: 'Grandview Properties',
        inviter: 'Jane Doe',
        role: 'manager'
      });
    }, 800);
  };

  const handleContinueFromStep5 = async () => {
    if (workspaceMode === 'create' && !orgName.trim()) { setFieldErrors({ orgname: 'Give your workspace a name to continue.' }); return; }
    setFieldErrors({}); setIsLoading(true); setErrorMessage('');
    try {
      const actualOrg = workspaceMode === 'create' ? orgName : 'Grandview Properties';
      const res = await fetch(`${API_URL}/api/auth/update-onboarding`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'manager', organizationName: actualOrg })
      });
      if (!res.ok) throw new Error('Failed to save workspace setup.');
      setIsLoading(false);
      if (workspaceMode === 'create') navigateStep(6);
      else triggerFinalRedirection('manager');
    } catch (err: any) { setIsLoading(false); setErrorMessage(err.message); }
  };

  const handleFinishSignup = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); triggerFinalRedirection('manager'); }, 1500);
  };

  const triggerFinalRedirection = (role: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (role === 'manager') router.push(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    else if (role === 'tenant') router.push('/tenant');
    else if (role === 'contractor') router.push('/contractor');
  };

  // Stepper logic
  const allSteps = selectedRole === 'manager' ? [...BASE_STEPS, ...MANAGER_EXTRA_STEPS] : BASE_STEPS;
  const displayStep = isProcessing ? 2 : currentStep; // During processing, keep stepper at step 2

  const getStepClass = (stepNum: number) => {
    if (currentStep === stepNum && !isTransitioning) return 'step active';
    if (prevStep === stepNum && isTransitioning) return `step exiting-${slideDirection}`;
    if (currentStep === stepNum && isTransitioning) return `step entering-${slideDirection}`;
    return 'step';
  };

  return (
    <div className="register-page">
      {/* Split Screen: Left Side Illustration */}
      <div className="register-sidebar">
        <div 
          className="register-sidebar-illustration" 
          style={{ backgroundImage: `url('/illustration.png')` }}
        />
        <div className="register-sidebar-content">
          <h2 className="register-sidebar-title">The smart way to manage your portfolio.</h2>
          <p className="register-sidebar-subtitle">
            Experience smooth tenant transitions, real-time maintenance coordination, and transparent financial records with landlord.hu.
          </p>
        </div>
      </div>

      {/* Split Screen: Right Side Form Area */}
      <div className="register-form-area">
        <div className="aurora-bg">
          <div className="aurora-blob-1"></div>
          <div className="aurora-blob-2"></div>
        </div>

        {/* Header */}
        <header className="register-header">
          <div className="register-logo" onClick={() => router.push('/login')} style={{ cursor: 'pointer' }}>
            <div className="register-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logomark.png" alt="landlord.hu" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
            </div>
            <span>landlord.hu</span>
          </div>
          <div className="register-header-actions">
            <div className="register-signin-prompt">
              <span>Already a member?</span>
              <button onClick={() => router.push('/login')}>Sign In</button>
            </div>
            <button onClick={toggleTheme} className="login-theme-toggle" style={{ position: 'relative', top: 'unset', right: 'unset' }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="register-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Horizontal Icon Stepper */}
          <div className="register-stepper">
            {allSteps.map((step, idx) => {
              const stepNum = idx + 1;
              const IconComponent = step.icon;
              let status: 'completed' | 'active' | 'upcoming';
              if (stepNum < displayStep) status = 'completed';
              else if (stepNum === displayStep) status = 'active';
              else status = 'upcoming';

              return (
                <React.Fragment key={idx}>
                  <div className="register-stepper-step">
                    <div className={`register-stepper-icon ${status}`}>
                      {status === 'completed' ? <Check size={16} /> : <IconComponent size={16} />}
                    </div>
                  </div>
                  {idx < allSteps.length - 1 && (
                    <div className={`register-stepper-line ${stepNum < displayStep ? 'filled' : 'empty'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="auth-global-error" style={{ width: '100%', maxWidth: '380px', margin: '0 auto 24px', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}

          {/* Processing Screen (between step 2→3) */}
          {isProcessing ? (
            <div className="processing-screen">
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '32px', textAlign: 'center', letterSpacing: '-0.02em' }}>
                Setting up your account...
              </h1>

              <div className="processing-steps">
                {/* Step 1: Creating account */}
                <div className="processing-step">
                  <div className="processing-step-indicator">
                    <div className={`processing-step-dot ${processingStage >= 1 ? 'done' : 'running'}`}>
                      {processingStage >= 1 ? <Check size={16} /> : <Loader2 size={16} className="spin-animation" />}
                    </div>
                    <div className={`processing-step-line ${processingStage >= 1 ? 'filled' : 'empty'}`} />
                  </div>
                  <div className="processing-step-content">
                    <div className="processing-step-title">Creating your account</div>
                    <div className="processing-step-subtitle">
                      {processingStage >= 1 ? 'Done' : 'Saving your credentials securely...'}
                    </div>
                  </div>
                </div>

                {/* Step 2: Sending verification */}
                <div className="processing-step">
                  <div className="processing-step-indicator">
                    <div className={`processing-step-dot ${processingStage >= 2 ? 'done' : processingStage === 1 ? 'running' : 'waiting'}`}>
                      {processingStage >= 2 ? <Check size={16} /> : processingStage === 1 ? <Loader2 size={16} className="spin-animation" /> : <Circle size={12} />}
                    </div>
                  </div>
                  <div className="processing-step-content">
                    <div className={`processing-step-title ${processingStage < 1 ? 'muted' : ''}`}>
                      Sending verification code
                    </div>
                    <div className="processing-step-subtitle">
                      {processingStage >= 2 ? 'Sent!' : processingStage === 1 ? `Delivering to ${email}...` : `Will be sent to ${email}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Normal Step Container */
            <div className="step-container">
              <Step1NameEmail
                fullName={fullName} setFullName={setFullName}
                email={email} setEmail={setEmail}
                onContinue={handleContinueFromStep1}
                fieldErrors={fieldErrors} setFieldErrors={setFieldErrors}
                activeClass={getStepClass(1)}
              />
              <Step2Password
                password={password} setPassword={setPassword}
                passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
                showPassword={showPassword} setShowPassword={setShowPassword}
                onBack={() => navigateStep(1)} onContinue={handleContinueFromStep2}
                fieldErrors={fieldErrors} setFieldErrors={setFieldErrors}
                isLoading={isLoading} activeClass={getStepClass(2)}
              />
              <Step3VerifyEmail
                email={email} setEmail={setEmail} otp={otp}
                handleOtpChange={handleOtpChange} handleOtpKeyDown={handleOtpKeyDown}
                handleOtpPaste={handleOtpPaste} otpRefs={otpRefs}
                onBack={() => navigateStep(2)} onContinue={handleContinueFromStep3}
                onResend={handleResendOtp}
                activeClass={getStepClass(3)}
              />
              <Step4RoleSelection
                selectedRole={selectedRole} setSelectedRole={setSelectedRole}
                onBack={() => navigateStep(3)} onContinue={handleContinueFromStep4}
                isLoading={isLoading} activeClass={getStepClass(4)}
              />
              <Step5WorkspaceSetup
                workspaceMode={workspaceMode} setWorkspaceMode={setWorkspaceMode}
                orgName={orgName} setOrgName={setOrgName}
                orgSlug={orgSlug} setOrgSlug={setOrgSlug}
                uploadedLogoUrl={uploadedLogoUrl} setUploadedLogoUrl={setUploadedLogoUrl}
                inviteCode={inviteCode} setInviteCode={setInviteCode}
                invitePreview={invitePreview} invitePreviewData={invitePreviewData}
                handleCheckInvite={handleCheckInvite} isValidatingInvite={isValidatingInvite}
                onBack={() => navigateStep(4)} onContinue={handleContinueFromStep5}
                fieldErrors={fieldErrors} setFieldErrors={setFieldErrors}
                isLoading={isLoading} activeClass={getStepClass(5)}
              />
              <Step6InviteTeam
                orgName={orgName} teamEmails={teamEmails} setTeamEmails={setTeamEmails}
                onBack={() => navigateStep(5)} onContinue={handleFinishSignup}
                isLoading={isLoading} activeClass={getStepClass(6)}
              />
            </div>
          )}
        </main>
      </div>

      {errorModal.show && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'rgb(239, 68, 68)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle size={20} />
              </div>
              <h3 className="modal-title" style={{ margin: 0 }}>{errorModal.title}</h3>
            </div>
            
            <p className="modal-desc" style={{ marginBottom: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {errorModal.message}
            </p>
            
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button 
                type="button" 
                className="step-btn-primary" 
                style={{
                  padding: '8px 16px',
                  fontSize: 'var(--text-xs)',
                  width: 'auto',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-panel)',
                  boxShadow: 'none'
                }}
                onClick={() => setErrorModal({ show: false, title: '', message: '' })}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
