/**
 * Listing Permissions Hook
 * RBAC-aware permission checks for listing operations
 */

import { useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import type { ListingPermissions } from '../types';
import type { ListingStatus } from '@xaheen/sdk';

export interface UseListingPermissionsReturn {
  permissions: ListingPermissions;
  canPerformAction: (action: keyof ListingPermissions) => boolean;
  canEditListing: (status: ListingStatus) => boolean;
  canPublishListing: (status: ListingStatus) => boolean;
  canArchiveListing: (status: ListingStatus) => boolean;
  canDeleteListing: (status: ListingStatus) => boolean;
}

export function useListingPermissions(): UseListingPermissionsReturn {
  const { isAdmin, user } = useAuth();

  const permissions = useMemo<ListingPermissions>(() => ({
    // All authenticated users can view
    canView: !!user,
    // All authenticated users can create drafts
    canCreate: !!user,
    // All authenticated users can edit (their own drafts, or any if admin)
    canEdit: !!user,
    // Only admins can publish
    canPublish: isAdmin,
    // Only admins can archive
    canArchive: isAdmin,
    // Only admins can delete
    canDelete: isAdmin,
    // All authenticated users can duplicate
    canDuplicate: !!user,
    // Only admins can view audit trail
    canViewAudit: isAdmin,
  }), [isAdmin, user]);

  const canPerformAction = useMemo(() => {
    return (action: keyof ListingPermissions): boolean => permissions[action];
  }, [permissions]);

  /**
   * Check if user can edit a listing based on its status
   * - Admins can edit any listing
   * - Saksbehandler can only edit drafts
   */
  const canEditListing = useMemo(() => {
    return (status: ListingStatus): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      // Non-admins can only edit drafts
      return status === 'draft';
    };
  }, [isAdmin, user]);

  /**
   * Check if user can publish a listing
   * - Only admins can publish
   * - Can only publish drafts
   */
  const canPublishListing = useMemo(() => {
    return (status: ListingStatus): boolean => {
      if (!isAdmin) return false;
      return status === 'draft';
    };
  }, [isAdmin]);

  /**
   * Check if user can archive a listing
   * - Only admins can archive
   * - Can only archive published listings
   */
  const canArchiveListing = useMemo(() => {
    return (status: ListingStatus): boolean => {
      if (!isAdmin) return false;
      return status === 'published';
    };
  }, [isAdmin]);

  /**
   * Check if user can delete a listing
   * - Only admins can delete
   * - Can delete any status
   */
  const canDeleteListing = useMemo(() => {
    return (_status: ListingStatus): boolean => {
      return isAdmin;
    };
  }, [isAdmin]);

  return {
    permissions,
    canPerformAction,
    canEditListing,
    canPublishListing,
    canArchiveListing,
    canDeleteListing,
  };
}
