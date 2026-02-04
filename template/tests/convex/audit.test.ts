/**
 * Audit Functions Tests
 *
 * Tests for booking audit trail and logging.
 * User Stories: US-9.1, US-9.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Audit Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let bookingId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Audit Test Tenant' });
        bookingId = store.seedBooking({ 
            tenantId, 
            resourceId: 'resource123',
            userId: 'user123'
        });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list audit entries for booking', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { 
                            _id: 'audit1', 
                            bookingId, 
                            action: 'created',
                            userId: 'user123',
                            timestamp: Date.now() - 3600000,
                        },
                        { 
                            _id: 'audit2', 
                            bookingId, 
                            action: 'approved',
                            userId: 'admin123',
                            timestamp: Date.now() - 1800000,
                        },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).list(ctx, { bookingId });

            expect(result).toHaveLength(2);
            expect(result[0].action).toBe('created');
            expect(result[1].action).toBe('approved');
        });
    });

    describe('listByAction', () => {
        it('should list audit entries filtered by action', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'audit1', action: 'approved', bookingId },
                        { _id: 'audit2', action: 'approved', bookingId: 'booking2' },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).listByAction(ctx, { 
                tenantId, 
                action: 'approved' 
            });

            expect(result).toHaveLength(2);
            expect(result[0].action).toBe('approved');
        });
    });

    describe('get', () => {
        it('should get audit entry by ID', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'audit123',
                bookingId,
                action: 'cancelled',
                userId: 'user123',
                timestamp: Date.now(),
                metadata: { reason: 'User request' },
            });

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).get(ctx, { id: 'audit123' });

            expect(result).toBeDefined();
            expect(result.action).toBe('cancelled');
            expect(result.metadata.reason).toBe('User request');
        });

        it('should throw if audit entry not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/domain/audit');
            
            await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Audit entry not found');
        });
    });

    describe('create', () => {
        it('should create audit entry', async () => {
            ctx.db.insert.mockResolvedValue('audit123');

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).create(ctx, {
                tenantId,
                bookingId,
                action: 'modified',
                userId: 'user123',
                metadata: { 
                    changes: { 
                        startTime: { old: '09:00', new: '10:00' }
                    } 
                },
            });

            expect(result.id).toBe('audit123');
            expect(ctx.db.insert).toHaveBeenCalledWith('bookingAudit', expect.objectContaining({
                tenantId,
                bookingId,
                action: 'modified',
                userId: 'user123',
                metadata: { 
                    changes: { 
                        startTime: { old: '09:00', new: '10:00' }
                    } 
                },
            }));
        });

        it('should auto-generate timestamp', async () => {
            const beforeTime = Date.now();
            
            ctx.db.insert.mockResolvedValue('audit123');

            const modules = await import('../../convex/domain/audit');
            await (modules as any).create(ctx, {
                tenantId,
                bookingId,
                action: 'created',
                userId: 'user123',
            });

            const insertCall = ctx.db.insert.mock.calls[0];
            const timestamp = insertCall[1].timestamp;

            expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(timestamp).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('summarize', () => {
        it('should summarize audit data for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { action: 'created', timestamp: Date.now() - 86400000 },
                        { action: 'created', timestamp: Date.now() - 86400000 },
                        { action: 'approved', timestamp: Date.now() - 86400000 },
                        { action: 'cancelled', timestamp: Date.now() - 172800000 },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const now = Date.now();
            const yesterday = now - 86400000;
            const twoDaysAgo = now - 172800000;

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).summarize(ctx, { 
                tenantId,
                startDate: twoDaysAgo,
                endDate: now,
            });

            expect(result.total).toBe(4);
            expect(result.byAction.created).toBe(2);
            expect(result.byAction.approved).toBe(1);
            expect(result.byAction.cancelled).toBe(1);
            expect(result.byDate[yesterday]).toBe(3);
            expect(result.byDate[twoDaysAgo]).toBe(1);
        });
    });

    describe('getTimeline', () => {
        it('should get audit timeline for booking', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { 
                            _id: 'audit1',
                            action: 'created',
                            userId: 'user123',
                            timestamp: Date.now() - 3600000,
                            metadata: {},
                        },
                        { 
                            _id: 'audit2',
                            action: 'approved',
                            userId: 'admin123',
                            timestamp: Date.now() - 1800000,
                            metadata: { notes: 'Approved for event' },
                        },
                        { 
                            _id: 'audit3',
                            action: 'modified',
                            userId: 'user123',
                            timestamp: Date.now() - 900000,
                            metadata: { changes: { notes: 'Updated notes' } },
                        },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock user details
            ctx.db.get
                .mockResolvedValueOnce({ _id: 'user123', name: 'John Doe' })
                .mockResolvedValueOnce({ _id: 'admin123', name: 'Admin User' })
                .mockResolvedValueOnce({ _id: 'user123', name: 'John Doe' });

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).getTimeline(ctx, { bookingId });

            expect(result).toHaveLength(3);
            expect(result[0].action).toBe('created');
            expect(result[0].user.name).toBe('John Doe');
            expect(result[1].action).toBe('approved');
            expect(result[1].user.name).toBe('Admin User');
            expect(result[1].metadata.notes).toBe('Approved for event');
        });

        it('should return timeline in chronological order', async () => {
            const now = Date.now();
            
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'audit1', timestamp: now - 3600000 },
                        { _id: 'audit2', timestamp: now - 1800000 },
                        { _id: 'audit3', timestamp: now - 900000 },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock user details
            ctx.db.get.mockResolvedValue({ name: 'Test User' });

            const modules = await import('../../convex/domain/audit');
            const result = await (modules as any).getTimeline(ctx, { bookingId });

            expect(result[0].timestamp).toBe(now - 3600000);
            expect(result[1].timestamp).toBe(now - 1800000);
            expect(result[2].timestamp).toBe(now - 900000);
        });
    });
});
