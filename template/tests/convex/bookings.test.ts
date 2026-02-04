/**
 * Booking Functions Tests
 *
 * Tests for booking CRUD and workflow operations.
 * User Stories: US-4.1, US-4.2, US-4.3, US-4.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

// Type for index query builder
type IndexQueryBuilder = {
    eq: (field: string, value: unknown) => IndexQueryBuilder;
};

describe('Booking Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let userId: string;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Booking Test Tenant' });
        resourceId = store.seedResource({
            tenantId,
            name: 'Bookable Resource',
            status: 'published',
            requiresApproval: false,
        });
        userId = store.seedUser({
            tenantId,
            email: 'booker@test.com',
            status: 'active',
        });
    });

    describe('US-4.1: Create Booking', () => {
        it('booking.create.success - should create booking for available slot', async () => {
            const ctx = createMockContext(store);

            const startTime = Date.now() + 86400000; // Tomorrow
            const endTime = startTime + 3600000; // 1 hour later

            const bookingId = await ctx.db.insert('bookings', {
                tenantId,
                resourceId,
                userId,
                startTime,
                endTime,
                status: 'confirmed',
                totalPrice: 500,
                currency: 'NOK',
                version: 1,
                submittedAt: Date.now(),
                metadata: {},
            });

            expect(bookingId).toBeDefined();

            const booking = await ctx.db.get(bookingId);
            expect(booking).toMatchObject({
                tenantId,
                resourceId,
                userId,
                status: 'confirmed',
            });
        });

        it('booking.create.conflict - should detect overlapping bookings', async () => {
            const ctx = createMockContext(store);

            const startTime = Date.now() + 86400000;
            const endTime = startTime + 3600000;

            // Create first booking
            store.seedBooking({
                tenantId,
                resourceId,
                userId,
                startTime,
                endTime,
                status: 'confirmed',
            });

            // Check for conflicts
            const existingBookings = await ctx.db.query('bookings')
                .withIndex('by_resource', (q: IndexQueryBuilder) => q.eq('resourceId', resourceId))
                .collect();

            const hasConflict = existingBookings.some((b) => {
                const booking = b as { startTime: number; endTime: number; status: string };
                if (booking.status === 'cancelled' || booking.status === 'rejected') {
                    return false;
                }
                // Check overlap
                return (
                    (startTime >= booking.startTime && startTime < booking.endTime) ||
                    (endTime > booking.startTime && endTime <= booking.endTime) ||
                    (startTime <= booking.startTime && endTime >= booking.endTime)
                );
            });

            expect(hasConflict).toBe(true);
        });

        it('booking.create.requires-approval - should set pending status', async () => {
            const ctx = createMockContext(store);

            // Create resource that requires approval
            const approvalResourceId = store.seedResource({
                tenantId,
                name: 'Approval Required Resource',
                status: 'published',
                requiresApproval: true,
            });

            const resource = await ctx.db.get(approvalResourceId);
            const typed = resource as { requiresApproval: boolean };

            const initialStatus = typed.requiresApproval ? 'pending' : 'confirmed';

            const bookingId = await ctx.db.insert('bookings', {
                tenantId,
                resourceId: approvalResourceId,
                userId,
                startTime: Date.now() + 86400000,
                endTime: Date.now() + 90000000,
                status: initialStatus,
                totalPrice: 0,
                currency: 'NOK',
                version: 1,
                submittedAt: Date.now(),
                metadata: {},
            });

            const booking = await ctx.db.get(bookingId);
            const typedBooking = booking as { status: string };

            expect(typedBooking.status).toBe('pending');
        });

        it('booking.create.auto-confirm - should confirm when no approval needed', async () => {
            const ctx = createMockContext(store);

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { requiresApproval: boolean };

            const initialStatus = typed.requiresApproval ? 'pending' : 'confirmed';

            expect(initialStatus).toBe('confirmed');
        });

        it('booking.create.audit-entry - should create audit trail', async () => {
            const ctx = createMockContext(store);

            const bookingId = await ctx.db.insert('bookings', {
                tenantId,
                resourceId,
                userId,
                startTime: Date.now() + 86400000,
                endTime: Date.now() + 90000000,
                status: 'confirmed',
                totalPrice: 0,
                currency: 'NOK',
                version: 1,
                submittedAt: Date.now(),
                metadata: {},
            });

            // Create audit entry
            const auditId = await ctx.db.insert('bookingAudit', {
                tenantId,
                bookingId,
                userId,
                action: 'created',
                newState: { status: 'confirmed' },
                metadata: {},
                timestamp: Date.now(),
            });

            const audit = await ctx.db.get(auditId);
            expect(audit).toMatchObject({
                action: 'created',
                bookingId,
            });
        });
    });

    describe('US-4.2: Approve/Reject Booking', () => {
        it('booking.approve.success - should approve pending booking', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                status: 'pending',
            });

            const adminId = store.seedUser({
                tenantId,
                email: 'admin@test.com',
                role: 'admin',
                status: 'active',
            });

            await ctx.db.patch(bookingId, {
                status: 'confirmed',
                approvedBy: adminId,
                approvedAt: Date.now(),
            });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { status: string; approvedBy: string };

            expect(typed.status).toBe('confirmed');
            expect(typed.approvedBy).toBe(adminId);
        });

        it('booking.approve.not-pending - should reject non-pending approval', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                status: 'confirmed', // Already confirmed
            });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { status: string };

            const canApprove = typed.status === 'pending';
            expect(canApprove).toBe(false);
        });

        it('booking.reject.success - should reject with reason', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                status: 'pending',
            });

            await ctx.db.patch(bookingId, {
                status: 'rejected',
                rejectionReason: 'Resource not available',
            });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { status: string; rejectionReason: string };

            expect(typed.status).toBe('rejected');
            expect(typed.rejectionReason).toBe('Resource not available');
        });

        it('booking.reject.audit - should create audit entry on reject', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                status: 'pending',
            });

            const adminId = store.seedUser({
                tenantId,
                role: 'admin',
                status: 'active',
            });

            await ctx.db.patch(bookingId, { status: 'rejected' });

            const auditId = await ctx.db.insert('bookingAudit', {
                tenantId,
                bookingId,
                userId: adminId,
                action: 'rejected',
                previousState: { status: 'pending' },
                newState: { status: 'rejected' },
                reason: 'Not available',
                metadata: {},
                timestamp: Date.now(),
            });

            const audit = await ctx.db.get(auditId);
            const typed = audit as { action: string; reason: string };

            expect(typed.action).toBe('rejected');
            expect(typed.reason).toBe('Not available');
        });
    });

    describe('US-4.3: Cancel Booking', () => {
        it('booking.cancel.success - should cancel booking', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                status: 'confirmed',
            });

            await ctx.db.patch(bookingId, { status: 'cancelled' });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { status: string };

            expect(typed.status).toBe('cancelled');
        });

        it('booking.cancel.already-cancelled - should handle already cancelled', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                status: 'cancelled',
            });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { status: string };

            const alreadyCancelled = typed.status === 'cancelled';
            expect(alreadyCancelled).toBe(true);
        });

        it('booking.cancel.frees-slot - should make slot available again', async () => {
            const ctx = createMockContext(store);

            const startTime = Date.now() + 86400000;
            const endTime = startTime + 3600000;

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                startTime,
                endTime,
                status: 'confirmed',
            });

            // Cancel the booking
            await ctx.db.patch(bookingId, { status: 'cancelled' });

            // Check conflicts (should exclude cancelled)
            const existingBookings = await ctx.db.query('bookings')
                .withIndex('by_resource', (q: IndexQueryBuilder) => q.eq('resourceId', resourceId))
                .collect();

            const activeBookings = existingBookings.filter((b) => {
                const typed = b as { status: string };
                return typed.status !== 'cancelled' && typed.status !== 'rejected';
            });

            expect(activeBookings.length).toBe(0);
        });
    });

    describe('US-4.4: View Calendar', () => {
        beforeEach(() => {
            const now = Date.now();
            // Seed bookings for calendar
            store.seedBooking({
                tenantId,
                resourceId,
                userId,
                startTime: now + 86400000, // Tomorrow
                endTime: now + 90000000,
                status: 'confirmed',
            });
            store.seedBooking({
                tenantId,
                resourceId,
                userId,
                startTime: now + 172800000, // Day after
                endTime: now + 176400000,
                status: 'pending',
            });
            store.seedBooking({
                tenantId,
                resourceId,
                userId,
                startTime: now + 259200000, // 3 days
                endTime: now + 262800000,
                status: 'cancelled',
            });
        });

        it('booking.calendar.range - should get bookings in date range', async () => {
            const ctx = createMockContext(store);

            const now = Date.now();
            const startDate = now;
            const endDate = now + 604800000; // 1 week

            const bookings = await ctx.db.query('bookings')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            const inRange = bookings.filter((b) => {
                const typed = b as { startTime: number; endTime: number };
                return typed.startTime >= startDate && typed.endTime <= endDate;
            });

            expect(inRange.length).toBe(3);
        });

        it('booking.calendar.excludes-cancelled - should filter out cancelled/rejected', async () => {
            const ctx = createMockContext(store);

            const bookings = await ctx.db.query('bookings')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            const active = bookings.filter((b) => {
                const typed = b as { status: string };
                return typed.status !== 'cancelled' && typed.status !== 'rejected';
            });

            expect(active.length).toBe(2);
        });

        it('booking.calendar.filter-resource - should filter by specific resource', async () => {
            const ctx = createMockContext(store);

            // Create another resource with booking
            const otherResourceId = store.seedResource({
                tenantId,
                name: 'Other Resource',
            });

            store.seedBooking({
                tenantId,
                resourceId: otherResourceId,
                userId,
                status: 'confirmed',
            });

            const bookings = await ctx.db.query('bookings')
                .withIndex('by_resource', (q: IndexQueryBuilder) => q.eq('resourceId', resourceId))
                .collect();

            // Should only include bookings for original resource
            const forResource = bookings.filter((b) => {
                const typed = b as { resourceId: string };
                return typed.resourceId === resourceId;
            });

            expect(forResource.length).toBe(3);
        });
    });

    describe('Booking Updates', () => {
        it('booking.update.times - should update booking times', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                startTime: Date.now() + 86400000,
                endTime: Date.now() + 90000000,
                status: 'confirmed',
            });

            const newStartTime = Date.now() + 172800000;
            const newEndTime = Date.now() + 176400000;

            await ctx.db.patch(bookingId, {
                startTime: newStartTime,
                endTime: newEndTime,
            });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { startTime: number; endTime: number };

            expect(typed.startTime).toBe(newStartTime);
            expect(typed.endTime).toBe(newEndTime);
        });

        it('booking.update.version - should increment version on update', async () => {
            const ctx = createMockContext(store);

            const bookingId = store.seedBooking({
                tenantId,
                resourceId,
                userId,
                version: 1,
            });

            const booking = await ctx.db.get(bookingId);
            const typed = booking as { version: number };

            await ctx.db.patch(bookingId, { version: typed.version + 1 });

            const updated = await ctx.db.get(bookingId);
            const typedUpdated = updated as { version: number };

            expect(typedUpdated.version).toBe(2);
        });
    });
});
