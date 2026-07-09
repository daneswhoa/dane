export function checkToolPermission(user: any, module: string, action: string): boolean {
  if (!user) return false;
  
  // Check if custom permissions are empty/blank
  let isPermissionsEmpty = true;
  if (user.permissions) {
    try {
      const parsed = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        isPermissionsEmpty = false;
      }
    } catch (e) {}
  }

  // Owners (managers/landlords without custom permissions) have full access
  if ((user.role === 'manager' || user.role === 'landlord') && isPermissionsEmpty) {
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

export function getToolPermissionError(user: any, module: string, action: string): string | null {
  if (!user) return 'Access Denied: No user session context was provided to the tool.';
  
  const hasAccess = checkToolPermission(user, module, action);
  if (hasAccess) return null;

  return `Access Denied: The logged-in user "${user.name || 'User'}" (${user.email || 'no-email'}) does not have the "${action}" permission enabled for the "${module}" module. Please ask your organization owner/landlord to grant you this permission in the "Organization / Team" settings tab under Member Access control.`;
}
