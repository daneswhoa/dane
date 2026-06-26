'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Info, Loader2, Building, AlertCircle, Upload, X } from 'lucide-react';

interface Step5Props {
  workspaceMode: 'create' | 'join';
  setWorkspaceMode: (val: 'create' | 'join') => void;
  orgName: string;
  setOrgName: (val: string) => void;
  orgSlug: string;
  setOrgSlug: (val: string) => void;
  uploadedLogoUrl: string;
  setUploadedLogoUrl: (val: string) => void;
  inviteCode: string;
  setInviteCode: (val: string) => void;
  invitePreview: boolean;
  invitePreviewData: { orgName: string; inviter: string; role: string } | null;
  handleCheckInvite: () => void;
  isValidatingInvite: boolean;
  onBack: () => void;
  onContinue: () => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (errors: Record<string, string>) => void;
  isLoading: boolean;
  activeClass: string;
}

export default function Step5WorkspaceSetup({
  workspaceMode,
  setWorkspaceMode,
  orgName,
  setOrgName,
  orgSlug,
  setOrgSlug,
  uploadedLogoUrl,
  setUploadedLogoUrl,
  inviteCode,
  setInviteCode,
  invitePreview,
  invitePreviewData,
  handleCheckInvite,
  isValidatingInvite,
  onBack,
  onContinue,
  fieldErrors,
  setFieldErrors,
  isLoading,
  activeClass
}: Step5Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [logoError, setLogoError] = React.useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload a valid image file.');
      return;
    }

    try {
      setLogoError('');
      setUploadProgress(10);
      
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `org-logos/${Date.now()}-${file.name}`, contentType: file.type }),
      });
      
      if (!signRes.ok) {
        const data = await signRes.json();
        throw new Error(data.error || 'Failed to generate upload URL');
      }
      
      const { uploadUrl, publicUrl } = await signRes.json();
      setUploadProgress(40);
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed.');
      
      setUploadProgress(100);
      setUploadedLogoUrl(publicUrl);
      
      setTimeout(() => setUploadProgress(null), 1000);
    } catch (err: any) {
      setLogoError(err.message || 'Logo upload failed.');
      setUploadProgress(null);
    }
  };

  return (
    <div className={activeClass}>
      <div className="step-back-btn">
        <button onClick={onBack}><ArrowLeft size={14} /> Back</button>
      </div>

      <h1>Setup your Workspace.</h1>

      {/* Toggle Pill */}
      <div className="workspace-toggle" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
        <button 
          className={workspaceMode === 'create' ? 'active' : ''} 
          onClick={() => {
            setWorkspaceMode('create');
            setFieldErrors({});
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            background: workspaceMode === 'create' ? 'var(--coral)' : 'var(--bg-raised)',
            color: workspaceMode === 'create' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          Create New
        </button>
        <button 
          className={workspaceMode === 'join' ? 'active' : ''} 
          onClick={() => {
            setWorkspaceMode('join');
            setFieldErrors({});
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            background: workspaceMode === 'join' ? 'var(--coral)' : 'var(--bg-raised)',
            color: workspaceMode === 'join' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          Join with Code
        </button>
      </div>

      <div className="step-form" style={{ minHeight: '160px' }}>
        {workspaceMode === 'create' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Logo Upload (Optional) */}
            <div>
              <label className="step-field-label">Organization Logo (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  border: '1px dashed var(--border-strong)',
                  background: 'var(--bg-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {uploadedLogoUrl ? (
                    <>
                      <img src={uploadedLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setUploadedLogoUrl('')}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : uploadProgress !== null ? (
                    <Loader2 size={20} className="spin-animation" style={{ color: 'var(--coral)' }} />
                  ) : (
                    <Building size={24} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                    style={{
                      padding: '8px 16px',
                      fontSize: 'var(--text-xs)',
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 600
                    }}
                  >
                    <Upload size={14} style={{ marginRight: '6px' }} />
                    {uploadProgress !== null ? 'Uploading...' : 'Upload Image'}
                  </button>
                  {logoError && (
                    <div className="field-hint error"><AlertCircle size={12} /> {logoError}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Org Name */}
            <div>
              <label className="step-field-label">Organization Name</label>
              <input
                type="text"
                id="orgname"
                className={`styled-input ${fieldErrors.orgname ? 'has-error' : ''}`}
                placeholder="e.g., Grandview Properties"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  const derivedSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                  setOrgSlug(derivedSlug);
                  if (fieldErrors.orgname) {
                    const next = { ...fieldErrors };
                    delete next.orgname;
                    setFieldErrors(next);
                  }
                }}
              />
              {fieldErrors.orgname && (
                <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.orgname}</div>
              )}
            </div>

            {/* Org Slug */}
            <div>
              <label className="step-field-label">Organization Username (Slug)</label>
              <input
                type="text"
                id="orgslug"
                className={`styled-input ${fieldErrors.orgslug ? 'has-error' : ''}`}
                placeholder="e.g., grandview-properties"
                value={orgSlug}
                onChange={(e) => {
                  setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  if (fieldErrors.orgslug) {
                    const next = { ...fieldErrors };
                    delete next.orgslug;
                    setFieldErrors(next);
                  }
                }}
              />
              {fieldErrors.orgslug && (
                <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.orgslug}</div>
              )}
              <p className="step-info-note" style={{ fontSize: '11px', marginTop: '4px' }}>
                This is the unique handle for your organization workspace.
              </p>
            </div>

            <p className="step-info-note">
              <Info size={14} style={{ flexShrink: 0 }} /> You'll be assigned as the primary Owner/Admin for this workspace.
            </p>
          </div>
        ) : (
          <div>
            <label className="step-field-label">Enter Invite Code</label>
            <div className="invite-code-row">
              <input
                type="text"
                id="invite-input"
                className={`styled-input ${fieldErrors.invitecode ? 'has-error' : ''}`}
                style={{ fontFamily: 'var(--font-mono)', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                placeholder="Paste invite code..."
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  if (fieldErrors.invitecode) {
                    const next = { ...fieldErrors };
                    delete next.invitecode;
                    setFieldErrors(next);
                  }
                }}
              />
              <button 
                onClick={handleCheckInvite} 
                disabled={isValidatingInvite || inviteCode.length < 4} 
                className="invite-code-check"
                style={{ cursor: 'pointer' }}
              >
                {isValidatingInvite ? <Loader2 size={16} className="spin-animation" /> : 'Check'}
              </button>
            </div>
            {fieldErrors.invitecode && (
              <div className="field-hint error"><AlertCircle size={12} /> {fieldErrors.invitecode}</div>
            )}

            {invitePreview && invitePreviewData && (
              <div className="invite-preview-card" style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-panel)', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '12px' }}>
                <div className="invite-preview-icon" style={{ color: 'var(--coral)', background: 'var(--coral-muted)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center' }}>
                  <Building size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm)' }}>{invitePreviewData.orgName}</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Invited by {invitePreviewData.inviter} as {invitePreviewData.role}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-actions" style={{ marginTop: '24px' }}>
        <button onClick={onContinue} disabled={isLoading} className="step-btn-primary">
          {isLoading ? (<>Processing... <Loader2 size={18} className="spin-animation" /></>) : (<>Continue <ArrowRight size={18} /></>)}
        </button>
      </div>
    </div>
  );
}
