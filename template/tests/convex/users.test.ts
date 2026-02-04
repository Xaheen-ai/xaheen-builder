/**
 * User Functions Tests
 *
 * Tests for user CRUD, invitations, and tenant management.
 * User Stories: US-1.1, US-1.2, US-1.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('User Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'User Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list users for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'user1', name: 'User 1', email: 'user1@test.com', status: 'active' },
                            { _id: 'user2', name: 'User 2', email: 'user2@test.com', status: 'active' },
                        ])
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/users/index');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('User 1');
        });
    });

    describe('getByEmail', () => {
        it('should get user by email', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    unique: vi.fn().mockResolvedValue({
                        _id: 'user123',
                        name: 'Test User',
                        email: 'test@example.com',
                        status: 'active',
                    })
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/users/index');
            const result = await (modules as any).getByEmail(ctx, { email: 'test@example.com' });

            expect(result).toBeDefined();
            expect(result.email).toBe('test@example.com');
        });
    });

    describe('me', () => {
        it('should get current user', async () => {
            ctx.auth.getUserIdentity.mockResolvedValue({
                subject: 'user123',
                name: 'Current User',
                email: 'current@example.com',
            });

            ctx.db.get.mockResolvedValue({
                _id: 'user123',
                name: 'Current User',
                email: 'current@example.com',
                status: 'active',
            });

            const modules = await import('../../convex/users/index');
            const result = await (modules as any).me(ctx);

            expect(result).toBeDefined();
            expect(result.email).toBe('current@example.com');
        });
    });

    // Mutation tests
    describe('create', () => {
        it('should create user', async () => {
            ctx.db.insert.mockResolvedValue('user123');
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    unique: vi.fn().mockResolvedValue(null)
                })
            });

            const modules = await import('../../convex/users/mutations');
            const result = await (modules as any).create(ctx, {
                tenantId,
                name: 'New User',
                email: 'newuser@example.com',
            });

            expect(result.id).toBe('user123');
            expect(ctx.db.insert).toHaveBeenCalledWith('users', expect.objectContaining({
                name: 'New User',
                email: 'newuser@example.com',
            }));
        });

        it('should validate email uniqueness', async () => {
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    unique: vi.fn().mockResolvedValue({ _id: 'existing' })
                })
            });

            const modules = await import('../../convex/users/mutations');
            
            await expect((modules as any).create(ctx, {
                tenantId,
                name: 'User',
                email: 'existing@example.com',
            })).rejects.toThrow('User with this email already exists');
        });
    });

    describe('update', () => {
        it('should update user', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'user123',
                name: 'Old Name',
                email: 'user@example.com',
                status: 'active',
            });

            const modules = await import('../../convex/users/mutations');
            await (modules as any).update(ctx, {
                id: 'user123',
                name: 'New Name',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('user123', {
                name: 'New Name',
            });
        });
    });

    describe('invite', () => {
        it('should invite user to tenant', async () => {
            const userId = store.seedUser({ 
                tenantId, 
                name: 'Invite User', 
                email: 'invite@example.com' 
            });

            ctx.db.get.mockResolvedValue({
                _id: userId,
                name: 'Invite User',
                email: 'invite@example.com',
                status: 'active',
            });

            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            ctx.db.insert.mockResolvedValue('tenantUser123');

            const modules = await import('../../convex/users/mutations');
            const result = await (modules as any).invite(ctx, {
                tenantId,
                userId,
                roleId: 'role123',
            });

            expect(result.id).toBe('tenantUser123');
            expect(ctx.db.patch).toHaveBeenCalledWith(userId, {
                status: 'invited',
            });
        });
    });

    describe('acceptInvitation', () => {
        it('should accept tenant invitation', async () => {
            const tenantUserId = 'tenantUser123';
            
            ctx.db.get.mockResolvedValue({
                _id: tenantUserId,
                tenantId,
                userId: 'user123',
                status: 'invited',
                invitationToken: 'token123',
            });

            const modules = await import('../../convex/users/mutations');
            await (modules as any).acceptInvitation(ctx, {
                tenantUserId,
                token: 'token123',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith(tenantUserId, {
                status: 'active',
                joinedAt: expect.any(Number),
                invitationToken: undefined,
            });
        });
    });

    describe('suspend', () => {
        it('should suspend user', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'user123',
                name: 'Test User',
                status: 'active',
            });

            const modules = await import('../../convex/users/mutations');
            await (modules as any).suspend(ctx, {
                id: 'user123',
                reason: 'Policy violation',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('user123', {
                status: 'suspended',
                suspendedAt: expect.any(Number),
                suspensionReason: 'Policy violation',
            });
        });
    });

    describe('reactivate', () => {
        it('should reactivate suspended user', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'user123',
                name: 'Test User',
                status: 'suspended',
                suspendedAt: Date.now() - 86400000, // 1 day ago
            });

            const modules = await import('../../convex/users/mutations');
            await (modules as any).reactivate(ctx, { id: 'user123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('user123', {
                status: 'active',
                suspendedAt: undefined,
                suspensionReason: undefined,
            });
        });
    });

    describe('remove', () => {
        it('should soft delete user', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'user123',
                name: 'Test User',
                status: 'active',
            });

            const modules = await import('../../convex/users/mutations');
            await (modules as any).remove(ctx, { id: 'user123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('user123', {
                status: 'deleted',
                deletedAt: expect.any(Number),
            });
        });
    });

    describe('removeFromTenant', () => {
        it('should remove user from tenant', async () => {
            const tenantUserId = 'tenantUser123';
            
            ctx.db.get.mockResolvedValue({
                _id: tenantUserId,
                tenantId,
                userId: 'user123',
                status: 'active',
            });

            const modules = await import('../../convex/users/mutations');
            await (modules as any).removeFromTenant(ctx, { tenantUserId });

            expect(ctx.db.delete).toHaveBeenCalledWith(tenantUserId);
        });
    });
});
