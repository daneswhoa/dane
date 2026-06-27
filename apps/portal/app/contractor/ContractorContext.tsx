'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from '@repo/auth';
import { ContractorProfile, MaintenanceJob } from './types';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`;

interface ContractorContextType {
  profile: ContractorProfile | null;
  jobs: MaintenanceJob[];
  loading: boolean;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
  fetchData: () => Promise<void>;
  showProfileWizard: boolean;
  setShowProfileWizard: (val: boolean) => void;
}

const ContractorContext = createContext<ContractorContextType | undefined>(undefined);

export function ContractorProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasFetched, setHasFetched] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (!isPending && session && (session.user as any)?.role !== 'contractor') {
      const role = (session.user as any)?.role || 'tenant';
      if (role === 'manager') router.push(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      else if (role === 'tenant') router.push('/tenant');
    }
  }, [session, isPending, router]);

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const profRes = await fetch(`${API_URL}/api/dashboard/contractor/profile?userId=${session.user.id}`);
      if (profRes.ok) {
        const profileData = await profRes.json();
        setProfile(profileData || null);
      } else {
        setProfile(null);
      }

      const jobsRes = await fetch(`${API_URL}/api/dashboard/contractor/jobs?userId=${session.user.id}`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (err: any) {
      console.error(err);
      // Removed mock data fallback as requested
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id && !hasFetched) {
      setHasFetched(true);
      fetchData();
    }
  }, [session?.user?.id, hasFetched]);

  return (
    <ContractorContext.Provider value={{ profile, jobs, loading, errorMsg, setErrorMsg, fetchData, showProfileWizard, setShowProfileWizard }}>
      {children}
    </ContractorContext.Provider>
  );
}

export function useContractor() {
  const context = useContext(ContractorContext);
  if (context === undefined) {
    throw new Error('useContractor must be used within a ContractorProvider');
  }
  return context;
}
