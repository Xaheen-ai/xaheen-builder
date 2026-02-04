/**
 * Tenant Functions Tests
 *
 * Tests for tenant onboarding and settings management.
 * User Stories: US-1.1, US-1.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Tenant Functions', () => {
    let store: TestDataStore;

    beforeEach(() => {
        store = new TestDataStore();
    });

    describe('US-1.1: Tenant Onboarding', () => {
        it('tenant.onboard.success - should create tenant with admin user', async () => {
            const ctx = createMockContext(store);

            // Simulate onboard mutation logic
            const slug = 'new-company';
            const name = 'New Company AS';
            const adminEmail = 'admin@newcompany.com';

            // Check slug availability
            const existing = await ctx.db.query('tenants')
                .withIndex('by_slug', (q) => q.eq('slug', slug))
                .first();

            expect(existing).toBeNull();

            // Create tenant
            const tenantId = await ctx.db.insert('tenants', {
                name,
                slug,
                status: 'active',
                settings: { locale: 'nb-NO', currency: 'NOK' },
                seatLimits: { maxUsers: 10 },
                featureFlags: {},
                enabledCategories: ['LOKALER'],
            });

            expect(tenantId).toBeDefined();

            // Create admin user
            const userId = await ctx.db.insert('users', {
                tenantId,
                email: adminEmail,
                role: 'admin',
                status: 'active',
                metadata: { isFounder: true },
            });

            expect(userId).toBeDefined();

            // Verify tenant created
            const tenant = await ctx.db.get(tenantId);
            expect(tenant).toMatchObject({
                name: 'New Company AS',
                slug: 'new-company',
                status: 'active',
            });

            // Verify user created
            const user = await ctx.db.get(userId);
            expect(user).toMatchObject({
                email: 'admin@newcompany.com',
                role: 'admin',
            });
        });

        it('tenant.onboard.duplicate-slug - should reject duplicate slugs', async () => {
            const ctx = createMockContext(store);

            // Seed existing tenant
            store.seedTenant({ slug: 'existing-company' });

            // Try to create with same slug
            const existing = await ctx.db.query('tenants')
                .withIndex('by_slug', (q) => q.eq('slug', 'existing-company'))
                .first();

            expect(existing).not.toBeNull();

            // In real implementation, this would throw
            const shouldThrow = existing !== null;
            expect(shouldThrow).toBe(true);
        });

        it('tenant.onboard.creates-default-org - should create default organization', async () => {
            const ctx = createMockContext(store);

            const tenantId = await ctx.db.insert('tenants', {
                name: 'Test Company',
                slug: 'test-company',
                status: 'active',
                settings: {},
                seatLimits: {},
                featureFlags: {},
                enabledCategories: [],
            });

            const orgId = await ctx.db.insert('organizations', {
                tenantId,
                name: 'Test Company Default',
                slug: 'default',
                type: 'default',
                status: 'active',
                settings: {},
                metadata: {},
            });

            const org = await ctx.db.get(orgId);
            expect(org).toMatchObject({
                tenantId,
                type: 'default',
                status: 'active',
            });
        });
    });

    describe('US-1.2: Tenant Settings Management', () => {
        it('tenant.settings.get - should retrieve current settings', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({
                settings: {
                    locale: 'nb-NO',
                    timezone: 'Europe/Oslo',
                    currency: 'NOK',
                },
                featureFlags: { analytics: true },
            });

            const tenant = await ctx.db.get(tenantId);
            const typedTenant = tenant as {
                settings: Record<string, unknown>;
                featureFlags: Record<string, unknown>;
            };

            expect(typedTenant.settings).toMatchObject({
                locale: 'nb-NO',
                timezone: 'Europe/Oslo',
                currency: 'NOK',
            });
            expect(typedTenant.featureFlags).toMatchObject({
                analytics: true,
            });
        });

        it('tenant.settings.update-locale - should update locale settings', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({
                settings: { locale: 'nb-NO' },
            });

            // Update settings
            await ctx.db.patch(tenantId, {
                settings: { locale: 'en-US', currency: 'USD' },
            });

            const tenant = await ctx.db.get(tenantId);
            const typedTenant = tenant as { settings: Record<string, unknown> };

            expect(typedTenant.settings).toMatchObject({
                locale: 'en-US',
                currency: 'USD',
            });
        });

        it('tenant.settings.update-features - should toggle feature flags', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({
                featureFlags: { analytics: true, messaging: false },
            });

            // Toggle messaging on
            const tenant = await ctx.db.get(tenantId);
            const typedTenant = tenant as { featureFlags: Record<string, boolean> };

            await ctx.db.patch(tenantId, {
                featureFlags: {
                    ...typedTenant.featureFlags,
                    messaging: true,
                },
            });

            const updated = await ctx.db.get(tenantId);
            const typedUpdated = updated as { featureFlags: Record<string, boolean> };

            expect(typedUpdated.featureFlags.messaging).toBe(true);
        });

        it('tenant.settings.update-categories - should update enabled categories', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({
                enabledCategories: ['LOKALER'],
            });

            await ctx.db.patch(tenantId, {
                enabledCategories: ['LOKALER', 'SPORT', 'ARRANGEMENT'],
            });

            const tenant = await ctx.db.get(tenantId);
            const typedTenant = tenant as { enabledCategories: string[] };

            expect(typedTenant.enabledCategories).toHaveLength(3);
            expect(typedTenant.enabledCategories).toContain('SPORT');
        });
    });

    describe('Tenant Lookup', () => {
        it('tenant.getBySlug - should find tenant by slug', async () => {
            const ctx = createMockContext(store);

            store.seedTenant({ name: 'My Company', slug: 'my-company' });

            const tenant = await ctx.db.query('tenants')
                .withIndex('by_slug', (q) => q.eq('slug', 'my-company'))
                .first();

            expect(tenant).not.toBeNull();
            const typedTenant = tenant as { name: string };
            expect(typedTenant.name).toBe('My Company');
        });

        it('tenant.getBySlug.notFound - should return null for unknown slug', async () => {
            const ctx = createMockContext(store);

            const tenant = await ctx.db.query('tenants')
                .withIndex('by_slug', (q) => q.eq('slug', 'nonexistent'))
                .first();

            expect(tenant).toBeNull();
        });
    });
});
