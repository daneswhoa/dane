'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { SyndicationCenter } from '../../components/syndication/SyndicationCenter';

export default function NewSyndicationPage() {
  return (
    <DashboardLayout>
      <SyndicationCenter defaultOpenNew={true} />
    </DashboardLayout>
  );
}
