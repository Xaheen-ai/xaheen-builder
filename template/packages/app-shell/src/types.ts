/**
 * App Shell Types
 */

export interface User {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
}

export interface Tenant {
    id: string;
    slug: string;
    name: string;
    plan?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    accessToken: string | null;
    error: Error | null;
}

export interface TenantState {
    tenant: Tenant | null;
    isLoading: boolean;
    enabledModules: string[];
    permissions: string[];
}

export interface PermissionCheck {
    permission: string;
    granted: boolean;
}

export interface ModuleCheck {
    module: string;
    enabled: boolean;
}
