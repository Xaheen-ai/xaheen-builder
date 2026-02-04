import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Ops Functions
 * Migrated from: packages/platform/functions/ops-health, ops-metrics
 */

// Health check
export const health = query({
    args: {},
    handler: async (ctx) => {
        // Basic health check - just verify we can access the database
        const now = Date.now();

        try {
            // Try to read tenants (lightweight check)
            await ctx.db.query("tenants").first();

            return {
                status: "healthy",
                timestamp: now,
                version: "1.0.0",
                services: {
                    database: "connected",
                    auth: "available",
                },
            };
        } catch (error) {
            return {
                status: "unhealthy",
                timestamp: now,
                error: String(error),
            };
        }
    },
});

// Get system metrics
export const metrics = query({
    args: {
        tenantId: v.optional(v.id("tenants")),
    },
    handler: async (ctx, { tenantId }) => {
        // If tenant-specific, get their metrics
        if (tenantId) {
            const tenant = await ctx.db.get(tenantId);
            if (!tenant) {
                throw new Error("Tenant not found");
            }

            // Count various entities
            const [users, resources, bookings, organizations] = await Promise.all([
                ctx.db
                    .query("users")
                    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
                    .collect(),
                ctx.db
                    .query("resources")
                    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
                    .collect(),
                ctx.db
                    .query("bookings")
                    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
                    .collect(),
                ctx.db
                    .query("organizations")
                    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
                    .collect(),
            ]);

            // Calculate booking stats
            const now = Date.now();
            const dayMs = 24 * 60 * 60 * 1000;
            const weekMs = 7 * dayMs;
            const monthMs = 30 * dayMs;

            const pendingBookings = bookings.filter((b) => b.status === "pending");
            const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
            const recentBookings = bookings.filter(
                (b) => b._creationTime > now - weekMs
            );

            return {
                tenantId,
                counts: {
                    users: users.length,
                    activeUsers: users.filter((u) => u.status === "active").length,
                    resources: resources.length,
                    publishedResources: resources.filter((r) => r.status === "published")
                        .length,
                    bookings: bookings.length,
                    pendingBookings: pendingBookings.length,
                    confirmedBookings: confirmedBookings.length,
                    organizations: organizations.length,
                },
                activity: {
                    bookingsThisWeek: recentBookings.length,
                    bookingsThisMonth: bookings.filter(
                        (b) => b._creationTime > now - monthMs
                    ).length,
                },
                timestamp: now,
            };
        }

        // System-wide metrics (admin only)
        const [tenants, users, resources, bookings] = await Promise.all([
            ctx.db.query("tenants").collect(),
            ctx.db.query("users").collect(),
            ctx.db.query("resources").collect(),
            ctx.db.query("bookings").collect(),
        ]);

        return {
            system: true,
            counts: {
                tenants: tenants.length,
                activeTenants: tenants.filter((t) => t.status === "active").length,
                users: users.length,
                resources: resources.length,
                bookings: bookings.length,
            },
            timestamp: Date.now(),
        };
    },
});

// Feature flags get
export const getFlags = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant.featureFlags || {};
    },
});

// Feature flags set
export const setFlag = mutation({
    args: {
        tenantId: v.id("tenants"),
        flag: v.string(),
        value: v.boolean(),
    },
    handler: async (ctx, { tenantId, flag, value }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        await ctx.db.patch(tenantId, {
            featureFlags: {
                ...tenant.featureFlags,
                [flag]: value,
            },
        });

        return { success: true };
    },
});
