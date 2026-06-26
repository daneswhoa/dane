'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OverviewTab from '../components/OverviewTab';

export default function OverviewPage() {
  return (
    <DashboardLayout>
      <OverviewTab />
    </DashboardLayout>
  );
}
