/**
 * Monitoring Functions Tests
 *
 * Tests for metrics collection and monitoring dashboards.
 * User Stories: US-13.1, US-13.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Monitoring Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Monitoring Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('Booking Metrics', () => {
        describe('getBookingMetrics', () => {
            it('should calculate booking metrics for date range', async () => {
                const now = Date.now();
                const startDate = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
                const endDate = now;

                // Mock bookings query
                const bookingsQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                { status: 'confirmed', totalPrice: 500 },
                                { status: 'confirmed', totalPrice: 300 },
                                { status: 'pending', totalPrice: 200 },
                                { status: 'cancelled', totalPrice: 100 },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(bookingsQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).getBookingMetrics(ctx, {
                    tenantId,
                    startDate,
                    endDate,
                });

                expect(result.total).toBe(4);
                expect(result.byStatus.confirmed).toBe(2);
                expect(result.byStatus.pending).toBe(1);
                expect(result.byStatus.cancelled).toBe(1);
                expect(result.totalRevenue).toBe(800); // 500 + 300 (confirmed only)
            });

            it('should group by date', async () => {
                const now = Date.now();
                const today = new Date(now).toDateString();
                const yesterday = new Date(now - 86400000).toDateString();

                const bookingsQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                { status: 'confirmed', totalPrice: 500, _creationTime: now },
                                { status: 'confirmed', totalPrice: 300, _creationTime: now - 86400000 },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(bookingsQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).getBookingMetrics(ctx, {
                    tenantId,
                    startDate: now - 86400000,
                    endDate: now,
                    groupBy: 'date',
                });

                expect(result.byDate[today].count).toBe(1);
                expect(result.byDate[today].revenue).toBe(500);
                expect(result.byDate[yesterday].count).toBe(1);
                expect(result.byDate[yesterday].revenue).toBe(300);
            });
        });

        describe('getResourceUtilization', () => {
            it('should calculate resource utilization', async () => {
                const now = Date.now();
                const startDate = now - 7 * 24 * 60 * 60 * 1000;
                const endDate = now;

                // Mock resources
                const resourcesQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'resource1', capacity: 8 },
                            { _id: 'resource2', capacity: 4 },
                        ])
                    })
                };
                
                // Mock bookings
                const bookingsQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                {
                                    resourceId: 'resource1',
                                    startTime: startDate + 3600000,
                                    endTime: startDate + 7200000,
                                    quantity: 4,
                                },
                                {
                                    resourceId: 'resource1',
                                    startTime: startDate + 10800000,
                                    endTime: startDate + 14400000,
                                    quantity: 6,
                                },
                                {
                                    resourceId: 'resource2',
                                    startTime: startDate + 3600000,
                                    endTime: startDate + 7200000,
                                    quantity: 2,
                                },
                            ])
                        })
                    })
                };
                
                ctx.db.query
                    .mockReturnValueOnce(resourcesQuery)
                    .mockReturnValueOnce(bookingsQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).getResourceUtilization(ctx, {
                    tenantId,
                    startDate,
                    endDate,
                });

                expect(result.totalResources).toBe(2);
                expect(result.utilization.resource1).toBe(62.5); // (4+6)/8 * 100 / 2 slots
                expect(result.utilization.resource2).toBe(50); // 2/4 * 100
                expect(result.averageUtilization).toBe(56.25); // (62.5 + 50) / 2
            });
        });
    });

    describe('Availability Metrics', () => {
        describe('getAvailabilityMetrics', () => {
            it('should calculate availability metrics', async () => {
                const now = Date.now();
                const startDate = now - 7 * 24 * 60 * 60 * 1000;
                const endDate = now;

                // Mock blocks
                const blocksQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                {
                                    resourceId: 'resource1',
                                    type: 'available',
                                    startTime: startDate + 3600000,
                                    endTime: startDate + 7200000,
                                },
                                {
                                    resourceId: 'resource1',
                                    type: 'blocked',
                                    startTime: startDate + 10800000,
                                    endTime: startDate + 14400000,
                                },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(blocksQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).getAvailabilityMetrics(ctx, {
                    tenantId,
                    startDate,
                    endDate,
                });

                expect(result.totalHours).toBe(4); // 2 blocks of 1 hour each
                expect(result.availableHours).toBe(1);
                expect(result.blockedHours).toBe(1);
                expect(result.availabilityPercentage).toBe(50); // 1/2 * 100
            });
        });
    });

    describe('Report Schedules', () => {
        describe('createSchedule', () => {
            it('should create report schedule', async () => {
                ctx.db.insert.mockResolvedValue('schedule123');

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).createSchedule(ctx, {
                    tenantId,
                    name: 'Weekly Report',
                    type: 'booking_metrics',
                    frequency: 'weekly',
                    recipients: ['admin@example.com', 'manager@example.com'],
                    config: {
                        startDate: Date.now(),
                        dayOfWeek: 1, // Monday
                        time: '09:00',
                    },
                });

                expect(result.id).toBe('schedule123');
                expect(ctx.db.insert).toHaveBeenCalledWith('reportSchedules', expect.objectContaining({
                    tenantId,
                    name: 'Weekly Report',
                    type: 'booking_metrics',
                    frequency: 'weekly',
                    active: true,
                }));
            });
        });

        describe('listSchedules', () => {
            it('should list report schedules', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'schedule1',
                                name: 'Daily Report',
                                type: 'booking_metrics',
                                frequency: 'daily',
                                active: true,
                                lastRun: Date.now() - 86400000,
                            },
                            {
                                _id: 'schedule2',
                                name: 'Weekly Report',
                                type: 'resource_utilization',
                                frequency: 'weekly',
                                active: false,
                                lastRun: Date.now() - 7 * 86400000,
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).listSchedules(ctx, { tenantId });

                expect(result).toHaveLength(2);
                expect(result[0].active).toBe(true);
                expect(result[1].active).toBe(false);
            });
        });

        describe('updateSchedule', () => {
            it('should update report schedule', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'schedule123',
                    name: 'Old Name',
                    frequency: 'daily',
                    active: true,
                });

                const modules = await import('../../convex/monitoring/index');
                await (modules as any).updateSchedule(ctx, {
                    id: 'schedule123',
                    name: 'Updated Name',
                    frequency: 'weekly',
                    active: false,
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('schedule123', {
                    name: 'Updated Name',
                    frequency: 'weekly',
                    active: false,
                });
            });
        });

        describe('deleteSchedule', () => {
            it('should delete report schedule', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'schedule123',
                    active: false,
                });

                const modules = await import('../../convex/monitoring/index');
                await (modules as any).deleteSchedule(ctx, { id: 'schedule123' });

                expect(ctx.db.delete).toHaveBeenCalledWith('schedule123');
            });

            it('should prevent deleting active schedule', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'schedule123',
                    active: true,
                });

                const modules = await import('../../convex/monitoring/index');
                
                await expect((modules as any).deleteSchedule(ctx, { id: 'schedule123' })).rejects.toThrow(
                    'Cannot delete active schedule'
                );
            });
        });
    });

    describe('Dashboard', () => {
        describe('getDashboardData', () => {
            it('should get comprehensive dashboard data', async () => {
                const now = Date.now();
                const today = new Date(now);
                const thisMonth = new Date(now);
                thisMonth.setDate(1);

                // Mock various queries
                const bookingsQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                { status: 'confirmed', totalPrice: 500, _creationTime: now },
                                { status: 'pending', totalPrice: 200, _creationTime: now },
                            ])
                        })
                    })
                };

                const resourcesQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { status: 'published' },
                            { status: 'published' },
                            { status: 'draft' },
                        ])
                    })
                };

                const usersQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { status: 'active' },
                            { status: 'active' },
                            { status: 'invited' },
                        ])
                    })
                };
                
                ctx.db.query
                    .mockReturnValueOnce(bookingsQuery) // Today's bookings
                    .mockReturnValueOnce(bookingsQuery) // This month's bookings
                    .mockReturnValueOnce(resourcesQuery) // Resources
                    .mockReturnValueOnce(usersQuery); // Users

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).getDashboardData(ctx, { tenantId });

                expect(result.today.bookings).toBe(2);
                expect(result.today.revenue).toBe(500); // Only confirmed
                expect(result.thisMonth.bookings).toBe(2);
                expect(result.thisMonth.revenue).toBe(500);
                expect(result.resources.total).toBe(3);
                expect(result.resources.published).toBe(2);
                expect(result.users.total).toBe(3);
                expect(result.users.active).toBe(2);
            });
        });
    });

    describe('Export', () => {
        describe('exportMetrics', () => {
            it('should export metrics to CSV', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                {
                                    date: '2024-01-01',
                                    bookings: 10,
                                    revenue: 5000,
                                    utilization: 75.5,
                                },
                                {
                                    date: '2024-01-02',
                                    bookings: 8,
                                    revenue: 4000,
                                    utilization: 60.0,
                                },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).exportMetrics(ctx, {
                    tenantId,
                    type: 'booking_metrics',
                    format: 'csv',
                    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
                    endDate: Date.now(),
                });

                expect(result.format).toBe('csv');
                expect(result.data).toContain('date,bookings,revenue,utilization');
                expect(result.data).toContain('2024-01-01,10,5000,75.5');
                expect(result.filename).toMatch(/booking_metrics_\d{4}-\d{2}-\d{2}\.csv$/);
            });

            it('should export metrics to JSON', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                {
                                    date: '2024-01-01',
                                    bookings: 10,
                                    revenue: 5000,
                                },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/monitoring/index');
                const result = await (modules as any).exportMetrics(ctx, {
                    tenantId,
                    type: 'booking_metrics',
                    format: 'json',
                    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
                    endDate: Date.now(),
                });

                expect(result.format).toBe('json');
                const parsed = JSON.parse(result.data);
                expect(parsed).toHaveLength(1);
                expect(parsed[0].bookings).toBe(10);
                expect(parsed[0].revenue).toBe(5000);
            });
        });
    });
});
