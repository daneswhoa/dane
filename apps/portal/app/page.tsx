'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@repo/auth';

export default function PortalHome() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPending) setIsTimedOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPending]);

  useEffect(() => {
    if (!isPending || isTimedOut) {
      if (!session && !isTimedOut) {
        router.push('/login');
      } else {
        const userRole = session ? ((session.user as any)?.role || 'tenant') : 'tenant';
        if (userRole === 'tenant') {
          router.push('/tenant');
        } else if (userRole === 'contractor') {
          router.push('/contractor');
        } else {
          router.push(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        }
      }
    }
  }, [session, isPending, router, isTimedOut]);

  return (
    <div className="global-loading-overlay">
      <div className="global-loading-spinner" />
      <div className="global-loading-text">Loading Portal...</div>
    </div>
  );
}
