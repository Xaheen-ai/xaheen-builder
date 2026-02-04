/**
 * API Types
 * 
 * Common API request/response types.
 */

// =============================================================================
// Paginated Response
// =============================================================================

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface CursorPaginatedResponse<T> {
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
}

// =============================================================================
// Single Response
// =============================================================================

export interface SingleResponse<T> {
    data: T;
    success: boolean;
}

// =============================================================================
// API Error (RFC 7807)
// =============================================================================

export interface ProblemDetails {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    errors?: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

export interface ApiError extends ProblemDetails {
    timestamp?: string;
    traceId?: string;
}

// =============================================================================
// Query Options
// =============================================================================

export interface QueryOptions {
    page?: number;
    pageSize?: number;
    cursor?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
}

// =============================================================================
// Mutation Response
// =============================================================================

export interface MutationResponse<T = void> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

// =============================================================================
// Batch Operations
// =============================================================================

export interface BatchResult<T> {
    succeeded: T[];
    failed: Array<{ item: T; error: string }>;
    total: number;
    successCount: number;
    failureCount: number;
}

// =============================================================================
// Hook Return Types
// =============================================================================

export interface UseQueryResult<T> {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch?: () => void;
}

export interface UseMutationResult<TData, TVariables> {
    mutate: (variables: TVariables) => Promise<TData>;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
}
