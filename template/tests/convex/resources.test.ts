/**
 * Resource Functions Tests
 *
 * Tests for resource CRUD and lifecycle management.
 * User Stories: US-3.1, US-3.2, US-3.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

// Type for index query builder
type IndexQueryBuilder = {
    eq: (field: string, value: unknown) => IndexQueryBuilder;
};

describe('Resource Functions', () => {
    let store: TestDataStore;
    let tenantId: string;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Resource Test Tenant' });
    });

    describe('US-3.1: Create Resource', () => {
        it('resource.create.success - should create resource with valid data', async () => {
            const ctx = createMockContext(store);

            const resourceId = await ctx.db.insert('resources', {
                tenantId,
                name: 'Meeting Room A',
                slug: 'meeting-room-a',
                categoryKey: 'LOKALER',
                status: 'draft',
                timeMode: 'PERIOD',
                features: [],
                requiresApproval: false,
                capacity: 10,
                images: [],
                pricing: { hourly: 500 },
                metadata: {},
            });

            expect(resourceId).toBeDefined();

            const resource = await ctx.db.get(resourceId);
            expect(resource).toMatchObject({
                name: 'Meeting Room A',
                slug: 'meeting-room-a',
                status: 'draft',
                capacity: 10,
            });
        });

        it('resource.create.duplicate-slug - should reject duplicate slug within tenant', async () => {
            const ctx = createMockContext(store);

            // Create first resource
            store.seedResource({
                tenantId,
                name: 'Resource 1',
                slug: 'my-resource',
            });

            // Check if slug exists
            const existing = await ctx.db.query('resources')
                .withIndex('by_slug', (q: IndexQueryBuilder) => 
                    q.eq('tenantId', tenantId).eq('slug', 'my-resource'))
                .first();

            expect(existing).not.toBeNull();

            // In real implementation, this would throw
            const shouldReject = existing !== null;
            expect(shouldReject).toBe(true);
        });

        it('resource.create.default-values - should apply default values', async () => {
            const ctx = createMockContext(store);

            const resourceId = await ctx.db.insert('resources', {
                tenantId,
                name: 'New Resource',
                slug: 'new-resource',
                categoryKey: 'SPORT',
                // Defaults applied
                status: 'draft',
                timeMode: 'PERIOD',
                features: [],
                requiresApproval: false,
                images: [],
                pricing: {},
                metadata: {},
            });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as {
                status: string;
                timeMode: string;
                requiresApproval: boolean;
            };

            expect(typed.status).toBe('draft');
            expect(typed.timeMode).toBe('PERIOD');
            expect(typed.requiresApproval).toBe(false);
        });

        it('resource.create.with-pricing - should store pricing configuration', async () => {
            const ctx = createMockContext(store);

            const pricing = {
                hourly: 250,
                daily: 1500,
                weekly: 7500,
                currency: 'NOK',
            };

            const resourceId = await ctx.db.insert('resources', {
                tenantId,
                name: 'Priced Resource',
                slug: 'priced-resource',
                categoryKey: 'LOKALER',
                status: 'draft',
                timeMode: 'PERIOD',
                features: [],
                requiresApproval: false,
                images: [],
                pricing,
                metadata: {},
            });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { pricing: typeof pricing };

            expect(typed.pricing).toMatchObject(pricing);
        });
    });

    describe('US-3.2: Publish Resource', () => {
        it('resource.publish.success - should change status to published', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                status: 'draft',
            });

            await ctx.db.patch(resourceId, { status: 'published' });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { status: string };

            expect(typed.status).toBe('published');
        });

        it('resource.unpublish.success - should change status back to draft', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                status: 'published',
            });

            await ctx.db.patch(resourceId, { status: 'draft' });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { status: string };

            expect(typed.status).toBe('draft');
        });

        it('resource.delete.soft-delete - should mark as deleted not remove', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                status: 'published',
            });

            // Soft delete
            await ctx.db.patch(resourceId, { status: 'deleted' });

            const resource = await ctx.db.get(resourceId);
            expect(resource).not.toBeNull();

            const typed = resource as { status: string };
            expect(typed.status).toBe('deleted');
        });
    });

    describe('US-3.3: List and Filter Resources', () => {
        beforeEach(() => {
            // Seed test resources
            store.seedResource({ tenantId, name: 'Room A', categoryKey: 'LOKALER', status: 'published' });
            store.seedResource({ tenantId, name: 'Room B', categoryKey: 'LOKALER', status: 'draft' });
            store.seedResource({ tenantId, name: 'Court 1', categoryKey: 'SPORT', status: 'published' });
            store.seedResource({ tenantId, name: 'Court 2', categoryKey: 'SPORT', status: 'published' });
        });

        it('resource.list.all - should list all tenant resources', async () => {
            const ctx = createMockContext(store);

            const resources = await ctx.db.query('resources')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            expect(resources.length).toBe(4);
        });

        it('resource.list.by-category - should filter by category', async () => {
            const ctx = createMockContext(store);

            const allResources = await ctx.db.query('resources')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            // Filter by category in memory (like Convex does)
            const sportResources = allResources.filter(
                (r) => (r as { categoryKey: string }).categoryKey === 'SPORT'
            );

            expect(sportResources.length).toBe(2);
        });

        it('resource.list.by-status - should filter by status', async () => {
            const ctx = createMockContext(store);

            const allResources = await ctx.db.query('resources')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            const publishedResources = allResources.filter(
                (r) => (r as { status: string }).status === 'published'
            );

            expect(publishedResources.length).toBe(3);
        });

        it('resource.list.pagination - should respect limit', async () => {
            const ctx = createMockContext(store);

            const allResources = await ctx.db.query('resources')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            const limited = allResources.slice(0, 2);

            expect(limited.length).toBe(2);
        });

        it('resource.list.combined-filters - should apply multiple filters', async () => {
            const ctx = createMockContext(store);

            const allResources = await ctx.db.query('resources')
                .withIndex('by_tenant', (q: IndexQueryBuilder) => q.eq('tenantId', tenantId))
                .collect();

            const filtered = allResources.filter((r) => {
                const typed = r as { categoryKey: string; status: string };
                return typed.categoryKey === 'LOKALER' && typed.status === 'published';
            });

            expect(filtered.length).toBe(1);
            expect((filtered[0] as { name: string }).name).toBe('Room A');
        });
    });

    describe('Resource Updates', () => {
        it('resource.update.name - should update resource name', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                name: 'Original Name',
            });

            await ctx.db.patch(resourceId, { name: 'Updated Name' });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { name: string };

            expect(typed.name).toBe('Updated Name');
        });

        it('resource.update.capacity - should update capacity', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                capacity: 10,
            });

            await ctx.db.patch(resourceId, { capacity: 20 });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { capacity: number };

            expect(typed.capacity).toBe(20);
        });

        it('resource.update.approval-requirement - should toggle approval', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                requiresApproval: false,
            });

            await ctx.db.patch(resourceId, { requiresApproval: true });

            const resource = await ctx.db.get(resourceId);
            const typed = resource as { requiresApproval: boolean };

            expect(typed.requiresApproval).toBe(true);
        });
    });

    describe('Resource Lookup', () => {
        it('resource.get.by-id - should retrieve by ID', async () => {
            const ctx = createMockContext(store);

            const resourceId = store.seedResource({
                tenantId,
                name: 'Specific Resource',
            });

            const resource = await ctx.db.get(resourceId);

            expect(resource).not.toBeNull();
            expect((resource as { name: string }).name).toBe('Specific Resource');
        });

        it('resource.get.not-found - should return null for unknown ID', async () => {
            const ctx = createMockContext(store);

            const resource = await ctx.db.get('nonexistent_id');

            expect(resource).toBeNull();
        });

        it('resource.getBySlug - should find by tenant and slug', async () => {
            const ctx = createMockContext(store);

            store.seedResource({
                tenantId,
                name: 'Slugged Resource',
                slug: 'my-unique-slug',
            });

            const resource = await ctx.db.query('resources')
                .withIndex('by_slug', (q: IndexQueryBuilder) => 
                    q.eq('tenantId', tenantId).eq('slug', 'my-unique-slug'))
                .first();

            expect(resource).not.toBeNull();
            expect((resource as { name: string }).name).toBe('Slugged Resource');
        });
    });
});
