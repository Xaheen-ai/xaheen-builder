import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Block Functions
 * Manage availability blocks for resources (maintenance, holidays, etc.)
 */

// List blocks for a resource
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        status: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, resourceId, status, startDate, endDate }) => {
        let blocks = await ctx.db
            .query("blocks")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (resourceId) {
            blocks = blocks.filter((b) => b.resourceId === resourceId);
        }

        if (status) {
            blocks = blocks.filter((b) => b.status === status);
        }

        if (startDate) {
            blocks = blocks.filter((b) => b.endDate >= startDate);
        }

        if (endDate) {
            blocks = blocks.filter((b) => b.startDate <= endDate);
        }

        return blocks;
    },
});

// Get block by ID
export const get = query({
    args: {
        id: v.id("blocks"),
    },
    handler: async (ctx, { id }) => {
        const block = await ctx.db.get(id);
        if (!block) {
            throw new Error("Block not found");
        }

        const resource = await ctx.db.get(block.resourceId);

        return {
            ...block,
            resource,
        };
    },
});

// Create block
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        title: v.string(),
        reason: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        allDay: v.optional(v.boolean()),
        recurring: v.optional(v.boolean()),
        recurrenceRule: v.optional(v.string()),
        visibility: v.optional(v.string()),
        createdBy: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        // Verify resource exists
        const resource = await ctx.db.get(args.resourceId);
        if (!resource || resource.tenantId !== args.tenantId) {
            throw new Error("Resource not found");
        }

        const blockId = await ctx.db.insert("blocks", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            title: args.title,
            reason: args.reason,
            startDate: args.startDate,
            endDate: args.endDate,
            allDay: args.allDay ?? true,
            recurring: args.recurring ?? false,
            recurrenceRule: args.recurrenceRule,
            visibility: args.visibility ?? "public",
            status: "active",
            createdBy: args.createdBy,
        });

        return { id: blockId };
    },
});

// Update block
export const update = mutation({
    args: {
        id: v.id("blocks"),
        title: v.optional(v.string()),
        reason: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        allDay: v.optional(v.boolean()),
        recurring: v.optional(v.boolean()),
        recurrenceRule: v.optional(v.string()),
        visibility: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const block = await ctx.db.get(id);
        if (!block) {
            throw new Error("Block not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete block
export const remove = mutation({
    args: {
        id: v.id("blocks"),
    },
    handler: async (ctx, { id }) => {
        const block = await ctx.db.get(id);
        if (!block) {
            throw new Error("Block not found");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Check availability for a time range
export const checkAvailability = query({
    args: {
        resourceId: v.id("resources"),
        startTime: v.number(),
        endTime: v.number(),
    },
    handler: async (ctx, { resourceId, startTime, endTime }) => {
        // Check for overlapping blocks
        const blocks = await ctx.db
            .query("blocks")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "active"),
                    q.lte(q.field("startDate"), endTime),
                    q.gte(q.field("endDate"), startTime)
                )
            )
            .collect();

        // Check for overlapping bookings
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("status"), "cancelled"),
                    q.neq(q.field("status"), "rejected"),
                    q.lte(q.field("startTime"), endTime),
                    q.gte(q.field("endTime"), startTime)
                )
            )
            .collect();

        const isAvailable = blocks.length === 0 && bookings.length === 0;

        return {
            isAvailable,
            conflicts: {
                blocks: blocks.map((b) => ({
                    id: b._id,
                    title: b.title,
                    startDate: b.startDate,
                    endDate: b.endDate,
                })),
                bookings: bookings.map((b) => ({
                    id: b._id,
                    startTime: b.startTime,
                    endTime: b.endTime,
                    status: b.status,
                })),
            },
        };
    },
});

// Get available time slots for a date
export const getAvailableSlots = query({
    args: {
        resourceId: v.id("resources"),
        date: v.number(), // Start of day timestamp
        slotDurationMinutes: v.optional(v.number()),
    },
    handler: async (ctx, { resourceId, date, slotDurationMinutes = 60 }) => {
        const dayStart = date;
        const dayEnd = date + 24 * 60 * 60 * 1000; // End of day

        // Get all blocks and bookings for the day
        const blocks = await ctx.db
            .query("blocks")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "active"),
                    q.lte(q.field("startDate"), dayEnd),
                    q.gte(q.field("endDate"), dayStart)
                )
            )
            .collect();

        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("status"), "cancelled"),
                    q.neq(q.field("status"), "rejected"),
                    q.lte(q.field("startTime"), dayEnd),
                    q.gte(q.field("endTime"), dayStart)
                )
            )
            .collect();

        // Combine all unavailable periods
        const unavailable: { start: number; end: number }[] = [
            ...blocks.map((b) => ({ start: b.startDate, end: b.endDate })),
            ...bookings.map((b) => ({ start: b.startTime, end: b.endTime })),
        ];

        // Generate time slots
        const slotDuration = slotDurationMinutes * 60 * 1000;
        const slots: { start: number; end: number; available: boolean }[] = [];

        // Assume business hours 8:00 - 20:00
        const businessStart = dayStart + 8 * 60 * 60 * 1000;
        const businessEnd = dayStart + 20 * 60 * 60 * 1000;

        for (let slotStart = businessStart; slotStart < businessEnd; slotStart += slotDuration) {
            const slotEnd = slotStart + slotDuration;

            const isUnavailable = unavailable.some(
                (u) => u.start < slotEnd && u.end > slotStart
            );

            slots.push({
                start: slotStart,
                end: slotEnd,
                available: !isUnavailable,
            });
        }

        return slots;
    },
});
