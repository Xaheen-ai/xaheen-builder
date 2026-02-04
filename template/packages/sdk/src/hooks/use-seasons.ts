/**
 * Xaheen SDK - Seasons Hooks
 *
 * Fetch and manage seasons, applications, allocations, and leases
 * using Convex backend. Uses proper Convex React hooks for real-time updates.
 *
 * Convex backend exposes:
 *   api.domain.seasons.list         — list seasons for a tenant
 *   api.domain.seasons.get          — single season with application stats
 *   api.domain.seasons.create       — create draft season
 *   api.domain.seasons.update       — update season fields
 *   api.domain.seasons.remove       — delete season (draft only)
 *   api.domain.seasons.publish      — open season for applications
 *   api.domain.seasons.close        — stop accepting applications
 */

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api, type TenantId } from "../convex-api";
import type { Id } from "../convex-api";
import { useState } from "react";
import { toPaginatedResponse, toSingleResponse } from "../transforms/common";

// ============================================================================
// Types
// ============================================================================

export interface Season {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    startDate: number;
    endDate: number;
    applicationStartDate?: number;
    applicationEndDate?: number;
    status: string;
    type: string;
    isActive: boolean;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    applicationStats?: {
        total: number;
        byStatus: Record<string, number>;
    };
    createdAt: string;
}

export interface SeasonQueryParams {
    tenantId?: TenantId;
    status?: string;
    isActive?: boolean;
}

export interface CreateSeasonInput {
    tenantId: TenantId;
    name: string;
    description?: string;
    startDate: number;
    endDate: number;
    applicationStartDate?: number;
    applicationEndDate?: number;
    type: string;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export interface UpdateSeasonInput {
    id: Id<"seasons">;
    name?: string;
    description?: string;
    startDate?: number;
    endDate?: number;
    applicationStartDate?: number;
    applicationEndDate?: number;
    status?: string;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    isActive?: boolean;
}

// ============================================================================
// Query Key Factory (inert, for external cache coordination)
// ============================================================================

export const seasonKeys = {
    all: ["seasons"] as const,
    lists: () => [...seasonKeys.all, "list"] as const,
    list: (params?: SeasonQueryParams) => [...seasonKeys.lists(), params] as const,
    details: () => [...seasonKeys.all, "detail"] as const,
    detail: (id: string) => [...seasonKeys.details(), id] as const,
    stats: (id: string) => [...seasonKeys.all, "stats", id] as const,
};

// ============================================================================
// Helper: map raw Convex season doc to Season shape
// ============================================================================

function mapSeason(raw: any): Season {
    return {
        id: raw._id as string,
        tenantId: raw.tenantId as string,
        name: raw.name,
        description: raw.description,
        startDate: raw.startDate,
        endDate: raw.endDate,
        applicationStartDate: raw.applicationStartDate,
        applicationEndDate: raw.applicationEndDate,
        status: raw.status,
        type: raw.type,
        isActive: raw.isActive ?? false,
        settings: raw.settings,
        metadata: raw.metadata,
        applicationStats: raw.applicationStats,
        createdAt: new Date(raw._creationTime).toISOString(),
    };
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch seasons for a tenant with optional filtering.
 *
 * Wraps `api.domain.seasons.list`.
 */
export function useSeasons(params: SeasonQueryParams = {}): {
    data: { data: Season[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    const { tenantId, status, isActive } = params;

    const raw = useConvexQuery(
        api.domain.seasons.list,
        tenantId ? { tenantId, status, isActive } : "skip"
    );

    const isLoading = !!tenantId && raw === undefined;

    const items: Season[] = (raw ?? []).map(mapSeason);

    return { data: toPaginatedResponse(items), isLoading, error: null };
}

/**
 * Fetch a single season by ID with application statistics.
 *
 * Wraps `api.domain.seasons.get`.
 */
export function useSeason(
    id: Id<"seasons"> | undefined,
    options?: { enabled?: boolean }
): {
    data: { data: Season } | null;
    isLoading: boolean;
    error: Error | null;
} {
    const enabled = options?.enabled ?? true;
    const shouldQuery = !!id && enabled;

    const raw = useConvexQuery(
        api.domain.seasons.get,
        shouldQuery ? { id: id! } : "skip"
    );

    const isLoading = shouldQuery && raw === undefined;

    const item: Season | null = raw ? mapSeason(raw) : null;
    const data = item ? toSingleResponse(item) : null;

    return { data, isLoading, error: null };
}

/**
 * Fetch season statistics.
 *
 * Stub: Currently the `get` query already returns `applicationStats`.
 * This hook provides a standalone accessor for the stats sub-shape.
 * Returns null until the season loads.
 */
export function useSeasonStats(id: Id<"seasons"> | undefined): {
    data: { data: { total: number; byStatus: Record<string, number> } } | null;
    isLoading: boolean;
    error: Error | null;
} {
    const raw = useConvexQuery(
        api.domain.seasons.get,
        id ? { id } : "skip"
    );

    const isLoading = !!id && raw === undefined;

    const item = raw ? ((raw as any).applicationStats ?? null) : null;
    const data = item ? toSingleResponse(item) : null;

    return { data, isLoading, error: null };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new season (draft status).
 *
 * Wraps `api.domain.seasons.create`.
 */
export function useCreateSeason(): {
    mutate: (input: CreateSeasonInput) => void;
    mutateAsync: (input: CreateSeasonInput) => Promise<{ id: string }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.create);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (input: CreateSeasonInput): Promise<{ id: string }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation(input);
            setIsSuccess(true);
            return { id: result.id as string };
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (input: CreateSeasonInput) => {
        void mutateAsync(input);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Update an existing season.
 *
 * Wraps `api.domain.seasons.update`.
 */
export function useUpdateSeason(): {
    mutate: (input: UpdateSeasonInput) => void;
    mutateAsync: (input: UpdateSeasonInput) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.update);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (input: UpdateSeasonInput): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation(input);
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (input: UpdateSeasonInput) => {
        void mutateAsync(input);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Open a season for applications.
 *
 * Wraps `api.domain.seasons.publish`.
 */
export function useOpenSeason(): {
    mutate: (id: Id<"seasons">) => void;
    mutateAsync: (id: Id<"seasons">) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.publish);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (id: Id<"seasons">): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation({ id });
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (id: Id<"seasons">) => {
        void mutateAsync(id);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Close a season (stop accepting applications).
 *
 * Wraps `api.domain.seasons.close`.
 */
export function useCloseSeason(): {
    mutate: (id: Id<"seasons">) => void;
    mutateAsync: (id: Id<"seasons">) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.close);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (id: Id<"seasons">): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation({ id });
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (id: Id<"seasons">) => {
        void mutateAsync(id);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Activate a season (set isActive = true via update).
 *
 * Uses `api.domain.seasons.update` with `isActive: true`.
 */
export function useActivateSeason(): {
    mutate: (id: Id<"seasons">) => void;
    mutateAsync: (id: Id<"seasons">) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.update);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (id: Id<"seasons">): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation({ id, isActive: true, status: "active" });
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (id: Id<"seasons">) => {
        void mutateAsync(id);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Complete a season (mark as finished via update).
 *
 * Uses `api.domain.seasons.update` with `status: "completed"`.
 */
export function useCompleteSeason(): {
    mutate: (id: Id<"seasons">) => void;
    mutateAsync: (id: Id<"seasons">) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.update);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (id: Id<"seasons">): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation({ id, status: "completed", isActive: false });
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (id: Id<"seasons">) => {
        void mutateAsync(id);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Cancel a season.
 *
 * Uses `api.domain.seasons.update` with `status: "cancelled"`.
 */
export function useCancelSeason(): {
    mutate: (args: { id: Id<"seasons">; reason?: string }) => void;
    mutateAsync: (args: { id: Id<"seasons">; reason?: string }) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.update);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (args: {
        id: Id<"seasons">;
        reason?: string;
    }): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation({
                id: args.id,
                status: "cancelled",
                isActive: false,
                metadata: args.reason ? { cancellationReason: args.reason } : undefined,
            });
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (args: { id: Id<"seasons">; reason?: string }) => {
        void mutateAsync(args);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Delete a season (draft only).
 *
 * Wraps `api.domain.seasons.remove`.
 */
export function useDeleteSeason(): {
    mutate: (id: Id<"seasons">) => void;
    mutateAsync: (id: Id<"seasons">) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const mutation = useConvexMutation(api.domain.seasons.remove);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = async (id: Id<"seasons">): Promise<{ success: boolean }> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const result = await mutation({ id });
            setIsSuccess(true);
            return result;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const mutate = (id: Id<"seasons">) => {
        void mutateAsync(id);
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}
