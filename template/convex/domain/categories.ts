import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Category Functions
 * Manage resource categories and subcategories.
 */

// List categories for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        parentId: v.optional(v.id("categories")),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, parentId, isActive }) => {
        let categories = await ctx.db
            .query("categories")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (parentId !== undefined) {
            categories = categories.filter((c) => c.parentId === parentId);
        }

        if (isActive !== undefined) {
            categories = categories.filter((c) => c.isActive === isActive);
        }

        // Sort by sortOrder
        categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        return categories;
    },
});

// Get category by ID
export const get = query({
    args: {
        id: v.id("categories"),
    },
    handler: async (ctx, { id }) => {
        const category = await ctx.db.get(id);
        if (!category) {
            throw new Error("Category not found");
        }

        // Get parent
        const parent = category.parentId ? await ctx.db.get(category.parentId) : null;

        // Get children
        const children = await ctx.db
            .query("categories")
            .withIndex("by_parent", (q) => q.eq("parentId", id))
            .collect();

        return {
            ...category,
            parent,
            children,
        };
    },
});

// Get category by key
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

// Create category
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        parentId: v.optional(v.id("categories")),
        key: v.optional(v.string()),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        settings: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Check slug uniqueness
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_slug", (q) =>
                q.eq("tenantId", args.tenantId).eq("slug", args.slug)
            )
            .first();

        if (existing) {
            throw new Error(`Category with slug "${args.slug}" already exists`);
        }

        const categoryId = await ctx.db.insert("categories", {
            tenantId: args.tenantId,
            parentId: args.parentId,
            key: args.key,
            name: args.name,
            slug: args.slug,
            description: args.description,
            icon: args.icon,
            color: args.color,
            sortOrder: args.sortOrder ?? 0,
            settings: args.settings || {},
            isActive: true,
        });

        return { id: categoryId };
    },
});

// Update category
export const update = mutation({
    args: {
        id: v.id("categories"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        settings: v.optional(v.any()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const category = await ctx.db.get(id);
        if (!category) {
            throw new Error("Category not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete category
export const remove = mutation({
    args: {
        id: v.id("categories"),
    },
    handler: async (ctx, { id }) => {
        const category = await ctx.db.get(id);
        if (!category) {
            throw new Error("Category not found");
        }

        // Check for children
        const children = await ctx.db
            .query("categories")
            .withIndex("by_parent", (q) => q.eq("parentId", id))
            .first();

        if (children) {
            throw new Error("Cannot delete category with children");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Get category tree
export const getTree = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const allCategories = await ctx.db
            .query("categories")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        // Build tree using any type to avoid complex recursive typing
        const categoryMap = new Map<string, Record<string, unknown>>();
        
        for (const cat of allCategories) {
            categoryMap.set(cat._id, { ...cat, children: [] });
        }

        const roots: Record<string, unknown>[] = [];

        for (const category of categoryMap.values()) {
            const parentId = category.parentId as string | undefined;
            if (parentId && categoryMap.has(parentId)) {
                const parent = categoryMap.get(parentId)!;
                (parent.children as Record<string, unknown>[]).push(category);
            } else {
                roots.push(category);
            }
        }

        // Sort children by sortOrder
        const sortChildren = (cats: Record<string, unknown>[]): void => {
            cats.sort((a, b) => ((a.sortOrder as number) ?? 0) - ((b.sortOrder as number) ?? 0));
            cats.forEach((c) => sortChildren(c.children as Record<string, unknown>[]));
        };

        sortChildren(roots);

        return roots;
    },
});
