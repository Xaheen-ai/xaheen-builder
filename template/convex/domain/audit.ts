import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Booking Audit Functions
 * Read and list audit trail for bookings.
 */

// List audit entries for a booking
export const listForBooking = query({
    args: {
        bookingId: v.id("bookings"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { bookingId, limit }) => {
        let entries = await ctx.db
            .query("bookingAudit")
            .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
            .order("desc")
            .collect();

        if (limit) {
            entries = entries.slice(0, limit);
        }

        // Get user details for each entry
        const withUsers = await Promise.all(
            entries.map(async (e) => {
                const user = e.userId ? await ctx.db.get(e.userId) : null;
                return {
                    ...e,
                    user: user
                        ? { id: user._id, name: user.name, email: user.email }
                        : null,
                };
            })
        );

        return withUsers;
    },
});

// List audit entries by action type
export const listByAction = query({
    args: {
        tenantId: v.id("tenants"),
        action: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, action, startDate, endDate, limit }) => {
        let entries = await ctx.db
            .query("bookingAudit")
            .withIndex("by_action", (q) => q.eq("action", action))
            .order("desc")
            .collect();

        // Filter by tenant
        entries = entries.filter((e) => e.tenantId === tenantId);

        if (startDate) {
            entries = entries.filter((e) => e.timestamp >= startDate);
        }

        if (endDate) {
            entries = entries.filter((e) => e.timestamp <= endDate);
        }

        if (limit) {
            entries = entries.slice(0, limit);
        }

        return entries;
    },
});

// Get audit entry by ID
export const get = query({
    args: {
        id: v.id("bookingAudit"),
    },
    handler: async (ctx, { id }) => {
        const entry = await ctx.db.get(id);
        if (!entry) {
            throw new Error("Audit entry not found");
        }

        const user = entry.userId ? await ctx.db.get(entry.userId) : null;
        const booking = await ctx.db.get(entry.bookingId);

        return {
            ...entry,
            user: user
                ? { id: user._id, name: user.name, email: user.email }
                : null,
            booking,
        };
    },
});

// Create audit entry (internal use, typically called from other mutations)
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        bookingId: v.id("bookings"),
        userId: v.optional(v.id("users")),
        action: v.string(),
        previousState: v.optional(v.any()),
        newState: v.optional(v.any()),
        reason: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const auditId = await ctx.db.insert("bookingAudit", {
            tenantId: args.tenantId,
            bookingId: args.bookingId,
            userId: args.userId,
            action: args.action,
            previousState: args.previousState,
            newState: args.newState,
            reason: args.reason,
            metadata: args.metadata || {},
            timestamp: Date.now(),
        });

        return { id: auditId };
    },
});

// Get audit summary for a tenant
export const getSummary = query({
    args: {
        tenantId: v.id("tenants"),
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, { tenantId, startDate, endDate }) => {
        const entries = await ctx.db
            .query("bookingAudit")
            .filter((q) =>
                q.and(
                    q.eq(q.field("tenantId"), tenantId),
                    q.gte(q.field("timestamp"), startDate),
                    q.lte(q.field("timestamp"), endDate)
                )
            )
            .collect();

        // Count by action
        const actionCounts: Record<string, number> = {};
        for (const entry of entries) {
            actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
        }

        // Count by user
        const userCounts: Record<string, number> = {};
        for (const entry of entries) {
            if (entry.userId) {
                userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
            }
        }

        return {
            total: entries.length,
            byAction: actionCounts,
            byUser: userCounts,
            period: { startDate, endDate },
        };
    },
});
