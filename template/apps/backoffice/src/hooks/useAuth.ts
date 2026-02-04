import { createContext, useContext } from 'react';
import type { EffectiveBackofficeRole } from '../lib/capabilities';

/**
 * Re-export EffectiveBackofficeRole for convenience
 */
export type { EffectiveBackofficeRole } from '../lib/capabilities';

/**
 * Legacy role type for backward compatibility.
 * Use EffectiveBackofficeRole for new implementations.
 */
export type BackofficeRole = 'admin' | 'saksbehandler';

/**
 * Backoffice-specific user type.
 * Supports both legacy single role and new multi-role grant system.
 */
export interface BackofficeUser {
  id: string;
  name: string;
  email: string;
  /**
   * Legacy role field for backward compatibility.
   * @deprecated Use grantedRoles for new implementations.
   */
  role: BackofficeRole;
  /**
   * Array of roles the user has been granted.
   * Dual-role users will have both 'admin' and 'case_handler'.
   * Single-role users will have one entry.
   */
  grantedRoles?: EffectiveBackofficeRole[];
  /**
   * Tenant ID for multi-tenant data isolation.
   * Required for SDK hooks to fetch tenant-scoped data.
   */
  tenantId?: string;
}

export interface AuthContextType {
  user: BackofficeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSaksbehandler: boolean;
  login: (provider?: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-dual') => void;
  logout: () => Promise<void>;
  checkRole: (role: BackofficeRole) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
