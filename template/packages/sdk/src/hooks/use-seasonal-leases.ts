/**
 * Xaheen SDK - Seasonal Lease Hooks (Tier 3)
 *
 * React Query-shaped hooks for seasonal lease operations.
 * Stubs until Convex backend functions are implemented.
 */

import { useState, useCallback } from "react";
import { toPaginatedResponse } from "../transforms/common";

// =============================================================================
// Types
// =============================================================================

export interface SeasonalLeaseQueryParams {
  tenantId?: string;
  seasonId?: string;
  status?: string;
  resourceId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSeasonalLeaseDTO {
  tenantId: string;
  seasonId: string;
  resourceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface SeasonalLease {
  id: string;
  tenantId: string;
  seasonId: string;
  resourceId: string;
  userId: string;
  status: string;
  startDate: string;
  endDate: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const seasonalLeaseKeys = {
  all: ["seasonal-leases"] as const,
  lists: () => [...seasonalLeaseKeys.all, "list"] as const,
  list: (params?: SeasonalLeaseQueryParams) =>
    [...seasonalLeaseKeys.lists(), params] as const,
  details: () => [...seasonalLeaseKeys.all, "detail"] as const,
  detail: (id: string) => [...seasonalLeaseKeys.details(), id] as const,
};

// =============================================================================
// Internal Helpers
// =============================================================================

function useMutationAdapter<TArgs extends unknown[], TResult = void>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutateAsync = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      try {
        const result = await fn(...args);
        setIsSuccess(true);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [fn]
  );

  const mutate = useCallback(
    (...args: TArgs) => {
      mutateAsync(...args).catch(() => {
        /* swallow - error is captured in state */
      });
    },
    [mutateAsync]
  );

  return { mutate, mutateAsync, isLoading, error, isSuccess };
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch seasonal leases with optional filtering (stub).
 */
export function useSeasonalLeases(
  _params?: SeasonalLeaseQueryParams
): { data: { data: SeasonalLease[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<SeasonalLease>([]), isLoading: false, error: null };
}

/**
 * Fetch a single seasonal lease by ID (stub).
 */
export function useSeasonalLease(
  _id: string | undefined
): { data: { data: SeasonalLease } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new seasonal lease (stub).
 */
export function useCreateSeasonalLease() {
  const fn = useCallback(
    async (_data: CreateSeasonalLeaseDTO): Promise<{ id: string }> => {
      throw new Error(
        "useCreateSeasonalLease: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Update an existing seasonal lease (stub).
 */
export function useUpdateSeasonalLease() {
  const fn = useCallback(
    async (_input: {
      id: string;
      data: Partial<CreateSeasonalLeaseDTO>;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useUpdateSeasonalLease: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Approve a seasonal lease (stub).
 */
export function useApproveSeasonalLease() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useApproveSeasonalLease: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Reject a seasonal lease (stub).
 */
export function useRejectSeasonalLease() {
  const fn = useCallback(
    async (_input: {
      id: string;
      reason?: string;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useRejectSeasonalLease: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Cancel a seasonal lease (stub).
 */
export function useCancelSeasonalLease() {
  const fn = useCallback(
    async (_input: {
      id: string;
      reason?: string;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useCancelSeasonalLease: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Delete a seasonal lease (draft only) (stub).
 */
export function useDeleteSeasonalLease() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useDeleteSeasonalLease: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Generate allocations from a seasonal lease (stub).
 */
export function useGenerateAllocations() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean; count: number }> => {
      throw new Error(
        "useGenerateAllocations: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}
