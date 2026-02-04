import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Messaging Functions
 * Manage conversations and messages between users.
 */

// List conversations for a user
export const listConversations = query({
    args: {
        userId: v.id("users"),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { userId, status, limit }) => {
        let conversations = await ctx.db
            .query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Filter out notifications
        conversations = conversations.filter((c) => {
            const meta = c.metadata as Record<string, unknown>;
            return !meta?.isNotification;
        });

        if (status) {
            conversations = conversations.filter((c) => c.status === status);
        }

        if (limit) {
            conversations = conversations.slice(0, limit);
        }

        // Get participant details
        const withParticipants = await Promise.all(
            conversations.map(async (conv) => {
                const participants = await Promise.all(
                    conv.participants.map(async (pId) => {
                        const user = await ctx.db.get(pId);
                        return user ? { id: user._id, name: user.name, email: user.email } : null;
                    })
                );
                return {
                    ...conv,
                    participantDetails: participants.filter(Boolean),
                };
            })
        );

        return withParticipants;
    },
});

// Get conversation by ID
export const getConversation = query({
    args: {
        id: v.id("conversations"),
    },
    handler: async (ctx, { id }) => {
        const conversation = await ctx.db.get(id);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Get messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", id))
            .order("asc")
            .collect();

        // Get participant details
        const participants = await Promise.all(
            conversation.participants.map(async (pId) => {
                const user = await ctx.db.get(pId);
                return user ? { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } : null;
            })
        );

        // Get related booking/resource if any
        const booking = conversation.bookingId ? await ctx.db.get(conversation.bookingId) : null;
        const resource = conversation.resourceId ? await ctx.db.get(conversation.resourceId) : null;

        return {
            ...conversation,
            messages,
            participantDetails: participants.filter(Boolean),
            booking,
            resource,
        };
    },
});

// Create conversation
export const createConversation = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        participants: v.array(v.id("users")),
        subject: v.optional(v.string()),
        bookingId: v.optional(v.id("bookings")),
        resourceId: v.optional(v.id("resources")),
        initialMessage: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Ensure creator is in participants
        const allParticipants = [...new Set([args.userId, ...args.participants])];

        const conversationId = await ctx.db.insert("conversations", {
            tenantId: args.tenantId,
            userId: args.userId,
            bookingId: args.bookingId,
            resourceId: args.resourceId,
            participants: allParticipants,
            subject: args.subject,
            status: "active",
            unreadCount: 0,
            lastMessageAt: Date.now(),
            metadata: args.metadata || {},
        });

        // Create initial message if provided
        if (args.initialMessage) {
            await ctx.db.insert("messages", {
                tenantId: args.tenantId,
                conversationId,
                senderId: args.userId,
                senderType: "user",
                content: args.initialMessage,
                messageType: "text",
                attachments: [],
                metadata: {},
                sentAt: Date.now(),
            });
        }

        return { id: conversationId };
    },
});

// Send message
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        messageType: v.optional(v.string()),
        attachments: v.optional(v.array(v.any())),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Verify sender is participant
        if (!conversation.participants.includes(args.senderId)) {
            throw new Error("User is not a participant in this conversation");
        }

        const messageId = await ctx.db.insert("messages", {
            tenantId: conversation.tenantId,
            conversationId: args.conversationId,
            senderId: args.senderId,
            senderType: "user",
            content: args.content,
            messageType: args.messageType || "text",
            attachments: args.attachments || [],
            metadata: args.metadata || {},
            sentAt: Date.now(),
        });

        // Update conversation
        await ctx.db.patch(args.conversationId, {
            lastMessageAt: Date.now(),
            unreadCount: conversation.unreadCount + 1,
        });

        return { id: messageId };
    },
});

// Mark messages as read
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, { conversationId, userId }) => {
        const conversation = await ctx.db.get(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Get unread messages not from this user
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("senderId"), userId),
                    q.eq(q.field("readAt"), undefined)
                )
            )
            .collect();

        // Mark as read
        for (const message of messages) {
            await ctx.db.patch(message._id, { readAt: Date.now() });
        }

        // Reset unread count
        await ctx.db.patch(conversationId, { unreadCount: 0 });

        return { success: true, markedCount: messages.length };
    },
});

// Close conversation
export const closeConversation = mutation({
    args: {
        id: v.id("conversations"),
    },
    handler: async (ctx, { id }) => {
        const conversation = await ctx.db.get(id);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        await ctx.db.patch(id, { status: "closed" });

        return { success: true };
    },
});

// Reopen conversation
export const reopenConversation = mutation({
    args: {
        id: v.id("conversations"),
    },
    handler: async (ctx, { id }) => {
        const conversation = await ctx.db.get(id);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        await ctx.db.patch(id, { status: "active" });

        return { success: true };
    },
});

// Add participant to conversation
export const addParticipant = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, { conversationId, userId }) => {
        const conversation = await ctx.db.get(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.participants.includes(userId)) {
            throw new Error("User is already a participant");
        }

        await ctx.db.patch(conversationId, {
            participants: [...conversation.participants, userId],
        });

        return { success: true };
    },
});

// Remove participant from conversation
export const removeParticipant = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, { conversationId, userId }) => {
        const conversation = await ctx.db.get(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Cannot remove the conversation owner
        if (conversation.userId === userId) {
            throw new Error("Cannot remove conversation owner");
        }

        await ctx.db.patch(conversationId, {
            participants: conversation.participants.filter((p) => p !== userId),
        });

        return { success: true };
    },
});

// Delete message (soft delete)
export const deleteMessage = mutation({
    args: {
        id: v.id("messages"),
        userId: v.id("users"),
    },
    handler: async (ctx, { id, userId }) => {
        const message = await ctx.db.get(id);
        if (!message) {
            throw new Error("Message not found");
        }

        // Only sender can delete their messages
        if (message.senderId !== userId) {
            throw new Error("Cannot delete another user's message");
        }

        await ctx.db.patch(id, {
            content: "[Message deleted]",
            messageType: "deleted",
            metadata: {
                ...(message.metadata as Record<string, unknown>),
                deletedAt: Date.now(),
                deletedBy: userId,
            },
        });

        return { success: true };
    },
});
