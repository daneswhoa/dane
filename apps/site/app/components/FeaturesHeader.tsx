import React from 'react';

export default function FeaturesHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
      <div>
        <div className="badge mb-4">Why Choose Us</div>
        <h2 className="text-4xl md:text-5xl font-semibold text-white">
          Manage Your <span className="font-serif italic font-normal text-paper-300">Finances Smarter</span>
        </h2>
      </div>
      <p className="text-paper-300 max-w-sm text-sm leading-relaxed">
        Track rent income, manage work orders, and keep direct eyes on occupancy logs using manager-first admin tools.
      </p>
    </div>
  );
}
