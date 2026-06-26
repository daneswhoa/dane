'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import BroadcastsTab from '../../components/BroadcastsTab';

export default function BroadcastsPage() {
  return (
    <DashboardLayout>
      <BroadcastsTab />
    </DashboardLayout>
  );
}
