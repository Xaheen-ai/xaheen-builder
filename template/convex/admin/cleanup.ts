import { mutation, query } from "../_generated/server";

/**
 * Admin cleanup mutations for consolidating duplicate data.
 * 
 * Run queries first to see what will be affected:
 *   npx convex run admin/cleanup:previewDuplicateTenants
 * 
 * Then run cleanup:
 *   npx convex run admin/cleanup:consolidateTenants
 */

// The main tenant ID to keep (has 71 resources)
const MAIN_TENANT_ID = "pd73zbrk04k7tnmygstv3sbbyh80frae";

/**
 * Preview duplicate tenants and their resources before cleanup.
 */
export const previewDuplicateTenants = query({
    args: {},
    handler: async (ctx) => {
        const tenants = await ctx.db.query("tenants").collect();
        const resources = await ctx.db.query("resources").collect();
        const users = await ctx.db.query("users").collect();

        // Find duplicate "Skien Kommune" tenants
        const skienTenants = tenants.filter((t) => t.slug === "skien");
        const duplicates = skienTenants.filter((t) => t._id !== MAIN_TENANT_ID);

        const result = {
            mainTenant: {
                id: MAIN_TENANT_ID,
                resources: resources.filter((r) => r.tenantId === MAIN_TENANT_ID).length,
                users: users.filter((u) => u.tenantId === MAIN_TENANT_ID).length,
            },
            duplicateTenants: duplicates.map((t) => ({
                id: t._id,
                name: t.name,
                resources: resources.filter((r) => r.tenantId === t._id).length,
                users: users.filter((u) => u.tenantId === t._id).length,
            })),
            totalResources: resources.length,
            totalUsers: users.length,
            willMoveResources: resources.filter((r) =>
                duplicates.some((d) => d._id === r.tenantId)
            ).length,
            willMoveUsers: users.filter((u) =>
                duplicates.some((d) => d._id === u.tenantId)
            ).length,
        };

        return result;
    },
});

/**
 * Consolidate all duplicate "Skien Kommune" tenants into the main one.
 * Moves resources and users, then deletes duplicate tenants.
 */
export const consolidateTenants = mutation({
    args: {},
    handler: async (ctx) => {
        const tenants = await ctx.db.query("tenants").collect();
        const resources = await ctx.db.query("resources").collect();
        const users = await ctx.db.query("users").collect();
        const organizations = await ctx.db.query("organizations").collect();

        // Find duplicate "Skien Kommune" tenants
        const skienTenants = tenants.filter((t) => t.slug === "skien");
        const duplicates = skienTenants.filter((t) => t._id !== MAIN_TENANT_ID);

        if (duplicates.length === 0) {
            return { success: true, message: "No duplicate tenants found" };
        }

        const duplicateIds = duplicates.map((d) => d._id);
        let movedResources = 0;
        let movedUsers = 0;
        let movedOrgs = 0;
        let deletedTenants = 0;
        const deletedResourceSlugs: string[] = [];

        // Get main tenant's organization
        const mainOrg = organizations.find((o) => o.tenantId === MAIN_TENANT_ID);

        // Move resources from duplicates to main tenant
        for (const resource of resources) {
            if (duplicateIds.includes(resource.tenantId)) {
                // Check if resource with same slug already exists in main tenant
                const existingInMain = resources.find(
                    (r) => r.tenantId === MAIN_TENANT_ID && r.slug === resource.slug
                );

                if (existingInMain) {
                    // Delete duplicate resource
                    await ctx.db.delete(resource._id);
                    deletedResourceSlugs.push(resource.slug);
                } else {
                    // Move to main tenant
                    await ctx.db.patch(resource._id, {
                        tenantId: MAIN_TENANT_ID as any,
                        organizationId: mainOrg?._id,
                    });
                    movedResources++;
                }
            }
        }

        // Move users from duplicates to main tenant (if not already there by email)
        const mainTenantEmails = users
            .filter((u) => u.tenantId === MAIN_TENANT_ID)
            .map((u) => u.email);

        for (const user of users) {
            if (duplicateIds.includes(user.tenantId as any)) {
                if (mainTenantEmails.includes(user.email)) {
                    // User already exists in main tenant, delete duplicate
                    await ctx.db.delete(user._id);
                } else {
                    // Move to main tenant
                    await ctx.db.patch(user._id, {
                        tenantId: MAIN_TENANT_ID as any,
                    });
                    movedUsers++;
                }
            }
        }

        // Delete duplicate organizations
        for (const org of organizations) {
            if (duplicateIds.includes(org.tenantId)) {
                await ctx.db.delete(org._id);
                movedOrgs++;
            }
        }

        // Delete duplicate tenants
        for (const tenant of duplicates) {
            await ctx.db.delete(tenant._id);
            deletedTenants++;
        }

        return {
            success: true,
            movedResources,
            movedUsers,
            deletedOrganizations: movedOrgs,
            deletedTenants,
            deletedDuplicateResources: deletedResourceSlugs.length,
            deletedResourceSlugs,
        };
    },
});

/**
 * Delete all resources and reset to clean state.
 * WARNING: This deletes ALL resources!
 */
export const deleteAllResources = mutation({
    args: {},
    handler: async (ctx) => {
        const resources = await ctx.db.query("resources").collect();
        
        for (const resource of resources) {
            await ctx.db.delete(resource._id);
        }

        return { deleted: resources.length };
    },
});
