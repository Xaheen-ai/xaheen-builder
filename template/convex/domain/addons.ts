import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Addon Functions
 * Manage addons and resource-addon associations.
 */

// List addons for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        category: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, category, isActive }) => {
        let addons = await ctx.db
            .query("addons")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (category) {
            addons = addons.filter((a) => a.category === category);
        }

        if (isActive !== undefined) {
            addons = addons.filter((a) => a.isActive === isActive);
        }

        addons.sort((a, b) => a.displayOrder - b.displayOrder);

        return addons;
    },
});

// Get addon by ID
export const get = query({
    args: {
        id: v.id("addons"),
    },
    handler: async (ctx, { id }) => {
        const addon = await ctx.db.get(id);
        if (!addon) {
            throw new Error("Addon not found");
        }
        return addon;
    },
});

// Create addon
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        priceType: v.string(),
        price: v.number(),
        currency: v.string(),
        maxQuantity: v.optional(v.number()),
        requiresApproval: v.optional(v.boolean()),
        leadTimeHours: v.optional(v.number()),
        icon: v.optional(v.string()),
        images: v.optional(v.array(v.any())),
        displayOrder: v.optional(v.number()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("addons")
            .withIndex("by_slug", (q) =>
                q.eq("tenantId", args.tenantId).eq("slug", args.slug)
            )
            .first();

        if (existing) {
            throw new Error(`Addon with slug "${args.slug}" already exists`);
        }

        const addonId = await ctx.db.insert("addons", {
            tenantId: args.tenantId,
            name: args.name,
            slug: args.slug,
            description: args.description,
            category: args.category,
            priceType: args.priceType,
            price: args.price,
            currency: args.currency,
            maxQuantity: args.maxQuantity,
            requiresApproval: args.requiresApproval ?? false,
            leadTimeHours: args.leadTimeHours,
            icon: args.icon,
            images: args.images || [],
            displayOrder: args.displayOrder ?? 0,
            isActive: true,
            metadata: args.metadata || {},
        });

        return { id: addonId };
    },
});

// Update addon
export const update = mutation({
    args: {
        id: v.id("addons"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        priceType: v.optional(v.string()),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        maxQuantity: v.optional(v.number()),
        requiresApproval: v.optional(v.boolean()),
        leadTimeHours: v.optional(v.number()),
        icon: v.optional(v.string()),
        images: v.optional(v.array(v.any())),
        displayOrder: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const addon = await ctx.db.get(id);
        if (!addon) {
            throw new Error("Addon not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete addon
export const remove = mutation({
    args: {
        id: v.id("addons"),
    },
    handler: async (ctx, { id }) => {
        const addon = await ctx.db.get(id);
        if (!addon) {
            throw new Error("Addon not found");
        }

        // Check if used in bookings
        const used = await ctx.db
            .query("bookingAddons")
            .withIndex("by_addon", (q) => q.eq("addonId", id))
            .first();

        if (used) {
            throw new Error("Addon is used in bookings, deactivate instead");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// List addons for a resource
export const listForResource = query({
    args: {
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { resourceId }) => {
        const resourceAddons = await ctx.db
            .query("resourceAddons")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .collect();

        const addons = await Promise.all(
            resourceAddons.map(async (ra) => {
                const addon = await ctx.db.get(ra.addonId);
                return {
                    ...ra,
                    addon,
                };
            })
        );

        return addons.filter((a) => a.addon?.isActive);
    },
});

// Add addon to resource
export const addToResource = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        addonId: v.id("addons"),
        isRequired: v.optional(v.boolean()),
        isRecommended: v.optional(v.boolean()),
        customPrice: v.optional(v.number()),
        displayOrder: v.optional(v.number()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("resourceAddons")
            .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
            .filter((q) => q.eq(q.field("addonId"), args.addonId))
            .first();

        if (existing) {
            throw new Error("Addon already added to resource");
        }

        const id = await ctx.db.insert("resourceAddons", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            addonId: args.addonId,
            isRequired: args.isRequired ?? false,
            isRecommended: args.isRecommended ?? false,
            customPrice: args.customPrice,
            displayOrder: args.displayOrder ?? 0,
            isActive: true,
            metadata: args.metadata || {},
        });

        return { id };
    },
});

// Remove addon from resource
export const removeFromResource = mutation({
    args: {
        resourceId: v.id("resources"),
        addonId: v.id("addons"),
    },
    handler: async (ctx, { resourceId, addonId }) => {
        const existing = await ctx.db
            .query("resourceAddons")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) => q.eq(q.field("addonId"), addonId))
            .first();

        if (!existing) {
            throw new Error("Addon not found on resource");
        }

        await ctx.db.delete(existing._id);

        return { success: true };
    },
});
