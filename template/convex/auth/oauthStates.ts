import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Create an OAuth state record for CSRF protection.
 */
export const createState = internalMutation({
    args: {
        state: v.string(),
        provider: v.string(),
        appOrigin: v.string(),
        returnPath: v.string(),
        appId: v.string(),
        signicatSessionId: v.optional(v.string()),
    },
    handler: async (ctx, { state, provider, appOrigin, returnPath, appId, signicatSessionId }) => {
        const now = Date.now();
        await ctx.db.insert("oauthStates", {
            state,
            provider,
            appOrigin,
            returnPath,
            appId,
            signicatSessionId,
            createdAt: now,
            expiresAt: now + STATE_EXPIRY_MS,
            consumed: false,
        });
    },
});

/**
 * Consume an OAuth state — validates, marks consumed, returns provider/appOrigin/returnPath.
 * Returns null if invalid or already consumed.
 */
export const consumeState = internalMutation({
    args: {
        state: v.string(),
    },
    handler: async (ctx, { state }) => {
        const record = await ctx.db
            .query("oauthStates")
            .withIndex("by_state", (q) => q.eq("state", state))
            .first();

        if (!record) {
            return null;
        }

        if (record.consumed || record.expiresAt < Date.now()) {
            return null;
        }

        await ctx.db.patch(record._id, { consumed: true });

        return {
            provider: record.provider,
            appOrigin: record.appOrigin,
            returnPath: record.returnPath,
            appId: record.appId,
            signicatSessionId: record.signicatSessionId,
        };
    },
});
