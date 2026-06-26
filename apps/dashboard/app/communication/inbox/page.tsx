'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ComingSoonTab from '../../components/ComingSoonTab';

export default function CommunicationInboxPage() {
  return (
    <DashboardLayout>
      <ComingSoonTab tabName="Communication Inbox" />
    </DashboardLayout>
  );
}
