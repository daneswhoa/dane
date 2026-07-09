'use client';

import React, { useState } from 'react';
import { CheckCircle2, Zap, Wrench, Users, Wallet, Mail } from 'lucide-react';

interface SuccessWizardModalProps {
  type: string;
  amount: number;
  onClose: () => void;
}

export function SuccessWizardModal({ type, amount, onClose }: SuccessWizardModalProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 dark:bg-black/90 animate-fade-in">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full animate-scale-up p-6 text-center space-y-6">
        
        {/* Visual Illustration Header matching terracotta cream circle reference art style */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-coral-500/10 dark:bg-coral-500/20 rounded-full animate-ping pointer-events-none" />
          <div className="w-24 h-24 bg-coral-50 dark:bg-coral-500/10 rounded-full border-2 border-coral-500 flex items-center justify-center shadow-inner relative z-10">
            <CheckCircle2 className="w-12 h-12 text-coral-500" />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-paper-900 dark:text-white tracking-tight">Payment Completed Successfully!</h3>
            <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">
              We have verified your Stripe transaction. Your workspace state has been cryptographically updated in the ledger!
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-lg shadow-md shadow-coral-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              Configure Unlocked Benefits →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-base font-extrabold text-paper-900 dark:text-white tracking-tight text-left">Workspace Privileges Unlocked</h3>
            
            <div className="space-y-3 text-left">
              {type === 'premium' ? (
                <>
                  <div className="p-3 bg-paper-50 dark:bg-ink-950/40 rounded-lg border border-paper-200 dark:border-ink-800 flex items-start gap-3">
                    <Zap className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-paper-900 dark:text-white">Sophia AI Chief Coordinator</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Full unrestricted conversational access and automated Excel report parsers.</div>
                    </div>
                  </div>
                  <div className="p-3 bg-paper-50 dark:bg-ink-950/40 rounded-lg border border-paper-200 dark:border-ink-800 flex items-start gap-3">
                    <Wrench className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-paper-900 dark:text-white">Marketplace Tech Assignments</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Delegate work tickets and authorize hourly rates for professional contractors.</div>
                    </div>
                  </div>
                  <div className="p-3 bg-paper-50 dark:bg-ink-950/40 rounded-lg border border-paper-200 dark:border-ink-800 flex items-start gap-3">
                    <Users className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-paper-900 dark:text-white">Granular Team Invites</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Add team managers, accountants, and coordinators with custom permission sets.</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-paper-50 dark:bg-ink-950/40 rounded-lg border border-paper-200 dark:border-ink-800 flex items-start gap-3">
                    <Wallet className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-paper-900 dark:text-white">Refilled Credit Wallet Balance</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Successfully deposited {amount.toLocaleString()} credits to your organization ledger account.</div>
                    </div>
                  </div>
                  <div className="p-3 bg-paper-50 dark:bg-ink-950/40 rounded-lg border border-paper-200 dark:border-ink-800 flex items-start gap-3">
                    <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-paper-900 dark:text-white">Outbound Communications</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Use credits to run tenant campaigns, Sophia AI chats, and broadcast email notifications.</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Return to Workspace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
