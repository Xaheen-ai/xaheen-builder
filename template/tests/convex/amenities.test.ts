/**
 * Amenity Functions Tests
 *
 * Tests for amenity groups, amenities, and resource associations.
 * User Stories: US-6.1, US-6.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Amenity Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Amenity Test Tenant' });
        resourceId = store.seedResource({ 
            tenantId, 
            name: 'Test Resource',
            slug: 'test-resource'
        });
        ctx = createMockContext(store);
    });

    describe('listGroups', () => {
        it('should list amenity groups for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'group1', name: 'Equipment', sortOrder: 0 },
                        { _id: 'group2', name: 'Services', sortOrder: 1 },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).listGroups(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Equipment');
        });
    });

    describe('list', () => {
        it('should list amenities', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'amenity1', name: 'Projector', groupId: 'group1' },
                        { _id: 'amenity2', name: 'Whiteboard', groupId: 'group1' },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Projector');
        });
    });

    describe('get', () => {
        it('should get amenity with group', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'amenity123',
                name: 'Projector',
                groupId: 'group123',
            });

            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'group123',
                        name: 'Equipment',
                    })
                })
            });

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).get(ctx, { id: 'amenity123' });

            expect(result).toBeDefined();
            expect(result.name).toBe('Projector');
            expect(result.group).toBeDefined();
            expect(result.group.name).toBe('Equipment');
        });
    });

    describe('createGroup', () => {
        it('should create amenity group', async () => {
            ctx.db.insert.mockResolvedValue('group123');
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).createGroup(ctx, {
                tenantId,
                name: 'New Group',
                description: 'Test group',
            });

            expect(result.id).toBe('group123');
            expect(ctx.db.insert).toHaveBeenCalledWith('amenityGroups', expect.objectContaining({
                name: 'New Group',
                tenantId,
            }));
        });
    });

    describe('create', () => {
        it('should create amenity', async () => {
            const groupId = store.seedAmenityGroup({ tenantId, name: 'Equipment' });
            
            ctx.db.insert.mockResolvedValue('amenity123');
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).create(ctx, {
                tenantId,
                groupId,
                name: 'New Amenity',
                description: 'Test amenity',
            });

            expect(result.id).toBe('amenity123');
            expect(ctx.db.insert).toHaveBeenCalledWith('amenities', expect.objectContaining({
                name: 'New Amenity',
                groupId,
                tenantId,
            }));
        });
    });

    describe('update', () => {
        it('should update amenity', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'amenity123',
                name: 'Old Name',
                groupId: 'group123',
            });

            const modules = await import('../../convex/domain/amenities');
            await (modules as any).update(ctx, {
                id: 'amenity123',
                name: 'New Name',
                description: 'Updated description',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('amenity123', {
                name: 'New Name',
                description: 'Updated description',
            });
        });
    });

    describe('remove', () => {
        it('should delete amenity', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'amenity123',
                name: 'To Delete',
                groupId: 'group123',
            });

            const modules = await import('../../convex/domain/amenities');
            await (modules as any).remove(ctx, { id: 'amenity123' });

            expect(ctx.db.delete).toHaveBeenCalledWith('amenity123');
        });
    });

    describe('listForResource', () => {
        it('should list amenities for resource', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'ra1', resourceId, amenityId: 'amenity1' },
                        { _id: 'ra2', resourceId, amenityId: 'amenity2' },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock amenity details
            ctx.db.get
                .mockResolvedValueOnce({ _id: 'amenity1', name: 'Projector' })
                .mockResolvedValueOnce({ _id: 'amenity2', name: 'Whiteboard' });

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).listForResource(ctx, { resourceId });

            expect(result).toHaveLength(2);
            expect(result[0].amenity.name).toBe('Projector');
            expect(result[1].amenity.name).toBe('Whiteboard');
        });
    });

    describe('addToResource', () => {
        it('should add amenity to resource', async () => {
            const amenityId = store.seedAmenity({ 
                tenantId, 
                name: 'Projector',
                groupId: 'group123'
            });
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            ctx.db.insert.mockResolvedValue('ra123');

            const modules = await import('../../convex/domain/amenities');
            const result = await (modules as any).addToResource(ctx, {
                resourceId,
                amenityId,
                quantity: 2,
            });

            expect(result.id).toBe('ra123');
            expect(ctx.db.insert).toHaveBeenCalledWith('resourceAmenities', expect.objectContaining({
                resourceId,
                amenityId,
                quantity: 2,
            }));
        });

        it('should prevent duplicate amenity on resource', async () => {
            const amenityId = 'amenity123';
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({ _id: 'existing' })
                })
            });

            const modules = await import('../../convex/domain/amenities');
            
            await expect((modules as any).addToResource(ctx, {
                resourceId,
                amenityId,
            })).rejects.toThrow('Amenity already added to resource');
        });
    });

    describe('removeFromResource', () => {
        it('should remove amenity from resource', async () => {
            const amenityId = 'amenity123';
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'ra123',
                        resourceId,
                        amenityId,
                    })
                })
            });

            const modules = await import('../../convex/domain/amenities');
            await (modules as any).removeFromResource(ctx, { resourceId, amenityId });

            expect(ctx.db.delete).toHaveBeenCalledWith('ra123');
        });
    });
});
