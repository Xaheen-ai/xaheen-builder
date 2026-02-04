/**
 * Notification Functions Tests
 *
 * Tests for notification management using conversations table.
 * User Stories: US-11.1, US-11.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Notification Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Notification Test Tenant' });
        userId = store.seedUser({ 
            tenantId, 
            name: 'Test User',
            email: 'test@example.com'
        });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list notifications for user', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'conv1',
                                type: 'notification',
                                title: 'Booking Confirmed',
                                body: 'Your booking has been confirmed',
                                metadata: { bookingId: 'booking123' },
                                readAt: null,
                            },
                            {
                                _id: 'conv2',
                                type: 'notification',
                                title: 'Booking Reminder',
                                body: 'Your booking is tomorrow',
                                metadata: { bookingId: 'booking456' },
                                readAt: Date.now() - 3600000, // Read 1 hour ago
                            },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/notifications/index');
            const result = await (modules as any).list(ctx, { userId });

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Booking Confirmed');
            expect(result[0].readAt).toBeNull(); // Unread
            expect(result[1].readAt).toBeDefined(); // Read
        });

        it('should filter by unread status', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'conv1',
                                type: 'notification',
                                title: 'New Notification',
                                readAt: null,
                            },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/notifications/index');
            const result = await (modules as any).list(ctx, { userId, unreadOnly: true });

            expect(result).toHaveLength(1);
            expect(result[0].readAt).toBeNull();
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread notification count', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'conv1', readAt: null },
                            { _id: 'conv2', readAt: null },
                            { _id: 'conv3', readAt: Date.now() }, // Read
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/notifications/index');
            const result = await (modules as any).getUnreadCount(ctx, { userId });

            expect(result.count).toBe(2);
        });

        it('should return 0 when no notifications', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/notifications/index');
            const result = await (modules as any).getUnreadCount(ctx, { userId });

            expect(result.count).toBe(0);
        });
    });

    describe('create', () => {
        it('should create notification', async () => {
            ctx.db.insert.mockResolvedValue('conv123');

            const modules = await import('../../convex/notifications/index');
            const result = await (modules as any).create(ctx, {
                tenantId,
                userId,
                type: 'booking_confirmed',
                title: 'Booking Confirmed',
                body: 'Your booking has been confirmed',
                metadata: { bookingId: 'booking123' },
            });

            expect(result.id).toBe('conv123');
            expect(ctx.db.insert).toHaveBeenCalledWith('conversations', expect.objectContaining({
                tenantId,
                type: 'notification',
                title: 'Booking Confirmed',
                body: 'Your booking has been confirmed',
                metadata: { bookingId: 'booking123' },
            }));
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'conv123',
                type: 'notification',
                readAt: null,
            });

            const modules = await import('../../convex/notifications/index');
            await (modules as any).markAsRead(ctx, { id: 'conv123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('conv123', {
                readAt: expect.any(Number),
            });
        });

        it('should throw if notification not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/notifications/index');
            
            await expect((modules as any).markAsRead(ctx, { id: 'nonexistent' })).rejects.toThrow('Notification not found');
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read for user', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'conv1', readAt: null },
                            { _id: 'conv2', readAt: null },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/notifications/index');
            await (modules as any).markAllAsRead(ctx, { userId });

            expect(ctx.db.patch).toHaveBeenCalledWith('conv1', {
                readAt: expect.any(Number),
            });
            expect(ctx.db.patch).toHaveBeenCalledWith('conv2', {
                readAt: expect.any(Number),
            });
        });
    });

    describe('remove', () => {
        it('should delete notification', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'conv123',
                type: 'notification',
            });

            const modules = await import('../../convex/notifications/index');
            await (modules as any).remove(ctx, { id: 'conv123' });

            expect(ctx.db.delete).toHaveBeenCalledWith('conv123');
        });

        it('should throw if notification not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/notifications/index');
            
            await expect((modules as any).remove(ctx, { id: 'nonexistent' })).rejects.toThrow('Notification not found');
        });
    });

    describe('deleteAllRead', () => {
        it('should delete all read notifications for user', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'conv1', readAt: Date.now() - 3600000 },
                            { _id: 'conv2', readAt: Date.now() - 7200000 },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/notifications/index');
            await (modules as any).deleteAllRead(ctx, { userId });

            expect(ctx.db.delete).toHaveBeenCalledWith('conv1');
            expect(ctx.db.delete).toHaveBeenCalledWith('conv2');
        });
    });

    describe('sendBookingNotification', () => {
        it('should send booking notification', async () => {
            const bookingId = 'booking123';
            
            // Mock booking
            ctx.db.get.mockResolvedValueOnce({
                _id: bookingId,
                userId,
                resourceId: 'resource123',
                status: 'confirmed',
                startTime: Date.now() + 86400000,
            });

            // Mock resource
            ctx.db.get.mockResolvedValueOnce({
                _id: 'resource123',
                name: 'Meeting Room A',
            });

            ctx.db.insert.mockResolvedValue('conv123');

            const modules = await import('../../convex/notifications/index');
            const result = await (modules as any).sendBookingNotification(ctx, {
                tenantId,
                bookingId,
                type: 'booking_confirmed',
            });

            expect(result.id).toBe('conv123');
            expect(ctx.db.insert).toHaveBeenCalledWith('conversations', expect.objectContaining({
                tenantId,
                userId,
                type: 'notification',
                title: 'Booking Confirmed',
                body: expect.stringContaining('Meeting Room A'),
            }));
        });

        it('should throw if booking not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/notifications/index');
            
            await expect((modules as any).sendBookingNotification(ctx, {
                tenantId,
                bookingId: 'nonexistent',
                type: 'booking_confirmed',
            })).rejects.toThrow('Booking not found');
        });
    });
});
