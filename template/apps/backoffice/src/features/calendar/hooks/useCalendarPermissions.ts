/**
 * Calendar Permissions Hook
 * RBAC checks for calendar actions
 */

import { useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export interface CalendarPermissions {
  // View permissions
  canViewCalendar: boolean;
  canViewBlocks: boolean;
  canViewBookings: boolean;

  // Block management
  canCreateBlock: boolean;
  canEditBlock: boolean;
  canDeleteBlock: boolean;
  canCancelBlock: boolean;

  // Advanced block actions
  canOverrideConflicts: boolean;
  canBulkDeleteBlocks: boolean;
  canCreateRecurringBlocks: boolean;

  // Allocation management
  canCreateAllocation: boolean;
  canEditAllocation: boolean;
  canDeleteAllocation: boolean;

  // Request management
  canApproveRequests: boolean;
  canRejectRequests: boolean;

  // User role info
  isAdmin: boolean;
  isSaksbehandler: boolean;
}

export function useCalendarPermissions(): CalendarPermissions {
  const { user, isAdmin } = useAuth();

  const permissions = useMemo<CalendarPermissions>(() => {
    const isSaksbehandler = user?.role === 'saksbehandler';
    const hasStaffRole = isAdmin || isSaksbehandler;

    return {
      // View permissions - all staff can view
      canViewCalendar: hasStaffRole,
      canViewBlocks: hasStaffRole,
      canViewBookings: hasStaffRole,

      // Block management - all staff can manage blocks
      canCreateBlock: hasStaffRole,
      canEditBlock: hasStaffRole,
      canDeleteBlock: hasStaffRole,
      canCancelBlock: hasStaffRole,

      // Advanced block actions - admin only
      canOverrideConflicts: isAdmin,
      canBulkDeleteBlocks: isAdmin,
      canCreateRecurringBlocks: hasStaffRole,

      // Allocation management - all staff
      canCreateAllocation: hasStaffRole,
      canEditAllocation: hasStaffRole,
      canDeleteAllocation: hasStaffRole,

      // Request management - all staff can approve/reject
      canApproveRequests: hasStaffRole,
      canRejectRequests: hasStaffRole,

      // Role info
      isAdmin,
      isSaksbehandler,
    };
  }, [user, isAdmin]);

  return permissions;
}

/**
 * Hook to check a specific permission
 */
export function useCalendarPermission(permission: keyof CalendarPermissions): boolean {
  const permissions = useCalendarPermissions();
  return permissions[permission] as boolean;
}

/**
 * Hook to check multiple permissions
 */
export function useCalendarPermissionsCheck(
  requiredPermissions: (keyof CalendarPermissions)[]
): { hasAll: boolean; hasSome: boolean; missing: (keyof CalendarPermissions)[] } {
  const permissions = useCalendarPermissions();

  return useMemo(() => {
    const missing = requiredPermissions.filter((p) => !permissions[p]);
    return {
      hasAll: missing.length === 0,
      hasSome: missing.length < requiredPermissions.length,
      missing,
    };
  }, [permissions, requiredPermissions]);
}
