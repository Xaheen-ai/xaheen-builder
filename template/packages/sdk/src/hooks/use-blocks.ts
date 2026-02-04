/**
 * Xaheen SDK - Block Hooks (Tier 2 Adapter)
 *
 * React hooks for calendar block operations.
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
import { api, type TenantId, type ResourceId } from "../convex-api";
import type { Id } from "../convex-api";
import { useState } from "react";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BlockId = Id<"blocks">;

export interface Block {
    id: string;
    tenantId: string;
    resourceId: string;
    title: string;
    reason?: string;
    startDate: number;
    endDate: number;
    allDay: boolean;
    recurring: boolean;
    recurrenceRule?: string;
    visibility: string;
    status: string;
    createdBy?: string;
    resource?: Record<string, unknown> | null;
    createdAt: string;
}

export interface BlockListParams {
    tenantId?: TenantId;
    resourceId?: ResourceId;
    status?: string;
    startDate?: number;
    endDate?: number;
}

export interface CreateBlockInput {
    tenantId: TenantId;
    resourceId: ResourceId;
    title: string;
    reason?: string;
    startDate: number;
    endDate: number;
    allDay?: boolean;
    recurring?: boolean;
    recurrenceRule?: string;
    visibility?: string;
    createdBy?: Id<"users">;
}

export interface UpdateBlockInput {
    id: BlockId;
    title?: string;
    reason?: string;
    startDate?: number;
    endDate?: number;
    allDay?: boolean;
    recurring?: boolean;
    recurrenceRule?: string;
    visibility?: string;
    status?: string;
}

export interface ConflictCheckParams {
    resourceId: ResourceId;
    startTime: number;
    endTime: number;
    excludeBlockId?: string;
}

export interface ConflictsResponse {
    hasConflicts: boolean;
    conflicts: {
        blocks: Array<{ id: string; title: string; startDate: number; endDate: number }>;
        bookings: Array<{ id: string; startTime: number; endTime: number; status: string }>;
    };
}

// ---------------------------------------------------------------------------
// Query key factory (inert — for React Query cache-key compat)
// ---------------------------------------------------------------------------

export const blockKeys = {
    all: ["blocks"] as const,
    lists: () => [...blockKeys.all, "list"] as const,
    list: (params?: BlockListParams) => [...blockKeys.lists(), params] as const,
    details: () => [...blockKeys.all, "detail"] as const,
    detail: (id: string) => [...blockKeys.details(), id] as const,
    conflicts: (params: ConflictCheckParams) =>
        [...blockKeys.all, "conflicts", params] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch blocks with optional filtering.
 * Wraps `api.domain.blocks.list`.
 */
export function useBlocks(params?: BlockListParams) {
    const args =
        params?.tenantId
            ? {
                  tenantId: params.tenantId,
                  resourceId: params.resourceId,
                  status: params.status,
                  startDate: params.startDate,
                  endDate: params.endDate,
              }
            : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any[]>(
        api.domain.blocks.list,
        args,
    );

    const items: Block[] | undefined = raw
        ? raw.map((b: any) => ({
              id: b._id as string,
              tenantId: b.tenantId as string,
              resourceId: b.resourceId as string,
              title: b.title,
              reason: b.reason,
              startDate: b.startDate,
              endDate: b.endDate,
              allDay: b.allDay ?? true,
              recurring: b.recurring ?? false,
              recurrenceRule: b.recurrenceRule,
              visibility: b.visibility ?? "public",
              status: b.status,
              createdBy: b.createdBy as string | undefined,
              createdAt: new Date(b._creationTime).toISOString(),
          }))
        : undefined;

    const data = items ? toPaginatedResponse(items) : undefined;

    return { data, isLoading, error };
}

/**
 * Fetch a single block by ID.
 * Wraps `api.domain.blocks.get`.
 */
export function useBlock(
    id: BlockId | string | undefined,
    options?: { enabled?: boolean },
) {
    const enabled = (options?.enabled ?? true) && !!id;
    const args = enabled ? { id: id as BlockId } : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any>(
        api.domain.blocks.get,
        args,
    );

    const item: Block | undefined = raw
        ? {
              id: raw._id as string,
              tenantId: raw.tenantId as string,
              resourceId: raw.resourceId as string,
              title: raw.title,
              reason: raw.reason,
              startDate: raw.startDate,
              endDate: raw.endDate,
              allDay: raw.allDay ?? true,
              recurring: raw.recurring ?? false,
              recurrenceRule: raw.recurrenceRule,
              visibility: raw.visibility ?? "public",
              status: raw.status,
              createdBy: raw.createdBy as string | undefined,
              resource: raw.resource ?? null,
              createdAt: new Date(raw._creationTime).toISOString(),
          }
        : undefined;

    const data = item ? toSingleResponse(item) : undefined;

    return { data, isLoading, error };
}

/**
 * Check for scheduling conflicts.
 * Wraps `api.domain.blocks.checkAvailability`.
 */
export function useCheckConflicts(
    params: ConflictCheckParams | undefined,
    options?: { enabled?: boolean },
) {
    const isEnabled =
        (options?.enabled ?? true) &&
        !!params?.resourceId &&
        !!params?.startTime &&
        !!params?.endTime;

    const args = isEnabled
        ? {
              resourceId: params!.resourceId,
              startTime: params!.startTime,
              endTime: params!.endTime,
          }
        : "skip";

    const { data: raw, isLoading, error } = useWrappedQuery<any>(
        api.domain.blocks.checkAvailability,
        args,
    );

    const item: ConflictsResponse | undefined = raw
        ? {
              hasConflicts: !raw.isAvailable,
              conflicts: raw.conflicts,
          }
        : undefined;

    const data = item ? toSingleResponse(item) : undefined;

    return { data, isLoading, error };
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Create a new block.
 * Wraps `api.domain.blocks.create`.
 */
export function useCreateBlock() {
    return useWrappedMutation<CreateBlockInput, { id: string }>(
        api.domain.blocks.create,
    );
}

/**
 * Update an existing block.
 * Wraps `api.domain.blocks.update`.
 */
export function useUpdateBlock() {
    return useWrappedMutation<UpdateBlockInput, { success: boolean }>(
        api.domain.blocks.update,
    );
}

/**
 * Delete a block.
 * Wraps `api.domain.blocks.remove`.
 */
export function useDeleteBlock() {
    return useWrappedMutation<{ id: BlockId }, { success: boolean }>(
        api.domain.blocks.remove,
    );
}
