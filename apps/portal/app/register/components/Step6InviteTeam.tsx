'use client';

import React from 'react';
import { ArrowLeft, Plus, Loader2, Check } from 'lucide-react';

interface Step6Props {
  orgName: string;
  teamEmails: string[];
  setTeamEmails: (emails: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
  isLoading: boolean;
  activeClass: string;
}

export default function Step6InviteTeam({ orgName, teamEmails, setTeamEmails, onBack, onContinue, isLoading, activeClass }: Step6Props) {
  return (
    <div className={activeClass}>
      <div className="step-back-btn">
        <button onClick={onBack}><ArrowLeft size={14} /> Back</button>
      </div>

      <h1>Invite your team.</h1>
      <p className="step-subtitle">
        Add members to <strong style={{ color: 'var(--text-primary)' }}>{orgName || 'your workspace'}</strong>.
      </p>

      <div className="step-form" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teamEmails.map((item, idx) => (
            <div key={idx} className="invite-row">
              <input
                type="email"
                placeholder={`colleague${idx + 1}@example.com`}
                value={item}
                onChange={(e) => {
                  const updated = [...teamEmails];
                  updated[idx] = e.target.value;
                  setTeamEmails(updated);
                }}
              />
              <div className="invite-role-badge">
                {idx === 0 ? 'Admin' : 'Agent'}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setTeamEmails([...teamEmails, ''])} className="invite-add-btn">
          <Plus size={14} /> Add another member
        </button>
      </div>

      <div className="step-actions">
        <button onClick={onContinue} disabled={isLoading} className="step-btn-primary">
          {isLoading ? <Loader2 size={18} className="spin-animation" /> : <>Send Invites & Finish <Check size={18} /></>}
        </button>
        <button onClick={onContinue} disabled={isLoading} className="step-btn-ghost">
          Skip & Go to Dashboard
        </button>
      </div>
    </div>
  );
}
