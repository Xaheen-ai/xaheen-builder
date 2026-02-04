/**
 * Booking Types
 * 
 * Booking and reservation types.
 */

import type { 
    TenantId, 
    OrganizationId, 
    ResourceId, 
    UserId, 
    BookingId,
    Timestamps, 
    Currency,
    Metadata 
} from './common';

// =============================================================================
// Booking Status
// =============================================================================

export type BookingStatus = 
    | 'pending'
    | 'confirmed'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'completed'
    | 'no_show';

// =============================================================================
// Booking Types
// =============================================================================

export interface Booking extends Timestamps {
    id: BookingId;
    tenantId: TenantId;
    resourceId: ResourceId;
    userId: UserId;
    organizationId?: OrganizationId;
    status: BookingStatus;
    startTime: number;
    endTime: number;
    totalPrice: number;
    currency: Currency;
    notes?: string;
    metadata?: Metadata;
    version: number;
    submittedAt?: string;
    approvedBy?: UserId;
    approvedAt?: string;
    rejectionReason?: string;
}

// =============================================================================
// Booking Input Types
// =============================================================================

export interface CreateBookingInput {
    resourceId: ResourceId;
    startTime: number;
    endTime: number;
    notes?: string;
    metadata?: Metadata;
}

export interface UpdateBookingInput {
    id: BookingId;
    startTime?: number;
    endTime?: number;
    notes?: string;
    status?: BookingStatus;
}

// =============================================================================
// Booking Query Types
// =============================================================================

export interface BookingQueryParams {
    tenantId?: TenantId;
    resourceId?: ResourceId;
    userId?: UserId;
    organizationId?: OrganizationId;
    status?: BookingStatus | BookingStatus[];
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

// =============================================================================
// Calendar Types
// =============================================================================

export interface CalendarEvent {
    id: string;
    resourceId: ResourceId;
    title: string;
    start: Date;
    end: Date;
    status: BookingStatus;
    type: 'booking' | 'block' | 'allocation';
    color?: string;
    metadata?: Metadata;
}

export interface TimeSlot {
    start: Date;
    end: Date;
    isAvailable: boolean;
    price?: number;
    bookingId?: BookingId;
}

// =============================================================================
// Block Types
// =============================================================================

export interface Block {
    id: string;
    tenantId: TenantId;
    resourceId: ResourceId;
    title: string;
    reason?: string;
    startDate: number;
    endDate: number;
    allDay: boolean;
    recurring: boolean;
    recurrenceRule?: string;
    visibility: BlockVisibility;
    status: BlockStatus;
    createdBy?: UserId;
}

export type BlockVisibility = 'public' | 'private' | 'internal';
export type BlockStatus = 'active' | 'cancelled' | 'expired';
