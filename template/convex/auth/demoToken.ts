import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Exchange a demo token for a session.
 * Migrated from: packages/platform/functions/auth-demo-token/index.ts
 */
export const exchangeDemoToken = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        // Look up the demo token
        const tokenRecord = await ctx.db
            .query("authDemoTokens")
            .withIndex("by_key", (q) => q.eq("key", token))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (!tokenRecord) {
            throw new Error("Invalid or expired demo token");
        }

        // Check expiration
        if (tokenRecord.expiresAt && tokenRecord.expiresAt < Date.now()) {
            throw new Error("Demo token has expired");
        }

        // Get the associated user
        const user = await ctx.db.get(tokenRecord.userId);
        if (!user) {
            throw new Error("User not found for demo token");
        }

        // Get the tenant
        const tenant = await ctx.db.get(tokenRecord.tenantId);
        if (!tenant) {
            throw new Error("Tenant not found for demo token");
        }

        // Update last login
        await ctx.db.patch(user._id, {
            lastLoginAt: Date.now(),
        });

        // Return session data
        // Note: In production, integrate with Clerk or generate a proper JWT
        return {
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            tenant: {
                id: tenant._id,
                name: tenant.name,
                slug: tenant.slug,
            },
            organization: tokenRecord.organizationId
                ? await ctx.db.get(tokenRecord.organizationId)
                : null,
        };
    },
});

/**
 * Verify a demo token is valid (without exchanging it)
 */
export const verifyDemoToken = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        const tokenRecord = await ctx.db
            .query("authDemoTokens")
            .withIndex("by_key", (q) => q.eq("key", token))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (!tokenRecord) {
            return { valid: false, reason: "Token not found" };
        }

        if (tokenRecord.expiresAt && tokenRecord.expiresAt < Date.now()) {
            return { valid: false, reason: "Token expired" };
        }

        return { valid: true };
    },
});
