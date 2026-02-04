/**
 * Xaheen SDK - Bookings Hooks
 *
 * Fetch and manage bookings using Convex backend.
 * Uses proper Convex React hooks for real-time updates.
 */

import { useQuery, useMutation } from "convex/react";
import { api, type TenantId, type ResourceId, type UserId, type BookingId } from "../convex-api";
import type { Booking, BookingStatus } from "../types";
import { toPaginatedResponse, toSingleResponse } from "../transforms/common";
import { useResolveTenantId } from "./use-tenant-id";

interface UseBookingsOptions {
    tenantId?: TenantId;
    resourceId?: ResourceId;
    userId?: UserId;
    status?: string;
    limit?: number;
}

interface UseBookingsResult {
    bookings: Booking[];
    data: { data: Booking[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
}

interface CreateBookingInput {
    tenantId: TenantId;
    resourceId: ResourceId;
    userId: UserId;
    startTime: number;
    endTime: number;
    notes?: string;
}

/**
 * Fetch bookings from Convex with real-time updates
 */
export function useBookings(
    options: UseBookingsOptions = {}
): UseBookingsResult {
    const { tenantId: explicitTenantId, resourceId, userId, status, limit } = options;
    const tenantId = useResolveTenantId(explicitTenantId);

    // Skip query if tenantId is not available (not logged in or no tenant)
    const data = useQuery(
        api.domain.bookings.list,
        tenantId ? { tenantId, resourceId, userId, status, limit } : "skip"
    );

    const isLoading = tenantId !== undefined && data === undefined;
    const error = null;

    const items: Booking[] = (data ?? []).map((b) => {
        const startsAt = new Date(b.startTime).toISOString();
        const endsAt = new Date(b.endTime).toISOString();
        const price = b.totalPrice ?? 0;
        return {
            id: b._id as string,
            tenantId: b.tenantId as string,
            resourceId: b.resourceId as string,
            userId: b.userId as string,
            startsAt,
            endsAt,
            status: b.status as BookingStatus,
            quantity: 1,
            priceTotal: price,
            currency: b.currency ?? "NOK",
            notes: b.notes,
            metadata: b.metadata,
            createdAt: new Date(b._creationTime).toISOString(),
            updatedAt: new Date(b._creationTime).toISOString(),
            // Digdir-compatible aliases
            listingId: b.resourceId as string,
            startTime: startsAt,
            endTime: endsAt,
            totalPrice: String(price),
        };
    });

    return {
        bookings: items,
        data: toPaginatedResponse(items),
        isLoading,
        error,
    };
}

/**
 * Create a new booking
 */
export function useCreateBooking(): {
    createBooking: (input: CreateBookingInput) => Promise<{ id: string; status: string }>;
    isLoading: boolean;
} {
    const mutation = useMutation(api.domain.bookings.create);

    const createBooking = async (input: CreateBookingInput): Promise<{ id: string; status: string }> => {
        const result = await mutation(input);
        return { id: result.id as string, status: result.status };
    };

    return { createBooking, isLoading: false };
}

/**
 * Calendar view - get bookings for a date range with real-time updates
 */
export function useCalendar(
    tenantId: TenantId,
    resourceId: ResourceId | undefined,
    startDate: Date,
    endDate: Date
): {
    bookings: Booking[];
    blocks: unknown[];
    isLoading: boolean;
    error: Error | null;
} {
    const data = useQuery(
        api.domain.bookings.calendar,
        {
            tenantId,
            resourceId,
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
        }
    );

    const isLoading = data === undefined;
    const error = null;

    const bookings: Booking[] = (data?.bookings ?? []).map((b) => {
        const startsAt = new Date(b.startTime).toISOString();
        const endsAt = new Date(b.endTime).toISOString();
        const price = b.totalPrice ?? 0;
        return {
            id: b._id as string,
            tenantId: b.tenantId as string,
            resourceId: b.resourceId as string,
            userId: b.userId as string,
            startsAt,
            endsAt,
            status: b.status as BookingStatus,
            quantity: 1,
            priceTotal: price,
            currency: b.currency ?? "NOK",
            notes: b.notes,
            createdAt: new Date(b._creationTime).toISOString(),
            updatedAt: new Date(b._creationTime).toISOString(),
            // Digdir-compatible aliases
            listingId: b.resourceId as string,
            startTime: startsAt,
            endTime: endsAt,
            totalPrice: String(price),
        };
    });

    return { bookings, blocks: data?.blocks ?? [], isLoading, error };
}

/**
 * Approve a booking
 */
export function useApproveBooking(): {
    approveBooking: (id: BookingId, approvedBy: UserId) => Promise<{ success: boolean }>;
} {
    const mutation = useMutation(api.domain.bookings.approve);
    return {
        approveBooking: (id: BookingId, approvedBy: UserId) => mutation({ id, approvedBy }),
    };
}

/**
 * Reject a booking
 */
export function useRejectBooking(): {
    rejectBooking: (id: BookingId, rejectedBy: UserId, reason?: string) => Promise<{ success: boolean }>;
} {
    const mutation = useMutation(api.domain.bookings.reject);
    return {
        rejectBooking: (id: BookingId, rejectedBy: UserId, reason?: string) => mutation({ id, rejectedBy, reason }),
    };
}

/**
 * Cancel a booking
 */
export function useCancelBooking(): {
    cancelBooking: (id: BookingId, cancelledBy: UserId, reason?: string) => Promise<{ success: boolean }>;
} {
    const mutation = useMutation(api.domain.bookings.cancel);
    return {
        cancelBooking: (id: BookingId, cancelledBy: UserId, reason?: string) => mutation({ id, cancelledBy, reason }),
    };
}

// ============================================================================
// Tier 1 Adapter Hooks — digdir-compatible API surface
// ============================================================================

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Map a raw Convex booking document to the SDK Booking shape. */
function mapBooking(b: Record<string, unknown>): Booking {
    const startsAt = new Date(b.startTime as number).toISOString();
    const endsAt = new Date(b.endTime as number).toISOString();
    const price = (b.totalPrice as number) ?? 0;
    return {
        id: (b._id ?? b.id) as string,
        tenantId: b.tenantId as string,
        resourceId: b.resourceId as string,
        userId: b.userId as string,
        startsAt,
        endsAt,
        status: b.status as BookingStatus,
        quantity: 1,
        priceTotal: price,
        currency: (b.currency as string) ?? "NOK",
        notes: b.notes as string | undefined,
        metadata: b.metadata as Record<string, unknown> | undefined,
        createdAt: new Date((b._creationTime as number) ?? Date.now()).toISOString(),
        updatedAt: new Date((b._creationTime as number) ?? Date.now()).toISOString(),
        // Digdir-compatible aliases
        listingId: b.resourceId as string,
        startTime: startsAt,
        endTime: endsAt,
        totalPrice: String(price),
        listingName: b.resourceName as string | undefined,
        userName: b.userName as string | undefined,
        userEmail: b.userEmail as string | undefined,
        userPhone: b.userPhone as string | undefined,
        organizationName: b.organizationName as string | undefined,
    };
}

/** Build a mutation-shaped return value from an async function. */
function useBookingMutationAdapter<TArgs extends unknown[], TResult = void>(
    fn: (...args: TArgs) => Promise<TResult>
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = useCallback(async (...args: TArgs): Promise<TResult> => {
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
    }, [fn]);

    const mutate = useCallback((...args: TArgs) => {
        mutateAsync(...args).catch(() => { /* swallow — error is captured in state */ });
    }, [mutateAsync]);

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

// ---------------------------------------------------------------------------
// Query adapters
// ---------------------------------------------------------------------------

/**
 * Get a single booking by ID.
 */
export function useBooking(
    id: BookingId | undefined,
    options?: { enabled?: boolean }
): { data: { data: Booking } | null; isLoading: boolean; error: Error | null } {
    const enabled = !!id && (options?.enabled ?? true);
    const raw = useQuery(api.domain.bookings.get, enabled && id ? { id } : "skip");

    const item = raw ? mapBooking(raw as unknown as Record<string, unknown>) : null;
    return {
        data: item ? toSingleResponse(item) : null,
        isLoading: enabled && raw === undefined,
        error: null,
    };
}

/**
 * Get bookings for the current user.
 */
export function useMyBookings(
    params?: { tenantId?: TenantId; userId?: UserId; status?: string; limit?: number }
): { data: { data: Booking[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
    const { tenantId: explicitTenantId, userId, status, limit } = params ?? {};
    const tenantId = useResolveTenantId(explicitTenantId);
    const raw = useQuery(
        api.domain.bookings.list,
        tenantId ? { tenantId, userId, status, limit } : "skip"
    );
    const isLoading = tenantId !== undefined && raw === undefined;
    const items = (raw ?? []).map((b) => mapBooking(b as unknown as Record<string, unknown>));
    return {
        data: toPaginatedResponse(items),
        isLoading,
        error: null,
    };
}

/**
 * Get recurring bookings (stub).
 */
export function useRecurringBookings(
    _params?: { tenantId?: TenantId }
): { data: { data: Booking[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
    // Recurring bookings are not yet modelled in the Convex schema.
    return { data: toPaginatedResponse<Booking>([]), isLoading: false, error: null };
}

/**
 * Calculate booking pricing (stub).
 */
export function useBookingPricing(
    _id: string | undefined,
    _start: string | undefined,
    _end: string | undefined
): { data: { data: { totalPrice: number; currency: string } } | null; isLoading: boolean; error: Error | null } {
    // Pricing calculation is not yet exposed as a standalone Convex query.
    return { data: null, isLoading: false, error: null };
}

// ---------------------------------------------------------------------------
// Mutation adapters
// ---------------------------------------------------------------------------

/**
 * Update booking mutation adapter.
 */
export function useUpdateBooking() {
    // The Convex API does not yet expose a generic "update" mutation for bookings.
    // Stub until the backend mutation is available.
    const fn = useCallback(
        async (_input: { id: BookingId; data: Record<string, unknown> }): Promise<{ success: boolean }> => {
            throw new Error("useUpdateBooking: not yet implemented in Convex backend");
        },
        []
    );
    return useBookingMutationAdapter(fn);
}

/**
 * Confirm / approve booking mutation adapter.
 * Wraps the existing `approve` mutation to match the digdir `useConfirmBooking` API.
 */
export function useConfirmBooking() {
    const approveMutation = useMutation(api.domain.bookings.approve);
    const fn = useCallback(
        async (input: { id: BookingId; approvedBy: UserId }) => {
            return approveMutation({ id: input.id, approvedBy: input.approvedBy });
        },
        [approveMutation]
    );
    return useBookingMutationAdapter(fn);
}

/**
 * Complete booking mutation adapter (stub).
 */
export function useCompleteBooking() {
    const fn = useCallback(
        async (_id: BookingId): Promise<{ success: boolean }> => {
            throw new Error("useCompleteBooking: not yet implemented in Convex backend");
        },
        []
    );
    return useBookingMutationAdapter(fn);
}

/**
 * Delete booking mutation adapter (stub).
 */
export function useDeleteBooking() {
    const fn = useCallback(
        async (_id: BookingId): Promise<{ success: boolean }> => {
            throw new Error("useDeleteBooking: not yet implemented in Convex backend");
        },
        []
    );
    return useBookingMutationAdapter(fn);
}

// ---------------------------------------------------------------------------
// Calendar adapters
// ---------------------------------------------------------------------------

/** Calendar event shape matching the digdir CalendarEvent type. */
export interface CalendarEvent {
    id: string;
    listingId: string;
    listingName?: string;
    title?: string;
    start: string;
    end: string;
    startTime?: string;
    endTime?: string;
    status: string;
    bookingId?: string;
    userName?: string;
    color?: string;
}

/**
 * Get calendar events.
 * Wraps `api.domain.bookings.calendar` and transforms to the CalendarEvent shape.
 */
export function useCalendarEvents(
    params: { tenantId: TenantId; resourceId?: ResourceId; startDate: Date; endDate: Date }
): { data: { data: CalendarEvent[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
    const raw = useQuery(api.domain.bookings.calendar, {
        tenantId: params.tenantId,
        resourceId: params.resourceId,
        startDate: params.startDate.getTime(),
        endDate: params.endDate.getTime(),
    });

    const isLoading = raw === undefined;

    const events: CalendarEvent[] = (raw?.bookings ?? []).map((b) => ({
        id: (b as unknown as Record<string, unknown>)._id as string,
        listingId: b.resourceId as string,
        title: `Booking`,
        start: new Date(b.startTime).toISOString(),
        end: new Date(b.endTime).toISOString(),
        startTime: new Date(b.startTime).toISOString(),
        endTime: new Date(b.endTime).toISOString(),
        status: b.status,
        bookingId: (b as unknown as Record<string, unknown>)._id as string,
    }));

    return { data: toPaginatedResponse(events), isLoading, error: null };
}

/**
 * Get availability slots (stub).
 */
export function useAvailabilitySlots(
    _params: { listingId?: string; date?: string; duration?: number }
): { data: { data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
    return { data: toPaginatedResponse<unknown>([]), isLoading: false, error: null };
}

// ---------------------------------------------------------------------------
// Allocation adapters (stubs)
// ---------------------------------------------------------------------------

/**
 * Get allocations (stub).
 */
export function useAllocations(
    _params?: { listingId?: string; startDate?: string; endDate?: string }
): { data: { data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
    return { data: toPaginatedResponse<unknown>([]), isLoading: false, error: null };
}

/**
 * Create allocation mutation (stub).
 */
export function useCreateAllocation() {
    const fn = useCallback(
        async (_data: Record<string, unknown>): Promise<{ success: boolean }> => {
            throw new Error("useCreateAllocation: not yet implemented in Convex backend");
        },
        []
    );
    return useBookingMutationAdapter(fn);
}

/**
 * Delete allocation mutation (stub).
 */
export function useDeleteAllocation() {
    const fn = useCallback(
        async (_id: string): Promise<{ success: boolean }> => {
            throw new Error("useDeleteAllocation: not yet implemented in Convex backend");
        },
        []
    );
    return useBookingMutationAdapter(fn);
}

// ---------------------------------------------------------------------------
// Payment adapters (stubs)
// ---------------------------------------------------------------------------

/**
 * Get payment history for a booking (stub).
 */
export function usePaymentHistory(
    _bookingId?: string
): { data: { data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
    return { data: toPaginatedResponse<unknown>([]), isLoading: false, error: null };
}

/**
 * Get payment reconciliation report (stub).
 */
export function usePaymentReconciliation(
    _params?: { startDate?: string; endDate?: string; status?: string; provider?: string }
): { data: { data: unknown } | null; isLoading: boolean; error: Error | null } {
    return { data: null, isLoading: false, error: null };
}
