/**
 * Favorites Functions Tests
 *
 * Tests for user favorite resources management.
 * User Stories: US-10.1, US-10.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Favorites Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Favorites Test Tenant' });
        resourceId = store.seedResource({ 
            tenantId, 
            name: 'Test Resource',
            slug: 'test-resource'
        });
        userId = store.seedUser({ 
            tenantId, 
            name: 'Test User',
            email: 'test@example.com'
        });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list user favorites', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'fav1', userId, resourceId: 'resource1', tags: ['meeting'] },
                        { _id: 'fav2', userId, resourceId: 'resource2', tags: ['workshop'] },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock resource details
            ctx.db.get
                .mockResolvedValueOnce({ _id: 'resource1', name: 'Meeting Room A' })
                .mockResolvedValueOnce({ _id: 'resource2', name: 'Workshop Room B' });

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).list(ctx, { userId });

            expect(result).toHaveLength(2);
            expect(result[0].resource.name).toBe('Meeting Room A');
            expect(result[0].tags).toEqual(['meeting']);
        });

        it('should filter by tags', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'fav1', userId, resourceId: 'resource1', tags: ['meeting', 'preferred'] },
                        { _id: 'fav2', userId, resourceId: 'resource2', tags: ['workshop'] },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock resource details
            ctx.db.get
                .mockResolvedValueOnce({ _id: 'resource1', name: 'Meeting Room A' })
                .mockResolvedValueOnce({ _id: 'resource2', name: 'Workshop Room B' });

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).list(ctx, { userId, tags: ['preferred'] });

            expect(result).toHaveLength(1);
            expect(result[0].resource.name).toBe('Meeting Room A');
        });
    });

    describe('isFavorite', () => {
        it('should return true if resource is favorited', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'fav123',
                        userId,
                        resourceId,
                        tags: [],
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).isFavorite(ctx, { userId, resourceId });

            expect(result.isFavorite).toBe(true);
            expect(result.favorite).toBeDefined();
        });

        it('should return false if not favorited', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).isFavorite(ctx, { userId, resourceId });

            expect(result.isFavorite).toBe(false);
            expect(result.favorite).toBeNull();
        });
    });

    describe('add', () => {
        it('should add resource to favorites', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);
            ctx.db.insert.mockResolvedValue('fav123');

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).add(ctx, {
                tenantId,
                userId,
                resourceId,
                notes: 'Great for presentations',
                tags: ['meeting', 'presentation'],
            });

            expect(result.id).toBe('fav123');
            expect(ctx.db.insert).toHaveBeenCalledWith('favorites', expect.objectContaining({
                tenantId,
                userId,
                resourceId,
                notes: 'Great for presentations',
                tags: ['meeting', 'presentation'],
            }));
        });

        it('should prevent duplicate favorites', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({ _id: 'existing' })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/favorites');
            
            await expect((modules as any).add(ctx, {
                tenantId,
                userId,
                resourceId,
            })).rejects.toThrow('Resource already in favorites');
        });
    });

    describe('update', () => {
        it('should update favorite', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'fav123',
                userId,
                resourceId,
                notes: 'Old notes',
                tags: ['old'],
            });

            const modules = await import('../../convex/domain/favorites');
            await (modules as any).update(ctx, {
                id: 'fav123',
                notes: 'Updated notes',
                tags: ['meeting', 'updated'],
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('fav123', {
                notes: 'Updated notes',
                tags: ['meeting', 'updated'],
            });
        });
    });

    describe('remove', () => {
        it('should remove from favorites', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'fav123',
                        userId,
                        resourceId,
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/favorites');
            await (modules as any).remove(ctx, { userId, resourceId });

            expect(ctx.db.delete).toHaveBeenCalledWith('fav123');
        });

        it('should throw if favorite not found', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/favorites');
            
            await expect((modules as any).remove(ctx, { userId, resourceId })).rejects.toThrow('Favorite not found');
        });
    });

    describe('toggle', () => {
        it('should add to favorites if not favorited', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);
            ctx.db.insert.mockResolvedValue('fav123');

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).toggle(ctx, {
                tenantId,
                userId,
                resourceId,
            });

            expect(result.isFavorite).toBe(true);
            expect(ctx.db.insert).toHaveBeenCalledWith('favorites', expect.objectContaining({
                tenantId,
                userId,
                resourceId,
            }));
        });

        it('should remove from favorites if already favorited', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'fav123',
                        userId,
                        resourceId,
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/favorites');
            const result = await (modules as any).toggle(ctx, {
                tenantId,
                userId,
                resourceId,
            });

            expect(result.isFavorite).toBe(false);
            expect(ctx.db.delete).toHaveBeenCalledWith('fav123');
        });
    });
});
