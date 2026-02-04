import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { EffectiveBackofficeRole } from '../lib/capabilities';
import { useAuth } from '../hooks/useAuth';

/**
 * Backoffice Role Provider
 * Manages the effective role selection for dual-role users in the backoffice.
 *
 * Features:
 * - Persist role selection in localStorage
 * - Auto-assign role for single-role users
 * - Provide methods to switch between admin/case_handler roles
 * - Track whether user has made initial role selection
 * - Validate persisted role against user's granted roles
 */

// =============================================================================
// Types
// =============================================================================

export interface BackofficeRoleContextState {
  /** The currently active role (null if not selected) */
  effectiveRole: EffectiveBackofficeRole | null;
  /** List of roles the user has been granted */
  grantedRoles: EffectiveBackofficeRole[];
  /** Whether the user has multiple granted roles */
  isDualRole: boolean;
  /** Whether the user has made a role selection (or was auto-assigned) */
  hasSelectedRole: boolean;
  /** Whether role state is being initialized */
  isInitializing: boolean;
}

export interface BackofficeRoleContextValue extends BackofficeRoleContextState {
  /** Set the effective role (persists to localStorage) */
  setEffectiveRole: (role: EffectiveBackofficeRole, remember?: boolean) => void;
  /** Clear the effective role (removes from localStorage) */
  clearEffectiveRole: () => void;
  /** Check if current effective role is admin */
  isAdmin: boolean;
  /** Check if current effective role is case_handler */
  isCaseHandler: boolean;
  /** Get the appropriate home route for the current role */
  getHomeRoute: () => string;
}

// =============================================================================
// Context
// =============================================================================

const BackofficeRoleContext = createContext<BackofficeRoleContextValue | undefined>(undefined);

// =============================================================================
// Local Storage Keys
// =============================================================================

const STORAGE_KEYS = {
  EFFECTIVE_ROLE: 'backoffice_effective_role',
  REMEMBER_CHOICE: 'backoffice_remember_role_choice',
} as const;

// =============================================================================
// Provider Component
// =============================================================================

interface BackofficeRoleProviderProps {
  children: React.ReactNode;
}

export const BackofficeRoleProvider: React.FC<BackofficeRoleProviderProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  // State: Effective role (the currently active role)
  const [effectiveRole, setEffectiveRoleState] = useState<EffectiveBackofficeRole | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.EFFECTIVE_ROLE);
    if (stored === 'admin' || stored === 'case_handler') {
      return stored;
    }
    return null;
  });

  // State: Whether the user has made a role selection
  const [hasSelectedRole, setHasSelectedRole] = useState<boolean>(false);

  // State: Whether role state is being initialized
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Derived: User's granted roles from auth
  const grantedRoles = useMemo<EffectiveBackofficeRole[]>(() => {
    if (!user || !isAuthenticated) return [];

    // Use grantedRoles if available, otherwise derive from legacy role
    if (user.grantedRoles && user.grantedRoles.length > 0) {
      return user.grantedRoles;
    }

    // Fallback: derive from legacy role field
    if (user.role === 'admin') {
      return ['admin'];
    }
    if (user.role === 'saksbehandler') {
      return ['case_handler'];
    }

    return [];
  }, [user, isAuthenticated]);

  // Derived: Whether user has multiple roles
  const isDualRole = grantedRoles.length > 1;

  // Effect: Handle role initialization and auto-assignment
  useEffect(() => {
    if (!isAuthenticated || grantedRoles.length === 0) {
      setIsInitializing(false);
      return;
    }

    const storedRole = localStorage.getItem(STORAGE_KEYS.EFFECTIVE_ROLE) as EffectiveBackofficeRole | null;
    const rememberChoice = localStorage.getItem(STORAGE_KEYS.REMEMBER_CHOICE) === 'true';

    // Validate stored role against granted roles
    if (storedRole && grantedRoles.includes(storedRole) && rememberChoice) {
      // Valid stored role that user wanted to remember
      setEffectiveRoleState(storedRole);
      setHasSelectedRole(true);
      setIsInitializing(false);
      return;
    }

    // Single-role user: auto-assign without prompting
    if (grantedRoles.length === 1) {
      const autoRole = grantedRoles[0];
      setEffectiveRoleState(autoRole);
      setHasSelectedRole(true);
      localStorage.setItem(STORAGE_KEYS.EFFECTIVE_ROLE, autoRole);
      setIsInitializing(false);
      return;
    }

    // Dual-role user without remembered choice: needs to select
    if (isDualRole && !rememberChoice) {
      // Clear any stale role that wasn't remembered
      setEffectiveRoleState(null);
      setHasSelectedRole(false);
      localStorage.removeItem(STORAGE_KEYS.EFFECTIVE_ROLE);
    }

    setIsInitializing(false);
  }, [isAuthenticated, grantedRoles, isDualRole]);

  // Effect: Clear role state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setEffectiveRoleState(null);
      setHasSelectedRole(false);
      // Note: We don't clear localStorage here to preserve "remember" preference
      // The stored role will be validated on next login
    }
  }, [isAuthenticated]);

  // Method: Set the effective role
  const setEffectiveRole = useCallback((role: EffectiveBackofficeRole, remember: boolean = false) => {
    if (!grantedRoles.includes(role)) {
      return;
    }

    setEffectiveRoleState(role);
    setHasSelectedRole(true);
    localStorage.setItem(STORAGE_KEYS.EFFECTIVE_ROLE, role);

    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_CHOICE, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_CHOICE);
    }
  }, [grantedRoles]);

  // Method: Clear the effective role (for role switching)
  const clearEffectiveRole = useCallback(() => {
    setEffectiveRoleState(null);
    setHasSelectedRole(false);
    localStorage.removeItem(STORAGE_KEYS.EFFECTIVE_ROLE);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_CHOICE);
  }, []);

  // Method: Get the home route for the current role
  const getHomeRoute = useCallback((): string => {
    if (effectiveRole === 'case_handler') {
      return '/work-queue';
    }
    return '/';
  }, [effectiveRole]);

  // Derived: Role check helpers
  const isAdmin = effectiveRole === 'admin';
  const isCaseHandler = effectiveRole === 'case_handler';

  // Memoized context value
  const value = useMemo<BackofficeRoleContextValue>(
    () => ({
      effectiveRole,
      grantedRoles,
      isDualRole,
      hasSelectedRole,
      isInitializing,
      setEffectiveRole,
      clearEffectiveRole,
      isAdmin,
      isCaseHandler,
      getHomeRoute,
    }),
    [
      effectiveRole,
      grantedRoles,
      isDualRole,
      hasSelectedRole,
      isInitializing,
      setEffectiveRole,
      clearEffectiveRole,
      isAdmin,
      isCaseHandler,
      getHomeRoute,
    ]
  );

  return (
    <BackofficeRoleContext.Provider value={value}>
      {children}
    </BackofficeRoleContext.Provider>
  );
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access backoffice role context.
 * Must be used within a BackofficeRoleProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { effectiveRole, isAdmin, setEffectiveRole } = useBackofficeRoleContext();
 *
 *   if (isAdmin) {
 *     return <AdminView />;
 *   }
 *   return <CaseHandlerView />;
 * }
 * ```
 */
export function useBackofficeRoleContext(): BackofficeRoleContextValue {
  const context = useContext(BackofficeRoleContext);
  if (context === undefined) {
    throw new Error('useBackofficeRoleContext must be used within a BackofficeRoleProvider');
  }
  return context;
}
