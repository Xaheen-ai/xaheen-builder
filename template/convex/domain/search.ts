import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Search Functions
 * Global search and typeahead across resources.
 */

// Global search across resources by name/description
export const globalSearch = query({
    args: {
        tenantId: v.id("tenants"),
        searchTerm: v.string(),
        categoryKey: v.optional(v.string()),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, searchTerm, categoryKey, status, limit }) => {
        const maxResults = limit || 50;
        const term = searchTerm.toLowerCase().trim();

        if (term.length < 2) {
            return [];
        }

        // Get all resources for the tenant
        let resources = await ctx.db
            .query("resources")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        // Filter by status (default to non-deleted)
        if (status) {
            resources = resources.filter((r) => r.status === status);
        } else {
            resources = resources.filter((r) => r.status !== "deleted");
        }

        if (categoryKey) {
            resources = resources.filter((r) => r.categoryKey === categoryKey);
        }

        // Search across name and description
        const matches = resources.filter((r) => {
            const nameMatch = r.name.toLowerCase().includes(term);
            const descMatch = r.description
                ? r.description.toLowerCase().includes(term)
                : false;
            const slugMatch = r.slug.toLowerCase().includes(term);
            return nameMatch || descMatch || slugMatch;
        });

        // Sort by relevance (exact name match first, then name contains, then description)
        matches.sort((a, b) => {
            const aNameExact = a.name.toLowerCase() === term ? 0 : 1;
            const bNameExact = b.name.toLowerCase() === term ? 0 : 1;
            if (aNameExact !== bNameExact) return aNameExact - bNameExact;

            const aNameContains = a.name.toLowerCase().includes(term) ? 0 : 1;
            const bNameContains = b.name.toLowerCase().includes(term) ? 0 : 1;
            return aNameContains - bNameContains;
        });

        return matches.slice(0, maxResults).map((r) => ({
            id: r._id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            categoryKey: r.categoryKey,
            status: r.status,
            images: r.images,
        }));
    },
});

// Typeahead / prefix search for quick lookup
export const typeahead = query({
    args: {
        tenantId: v.id("tenants"),
        prefix: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, prefix, limit }) => {
        const maxResults = limit || 10;
        const term = prefix.toLowerCase().trim();

        if (term.length < 1) {
            return [];
        }

        // Get all resources for the tenant
        const resources = await ctx.db
            .query("resources")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        // Filter to non-deleted and match prefix
        const matches = resources
            .filter((r) => r.status !== "deleted")
            .filter((r) => {
                const nameMatch = r.name.toLowerCase().startsWith(term);
                const slugMatch = r.slug.toLowerCase().startsWith(term);
                return nameMatch || slugMatch;
            });

        // Sort alphabetically
        matches.sort((a, b) => a.name.localeCompare(b.name));

        return matches.slice(0, maxResults).map((r) => ({
            id: r._id,
            name: r.name,
            slug: r.slug,
            categoryKey: r.categoryKey,
        }));
    },
});
