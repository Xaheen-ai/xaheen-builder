import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Allocations Functions
 * Manage resource allocations (time slots assigned to bookings or users).
 */

// List allocations for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        status: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, resourceId, status, startDate, endDate }) => {
        let allocations;

        if (resourceId) {
            allocations = await ctx.db
                .query("allocations")
                .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
                .collect();
            // Ensure tenant isolation
            allocations = allocations.filter((a) => a.tenantId === tenantId);
        } else {
            allocations = await ctx.db
                .query("allocations")
                .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
                .collect();
        }

        if (status) {
            allocations = allocations.filter((a) => a.status === status);
        }

        if (startDate) {
            allocations = allocations.filter((a) => a.endTime >= startDate);
        }

        if (endDate) {
            allocations = allocations.filter((a) => a.startTime <= endDate);
        }

        // Sort by start time
        allocations.sort((a, b) => a.startTime - b.startTime);

        return allocations;
    },
});

// Get a single allocation
export const get = query({
    args: {
        id: v.id("allocations"),
    },
    handler: async (ctx, { id }) => {
        const allocation = await ctx.db.get(id);
        if (!allocation) {
            throw new Error("Allocation not found");
        }

        const resource = await ctx.db.get(allocation.resourceId);
        const user = allocation.userId
            ? await ctx.db.get(allocation.userId)
            : null;
        const booking = allocation.bookingId
            ? await ctx.db.get(allocation.bookingId)
            : null;

        return {
            ...allocation,
            resource: resource
                ? { id: resource._id, name: resource.name }
                : null,
            user: user
                ? { id: user._id, name: user.name, email: user.email }
                : null,
            booking,
        };
    },
});

// Create an allocation
export const create = mutation({
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
        // Validate resource exists
        const resource = await ctx.db.get(args.resourceId);
        if (!resource) {
            throw new Error("Resource not found");
        }

        if (args.startTime >= args.endTime) {
            throw new Error("Start time must be before end time");
        }

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

// Remove an allocation
export const remove = mutation({
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
