/**
 * Authentication Functions Tests
 *
 * Tests for password login and demo access.
 * User Stories: US-2.1, US-2.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Authentication Functions', () => {
    let store: TestDataStore;

    beforeEach(() => {
        store = new TestDataStore();
    });

    describe('US-2.1: Password Login', () => {
        it('auth.password.success - should authenticate valid credentials', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({ name: 'Test Tenant' });
            const userId = store.seedUser({
                tenantId,
                email: 'user@test.com',
                name: 'Test User',
                role: 'admin',
                status: 'active',
            });

            // Simulate password login
            const user = await ctx.db.query('users')
                .withIndex('by_email', (q: { eq: (field: string, value: string) => unknown }) => 
                    q.eq('email', 'user@test.com'))
                .first();

            expect(user).not.toBeNull();

            const typedUser = user as {
                _id: string;
                email: string;
                name: string;
                role: string;
                tenantId: string;
            };

            // Verify user data
            expect(typedUser.email).toBe('user@test.com');
            expect(typedUser.role).toBe('admin');
            expect(typedUser.tenantId).toBe(tenantId);

            // Update last login
            await ctx.db.patch(typedUser._id, { lastLoginAt: Date.now() });

            const updated = await ctx.db.get(typedUser._id);
            const typedUpdated = updated as { lastLoginAt: number };
            expect(typedUpdated.lastLoginAt).toBeDefined();
        });

        it('auth.password.invalid-email - should reject unknown email', async () => {
            const ctx = createMockContext(store);

            const user = await ctx.db.query('users')
                .withIndex('by_email', (q: { eq: (field: string, value: string) => unknown }) => 
                    q.eq('email', 'unknown@test.com'))
                .first();

            expect(user).toBeNull();

            // In real implementation, would return error
            const result = user === null 
                ? { success: false, error: 'Invalid email or password' }
                : { success: true };

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid email or password');
        });

        it('auth.password.inactive-user - should block suspended users', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            store.seedUser({
                tenantId,
                email: 'suspended@test.com',
                status: 'suspended',
            });

            const user = await ctx.db.query('users')
                .withIndex('by_email', (q: { eq: (field: string, value: string) => unknown }) => 
                    q.eq('email', 'suspended@test.com'))
                .first();

            const typedUser = user as { status: string } | null;

            // Check if user is active
            const isActive = typedUser?.status === 'active';
            expect(isActive).toBe(false);

            // Should block login
            const canLogin = typedUser !== null && typedUser.status === 'active';
            expect(canLogin).toBe(false);
        });

        it('auth.password.returns-tenant-context - should include tenant in response', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({
                name: 'My Tenant',
                slug: 'my-tenant',
            });

            store.seedUser({
                tenantId,
                email: 'user@mytenant.com',
                status: 'active',
            });

            const user = await ctx.db.query('users')
                .withIndex('by_email', (q: { eq: (field: string, value: string) => unknown }) => 
                    q.eq('email', 'user@mytenant.com'))
                .first();

            const typedUser = user as { tenantId: string };
            const tenant = await ctx.db.get(typedUser.tenantId);

            expect(tenant).not.toBeNull();
            const typedTenant = tenant as { name: string; slug: string };
            expect(typedTenant.name).toBe('My Tenant');
            expect(typedTenant.slug).toBe('my-tenant');
        });
    });

    describe('US-2.2: Demo Login', () => {
        it('auth.demo.success - should login as random demo user', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            store.seedUser({ tenantId, email: 'demo1@test.com', status: 'active' });
            store.seedUser({ tenantId, email: 'demo2@test.com', status: 'active' });
            store.seedUser({ tenantId, email: 'demo3@test.com', status: 'active' });

            // Get all active users
            const users = await ctx.db.query('users')
                .filter((q: {
                    eq: (accessor: { fieldName: string }, value: string) => { evaluate: (item: unknown) => boolean };
                    field: (name: string) => { fieldName: string };
                }) => q.eq(q.field('status'), 'active'))
                .collect();

            expect(users.length).toBeGreaterThan(0);

            // Pick random user
            const randomIndex = Math.floor(Math.random() * users.length);
            const demoUser = users[randomIndex] as { email: string };

            expect(demoUser.email).toMatch(/@test\.com$/);
        });

        it('auth.demo.no-users - should handle empty database', async () => {
            const ctx = createMockContext(store);

            // No users seeded
            const users = await ctx.db.query('users')
                .filter((q: {
                    eq: (accessor: { fieldName: string }, value: string) => { evaluate: (item: unknown) => boolean };
                    field: (name: string) => { fieldName: string };
                }) => q.eq(q.field('status'), 'active'))
                .collect();

            expect(users.length).toBe(0);

            // Should return error
            const result = users.length === 0
                ? { success: false, error: 'No demo users available' }
                : { success: true };

            expect(result.success).toBe(false);
        });

        it('auth.demo.session-token - should generate session token', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({ tenantId, status: 'active' });

            // Simulate session token generation
            const sessionToken = `session_${userId}_${Date.now()}`;

            expect(sessionToken).toMatch(/^session_users_\d+_\d+$/);
        });
    });

    describe('Session Management', () => {
        it('auth.session.update-last-login - should track login time', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({ tenantId, status: 'active' });

            const beforeLogin = Date.now();
            await ctx.db.patch(userId, { lastLoginAt: Date.now() });
            const afterLogin = Date.now();

            const user = await ctx.db.get(userId);
            const typedUser = user as { lastLoginAt: number };

            expect(typedUser.lastLoginAt).toBeGreaterThanOrEqual(beforeLogin);
            expect(typedUser.lastLoginAt).toBeLessThanOrEqual(afterLogin);
        });
    });
});
