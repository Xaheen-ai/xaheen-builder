import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Integration Functions
 * Manage external service integrations (payment, calendar, ERP, etc.)
 */

// Integration types
type IntegrationType = 
    | "stripe"
    | "vipps"
    | "google_calendar"
    | "outlook_calendar"
    | "erp"
    | "sms"
    | "email"
    | "webhook";

// Get integration configuration
export const getConfig = query({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
    },
    handler: async (ctx, { tenantId, integrationType }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, unknown> || {};
        const config = integrations[integrationType] as Record<string, unknown> | undefined;

        if (!config) {
            return null;
        }

        // Don't expose secrets
        const { apiKey, secretKey, webhookSecret, ...safeConfig } = config;

        return {
            ...safeConfig,
            isConfigured: !!(apiKey || secretKey),
        };
    },
});

// List all integrations for a tenant
export const list = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, Record<string, unknown>> || {};

        return Object.entries(integrations).map(([type, config]) => ({
            type,
            isEnabled: config?.isEnabled ?? false,
            isConfigured: !!(config?.apiKey || config?.secretKey),
            name: config?.name || type,
            lastSyncAt: config?.lastSyncAt,
        }));
    },
});

// Configure integration
export const configure = mutation({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
        config: v.object({
            name: v.optional(v.string()),
            isEnabled: v.boolean(),
            apiKey: v.optional(v.string()),
            secretKey: v.optional(v.string()),
            webhookUrl: v.optional(v.string()),
            webhookSecret: v.optional(v.string()),
            settings: v.optional(v.any()),
        }),
    },
    handler: async (ctx, { tenantId, integrationType, config }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const existingIntegrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, unknown> || {};
        const existingConfig = existingIntegrations[integrationType] as Record<string, unknown> || {};

        // Merge new config with existing, preserving secrets if not provided
        const updatedConfig = {
            ...existingConfig,
            ...config,
            apiKey: config.apiKey || existingConfig.apiKey,
            secretKey: config.secretKey || existingConfig.secretKey,
            webhookSecret: config.webhookSecret || existingConfig.webhookSecret,
            updatedAt: Date.now(),
        };

        await ctx.db.patch(tenantId, {
            settings: {
                ...(tenant.settings as Record<string, unknown>),
                integrations: {
                    ...existingIntegrations,
                    [integrationType]: updatedConfig,
                },
            },
        });

        return { success: true };
    },
});

// Disable integration
export const disable = mutation({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
    },
    handler: async (ctx, { tenantId, integrationType }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, Record<string, unknown>> || {};
        const config = integrations[integrationType];

        if (!config) {
            throw new Error("Integration not configured");
        }

        await ctx.db.patch(tenantId, {
            settings: {
                ...(tenant.settings as Record<string, unknown>),
                integrations: {
                    ...integrations,
                    [integrationType]: {
                        ...config,
                        isEnabled: false,
                        disabledAt: Date.now(),
                    },
                },
            },
        });

        return { success: true };
    },
});

// Remove integration (delete config)
export const remove = mutation({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
    },
    handler: async (ctx, { tenantId, integrationType }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, unknown> || {};

        const { [integrationType]: removed, ...remainingIntegrations } = integrations;

        await ctx.db.patch(tenantId, {
            settings: {
                ...(tenant.settings as Record<string, unknown>),
                integrations: remainingIntegrations,
            },
        });

        return { success: true };
    },
});

// Test integration connection
export const testConnection = action({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
    },
    handler: async (ctx, { tenantId, integrationType }) => {
        // This would make actual API calls to test the integration
        // For now, return mock success

        const testResults: Record<string, { success: boolean; message: string }> = {
            stripe: { success: true, message: "Stripe connection successful" },
            vipps: { success: true, message: "Vipps connection successful" },
            google_calendar: { success: true, message: "Google Calendar connected" },
            outlook_calendar: { success: true, message: "Outlook Calendar connected" },
            erp: { success: true, message: "ERP connection successful" },
            sms: { success: true, message: "SMS gateway connected" },
            email: { success: true, message: "Email service connected" },
            webhook: { success: true, message: "Webhook endpoint reachable" },
        };

        return testResults[integrationType] || { success: false, message: "Unknown integration type" };
    },
});

// Sync integration data
export const sync = action({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
        options: v.optional(v.any()),
    },
    handler: async (ctx, { tenantId, integrationType, options }) => {
        // This would perform actual sync with external service
        // For now, return mock success

        return {
            success: true,
            syncedAt: Date.now(),
            itemsSynced: 0,
            errors: [],
        };
    },
});

// Register webhook endpoint
export const registerWebhook = mutation({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
        events: v.array(v.string()),
        callbackUrl: v.string(),
    },
    handler: async (ctx, { tenantId, integrationType, events, callbackUrl }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, Record<string, unknown>> || {};
        const config = integrations[integrationType] || {};

        const webhooks = (config.webhooks as Array<Record<string, unknown>>) || [];
        const webhookId = `wh_${Date.now()}`;

        webhooks.push({
            id: webhookId,
            events,
            callbackUrl,
            isActive: true,
            createdAt: Date.now(),
        });

        await ctx.db.patch(tenantId, {
            settings: {
                ...(tenant.settings as Record<string, unknown>),
                integrations: {
                    ...integrations,
                    [integrationType]: {
                        ...config,
                        webhooks,
                    },
                },
            },
        });

        return { webhookId };
    },
});

// List registered webhooks
export const listWebhooks = query({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.optional(v.string()),
    },
    handler: async (ctx, { tenantId, integrationType }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, Record<string, unknown>> || {};

        if (integrationType) {
            const config = integrations[integrationType];
            return (config?.webhooks as Array<Record<string, unknown>>) || [];
        }

        // Return all webhooks across integrations
        const allWebhooks: Array<Record<string, unknown>> = [];
        for (const [type, config] of Object.entries(integrations)) {
            const webhooks = (config?.webhooks as Array<Record<string, unknown>>) || [];
            allWebhooks.push(...webhooks.map((w) => ({ ...w, integrationType: type })));
        }

        return allWebhooks;
    },
});

// Delete webhook
export const deleteWebhook = mutation({
    args: {
        tenantId: v.id("tenants"),
        integrationType: v.string(),
        webhookId: v.string(),
    },
    handler: async (ctx, { tenantId, integrationType, webhookId }) => {
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const integrations = (tenant.settings as Record<string, unknown>)?.integrations as Record<string, Record<string, unknown>> || {};
        const config = integrations[integrationType];

        if (!config) {
            throw new Error("Integration not configured");
        }

        const webhooks = ((config.webhooks as Array<Record<string, unknown>>) || []).filter(
            (w) => w.id !== webhookId
        );

        await ctx.db.patch(tenantId, {
            settings: {
                ...(tenant.settings as Record<string, unknown>),
                integrations: {
                    ...integrations,
                    [integrationType]: {
                        ...config,
                        webhooks,
                    },
                },
            },
        });

        return { success: true };
    },
});
