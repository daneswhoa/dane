'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import WalletTab from '../../components/WalletTab';

export default function WalletPage() {
  return (
    <DashboardLayout>
      <WalletTab />
    </DashboardLayout>
  );
}
