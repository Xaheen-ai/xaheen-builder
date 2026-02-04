import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Seasons and Allocations Functions
 * Manage seasonal booking periods and resource allocations.
 */

// List seasons for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        status: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, status, isActive }) => {
        let seasons = await ctx.db
            .query("seasons")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (status) {
            seasons = seasons.filter((s) => s.status === status);
        }

        if (isActive !== undefined) {
            seasons = seasons.filter((s) => s.isActive === isActive);
        }

        // Sort by start date
        seasons.sort((a, b) => a.startDate - b.startDate);

        return seasons;
    },
});

// Get season by ID
export const get = query({
    args: {
        id: v.id("seasons"),
    },
    handler: async (ctx, { id }) => {
        const season = await ctx.db.get(id);
        if (!season) {
            throw new Error("Season not found");
        }

        // Get applications count
        const applications = await ctx.db
            .query("seasonApplications")
            .withIndex("by_season", (q) => q.eq("seasonId", id))
            .collect();

        const statusCounts = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            ...season,
            applicationStats: {
                total: applications.length,
                byStatus: statusCounts,
            },
        };
    },
});

// Create season
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        applicationStartDate: v.optional(v.number()),
        applicationEndDate: v.optional(v.number()),
        type: v.string(),
        settings: v.optional(v.any()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const seasonId = await ctx.db.insert("seasons", {
            tenantId: args.tenantId,
            name: args.name,
            description: args.description,
            startDate: args.startDate,
            endDate: args.endDate,
            applicationStartDate: args.applicationStartDate,
            applicationEndDate: args.applicationEndDate,
            status: "draft",
            type: args.type,
            settings: args.settings || {},
            metadata: args.metadata || {},
            isActive: false,
        });

        return { id: seasonId };
    },
});

// Update season
export const update = mutation({
    args: {
        id: v.id("seasons"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        applicationStartDate: v.optional(v.number()),
        applicationEndDate: v.optional(v.number()),
        status: v.optional(v.string()),
        settings: v.optional(v.any()),
        metadata: v.optional(v.any()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const season = await ctx.db.get(id);
        if (!season) {
            throw new Error("Season not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete season
export const remove = mutation({
    args: {
        id: v.id("seasons"),
    },
    handler: async (ctx, { id }) => {
        const season = await ctx.db.get(id);
        if (!season) {
            throw new Error("Season not found");
        }

        // Check for applications
        const applications = await ctx.db
            .query("seasonApplications")
            .withIndex("by_season", (q) => q.eq("seasonId", id))
            .first();

        if (applications) {
            throw new Error("Cannot delete season with applications");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Publish season (open for applications)
export const publish = mutation({
    args: {
        id: v.id("seasons"),
    },
    handler: async (ctx, { id }) => {
        const season = await ctx.db.get(id);
        if (!season) {
            throw new Error("Season not found");
        }

        await ctx.db.patch(id, {
            status: "published",
            isActive: true,
        });

        return { success: true };
    },
});

// Close season (stop accepting applications)
export const close = mutation({
    args: {
        id: v.id("seasons"),
    },
    handler: async (ctx, { id }) => {
        const season = await ctx.db.get(id);
        if (!season) {
            throw new Error("Season not found");
        }

        await ctx.db.patch(id, {
            status: "closed",
        });

        return { success: true };
    },
});

// ============================================
// Season Applications
// ============================================

// List applications for a season
export const listApplications = query({
    args: {
        seasonId: v.id("seasons"),
        status: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, { seasonId, status, organizationId }) => {
        let applications = await ctx.db
            .query("seasonApplications")
            .withIndex("by_season", (q) => q.eq("seasonId", seasonId))
            .collect();

        if (status) {
            applications = applications.filter((a) => a.status === status);
        }

        if (organizationId) {
            applications = applications.filter((a) => a.organizationId === organizationId);
        }

        // Sort by priority
        applications.sort((a, b) => b.priority - a.priority);

        // Get user/org details
        const withDetails = await Promise.all(
            applications.map(async (app) => {
                const user = await ctx.db.get(app.userId);
                const org = app.organizationId ? await ctx.db.get(app.organizationId) : null;
                const resource = app.resourceId ? await ctx.db.get(app.resourceId) : null;
                return {
                    ...app,
                    user: user ? { id: user._id, name: user.name, email: user.email } : null,
                    organization: org ? { id: org._id, name: org.name } : null,
                    resource: resource ? { id: resource._id, name: resource.name } : null,
                };
            })
        );

        return withDetails;
    },
});

// Submit application
export const submitApplication = mutation({
    args: {
        tenantId: v.id("tenants"),
        seasonId: v.id("seasons"),
        userId: v.id("users"),
        organizationId: v.optional(v.id("organizations")),
        resourceId: v.optional(v.id("resources")),
        weekday: v.optional(v.number()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        applicantName: v.optional(v.string()),
        applicantEmail: v.optional(v.string()),
        applicantPhone: v.optional(v.string()),
        applicationData: v.optional(v.any()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const season = await ctx.db.get(args.seasonId);
        if (!season) {
            throw new Error("Season not found");
        }

        if (season.status !== "published") {
            throw new Error("Season is not accepting applications");
        }

        // Check application deadline
        if (season.applicationEndDate && Date.now() > season.applicationEndDate) {
            throw new Error("Application deadline has passed");
        }

        const applicationId = await ctx.db.insert("seasonApplications", {
            tenantId: args.tenantId,
            seasonId: args.seasonId,
            userId: args.userId,
            organizationId: args.organizationId,
            resourceId: args.resourceId,
            weekday: args.weekday,
            startTime: args.startTime,
            endTime: args.endTime,
            priority: 0, // Will be calculated later
            status: "pending",
            applicantName: args.applicantName,
            applicantEmail: args.applicantEmail,
            applicantPhone: args.applicantPhone,
            applicationData: args.applicationData || {},
            notes: args.notes,
            metadata: {},
        });

        return { id: applicationId };
    },
});

// Review application (approve/reject)
export const reviewApplication = mutation({
    args: {
        id: v.id("seasonApplications"),
        status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("waitlist")),
        reviewedBy: v.id("users"),
        rejectionReason: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, status, reviewedBy, rejectionReason, notes }) => {
        const application = await ctx.db.get(id);
        if (!application) {
            throw new Error("Application not found");
        }

        await ctx.db.patch(id, {
            status,
            reviewedBy,
            reviewedAt: Date.now(),
            rejectionReason: status === "rejected" ? rejectionReason : undefined,
            notes: notes || application.notes,
        });

        return { success: true };
    },
});

// ============================================
// Allocations
// ============================================

// List allocations for a resource
export const listAllocations = query({
    args: {
        resourceId: v.id("resources"),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, { resourceId, startDate, endDate }) => {
        let allocations = await ctx.db
            .query("allocations")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .collect();

        if (startDate) {
            allocations = allocations.filter((a) => a.endTime >= startDate);
        }

        if (endDate) {
            allocations = allocations.filter((a) => a.startTime <= endDate);
        }

        return allocations;
    },
});

// Create allocation
export const createAllocation = mutation({
    args: {
        tenantId: v.id("tenants"),
        organizationId: v.optional(v.id("organizations")),
        resourceId: v.id("resources"),
        title: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        bookingId: v.optional(v.id("bookings")),
        userId: v.optional(v.id("users")),
        notes: v.optional(v.string()),
        recurring: v.optional(v.any()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const allocationId = await ctx.db.insert("allocations", {
            tenantId: args.tenantId,
            organizationId: args.organizationId,
            resourceId: args.resourceId,
            title: args.title,
            startTime: args.startTime,
            endTime: args.endTime,
            status: "active",
            bookingId: args.bookingId,
            userId: args.userId,
            notes: args.notes,
            recurring: args.recurring || {},
            metadata: args.metadata || {},
        });

        return { id: allocationId };
    },
});

// Update allocation
export const updateAllocation = mutation({
    args: {
        id: v.id("allocations"),
        title: v.optional(v.string()),
        startTime: v.optional(v.number()),
        endTime: v.optional(v.number()),
        status: v.optional(v.string()),
        notes: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const allocation = await ctx.db.get(id);
        if (!allocation) {
            throw new Error("Allocation not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete allocation
export const removeAllocation = mutation({
    args: {
        id: v.id("allocations"),
    },
    handler: async (ctx, { id }) => {
        const allocation = await ctx.db.get(id);
        if (!allocation) {
            throw new Error("Allocation not found");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// ============================================
// Seasonal Leases
// ============================================

// List seasonal leases
export const listLeases = query({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        organizationId: v.optional(v.id("organizations")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, { tenantId, resourceId, organizationId, status }) => {
        let leases = await ctx.db
            .query("seasonalLeases")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (resourceId) {
            leases = leases.filter((l) => l.resourceId === resourceId);
        }

        if (organizationId) {
            leases = leases.filter((l) => l.organizationId === organizationId);
        }

        if (status) {
            leases = leases.filter((l) => l.status === status);
        }

        return leases;
    },
});

// Create seasonal lease
export const createLease = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        organizationId: v.id("organizations"),
        startDate: v.number(),
        endDate: v.number(),
        weekdays: v.array(v.number()),
        startTime: v.string(),
        endTime: v.string(),
        totalPrice: v.number(),
        currency: v.string(),
        notes: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const leaseId = await ctx.db.insert("seasonalLeases", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            organizationId: args.organizationId,
            startDate: args.startDate,
            endDate: args.endDate,
            weekdays: args.weekdays,
            startTime: args.startTime,
            endTime: args.endTime,
            status: "active",
            totalPrice: args.totalPrice,
            currency: args.currency,
            notes: args.notes,
            metadata: args.metadata || {},
        });

        return { id: leaseId };
    },
});

// Cancel seasonal lease
export const cancelLease = mutation({
    args: {
        id: v.id("seasonalLeases"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { id, reason }) => {
        const lease = await ctx.db.get(id);
        if (!lease) {
            throw new Error("Lease not found");
        }

        await ctx.db.patch(id, {
            status: "cancelled",
            metadata: {
                ...(lease.metadata as Record<string, unknown>),
                cancelledAt: Date.now(),
                cancellationReason: reason,
            },
        });

        return { success: true };
    },
});
