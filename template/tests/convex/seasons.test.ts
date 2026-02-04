/**
 * Season Functions Tests
 *
 * Tests for seasons, applications, allocations, and leases.
 * User Stories: US-9.1, US-9.2, US-9.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Season Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let resourceId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Season Test Tenant' });
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

    describe('list', () => {
        it('should list seasons for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { 
                            _id: 'season1', 
                            name: 'Summer 2024', 
                            type: 'rental',
                            status: 'draft',
                            startDate: Date.now(),
                            endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
                        },
                        { 
                            _id: 'season2', 
                            name: 'Winter 2024', 
                            type: 'rental',
                            status: 'published',
                            startDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
                            endDate: Date.now() + 270 * 24 * 60 * 60 * 1000,
                        },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/domain/seasons');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Summer 2024');
            expect(result[1].status).toBe('published');
        });
    });

    describe('get', () => {
        it('should get season with application stats', async () => {
            const seasonId = 'season123';
            
            ctx.db.get.mockResolvedValue({
                _id: seasonId,
                name: 'Summer 2024',
                type: 'rental',
                status: 'published',
            });

            // Mock applications
            const applicationsQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { status: 'pending' },
                        { status: 'approved' },
                        { status: 'approved' },
                        { status: 'rejected' },
                    ])
                })
            };

            ctx.db.query.mockReturnValue(applicationsQuery);

            const modules = await import('../../convex/domain/seasons');
            const result = await (modules as any).get(ctx, { id: seasonId });

            expect(result).toBeDefined();
            expect(result.name).toBe('Summer 2024');
            expect(result.applicationStats.total).toBe(4);
            expect(result.applicationStats.byStatus.pending).toBe(1);
            expect(result.applicationStats.byStatus.approved).toBe(2);
            expect(result.applicationStats.byStatus.rejected).toBe(1);
        });
    });

    describe('create', () => {
        it('should create season', async () => {
            const now = Date.now();
            ctx.db.insert.mockResolvedValue('season123');

            const modules = await import('../../convex/domain/seasons');
            const result = await (modules as any).create(ctx, {
                tenantId,
                name: 'New Season',
                description: 'Test season',
                startDate: now,
                endDate: now + 90 * 24 * 60 * 60 * 1000,
                type: 'rental',
            });

            expect(result.id).toBe('season123');
            expect(ctx.db.insert).toHaveBeenCalledWith('seasons', expect.objectContaining({
                name: 'New Season',
                type: 'rental',
                status: 'draft',
                tenantId,
            }));
        });
    });

    describe('publish', () => {
        it('should publish season', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'season123',
                name: 'Test Season',
                status: 'draft',
            });

            const modules = await import('../../convex/domain/seasons');
            await (modules as any).publish(ctx, { id: 'season123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('season123', {
                status: 'published',
                isActive: true,
            });
        });
    });

    describe('close', () => {
        it('should close season', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'season123',
                name: 'Test Season',
                status: 'published',
            });

            const modules = await import('../../convex/domain/seasons');
            await (modules as any).close(ctx, { id: 'season123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('season123', {
                status: 'closed',
            });
        });
    });

    describe('submitApplication', () => {
        it('should submit season application', async () => {
            const seasonId = 'season123';
            
            ctx.db.get.mockResolvedValue({
                _id: seasonId,
                name: 'Test Season',
                status: 'published',
                applicationEndDate: Date.now() + 86400000, // Tomorrow
            });

            ctx.db.insert.mockResolvedValue('app123');

            const modules = await import('../../convex/domain/seasons');
            const result = await (modules as any).submitApplication(ctx, {
                tenantId,
                seasonId,
                userId,
                resourceId,
                weekday: 1, // Monday
                startTime: '09:00',
                endTime: '11:00',
                applicantName: 'John Doe',
                applicantEmail: 'john@example.com',
            });

            expect(result.id).toBe('app123');
            expect(ctx.db.insert).toHaveBeenCalledWith('seasonApplications', expect.objectContaining({
                tenantId,
                seasonId,
                userId,
                resourceId,
                weekday: 1,
                status: 'pending',
            }));
        });

        it('should reject if season not published', async () => {
            const seasonId = 'season123';
            
            ctx.db.get.mockResolvedValue({
                _id: seasonId,
                status: 'draft',
            });

            const modules = await import('../../convex/domain/seasons');
            
            await expect((modules as any).submitApplication(ctx, {
                tenantId,
                seasonId,
                userId,
            })).rejects.toThrow('Season is not accepting applications');
        });

        it('should reject if deadline passed', async () => {
            const seasonId = 'season123';
            
            ctx.db.get.mockResolvedValue({
                _id: seasonId,
                status: 'published',
                applicationEndDate: Date.now() - 86400000, // Yesterday
            });

            const modules = await import('../../convex/domain/seasons');
            
            await expect((modules as any).submitApplication(ctx, {
                tenantId,
                seasonId,
                userId,
            })).rejects.toThrow('Application deadline has passed');
        });
    });

    describe('reviewApplication', () => {
        it('should approve application', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'app123',
                seasonId: 'season123',
                userId,
                status: 'pending',
            });

            const modules = await import('../../convex/domain/seasons');
            await (modules as any).reviewApplication(ctx, {
                id: 'app123',
                status: 'approved',
                reviewedBy: userId,
                notes: 'Approved for Monday mornings',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('app123', {
                status: 'approved',
                reviewedBy: userId,
                reviewedAt: expect.any(Number),
                notes: 'Approved for Monday mornings',
            });
        });

        it('should reject application with reason', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'app123',
                status: 'pending',
            });

            const modules = await import('../../convex/domain/seasons');
            await (modules as any).reviewApplication(ctx, {
                id: 'app123',
                status: 'rejected',
                reviewedBy: userId,
                rejectionReason: 'Capacity full',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('app123', {
                status: 'rejected',
                reviewedBy: userId,
                reviewedAt: expect.any(Number),
                rejectionReason: 'Capacity full',
            });
        });
    });

    describe('createAllocation', () => {
        it('should create allocation', async () => {
            const now = Date.now();
            ctx.db.insert.mockResolvedValue('alloc123');

            const modules = await import('../../convex/domain/seasons');
            const result = await (modules as any).createAllocation(ctx, {
                tenantId,
                resourceId,
                title: 'Weekly Allocation',
                startTime: now,
                endTime: now + 2 * 60 * 60 * 1000,
                userId,
            });

            expect(result.id).toBe('alloc123');
            expect(ctx.db.insert).toHaveBeenCalledWith('allocations', expect.objectContaining({
                tenantId,
                resourceId,
                title: 'Weekly Allocation',
                status: 'active',
                userId,
            }));
        });
    });

    describe('createLease', () => {
        it('should create seasonal lease', async () => {
            const organizationId = store.seedOrganization({ 
                tenantId, 
                name: 'Test Org',
                slug: 'test-org'
            });
            
            const now = Date.now();
            ctx.db.insert.mockResolvedValue('lease123');

            const modules = await import('../../convex/domain/seasons');
            const result = await (modules as any).createLease(ctx, {
                tenantId,
                resourceId,
                organizationId,
                startDate: now,
                endDate: now + 90 * 24 * 60 * 60 * 1000,
                weekdays: [1, 3, 5], // Mon, Wed, Fri
                startTime: '09:00',
                endTime: '11:00',
                totalPrice: 10000,
                currency: 'NOK',
            });

            expect(result.id).toBe('lease123');
            expect(ctx.db.insert).toHaveBeenCalledWith('seasonalLeases', expect.objectContaining({
                tenantId,
                resourceId,
                organizationId,
                weekdays: [1, 3, 5],
                startTime: '09:00',
                endTime: '11:00',
                totalPrice: 10000,
                currency: 'NOK',
                status: 'active',
            }));
        });
    });

    describe('cancelLease', () => {
        it('should cancel seasonal lease', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'lease123',
                resourceId,
                organizationId: 'org123',
                status: 'active',
            });

            const modules = await import('../../convex/domain/seasons');
            await (modules as any).cancelLease(ctx, {
                id: 'lease123',
                reason: 'Budget constraints',
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('lease123', {
                status: 'cancelled',
                metadata: expect.objectContaining({
                    cancelledAt: expect.any(Number),
                    cancellationReason: 'Budget constraints',
                }),
            });
        });
    });
});
