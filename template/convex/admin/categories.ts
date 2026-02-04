/**
 * Admin API for Categories Management
 * 
 * Categories are tenant-scoped and configurable from admin/saas-admin.
 * Supports hierarchical structure (parent/child for subcategories).
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// =============================================================================
// Queries
// =============================================================================

/**
 * List all categories for a tenant (including subcategories)
 */
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        parentId: v.optional(v.id("categories")),
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, parentId, includeInactive }) => {
        let categories = await ctx.db
            .query("categories")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        // Filter by parent if specified
        if (parentId !== undefined) {
            categories = categories.filter((c) => c.parentId === parentId);
        } else {
            // Get root categories (no parent)
            categories = categories.filter((c) => !c.parentId);
        }

        // Filter inactive unless requested
        if (!includeInactive) {
            categories = categories.filter((c) => c.isActive);
        }

        // Sort by sortOrder
        categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        return categories;
    },
});

/**
 * Get category tree (categories with their subcategories)
 */
export const getTree = query({
    args: {
        tenantId: v.id("tenants"),
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, includeInactive }) => {
        let allCategories = await ctx.db
            .query("categories")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (!includeInactive) {
            allCategories = allCategories.filter((c) => c.isActive);
        }

        // Build tree structure
        const rootCategories = allCategories
            .filter((c) => !c.parentId)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        return rootCategories.map((parent) => ({
            ...parent,
            subcategories: allCategories
                .filter((c) => c.parentId === parent._id)
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        }));
    },
});

/**
 * Get a single category by ID
 */
export const getById = query({
    args: { id: v.id("categories") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

/**
 * Get a category by key
 */
export const getByKey = query({
    args: {
        tenantId: v.id("tenants"),
        key: v.string(),
    },
    handler: async (ctx, { tenantId, key }) => {
        return await ctx.db
            .query("categories")
            .withIndex("by_key", (q) => q.eq("tenantId", tenantId).eq("key", key))
            .first();
    },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new category
 */
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        parentId: v.optional(v.id("categories")),
        key: v.string(),
        name: v.string(),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        settings: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const slug = args.slug || args.key.toLowerCase().replace(/_/g, "-");

        // Check for duplicate key
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_key", (q) => q.eq("tenantId", args.tenantId).eq("key", args.key))
            .first();

        if (existing) {
            throw new Error(`Category with key '${args.key}' already exists`);
        }

        // Get max sortOrder for this level
        const siblings = await ctx.db
            .query("categories")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .collect();

        const sameLevelSiblings = siblings.filter((c) =>
            args.parentId ? c.parentId === args.parentId : !c.parentId
        );
        const maxOrder = Math.max(0, ...sameLevelSiblings.map((c) => c.sortOrder ?? 0));

        const id = await ctx.db.insert("categories", {
            tenantId: args.tenantId,
            parentId: args.parentId,
            key: args.key,
            name: args.name,
            slug,
            description: args.description,
            icon: args.icon,
            color: args.color,
            sortOrder: args.sortOrder ?? maxOrder + 1,
            settings: args.settings ?? {},
            isActive: true,
        });

        return id;
    },
});

/**
 * Update a category
 */
export const update = mutation({
    args: {
        id: v.id("categories"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        settings: v.optional(v.any()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const existing = await ctx.db.get(id);
        if (!existing) {
            throw new Error("Category not found");
        }

        // Filter out undefined values
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
 * Delete a category (soft delete by setting isActive = false)
 */
export const remove = mutation({
    args: { id: v.id("categories") },
    handler: async (ctx, { id }) => {
        const category = await ctx.db.get(id);
        if (!category) {
            throw new Error("Category not found");
        }

        // Check if category has subcategories
        const subcategories = await ctx.db
            .query("categories")
            .withIndex("by_parent", (q) => q.eq("parentId", id))
            .collect();

        if (subcategories.length > 0) {
            throw new Error("Cannot delete category with subcategories. Delete subcategories first.");
        }

        // Soft delete
        await ctx.db.patch(id, { isActive: false });
        return id;
    },
});

/**
 * Reorder categories
 */
export const reorder = mutation({
    args: {
        categoryIds: v.array(v.id("categories")),
    },
    handler: async (ctx, { categoryIds }) => {
        for (let i = 0; i < categoryIds.length; i++) {
            await ctx.db.patch(categoryIds[i], { sortOrder: i + 1 });
        }
        return true;
    },
});

/**
 * Bulk create categories (for seeding)
 */
export const bulkCreate = mutation({
    args: {
        tenantId: v.id("tenants"),
        categories: v.array(
            v.object({
                key: v.string(),
                name: v.string(),
                icon: v.optional(v.string()),
                color: v.optional(v.string()),
                description: v.optional(v.string()),
                settings: v.optional(v.any()),
                subcategories: v.optional(
                    v.array(
                        v.object({
                            key: v.string(),
                            name: v.string(),
                            icon: v.optional(v.string()),
                            description: v.optional(v.string()),
                        })
                    )
                ),
            })
        ),
    },
    handler: async (ctx, { tenantId, categories }) => {
        let createdCount = 0;

        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];

            // Check if already exists
            const existing = await ctx.db
                .query("categories")
                .withIndex("by_key", (q) => q.eq("tenantId", tenantId).eq("key", cat.key))
                .first();

            let parentCatId: string | undefined;
            if (existing) {
                parentCatId = existing._id as string;
                await ctx.db.patch(existing._id, {
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color,
                    description: cat.description,
                    settings: cat.settings ?? existing.settings,
                    sortOrder: i + 1,
                    isActive: true,
                });
            } else {
                parentCatId = await ctx.db.insert("categories", {
                    tenantId,
                    key: cat.key,
                    name: cat.name,
                    slug: cat.key.toLowerCase().replace(/_/g, "-"),
                    icon: cat.icon,
                    color: cat.color,
                    description: cat.description,
                    settings: cat.settings ?? {},
                    sortOrder: i + 1,
                    isActive: true,
                });
            }
            createdCount++;

            // Create subcategories
            if (cat.subcategories && parentCatId) {
                for (let j = 0; j < cat.subcategories.length; j++) {
                    const sub = cat.subcategories[j];

                    const existingSub = await ctx.db
                        .query("categories")
                        .withIndex("by_key", (q) => q.eq("tenantId", tenantId).eq("key", sub.key))
                        .first();

                    if (existingSub) {
                        await ctx.db.patch(existingSub._id, {
                            name: sub.name,
                            icon: sub.icon,
                            description: sub.description,
                            parentId: parentCatId as never,
                            sortOrder: j + 1,
                            isActive: true,
                        });
                    } else {
                        await ctx.db.insert("categories", {
                            tenantId,
                            parentId: parentCatId as never,
                            key: sub.key,
                            name: sub.name,
                            slug: sub.key.toLowerCase().replace(/_/g, "-"),
                            icon: sub.icon,
                            description: sub.description,
                            settings: {},
                            sortOrder: j + 1,
                            isActive: true,
                        });
                    }
                    createdCount++;
                }
            }
        }

        return { created: createdCount };
    },
});
