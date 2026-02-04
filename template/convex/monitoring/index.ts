import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Monitoring Functions
 * Metrics, analytics, and reporting functions.
 */

// Get booking metrics
export const getBookingMetrics = query({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        periodStart: v.number(),
        periodEnd: v.number(),
    },
    handler: async (ctx, { tenantId, resourceId, periodStart, periodEnd }) => {
        let metrics = await ctx.db
            .query("bookingMetrics")
            .filter((q) =>
                q.and(
                    q.eq(q.field("tenantId"), tenantId),
                    q.gte(q.field("periodStart"), periodStart),
                    q.lte(q.field("periodEnd"), periodEnd)
                )
            )
            .collect();

        if (resourceId) {
            metrics = metrics.filter((m) => m.resourceId === resourceId);
        }

        return metrics;
    },
});

// Get availability metrics
export const getAvailabilityMetrics = query({
    args: {
        resourceId: v.id("resources"),
        periodStart: v.number(),
        periodEnd: v.number(),
    },
    handler: async (ctx, { resourceId, periodStart, periodEnd }) => {
        const metrics = await ctx.db
            .query("availabilityMetrics")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) =>
                q.and(
                    q.gte(q.field("periodStart"), periodStart),
                    q.lte(q.field("periodEnd"), periodEnd)
                )
            )
            .collect();

        return metrics;
    },
});

// Calculate and store booking metrics
export const calculateBookingMetrics = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        period: v.string(),
        periodStart: v.number(),
        periodEnd: v.number(),
    },
    handler: async (ctx, { tenantId, resourceId, period, periodStart, periodEnd }) => {
        // Get bookings in period
        let bookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) =>
                q.and(
                    q.gte(q.field("startTime"), periodStart),
                    q.lte(q.field("endTime"), periodEnd)
                )
            )
            .collect();

        if (resourceId) {
            bookings = bookings.filter((b) => b.resourceId === resourceId);
        }

        // Calculate metrics
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
        const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
        const totalRevenue = bookings
            .filter((b) => b.status === "confirmed")
            .reduce((sum, b) => sum + b.totalPrice, 0);

        // Store metrics
        const metricId = await ctx.db.insert("bookingMetrics", {
            tenantId,
            resourceId,
            metricType: "summary",
            period,
            value: totalRevenue,
            count: totalBookings,
            metadata: {
                confirmedBookings,
                cancelledBookings,
                averagePrice: totalBookings > 0 ? totalRevenue / confirmedBookings : 0,
            },
            periodStart,
            periodEnd,
            calculatedAt: Date.now(),
        });

        return {
            id: metricId,
            metrics: {
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                totalRevenue,
            },
        };
    },
});

// Calculate availability metrics
export const calculateAvailabilityMetrics = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        period: v.string(),
        periodStart: v.number(),
        periodEnd: v.number(),
    },
    handler: async (ctx, { tenantId, resourceId, period, periodStart, periodEnd }) => {
        // Get bookings for resource in period
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) =>
                q.and(
                    q.gte(q.field("startTime"), periodStart),
                    q.lte(q.field("endTime"), periodEnd),
                    q.neq(q.field("status"), "cancelled"),
                    q.neq(q.field("status"), "rejected")
                )
            )
            .collect();

        // Calculate total available hours (assume 12 hours/day)
        const totalDays = Math.ceil((periodEnd - periodStart) / (24 * 60 * 60 * 1000));
        const totalSlots = totalDays * 12; // 12 hour slots per day

        // Calculate booked hours
        let bookedHours = 0;
        for (const booking of bookings) {
            const duration = (booking.endTime - booking.startTime) / (60 * 60 * 1000);
            bookedHours += duration;
        }

        const bookedSlots = Math.round(bookedHours);
        const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

        // Find popular time slots
        const slotCounts: Record<string, number> = {};
        for (const booking of bookings) {
            const hour = new Date(booking.startTime).getHours();
            const slotKey = `${hour}:00`;
            slotCounts[slotKey] = (slotCounts[slotKey] || 0) + 1;
        }

        const popularTimeSlots = Object.entries(slotCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([time, count]) => ({ time, count }));

        // Store metrics
        const metricId = await ctx.db.insert("availabilityMetrics", {
            tenantId,
            resourceId,
            period,
            totalSlots,
            bookedSlots,
            utilizationRate,
            popularTimeSlots,
            metadata: {},
            periodStart,
            periodEnd,
            calculatedAt: Date.now(),
        });

        return {
            id: metricId,
            metrics: {
                totalSlots,
                bookedSlots,
                utilizationRate,
                popularTimeSlots,
            },
        };
    },
});

// ============================================
// Report Schedules
// ============================================

// List report schedules
export const listReportSchedules = query({
    args: {
        tenantId: v.id("tenants"),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, enabled }) => {
        let schedules = await ctx.db
            .query("reportSchedules")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (enabled !== undefined) {
            schedules = schedules.filter((s) => s.enabled === enabled);
        }

        return schedules;
    },
});

// Create report schedule
export const createReportSchedule = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        reportType: v.string(),
        cronExpression: v.string(),
        recipients: v.array(v.string()),
        filters: v.optional(v.any()),
        format: v.string(),
        createdBy: v.id("users"),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const scheduleId = await ctx.db.insert("reportSchedules", {
            tenantId: args.tenantId,
            name: args.name,
            description: args.description,
            reportType: args.reportType,
            cronExpression: args.cronExpression,
            recipients: args.recipients,
            filters: args.filters || {},
            format: args.format,
            enabled: true,
            createdBy: args.createdBy,
            metadata: args.metadata || {},
        });

        return { id: scheduleId };
    },
});

// Update report schedule
export const updateReportSchedule = mutation({
    args: {
        id: v.id("reportSchedules"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        cronExpression: v.optional(v.string()),
        recipients: v.optional(v.array(v.string())),
        filters: v.optional(v.any()),
        format: v.optional(v.string()),
        enabled: v.optional(v.boolean()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const schedule = await ctx.db.get(id);
        if (!schedule) {
            throw new Error("Report schedule not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete report schedule
export const deleteReportSchedule = mutation({
    args: {
        id: v.id("reportSchedules"),
    },
    handler: async (ctx, { id }) => {
        const schedule = await ctx.db.get(id);
        if (!schedule) {
            throw new Error("Report schedule not found");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Get dashboard summary
export const getDashboardSummary = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const now = Date.now();
        const dayStart = now - (now % (24 * 60 * 60 * 1000));
        const weekStart = dayStart - 7 * 24 * 60 * 60 * 1000;
        const monthStart = dayStart - 30 * 24 * 60 * 60 * 1000;

        // Get resources count
        const resources = await ctx.db
            .query("resources")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) => q.neq(q.field("status"), "deleted"))
            .collect();

        // Get today's bookings
        const todayBookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) =>
                q.and(
                    q.gte(q.field("startTime"), dayStart),
                    q.lte(q.field("startTime"), dayStart + 24 * 60 * 60 * 1000)
                )
            )
            .collect();

        // Get week's bookings
        const weekBookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) => q.gte(q.field("startTime"), weekStart))
            .collect();

        // Get pending bookings
        const pendingBookings = await ctx.db
            .query("bookings")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        // Get users count
        const users = await ctx.db
            .query("users")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Calculate revenue
        const monthRevenue = weekBookings
            .filter((b) => b.status === "confirmed" && b._creationTime >= monthStart)
            .reduce((sum, b) => sum + b.totalPrice, 0);

        return {
            resources: {
                total: resources.length,
                published: resources.filter((r) => r.status === "published").length,
                draft: resources.filter((r) => r.status === "draft").length,
            },
            bookings: {
                today: todayBookings.length,
                thisWeek: weekBookings.length,
                pending: pendingBookings.length,
            },
            users: {
                total: users.length,
            },
            revenue: {
                thisMonth: monthRevenue,
            },
        };
    },
});
