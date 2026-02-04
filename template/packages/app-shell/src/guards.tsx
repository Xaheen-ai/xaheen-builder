import type { ReactNode } from 'react';
import { useAuth } from './auth/AuthProvider';
import { useTenant } from './auth/TenantProvider';

interface RequireAuthProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Guard that requires authentication
 */
export function RequireAuth({ children, fallback }: RequireAuthProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return fallback ?? <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login or show fallback
        return fallback ?? null;
    }

    return <>{children}</>;
}

interface RequirePermissionProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Guard that requires a specific permission
 */
export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
    const { hasPermission, isLoading } = useTenant();

    if (isLoading) {
        return fallback ?? <div>Loading...</div>;
    }

    if (!hasPermission(permission)) {
        return fallback ?? null;
    }

    return <>{children}</>;
}

interface RequireModuleProps {
    module: string;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Guard that requires a module to be enabled
 */
export function RequireModule({ module, children, fallback }: RequireModuleProps) {
    const { hasModule, isLoading } = useTenant();

    if (isLoading) {
        return fallback ?? <div>Loading...</div>;
    }

    if (!hasModule(module)) {
        return fallback ?? null;
    }

    return <>{children}</>;
}

interface RequireAllProps {
    permissions?: string[];
    modules?: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Guard that requires all specified permissions and modules
 */
export function RequireAll({ permissions = [], modules = [], children, fallback }: RequireAllProps) {
    const { hasPermission, hasModule, isLoading } = useTenant();

    if (isLoading) {
        return fallback ?? <div>Loading...</div>;
    }

    const hasAllPermissions = permissions.every(p => hasPermission(p));
    const hasAllModules = modules.every(m => hasModule(m));

    if (!hasAllPermissions || !hasAllModules) {
        return fallback ?? null;
    }

    return <>{children}</>;
}
