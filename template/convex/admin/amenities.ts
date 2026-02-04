/**
 * Admin API for Amenities Management
 * 
 * Amenities are tenant-scoped and configurable from admin/saas-admin.
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// =============================================================================
// Queries
// =============================================================================

/**
 * List all amenities for a tenant
 */
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        groupId: v.optional(v.id("amenityGroups")),
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, groupId, includeInactive }) => {
        let amenities = await ctx.db
            .query("amenities")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (groupId) {
            amenities = amenities.filter((a) => a.groupId === groupId);
        }

        if (!includeInactive) {
            amenities = amenities.filter((a) => a.isActive);
        }

        amenities.sort((a, b) => a.displayOrder - b.displayOrder);
        return amenities;
    },
});

/**
 * List amenity groups for a tenant
 */
export const listGroups = query({
    args: {
        tenantId: v.id("tenants"),
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, includeInactive }) => {
        let groups = await ctx.db
            .query("amenityGroups")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (!includeInactive) {
            groups = groups.filter((g) => g.isActive);
        }

        groups.sort((a, b) => a.displayOrder - b.displayOrder);
        return groups;
    },
});

/**
 * Get amenities grouped by their groups
 */
export const getGrouped = query({
    args: {
        tenantId: v.id("tenants"),
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, includeInactive }) => {
        const groups = await ctx.db
            .query("amenityGroups")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        let amenities = await ctx.db
            .query("amenities")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (!includeInactive) {
            amenities = amenities.filter((a) => a.isActive);
        }

        const activeGroups = includeInactive ? groups : groups.filter((g) => g.isActive);

        return activeGroups
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((group) => ({
                ...group,
                amenities: amenities
                    .filter((a) => a.groupId === group._id)
                    .sort((a, b) => a.displayOrder - b.displayOrder),
            }));
    },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create an amenity group
 */
export const createGroup = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const slug = args.slug || args.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const existing = await ctx.db
            .query("amenityGroups")
            .withIndex("by_slug", (q) => q.eq("tenantId", args.tenantId).eq("slug", slug))
            .first();

        if (existing) {
            throw new Error(`Amenity group with slug '${slug}' already exists`);
        }

        const groups = await ctx.db
            .query("amenityGroups")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .collect();
        const maxOrder = Math.max(0, ...groups.map((g) => g.displayOrder));

        return await ctx.db.insert("amenityGroups", {
            tenantId: args.tenantId,
            name: args.name,
            slug,
            description: args.description,
            icon: args.icon,
            displayOrder: args.displayOrder ?? maxOrder + 1,
            isActive: true,
            metadata: {},
        });
    },
});

/**
 * Create an amenity
 */
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        groupId: v.optional(v.id("amenityGroups")),
        name: v.string(),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
        isHighlighted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const slug = args.slug || args.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const existing = await ctx.db
            .query("amenities")
            .withIndex("by_slug", (q) => q.eq("tenantId", args.tenantId).eq("slug", slug))
            .first();

        if (existing) {
            throw new Error(`Amenity with slug '${slug}' already exists`);
        }

        const amenities = await ctx.db
            .query("amenities")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .collect();
        const maxOrder = Math.max(0, ...amenities.map((a) => a.displayOrder));

        return await ctx.db.insert("amenities", {
            tenantId: args.tenantId,
            groupId: args.groupId,
            name: args.name,
            slug,
            description: args.description,
            icon: args.icon,
            displayOrder: args.displayOrder ?? maxOrder + 1,
            isHighlighted: args.isHighlighted ?? false,
            isActive: true,
            metadata: {},
        });
    },
});

/**
 * Update an amenity
 */
export const update = mutation({
    args: {
        id: v.id("amenities"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
        isHighlighted: v.optional(v.boolean()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const existing = await ctx.db.get(id);
        if (!existing) {
            throw new Error("Amenity not found");
        }

        const patch: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                patch[key] = value;
            }
        }

        await ctx.db.patch(id, patch);
        return id;
    },
});

/**
 * Bulk create amenities (for seeding)
 */
export const bulkCreate = mutation({
    args: {
        tenantId: v.id("tenants"),
        amenities: v.array(
            v.object({
                key: v.string(),
                name: v.string(),
                icon: v.optional(v.string()),
                description: v.optional(v.string()),
                isHighlighted: v.optional(v.boolean()),
            })
        ),
    },
    handler: async (ctx, { tenantId, amenities }) => {
        let createdCount = 0;

        for (let i = 0; i < amenities.length; i++) {
            const amenity = amenities[i];
            const slug = amenity.key.toLowerCase().replace(/_/g, "-");

            const existing = await ctx.db
                .query("amenities")
                .withIndex("by_slug", (q) => q.eq("tenantId", tenantId).eq("slug", slug))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    name: amenity.name,
                    icon: amenity.icon,
                    description: amenity.description,
                    isHighlighted: amenity.isHighlighted ?? existing.isHighlighted,
                    displayOrder: i + 1,
                    isActive: true,
                });
            } else {
                await ctx.db.insert("amenities", {
                    tenantId,
                    name: amenity.name,
                    slug,
                    icon: amenity.icon,
                    description: amenity.description,
                    displayOrder: i + 1,
                    isHighlighted: amenity.isHighlighted ?? false,
                    isActive: true,
                    metadata: {},
                });
            }
            createdCount++;
        }

        return { created: createdCount };
    },
});
