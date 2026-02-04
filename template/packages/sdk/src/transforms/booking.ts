/**
 * Xaheen SDK - Booking Transforms
 *
 * Maps between the Convex "booking" shape (as stored in the database and
 * returned by Convex queries) and the digdir "Booking" shape expected by
 * the client-sdk / UI layer.
 *
 * Convex bookings have:
 *   _id, _creationTime, tenantId, resourceId, userId, organizationId,
 *   status, startTime (epoch), endTime (epoch), totalPrice (number),
 *   currency, notes, metadata, version, submittedAt, approvedBy, approvedAt,
 *   rejectionReason
 *
 * Digdir Bookings expect:
 *   id, tenantId, listingId, userId, organizationId, status, paymentStatus,
 *   startTime (ISO), endTime (ISO), quantity, totalPrice (string),
 *   currency, notes, metadata, createdAt (ISO), updatedAt (ISO),
 *   listingName, userName, userEmail, userPhone, organizationName
 */

import { epochToISO, isoToEpoch } from './common';

// =============================================================================
// Digdir-Compatible Types
// =============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

export interface BookingMetadata {
    attendees?: number;
    equipment?: string[];
    recurring?: boolean;
    frequency?: string;
    weekdays?: number[];
}

export interface Booking {
    id: string;
    tenantId: string;
    /** Digdir uses `listingId`; maps from Convex `resourceId`. */
    listingId: string;
    userId: string;
    organizationId?: string;
    status: BookingStatus;
    paymentStatus?: PaymentStatus;
    startTime: string;
    endTime: string;
    quantity?: number;
    /** Digdir totalPrice is a string (to avoid floating-point display issues). */
    totalPrice: string;
    currency: string;
    notes?: string;
    metadata?: BookingMetadata;
    // Denormalised display fields (populated when available)
    listingName?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    organizationName?: string;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// DTOs
// =============================================================================

export interface CreateBookingDTO {
    listingId: string;
    startTime: string | Date;
    endTime: string | Date;
    userId?: string;
    notes?: string;
    totalPrice?: number;
    metadata?: BookingMetadata;
}

export interface UpdateBookingDTO {
    startTime?: string | Date;
    endTime?: string | Date;
    notes?: string;
    metadata?: BookingMetadata;
}

export interface CancelBookingDTO {
    reason?: string;
}

export interface BookingQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: BookingStatus;
    listingId?: string;
    userId?: string;
    organizationId?: string;
    from?: string;
    to?: string;
}

// =============================================================================
// Convex Raw Shape
// =============================================================================

/** Minimal shape of a Convex booking document as returned by a query. */
export interface ConvexBooking {
    _id: string;
    _creationTime: number;
    tenantId: string;
    resourceId: string;
    userId: string;
    organizationId?: string;
    status: string;
    startTime: number;
    endTime: number;
    totalPrice: number;
    currency: string;
    notes?: string;
    metadata?: Record<string, unknown>;
    version?: number;
    submittedAt?: number;
    approvedBy?: string;
    approvedAt?: number;
    rejectionReason?: string;
    /** Optional updatedAt epoch (set by the mutation if available). */
    updatedAt?: number;
    // Optional joined / denormalised fields that some queries populate:
    resourceName?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    organizationName?: string;
}

// =============================================================================
// Status Mapping
// =============================================================================

/**
 * Maps Convex booking statuses to the digdir BookingStatus set.
 * Convex allows: pending | confirmed | checked_in | completed | cancelled | no_show
 * Digdir allows: pending | confirmed | cancelled | completed
 */
function statusToBookingStatus(status: string): BookingStatus {
    switch (status) {
        case 'pending':
            return 'pending';
        case 'confirmed':
        case 'checked_in':
            return 'confirmed';
        case 'completed':
        case 'no_show':
            return 'completed';
        case 'cancelled':
            return 'cancelled';
        default:
            return 'pending';
    }
}

// =============================================================================
// Convex Booking -> Digdir Booking
// =============================================================================

/**
 * Transform a raw Convex booking document into the digdir `Booking` shape.
 *
 * - `_id` -> `id`
 * - `resourceId` -> `listingId`
 * - Epoch timestamps (`startTime`, `endTime`, `_creationTime`) -> ISO strings
 * - `totalPrice` (number) -> string representation
 * - Status values are narrowed to the digdir enum
 */
export function convexBookingToBooking(booking: ConvexBooking): Booking {
    const createdAt = new Date(booking._creationTime).toISOString();
    const updatedAt = booking.updatedAt
        ? new Date(booking.updatedAt).toISOString()
        : createdAt;

    return {
        id: booking._id,
        tenantId: booking.tenantId,
        listingId: booking.resourceId,
        userId: booking.userId,
        organizationId: booking.organizationId,
        status: statusToBookingStatus(booking.status),
        startTime: new Date(booking.startTime).toISOString(),
        endTime: new Date(booking.endTime).toISOString(),
        totalPrice: String(booking.totalPrice ?? 0),
        currency: booking.currency ?? 'NOK',
        notes: booking.notes,
        metadata: booking.metadata as BookingMetadata | undefined,
        // Denormalised fields (may be undefined)
        listingName: booking.resourceName,
        userName: booking.userName,
        userEmail: booking.userEmail,
        userPhone: booking.userPhone,
        organizationName: booking.organizationName,
        createdAt,
        updatedAt,
    };
}

// =============================================================================
// CreateBookingDTO -> Convex Create Args
// =============================================================================

/**
 * Transform a `CreateBookingDTO` (digdir shape) into the arguments expected
 * by the Convex `domain.bookings.create` mutation.
 *
 * The caller is responsible for supplying `tenantId` and `userId` when they
 * are not included in the DTO (e.g., derived from the auth context).
 */
export function bookingInputToConvex(input: CreateBookingDTO): {
    resourceId: string;
    startTime: number;
    endTime: number;
    notes?: string;
    totalPrice?: number;
    metadata?: Record<string, unknown>;
} {
    return {
        resourceId: input.listingId,
        startTime: isoToEpoch(input.startTime) ?? 0,
        endTime: isoToEpoch(input.endTime) ?? 0,
        notes: input.notes,
        totalPrice: input.totalPrice,
        metadata: input.metadata as Record<string, unknown> | undefined,
    };
}

/**
 * Transform an `UpdateBookingDTO` (digdir shape) into partial Convex args.
 */
export function bookingUpdateToConvex(input: UpdateBookingDTO): {
    startTime?: number;
    endTime?: number;
    notes?: string;
    metadata?: Record<string, unknown>;
} {
    const result: {
        startTime?: number;
        endTime?: number;
        notes?: string;
        metadata?: Record<string, unknown>;
    } = {};

    if (input.startTime != null) result.startTime = isoToEpoch(input.startTime);
    if (input.endTime != null) result.endTime = isoToEpoch(input.endTime);
    if (input.notes !== undefined) result.notes = input.notes;
    if (input.metadata !== undefined) result.metadata = input.metadata as Record<string, unknown>;

    return result;
}
