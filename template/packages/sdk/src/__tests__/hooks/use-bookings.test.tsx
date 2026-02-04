/**
 * useBookings Hook Tests
 *
 * Tests for the Convex bookings hooks with mocked Convex client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { ConvexProvider } from 'convex/react';
import {
    mockBookings,
    MOCK_TENANT_ID,
    MOCK_RESOURCE_ID,
    MOCK_BOOKING_ID,
    MOCK_USER_ID,
    mockConvexClient,
} from '../mocks/convex';

// Mock convex/react module
vi.mock('convex/react', async () => {
    const actual = await vi.importActual('convex/react');
    return {
        ...actual,
        useQuery: vi.fn(),
        useMutation: vi.fn(),
    };
});

// Import after mocking
import { useQuery, useMutation } from 'convex/react';
import {
    useBookings,
    useCreateBooking,
    useCalendar,
    useApproveBooking,
    useRejectBooking,
    useCancelBooking,
} from '@/hooks/use-bookings';

// Test wrapper with ConvexProvider
const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <ConvexProvider client={mockConvexClient as never}>
            {children}
        </ConvexProvider>
    );
};

describe('useBookings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading state initially', () => {
        vi.mocked(useQuery).mockReturnValue(undefined);

        const { result } = renderHook(
            () => useBookings({ tenantId: MOCK_TENANT_ID }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.bookings).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should return bookings when loaded', () => {
        vi.mocked(useQuery).mockReturnValue(mockBookings);

        const { result } = renderHook(
            () => useBookings({ tenantId: MOCK_TENANT_ID }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.bookings).toHaveLength(2);
    });

    it('should map Convex data to Booking type correctly', () => {
        vi.mocked(useQuery).mockReturnValue(mockBookings);

        const { result } = renderHook(
            () => useBookings({ tenantId: MOCK_TENANT_ID }),
            { wrapper: createWrapper() }
        );

        const booking = result.current.bookings[0];
        expect(booking).toMatchObject({
            id: expect.any(String),
            tenantId: expect.any(String),
            resourceId: expect.any(String),
            userId: expect.any(String),
            status: 'confirmed',
            priceTotal: 500,
            currency: 'NOK',
        });
        expect(booking.startsAt).toBeDefined();
        expect(booking.endsAt).toBeDefined();
        expect(booking.createdAt).toBeDefined();
    });

    it('should filter by resourceId', () => {
        vi.mocked(useQuery).mockReturnValue(mockBookings);

        renderHook(
            () =>
                useBookings({
                    tenantId: MOCK_TENANT_ID,
                    resourceId: MOCK_RESOURCE_ID,
                }),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ resourceId: MOCK_RESOURCE_ID })
        );
    });

    it('should filter by userId', () => {
        vi.mocked(useQuery).mockReturnValue(mockBookings);

        renderHook(
            () =>
                useBookings({
                    tenantId: MOCK_TENANT_ID,
                    userId: MOCK_USER_ID,
                }),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ userId: MOCK_USER_ID })
        );
    });

    it('should filter by status', () => {
        vi.mocked(useQuery).mockReturnValue(mockBookings);

        renderHook(
            () =>
                useBookings({
                    tenantId: MOCK_TENANT_ID,
                    status: 'confirmed',
                }),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ status: 'confirmed' })
        );
    });
});

describe('useCreateBooking', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return createBooking function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ id: 'new-id', status: 'pending' });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useCreateBooking(), {
            wrapper: createWrapper(),
        });

        expect(result.current.createBooking).toBeDefined();
        expect(typeof result.current.createBooking).toBe('function');
    });

    it('should call mutation with booking data', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ id: 'new-booking-id', status: 'confirmed' });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useCreateBooking(), {
            wrapper: createWrapper(),
        });

        const bookingInput = {
            tenantId: MOCK_TENANT_ID,
            resourceId: MOCK_RESOURCE_ID,
            userId: MOCK_USER_ID,
            startTime: Date.now(),
            endTime: Date.now() + 3600000,
            notes: 'Test booking',
        };

        const response = await result.current.createBooking(bookingInput);

        expect(mockMutation).toHaveBeenCalledWith(bookingInput);
        expect(response.id).toBe('new-booking-id');
        expect(response.status).toBe('confirmed');
    });
});

describe('useCalendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading state initially', () => {
        vi.mocked(useQuery).mockReturnValue(undefined);

        const startDate = new Date();
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const { result } = renderHook(
            () => useCalendar(MOCK_TENANT_ID, MOCK_RESOURCE_ID, startDate, endDate),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.bookings).toEqual([]);
        expect(result.current.blocks).toEqual([]);
    });

    it('should return calendar data when loaded', () => {
        vi.mocked(useQuery).mockReturnValue({
            bookings: mockBookings,
            blocks: [],
        });

        const startDate = new Date();
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const { result } = renderHook(
            () => useCalendar(MOCK_TENANT_ID, MOCK_RESOURCE_ID, startDate, endDate),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.bookings).toHaveLength(2);
        expect(result.current.blocks).toEqual([]);
    });

    it('should pass correct date parameters to query', () => {
        vi.mocked(useQuery).mockReturnValue({ bookings: [], blocks: [] });

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        renderHook(
            () => useCalendar(MOCK_TENANT_ID, MOCK_RESOURCE_ID, startDate, endDate),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                tenantId: MOCK_TENANT_ID,
                resourceId: MOCK_RESOURCE_ID,
                startDate: startDate.getTime(),
                endDate: endDate.getTime(),
            })
        );
    });
});

describe('useApproveBooking', () => {
    it('should return approveBooking function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useApproveBooking(), {
            wrapper: createWrapper(),
        });

        expect(result.current.approveBooking).toBeDefined();
    });

    it('should call mutation with booking ID and approver', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useApproveBooking(), {
            wrapper: createWrapper(),
        });

        await result.current.approveBooking(MOCK_BOOKING_ID, MOCK_USER_ID);

        expect(mockMutation).toHaveBeenCalledWith({
            id: MOCK_BOOKING_ID,
            approvedBy: MOCK_USER_ID,
        });
    });
});

describe('useRejectBooking', () => {
    it('should return rejectBooking function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useRejectBooking(), {
            wrapper: createWrapper(),
        });

        expect(result.current.rejectBooking).toBeDefined();
    });

    it('should call mutation with booking ID, rejector, and reason', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useRejectBooking(), {
            wrapper: createWrapper(),
        });

        await result.current.rejectBooking(MOCK_BOOKING_ID, MOCK_USER_ID, 'Room unavailable');

        expect(mockMutation).toHaveBeenCalledWith({
            id: MOCK_BOOKING_ID,
            rejectedBy: MOCK_USER_ID,
            reason: 'Room unavailable',
        });
    });
});

describe('useCancelBooking', () => {
    it('should return cancelBooking function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useCancelBooking(), {
            wrapper: createWrapper(),
        });

        expect(result.current.cancelBooking).toBeDefined();
    });

    it('should call mutation with booking ID, canceller, and reason', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useCancelBooking(), {
            wrapper: createWrapper(),
        });

        await result.current.cancelBooking(MOCK_BOOKING_ID, MOCK_USER_ID, 'Changed plans');

        expect(mockMutation).toHaveBeenCalledWith({
            id: MOCK_BOOKING_ID,
            cancelledBy: MOCK_USER_ID,
            reason: 'Changed plans',
        });
    });
});
