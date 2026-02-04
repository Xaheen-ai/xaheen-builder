import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Pricing Functions
 * Manage resource pricing, pricing groups, and price calculations.
 */

// List pricing groups for a tenant
export const listGroups = query({
    args: {
        tenantId: v.id("tenants"),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, isActive }) => {
        let groups = await ctx.db
            .query("pricingGroups")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        if (isActive !== undefined) {
            groups = groups.filter((g) => g.isActive === isActive);
        }

        groups.sort((a, b) => a.priority - b.priority);

        return groups;
    },
});

// Create pricing group
export const createGroup = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        priority: v.optional(v.number()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const groupId = await ctx.db.insert("pricingGroups", {
            tenantId: args.tenantId,
            name: args.name,
            description: args.description,
            isDefault: args.isDefault ?? false,
            priority: args.priority ?? 0,
            isActive: true,
            metadata: args.metadata || {},
        });

        return { id: groupId };
    },
});

// Update pricing group
export const updateGroup = mutation({
    args: {
        id: v.id("pricingGroups"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        priority: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const group = await ctx.db.get(id);
        if (!group) {
            throw new Error("Pricing group not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete pricing group
export const removeGroup = mutation({
    args: {
        id: v.id("pricingGroups"),
    },
    handler: async (ctx, { id }) => {
        const group = await ctx.db.get(id);
        if (!group) {
            throw new Error("Pricing group not found");
        }

        // Check if used
        const used = await ctx.db
            .query("resourcePricing")
            .withIndex("by_pricing_group", (q) => q.eq("pricingGroupId", id))
            .first();

        if (used) {
            throw new Error("Pricing group is in use, deactivate instead");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// List resource pricing
export const listForResource = query({
    args: {
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { resourceId }) => {
        const pricing = await ctx.db
            .query("resourcePricing")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        // Include pricing group info
        const withGroups = await Promise.all(
            pricing.map(async (p) => {
                const group = p.pricingGroupId
                    ? await ctx.db.get(p.pricingGroupId)
                    : null;
                return { ...p, pricingGroup: group };
            })
        );

        return withGroups;
    },
});

// Create resource pricing
export const create = mutation({
    args: {
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        pricingGroupId: v.optional(v.id("pricingGroups")),
        priceType: v.string(),
        basePrice: v.number(),
        currency: v.string(),
        minDuration: v.optional(v.number()),
        maxDuration: v.optional(v.number()),
        pricePerHour: v.optional(v.number()),
        pricePerDay: v.optional(v.number()),
        depositAmount: v.optional(v.number()),
        cleaningFee: v.optional(v.number()),
        rules: v.optional(v.any()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const pricingId = await ctx.db.insert("resourcePricing", {
            tenantId: args.tenantId,
            resourceId: args.resourceId,
            pricingGroupId: args.pricingGroupId,
            priceType: args.priceType,
            basePrice: args.basePrice,
            currency: args.currency,
            minDuration: args.minDuration,
            maxDuration: args.maxDuration,
            pricePerHour: args.pricePerHour,
            pricePerDay: args.pricePerDay,
            depositAmount: args.depositAmount,
            cleaningFee: args.cleaningFee,
            rules: args.rules || {},
            isActive: true,
            metadata: args.metadata || {},
        });

        return { id: pricingId };
    },
});

// Update resource pricing
export const update = mutation({
    args: {
        id: v.id("resourcePricing"),
        priceType: v.optional(v.string()),
        basePrice: v.optional(v.number()),
        currency: v.optional(v.string()),
        minDuration: v.optional(v.number()),
        maxDuration: v.optional(v.number()),
        pricePerHour: v.optional(v.number()),
        pricePerDay: v.optional(v.number()),
        depositAmount: v.optional(v.number()),
        cleaningFee: v.optional(v.number()),
        rules: v.optional(v.any()),
        isActive: v.optional(v.boolean()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const pricing = await ctx.db.get(id);
        if (!pricing) {
            throw new Error("Pricing not found");
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(id, filteredUpdates);

        return { success: true };
    },
});

// Delete resource pricing
export const remove = mutation({
    args: {
        id: v.id("resourcePricing"),
    },
    handler: async (ctx, { id }) => {
        const pricing = await ctx.db.get(id);
        if (!pricing) {
            throw new Error("Pricing not found");
        }

        await ctx.db.delete(id);

        return { success: true };
    },
});

// Calculate price for a booking
export const calculatePrice = query({
    args: {
        resourceId: v.id("resources"),
        startTime: v.number(),
        endTime: v.number(),
        userId: v.optional(v.id("users")),
        organizationId: v.optional(v.id("organizations")),
        addonIds: v.optional(v.array(v.id("addons"))),
    },
    handler: async (ctx, { resourceId, startTime, endTime, userId, organizationId, addonIds }) => {
        const resource = await ctx.db.get(resourceId);
        if (!resource) {
            throw new Error("Resource not found");
        }

        // Get default pricing for resource
        const pricing = await ctx.db
            .query("resourcePricing")
            .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (!pricing) {
            throw new Error("No pricing configured for resource");
        }

        // Calculate duration
        const durationMs = endTime - startTime;
        const durationHours = durationMs / (1000 * 60 * 60);
        const durationDays = durationHours / 24;

        // Base price calculation
        let baseTotal = 0;
        if (pricing.priceType === "hourly" && pricing.pricePerHour) {
            baseTotal = durationHours * pricing.pricePerHour;
        } else if (pricing.priceType === "daily" && pricing.pricePerDay) {
            baseTotal = Math.ceil(durationDays) * pricing.pricePerDay;
        } else {
            baseTotal = pricing.basePrice;
        }

        // Check for user/org pricing group discount
        let discountPercent = 0;
        if (organizationId) {
            const orgPricing = await ctx.db
                .query("orgPricingGroups")
                .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
                .filter((q) => q.eq(q.field("isActive"), true))
                .first();

            if (orgPricing?.discountPercent) {
                discountPercent = orgPricing.discountPercent;
            }
        } else if (userId) {
            const userPricing = await ctx.db
                .query("userPricingGroups")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .filter((q) => q.eq(q.field("isActive"), true))
                .first();

            if (userPricing) {
                const group = await ctx.db.get(userPricing.pricingGroupId);
                // Could implement discount from group here
            }
        }

        const discountAmount = (baseTotal * discountPercent) / 100;
        const subtotal = baseTotal - discountAmount;

        // Add addons
        let addonsTotal = 0;
        const addonsBreakdown: { addonId: string; name: string; price: number }[] = [];

        if (addonIds && addonIds.length > 0) {
            for (const addonId of addonIds) {
                const addon = await ctx.db.get(addonId);
                if (addon && addon.isActive) {
                    addonsTotal += addon.price;
                    addonsBreakdown.push({
                        addonId: addon._id,
                        name: addon.name,
                        price: addon.price,
                    });
                }
            }
        }

        // Add fees
        const cleaningFee = pricing.cleaningFee ?? 0;
        const depositAmount = pricing.depositAmount ?? 0;

        const total = subtotal + addonsTotal + cleaningFee;

        return {
            breakdown: {
                basePrice: baseTotal,
                discountPercent,
                discountAmount,
                subtotal,
                addons: addonsBreakdown,
                addonsTotal,
                cleaningFee,
                depositAmount,
            },
            total,
            currency: pricing.currency,
            durationHours,
        };
    },
});
