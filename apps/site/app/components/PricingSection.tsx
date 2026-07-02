import React from 'react';
import PricingCard from './PricingCard';

export default function PricingSection() {
  const plans = [
    { title: 'Basic Plan', price: '€19', desc: 'Ideal for independent landlords with small portfolios.', features: ['Up to 5 properties', 'Automatic invoice dispatch', 'Standard tenant portals', 'Email customer support'] },
    { title: 'Pro Plan', price: '€39', desc: 'Best for growing property businesses and managers.', features: ['Up to 25 properties', 'Sophia AI assistant dispatch', 'SMS billing & reminders', 'Priority tenant support'], isPro: true },
    { title: 'Premium Plan', price: '€89', desc: 'Ultimate access for enterprise and scale managers.', features: ['Unlimited properties', 'Full AI routing & booking', 'Custom lease builders', 'Dedicated account manager'] },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 text-center" id="pricing">
      <div className="badge mb-4">Pricing Plan</div>
      <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">Select the Plan That <span className="font-serif italic font-normal text-paper-300">Fits Your Needs</span></h2>
      <p className="text-paper-300 text-sm max-w-lg mx-auto mb-16 leading-relaxed">Choose a subscription level tailored to the size of your portfolio and features needed.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <PricingCard key={idx} {...plan} />
        ))}
      </div>
    </section>
  );
}
