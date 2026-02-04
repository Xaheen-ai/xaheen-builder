import { useAuth } from './useAuth';

export type Permission =
  | 'bookings.view'
  | 'bookings.approve'
  | 'bookings.reject'
  | 'bookings.cancel'
  | 'listings.view'
  | 'listings.create'
  | 'listings.edit'
  | 'listings.delete'
  | 'users.view'
  | 'users.manage'
  | 'settings.view'
  | 'settings.edit'
  | 'reports.view'
  | 'reports.export';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'bookings.view',
    'bookings.approve',
    'bookings.reject',
    'bookings.cancel',
    'listings.view',
    'listings.create',
    'listings.edit',
    'listings.delete',
    'users.view',
    'users.manage',
    'settings.view',
    'settings.edit',
    'reports.view',
    'reports.export',
  ],
  saksbehandler: [
    'bookings.view',
    'bookings.approve',
    'bookings.reject',
    'bookings.cancel',
    'listings.view',
    'reports.view',
  ],
  user: [
    'bookings.view',
    'listings.view',
  ],
};

export function useRBAC() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] ?? [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  const requirePermission = (permission: Permission): void => {
    if (!hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    requirePermission,
    permissions: user ? ROLE_PERMISSIONS[user.role] ?? [] : [],
  };
}
