import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Seasonal Leases Functions
 * Manage long-term seasonal resource leases for organizations.
 */

// List seasonal leases for a tenant
export const list = query({
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

        // Sort by start date
        leases.sort((a, b) => a.startDate - b.startDate);

        // Get related details
        const withDetails = await Promise.all(
            leases.map(async (lease) => {
                const resource = await ctx.db.get(lease.resourceId);
                const org = await ctx.db.get(lease.organizationId);
                return {
                    ...lease,
                    resource: resource
                        ? { id: resource._id, name: resource.name }
                        : null,
                    organization: org
                        ? { id: org._id, name: org.name }
                        : null,
                };
            })
        );

        return withDetails;
    },
});

// Get a single seasonal lease
export const get = query({
    args: {
        id: v.id("seasonalLeases"),
    },
    handler: async (ctx, { id }) => {
        const lease = await ctx.db.get(id);
        if (!lease) {
            throw new Error("Seasonal lease not found");
        }

        const resource = await ctx.db.get(lease.resourceId);
        const org = await ctx.db.get(lease.organizationId);

        return {
            ...lease,
            resource: resource
                ? { id: resource._id, name: resource.name }
                : null,
            organization: org
                ? { id: org._id, name: org.name }
                : null,
        };
    },
});

// Create a seasonal lease
export const create = mutation({
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
        // Validate resource exists
        const resource = await ctx.db.get(args.resourceId);
        if (!resource) {
            throw new Error("Resource not found");
        }

        // Validate organization exists
        const org = await ctx.db.get(args.organizationId);
        if (!org) {
            throw new Error("Organization not found");
        }

        if (args.startDate >= args.endDate) {
            throw new Error("Start date must be before end date");
        }

        const leaseId = await ctx.db.insert("seasonalLeases", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            organizationId: args.organizationId,
            startDate: args.startDate,
            endDate: args.endDate,
            weekdays: args.weekdays,
            startTime: args.startTime,
            endTime: args.endTime,
            status: "pending",
            totalPrice: args.totalPrice,
            currency: args.currency,
            notes: args.notes,
            metadata: args.metadata || {},
        });

        return { id: leaseId };
    },
});

// Update a seasonal lease
export const update = mutation({
    args: {
        id: v.id("seasonalLeases"),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        weekdays: v.optional(v.array(v.number())),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        totalPrice: v.optional(v.number()),
        notes: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const lease = await ctx.db.get(id);
        if (!lease) {
            throw new Error("Seasonal lease not found");
        }

        if (lease.status === "cancelled") {
            throw new Error("Cannot update a cancelled lease");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Approve a seasonal lease
export const approve = mutation({
    args: {
        id: v.id("seasonalLeases"),
    },
    handler: async (ctx, { id }) => {
        const lease = await ctx.db.get(id);
        if (!lease) {
            throw new Error("Seasonal lease not found");
        }

        if (lease.status !== "pending") {
            throw new Error("Only pending leases can be approved");
        }

        await ctx.db.patch(id, {
            status: "active",
            metadata: {
                ...(lease.metadata as Record<string, unknown> || {}),
                approvedAt: Date.now(),
            },
        });

        return { success: true };
    },
});

// Reject a seasonal lease
export const reject = mutation({
    args: {
        id: v.id("seasonalLeases"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { id, reason }) => {
        const lease = await ctx.db.get(id);
        if (!lease) {
            throw new Error("Seasonal lease not found");
        }

        if (lease.status !== "pending") {
            throw new Error("Only pending leases can be rejected");
        }

        await ctx.db.patch(id, {
            status: "rejected",
            metadata: {
                ...(lease.metadata as Record<string, unknown> || {}),
                rejectedAt: Date.now(),
                rejectionReason: reason,
            },
        });

        return { success: true };
    },
});

// Cancel a seasonal lease
export const cancel = mutation({
    args: {
        id: v.id("seasonalLeases"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { id, reason }) => {
        const lease = await ctx.db.get(id);
        if (!lease) {
            throw new Error("Seasonal lease not found");
        }

        if (lease.status === "cancelled") {
            throw new Error("Lease is already cancelled");
        }

        await ctx.db.patch(id, {
            status: "cancelled",
            metadata: {
                ...(lease.metadata as Record<string, unknown> || {}),
                cancelledAt: Date.now(),
                cancellationReason: reason,
            },
        });

        return { success: true };
    },
});
