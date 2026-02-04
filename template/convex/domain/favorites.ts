import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Favorites Functions
 * Manage user favorite resources.
 */

// List favorites for a user
export const list = query({
    args: {
        userId: v.id("users"),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, { userId, tags }) => {
        let favorites = await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (tags && tags.length > 0) {
            favorites = favorites.filter((f) =>
                tags.some((tag) => f.tags.includes(tag))
            );
        }

        // Get resource details
        const withResources = await Promise.all(
            favorites.map(async (fav) => {
                const resource = await ctx.db.get(fav.resourceId);
                return { ...fav, resource };
            })
        );

        return withResources.filter((f) => f.resource);
    },
});

// Check if resource is favorited
export const isFavorite = query({
    args: {
        userId: v.id("users"),
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { userId, resourceId }) => {
        const favorite = await ctx.db
            .query("favorites")
            .withIndex("by_user_resource", (q) =>
                q.eq("userId", userId).eq("resourceId", resourceId)
            )
            .first();

        return { isFavorite: !!favorite, favorite };
    },
});

// Add to favorites
export const add = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        resourceId: v.id("resources"),
        notes: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Check if already favorited
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_user_resource", (q) =>
                q.eq("userId", args.userId).eq("resourceId", args.resourceId)
            )
            .first();

        if (existing) {
            throw new Error("Resource already in favorites");
        }

        const favoriteId = await ctx.db.insert("favorites", {
            tenantId: args.tenantId,
            userId: args.userId,
            resourceId: args.resourceId,
            notes: args.notes,
            tags: args.tags || [],
            metadata: args.metadata || {},
        });

        return { id: favoriteId };
    },
});

// Update favorite
export const update = mutation({
    args: {
        id: v.id("favorites"),
        notes: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const favorite = await ctx.db.get(id);
        if (!favorite) {
            throw new Error("Favorite not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Remove from favorites
export const remove = mutation({
    args: {
        userId: v.id("users"),
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { userId, resourceId }) => {
        const favorite = await ctx.db
            .query("favorites")
            .withIndex("by_user_resource", (q) =>
                q.eq("userId", userId).eq("resourceId", resourceId)
            )
            .first();

        if (!favorite) {
            throw new Error("Favorite not found");
        }

        await ctx.db.delete(favorite._id);

        return { success: true };
    },
});

// Toggle favorite
export const toggle = mutation({
    args: {
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { tenantId, userId, resourceId }) => {
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_user_resource", (q) =>
                q.eq("userId", userId).eq("resourceId", resourceId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { isFavorite: false };
        } else {
            await ctx.db.insert("favorites", {
                tenantId,
                userId,
                resourceId,
                tags: [],
                metadata: {},
            });
            return { isFavorite: true };
        }
    },
});
