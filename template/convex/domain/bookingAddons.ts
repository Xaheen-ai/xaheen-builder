import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Booking Addon Functions
 * Manage addons attached to bookings.
 */

// List addons for a booking
export const listForBooking = query({
    args: {
        bookingId: v.id("bookings"),
    },
    handler: async (ctx, { bookingId }) => {
        const bookingAddons = await ctx.db
            .query("bookingAddons")
            .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
            .collect();

        const withAddonDetails = await Promise.all(
            bookingAddons.map(async (ba) => {
                const addon = await ctx.db.get(ba.addonId);
                return { ...ba, addon };
            })
        );

        return withAddonDetails;
    },
});

// Add addon to booking
export const addToBooking = mutation({
    args: {
        tenantId: v.id("tenants"),
        bookingId: v.id("bookings"),
        addonId: v.id("addons"),
        quantity: v.number(),
        notes: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const booking = await ctx.db.get(args.bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status === "cancelled" || booking.status === "rejected") {
            throw new Error("Cannot add addons to cancelled/rejected booking");
        }

        const addon = await ctx.db.get(args.addonId);
        if (!addon || !addon.isActive) {
            throw new Error("Addon not found or inactive");
        }

        // Check max quantity
        if (addon.maxQuantity && args.quantity > addon.maxQuantity) {
            throw new Error(`Maximum quantity for this addon is ${addon.maxQuantity}`);
        }

        // Check if already exists
        const existing = await ctx.db
            .query("bookingAddons")
            .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
            .filter((q) => q.eq(q.field("addonId"), args.addonId))
            .first();

        if (existing) {
            // Update quantity
            const newQuantity = existing.quantity + args.quantity;
            const newTotal = newQuantity * addon.price;

            await ctx.db.patch(existing._id, {
                quantity: newQuantity,
                totalPrice: newTotal,
            });

            return { id: existing._id, updated: true };
        }

        const totalPrice = args.quantity * addon.price;

        const id = await ctx.db.insert("bookingAddons", {
            tenantId: args.tenantId,
            bookingId: args.bookingId,
            addonId: args.addonId,
            quantity: args.quantity,
            unitPrice: addon.price,
            totalPrice,
            currency: addon.currency,
            notes: args.notes,
            status: addon.requiresApproval ? "pending" : "confirmed",
            metadata: args.metadata || {},
        });

        // Update booking total
        await ctx.db.patch(args.bookingId, {
            totalPrice: booking.totalPrice + totalPrice,
        });

        return { id, updated: false };
    },
});

// Update booking addon
export const updateBookingAddon = mutation({
    args: {
        id: v.id("bookingAddons"),
        quantity: v.optional(v.number()),
        notes: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, { id, quantity, notes, status }) => {
        const bookingAddon = await ctx.db.get(id);
        if (!bookingAddon) {
            throw new Error("Booking addon not found");
        }

        const updates: Record<string, unknown> = {};

        if (notes !== undefined) {
            updates.notes = notes;
        }

        if (status !== undefined) {
            updates.status = status;
        }

        if (quantity !== undefined && quantity !== bookingAddon.quantity) {
            const priceDiff = (quantity - bookingAddon.quantity) * bookingAddon.unitPrice;

            updates.quantity = quantity;
            updates.totalPrice = quantity * bookingAddon.unitPrice;

            // Update booking total
            const booking = await ctx.db.get(bookingAddon.bookingId);
            if (booking) {
                await ctx.db.patch(booking._id, {
                    totalPrice: booking.totalPrice + priceDiff,
                });
            }
        }

        await ctx.db.patch(id, updates);

        return { success: true };
    },
});

// Remove addon from booking
export const removeFromBooking = mutation({
    args: {
        id: v.id("bookingAddons"),
    },
    handler: async (ctx, { id }) => {
        const bookingAddon = await ctx.db.get(id);
        if (!bookingAddon) {
            throw new Error("Booking addon not found");
        }

        // Update booking total
        const booking = await ctx.db.get(bookingAddon.bookingId);
        if (booking) {
            await ctx.db.patch(booking._id, {
                totalPrice: booking.totalPrice - bookingAddon.totalPrice,
            });
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Approve addon
export const approve = mutation({
    args: {
        id: v.id("bookingAddons"),
        approvedBy: v.id("users"),
    },
    handler: async (ctx, { id, approvedBy }) => {
        const bookingAddon = await ctx.db.get(id);
        if (!bookingAddon) {
            throw new Error("Booking addon not found");
        }

        if (bookingAddon.status !== "pending") {
            throw new Error("Only pending addons can be approved");
        }

        await ctx.db.patch(id, {
            status: "confirmed",
            metadata: {
                ...(bookingAddon.metadata as Record<string, unknown> || {}),
                approvedBy,
                approvedAt: Date.now(),
            },
        });

        return { success: true };
    },
});

// Reject addon
export const reject = mutation({
    args: {
        id: v.id("bookingAddons"),
        rejectedBy: v.id("users"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { id, rejectedBy, reason }) => {
        const bookingAddon = await ctx.db.get(id);
        if (!bookingAddon) {
            throw new Error("Booking addon not found");
        }

        if (bookingAddon.status !== "pending") {
            throw new Error("Only pending addons can be rejected");
        }

        // Remove from booking total
        const booking = await ctx.db.get(bookingAddon.bookingId);
        if (booking) {
            await ctx.db.patch(booking._id, {
                totalPrice: booking.totalPrice - bookingAddon.totalPrice,
            });
        }

        await ctx.db.patch(id, {
            status: "rejected",
            metadata: {
                ...(bookingAddon.metadata as Record<string, unknown> || {}),
                rejectedBy,
                rejectedAt: Date.now(),
                rejectionReason: reason,
            },
        });

        return { success: true };
    },
});
