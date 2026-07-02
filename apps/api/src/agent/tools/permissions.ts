export function checkToolPermission(user: any, module: string, action: string): boolean {
  if (!user) return false;
  
  // Owners (managers/landlords without custom permissions) have full access
  if ((user.role === 'manager' || user.role === 'landlord') && !user.permissions) {
    return true;
  }
  
  // Teammates check custom permissions
  if (user.permissions) {
    try {
      const parsed = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      const modConfig = parsed[module];
      if (modConfig) {
        if (modConfig.access === 'full') return true;
        if (modConfig.access === 'read') {
          return action.startsWith('View') || action.includes('Logs') || action.includes('Directory');
        }
        if (modConfig.access === 'custom' && Array.isArray(modConfig.actions)) {
          return modConfig.actions.includes(action);
        }
      }
    } catch (e) {
      console.error('Failed to parse user permissions in tool:', e);
    }
  }
  return false;
}
