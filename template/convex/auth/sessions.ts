import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a new session for a user.
 * Internal mutation — called from password.ts and http.ts callback.
 */
export const createSession = internalMutation({
    args: {
        userId: v.id("users"),
        provider: v.string(),
        appId: v.optional(v.string()),
    },
    handler: async (ctx, { userId, provider, appId }) => {
        const token = crypto.randomUUID();
        const now = Date.now();

        await ctx.db.insert("sessions", {
            userId,
            token,
            appId,
            provider,
            expiresAt: now + SESSION_DURATION_MS,
            lastActiveAt: now,
            isActive: true,
        });

        return token;
    },
});

/**
 * Validate a session by token.
 * Returns user + tenant data if valid, null otherwise.
 */
export const validateSessionByToken = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (!session || !session.isActive || session.expiresAt < Date.now()) {
            return null;
        }

        const user = await ctx.db.get(session.userId);
        if (!user || user.status !== "active") {
            return null;
        }

        const tenant = user.tenantId ? await ctx.db.get(user.tenantId) : null;

        return {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                avatarUrl: user.avatarUrl,
                tenantId: user.tenantId,
                organizationId: user.organizationId,
            },
            tenant: tenant
                ? {
                      id: tenant._id,
                      name: tenant.name,
                      slug: tenant.slug,
                  }
                : null,
            session: {
                expiresAt: session.expiresAt,
                provider: session.provider,
                appId: session.appId,
            },
        };
    },
});

/**
 * Delete (deactivate) a single session.
 */
export const deleteSession = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (session) {
            await ctx.db.patch(session._id, { isActive: false });
        }
    },
});

/**
 * Delete all sessions for a user (sign out everywhere).
 */
export const deleteAllUserSessions = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        for (const session of sessions) {
            await ctx.db.patch(session._id, { isActive: false });
        }
    },
});

/**
 * Touch session — update lastActiveAt to keep it alive.
 */
export const touchSession = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (session && session.isActive) {
            await ctx.db.patch(session._id, { lastActiveAt: Date.now() });
        }
    },
});
