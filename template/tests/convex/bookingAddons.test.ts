/**
 * Booking Addon Functions Tests
 *
 * Tests for booking addon management and approval workflows.
 * User Stories: US-8.1, US-8.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Booking Addon Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let bookingId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Booking Addon Test Tenant' });
        bookingId = store.seedBooking({ 
            tenantId, 
            resourceId: 'resource123',
            userId: 'user123',
            status: 'confirmed'
        });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list addons for booking', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'ba1', bookingId, addonId: 'addon1', quantity: 2 },
                        { _id: 'ba2', bookingId, addonId: 'addon2', quantity: 1 },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock addon details
            ctx.db.get
                .mockResolvedValueOnce({ _id: 'addon1', name: 'Cleaning Service', price: 100 })
                .mockResolvedValueOnce({ _id: 'addon2', name: 'Equipment Rental', price: 50 });

            const modules = await import('../../convex/domain/bookingAddons');
            const result = await (modules as any).list(ctx, { bookingId });

            expect(result).toHaveLength(2);
            expect(result[0].addon.name).toBe('Cleaning Service');
            expect(result[0].quantity).toBe(2);
        });
    });

    describe('add', () => {
        it('should add addon to booking', async () => {
            const addonId = 'addon123';
            
            // Mock booking
            ctx.db.get.mockResolvedValueOnce({
                _id: bookingId,
                status: 'confirmed',
                totalPrice: 500,
            });

            // Mock addon
            ctx.db.get.mockResolvedValueOnce({
                _id: addonId,
                name: 'Extra Service',
                price: 75,
            });

            // Check if addon already added
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            ctx.db.insert.mockResolvedValue('ba123');

            const modules = await import('../../convex/domain/bookingAddons');
            const result = await (modules as any).add(ctx, {
                tenantId,
                bookingId,
                addonId,
                quantity: 1,
            });

            expect(result.id).toBe('ba123');
            expect(ctx.db.insert).toHaveBeenCalledWith('bookingAddons', expect.objectContaining({
                bookingId,
                addonId,
                quantity: 1,
                price: 75,
            }));
        });

        it('should prevent adding to cancelled booking', async () => {
            // Mock cancelled booking
            ctx.db.get.mockResolvedValueOnce({
                _id: bookingId,
                status: 'cancelled',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            
            await expect((modules as any).add(ctx, {
                tenantId,
                bookingId,
                addonId: 'addon123',
            })).rejects.toThrow('Cannot add addons to cancelled booking');
        });
    });

    describe('update', () => {
        it('should update booking addon', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'ba123',
                bookingId,
                addonId: 'addon1',
                quantity: 1,
                price: 100,
                status: 'pending',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            await (modules as any).update(ctx, {
                id: 'ba123',
                quantity: 2,
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('ba123', {
                quantity: 2,
            });
        });

        it('should prevent updating approved addon', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'ba123',
                status: 'approved',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            
            await expect((modules as any).update(ctx, {
                id: 'ba123',
                quantity: 2,
            })).rejects.toThrow('Cannot update approved addon');
        });
    });

    describe('remove', () => {
        it('should remove addon from booking', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'ba123',
                bookingId,
                status: 'pending',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            await (modules as any).remove(ctx, { id: 'ba123' });

            expect(ctx.db.delete).toHaveBeenCalledWith('ba123');
        });

        it('should prevent removing approved addon', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'ba123',
                status: 'approved',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            
            await expect((modules as any).remove(ctx, { id: 'ba123' })).rejects.toThrow('Cannot remove approved addon');
        });
    });

    describe('approve', () => {
        it('should approve addon and update booking total', async () => {
            // Mock booking addon
            ctx.db.get.mockResolvedValueOnce({
                _id: 'ba123',
                bookingId,
                addonId: 'addon1',
                quantity: 2,
                price: 50,
                status: 'pending',
            });

            // Mock booking
            ctx.db.get.mockResolvedValueOnce({
                _id: bookingId,
                totalPrice: 500,
                currency: 'NOK',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            await (modules as any).approve(ctx, {
                id: 'ba123',
                approvedBy: 'user123',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('ba123', {
                status: 'approved',
                approvedAt: expect.any(Number),
                approvedBy: 'user123',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith(bookingId, {
                totalPrice: 600, // 500 + (2 * 50)
            });
        });
    });

    describe('reject', () => {
        it('should reject addon with reason', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'ba123',
                status: 'pending',
            });

            const modules = await import('../../convex/domain/bookingAddons');
            await (modules as any).reject(ctx, {
                id: 'ba123',
                rejectedBy: 'user123',
                reason: 'Not available',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('ba123', {
                status: 'rejected',
                rejectedAt: expect.any(Number),
                rejectedBy: 'user123',
                rejectionReason: 'Not available',
            });
        });
    });

    describe('calculateTotal', () => {
        it('should calculate total for booking addons', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'ba1', quantity: 2, price: 50, status: 'approved' },
                            { _id: 'ba2', quantity: 1, price: 75, status: 'approved' },
                            { _id: 'ba3', quantity: 1, price: 25, status: 'pending' }, // Not included
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/bookingAddons');
            const result = await (modules as any).calculateTotal(ctx, { bookingId });

            expect(result.total).toBe(175); // (2 * 50) + (1 * 75)
            expect(result.currency).toBe('NOK');
            expect(result.addons).toHaveLength(2);
        });
    });
});
