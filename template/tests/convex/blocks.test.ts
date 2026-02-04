/**
 * Block Functions Tests
 *
 * Tests for resource block management and availability checking.
 * User Stories: US-4.1, US-4.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Block Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Block Test Tenant' });
        resourceId = store.seedResource({ 
            tenantId, 
            name: 'Test Resource',
            slug: 'test-resource'
        });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list blocks for resource', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'block1',
                                resourceId,
                                type: 'available',
                                startTime: Date.now(),
                                endTime: Date.now() + 3600000,
                            },
                            {
                                _id: 'block2',
                                resourceId,
                                type: 'blocked',
                                startTime: Date.now() + 7200000,
                                endTime: Date.now() + 10800000,
                            },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).list(ctx, { resourceId });

            expect(result).toHaveLength(2);
            expect(result[0].type).toBe('available');
            expect(result[1].type).toBe('blocked');
        });
    });

    describe('get', () => {
        it('should get block by ID', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'block123',
                resourceId,
                type: 'available',
                startTime: Date.now(),
                endTime: Date.now() + 3600000,
            });

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).get(ctx, { id: 'block123' });

            expect(result).toBeDefined();
            expect(result.type).toBe('available');
        });

        it('should throw if block not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/domain/blocks');
            
            await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Block not found');
        });
    });

    describe('create', () => {
        it('should create block', async () => {
            const now = Date.now();
            ctx.db.insert.mockResolvedValue('block123');

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).create(ctx, {
                tenantId,
                resourceId,
                type: 'available',
                startTime: now,
                endTime: now + 3600000,
            });

            expect(result.id).toBe('block123');
            expect(ctx.db.insert).toHaveBeenCalledWith('blocks', expect.objectContaining({
                resourceId,
                type: 'available',
                startTime: now,
                endTime: now + 3600000,
            }));
        });
    });

    describe('update', () => {
        it('should update block', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'block123',
                resourceId,
                type: 'available',
                startTime: Date.now(),
                endTime: Date.now() + 3600000,
            });

            const modules = await import('../../convex/domain/blocks');
            await (modules as any).update(ctx, {
                id: 'block123',
                type: 'blocked',
                reason: 'Maintenance',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('block123', {
                type: 'blocked',
                reason: 'Maintenance',
            });
        });
    });

    describe('remove', () => {
        it('should delete block', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'block123',
                resourceId,
                type: 'available',
            });

            const modules = await import('../../convex/domain/blocks');
            await (modules as any).remove(ctx, { id: 'block123' });

            expect(ctx.db.delete).toHaveBeenCalledWith('block123');
        });
    });

    describe('checkAvailability', () => {
        it('should return available when no overlapping blocks', async () => {
            const now = Date.now();
            
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            // Non-overlapping block
                            {
                                _id: 'block1',
                                type: 'blocked',
                                startTime: now - 3600000,
                                endTime: now - 1800000,
                            },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).checkAvailability(ctx, {
                resourceId,
                startTime: now,
                endTime: now + 3600000,
            });

            expect(result.isAvailable).toBe(true);
            expect(result.conflicts).toHaveLength(0);
        });

        it('should return unavailable with conflicts', async () => {
            const now = Date.now();
            
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            // Overlapping block
                            {
                                _id: 'block1',
                                type: 'blocked',
                                startTime: now + 1800000,
                                endTime: now + 5400000,
                                reason: 'Maintenance',
                            },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).checkAvailability(ctx, {
                resourceId,
                startTime: now,
                endTime: now + 3600000,
            });

            expect(result.isAvailable).toBe(false);
            expect(result.conflicts).toHaveLength(1);
            expect(result.conflicts[0].reason).toBe('Maintenance');
        });
    });

    describe('getAvailableSlots', () => {
        it('should return available time slots for a day', async () => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            const dayStart = date.getTime();
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;

            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            // Available block from 9am to 12pm
                            {
                                _id: 'block1',
                                type: 'available',
                                startTime: dayStart + 9 * 60 * 60 * 1000,
                                endTime: dayStart + 12 * 60 * 60 * 1000,
                            },
                            // Available block from 2pm to 5pm
                            {
                                _id: 'block2',
                                type: 'available',
                                startTime: dayStart + 14 * 60 * 60 * 1000,
                                endTime: dayStart + 17 * 60 * 60 * 1000,
                            },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).getAvailableSlots(ctx, {
                resourceId,
                date: dayStart,
                slotDuration: 60, // 1 hour slots
            });

            expect(result.slots).toHaveLength(6); // 3 hours in morning + 3 hours in afternoon
            expect(result.slots[0].startTime).toBe(dayStart + 9 * 60 * 60 * 1000);
            expect(result.slots[5].startTime).toBe(dayStart + 16 * 60 * 60 * 1000);
        });

        it('should return empty array when no available blocks', async () => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            const dayStart = date.getTime();

            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([]) // No blocks
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/blocks');
            const result = await (modules as any).getAvailableSlots(ctx, {
                resourceId,
                date: dayStart,
                slotDuration: 60,
            });

            expect(result.slots).toHaveLength(0);
        });
    });
});
