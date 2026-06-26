import React from 'react';
import { useRouter } from 'next/navigation';
import { DoorOpen, Mail, Phone, MessageSquare, FileText, MoreHorizontal, Zap, ArrowUp, ArrowRightLeft } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  floor: string;
  rent: number;
  arrears: number;
  status: string;
  leaseStart: string;
  leaseEnd: string;
}

interface TenantsTableProps {
  tenants: Tenant[];
  onMoveTenant?: (tenant: { id: string; name: string; unitId: string; propertyName: string }) => void;
}

export function TenantsTable({ tenants, onMoveTenant }: TenantsTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string, arrears: number) => {
    const rawStatus = status.toUpperCase();
    if (arrears > 0 || rawStatus === 'LATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-coral-200 dark:border-coral-500/20 bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 text-[9px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-coral-500"></span> Late
        </span>
      );
    }
    if (rawStatus === 'RENEWING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-250 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
          Renewing
        </span>
      );
    }
    if (rawStatus === 'NOTICE GIVEN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider">
          Notice Given
        </span>
      );
    }
    if (rawStatus === 'MOVE-IN PREP') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-paper-250 dark:border-ink-650 bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-300 text-[9px] font-bold uppercase tracking-wider">
          Move-in Prep
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-250 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return 'No lease dates logged';
    const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: '2-digit' };
    const startDate = new Date(start).toLocaleDateString('en-US', opt);
    const endDate = new Date(end).toLocaleDateString('en-US', opt);
    return `${startDate} - ${endDate}`;
  };

  const getRemainingLabel = (end: string) => {
    if (!end) return '';
    const diff = new Date(end).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'Expired';
    if (days <= 60) return `Expiring in ${days} days`;
    const mos = Math.round(days / 30);
    return `${mos} mos remaining`;
  };

  return (
    <div className="overflow-x-auto w-full scrollbar-none">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-paper-50 dark:bg-ink-900/80 border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-bold">
            <th className="px-4 py-3 w-10">
              <input type="checkbox" className="rounded border-paper-300 dark:border-ink-600 text-coral-500 focus:ring-coral-500 bg-transparent" />
            </th>
            <th className="px-4 py-3">Tenant <ArrowUp className="inline w-3 h-3 ml-0.5 text-paper-400" /></th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Lease Term</th>
            <th className="px-4 py-3 text-right">Rent</th>
            <th className="px-4 py-3 text-right">Balance</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 bg-white dark:bg-ink-800">
          {tenants.map((t) => (
            <tr
              key={t.id}
              onClick={() => router.push(`/tenants/${t.id}`)}
              className="hover:bg-paper-50 dark:hover:bg-ink-700/30 cursor-pointer transition-all duration-150 group"
            >
              <td className="px-4 py-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="rounded border-paper-300 dark:border-ink-600 text-coral-500 bg-transparent" />
              </td>
              <td className="px-4 py-3.5 align-middle">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper-100 dark:bg-ink-950 flex items-center justify-center font-bold text-xs text-paper-700 dark:text-ink-300 border border-paper-200 dark:border-ink-800">
                    {getInitials(t.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-paper-900 dark:text-white group-hover:text-coral-500 transition-colors">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-paper-500 dark:text-ink-400">{t.email || t.phone}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 align-middle">
                <div className="flex flex-col">
                  <span className="font-medium text-paper-800 dark:text-ink-100">{t.propertyName}</span>
                  <span className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1">
                    <DoorOpen className="w-3 h-3 text-paper-400" /> Unit {t.unitId}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 align-middle">
                <div className="flex flex-col">
                  <span className="text-paper-900 dark:text-white font-medium">{formatDateRange(t.leaseStart, t.leaseEnd)}</span>
                  <span className={`text-[10px] font-bold ${getRemainingLabel(t.leaseEnd).includes('Expiring') ? 'text-amber-500' : 'text-paper-500'}`}>
                    {getRemainingLabel(t.leaseEnd)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 align-middle text-right">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-paper-900 dark:text-white">${t.rent.toLocaleString()}</span>
                  <span className="text-[9px] text-paper-400 flex items-center gap-0.5" title="Payment Mode">
                    <Zap className="w-3 h-3 text-emerald-500" /> Auto-pay
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 align-middle text-right">
                <span className={`font-bold ${t.arrears > 0 ? 'text-coral-500' : 'text-paper-400'}`}>
                  ${t.arrears.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td className="px-4 py-3.5 align-middle">
                {getStatusBadge(t.status, t.arrears)}
              </td>
              <td className="px-4 py-3.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {onMoveTenant && (
                    <button 
                      onClick={() => onMoveTenant({ id: t.id, name: t.name, unitId: t.unitId, propertyName: t.propertyName })}
                      className="p-1 hover:text-coral-500" 
                      title="Move Tenant"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-coral-500" />
                    </button>
                  )}
                  <button onClick={() => router.push(`/tenants/${t.id}`)} className="p-1 hover:text-coral-500" title="View Profile">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-coral-500" title="Message">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-coral-500" title="Options">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
