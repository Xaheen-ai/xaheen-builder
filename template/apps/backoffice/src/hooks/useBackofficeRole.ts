/**
 * useBackofficeRole Hook
 *
 * Provides access to the backoffice role context for managing
 * effective role selection in the dual-role RBAC system.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { effectiveRole, isAdmin, setEffectiveRole, isDualRole } = useBackofficeRole();
 *
 *   if (isAdmin) {
 *     return <AdminView />;
 *   }
 *   return <CaseHandlerView />;
 * }
 * ```
 */

import { useBackofficeRoleContext } from '../providers/BackofficeRoleProvider';

// =============================================================================
// Re-exports for convenience
// =============================================================================

export type { EffectiveBackofficeRole } from '../lib/capabilities';

export type {
  BackofficeRoleContextState,
  BackofficeRoleContextValue,
} from '../providers/BackofficeRoleProvider';

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for accessing backoffice role context.
 * Provides the currently effective role, granted roles, and methods
 * for role selection and switching.
 *
 * Must be used within a BackofficeRoleProvider.
 *
 * @returns {BackofficeRoleContextValue} Role context value with state and methods
 * @throws {Error} If used outside of BackofficeRoleProvider
 *
 * @example
 * ```tsx
 * // Basic usage
 * function Dashboard() {
 *   const { effectiveRole, isAdmin, isCaseHandler } = useBackofficeRole();
 *
 *   return (
 *     <div>
 *       <p>Current role: {effectiveRole}</p>
 *       {isAdmin && <AdminPanel />}
 *       {isCaseHandler && <CaseHandlerPanel />}
 *     </div>
 *   );
 * }
 *
 * // Role selection
 * function RoleSelector() {
 *   const { grantedRoles, setEffectiveRole, isDualRole } = useBackofficeRole();
 *
 *   if (!isDualRole) return null;
 *
 *   return (
 *     <div>
 *       {grantedRoles.map((role) => (
 *         <button key={role} onClick={() => setEffectiveRole(role, true)}>
 *           Continue as {role}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 *
 * // Role switching
 * function RoleSwitcher() {
 *   const { isDualRole, clearEffectiveRole, getHomeRoute } = useBackofficeRole();
 *
 *   if (!isDualRole) return null;
 *
 *   const handleSwitch = () => {
 *     clearEffectiveRole();
 *     // Navigate to role selection
 *   };
 *
 *   return <button onClick={handleSwitch}>Switch Role</button>;
 * }
 * ```
 */
export function useBackofficeRole() {
  return useBackofficeRoleContext();
}

/**
 * Helper hook to check if role selection is required.
 * Returns true if the user has multiple roles but hasn't selected one yet.
 *
 * @returns {boolean} Whether the user needs to select a role
 *
 * @example
 * ```tsx
 * function App() {
 *   const needsRoleSelection = useNeedsRoleSelection();
 *
 *   if (needsRoleSelection) {
 *     return <Navigate to="/role-selection" />;
 *   }
 *
 *   return <MainApp />;
 * }
 * ```
 */
export function useNeedsRoleSelection(): boolean {
  const { isDualRole, hasSelectedRole, isInitializing } = useBackofficeRoleContext();

  // Don't trigger redirect during initialization
  if (isInitializing) return false;

  // Needs selection if dual-role user hasn't selected yet
  return isDualRole && !hasSelectedRole;
}

/**
 * Helper hook to get the current effective role with a fallback.
 * Useful for cases where you need a guaranteed role value.
 *
 * @param fallback - The fallback role to use if no role is selected
 * @returns {EffectiveBackofficeRole} The effective role or fallback
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const role = useEffectiveRoleWithFallback('case_handler');
 *   // role is guaranteed to be a valid EffectiveBackofficeRole
 * }
 * ```
 */
export function useEffectiveRoleWithFallback(
  fallback: import('../lib/capabilities').EffectiveBackofficeRole
): import('../lib/capabilities').EffectiveBackofficeRole {
  const { effectiveRole } = useBackofficeRoleContext();
  return effectiveRole ?? fallback;
}
