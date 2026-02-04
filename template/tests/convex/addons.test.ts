/**
 * Addon Functions Tests
 *
 * Tests for addons and resource-addon associations.
 * User Stories: US-7.1, US-7.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Addon Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Addon Test Tenant' });
        resourceId = store.seedResource({ 
            tenantId, 
            name: 'Test Resource',
            slug: 'test-resource'
        });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list addons for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'addon1', name: 'Cleaning Service', price: 500 },
                        { _id: 'addon2', name: 'Equipment Rental', price: 200 },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/addons');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Cleaning Service');
            expect(result[0].price).toBe(500);
        });
    });

    describe('get', () => {
        it('should get addon by ID', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'addon123',
                name: 'Cleaning Service',
                price: 500,
                currency: 'NOK',
                isActive: true,
            });

            const modules = await import('../../convex/domain/addons');
            const result = await (modules as any).get(ctx, { id: 'addon123' });

            expect(result).toBeDefined();
            expect(result.name).toBe('Cleaning Service');
            expect(result.price).toBe(500);
        });

        it('should throw if addon not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/domain/addons');
            
            await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Addon not found');
        });
    });

    describe('create', () => {
        it('should create addon', async () => {
            ctx.db.insert.mockResolvedValue('addon123');

            const modules = await import('../../convex/domain/addons');
            const result = await (modules as any).create(ctx, {
                tenantId,
                name: 'New Addon',
                description: 'Test addon',
                price: 300,
                currency: 'NOK',
                pricingType: 'fixed',
            });

            expect(result.id).toBe('addon123');
            expect(ctx.db.insert).toHaveBeenCalledWith('addons', expect.objectContaining({
                name: 'New Addon',
                price: 300,
                currency: 'NOK',
                pricingType: 'fixed',
                tenantId,
            }));
        });
    });

    describe('update', () => {
        it('should update addon', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'addon123',
                name: 'Old Name',
                price: 300,
                isActive: true,
            });

            const modules = await import('../../convex/domain/addons');
            await (modules as any).update(ctx, {
                id: 'addon123',
                name: 'Updated Name',
                price: 350,
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('addon123', {
                name: 'Updated Name',
                price: 350,
            });
        });
    });

    describe('remove', () => {
        it('should soft delete addon', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'addon123',
                name: 'To Delete',
                isActive: true,
            });

            const modules = await import('../../convex/domain/addons');
            await (modules as any).remove(ctx, { id: 'addon123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('addon123', {
                isActive: false,
                deletedAt: expect.any(Number),
            });
        });
    });

    describe('listForResource', () => {
        it('should list addons for resource', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'ra1', resourceId, addonId: 'addon1', isActive: true },
                        { _id: 'ra2', resourceId, addonId: 'addon2', isActive: true },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock addon details
            ctx.db.get
                .mockResolvedValueOnce({ _id: 'addon1', name: 'Cleaning Service', price: 500 })
                .mockResolvedValueOnce({ _id: 'addon2', name: 'Equipment Rental', price: 200 });

            const modules = await import('../../convex/domain/addons');
            const result = await (modules as any).listForResource(ctx, { resourceId });

            expect(result).toHaveLength(2);
            expect(result[0].addon.name).toBe('Cleaning Service');
            expect(result[1].addon.name).toBe('Equipment Rental');
        });
    });

    describe('addToResource', () => {
        it('should add addon to resource', async () => {
            const addonId = store.seedAddon({ 
                tenantId, 
                name: 'Cleaning Service',
                price: 500
            });
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            ctx.db.insert.mockResolvedValue('ra123');

            const modules = await import('../../convex/domain/addons');
            const result = await (modules as any).addToResource(ctx, {
                resourceId,
                addonId,
                price: 450, // Override price for this resource
            });

            expect(result.id).toBe('ra123');
            expect(ctx.db.insert).toHaveBeenCalledWith('resourceAddons', expect.objectContaining({
                resourceId,
                addonId,
                price: 450,
            }));
        });

        it('should prevent duplicate addon on resource', async () => {
            const addonId = 'addon123';
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({ _id: 'existing' })
                })
            });

            const modules = await import('../../convex/domain/addons');
            
            await expect((modules as any).addToResource(ctx, {
                resourceId,
                addonId,
            })).rejects.toThrow('Addon already added to resource');
        });
    });

    describe('removeFromResource', () => {
        it('should remove addon from resource', async () => {
            const addonId = 'addon123';
            
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'ra123',
                        resourceId,
                        addonId,
                    })
                })
            });

            const modules = await import('../../convex/domain/addons');
            await (modules as any).removeFromResource(ctx, { resourceId, addonId });

            expect(ctx.db.delete).toHaveBeenCalledWith('ra123');
        });
    });
});
