import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Booking Functions
 * Migrated from domain.bookings table queries
 */

// List bookings for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
        startAfter: v.optional(v.number()),
        startBefore: v.optional(v.number()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let bookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .collect();

        // Apply filters
        if (args.resourceId) {
            bookings = bookings.filter((b) => b.resourceId === args.resourceId);
        }

        if (args.userId) {
            bookings = bookings.filter((b) => b.userId === args.userId);
        }

        if (args.status) {
            bookings = bookings.filter((b) => b.status === args.status);
        }

        if (args.startAfter) {
            bookings = bookings.filter((b) => b.startTime >= args.startAfter!);
        }

        if (args.startBefore) {
            bookings = bookings.filter((b) => b.startTime <= args.startBefore!);
        }

        // Sort by start time
        bookings.sort((a, b) => a.startTime - b.startTime);

        if (args.limit) {
            bookings = bookings.slice(0, args.limit);
        }

        return bookings;
    },
});

// Get a single booking
export const get = query({
    args: {
        id: v.id("bookings"),
    },
    handler: async (ctx, { id }) => {
        const booking = await ctx.db.get(id);
        if (!booking) {
            throw new Error("Booking not found");
        }

        // Get related data
        const resource = await ctx.db.get(booking.resourceId);
        const user = await ctx.db.get(booking.userId);
        const addons = await ctx.db
            .query("bookingAddons")
            .withIndex("by_booking", (q) => q.eq("bookingId", id))
            .collect();

        return {
            ...booking,
            resource,
            user,
            addons,
        };
    },
});

// Create a new booking
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        userId: v.id("users"),
        organizationId: v.optional(v.id("organizations")),
        startTime: v.number(),
        endTime: v.number(),
        totalPrice: v.optional(v.number()),
        currency: v.optional(v.string()),
        notes: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Check for conflicts
        const conflicts = await ctx.db
            .query("bookings")
            .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("status"), "cancelled"),
                    q.neq(q.field("status"), "rejected"),
                    q.or(
                        // New booking starts during existing booking
                        q.and(
                            q.gte(q.field("startTime"), args.startTime),
                            q.lt(q.field("startTime"), args.endTime)
                        ),
                        // New booking ends during existing booking
                        q.and(
                            q.gt(q.field("endTime"), args.startTime),
                            q.lte(q.field("endTime"), args.endTime)
                        ),
                        // New booking contains existing booking
                        q.and(
                            q.lte(q.field("startTime"), args.startTime),
                            q.gte(q.field("endTime"), args.endTime)
                        )
                    )
                )
            )
            .collect();

        if (conflicts.length > 0) {
            throw new Error("Time slot conflicts with existing bookings");
        }

        // Check if resource requires approval
        const resource = await ctx.db.get(args.resourceId);
        const initialStatus = resource?.requiresApproval ? "pending" : "confirmed";

        const bookingId = await ctx.db.insert("bookings", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            userId: args.userId,
            organizationId: args.organizationId,
            startTime: args.startTime,
            endTime: args.endTime,
            status: initialStatus,
            totalPrice: args.totalPrice || 0,
            currency: args.currency || "NOK",
            notes: args.notes,
            metadata: args.metadata || {},
            version: 1,
            submittedAt: Date.now(),
        });

        // Create audit entry
        await ctx.db.insert("bookingAudit", {
            tenantId: args.tenantId,
            bookingId,
            userId: args.userId,
            action: "created",
            newState: { status: initialStatus },
            metadata: {},
            timestamp: Date.now(),
        });

        return { id: bookingId, status: initialStatus };
    },
});

// Update booking
export const update = mutation({
    args: {
        id: v.id("bookings"),
        startTime: v.optional(v.number()),
        endTime: v.optional(v.number()),
        notes: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const booking = await ctx.db.get(id);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status === "cancelled") {
            throw new Error("Cannot update cancelled booking");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, {
            ...filteredUpdates,
            version: booking.version + 1,
        });

        return { success: true };
    },
});

// Approve a booking
export const approve = mutation({
    args: {
        id: v.id("bookings"),
        approvedBy: v.id("users"),
    },
    handler: async (ctx, { id, approvedBy }) => {
        const booking = await ctx.db.get(id);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status !== "pending") {
            throw new Error("Only pending bookings can be approved");
        }

        await ctx.db.patch(id, {
            status: "confirmed",
            approvedBy,
            approvedAt: Date.now(),
            version: booking.version + 1,
        });

        // Create audit entry
        await ctx.db.insert("bookingAudit", {
            tenantId: booking.tenantId,
            bookingId: id,
            userId: approvedBy,
            action: "approved",
            previousState: { status: "pending" },
            newState: { status: "confirmed" },
            metadata: {},
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Reject a booking
export const reject = mutation({
    args: {
        id: v.id("bookings"),
        rejectedBy: v.id("users"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { id, rejectedBy, reason }) => {
        const booking = await ctx.db.get(id);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status !== "pending") {
            throw new Error("Only pending bookings can be rejected");
        }

        await ctx.db.patch(id, {
            status: "rejected",
            rejectionReason: reason,
            version: booking.version + 1,
        });

        // Create audit entry
        await ctx.db.insert("bookingAudit", {
            tenantId: booking.tenantId,
            bookingId: id,
            userId: rejectedBy,
            action: "rejected",
            previousState: { status: "pending" },
            newState: { status: "rejected" },
            reason,
            metadata: {},
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Cancel a booking
export const cancel = mutation({
    args: {
        id: v.id("bookings"),
        cancelledBy: v.id("users"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { id, cancelledBy, reason }) => {
        const booking = await ctx.db.get(id);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status === "cancelled") {
            throw new Error("Booking is already cancelled");
        }

        const previousStatus = booking.status;

        await ctx.db.patch(id, {
            status: "cancelled",
            version: booking.version + 1,
        });

        // Create audit entry
        await ctx.db.insert("bookingAudit", {
            tenantId: booking.tenantId,
            bookingId: id,
            userId: cancelledBy,
            action: "cancelled",
            previousState: { status: previousStatus },
            newState: { status: "cancelled" },
            reason,
            metadata: {},
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Get bookings for calendar view
export const calendar = query({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, { tenantId, resourceId, startDate, endDate }) => {
        let bookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("status"), "cancelled"),
                    q.neq(q.field("status"), "rejected"),
                    q.gte(q.field("startTime"), startDate),
                    q.lte(q.field("endTime"), endDate)
                )
            )
            .collect();

        if (resourceId) {
            bookings = bookings.filter((b) => b.resourceId === resourceId);
        }

        // Get blocks for the same period
        let blocks = await ctx.db
            .query("blocks")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "active"),
                    q.gte(q.field("startDate"), startDate),
                    q.lte(q.field("endDate"), endDate)
                )
            )
            .collect();

        if (resourceId) {
            blocks = blocks.filter((b) => b.resourceId === resourceId);
        }

        return {
            bookings,
            blocks,
        };
    },
});
