'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ComingSoonTab from '../components/ComingSoonTab';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <ComingSoonTab tabName="Analytics" />
    </DashboardLayout>
  );
}
