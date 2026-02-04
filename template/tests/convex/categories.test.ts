/**
 * Category Functions Tests
 *
 * Tests for category CRUD and tree management.
 * User Stories: US-5.1, US-5.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Category Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Category Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list categories for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'cat1', key: 'LOKALER', name: 'Lokaler', isActive: true },
                        { _id: 'cat2', key: 'UTSTYR', name: 'Utstyr', isActive: true },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/categories');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].key).toBe('LOKALER');
        });
    });

    describe('get', () => {
        it('should get category with parent and children', async () => {
            const categoryId = 'cat123';
            
            ctx.db.get.mockResolvedValue({
                _id: categoryId,
                key: 'LOKALER',
                name: 'Lokaler',
                parentId: 'parent123',
                isActive: true,
            });

            // Mock parent query
            const parentQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'parent123',
                        key: 'PARENT',
                        name: 'Parent Category',
                    })
                })
            };

            // Mock children query
            const childrenQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'child1', key: 'CHILD1', name: 'Child 1' },
                        { _id: 'child2', key: 'CHILD2', name: 'Child 2' },
                    ])
                })
            };

            ctx.db.query
                .mockReturnValueOnce(parentQuery)
                .mockReturnValueOnce(childrenQuery);

            const modules = await import('../../convex/domain/categories');
            const result = await (modules as any).get(ctx, { id: categoryId });

            expect(result).toBeDefined();
            expect(result.key).toBe('LOKALER');
            expect(result.parent).toBeDefined();
            expect(result.children).toHaveLength(2);
        });

        it('should throw if category not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/domain/categories');
            
            await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Category not found');
        });
    });

    describe('getByKey', () => {
        it('should get category by key', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'cat123',
                        key: 'LOKALER',
                        name: 'Lokaler',
                        isActive: true,
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/categories');
            const result = await (modules as any).getByKey(ctx, { tenantId, key: 'LOKALER' });

            expect(result).toBeDefined();
            expect(result.key).toBe('LOKALER');
        });
    });

    describe('create', () => {
        it('should create category', async () => {
            ctx.db.insert.mockResolvedValue('cat123');
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            const modules = await import('../../convex/domain/categories');
            const result = await (modules as any).create(ctx, {
                tenantId,
                key: 'NEW_CATEGORY',
                name: 'New Category',
                description: 'Test category',
            });

            expect(result.id).toBe('cat123');
            expect(ctx.db.insert).toHaveBeenCalledWith('categories', expect.objectContaining({
                key: 'NEW_CATEGORY',
                name: 'New Category',
                tenantId,
            }));
        });

        it('should validate key uniqueness', async () => {
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({ _id: 'existing' })
                })
            });

            const modules = await import('../../convex/domain/categories');
            
            await expect((modules as any).create(ctx, {
                tenantId,
                key: 'EXISTING',
                name: 'Category',
            })).rejects.toThrow('Category with this key already exists');
        });
    });

    describe('update', () => {
        it('should update category', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'cat123',
                key: 'OLD_KEY',
                name: 'Old Name',
                isActive: true,
            });

            const modules = await import('../../convex/domain/categories');
            await (modules as any).update(ctx, {
                id: 'cat123',
                name: 'New Name',
                description: 'Updated description',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('cat123', {
                name: 'New Name',
                description: 'Updated description',
            });
        });
    });

    describe('remove', () => {
        it('should soft delete category', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'cat123',
                key: 'TO_DELETE',
                name: 'To Delete',
                isActive: true,
            });

            // Mock children query (should be empty)
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            });

            const modules = await import('../../convex/domain/categories');
            await (modules as any).remove(ctx, { id: 'cat123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('cat123', {
                isActive: false,
                deletedAt: expect.any(Number),
            });
        });

        it('should prevent deletion with children', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'cat123',
                key: 'PARENT',
                name: 'Parent',
                isActive: true,
            });

            // Mock children query (has children)
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'child1' },
                        { _id: 'child2' },
                    ])
                })
            });

            const modules = await import('../../convex/domain/categories');
            
            await expect((modules as any).remove(ctx, { id: 'cat123' })).rejects.toThrow(
                'Cannot delete category with subcategories'
            );
        });
    });

    describe('getTree', () => {
        it('should build category tree', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'cat1', key: 'ROOT', name: 'Root', parentId: null, sortOrder: 0 },
                            { _id: 'cat2', key: 'CHILD1', name: 'Child 1', parentId: 'cat1', sortOrder: 0 },
                            { _id: 'cat3', key: 'CHILD2', name: 'Child 2', parentId: 'cat1', sortOrder: 1 },
                            { _id: 'cat4', key: 'GRANDCHILD', name: 'Grandchild', parentId: 'cat2', sortOrder: 0 },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/categories');
            const result = await (modules as any).getTree(ctx, { tenantId });

            expect(result).toHaveLength(1);
            expect(result[0].key).toBe('ROOT');
            expect(result[0].children).toHaveLength(2);
            
            const child1 = result[0].children[0];
            expect(child1.key).toBe('CHILD1');
            expect(child1.children).toHaveLength(1);
            expect(child1.children[0].key).toBe('GRANDCHILD');
            
            const child2 = result[0].children[1];
            expect(child2.key).toBe('CHILD2');
            expect(child2.children).toHaveLength(0);
        });
    });
});
