import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Resource (formerly Rental Object) Functions
 * Migrated from domain.rental_objects table queries
 */

// List resources for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        categoryKey: v.optional(v.string()),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, categoryKey, status, limit }) => {
        let q = ctx.db
            .query("resources")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId));

        const resources = await q.collect();

        // Filter in memory (Convex doesn't support complex filters on same query)
        let filtered = resources;

        if (categoryKey) {
            filtered = filtered.filter((r) => r.categoryKey === categoryKey);
        }

        if (status) {
            filtered = filtered.filter((r) => r.status === status);
        }

        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    },
});

// List all resources (for admin/backoffice - no tenant filter)
export const listAll = query({
    args: {
        categoryKey: v.optional(v.string()),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { categoryKey, status, limit }) => {
        const resources = await ctx.db.query("resources").collect();

        let filtered = resources;

        if (categoryKey) {
            filtered = filtered.filter((r) => r.categoryKey === categoryKey);
        }

        if (status) {
            filtered = filtered.filter((r) => r.status === status);
        }

        // Exclude deleted
        filtered = filtered.filter((r) => r.status !== "deleted");

        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    },
});

// List public resources (no tenantId required - for public web apps)
export const listPublic = query({
    args: {
        categoryKey: v.optional(v.string()),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { categoryKey, status, limit }) => {
        // Get all resources that are visible to the public (published or active, not deleted/archived)
        const resources = await ctx.db
            .query("resources")
            .filter((q) =>
                q.and(
                    q.neq(q.field("status"), "deleted"),
                    q.neq(q.field("status"), "archived")
                )
            )
            .collect();

        let filtered = resources;

        if (categoryKey) {
            filtered = filtered.filter((r) => r.categoryKey === categoryKey);
        }

        if (status) {
            filtered = filtered.filter((r) => r.status === status);
        }

        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    },
});

// Get a single resource by ID
export const get = query({
    args: {
        id: v.id("resources"),
    },
    handler: async (ctx, { id }) => {
        const resource = await ctx.db.get(id);
        if (!resource) {
            throw new Error("Resource not found");
        }

        // Get related data
        const amenities = await ctx.db
            .query("resourceAmenities")
            .withIndex("by_resource", (q) => q.eq("resourceId", id))
            .collect();

        const addons = await ctx.db
            .query("resourceAddons")
            .withIndex("by_resource", (q) => q.eq("resourceId", id))
            .collect();

        const pricing = await ctx.db
            .query("resourcePricing")
            .withIndex("by_resource", (q) => q.eq("resourceId", id))
            .collect();

        return {
            ...resource,
            amenities,
            addons,
            pricing,
        };
    },
});

// Get resource by slug
export const getBySlug = query({
    args: {
        tenantId: v.id("tenants"),
        slug: v.string(),
    },
    handler: async (ctx, { tenantId, slug }) => {
        const resource = await ctx.db
            .query("resources")
            .withIndex("by_slug", (q) => q.eq("tenantId", tenantId).eq("slug", slug))
            .first();

        return resource;
    },
});

// Get resource by slug (public - no tenantId required)
export const getBySlugPublic = query({
    args: {
        slug: v.string(),
    },
    handler: async (ctx, { slug }) => {
        // Table scan filtered by slug + published status
        const resources = await ctx.db
            .query("resources")
            .filter((q) => q.and(
                q.eq(q.field("slug"), slug),
                q.eq(q.field("status"), "published"),
            ))
            .first();

        return resources;
    },
});

// Create a new resource
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        organizationId: v.optional(v.id("organizations")),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        categoryKey: v.string(),
        timeMode: v.optional(v.string()),
        status: v.optional(v.string()),
        requiresApproval: v.optional(v.boolean()),
        capacity: v.optional(v.number()),
        images: v.optional(v.array(v.any())),
        pricing: v.optional(v.any()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Check slug uniqueness
        const existing = await ctx.db
            .query("resources")
            .withIndex("by_slug", (q) =>
                q.eq("tenantId", args.tenantId).eq("slug", args.slug)
            )
            .first();

        if (existing) {
            throw new Error(`Resource with slug "${args.slug}" already exists`);
        }

        const resourceId = await ctx.db.insert("resources", {
            tenantId: args.tenantId,
            organizationId: args.organizationId,
            name: args.name,
            slug: args.slug,
            description: args.description,
            categoryKey: args.categoryKey,
            timeMode: args.timeMode || "PERIOD",
            features: [],
            status: args.status || "draft",
            requiresApproval: args.requiresApproval || false,
            capacity: args.capacity,
            inventoryTotal: args.capacity,
            images: args.images || [],
            pricing: args.pricing || {},
            metadata: args.metadata || {},
        });

        return { id: resourceId };
    },
});

// Update a resource
export const update = mutation({
    args: {
        id: v.id("resources"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        requiresApproval: v.optional(v.boolean()),
        capacity: v.optional(v.number()),
        images: v.optional(v.array(v.any())),
        pricing: v.optional(v.any()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const resource = await ctx.db.get(id);
        if (!resource) {
            throw new Error("Resource not found");
        }

        // Filter out undefined values
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete a resource
export const remove = mutation({
    args: {
        id: v.id("resources"),
    },
    handler: async (ctx, { id }) => {
        const resource = await ctx.db.get(id);
        if (!resource) {
            throw new Error("Resource not found");
        }

        // Soft delete - just change status
        await ctx.db.patch(id, { status: "deleted" });

        return { success: true };
    },
});

// Publish a resource (change status to published)
export const publish = mutation({
    args: {
        id: v.id("resources"),
    },
    handler: async (ctx, { id }) => {
        const resource = await ctx.db.get(id);
        if (!resource) {
            throw new Error("Resource not found");
        }

        await ctx.db.patch(id, { status: "published" });

        return { success: true };
    },
});

// Unpublish a resource
export const unpublish = mutation({
    args: {
        id: v.id("resources"),
    },
    handler: async (ctx, { id }) => {
        const resource = await ctx.db.get(id);
        if (!resource) {
            throw new Error("Resource not found");
        }

        await ctx.db.patch(id, { status: "draft" });

        return { success: true };
    },
});
