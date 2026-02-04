import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@xaheen/sdk';
import type { TenantState, Tenant } from '../types';
import { useAuth } from './AuthProvider';

interface TenantContextValue extends TenantState {
    switchTenant: (tenantId: string) => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasModule: (moduleCode: string) => boolean;
    grantedRoles: string[];
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
    children: ReactNode;
    initialTenantId?: string;
}

export function TenantProvider({ children, initialTenantId: _initialTenantId }: TenantProviderProps) {
    const { accessToken } = useAuth();
    const [overrideTenantId, setOverrideTenantId] = useState<string | null>(null);

    // Query user context reactively via Convex
    const userContext = useQuery(
        api.auth.claims.getUserContext,
        accessToken ? { sessionToken: accessToken } : 'skip'
    );

    // Derive tenant state from the query result
    const tenant: Tenant | null = useMemo(() => {
        if (!userContext?.tenant) return null;
        return {
            id: String(userContext.tenant.id),
            slug: userContext.tenant.slug,
            name: userContext.tenant.name,
            plan: undefined,
        };
    }, [userContext?.tenant]);

    const permissions: string[] = useMemo(
        () => userContext?.permissions ?? [],
        [userContext?.permissions]
    );

    const grantedRoles: string[] = useMemo(
        () => userContext?.grantedRoles ?? [],
        [userContext?.grantedRoles]
    );

    // Enabled modules would come from tenant config — for now derive from context
    const enabledModules: string[] = useMemo(() => {
        // When the tenant modules table is available, this will query it.
        // For now, return empty array — hasModule checks will default to false.
        return [];
    }, []);

    const isLoading = accessToken ? userContext === undefined : false;

    const switchTenant = useCallback(async (tenantId: string) => {
        setOverrideTenantId(tenantId);
        // In a full implementation, this would update the session's tenant context
        // and re-query. For now it just tracks the intent.
    }, []);

    function hasPermission(permission: string): boolean {
        if (permissions.includes(permission)) return true;

        // Check for wildcards (e.g., "digilist.*" matches "digilist.objects.read")
        const parts = permission.split('.');
        for (let i = parts.length - 1; i >= 0; i--) {
            const wildcard = [...parts.slice(0, i), '*'].join('.');
            if (permissions.includes(wildcard)) return true;
        }

        return false;
    }

    function hasModule(moduleCode: string): boolean {
        return enabledModules.includes(moduleCode);
    }

    const value = useMemo<TenantContextValue>(
        () => ({
            tenant,
            isLoading,
            enabledModules,
            permissions,
            grantedRoles,
            switchTenant,
            hasPermission,
            hasModule,
        }),
        [tenant, isLoading, enabledModules, permissions, grantedRoles, switchTenant]
    );

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant(): TenantContextValue {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
