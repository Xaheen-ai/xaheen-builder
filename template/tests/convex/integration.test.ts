/**
 * Integration Tests
 *
 * End-to-end tests for cross-domain workflows.
 * User Stories: US-INT-001, US-INT-002
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Integration Tests', () => {
    let store: TestDataStore;
    let tenantId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Integration Test Tenant' });
        userId = store.seedUser({ tenantId, email: 'test@example.com' });
        ctx = createMockContext(store);
    });

    describe('Booking Lifecycle', () => {
        it('should handle full booking lifecycle', async () => {
            // 1. Create resource with pricing
            const resourceId = store.seedResource({ 
                tenantId, 
                name: 'Meeting Room',
                slug: 'meeting-room'
            });
            
            const pricingId = store.seedResourcePricing({
                resourceId,
                basePrice: 500,
                currency: 'NOK'
            });

            // 2. Check availability
            const now = Date.now();
            const startTime = now + 86400000; // Tomorrow
            const endTime = startTime + 3600000; // 1 hour

            const mockBlocksQuery = {
                withIndex: vi.fn().mockReturnValue({
                    filter: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([]) // No conflicts
                    })
                })
            };
            ctx.db.query.mockReturnValue(mockBlocksQuery);

            const blocksModule = await import('../../convex/domain/blocks');
            const availability = await (blocksModule as any).checkAvailability(ctx, {
                resourceId,
                startTime,
                endTime,
            });

            expect(availability.isAvailable).toBe(true);

            // 3. Create booking
            ctx.db.insert.mockResolvedValue('booking123');
            ctx.db.get.mockImplementation((id: string) => {
                if (id === 'booking123') {
                    return Promise.resolve({
                        _id: 'booking123',
                        tenantId,
                        resourceId,
                        userId,
                        startTime,
                        endTime,
                        status: 'pending',
                        totalPrice: 500,
                        currency: 'NOK',
                    });
                }
                return Promise.resolve(null);
            });

            const bookingsModule = await import('../../convex/domain/bookings');
            const booking = await (bookingsModule as any).create(ctx, {
                tenantId,
                resourceId,
                userId,
                startTime,
                endTime,
                totalPrice: 500,
                currency: 'NOK',
            });

            expect(booking.id).toBe('booking123');

            // 4. Approve booking
            ctx.db.get.mockResolvedValue({
                _id: 'booking123',
                status: 'pending',
            });

            await (bookingsModule as any).approve(ctx, { id: 'booking123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('booking123', {
                status: 'confirmed',
                approvedAt: expect.any(Number),
                approvedBy: userId,
            });

            // 5. Create audit entry
            const auditModule = await import('../../convex/domain/audit');
            await (auditModule as any).createAudit(ctx, {
                tenantId,
                bookingId: 'booking123',
                action: 'approved',
                userId,
                metadata: { reason: 'Manual approval' },
            });
        });
    });

    describe('Resource Management', () => {
        it('should handle complete resource setup', async () => {
            // 1. Create resource
            ctx.db.insert.mockResolvedValue('resource123');
            const resourcesModule = await import('../../convex/domain/resources');
            const resource = await (resourcesModule as any).create(ctx, {
                tenantId,
                name: 'Conference Room',
                slug: 'conference-room',
                categoryKey: 'LOKALER',
                capacity: 10,
                features: ['projector', 'whiteboard'],
            });

            expect(resource.id).toBe('resource123');

            // 2. Add amenities
            const amenityId = store.seedAmenity({ tenantId, name: 'Projector' });
            ctx.db.insert.mockResolvedValue('ra1');
            
            const amenitiesModule = await import('../../convex/domain/amenities');
            const resourceAmenity = await (amenitiesModule as any).addToResource(ctx, {
                resourceId: 'resource123',
                amenityId,
                quantity: 1,
            });

            expect(resourceAmenity.id).toBe('ra1');

            // 3. Set pricing
            const pricingId = store.seedPricingGroup({ tenantId, name: 'Standard' });
            ctx.db.insert.mockResolvedValue('pricing1');
            
            const pricingModule = await import('../../convex/domain/pricing');
            const pricing = await (pricingModule as any).calculatePrice(ctx, {
                resourceId: 'resource123',
                groupId: pricingId,
                price: 500,
                currency: 'NOK',
                unit: 'hour',
            });

            expect(pricing.id).toBe('pricing1');

            // 4. Publish resource
            await (resourcesModule as any).publish(ctx, { id: 'resource123' });
            expect(ctx.db.patch).toHaveBeenCalledWith('resource123', {
                status: 'published',
                publishedAt: expect.any(Number),
            });
        });
    });

    describe('User Management', () => {
        it('should handle user onboarding flow', async () => {
            // 1. Create organization
            ctx.db.insert.mockResolvedValue('org1');
            const organizationsModule = await import('../../convex/organizations/index');
            const organization = await (organizationsModule as any).create(ctx, {
                tenantId,
                name: 'Test Company',
                slug: 'test-company',
            });

            expect(organization.id).toBe('org1');

            // 2. Create role
            ctx.db.insert.mockResolvedValue('role1');
            const rbacModule = await import('../../convex/rbac/index');
            const role = await (rbacModule as any).createRole(ctx, {
                tenantId,
                name: 'Resource Manager',
                permissions: ['resource:read', 'resource:write'],
            });

            expect(role.id).toBe('role1');

            // 3. Create user
            ctx.db.insert.mockResolvedValue('user123');
            const usersModule = await import('../../convex/users/index');
            const user = await (usersModule as any).create(ctx, {
                tenantId,
                email: 'manager@test.com',
                name: 'Test Manager',
                organizationId: 'org1',
            });

            expect(user.id).toBe('user123');

            // 4. Assign role
            await (rbacModule as any).assignRole(ctx, {
                tenantId,
                userId: 'user123',
                roleId: 'role1',
            });

            expect(ctx.db.insert).toHaveBeenCalledWith('userRoles', {
                tenantId,
                userId: 'user123',
                roleId: 'role1',
                assignedAt: expect.any(Number),
            });
        });
    });
});
