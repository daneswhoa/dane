import { create } from 'zustand';
import { 
  ShieldCheck, Database, Key, Users, Server, Cpu, Search, Laptop, 
  Mail, AlertTriangle, CheckCircle2, XCircle, ClipboardList, Wrench, 
  CircleDollarSign, ShieldAlert, HelpCircle, Shield, Filter
} from 'lucide-react';

export type LogSeverity = 'info' | 'warning' | 'critical' | 'system';

export interface AuditLog {
  id: string;
  timestamp: string;
  timeString: string;
  actor: {
    initials: string;
    name: string;
    email: string;
    isSystem?: boolean;
    isUnknown?: boolean;
  };
  category: {
    icon: any; // Lucide icon
    label: string;
  };
  description: string;
  descriptionHtml?: any;
  ip: string;
  location: string;
  status: 'success' | 'blocked' | 'failed';
  severity: LogSeverity;
}

const iconMap: Record<string, any> = {
  Database,
  ShieldAlert,
  ShieldCheck,
  Laptop,
  AlertTriangle,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Key,
  Users,
  Server,
  Cpu,
  HelpCircle,
  Mail,
  ClipboardList,
  Wrench,
  CircleDollarSign,
};

const seedLogs: AuditLog[] = [
  {
    id: 'seed-1',
    timestamp: new Date().toLocaleDateString(),
    timeString: '10:42:15 AM',
    actor: { initials: 'SYS', name: 'System', email: 'system@landlord.nl', isSystem: true },
    category: { icon: ShieldCheck, label: 'Security' },
    description: 'Automatic rotation of system encryption keys completed.',
    ip: '127.0.0.1', location: 'System Core', status: 'success', severity: 'system'
  },
  {
    id: 'seed-2',
    timestamp: new Date().toLocaleDateString(),
    timeString: '09:15:30 AM',
    actor: { initials: 'JD', name: 'Jane Doe', email: 'jane.doe@landlord.nl' },
    category: { icon: Key, label: 'Access Control' },
    description: 'Updated team member permissions for Regional Manager role.',
    ip: '82.197.214.33', location: 'Amsterdam, NL', status: 'success', severity: 'warning'
  },
  {
    id: 'seed-3',
    timestamp: new Date().toLocaleDateString(),
    timeString: '08:02:11 AM',
    actor: { initials: 'JD', name: 'Jane Doe', email: 'jane.doe@landlord.nl' },
    category: { icon: Laptop, label: 'Authentication' },
    description: 'Successful multi-factor authentication login.',
    ip: '82.197.214.33', location: 'Amsterdam, NL', status: 'success', severity: 'info'
  }
];

interface AuditStore {
  logs: AuditLog[];
  totalLogs: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  fetchLogs: (page?: number, limit?: number, search?: string, severity?: string) => Promise<void>;
  logAction: (log: Omit<AuditLog, 'id' | 'timestamp' | 'timeString' | 'actor'> & { actor?: AuditLog['actor'] }) => Promise<void>;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  totalLogs: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,

  fetchLogs: async (page = 1, limit = 20, search = '', severity = 'All') => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search) params.append('search', search);
      if (severity && severity !== 'All') params.append('severity', severity);

      const res = await fetch(`http://localhost:4000/api/dashboard/security/audit-logs?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.logs || [];
        const total = result.total || 0;

        if (Array.isArray(data)) {
          const formattedLogs = data.map((d: any) => ({
            id: d.id,
            timestamp: new Date(d.timestamp).toLocaleDateString(),
            timeString: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            actor: {
              initials: d.actorInitials,
              name: d.actorName,
              email: d.actorEmail,
              isSystem: d.actorName === 'System',
            },
            category: {
              icon: iconMap[d.categoryIconName] || Database,
              label: d.categoryLabel,
            },
            description: d.description,
            ip: d.ip,
            location: d.location,
            status: d.status,
            severity: d.severity,
          }));
          set({ 
            logs: formattedLogs, 
            totalLogs: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit) || 1,
            isLoading: false 
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Backend security service offline, using offline logs session');
    }
    // Fallback to local logs (initialize with seed if empty)
    set((state) => {
      const displayLogs = state.logs.length === 0 ? seedLogs : state.logs;
      const filtered = displayLogs.filter((log) => {
        const matchesSearch = !search ||
          log.actor.email.toLowerCase().includes(search.toLowerCase()) ||
          log.actor.name.toLowerCase().includes(search.toLowerCase()) ||
          log.category.label.toLowerCase().includes(search.toLowerCase()) ||
          log.ip.includes(search) ||
          log.description.toLowerCase().includes(search.toLowerCase());
          
        const matchesSeverity = !severity || severity === 'All' || log.severity === severity;
        
        return matchesSearch && matchesSeverity;
      });

      return { 
        logs: filtered.slice((page - 1) * limit, page * limit), 
        totalLogs: filtered.length,
        currentPage: page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
        isLoading: false 
      };
    });
  },

  logAction: async (log) => {
    // 1. Resolve icon name
    let iconName = 'Database';
    if (log.category && log.category.icon) {
      const found = Object.keys(iconMap).find(key => iconMap[key] === log.category.icon);
      if (found) {
        iconName = found;
      }
    }

    // 2. Prepare payload
    const payload = {
      categoryIconName: iconName,
      categoryLabel: log.category?.label || 'General',
      description: log.description,
      ip: log.ip || 'Unknown',
      location: log.location || 'Unknown',
      status: log.status || 'success',
      severity: log.severity || 'info',
    };

    // 3. Post to backend
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/security/audit-logs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.log) {
          const newLog = {
            id: data.log.id,
            timestamp: new Date(data.log.timestamp).toLocaleDateString(),
            timeString: new Date(data.log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            actor: {
              initials: data.log.actorInitials,
              name: data.log.actorName,
              email: data.log.actorEmail,
              isSystem: data.log.actorName === 'System',
            },
            category: {
              icon: log.category?.icon || Database,
              label: data.log.categoryLabel,
            },
            description: data.log.description,
            ip: data.log.ip,
            location: data.log.location,
            status: data.log.status as any,
            severity: data.log.severity as any,
          };
          set((state) => ({ logs: [newLog, ...state.logs] }));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend security service offline, logging to session state');
    }

    // Fallback: local/Zustand in-memory only (e.g. if offline)
    const fallbackActor = log.actor || { initials: 'JD', name: 'Jane Doe', email: 'jane.doe@landlord.nl' };
    const newLog = {
      ...log,
      actor: fallbackActor,
      id: `local_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toLocaleDateString(),
      timeString: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
    } as AuditLog;
    set((state) => ({ logs: [newLog, ...state.logs] }));
  }
}));
