import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Dashboard Functions
 * KPIs, stats, and activity feeds for monitoring dashboards.
 */

// Get key performance indicators for a tenant
export const getKPIs = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const now = Date.now();
        const dayStart = now - (now % (24 * 60 * 60 * 1000));
        const weekStart = dayStart - 7 * 24 * 60 * 60 * 1000;
        const monthStart = dayStart - 30 * 24 * 60 * 60 * 1000;

        // Count resources
        const resources = await ctx.db
            .query("resources")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        const activeResources = resources.filter(
            (r) => r.status !== "deleted" && r.status !== "draft"
        );

        // Count bookings
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        const todayBookings = bookings.filter(
            (b) => b.startTime >= dayStart && b.startTime < dayStart + 24 * 60 * 60 * 1000
        );
        const weekBookings = bookings.filter((b) => b.startTime >= weekStart);
        const monthBookings = bookings.filter((b) => b.startTime >= monthStart);
        const pendingBookings = bookings.filter((b) => b.status === "pending");

        // Count users
        const tenantUsers = await ctx.db
            .query("tenantUsers")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        const activeUsers = tenantUsers.filter((u) => u.status === "active");

        // Revenue this month
        const monthRevenue = monthBookings
            .filter((b) => b.status === "confirmed")
            .reduce((sum, b) => sum + b.totalPrice, 0);

        return {
            resources: {
                total: resources.length,
                active: activeResources.length,
                published: resources.filter((r) => r.status === "published").length,
            },
            bookings: {
                total: bookings.length,
                today: todayBookings.length,
                thisWeek: weekBookings.length,
                thisMonth: monthBookings.length,
                pending: pendingBookings.length,
            },
            users: {
                total: tenantUsers.length,
                active: activeUsers.length,
            },
            revenue: {
                thisMonth: monthRevenue,
                currency: "NOK",
            },
        };
    },
});

// Get detailed stats with breakdowns
export const getStats = query({
    args: {
        tenantId: v.id("tenants"),
        periodStart: v.optional(v.number()),
        periodEnd: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, periodStart, periodEnd }) => {
        const now = Date.now();
        const start = periodStart || now - 30 * 24 * 60 * 60 * 1000;
        const end = periodEnd || now;

        // Bookings in period
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        const periodBookings = bookings.filter(
            (b) => b._creationTime >= start && b._creationTime <= end
        );

        // Status breakdown
        const statusCounts: Record<string, number> = {};
        for (const booking of periodBookings) {
            statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
        }

        // Resource utilization
        const resources = await ctx.db
            .query("resources")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        const resourceBookingCounts: Record<string, { name: string; count: number; revenue: number }> = {};
        for (const booking of periodBookings) {
            const resourceId = booking.resourceId as string;
            if (!resourceBookingCounts[resourceId]) {
                const resource = resources.find((r) => r._id === booking.resourceId);
                resourceBookingCounts[resourceId] = {
                    name: resource?.name || "Unknown",
                    count: 0,
                    revenue: 0,
                };
            }
            resourceBookingCounts[resourceId].count++;
            if (booking.status === "confirmed") {
                resourceBookingCounts[resourceId].revenue += booking.totalPrice;
            }
        }

        // Top resources by booking count
        const topResources = Object.entries(resourceBookingCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([id, data]) => ({ resourceId: id, ...data }));

        // Revenue breakdown
        const confirmedBookings = periodBookings.filter(
            (b) => b.status === "confirmed"
        );
        const totalRevenue = confirmedBookings.reduce(
            (sum, b) => sum + b.totalPrice,
            0
        );

        // Category breakdown
        const categoryBookings: Record<string, number> = {};
        for (const booking of periodBookings) {
            const resource = resources.find((r) => r._id === booking.resourceId);
            if (resource) {
                const cat = resource.categoryKey;
                categoryBookings[cat] = (categoryBookings[cat] || 0) + 1;
            }
        }

        return {
            period: { start, end },
            bookings: {
                total: periodBookings.length,
                byStatus: statusCounts,
                byCategory: categoryBookings,
            },
            revenue: {
                total: totalRevenue,
                averagePerBooking:
                    confirmedBookings.length > 0
                        ? Math.round(totalRevenue / confirmedBookings.length)
                        : 0,
            },
            topResources,
        };
    },
});

// Get recent activity (audit events)
export const getActivity = query({
    args: {
        tenantId: v.id("tenants"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, limit }) => {
        const maxItems = limit || 20;

        // Get recent audit entries
        const auditEntries = await ctx.db
            .query("bookingAudit")
            .filter((q) => q.eq(q.field("tenantId"), tenantId))
            .order("desc")
            .take(maxItems);

        // Enrich with user details
        const withDetails = await Promise.all(
            auditEntries.map(async (entry) => {
                const user = entry.userId
                    ? await ctx.db.get(entry.userId)
                    : null;
                const booking = await ctx.db.get(entry.bookingId);
                const resource = booking
                    ? await ctx.db.get(booking.resourceId)
                    : null;

                return {
                    id: entry._id,
                    action: entry.action,
                    timestamp: entry.timestamp,
                    user: user
                        ? { id: user._id, name: user.name, email: user.email }
                        : null,
                    booking: booking
                        ? {
                              id: booking._id,
                              status: booking.status,
                              startTime: booking.startTime,
                          }
                        : null,
                    resource: resource
                        ? { id: resource._id, name: resource.name }
                        : null,
                    reason: entry.reason,
                };
            })
        );

        return withDetails;
    },
});
