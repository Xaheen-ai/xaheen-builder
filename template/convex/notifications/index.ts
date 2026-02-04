import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Notification Functions
 * Manage user notifications with CRUD and mark-read operations.
 * Note: Uses conversations table for notification-like functionality.
 */

// Notification types supported
type NotificationType = 
    | "booking_created"
    | "booking_approved"
    | "booking_rejected"
    | "booking_cancelled"
    | "booking_reminder"
    | "payment_received"
    | "message_received"
    | "system_alert";

interface NotificationData {
    tenantId: Id<"tenants">;
    userId: Id<"users">;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    relatedId?: string;
    relatedType?: string;
    isRead: boolean;
    readAt?: number;
    metadata: Record<string, unknown>;
}

// List notifications for a user
export const list = query({
    args: {
        userId: v.id("users"),
        isRead: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { userId, isRead, limit }) => {
        // Use conversations as notification storage
        let notifications = await ctx.db
            .query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        if (isRead !== undefined) {
            notifications = notifications.filter((n) => {
                const meta = n.metadata as Record<string, unknown>;
                return meta?.isRead === isRead;
            });
        }

        if (limit) {
            notifications = notifications.slice(0, limit);
        }

        return notifications.map((n) => ({
            id: n._id,
            tenantId: n.tenantId,
            userId: n.userId,
            type: (n.metadata as Record<string, unknown>)?.type || "system",
            title: n.subject || "Notification",
            message: (n.metadata as Record<string, unknown>)?.message || "",
            isRead: (n.metadata as Record<string, unknown>)?.isRead || false,
            readAt: (n.metadata as Record<string, unknown>)?.readAt,
            actionUrl: (n.metadata as Record<string, unknown>)?.actionUrl,
            relatedId: n.bookingId || n.resourceId,
            createdAt: n._creationTime,
        }));
    },
});

// Get unread count
export const getUnreadCount = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const notifications = await ctx.db
            .query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const unreadCount = notifications.filter((n) => {
            const meta = n.metadata as Record<string, unknown>;
            return !meta?.isRead;
        }).length;

        return { unreadCount };
    },
});

// Create notification
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        actionUrl: v.optional(v.string()),
        bookingId: v.optional(v.id("bookings")),
        resourceId: v.optional(v.id("resources")),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const notificationId = await ctx.db.insert("conversations", {
            tenantId: args.tenantId,
            userId: args.userId,
            bookingId: args.bookingId,
            resourceId: args.resourceId,
            participants: [args.userId],
            subject: args.title,
            status: "active",
            unreadCount: 1,
            metadata: {
                type: args.type,
                message: args.message,
                actionUrl: args.actionUrl,
                isRead: false,
                isNotification: true,
                ...(args.metadata || {}),
            },
        });

        return { id: notificationId };
    },
});

// Mark notification as read
export const markAsRead = mutation({
    args: {
        id: v.id("conversations"),
    },
    handler: async (ctx, { id }) => {
        const notification = await ctx.db.get(id);
        if (!notification) {
            throw new Error("Notification not found");
        }

        await ctx.db.patch(id, {
            unreadCount: 0,
            metadata: {
                ...(notification.metadata as Record<string, unknown>),
                isRead: true,
                readAt: Date.now(),
            },
        });

        return { success: true };
    },
});

// Mark all as read
export const markAllAsRead = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const notifications = await ctx.db
            .query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const unread = notifications.filter((n) => {
            const meta = n.metadata as Record<string, unknown>;
            return !meta?.isRead && meta?.isNotification;
        });

        for (const notification of unread) {
            await ctx.db.patch(notification._id, {
                unreadCount: 0,
                metadata: {
                    ...(notification.metadata as Record<string, unknown>),
                    isRead: true,
                    readAt: Date.now(),
                },
            });
        }

        return { success: true, count: unread.length };
    },
});

// Delete notification
export const remove = mutation({
    args: {
        id: v.id("conversations"),
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

// Delete all read notifications
export const deleteAllRead = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const notifications = await ctx.db
            .query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const readNotifications = notifications.filter((n) => {
            const meta = n.metadata as Record<string, unknown>;
            return meta?.isRead && meta?.isNotification;
        });

        for (const notification of readNotifications) {
            await ctx.db.delete(notification._id);
        }

        return { success: true, count: readNotifications.length };
    },
});

// Send booking notification (helper)
export const sendBookingNotification = mutation({
    args: {
        tenantId: v.id("tenants"),
        bookingId: v.id("bookings"),
        type: v.string(),
        recipientIds: v.array(v.id("users")),
    },
    handler: async (ctx, { tenantId, bookingId, type, recipientIds }) => {
        const booking = await ctx.db.get(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        const resource = await ctx.db.get(booking.resourceId);

        const titles: Record<string, string> = {
            booking_created: "Ny booking mottatt",
            booking_approved: "Booking godkjent",
            booking_rejected: "Booking avslått",
            booking_cancelled: "Booking kansellert",
            booking_reminder: "Booking påminnelse",
        };

        const messages: Record<string, string> = {
            booking_created: `Ny booking for ${resource?.name || "ressurs"}`,
            booking_approved: `Din booking for ${resource?.name || "ressurs"} er godkjent`,
            booking_rejected: `Din booking for ${resource?.name || "ressurs"} er avslått`,
            booking_cancelled: `Booking for ${resource?.name || "ressurs"} er kansellert`,
            booking_reminder: `Husk din booking for ${resource?.name || "ressurs"}`,
        };

        const notifications = [];

        for (const userId of recipientIds) {
            const notificationId = await ctx.db.insert("conversations", {
                tenantId,
                userId,
                bookingId,
                resourceId: booking.resourceId,
                participants: [userId],
                subject: titles[type] || "Booking oppdatering",
                status: "active",
                unreadCount: 1,
                metadata: {
                    type,
                    message: messages[type] || "Du har en oppdatering på din booking",
                    actionUrl: `/bookings/${bookingId}`,
                    isRead: false,
                    isNotification: true,
                },
            });

            notifications.push(notificationId);
        }

        return { success: true, notificationIds: notifications };
    },
});
