/**
 * Claude OAuth Integration
 * 
 * Enables authentication via Claude Pro/Max subscription instead of API keys.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getMemberByConvexMemberIdQuery } from "./sessions";
import { ConvexError } from "convex/values";

/**
 * Get Claude OAuth status for current member
 */
export const claudeOAuthStatus = query({
    args: {},
    returns: v.union(
        v.null(),
        v.object({
            isConnected: v.boolean(),
            expiresAt: v.optional(v.number()),
        })
    ),
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();
        // Use type assertion since schema may not be synced yet
        const memberData = member as typeof member & { claudeOAuth?: { accessToken: string; expiresAt: number; refreshToken?: string; sessionId?: string } };

        if (!memberData?.claudeOAuth) {
            return { isConnected: false };
        }

        const isConnected = memberData.claudeOAuth.expiresAt > Date.now();
        return {
            isConnected,
            expiresAt: memberData.claudeOAuth.expiresAt,
        };
    },
});

/**
 * Store Claude OAuth token after successful OAuth flow
 */
export const storeClaudeOAuthToken = mutation({
    args: {
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresIn: v.number(),
        sessionId: v.optional(v.string()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: "NotAuthorized", message: "Unauthorized" });
        }

        const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();
        if (!member) {
            throw new ConvexError({ code: "NotAuthorized", message: "Member not found" });
        }

        const expiresAt = Date.now() + (args.expiresIn * 1000);

        // Use any cast for schema compatibility during transition
        await (ctx.db.patch as any)("convexMembers", member._id, {
            claudeOAuth: {
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt,
                sessionId: args.sessionId,
            },
        });
    },
});

/**
 * Disconnect Claude OAuth
 */
export const disconnectClaudeOAuth = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: "NotAuthorized", message: "Unauthorized" });
        }

        const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();
        if (!member) {
            throw new ConvexError({ code: "NotAuthorized", message: "Member not found" });
        }

        // Use any cast for schema compatibility during transition
        await (ctx.db.patch as any)("convexMembers", member._id, {
            claudeOAuth: undefined,
        });
    },
});

/**
 * Get access token for Claude API calls
 */
export const getClaudeAccessToken = query({
    args: {},
    returns: v.union(v.null(), v.string()),
    handler: async (ctx): Promise<string | null> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();
        const memberData = member as typeof member & { claudeOAuth?: { accessToken: string; expiresAt: number } };

        if (!memberData?.claudeOAuth) return null;

        if (memberData.claudeOAuth.expiresAt <= Date.now()) {
            return null;
        }

        return memberData.claudeOAuth.accessToken;
    },
});
