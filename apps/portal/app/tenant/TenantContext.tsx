'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantProfile } from './types';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@repo/auth';

interface TenantContextType {
  profile: TenantProfile | null;
  loading: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  isProfileWizardOpen: boolean;
  setIsProfileWizardOpen: (open: boolean) => void;
  isInviteCodeModalOpen: boolean;
  setIsInviteCodeModalOpen: (open: boolean) => void;
  isMaintenanceModalOpen: boolean;
  setIsMaintenanceModalOpen: (open: boolean) => void;
  invoiceModalId: string | null;
  setInvoiceModalId: (id: string | null) => void;
  handleActionClick: (action: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const MOCK_TENANT_PROFILE: TenantProfile = {
  id: "TEN-001",
  name: "Samuel Mutua",
  email: "samuel.mutua@example.com",
  phone: "0770606779",
  unit: "",
  building: "",
  moveInDate: "",
  leaseEnd: "",
  autopayEnabled: false,
  photoUrl: ""
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [invoiceModalId, setInvoiceModalId] = useState<string | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false);
  const [isInviteCodeModalOpen, setIsInviteCodeModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDark = localStorage.getItem('tenant_theme_dark');
      if (savedDark !== null) {
        setIsDark(savedDark === 'true');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tenant_theme_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tenant_theme_dark', 'false');
    }
  }, [isDark]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: session } = await authClient.getSession();

        if (!session || !session.user) {
          router.push('/login');
          return;
        }

        const userId = session.user.id;
        const userName = session.user.name || 'Resident Tenant';
        const userEmail = session.user.email;
        
        const profileRes = await fetch(`http://localhost:4000/api/dashboard/tenant/profile?userId=${userId}`, {
          credentials: 'include',
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data) {
            setProfile({
              ...data,
              name: data.name || userName,
              email: data.email || userEmail,
            });
            return;
          }
        }
        
        // Return profile structured with authenticated user info, not mock data
        setProfile({
          id: userId,
          name: userName,
          email: userEmail,
          phone: '',
          unit: '',
          building: '',
          moveInDate: '',
          leaseEnd: '',
          autopayEnabled: false,
          photoUrl: ''
        });
      } catch (err) {
        console.error("Failed to load tenant session:", err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'new_request':
        if (!profile?.building) {
          setIsInviteCodeModalOpen(true);
        } else {
          setIsMaintenanceModalOpen(true);
        }
        break;
      case 'edit_profile':
        setIsProfileWizardOpen(true);
        break;
      case 'pay_balance':
        router.push('/tenant/payments');
        break;
      case 'new_message':
        router.push('/tenant/communications');
        break;
      default:
        break;
    }
  };

  return (
    <TenantContext.Provider value={{
      profile,
      loading,
      isDark,
      toggleTheme,
      isProfileWizardOpen,
      setIsProfileWizardOpen,
      isInviteCodeModalOpen,
      setIsInviteCodeModalOpen,
      isMaintenanceModalOpen,
      setIsMaintenanceModalOpen,
      invoiceModalId,
      setInvoiceModalId,
      handleActionClick
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
}
