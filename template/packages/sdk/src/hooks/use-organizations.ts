/**
 * Xaheen SDK - Organization & User Hooks (Tier 2 Adapter)
 *
 * React hooks for organization management, user CRUD, GDPR, and consent.
 * Wraps Convex real-time queries/mutations into a React Query-like API shape
 * compatible with the digdir client-sdk contract.
 *
 * Queries  return `{ data, isLoading, error }`.
 * Mutations return `{ mutate, mutateAsync, isLoading, error, isSuccess }`.
 */

import {
    useQuery as useConvexQuery,
    useMutation as useConvexMutation,
} from "convex/react";
import { api, type TenantId, type OrganizationId, type UserId } from "../convex-api";
import type { Id } from "../convex-api";
import { useState, useCallback } from "react";
import { toPaginatedResponse, toSingleResponse } from "../transforms/common";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap a Convex useQuery into a React Query-like shape. */
function useWrappedQuery<T>(
    queryRef: any,
    args: any,
): { data: T | undefined; isLoading: boolean; error: Error | null } {
    const raw = useConvexQuery(queryRef, args);
    return {
        data: raw as T | undefined,
        isLoading: raw === undefined && args !== "skip",
        error: null,
    };
}

/** Wrap a Convex useMutation into a React Query-like shape. */
function useWrappedMutation<TArgs = any, TResult = any>(mutationRef: any) {
    const mutate = useConvexMutation(mutationRef);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (args: TArgs): Promise<TResult> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await (mutate as any)(args);
            setIsSuccess(true);
            return result;
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate: mutateAsync, mutateAsync, isLoading, error, isSuccess };
}

/** Build a stub mutation return value (for not-yet-implemented endpoints). */
function useStubMutation<TArgs = any, TResult = any>() {
    const [isLoading] = useState(false);
    const [error] = useState<Error | null>(null);
    const [isSuccess] = useState(false);

    const mutateAsync = async (_args: TArgs): Promise<TResult> => {
        console.warn("[SDK] Stub mutation called — backend not implemented yet");
        return undefined as unknown as TResult;
    };

    return { mutate: mutateAsync, mutateAsync, isLoading, error, isSuccess };
}

// ---------------------------------------------------------------------------
// Organization Types
// ---------------------------------------------------------------------------

export interface Organization {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    description?: string;
    type: string;
    parentId?: string;
    status: string;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    parent?: Record<string, unknown> | null;
    children?: Organization[];
    createdAt: string;
}

export interface OrganizationQueryParams {
    tenantId?: TenantId;
    status?: string;
    parentId?: OrganizationId;
}

export interface CreateOrganizationInput {
    tenantId: TenantId;
    name: string;
    slug: string;
    description?: string;
    type: string;
    parentId?: OrganizationId;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export interface UpdateOrganizationInput {
    id: OrganizationId;
    name?: string;
    description?: string;
    type?: string;
    parentId?: OrganizationId;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    status?: string;
}

// ---------------------------------------------------------------------------
// User Types
// ---------------------------------------------------------------------------

export interface User {
    id: string;
    tenantId: string;
    organizationId?: string;
    email: string;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    role: string;
    status: string;
    metadata?: Record<string, unknown>;
    tenant?: Record<string, unknown> | null;
    organization?: Record<string, unknown> | null;
    createdAt: string;
}

export interface UserQueryParams {
    tenantId?: TenantId;
    status?: string;
    role?: string;
    limit?: number;
}

export interface CreateUserInput {
    tenantId: TenantId;
    organizationId?: OrganizationId;
    email: string;
    name?: string;
    displayName?: string;
    role: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateUserInput {
    id: UserId;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    role?: string;
    organizationId?: OrganizationId;
    metadata?: Record<string, unknown>;
}

export interface ConsentSettings {
    marketing: boolean;
    analytics: boolean;
    thirdParty: boolean;
    updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Query key factories (inert — for React Query cache-key compat)
// ---------------------------------------------------------------------------

export const organizationKeys = {
    all: ["organizations"] as const,
    lists: () => [...organizationKeys.all, "list"] as const,
    list: (params?: OrganizationQueryParams) =>
        [...organizationKeys.lists(), params] as const,
    details: () => [...organizationKeys.all, "detail"] as const,
    detail: (id: string) => [...organizationKeys.details(), id] as const,
    members: (id: string) => [...organizationKeys.all, "members", id] as const,
};

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    me: () => [...userKeys.all, "me"] as const,
    consents: (userId?: string) => [...userKeys.all, "consents", userId] as const,
};

// ============================================================================
// Organization Hooks
// ============================================================================

/**
 * Fetch organizations with optional filtering.
 * Wraps `api.organizations.index.list`.
 */
export function useOrganizations(params?: OrganizationQueryParams) {
    const args =
        params?.tenantId
            ? {
                  tenantId: params.tenantId,
                  status: params.status,
                  parentId: params.parentId,
              }
            : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any[]>(
        api.organizations.index.list,
        args,
    );

    const items: Organization[] | undefined = raw
        ? raw.map((o: any) => ({
              id: o._id as string,
              tenantId: o.tenantId as string,
              name: o.name,
              slug: o.slug,
              description: o.description,
              type: o.type,
              parentId: o.parentId as string | undefined,
              status: o.status,
              settings: o.settings,
              metadata: o.metadata,
              createdAt: new Date(o._creationTime).toISOString(),
          }))
        : undefined;

    const data = items ? toPaginatedResponse(items) : undefined;

    return { data, isLoading, error };
}

/**
 * Fetch a single organization by ID.
 * Wraps `api.organizations.index.get`.
 */
export function useOrganization(
    id: OrganizationId | string | undefined,
    options?: { enabled?: boolean },
) {
    const enabled = (options?.enabled ?? true) && !!id;
    const args = enabled ? { id: id as OrganizationId } : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any>(
        api.organizations.index.get,
        args,
    );

    const item: Organization | undefined = raw
        ? {
              id: raw._id as string,
              tenantId: raw.tenantId as string,
              name: raw.name,
              slug: raw.slug,
              description: raw.description,
              type: raw.type,
              parentId: raw.parentId as string | undefined,
              status: raw.status,
              settings: raw.settings,
              metadata: raw.metadata,
              parent: raw.parent ?? null,
              children: raw.children
                  ? raw.children.map((c: any) => ({
                        id: c._id as string,
                        tenantId: c.tenantId as string,
                        name: c.name,
                        slug: c.slug,
                        description: c.description,
                        type: c.type,
                        parentId: c.parentId as string | undefined,
                        status: c.status,
                        settings: c.settings,
                        metadata: c.metadata,
                        createdAt: new Date(c._creationTime).toISOString(),
                    }))
                  : [],
              createdAt: new Date(raw._creationTime).toISOString(),
          }
        : undefined;

    const data = item ? toSingleResponse(item) : undefined;

    return { data, isLoading, error };
}

/**
 * Fetch organization members.
 * Stub: no dedicated members query exists yet on the Convex backend.
 * Returns users filtered by organizationId once user list is available.
 */
export function useOrganizationMembers(
    orgId: OrganizationId | string | undefined,
    _params?: { tenantId?: TenantId },
) {
    // No dedicated org-members endpoint — return empty stub
    const data = orgId ? toPaginatedResponse<User>([]) : undefined;
    return {
        data,
        isLoading: false,
        error: null as Error | null,
    };
}

/**
 * Create a new organization.
 * Wraps `api.organizations.index.create`.
 */
export function useCreateOrganization() {
    return useWrappedMutation<CreateOrganizationInput, { id: string }>(
        api.organizations.index.create,
    );
}

/**
 * Update an existing organization.
 * Wraps `api.organizations.index.update`.
 */
export function useUpdateOrganization() {
    return useWrappedMutation<UpdateOrganizationInput, { success: boolean }>(
        api.organizations.index.update,
    );
}

/**
 * Delete (soft-delete) an organization.
 * Wraps `api.organizations.index.remove`.
 */
export function useDeleteOrganization() {
    return useWrappedMutation<{ id: OrganizationId }, { success: boolean }>(
        api.organizations.index.remove,
    );
}

/**
 * Request organization verification.
 * Stub: no verification endpoint exists yet.
 */
export function useVerifyOrganization() {
    return useStubMutation<{ id: OrganizationId }, { success: boolean }>();
}

/**
 * Upload an organization logo.
 * Stub: no file upload mutation exists yet on the Convex backend.
 */
export function useUploadOrganizationLogo() {
    return useStubMutation<
        { id: string; file: File; options?: Record<string, unknown> },
        { url: string }
    >();
}

// ============================================================================
// User Hooks
// ============================================================================

/**
 * Fetch users with optional filtering.
 * Wraps `api.users.index.list`.
 */
export function useUsers(params?: UserQueryParams) {
    const args =
        params?.tenantId
            ? {
                  tenantId: params.tenantId,
                  status: params.status,
                  role: params.role,
                  limit: params.limit,
              }
            : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any[]>(
        api.users.index.list,
        args,
    );

    const items: User[] | undefined = raw
        ? raw.map((u: any) => ({
              id: u._id as string,
              tenantId: u.tenantId as string,
              organizationId: u.organizationId as string | undefined,
              email: u.email,
              name: u.name,
              displayName: u.displayName,
              avatarUrl: u.avatarUrl,
              role: u.role,
              status: u.status,
              metadata: u.metadata,
              createdAt: new Date(u._creationTime).toISOString(),
          }))
        : undefined;

    const data = items ? toPaginatedResponse(items) : undefined;

    return { data, isLoading, error };
}

/**
 * Fetch a single user by ID.
 * Stub: no `users.index.get` query exists yet. Uses `users.index.getByEmail`
 * is not suitable, so returns undefined until a get-by-id query is added.
 */
export function useUser(
    id: UserId | string | undefined,
    options?: { enabled?: boolean },
) {
    const _enabled = (options?.enabled ?? true) && !!id;

    // No get-by-id query on users yet — return stub
    const data: { data: User } | undefined = undefined;
    return {
        data,
        isLoading: false,
        error: null as Error | null,
    };
}

/**
 * Get the currently authenticated user.
 * Wraps `api.users.index.me`.
 * Requires the caller to provide `authUserId` (from the auth session).
 */
export function useCurrentUser(authUserId?: string) {
    const args = authUserId ? { authUserId } : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any>(
        api.users.index.me,
        args,
    );

    const item: User | undefined = raw
        ? {
              id: raw._id as string,
              tenantId: raw.tenantId as string,
              organizationId: raw.organizationId as string | undefined,
              email: raw.email,
              name: raw.name,
              displayName: raw.displayName,
              avatarUrl: raw.avatarUrl,
              role: raw.role,
              status: raw.status,
              metadata: raw.metadata,
              tenant: raw.tenant ?? null,
              organization: raw.organization ?? null,
              createdAt: new Date(raw._creationTime).toISOString(),
          }
        : undefined;

    const data = item ? toSingleResponse(item) : undefined;

    return { data, isLoading, error };
}

/**
 * Create a new user.
 * Wraps `api.users.mutations.create`.
 */
export function useCreateUser() {
    return useWrappedMutation<CreateUserInput, { id: string }>(
        api.users.mutations.create,
    );
}

/**
 * Update an existing user.
 * Wraps `api.users.mutations.update`.
 */
export function useUpdateUser() {
    return useWrappedMutation<UpdateUserInput, { success: boolean }>(
        api.users.mutations.update,
    );
}

/**
 * Update the currently authenticated user.
 * Stub: no dedicated "update me" mutation exists. The caller should use
 * `useUpdateUser` with their own user ID.
 */
export function useUpdateCurrentUser() {
    return useStubMutation<Partial<UpdateUserInput>, { success: boolean }>();
}

/**
 * Deactivate (suspend) a user.
 * Wraps `api.users.mutations.suspend`.
 */
export function useDeactivateUser() {
    return useWrappedMutation<
        { id: UserId; reason?: string },
        { success: boolean }
    >(api.users.mutations.suspend);
}

/**
 * Reactivate a suspended user.
 * Wraps `api.users.mutations.reactivate`.
 */
export function useReactivateUser() {
    return useWrappedMutation<{ id: UserId }, { success: boolean }>(
        api.users.mutations.reactivate,
    );
}

/**
 * Upload a user avatar.
 * Stub: no file upload mutation exists yet on the Convex backend.
 */
export function useUploadUserAvatar() {
    return useStubMutation<
        { id: string; file: File; options?: Record<string, unknown> },
        { url: string }
    >();
}

// ============================================================================
// GDPR Hooks
// ============================================================================

/**
 * Export user data (DSAR).
 * Stub: no data-export endpoint exists yet.
 */
export function useExportData() {
    return useStubMutation<void, { downloadUrl: string }>();
}

/**
 * Delete account (right to erasure).
 * Stub: wraps `api.users.mutations.remove` conceptually but requires
 * additional GDPR workflow that is not yet implemented.
 */
export function useDeleteAccount() {
    return useStubMutation<void, { success: boolean }>();
}

/**
 * Get consent settings for a user.
 * Stub: no consent query exists yet on the Convex backend.
 */
export function useConsents(userId?: string) {
    const data: { data: ConsentSettings } | undefined = undefined;
    return {
        data,
        isLoading: false,
        error: null as Error | null,
    };
}

/**
 * Update consent settings.
 * Stub: no consent mutation exists yet on the Convex backend.
 */
export function useUpdateConsents() {
    return useStubMutation<Partial<ConsentSettings>, { success: boolean }>();
}
