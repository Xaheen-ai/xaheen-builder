/**
 * Google OAuth Integration
 * 
 * Enables authentication via Google account for Gemini API access.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getMemberByConvexMemberIdQuery } from "./sessions";
import { ConvexError } from "convex/values";

/**
 * Get Google OAuth status for current member
 */
export const googleOAuthStatus = query({
    args: {},
    returns: v.union(
        v.null(),
        v.object({
            isConnected: v.boolean(),
            expiresAt: v.optional(v.number()),
            email: v.optional(v.string()),
        })
    ),
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();
        // Use type assertion since schema may not be synced yet
        const memberData = member as typeof member & { googleOAuth?: { accessToken: string; expiresAt: number; email?: string } };

        if (!memberData?.googleOAuth) {
            return { isConnected: false };
        }

        const isConnected = memberData.googleOAuth.expiresAt > Date.now();
        return {
            isConnected,
            expiresAt: memberData.googleOAuth.expiresAt,
            email: memberData.googleOAuth.email,
        };
    },
});

/**
 * Store Google OAuth token after successful OAuth flow
 */
export const storeGoogleOAuthToken = mutation({
    args: {
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresIn: v.number(),
        email: v.optional(v.string()),
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
            googleOAuth: {
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt,
                email: args.email,
            },
        });
    },
});

/**
 * Disconnect Google OAuth
 */
export const disconnectGoogleOAuth = mutation({
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
            googleOAuth: undefined,
        });
    },
});

/**
 * Get access token for Google API calls
 */
export const getGoogleAccessToken = query({
    args: {},
    returns: v.union(v.null(), v.string()),
    handler: async (ctx): Promise<string | null> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();
        const memberData = member as typeof member & { googleOAuth?: { accessToken: string; expiresAt: number } };

        if (!memberData?.googleOAuth) return null;

        if (memberData.googleOAuth.expiresAt <= Date.now()) {
            return null;
        }

        return memberData.googleOAuth.accessToken;
    },
});
