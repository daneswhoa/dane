import { create } from 'zustand';

export type ModuleName = 'Properties' | 'Tenants' | 'Finance' | 'Maintenance' | 'Contractors' | 'Communication' | 'Security and Audit';

const MODULE_TABS = [
  { name: 'Properties', actions: ['View Properties', 'List New', 'Edit', 'Delete'] },
  { name: 'Tenants', actions: ['View Tenants', 'Add Tenant', 'Manage Leases', 'Evictions'] },
  { name: 'Finance', actions: ['View Ledgers', 'Process Payments', 'Issue Refunds'] },
  { name: 'Maintenance', actions: ['View Tickets', 'Assign Contractor', 'Approve Invoices'] },
  { name: 'Contractors', actions: ['View Directory', 'Add Contractor', 'Pay Contractor'] },
  { name: 'Communication', actions: ['Send Messages', 'Create Announcements', 'Manage Templates'] },
  { name: 'Security and Audit', actions: ['View Audit Logs', 'Manage Roles', 'Export Data'] },
];

const defaultPermissionsState: Record<string, Record<string, boolean>> = {
  'Properties': { 'List New': false, 'Edit': false, 'Delete': false, 'View Properties': true },
  'Tenants': { 'View Tenants': true, 'Add Tenant': false, 'Manage Leases': false, 'Evictions': false },
  'Finance': { 'View Ledgers': true, 'Process Payments': false, 'Issue Refunds': false },
  'Maintenance': { 'View Tickets': true, 'Assign Contractor': false, 'Approve Invoices': false },
  'Contractors': { 'View Directory': true, 'Add Contractor': false, 'Pay Contractor': false },
  'Communication': { 'Send Messages': false, 'Create Announcements': false, 'Manage Templates': false },
  'Security and Audit': { 'View Audit Logs': false, 'Manage Roles': false, 'Export Data': false }
};

interface PermissionsStore {
  permissions: Record<string, Record<string, boolean>>;
  checkPermission: (module: ModuleName, action: string) => boolean;
  setPermission: (module: ModuleName, action: string, allowed: boolean) => void;
  syncUser: (user: any) => void;
}

export const usePermissionsStore = create<PermissionsStore>((set, get) => ({
  permissions: defaultPermissionsState,
  checkPermission: (module, action) => {
    return get().permissions[module]?.[action] ?? false;
  },
  setPermission: (module, action, allowed) => set((state) => ({
    permissions: {
      ...state.permissions,
      [module]: {
        ...state.permissions[module],
        [action]: allowed
      }
    }
  })),
  syncUser: (user) => {
    if (!user) return;
    
    // Owners (Managers/Landlords without custom permissions) have full permissions by default
    if ((user.role === 'manager' || user.role === 'landlord') && !user.permissions) {
      const fullPerms = {} as any;
      MODULE_TABS.forEach(mod => {
        fullPerms[mod.name] = {};
        mod.actions.forEach(act => {
          fullPerms[mod.name][act] = true;
        });
      });
      set({ permissions: fullPerms });
      return;
    }
    
    // For team members, parse their database-assigned custom/read/full permissions
    if (user.permissions) {
      try {
        const parsed = typeof user.permissions === 'string' 
          ? JSON.parse(user.permissions) 
          : user.permissions;
          
        const updatedPerms = {} as any;
        MODULE_TABS.forEach(mod => {
          updatedPerms[mod.name] = {};
          
          const userModConfig = parsed[mod.name];
          if (userModConfig) {
            if (userModConfig.access === 'full') {
              mod.actions.forEach(act => {
                updatedPerms[mod.name][act] = true;
              });
            } else if (userModConfig.access === 'read') {
              mod.actions.forEach(act => {
                const isReadAct = act.startsWith('View') || act.includes('Logs') || act.includes('Directory');
                updatedPerms[mod.name][act] = isReadAct;
              });
            } else if (userModConfig.access === 'custom' && Array.isArray(userModConfig.actions)) {
              mod.actions.forEach(act => {
                updatedPerms[mod.name][act] = userModConfig.actions.includes(act);
              });
            } else {
              mod.actions.forEach(act => {
                updatedPerms[mod.name][act] = false;
              });
            }
          } else {
            mod.actions.forEach(act => {
              updatedPerms[mod.name][act] = false;
            });
          }
        });
        set({ permissions: updatedPerms });
      } catch (e) {
        console.error('Failed to parse user permissions:', e);
      }
    }
  }
}));
