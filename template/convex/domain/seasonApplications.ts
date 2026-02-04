import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Season Applications Functions
 * Manage applications for seasonal resource allocation.
 */

// List applications for a tenant or season
export const list = query({
    args: {
        tenantId: v.id("tenants"),
        seasonId: v.optional(v.id("seasons")),
        status: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { tenantId, seasonId, status, organizationId, limit }) => {
        let applications;

        if (seasonId) {
            applications = await ctx.db
                .query("seasonApplications")
                .withIndex("by_season", (q) => q.eq("seasonId", seasonId))
                .collect();
            // Ensure tenant isolation
            applications = applications.filter((a) => a.tenantId === tenantId);
        } else {
            applications = await ctx.db
                .query("seasonApplications")
                .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
                .collect();
        }

        if (status) {
            applications = applications.filter((a) => a.status === status);
        }

        if (organizationId) {
            applications = applications.filter(
                (a) => a.organizationId === organizationId
            );
        }

        // Sort by priority descending, then creation time
        applications.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return b._creationTime - a._creationTime;
        });

        if (limit) {
            applications = applications.slice(0, limit);
        }

        // Get related details
        const withDetails = await Promise.all(
            applications.map(async (app) => {
                const user = await ctx.db.get(app.userId);
                const org = app.organizationId
                    ? await ctx.db.get(app.organizationId)
                    : null;
                const resource = app.resourceId
                    ? await ctx.db.get(app.resourceId)
                    : null;
                return {
                    ...app,
                    user: user
                        ? { id: user._id, name: user.name, email: user.email }
                        : null,
                    organization: org
                        ? { id: org._id, name: org.name }
                        : null,
                    resource: resource
                        ? { id: resource._id, name: resource.name }
                        : null,
                };
            })
        );

        return withDetails;
    },
});

// Get a single application
export const get = query({
    args: {
        id: v.id("seasonApplications"),
    },
    handler: async (ctx, { id }) => {
        const application = await ctx.db.get(id);
        if (!application) {
            throw new Error("Season application not found");
        }

        const user = await ctx.db.get(application.userId);
        const season = await ctx.db.get(application.seasonId);
        const org = application.organizationId
            ? await ctx.db.get(application.organizationId)
            : null;
        const resource = application.resourceId
            ? await ctx.db.get(application.resourceId)
            : null;
        const reviewer = application.reviewedBy
            ? await ctx.db.get(application.reviewedBy)
            : null;

        return {
            ...application,
            user: user
                ? { id: user._id, name: user.name, email: user.email }
                : null,
            season: season
                ? { id: season._id, name: season.name, status: season.status }
                : null,
            organization: org
                ? { id: org._id, name: org.name }
                : null,
            resource: resource
                ? { id: resource._id, name: resource.name }
                : null,
            reviewer: reviewer
                ? { id: reviewer._id, name: reviewer.name }
                : null,
        };
    },
});

// Create a season application
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        seasonId: v.id("seasons"),
        userId: v.id("users"),
        organizationId: v.optional(v.id("organizations")),
        resourceId: v.optional(v.id("resources")),
        weekday: v.optional(v.number()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        applicantName: v.optional(v.string()),
        applicantEmail: v.optional(v.string()),
        applicantPhone: v.optional(v.string()),
        applicationData: v.optional(v.any()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Validate season exists and is accepting applications
        const season = await ctx.db.get(args.seasonId);
        if (!season) {
            throw new Error("Season not found");
        }

        if (season.status !== "published") {
            throw new Error("Season is not accepting applications");
        }

        // Check application deadline
        if (season.applicationEndDate && Date.now() > season.applicationEndDate) {
            throw new Error("Application deadline has passed");
        }

        const applicationId = await ctx.db.insert("seasonApplications", {
            tenantId: args.tenantId,
            seasonId: args.seasonId,
            userId: args.userId,
            organizationId: args.organizationId,
            resourceId: args.resourceId,
            weekday: args.weekday,
            startTime: args.startTime,
            endTime: args.endTime,
            priority: 0, // Will be calculated by priority rules
            status: "pending",
            applicantName: args.applicantName,
            applicantEmail: args.applicantEmail,
            applicantPhone: args.applicantPhone,
            applicationData: args.applicationData || {},
            notes: args.notes,
            metadata: {},
        });

        return { id: applicationId };
    },
});

// Update a season application
export const update = mutation({
    args: {
        id: v.id("seasonApplications"),
        resourceId: v.optional(v.id("resources")),
        weekday: v.optional(v.number()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        applicantName: v.optional(v.string()),
        applicantEmail: v.optional(v.string()),
        applicantPhone: v.optional(v.string()),
        applicationData: v.optional(v.any()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const application = await ctx.db.get(id);
        if (!application) {
            throw new Error("Season application not found");
        }

        if (application.status !== "pending") {
            throw new Error("Only pending applications can be updated");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Approve a season application
export const approve = mutation({
    args: {
        id: v.id("seasonApplications"),
        reviewedBy: v.id("users"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, reviewedBy, notes }) => {
        const application = await ctx.db.get(id);
        if (!application) {
            throw new Error("Season application not found");
        }

        if (application.status !== "pending" && application.status !== "waitlist") {
            throw new Error("Application cannot be approved in its current status");
        }

        await ctx.db.patch(id, {
            status: "approved",
            reviewedBy,
            reviewedAt: Date.now(),
            notes: notes || application.notes,
        });

        return { success: true };
    },
});

// Reject a season application
export const reject = mutation({
    args: {
        id: v.id("seasonApplications"),
        reviewedBy: v.id("users"),
        rejectionReason: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, reviewedBy, rejectionReason, notes }) => {
        const application = await ctx.db.get(id);
        if (!application) {
            throw new Error("Season application not found");
        }

        if (application.status !== "pending" && application.status !== "waitlist") {
            throw new Error("Application cannot be rejected in its current status");
        }

        await ctx.db.patch(id, {
            status: "rejected",
            reviewedBy,
            reviewedAt: Date.now(),
            rejectionReason,
            notes: notes || application.notes,
        });

        return { success: true };
    },
});
