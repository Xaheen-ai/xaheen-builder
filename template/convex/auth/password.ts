import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Sign in with email and password.
 * Creates a real session in the sessions table.
 */
export const signInWithPassword = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        appId: v.optional(v.string()),
    },
    handler: async (ctx, { email, password, appId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!user) {
            return { success: false, error: "Invalid email or password" };
        }

        // For demo/dev purposes, accept "demo123" as password
        // In production, add passwordHash field to schema and use bcrypt
        if (password !== "demo123") {
            return { success: false, error: "Invalid email or password" };
        }

        const tenant = user.tenantId ? await ctx.db.get(user.tenantId) : null;

        // Update last login
        await ctx.db.patch(user._id, { lastLoginAt: Date.now() });

        // Create a real session
        const sessionToken: string = await ctx.runMutation(
            internal.auth.sessions.createSession,
            {
                userId: user._id,
                provider: "password",
                appId,
            }
        );

        return {
            success: true as const,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            tenant: tenant
                ? {
                      id: tenant._id,
                      name: tenant.name,
                      slug: tenant.slug,
                  }
                : null,
            sessionToken,
        };
    },
});

/**
 * Get a random demo user for quick login.
 */
export const getRandomDemoUser = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        if (users.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * users.length);
        const user = users[randomIndex];

        return {
            email: user.email,
            name: user.name || user.displayName || user.email,
            role: user.role,
        };
    },
});

/**
 * Sign in as a demo user (picks a random user and logs them in).
 * Creates a real session in the sessions table.
 */
export const signInAsDemo = mutation({
    args: {
        appId: v.optional(v.string()),
    },
    handler: async (ctx, { appId }) => {
        const users = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        if (users.length === 0) {
            return { success: false, error: "No demo users available" };
        }

        const randomIndex = Math.floor(Math.random() * users.length);
        const user = users[randomIndex];

        const tenant = user.tenantId ? await ctx.db.get(user.tenantId) : null;

        // Update last login
        await ctx.db.patch(user._id, { lastLoginAt: Date.now() });

        // Create a real session
        const sessionToken: string = await ctx.runMutation(
            internal.auth.sessions.createSession,
            {
                userId: user._id,
                provider: "demo",
                appId,
            }
        );

        return {
            success: true as const,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            tenant: tenant
                ? {
                      id: tenant._id,
                      name: tenant.name,
                      slug: tenant.slug,
                  }
                : null,
            sessionToken,
        };
    },
});
