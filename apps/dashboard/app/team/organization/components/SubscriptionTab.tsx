'use client';

import React, { useState } from 'react';
import { Shield, Zap, Loader2, Check, Crown, Calendar, CreditCard, ArrowRight, Star } from 'lucide-react';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { SuccessWizardModal } from './SuccessWizardModal';

interface SubscriptionTabProps {
  billingData: any;
  billingLoading: boolean;
  handleCancelPremium: () => void;
  billingMessage: string | null;
  setBillingMessage: (val: string | null) => void;
  onRefresh: () => void;
}

export function SubscriptionTab({
  billingData,
  billingLoading,
  handleCancelPremium,
  billingMessage,
  setBillingMessage,
  onRefresh
}: SubscriptionTabProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessWizard, setShowSuccessWizard] = useState(false);

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setShowSuccessWizard(true);
    onRefresh();
  };

  const isPremium = billingData.subscription?.tier === 'premium';

  return (
    <div className="space-y-6 animate-fade-in">
      {billingMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>{billingMessage}</span>
          <button onClick={() => setBillingMessage(null)} className="text-[10px] uppercase underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Subscription Hero Banner */}
      <div 
        className="bg-ink-950 dark:bg-black rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-sm min-h-[140px]"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(5, 8, 11, 0.95)), url("/subscription_plan_banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" /> Subscription Management
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Plans & Billing</h2>
          <p className="text-[11px] text-ink-300 leading-relaxed">
            Choose the right plan for your portfolio. Upgrade to unlock unlimited properties, Sophia AI, contractor marketplace access, and team collaboration.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 flex-shrink-0">
          <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-3.5 flex flex-col justify-center min-w-[200px]">
            <div className="text-[9px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Current Status</div>
            <div className="space-y-1 mt-1 text-[11px] text-ink-300">
              <div>• Plan: <span className="font-bold text-white">{isPremium ? 'Premium' : 'Free'}</span></div>
              <div>• Billing: <span className="font-bold text-white">{isPremium ? '$2.00/mo' : '$0'}</span></div>
              <div>• Status: <span className={`font-bold ${isPremium ? 'text-emerald-400' : 'text-amber-400'}`}>{isPremium ? 'Active' : 'Limited'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {billingLoading && !billingData.subscription ? (
        <div className="py-12 flex flex-col items-center justify-center bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-coral-500 mb-2" />
          <div className="text-xs font-medium text-paper-500 dark:text-ink-400">Loading subscription info...</div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Current Plan Status Banner */}
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-coral-500" /> Your Plan
                </h3>
                <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Manage your workspace subscription and billing.</p>
              </div>
              {isPremium && (
                <span className="bg-coral-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" /> Premium
                </span>
              )}
            </div>

            <div className="p-6">
              {isPremium ? (
                /* Active Premium Status */
                <div className="space-y-6">
                  <div className="p-5 rounded-lg border border-coral-500/30 bg-gradient-to-br from-coral-50/30 to-transparent dark:from-coral-500/5 dark:to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-1.5 text-coral-500 font-bold text-xs uppercase tracking-wider">
                        <Shield className="w-4 h-4" /> Active Plan
                      </div>
                      <h4 className="text-base font-bold text-paper-900 dark:text-white">Premium Subscription</h4>
                      <p className="text-xs text-paper-500 dark:text-ink-400 max-w-md leading-relaxed">
                        Your organization has full access to Sophia AI, contractor workflows, unlimited property listings, and team management.
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-paper-600 dark:text-ink-300 font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-paper-400" />
                          Renews <span className="font-bold text-paper-900 dark:text-white ml-0.5">{billingData.subscription.expiresAt ? new Date(billingData.subscription.expiresAt).toLocaleDateString() : 'Next Month'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-paper-400" />
                          <span className="font-bold text-paper-900 dark:text-white">$2.00 / month</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleCancelPremium}
                      className="px-4 py-2 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20 dark:text-red-400 text-xs font-semibold rounded-md transition-all relative z-10 shrink-0"
                    >
                      Cancel Subscription
                    </button>
                  </div>

                  {/* Premium features checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Unlimited Properties', desc: 'No cap on portfolio size' },
                      { label: 'Sophia AI', desc: 'Full conversation access' },
                      { label: 'Contractor Marketplace', desc: 'Direct contractor assignment' },
                      { label: 'Team Members', desc: 'Unlimited workspace invites' },
                      { label: 'Priority Support', desc: 'Faster response times' },
                      { label: 'Advanced Analytics', desc: 'Detailed usage reports' },
                    ].map((feat) => (
                      <div key={feat.label} className="flex items-start gap-2.5 p-3 rounded-lg bg-paper-50 dark:bg-ink-900/40 border border-paper-200 dark:border-ink-700/50">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-paper-900 dark:text-white">{feat.label}</div>
                          <div className="text-[10px] text-paper-500 dark:text-ink-400">{feat.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Free tier: Show both plan cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Free Card */}
                  <div className="p-5 rounded-lg border border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 flex flex-col justify-between hover:border-paper-300 dark:hover:border-ink-600 transition-all">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-paper-800 dark:text-ink-200">Free</h4>
                        <div className="text-2xl font-bold text-paper-900 dark:text-white mt-1">$0 <span className="text-xs font-medium text-paper-400 dark:text-ink-550">/ forever</span></div>
                      </div>
                      <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-relaxed">
                        For small-scale landlords managing a minimal portfolio.
                      </p>
                      <div className="space-y-2 text-[11px] text-paper-600 dark:text-ink-300 font-medium">
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" /> Max 3 Properties
                        </div>
                        <div className="flex items-center gap-2 text-paper-400 dark:text-ink-500">
                          <span className="w-3 h-3 text-center text-[9px]">✕</span> <span className="line-through">Sophia AI</span>
                        </div>
                        <div className="flex items-center gap-2 text-paper-400 dark:text-ink-500">
                          <span className="w-3 h-3 text-center text-[9px]">✕</span> <span className="line-through">Contractor assignment</span>
                        </div>
                        <div className="flex items-center gap-2 text-paper-400 dark:text-ink-500">
                          <span className="w-3 h-3 text-center text-[9px]">✕</span> <span className="line-through">Team invitations</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6">
                      <span className="block text-center py-2.5 bg-paper-250 dark:bg-ink-950/60 text-paper-500 dark:text-ink-400 text-xs font-semibold rounded-md border border-paper-200 dark:border-ink-800">
                        Current Plan
                      </span>
                    </div>
                  </div>

                  {/* Premium Card */}
                  <div className="p-5 rounded-lg border border-coral-500/40 bg-gradient-to-br from-coral-50/20 to-transparent dark:from-coral-500/5 dark:to-transparent flex flex-col justify-between shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-coral-500 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-coral-500" /> Premium
                          </h4>
                          <div className="text-2xl font-bold text-paper-900 dark:text-white mt-1">$2.00 <span className="text-xs font-medium text-paper-400 dark:text-ink-550">/ month</span></div>
                        </div>
                        <span className="bg-coral-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" /> Popular
                        </span>
                      </div>
                      <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-relaxed">
                        Unlimited scaling, team collaboration, and AI-powered management.
                      </p>
                      <div className="space-y-2 text-[11px] text-paper-600 dark:text-ink-300 font-medium">
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" /> Unlimited properties
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" /> Full Sophia AI access
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" /> Contractor marketplace
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" /> Unlimited team invites
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 relative z-10">
                      <button
                        onClick={() => setShowCheckoutModal(true)}
                        className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-md shadow-md shadow-coral-500/10 hover:shadow-coral-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        Upgrade to Premium <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FAQ / Info Section */}
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 shadow-sm">
            <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider mb-4">Frequently Asked</h4>
            <div className="space-y-3">
              {[
                { q: 'Can I downgrade at any time?', a: 'Yes. Cancelling your premium subscription immediately downgrades you to the free tier at the end of your billing cycle.' },
                { q: 'What happens to my data if I downgrade?', a: 'All your properties and data remain intact. However, properties beyond the free limit (3) will be set to read-only mode.' },
                { q: 'How is billing handled?', a: 'We use Stripe for secure payment processing. Your card is charged monthly on the anniversary of your subscription start date.' },
              ].map((item, idx) => (
                <details key={idx} className="group">
                  <summary className="cursor-pointer text-xs font-semibold text-paper-700 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white transition-colors list-none flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-coral-500 transition-transform group-open:rotate-90" />
                    {item.q}
                  </summary>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1.5 ml-5 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Stripe Checkout Modal */}
      {showCheckoutModal && (
        <StripeCheckoutModal
          type="premium"
          amount={0}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}

      {/* Success Wizard */}
      {showSuccessWizard && (
        <SuccessWizardModal
          type="premium"
          amount={0}
          onClose={() => setShowSuccessWizard(false)}
        />
      )}
    </div>
  );
}
