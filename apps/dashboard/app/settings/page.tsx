'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ComingSoonTab from '../components/ComingSoonTab';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <ComingSoonTab tabName="Settings" />
    </DashboardLayout>
  );
}
