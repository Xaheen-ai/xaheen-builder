import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * RBAC Functions
 * Migrated from: packages/platform/functions/rbac-*
 */

// Create a new role
export const createRole = mutation({
    args: {
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        permissions: v.array(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, { tenantId, name, description, permissions, isDefault }) => {
        // Verify tenant exists
        const tenant = await ctx.db.get(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const roleId = await ctx.db.insert("roles", {
            tenantId,
            name,
            description,
            permissions,
            isDefault: isDefault || false,
            isSystem: false,
        });

        return { roleId, name };
    },
});

// List all roles for a tenant
export const listRoles = query({
    args: {
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { tenantId }) => {
        const roles = await ctx.db
            .query("roles")
            .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
            .collect();

        return roles;
    },
});

// Assign a permission to a role
export const assignPermission = mutation({
    args: {
        roleId: v.id("roles"),
        permission: v.string(),
    },
    handler: async (ctx, { roleId, permission }) => {
        const role = await ctx.db.get(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        const permissions = [...(role.permissions || [])];
        if (!permissions.includes(permission)) {
            permissions.push(permission);
        }

        await ctx.db.patch(roleId, { permissions });

        return { success: true, permissions };
    },
});

// List all available permissions
export const listPermissions = query({
    args: {},
    handler: async () => {
        // Return static list of available permissions
        return [
            // Tenant permissions
            "tenant:read",
            "tenant:write",
            "tenant:admin",

            // User permissions
            "user:read",
            "user:write",
            "user:invite",
            "user:delete",

            // Resource permissions
            "resource:read",
            "resource:write",
            "resource:delete",
            "resource:publish",

            // Booking permissions
            "booking:read",
            "booking:write",
            "booking:approve",
            "booking:cancel",

            // Organization permissions
            "org:read",
            "org:write",
            "org:admin",

            // RBAC permissions
            "rbac:read",
            "rbac:write",

            // Module permissions
            "module:install",
            "module:configure",

            // Billing permissions
            "billing:read",
            "billing:write",

            // Reports permissions
            "reports:read",
            "reports:export",
        ];
    },
});

// Bind a role to a user
export const bindUserRole = mutation({
    args: {
        userId: v.id("users"),
        roleId: v.id("roles"),
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { userId, roleId, tenantId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const role = await ctx.db.get(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Store role binding
        await ctx.db.insert("userRoles", {
            userId,
            roleId,
            tenantId,
            assignedAt: Date.now(),
        });

        return { success: true, userId, roleId };
    },
});

// Get all permissions for a user
export const getUserPermissions = query({
    args: {
        userId: v.id("users"),
        tenantId: v.id("tenants"),
    },
    handler: async (ctx, { userId, tenantId }) => {
        // Get all roles for this user in this tenant
        const userRoles = await ctx.db
            .query("userRoles")
            .withIndex("by_tenant_user", (q) =>
                q.eq("tenantId", tenantId).eq("userId", userId)
            )
            .collect();

        // Collect all permissions from all roles
        const allPermissions = new Set<string>();

        for (const userRole of userRoles) {
            const role = await ctx.db.get(userRole.roleId);
            if (role?.permissions) {
                for (const perm of role.permissions) {
                    allPermissions.add(perm);
                }
            }
        }

        return Array.from(allPermissions);
    },
});
