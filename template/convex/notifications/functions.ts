import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Notification Functions (using dedicated notifications table)
 * CRUD operations on the new notifications table.
 */

// List notifications for a user
export const list = query({
    args: {
        userId: v.id("users"),
        type: v.optional(v.string()),
        unreadOnly: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { userId, type, unreadOnly, limit }) => {
        let notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        if (type) {
            notifications = notifications.filter((n) => n.type === type);
        }

        if (unreadOnly) {
            notifications = notifications.filter((n) => !n.readAt);
        }

        if (limit) {
            notifications = notifications.slice(0, limit);
        }

        return notifications;
    },
});

// Mark a single notification as read
export const markRead = mutation({
    args: {
        id: v.id("notifications"),
    },
    handler: async (ctx, { id }) => {
        const notification = await ctx.db.get(id);
        if (!notification) {
            throw new Error("Notification not found");
        }

        if (notification.readAt) {
            return { success: true, alreadyRead: true };
        }

        await ctx.db.patch(id, {
            readAt: Date.now(),
        });

        return { success: true };
    },
});

// Mark all notifications as read for a user
export const markAllRead = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const unread = notifications.filter((n) => !n.readAt);
        const now = Date.now();

        for (const notification of unread) {
            await ctx.db.patch(notification._id, {
                readAt: now,
            });
        }

        return { success: true, count: unread.length };
    },
});

// Remove a notification
export const remove = mutation({
    args: {
        id: v.id("notifications"),
    },
    handler: async (ctx, { id }) => {
        const notification = await ctx.db.get(id);
        if (!notification) {
            throw new Error("Notification not found");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Get unread notification count for a user
export const getUnreadCount = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const unreadCount = notifications.filter((n) => !n.readAt).length;

        return { unreadCount };
    },
});
