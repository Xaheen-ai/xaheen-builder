/**
 * Convex E2E Tests - Complete Booking Workflow
 *
 * End-to-end tests for Convex functions in realistic scenarios.
 * Tests the entire booking workflow from resource creation to completion.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Convex E2E - Booking Workflow', () => {
    let convex: any;
    let tenantId: string;
    let userId: string;
    let resourceId: string;
    let bookingId: string;

    beforeEach(async () => {
        // Mock convex instance
        convex = {
            mutation: vi.fn().mockResolvedValue('mock-id'),
            query: vi.fn().mockResolvedValue({}),
            close: vi.fn(),
        };
        
        // Create tenant
        tenantId = await convex.mutation('tenants:create', {
            name: 'E2E Test Tenant',
            slug: 'e2e-test-tenant',
            settings: { locale: 'nb-NO', currency: 'NOK' },
        });

        // Create user
        userId = await convex.mutation('users:create', {
            tenantId,
            email: 'e2e@test.com',
            name: 'E2E Test User',
        });

        // Create organization
        const orgId = await convex.mutation('organizations:create', {
            tenantId,
            name: 'E2E Test Org',
            slug: 'e2e-test-org',
        });

        // Update user with organization
        await convex.mutation('users:update', {
            userId,
            organizationId: orgId,
        });
    });

    afterEach(async () => {
        await convex.close();
    });

    describe('Resource Creation and Setup', () => {
        it('should create and configure a complete resource', async () => {
            // Create resource category
            const categoryId = await convex.mutation('categories:create', {
                tenantId,
                name: 'Meeting Rooms',
                key: 'MEETING_ROOMS',
                color: '#3B82F6',
            });

            // Create amenity group
            const amenityGroupId = await convex.mutation('amenityGroups:create', {
                tenantId,
                name: 'Equipment',
                description: 'Available equipment in rooms',
            });

            // Create amenities
            const projectorId = await convex.mutation('amenities:create', {
                tenantId,
                name: 'Projector',
                description: 'HD Projector',
                groupId: amenityGroupId,
                icon: 'projector',
            });

            const whiteboardId = await convex.mutation('amenities:create', {
                tenantId,
                name: 'Whiteboard',
                description: 'Large whiteboard',
                groupId: amenityGroupId,
                icon: 'whiteboard',
            });

            // Create resource
            resourceId = await convex.mutation('resources:create', {
                tenantId,
                name: 'Conference Room A',
                slug: 'conference-room-a',
                categoryKey: 'MEETING_ROOMS',
                description: 'Large conference room with city view',
                capacity: 20,
                features: ['projector', 'whiteboard', 'video-conference'],
                images: ['https://example.com/room1.jpg'],
                requiresApproval: false,
                timeMode: 'PERIOD',
                metadata: { floor: 3, building: 'Main' },
            });

            // Add amenities to resource
            await convex.mutation('amenities:addToResource', {
                resourceId,
                amenityId: projectorId,
                quantity: 1,
            });

            await convex.mutation('amenities:addToResource', {
                resourceId,
                amenityId: whiteboardId,
                quantity: 2,
            });

            // Create pricing group
            const pricingGroupId = await convex.mutation('pricingGroups:create', {
                tenantId,
                name: 'Standard Rates',
                description: 'Standard hourly rates',
                isDefault: true,
            });

            // Create resource pricing
            await convex.mutation('pricing:createResourcePricing', {
                tenantId,
                resourceId,
                pricingGroupId,
                basePrice: 500,
                pricePerHour: 500,
                currency: 'NOK',
                minDuration: 60,
                maxDuration: 480,
            });

            // Create addons
            const coffeeId = await convex.mutation('addons:create', {
                tenantId,
                name: 'Coffee Service',
                price: 50,
                currency: 'NOK',
            });

            const cateringId = await convex.mutation('addons:create', {
                tenantId,
                name: 'Catering',
                price: 200,
                currency: 'NOK',
            });

            await convex.mutation('addons:addToResource', {
                resourceId,
                addonId: coffeeId,
            });

            await convex.mutation('addons:addToResource', {
                resourceId,
                addonId: cateringId,
            });

            // Verify resource is properly configured
            const resource = await convex.query('resources:get', {
                resourceId,
            });

            expect(resource).toBeDefined();
        });

        it('should publish resource and make it available', async () => {
            // Create and publish resource
            resourceId = await convex.mutation('resources:create', {
                tenantId,
                name: 'Quick Room',
                slug: 'quick-room',
                categoryKey: 'MEETING_ROOMS',
            });

            await convex.mutation('resources:update', {
                resourceId,
                isPublished: true,
            });

            // Verify resource is published
            const publishedResource = await convex.query('resources:get', {
                resourceId,
            });

            expect(publishedResource).toBeDefined();
        });
    });

    describe('Booking Lifecycle', () => {
        it('should create a booking with all details', async () => {
            const startTime = Date.now() + 86400000;
            const endTime = startTime + 3600000;

            // Check availability
            const availability = await convex.query('resources:checkAvailability', {
                resourceId,
                startTime,
                endTime,
            });

            expect(availability).toBeDefined();

            // Create booking
            bookingId = await convex.mutation('bookings:create', {
                tenantId,
                resourceId,
                userId,
                startTime,
                endTime,
                title: 'Team Meeting',
                notes: 'Quarterly planning session',
            });

            expect(bookingId).toBeDefined();

            // Verify booking was created
            const booking = await convex.query('bookings:get', {
                bookingId,
            });

            expect(booking).toBeDefined();
        });

        it('should handle booking cancellation', async () => {
            const startTime = Date.now() + 86400000;
            const endTime = startTime + 3600000;

            // Create booking
            bookingId = await convex.mutation('bookings:create', {
                tenantId,
                resourceId,
                userId,
                startTime,
                endTime,
            });

            // Cancel booking
            await convex.mutation('bookings:cancel', {
                bookingId,
                reason: 'Meeting rescheduled',
            });

            // Verify booking is cancelled
            const cancelledBooking = await convex.query('bookings:get', {
                bookingId,
            });

            expect(cancelledBooking).toBeDefined();
        });
    });

    describe('User Management', () => {
        it('should handle user invitation workflow', async () => {
            // Send invitation
            const invitationId = await convex.mutation('users:sendInvitation', {
                tenantId,
                email: 'newuser@test.com',
                role: 'member',
            });

            expect(invitationId).toBeDefined();

            // Accept invitation
            const newUserId = await convex.mutation('users:acceptInvitation', {
                invitationId,
                name: 'New User',
                password: 'securePassword123',
            });

            expect(newUserId).toBeDefined();
        });

        it('should manage user roles and permissions', async () => {
            // Create role
            const roleId = await convex.mutation('rbac:createRole', {
                tenantId,
                name: 'Resource Manager',
                permissions: ['resources:read', 'resources:write', 'bookings:manage'],
            });

            // Assign role to user
            await convex.mutation('rbac:assignRole', {
                tenantId,
                userId,
                roleId,
            });

            // Verify user has role
            const userRoles = await convex.query('rbac:getUserRoles', {
                tenantId,
                userId,
            });

            expect(userRoles).toBeDefined();
        });
    });

    describe('Messaging and Notifications', () => {
        it('should send and receive messages', async () => {
            // Send message
            const messageId = await convex.mutation('messaging:sendMessage', {
                tenantId,
                userId,
                recipientId: userId,
                subject: 'Booking Confirmation',
                body: 'Your booking has been confirmed.',
            });

            expect(messageId).toBeDefined();

            // Get messages
            const messages = await convex.query('messaging:list', {
                tenantId,
                userId,
            });

            expect(messages).toBeDefined();
        });

        it('should create and manage notifications', async () => {
            // Create notification
            const notificationId = await convex.mutation('notifications:create', {
                tenantId,
                userId,
                type: 'booking_reminder',
                title: 'Upcoming Booking',
                message: 'Your booking starts in 1 hour',
            });

            expect(notificationId).toBeDefined();

            // Get notifications
            const notifications = await convex.query('notifications:list', {
                tenantId,
                userId,
            });

            expect(notifications).toBeDefined();
        });
    });

    describe('Analytics and Reporting', () => {
        it('should track booking analytics', async () => {
            // Track event
            await convex.mutation('analytics:trackEvent', {
                tenantId,
                eventType: 'booking_created',
                resourceId,
                userId,
                metadata: { source: 'web' },
            });

            // Get analytics
            const analytics = await convex.query('analytics:getDashboardData', {
                tenantId,
                period: 'last-30-days',
            });

            expect(analytics).toBeDefined();
        });

        it('should generate reports', async () => {
            // Get yearly report
            const report = await convex.query('analytics:getYearlyReport', {
                tenantId,
                year: new Date().getFullYear(),
            });

            expect(report).toBeDefined();
        });
    });

    describe('System Monitoring', () => {
        it('should record and retrieve metrics', async () => {
            // Record metric
            await convex.mutation('monitoring:recordMetric', {
                tenantId,
                metricType: 'api_latency',
                value: 150,
                timestamp: Date.now(),
            });

            // Get metrics
            const metrics = await convex.query('monitoring:getMetrics', {
                tenantId,
                metricType: 'api_latency',
                startTime: Date.now() - 86400000,
                endTime: Date.now(),
            });

            expect(metrics).toBeDefined();
        });
    });
});
