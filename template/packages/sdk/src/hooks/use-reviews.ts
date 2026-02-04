/**
 * Xaheen SDK - Reviews Hooks
 *
 * Stub hooks for review operations. Convex does not have a reviews table yet,
 * so every hook returns inert / empty data. This lets UI components bind to the
 * hooks today and become functional once the backend is wired up.
 *
 * All query hooks return `{ data, isLoading, error }`.
 * All mutation hooks return `{ mutate, mutateAsync, isLoading, error, isSuccess }`.
 */

import { useState } from "react";
import { toPaginatedResponse, toSingleResponse } from "../transforms/common";

// ============================================================================
// Types
// ============================================================================

export interface Review {
    id: string;
    tenantId: string;
    listingId: string;
    userId: string;
    rating: number;
    title?: string;
    body?: string;
    status: ReviewStatus;
    moderatorNotes?: string;
    moderatedBy?: string;
    moderatedAt?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    // Joined
    user?: { id: string; name?: string; avatarUrl?: string };
}

export type ReviewStatus = "pending" | "approved" | "rejected" | "flagged";

export interface ReviewQueryParams {
    tenantId?: string;
    listingId?: string;
    userId?: string;
    status?: ReviewStatus;
    minRating?: number;
    maxRating?: number;
    limit?: number;
    offset?: number;
}

export interface CreateReviewInput {
    tenantId: string;
    listingId: string;
    rating: number;
    title?: string;
    body?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateReviewInput {
    id: string;
    rating?: number;
    title?: string;
    body?: string;
    metadata?: Record<string, unknown>;
}

export interface ModerateReviewInput {
    id: string;
    status: "approved" | "rejected";
    moderatorNotes?: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>; // rating -> count
}

export interface ReviewSummary extends ReviewStats {
    recentReviews: Review[];
}

// ============================================================================
// Inert query key factory (for external cache coordination)
// ============================================================================

export const reviewKeys = {
    all: ["reviews"] as const,
    lists: () => [...reviewKeys.all, "list"] as const,
    list: (params?: ReviewQueryParams) => [...reviewKeys.lists(), params] as const,
    details: () => [...reviewKeys.all, "detail"] as const,
    detail: (id: string) => [...reviewKeys.details(), id] as const,
    byListing: (listingId: string, params?: Omit<ReviewQueryParams, "listingId">) =>
        [...reviewKeys.all, "byListing", listingId, params] as const,
    stats: (listingId: string) => [...reviewKeys.all, "stats", listingId] as const,
    summary: (listingId: string) => [...reviewKeys.all, "summary", listingId] as const,
    my: (params?: ReviewQueryParams) => [...reviewKeys.all, "my", params] as const,
};

// ============================================================================
// Query Hooks (stubs)
// ============================================================================

/**
 * Fetch paginated reviews.
 *
 * Stub: returns empty array until Convex reviews table exists.
 */
export function useReviews(_params?: ReviewQueryParams): {
    data: { data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.reviews.list is available
    return { data: toPaginatedResponse<Review>([]), isLoading: false, error: null };
}

/**
 * Fetch a single review by ID.
 *
 * Stub: returns null until Convex reviews table exists.
 */
export function useReview(
    _id: string | undefined,
    _options?: { enabled?: boolean }
): {
    data: { data: Review } | null;
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.reviews.get is available
    return { data: null, isLoading: false, error: null };
}

/**
 * Fetch reviews for a specific listing.
 *
 * Stub: returns empty array until Convex reviews table exists.
 */
export function useListingReviews(
    _listingId: string | undefined,
    _params?: Omit<ReviewQueryParams, "listingId">,
    _options?: { enabled?: boolean }
): {
    data: { data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.reviews.listByListing is available
    return { data: toPaginatedResponse<Review>([]), isLoading: false, error: null };
}

/**
 * Fetch review statistics for a listing.
 *
 * Stub: returns null until Convex reviews table exists.
 */
export function useReviewStats(
    _listingId: string | undefined,
    _options?: { enabled?: boolean }
): {
    data: { data: ReviewStats } | null;
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.reviews.stats is available
    return { data: null, isLoading: false, error: null };
}

/**
 * Fetch review summary for a listing (stats + recent reviews).
 *
 * Stub: returns null until Convex reviews table exists.
 */
export function useReviewSummary(
    _listingId: string | undefined,
    _options?: { enabled?: boolean }
): {
    data: { data: ReviewSummary } | null;
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.reviews.summary is available
    return { data: null, isLoading: false, error: null };
}

/**
 * Fetch the current user's reviews.
 *
 * Stub: returns empty array until Convex reviews table exists.
 */
export function useMyReviews(_params?: ReviewQueryParams): {
    data: { data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.reviews.listMine is available
    return { data: toPaginatedResponse<Review>([]), isLoading: false, error: null };
}

// ============================================================================
// Mutation Hooks (stubs)
// ============================================================================

/** Stub mutation return shape */
function useStubMutation<TInput, TResult = { success: boolean }>(): {
    mutate: (input: TInput) => void;
    mutateAsync: (input: TInput) => Promise<TResult>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    const [isLoading] = useState(false);
    const [error] = useState<Error | null>(null);
    const [isSuccess] = useState(false);

    const mutateAsync = async (_input: TInput): Promise<TResult> => {
        throw new Error("Reviews backend not yet available. This is a stub hook.");
    };

    const mutate = (_input: TInput) => {
        console.warn("[useReviews] Stub mutation called. Reviews backend not yet available.");
    };

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Create a new review.
 *
 * Stub: throws until Convex reviews table exists.
 */
export function useCreateReview(): {
    mutate: (input: CreateReviewInput) => void;
    mutateAsync: (input: CreateReviewInput) => Promise<{ id: string }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    return useStubMutation<CreateReviewInput, { id: string }>();
}

/**
 * Update an existing review.
 *
 * Stub: throws until Convex reviews table exists.
 */
export function useUpdateReview(): {
    mutate: (input: UpdateReviewInput) => void;
    mutateAsync: (input: UpdateReviewInput) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    return useStubMutation<UpdateReviewInput>();
}

/**
 * Delete a review.
 *
 * Stub: throws until Convex reviews table exists.
 */
export function useDeleteReview(): {
    mutate: (id: string) => void;
    mutateAsync: (id: string) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    return useStubMutation<string>();
}

/**
 * Moderate a review (approve or reject with notes).
 *
 * Stub: throws until Convex reviews table exists.
 */
export function useModerateReview(): {
    mutate: (input: ModerateReviewInput) => void;
    mutateAsync: (input: ModerateReviewInput) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    return useStubMutation<ModerateReviewInput>();
}

/**
 * Approve a review (convenience wrapper around moderate).
 *
 * Stub: throws until Convex reviews table exists.
 */
export function useApproveReview(): {
    mutate: (args: { id: string; moderatorNotes?: string }) => void;
    mutateAsync: (args: { id: string; moderatorNotes?: string }) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    return useStubMutation<{ id: string; moderatorNotes?: string }>();
}

/**
 * Reject a review (convenience wrapper around moderate).
 *
 * Stub: throws until Convex reviews table exists.
 */
export function useRejectReview(): {
    mutate: (args: { id: string; moderatorNotes?: string }) => void;
    mutateAsync: (args: { id: string; moderatorNotes?: string }) => Promise<{ success: boolean }>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
} {
    return useStubMutation<{ id: string; moderatorNotes?: string }>();
}
