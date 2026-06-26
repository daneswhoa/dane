'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SecurityTab from '../components/SecurityTab';

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <SecurityTab />
    </DashboardLayout>
  );
}
