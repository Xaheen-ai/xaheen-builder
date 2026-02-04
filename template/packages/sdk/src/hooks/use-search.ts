/**
 * Xaheen SDK - Search Hooks (Tier 3)
 *
 * React Query-shaped hooks for global search, typeahead, saved filters,
 * recent searches, and result export.
 * Stubs until Convex backend functions are implemented.
 */

import { useState, useCallback } from "react";
import { toPaginatedResponse } from "../transforms/common";

// =============================================================================
// Types
// =============================================================================

export interface SearchParams {
  query: string;
  tenantId?: string;
  types?: string[];
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface TypeaheadParams {
  query: string;
  tenantId?: string;
  types?: string[];
  limit?: number;
}

export interface SavedFilterQueryParams {
  tenantId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSavedFilterDTO {
  tenantId: string;
  name: string;
  filters: Record<string, unknown>;
  type?: string;
  isDefault?: boolean;
}

export interface UpdateSavedFilterDTO {
  name?: string;
  filters?: Record<string, unknown>;
  type?: string;
  isDefault?: boolean;
}

export interface RecentSearchQueryParams {
  tenantId?: string;
  limit?: number;
}

export interface ExportSearchParams {
  query: string;
  tenantId?: string;
  types?: string[];
  format: "csv" | "xlsx" | "pdf";
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  score: number;
  highlights?: Record<string, string[]>;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number;
}

export interface TypeaheadSuggestion {
  id: string;
  type: string;
  text: string;
  subtitle?: string;
}

export interface SavedFilter {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  filters: Record<string, unknown>;
  type?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  resultCount: number;
  searchedAt: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const searchKeys = {
  all: ["search"] as const,
  results: (params: SearchParams) =>
    [...searchKeys.all, "results", params] as const,
  typeahead: (params: TypeaheadParams) =>
    [...searchKeys.all, "typeahead", params] as const,
  savedFilters: {
    all: () => [...searchKeys.all, "saved-filters"] as const,
    lists: () => [...searchKeys.savedFilters.all(), "list"] as const,
    list: (params?: SavedFilterQueryParams) =>
      [...searchKeys.savedFilters.lists(), params] as const,
    details: () => [...searchKeys.savedFilters.all(), "detail"] as const,
    detail: (id: string) =>
      [...searchKeys.savedFilters.details(), id] as const,
  },
  recent: (params?: RecentSearchQueryParams) =>
    [...searchKeys.all, "recent", params] as const,
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
// Global Search Hooks
// =============================================================================

/**
 * Execute global search across entities (stub).
 */
export function useGlobalSearch(
  _params: SearchParams
): { data: { data: SearchResponse } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Get typeahead suggestions as user types (stub).
 */
export function useTypeahead(
  _params: TypeaheadParams
): {
  data: { data: TypeaheadSuggestion[]; meta: { total: number; page: number; limit: number; totalPages: number } };
  isLoading: boolean;
  error: Error | null;
} {
  return { data: toPaginatedResponse<TypeaheadSuggestion>([]), isLoading: false, error: null };
}

// =============================================================================
// Saved Filter Hooks
// =============================================================================

/**
 * Get user's saved filters (stub).
 */
export function useSavedFilters(
  _params?: SavedFilterQueryParams
): { data: { data: SavedFilter[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<SavedFilter>([]), isLoading: false, error: null };
}

/**
 * Get single saved filter by ID (stub).
 */
export function useSavedFilter(
  _id: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: SavedFilter } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Create new saved filter (stub).
 */
export function useCreateSavedFilter() {
  const fn = useCallback(
    async (_data: CreateSavedFilterDTO): Promise<{ id: string }> => {
      throw new Error(
        "useCreateSavedFilter: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Update existing saved filter (stub).
 */
export function useUpdateSavedFilter() {
  const fn = useCallback(
    async (_input: {
      id: string;
      data: UpdateSavedFilterDTO;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useUpdateSavedFilter: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Delete saved filter (stub).
 */
export function useDeleteSavedFilter() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useDeleteSavedFilter: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

// =============================================================================
// Recent Searches Hooks
// =============================================================================

/**
 * Get user's recent searches (stub).
 */
export function useRecentSearches(
  _params?: RecentSearchQueryParams
): { data: { data: RecentSearch[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<RecentSearch>([]), isLoading: false, error: null };
}

// =============================================================================
// Export Hooks
// =============================================================================

/**
 * Export search results (stub).
 */
export function useExportResults() {
  const fn = useCallback(
    async (_params: ExportSearchParams): Promise<Blob> => {
      throw new Error(
        "useExportResults: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}
