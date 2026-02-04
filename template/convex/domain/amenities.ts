import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Amenity Functions
 * Manage amenities and resource-amenity associations.
 */

// List amenity groups
export const listGroups = query({
    args: {
        tenantId: v.id("tenants"),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, isActive }) => {
        let groups = await ctx.db
            .query("amenityGroups")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (isActive !== undefined) {
            groups = groups.filter((g) => g.isActive === isActive);
        }

        groups.sort((a, b) => a.displayOrder - b.displayOrder);

        return groups;
    },
});

// List amenities
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        groupId: v.optional(v.id("amenityGroups")),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, groupId, isActive }) => {
        let amenities = await ctx.db
            .query("amenities")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (groupId) {
            amenities = amenities.filter((a) => a.groupId === groupId);
        }

        if (isActive !== undefined) {
            amenities = amenities.filter((a) => a.isActive === isActive);
        }

        amenities.sort((a, b) => a.displayOrder - b.displayOrder);

        return amenities;
    },
});

// Get amenity by ID
export const get = query({
    args: {
        id: v.id("amenities"),
    },
    handler: async (ctx, { id }) => {
        const amenity = await ctx.db.get(id);
        if (!amenity) {
            throw new Error("Amenity not found");
        }

        const group = amenity.groupId ? await ctx.db.get(amenity.groupId) : null;

        return {
            ...amenity,
            group,
        };
    },
});

// Create amenity group
export const createGroup = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("amenityGroups")
            .withIndex("by_slug", (q) =>
                q.eq("tenantId", args.tenantId).eq("slug", args.slug)
            )
            .first();

        if (existing) {
            throw new Error(`Amenity group with slug "${args.slug}" already exists`);
        }

        const groupId = await ctx.db.insert("amenityGroups", {
            tenantId: args.tenantId,
            name: args.name,
            slug: args.slug,
            description: args.description,
            icon: args.icon,
            displayOrder: args.displayOrder ?? 0,
            isActive: true,
            metadata: args.metadata || {},
        });

        return { id: groupId };
    },
});

// Create amenity
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        groupId: v.optional(v.id("amenityGroups")),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
        isHighlighted: v.optional(v.boolean()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("amenities")
            .withIndex("by_slug", (q) =>
                q.eq("tenantId", args.tenantId).eq("slug", args.slug)
            )
            .first();

        if (existing) {
            throw new Error(`Amenity with slug "${args.slug}" already exists`);
        }

        const amenityId = await ctx.db.insert("amenities", {
            tenantId: args.tenantId,
            groupId: args.groupId,
            name: args.name,
            slug: args.slug,
            description: args.description,
            icon: args.icon,
            displayOrder: args.displayOrder ?? 0,
            isHighlighted: args.isHighlighted ?? false,
            isActive: true,
            metadata: args.metadata || {},
        });

        return { id: amenityId };
    },
});

// Update amenity
export const update = mutation({
    args: {
        id: v.id("amenities"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
        isHighlighted: v.optional(v.boolean()),
        isActive: v.optional(v.boolean()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const amenity = await ctx.db.get(id);
        if (!amenity) {
            throw new Error("Amenity not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete amenity
export const remove = mutation({
    args: {
        id: v.id("amenities"),
    },
    handler: async (ctx, { id }) => {
        const amenity = await ctx.db.get(id);
        if (!amenity) {
            throw new Error("Amenity not found");
        }

        // Check if used by resources
        const used = await ctx.db
            .query("resourceAmenities")
            .withIndex("by_amenity", (q) => q.eq("amenityId", id))
            .first();

        if (used) {
            throw new Error("Amenity is used by resources, deactivate instead");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// List amenities for a resource
export const listForResource = query({
    args: {
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { resourceId }) => {
        const resourceAmenities = await ctx.db
            .query("resourceAmenities")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .collect();

        const amenities = await Promise.all(
            resourceAmenities.map(async (ra) => {
                const amenity = await ctx.db.get(ra.amenityId);
                return {
                    ...ra,
                    amenity,
                };
            })
        );

        return amenities;
    },
});

// Add amenity to resource
export const addToResource = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        amenityId: v.id("amenities"),
        quantity: v.optional(v.number()),
        notes: v.optional(v.string()),
        isIncluded: v.optional(v.boolean()),
        additionalCost: v.optional(v.number()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Check if already exists
        const existing = await ctx.db
            .query("resourceAmenities")
            .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
            .filter((q) => q.eq(q.field("amenityId"), args.amenityId))
            .first();

        if (existing) {
            throw new Error("Amenity already added to resource");
        }

        const id = await ctx.db.insert("resourceAmenities", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            amenityId: args.amenityId,
            quantity: args.quantity ?? 1,
            notes: args.notes,
            isIncluded: args.isIncluded ?? true,
            additionalCost: args.additionalCost,
            metadata: args.metadata || {},
        });

        return { id };
    },
});

// Remove amenity from resource
export const removeFromResource = mutation({
    args: {
        resourceId: v.id("resources"),
        amenityId: v.id("amenities"),
    },
    handler: async (ctx, { resourceId, amenityId }) => {
        const existing = await ctx.db
            .query("resourceAmenities")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) => q.eq(q.field("amenityId"), amenityId))
            .first();

        if (!existing) {
            throw new Error("Amenity not found on resource");
        }

        await ctx.db.delete(existing._id);

        return { success: true };
    },
});
