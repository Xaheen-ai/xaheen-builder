/**
 * @xaheen/app-shell
 *
 * Shared app infrastructure for Xaheen applications.
 * Provides provider composition, auth, tenant context, and route guards.
 */

// Providers
export * from './providers';

// Auth
export { AuthProvider, useAuth } from './auth/AuthProvider';

// Tenant
export { TenantProvider, useTenant } from './auth/TenantProvider';

// Hooks
export * from './hooks';

// Guards
export { RequireAuth, RequirePermission, RequireModule, RequireAll } from './guards';

// Layout
export { AppLayout } from './layout/AppLayout';

// Types
export * from './types';
