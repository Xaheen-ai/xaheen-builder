/**
 * Organization Functions Tests
 *
 * Tests for organization CRUD and tree management.
 * User Stories: US-2.1, US-2.2, US-2.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Organization Functions', () => {
    let store: TestDataStore;
    let tenantId: string;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Org Test Tenant' });
    });

    describe('list', () => {
        it('should list organizations for tenant', async () => {
            const ctx = createMockContext(store);
            
            // Create organizations
            const org1Id = await ctx.db.insert('organizations', {
                tenantId,
                name: 'Organization 1',
                slug: 'org-1',
                status: 'active',
                metadata: {},
            });
            
            const org2Id = await ctx.db.insert('organizations', {
                tenantId,
                name: 'Organization 2',
                slug: 'org-2',
                parentId: org1Id,
                status: 'active',
                metadata: {},
            });

            // Mock query
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: org1Id, name: 'Organization 1', slug: 'org-1', status: 'active', parentId: null },
                        { _id: org2Id, name: 'Organization 2', slug: 'org-2', status: 'active', parentId: org1Id },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Import and test function
            const modules = await import('../../convex/organizations/index');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Organization 1');
            expect(result[1].name).toBe('Organization 2');
        });
    });

    describe('get', () => {
        it('should get organization by ID', async () => {
            const ctx = createMockContext(store);
            
            const orgId = await ctx.db.insert('organizations', {
                tenantId,
                name: 'Test Org',
                slug: 'test-org',
                status: 'active',
                metadata: {},
            });

            ctx.db.get.mockResolvedValue({
                _id: orgId,
                name: 'Test Org',
                slug: 'test-org',
                status: 'active',
                parentId: null,
            });

            const modules = await import('../../convex/organizations/index');
            const result = await (modules as any).get(ctx, { id: orgId });

            expect(result).toBeDefined();
            expect(result.name).toBe('Test Org');
        });

        it('should throw if organization not found', async () => {
            const ctx = createMockContext(store);
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/organizations/index');
            
            await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Organization not found');
        });
    });

    describe('getBySlug', () => {
        it('should get organization by slug', async () => {
            const ctx = createMockContext(store);
            
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'org123',
                        name: 'Test Org',
                        slug: 'test-org',
                        status: 'active',
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/organizations/index');
            const result = await (modules as any).getBySlug(ctx, { tenantId, slug: 'test-org' });

            expect(result).toBeDefined();
            expect(result.name).toBe('Test Org');
        });
    });

    describe('create', () => {
        it('should create organization', async () => {
            const ctx = createMockContext(store);
            
            ctx.db.insert.mockResolvedValue('org123');
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            const modules = await import('../../convex/organizations/index');
            const result = await (modules as any).create(ctx, {
                tenantId,
                name: 'New Organization',
                slug: 'new-org',
                description: 'Test organization',
            });

            expect(result.id).toBe('org123');
            expect(ctx.db.insert).toHaveBeenCalledWith('organizations', expect.objectContaining({
                name: 'New Organization',
                slug: 'new-org',
                tenantId,
            }));
        });

        it('should validate slug uniqueness', async () => {
            const ctx = createMockContext(store);
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({ _id: 'existing' })
                })
            });

            const modules = await import('../../convex/organizations/index');
            
            await expect((modules as any).create(ctx, {
                tenantId,
                name: 'New Org',
                slug: 'existing-slug',
            })).rejects.toThrow('Organization with this slug already exists');
        });
    });

    describe('update', () => {
        it('should update organization', async () => {
            const ctx = createMockContext(store);
            
            ctx.db.get.mockResolvedValue({
                _id: 'org123',
                name: 'Old Name',
                slug: 'old-slug',
                status: 'active',
            });

            const modules = await import('../../convex/organizations/index');
            await (modules as any).update(ctx, {
                id: 'org123',
                name: 'New Name',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('org123', {
                name: 'New Name',
            });
        });
    });

    describe('remove', () => {
        it('should soft delete organization', async () => {
            const ctx = createMockContext(store);
            
            ctx.db.get.mockResolvedValue({
                _id: 'org123',
                name: 'Test Org',
                status: 'active',
            });

            const modules = await import('../../convex/organizations/index');
            await (modules as any).remove(ctx, { id: 'org123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('org123', {
                status: 'deleted',
                deletedAt: expect.any(Number),
            });
        });
    });

    describe('getTree', () => {
        it('should build organization tree', async () => {
            const ctx = createMockContext(store);
            
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'org1', name: 'Root', slug: 'root', parentId: null, sortOrder: 0 },
                            { _id: 'org2', name: 'Child 1', slug: 'child1', parentId: 'org1', sortOrder: 0 },
                            { _id: 'org3', name: 'Child 2', slug: 'child2', parentId: 'org1', sortOrder: 1 },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/organizations/index');
            const result = await (modules as any).getTree(ctx, { tenantId });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Root');
            expect(result[0].children).toHaveLength(2);
            expect(result[0].children[0].name).toBe('Child 1');
            expect(result[0].children[1].name).toBe('Child 2');
        });
    });
});
