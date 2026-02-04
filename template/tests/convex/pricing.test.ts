/**
 * Pricing Functions Tests
 *
 * Tests for pricing groups, resource pricing, and price calculation.
 * User Stories: US-8.1, US-8.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Pricing Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Pricing Test Tenant' });
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

    describe('listGroups', () => {
        it('should list pricing groups for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { _id: 'group1', name: 'Standard', type: 'base' },
                        { _id: 'group2', name: 'Premium', type: 'base' },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).listGroups(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Standard');
        });
    });

    describe('createGroup', () => {
        it('should create pricing group', async () => {
            ctx.db.insert.mockResolvedValue('group123');
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue(null)
                })
            });

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).createGroup(ctx, {
                tenantId,
                name: 'New Group',
                type: 'base',
                description: 'Test pricing group',
            });

            expect(result.id).toBe('group123');
            expect(ctx.db.insert).toHaveBeenCalledWith('pricingGroups', expect.objectContaining({
                name: 'New Group',
                type: 'base',
                tenantId,
            }));
        });
    });

    describe('listForResource', () => {
        it('should list pricing for resource', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { 
                            _id: 'pricing1', 
                            resourceId,
                            groupId: 'group1',
                            price: 500,
                            currency: 'NOK',
                            unit: 'hour'
                        },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            // Mock group details
            ctx.db.get.mockResolvedValue({
                _id: 'group1',
                name: 'Standard',
                type: 'base',
            });

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).listForResource(ctx, { resourceId });

            expect(result).toHaveLength(1);
            expect(result[0].price).toBe(500);
            expect(result[0].group.name).toBe('Standard');
        });
    });

    describe('create', () => {
        it('should create resource pricing', async () => {
            const groupId = store.seedPricingGroup({ 
                tenantId, 
                name: 'Standard'
            });
            
            ctx.db.insert.mockResolvedValue('pricing123');

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).create(ctx, {
                resourceId,
                groupId,
                price: 600,
                currency: 'NOK',
                unit: 'hour',
            });

            expect(result.id).toBe('pricing123');
            expect(ctx.db.insert).toHaveBeenCalledWith('resourcePricing', expect.objectContaining({
                resourceId,
                groupId,
                price: 600,
                currency: 'NOK',
                unit: 'hour',
            }));
        });
    });

    describe('update', () => {
        it('should update pricing', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'pricing123',
                resourceId,
                price: 500,
                currency: 'NOK',
            });

            const modules = await import('../../convex/domain/pricing');
            await (modules as any).update(ctx, {
                id: 'pricing123',
                price: 550,
                currency: 'NOK',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('pricing123', {
                price: 550,
                currency: 'NOK',
            });
        });
    });

    describe('remove', () => {
        it('should delete pricing', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'pricing123',
                resourceId,
                price: 500,
            });

            const modules = await import('../../convex/domain/pricing');
            await (modules as any).remove(ctx, { id: 'pricing123' });

            expect(ctx.db.delete).toHaveBeenCalledWith('pricing123');
        });
    });

    describe('calculatePrice', () => {
        it('should calculate base price for booking', async () => {
            const startTime = Date.now();
            const endTime = startTime + 2 * 60 * 60 * 1000; // 2 hours

            // Mock resource pricing
            const pricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        {
                            _id: 'pricing1',
                            resourceId,
                            price: 500,
                            currency: 'NOK',
                            unit: 'hour',
                            pricingRule: {},
                        },
                    ])
                })
            };

            // Mock user pricing groups (none)
            const userPricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            // Mock organization pricing groups (none)
            const orgPricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            // Mock addons (none)
            const addonQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            ctx.db.query
                .mockReturnValueOnce(pricingQuery)
                .mockReturnValueOnce(userPricingQuery)
                .mockReturnValueOnce(orgPricingQuery)
                .mockReturnValueOnce(addonQuery);

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).calculatePrice(ctx, {
                resourceId,
                startTime,
                endTime,
                userId,
            });

            expect(result.total).toBe(1000); // 500 * 2 hours
            expect(result.currency).toBe('NOK');
            expect(result.breakdown.base).toBe(1000);
        });

        it('should apply discount from user pricing group', async () => {
            const startTime = Date.now();
            const endTime = startTime + 2 * 60 * 60 * 1000; // 2 hours

            // Mock resource pricing
            const pricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        {
                            _id: 'pricing1',
                            resourceId,
                            price: 500,
                            currency: 'NOK',
                            unit: 'hour',
                            pricingRule: {},
                        },
                    ])
                })
            };

            // Mock user pricing groups with discount
            const userPricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        {
                            _id: 'userPricing1',
                            userId,
                            groupId: 'discountGroup',
                            discountPercent: 10, // 10% discount
                        },
                    ])
                })
            };

            // Mock organization pricing groups (none)
            const orgPricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            // Mock addons (none)
            const addonQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            ctx.db.query
                .mockReturnValueOnce(pricingQuery)
                .mockReturnValueOnce(userPricingQuery)
                .mockReturnValueOnce(orgPricingQuery)
                .mockReturnValueOnce(addonQuery);

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).calculatePrice(ctx, {
                resourceId,
                startTime,
                endTime,
                userId,
            });

            expect(result.total).toBe(900); // 1000 - 10% discount
            expect(result.breakdown.discounts).toHaveLength(1);
            expect(result.breakdown.discounts[0].amount).toBe(100);
        });

        it('should include addon prices', async () => {
            const startTime = Date.now();
            const endTime = startTime + 1 * 60 * 60 * 1000; // 1 hour

            // Mock resource pricing
            const pricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        {
                            _id: 'pricing1',
                            resourceId,
                            price: 500,
                            currency: 'NOK',
                            unit: 'hour',
                            pricingRule: {},
                        },
                    ])
                })
            };

            // Mock user pricing groups (none)
            const userPricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            // Mock organization pricing groups (none)
            const orgPricingQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([])
                })
            };

            // Mock addons
            const addonQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        {
                            _id: 'ra1',
                            resourceId,
                            addonId: 'addon1',
                            price: 100,
                            pricingType: 'fixed',
                        },
                        {
                            _id: 'ra2',
                            resourceId,
                            addonId: 'addon2',
                            price: 50,
                            pricingType: 'per_hour',
                        },
                    ])
                })
            };

            ctx.db.query
                .mockReturnValueOnce(pricingQuery)
                .mockReturnValueOnce(userPricingQuery)
                .mockReturnValueOnce(orgPricingQuery)
                .mockReturnValueOnce(addonQuery);

            const modules = await import('../../convex/domain/pricing');
            const result = await (modules as any).calculatePrice(ctx, {
                resourceId,
                startTime,
                endTime,
                userId,
                addonIds: ['addon1', 'addon2'],
            });

            expect(result.total).toBe(650); // 500 (base) + 100 (fixed) + 50 (per hour)
            expect(result.breakdown.addons).toHaveLength(2);
            expect(result.breakdown.addons[0].price).toBe(100);
            expect(result.breakdown.addons[1].price).toBe(50);
        });
    });
});
