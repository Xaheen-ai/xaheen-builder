/**
 * Xaheen SDK - Season Application Hooks (Tier 3)
 *
 * React Query-shaped hooks for season application operations.
 * Stubs until Convex backend functions are implemented.
 */

import { useState, useCallback } from "react";
import { toPaginatedResponse } from "../transforms/common";

// =============================================================================
// Types
// =============================================================================

export interface SeasonApplicationQueryParams {
  tenantId?: string;
  seasonId?: string;
  status?: string;
  applicantId?: string;
  resourceId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSeasonApplicationDTO {
  tenantId: string;
  seasonId: string;
  resourceId: string;
  applicantId: string;
  preferredDayOfWeek?: number;
  preferredStartTime?: string;
  preferredEndTime?: string;
  alternativeDays?: number[];
  priority?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface AllocateApplicationDTO {
  applicationId: string;
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface FinalizeSeasonAllocationsDTO {
  seasonId: string;
  tenantId: string;
  notify?: boolean;
}

export interface SeasonApplication {
  id: string;
  tenantId: string;
  seasonId: string;
  resourceId: string;
  applicantId: string;
  status: string;
  preferredDayOfWeek?: number;
  preferredStartTime?: string;
  preferredEndTime?: string;
  alternativeDays?: number[];
  priority?: number;
  allocatedDayOfWeek?: number;
  allocatedStartTime?: string;
  allocatedEndTime?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const seasonApplicationKeys = {
  all: ["season-applications"] as const,
  lists: () => [...seasonApplicationKeys.all, "list"] as const,
  list: (params?: SeasonApplicationQueryParams) =>
    [...seasonApplicationKeys.lists(), params] as const,
  details: () => [...seasonApplicationKeys.all, "detail"] as const,
  detail: (id: string) => [...seasonApplicationKeys.details(), id] as const,
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
 * Fetch season applications with optional filtering (stub).
 */
export function useSeasonApplications(
  _params?: SeasonApplicationQueryParams
): { data: { data: SeasonApplication[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<SeasonApplication>([]), isLoading: false, error: null };
}

/**
 * Fetch a single season application by ID (stub).
 */
export function useSeasonApplication(
  _id: string | undefined
): { data: { data: SeasonApplication } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new season application (stub).
 */
export function useCreateSeasonApplication() {
  const fn = useCallback(
    async (_data: CreateSeasonApplicationDTO): Promise<{ id: string }> => {
      throw new Error(
        "useCreateSeasonApplication: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Update an existing season application (stub).
 */
export function useUpdateSeasonApplication() {
  const fn = useCallback(
    async (_input: {
      id: string;
      data: Partial<CreateSeasonApplicationDTO>;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useUpdateSeasonApplication: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Approve a season application (stub).
 */
export function useApproveSeasonApplication() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useApproveSeasonApplication: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Reject a season application (stub).
 */
export function useRejectSeasonApplication() {
  const fn = useCallback(
    async (_input: {
      id: string;
      reason?: string;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useRejectSeasonApplication: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Allocate an approved application to generate recurring bookings (stub).
 */
export function useAllocateApplication() {
  const fn = useCallback(
    async (
      _data: AllocateApplicationDTO
    ): Promise<{ success: boolean; bookingCount: number }> => {
      throw new Error(
        "useAllocateApplication: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Finalize all season allocations, locking in all allocated applications (stub).
 */
export function useFinalizeSeasonAllocations() {
  const fn = useCallback(
    async (
      _data: FinalizeSeasonAllocationsDTO
    ): Promise<{ success: boolean; allocatedCount: number }> => {
      throw new Error(
        "useFinalizeSeasonAllocations: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Delete a season application (draft/pending only) (stub).
 */
export function useDeleteSeasonApplication() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useDeleteSeasonApplication: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}
