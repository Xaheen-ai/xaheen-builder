/**
 * Module Functions Tests
 *
 * Tests for module installation and management.
 * User Stories: US-16.1, US-16.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Module Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Module Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('Catalog', () => {
        describe('list', () => {
            it('should list available modules', async () => {
                const mockQuery = {
                    collect: vi.fn().mockResolvedValue([
                        {
                            _id: 'mod1',
                            name: 'Advanced Booking',
                            key: 'advanced-booking',
                            version: '1.0.0',
                            description: 'Advanced booking features',
                            category: 'bookings',
                            isCore: false,
                            isActive: true,
                            features: ['recurring_bookings', 'waiting_list'],
                            dependencies: [],
                        },
                        {
                            _id: 'mod2',
                            name: 'Payment Gateway',
                            key: 'payment-gateway',
                            version: '2.1.0',
                            description: 'Multiple payment providers',
                            category: 'payments',
                            isCore: false,
                            isActive: true,
                            features: ['stripe', 'paypal'],
                            dependencies: ['billing'],
                        },
                    ])
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/modules/index');
                const result = await (modules as any).catalog(ctx);

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Advanced Booking');
                expect(result[0].features).toEqual(['recurring_bookings', 'waiting_list']);
                expect(result[1].dependencies).toEqual(['billing']);
            });

            it('should filter by category', async () => {
                const mockQuery = {
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'mod1',
                                name: 'Advanced Booking',
                                category: 'bookings',
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/modules/index');
                const result = await (modules as any).list(ctx, { tenantId });

                expect(result).toHaveLength(1);
                expect(result[0].category).toBe('bookings');
            });
        });
    });

    describe('Installation', () => {
        describe('install', () => {
            it('should install module', async () => {
                // Mock module
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({
                            _id: 'mod1',
                            name: 'Advanced Booking',
                            key: 'advanced-booking',
                            version: '1.0.0',
                            dependencies: [],
                        })
                    })
                });

                // Check if already installed
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue(null)
                    })
                });

                const modules = await import('../../convex/modules/index');
                const result = await (modules as any).install(ctx, {
                    tenantId,
                    moduleId: 'messaging',
                });

                expect(result.success).toBe(true);
                expect(ctx.db.patch).toHaveBeenCalledWith(tenantId, {
                    featureFlags: {
                        messaging: true,
                    },
                });
            });

            it('should not install core modules', async () => {
                const modules = await import('../../convex/modules/index');
                await expect((modules as any).install(ctx, {
                    tenantId,
                    moduleId: 'booking',
                })).rejects.toThrow('Cannot install core module: booking');
            });

            it('should check dependencies', async () => {
                const modules = await import('../../convex/modules/index');
                await expect((modules as any).install(ctx, {
                    tenantId,
                    moduleId: 'seasonal-leases',
                })).rejects.toThrow('Missing dependencies: billing');
            });
        });

        describe('uninstall', () => {
            it('should uninstall a module', async () => {
                // Mock tenant with module
                ctx.db.get.mockResolvedValue({
                    _id: tenantId,
                    featureFlags: {
                        messaging: true,
                    },
                });

                const modules = await import('../../convex/modules/index');
                const result = await (modules as any).uninstall(ctx, {
                    tenantId,
                    moduleId: 'messaging',
                });

                expect(result.success).toBe(true);
                expect(ctx.db.patch).toHaveBeenCalledWith(tenantId, {
                    featureFlags: {
                        messaging: false,
                    },
                });
            });

            it('should not uninstall core modules', async () => {
                const modules = await import('../../convex/modules/index');
                await expect((modules as any).uninstall(ctx, {
                    tenantId,
                    moduleId: 'booking',
                })).rejects.toThrow('Cannot uninstall core module: booking');
            });
        });

        describe('enable', () => {
            it('should enable a module', async () => {
                // Mock tenant
                ctx.db.get.mockResolvedValue({
                    _id: tenantId,
                    featureFlags: {},
                });

                const modules = await import('../../convex/modules/index');
                const result = await (modules as any).enable(ctx, {
                    tenantId,
                    moduleId: 'messaging',
                });

                expect(result.success).toBe(true);
                expect(ctx.db.patch).toHaveBeenCalledWith(tenantId, {
                    featureFlags: {
                        messaging: true,
                    },
                });
            });
        });

        describe('disable', () => {
            it('should disable a module', async () => {
                // Mock tenant with module
                ctx.db.get.mockResolvedValue({
                    _id: tenantId,
                    featureFlags: {
                        messaging: true,
                    },
                });

                const modules = await import('../../convex/modules/index');
                const result = await (modules as any).disable(ctx, {
                    tenantId,
                    moduleId: 'messaging',
                });

                expect(result.success).toBe(true);
                expect(ctx.db.patch).toHaveBeenCalledWith(tenantId, {
                    featureFlags: {
                        messaging: false,
                    },
                });
            });
        });
    });
});
