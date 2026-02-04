import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * GDPR Compliance Functions
 * Migrated from: packages/platform/functions/consent, dsar, policy-*
 */

// Get user consent status
export const getConsent = query({
    args: {
        userId: v.id("users"),
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { userId, tenantId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Return consent from user metadata
        return user.metadata?.consent || {
            marketing: false,
            analytics: false,
            thirdParty: false,
            necessary: true, // Always required
            updatedAt: null,
        };
    },
});

// Update user consent
export const updateConsent = mutation({
    args: {
        userId: v.id("users"),
        consent: v.object({
            marketing: v.boolean(),
            analytics: v.boolean(),
            thirdParty: v.boolean(),
        }),
    },
    handler: async (ctx, { userId, consent }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(userId, {
            metadata: {
                ...user.metadata,
                consent: {
                    ...consent,
                    necessary: true,
                    updatedAt: Date.now(),
                },
            },
        });

        return { success: true };
    },
});

// Submit Data Subject Access Request (DSAR)
export const submitDSAR = mutation({
    args: {
        userId: v.id("users"),
        tenantId: v.id("tenants"),
        requestType: v.union(
            v.literal("access"),
            v.literal("deletion"),
            v.literal("portability"),
            v.literal("rectification")
        ),
        details: v.optional(v.string()),
    },
    handler: async (ctx, { userId, tenantId, requestType, details }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Store DSAR request in user metadata or separate collection
        const dsarRequests = user.metadata?.dsarRequests || [];
        const newRequest = {
            id: crypto.randomUUID(),
            type: requestType,
            details,
            status: "pending",
            submittedAt: Date.now(),
            completedAt: null,
        };

        await ctx.db.patch(userId, {
            metadata: {
                ...user.metadata,
                dsarRequests: [...dsarRequests, newRequest],
            },
        });

        return { requestId: newRequest.id, status: "pending" };
    },
});

// Get active policy
export const getPolicy = query({
    args: {
        tenantId: v.id("tenants"),
        policyType: v.string(), // "privacy" | "terms" | "cookies"
    },
    handler: async (ctx, { tenantId, policyType }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const policies = tenant.settings?.policies || {};
        return policies[policyType] || null;
    },
});

// Publish a new policy version
export const publishPolicy = mutation({
    args: {
        tenantId: v.id("tenants"),
        policyType: v.string(),
        content: v.string(),
        version: v.string(),
    },
    handler: async (ctx, { tenantId, policyType, content, version }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const policies = tenant.settings?.policies || {};
        const policyHistory = policies[`${policyType}History`] || [];

        // Archive current version if exists
        if (policies[policyType]) {
            policyHistory.push({
                ...policies[policyType],
                archivedAt: Date.now(),
            });
        }

        const newPolicy = {
            content,
            version,
            publishedAt: Date.now(),
            isActive: true,
        };

        await ctx.db.patch(tenantId, {
            settings: {
                ...tenant.settings,
                policies: {
                    ...policies,
                    [policyType]: newPolicy,
                    [`${policyType}History`]: policyHistory,
                },
            },
        });

        return { success: true, version };
    },
});

// Get policy history
export const policyHistory = query({
    args: {
        tenantId: v.id("tenants"),
        policyType: v.string(),
    },
    handler: async (ctx, { tenantId, policyType }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const policies = tenant.settings?.policies || {};
        const history = policies[`${policyType}History`] || [];
        const current = policies[policyType];

        return {
            current,
            history,
        };
    },
});

// Rollback to previous policy version
export const rollbackPolicy = mutation({
    args: {
        tenantId: v.id("tenants"),
        policyType: v.string(),
        version: v.string(),
    },
    handler: async (ctx, { tenantId, policyType, version }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const policies = tenant.settings?.policies || {};
        const history = policies[`${policyType}History`] || [];

        const targetPolicy = history.find((p: any) => p.version === version);
        if (!targetPolicy) {
            throw new Error(`Policy version "${version}" not found in history`);
        }

        // Archive current and restore target
        const current = policies[policyType];
        if (current) {
            history.push({ ...current, archivedAt: Date.now() });
        }

        await ctx.db.patch(tenantId, {
            settings: {
                ...tenant.settings,
                policies: {
                    ...policies,
                    [policyType]: { ...targetPolicy, isActive: true, archivedAt: undefined },
                    [`${policyType}History`]: history.filter((p: any) => p.version !== version),
                },
            },
        });

        return { success: true, restoredVersion: version };
    },
});
