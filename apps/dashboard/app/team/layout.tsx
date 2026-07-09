'use client';

import React from 'react';
import { useSession } from '@repo/auth';
import DashboardLayout from '../components/DashboardLayout';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  if (!user) return <DashboardLayout>{children}</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full space-y-6 animate-fade-in pb-32">
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}
