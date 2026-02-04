/**
 * RBAC Functions Tests
 *
 * Tests for role-based access control.
 * User Stories: US-15.1, US-15.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('RBAC Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'RBAC Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('Roles', () => {
        describe('list', () => {
            it('should list roles for tenant', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { 
                                _id: 'role1', 
                                name: 'Admin',
                                permissions: ['*'],
                                isSystem: false,
                            },
                            { 
                                _id: 'role2', 
                                name: 'Resource Manager',
                                permissions: ['resource:read', 'resource:write'],
                                isSystem: false,
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).list(ctx, { tenantId });

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Admin');
                expect(result[0].permissions).toEqual(['*']);
                expect(result[1].name).toBe('Resource Manager');
            });
        });

        describe('create', () => {
            it('should create role', async () => {
                ctx.db.insert.mockResolvedValue('role123');
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue(null)
                    })
                });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).create(ctx, {
                    tenantId,
                    name: 'Custom Role',
                    description: 'A custom role for testing',
                    permissions: ['booking:read', 'booking:write'],
                });

                expect(result.id).toBe('role123');
                expect(ctx.db.insert).toHaveBeenCalledWith('roles', expect.objectContaining({
                    tenantId,
                    name: 'Custom Role',
                    description: 'A custom role for testing',
                    permissions: ['booking:read', 'booking:write'],
                    isSystem: false,
                }));
            });

            it('should validate role name uniqueness', async () => {
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({ _id: 'existing' })
                    })
                });

                const modules = await import('../../convex/rbac/index');
                
                await expect((modules as any).create(ctx, {
                    tenantId,
                    name: 'Existing Role',
                    permissions: [],
                })).rejects.toThrow('Role with this name already exists');
            });
        });

        describe('update', () => {
            it('should update role', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'role123',
                    name: 'Old Name',
                    permissions: ['booking:read'],
                    isSystem: false,
                });

                const modules = await import('../../convex/rbac/index');
                await (modules as any).update(ctx, {
                    id: 'role123',
                    name: 'Updated Name',
                    permissions: ['booking:read', 'booking:write'],
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('role123', {
                    name: 'Updated Name',
                    permissions: ['booking:read', 'booking:write'],
                });
            });

            it('should prevent updating system role', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'role123',
                    isSystem: true,
                });

                const modules = await import('../../convex/rbac/index');
                
                await expect((modules as any).update(ctx, {
                    id: 'role123',
                    name: 'Updated',
                })).rejects.toThrow('Cannot modify system role');
            });
        });

        describe('remove', () => {
            it('should delete role', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'role123',
                    isSystem: false,
                });

                // Check for users with this role
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([])
                    })
                });

                const modules = await import('../../convex/rbac/index');
                await (modules as any).remove(ctx, { id: 'role123' });

                expect(ctx.db.delete).toHaveBeenCalledWith('role123');
            });

            it('should prevent deleting system role', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'role123',
                    isSystem: true,
                });

                const modules = await import('../../convex/rbac/index');
                
                await expect((modules as any).remove(ctx, { id: 'role123' })).rejects.toThrow('Cannot delete system role');
            });

            it('should prevent deleting role with users', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'role123',
                    isSystem: false,
                });

                // Mock users with this role
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'user1' },
                            { _id: 'user2' },
                        ])
                    })
                });

                const modules = await import('../../convex/rbac/index');
                
                await expect((modules as any).remove(ctx, { id: 'role123' })).rejects.toThrow(
                    'Cannot delete role assigned to users'
                );
            });
        });
    });

    describe('User Roles', () => {
        describe('assign', () => {
            it('should assign role to user', async () => {
                // Mock role
                ctx.db.get.mockResolvedValueOnce({
                    _id: 'role123',
                    name: 'Resource Manager',
                    permissions: ['resource:read', 'resource:write'],
                });

                // Check existing assignment
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue(null)
                    })
                });

                ctx.db.insert.mockResolvedValue('ur123');

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).assign(ctx, {
                    tenantId,
                    userId: 'user123',
                    roleId: 'role123',
                });

                expect(result.id).toBe('ur123');
                expect(ctx.db.insert).toHaveBeenCalledWith('userRoles', expect.objectContaining({
                    tenantId,
                    userId: 'user123',
                    roleId: 'role123',
                }));
            });

            it('should prevent duplicate assignments', async () => {
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({ _id: 'existing' })
                    })
                });

                const modules = await import('../../convex/rbac/index');
                
                await expect((modules as any).assign(ctx, {
                    tenantId,
                    userId: 'user123',
                    roleId: 'role123',
                })).rejects.toThrow('User already has this role');
            });
        });

        describe('remove', () => {
            it('should remove role from user', async () => {
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({
                            _id: 'ur123',
                            userId: 'user123',
                            roleId: 'role123',
                        })
                    })
                });

                const modules = await import('../../convex/rbac/index');
                await (modules as any).remove(ctx, {
                    tenantId,
                    userId: 'user123',
                    roleId: 'role123',
                });

                expect(ctx.db.delete).toHaveBeenCalledWith('ur123');
            });

            it('should throw if assignment not found', async () => {
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue(null)
                    })
                });

                const modules = await import('../../convex/rbac/index');
                
                await expect((modules as any).remove(ctx, {
                    tenantId,
                    userId: 'user123',
                    roleId: 'role123',
                })).rejects.toThrow('Role assignment not found');
            });
        });

        describe('getUserRoles', () => {
            it('should get user roles with permissions', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                            { roleId: 'role2' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                // Mock role details
                ctx.db.get
                    .mockResolvedValueOnce({
                        _id: 'role1',
                        name: 'Admin',
                        permissions: ['*'],
                    })
                    .mockResolvedValueOnce({
                        _id: 'role2',
                        name: 'Resource Manager',
                        permissions: ['resource:read', 'resource:write'],
                    });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).getUserRoles(ctx, { 
                    tenantId,
                    userId: 'user123'
                });

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Admin');
                expect(result[0].permissions).toEqual(['*']);
                expect(result[1].name).toBe('Resource Manager');
                expect(result[1].permissions).toEqual(['resource:read', 'resource:write']);
            });
        });
    });

    describe('Permissions', () => {
        describe('check', () => {
            it('should allow access with wildcard permission', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);
                ctx.db.get.mockResolvedValue({
                    _id: 'role1',
                    permissions: ['*'],
                });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).check(ctx, {
                    tenantId,
                    userId: 'user123',
                    permission: 'any:action',
                });

                expect(result.allowed).toBe(true);
            });

            it('should allow access with matching permission', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);
                ctx.db.get.mockResolvedValue({
                    _id: 'role1',
                    permissions: ['resource:read', 'resource:write'],
                });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).check(ctx, {
                    tenantId,
                    userId: 'user123',
                    permission: 'resource:read',
                });

                expect(result.allowed).toBe(true);
            });

            it('should deny access without permission', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);
                ctx.db.get.mockResolvedValue({
                    _id: 'role1',
                    permissions: ['resource:read'],
                });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).check(ctx, {
                    tenantId,
                    userId: 'user123',
                    permission: 'resource:delete',
                });

                expect(result.allowed).toBe(false);
            });

            it('should handle pattern matching', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);
                ctx.db.get.mockResolvedValue({
                    _id: 'role1',
                    permissions: ['booking:*'],
                });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).check(ctx, {
                    tenantId,
                    userId: 'user123',
                    permission: 'booking:create',
                });

                expect(result.allowed).toBe(true);
            });
        });

        describe('getUserPermissions', () => {
            it('should aggregate all user permissions', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                            { roleId: 'role2' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                // Mock roles
                ctx.db.get
                    .mockResolvedValueOnce({
                        _id: 'role1',
                        permissions: ['resource:read', 'resource:write'],
                    })
                    .mockResolvedValueOnce({
                        _id: 'role2',
                        permissions: ['booking:read', 'booking:write'],
                    });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).getUserPermissions(ctx, {
                    tenantId,
                    userId: 'user123',
                });

                expect(result.permissions).toEqual([
                    'resource:read',
                    'resource:write',
                    'booking:read',
                    'booking:write',
                ]);
            });

            it('should deduplicate permissions', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { roleId: 'role1' },
                            { roleId: 'role2' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                // Mock roles with overlapping permissions
                ctx.db.get
                    .mockResolvedValueOnce({
                        _id: 'role1',
                        permissions: ['resource:read', 'resource:write'],
                    })
                    .mockResolvedValueOnce({
                        _id: 'role2',
                        permissions: ['resource:read', 'booking:read'],
                    });

                const modules = await import('../../convex/rbac/index');
                const result = await (modules as any).getUserPermissions(ctx, {
                    tenantId,
                    userId: 'user123',
                });

                expect(result.permissions).toEqual([
                    'resource:read',
                    'resource:write',
                    'booking:read',
                ]);
            });
        });
    });
});
