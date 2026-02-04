import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed Data for Convex
 *
 * Run with: npx convex run seeds:seedAll
 *
 * Seeds tenants, organizations, users, demo tokens, resources, bookings, and roles.
 */

// Seed all data
export const seedAll = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting seed...");

        // 1. Create tenant
        const tenantId = await ctx.db.insert("tenants", {
            name: "Skien Kommune",
            slug: "skien",
            domain: "skien.digilist.no",
            settings: {
                locale: "nb-NO",
                timezone: "Europe/Oslo",
                currency: "NOK",
                theme: "platform",
                branding: {
                    logoUrl: null,
                    primaryColor: "#2563eb",
                    secondaryColor: "#64748b",
                },
                notifications: {
                    emailEnabled: true,
                    smsEnabled: false,
                },
            },
            status: "active",
            seatLimits: {
                maxUsers: 100,
                maxListings: 200,
                maxStorageMb: 5000,
                maxOrganizations: 50,
                maxBookingsPerMonth: 1000,
            },
            featureFlags: {
                seasonal_leases: true,
                approval_workflow: true,
                messaging: true,
                analytics: true,
                integrations: false,
            },
            enabledCategories: ["LOKALER", "SPORT", "ARRANGEMENT", "TORG"],
        });
        console.log("Created tenant:", tenantId);

        // 2. Create organizations
        const defaultOrgId = await ctx.db.insert("organizations", {
            tenantId,
            name: "Skien Kommune - Kultur",
            slug: "kultur",
            description: "Kulturavdeling",
            type: "department",
            status: "active",
            settings: {},
            metadata: {},
        });

        const sportsOrgId = await ctx.db.insert("organizations", {
            tenantId,
            name: "Skien Idrettsråd",
            slug: "idrettsrad",
            description: "Koordinering av idrettsaktiviteter",
            type: "association",
            status: "active",
            settings: {},
            metadata: {},
        });
        console.log("Created organizations:", defaultOrgId, sportsOrgId);

        // 3. Create users
        const adminUserId = await ctx.db.insert("users", {
            tenantId,
            organizationId: defaultOrgId,
            email: "admin@skien.kommune.no",
            name: "Admin Bruker",
            displayName: "Admin",
            role: "admin",
            status: "active",
            metadata: { isFounder: true },
        });

        const managerUserId = await ctx.db.insert("users", {
            tenantId,
            organizationId: defaultOrgId,
            email: "leder@skien.kommune.no",
            name: "Kulturleder",
            displayName: "Kulturleder",
            role: "manager",
            status: "active",
            metadata: {},
        });

        const memberUserId = await ctx.db.insert("users", {
            tenantId,
            organizationId: sportsOrgId,
            email: "medlem@skien-idrett.no",
            name: "Idrett Medlem",
            displayName: "Medlem",
            role: "member",
            status: "active",
            metadata: {},
        });
        console.log("Created users:", adminUserId, managerUserId, memberUserId);

        // 4. Create tenant-user links
        await ctx.db.insert("tenantUsers", {
            tenantId,
            userId: adminUserId,
            status: "active",
            joinedAt: Date.now(),
        });

        await ctx.db.insert("tenantUsers", {
            tenantId,
            userId: managerUserId,
            status: "active",
            joinedAt: Date.now(),
        });

        await ctx.db.insert("tenantUsers", {
            tenantId,
            userId: memberUserId,
            status: "active",
            joinedAt: Date.now(),
        });

        // 5. Create demo tokens
        await ctx.db.insert("authDemoTokens", {
            key: "DEMO_ADMIN_001",
            tenantId,
            organizationId: defaultOrgId,
            userId: adminUserId,
            tokenHash: "demo-hash-admin-001",
            isActive: true,
            expiresAt: new Date("2030-12-31").getTime(),
        });

        await ctx.db.insert("authDemoTokens", {
            key: "DEMO_MANAGER_001",
            tenantId,
            organizationId: defaultOrgId,
            userId: managerUserId,
            tokenHash: "demo-hash-manager-001",
            isActive: true,
            expiresAt: new Date("2030-12-31").getTime(),
        });

        await ctx.db.insert("authDemoTokens", {
            key: "DEMO_MEMBER_001",
            tenantId,
            organizationId: sportsOrgId,
            userId: memberUserId,
            tokenHash: "demo-hash-member-001",
            isActive: true,
            expiresAt: new Date("2030-12-31").getTime(),
        });
        console.log("Created demo tokens");

        // 6. Create sample resources
        const hallId = await ctx.db.insert("resources", {
            tenantId,
            organizationId: defaultOrgId,
            name: "Ibsenhuset Hovedsal",
            slug: "ibsenhuset-hovedsal",
            description: "Stor hovedsal for kulturarrangementer",
            categoryKey: "LOKALER",
            timeMode: "PERIOD",
            features: [
                { name: "capacity", value: 500 },
                { name: "projector", value: true },
                { name: "audio_system", value: true },
            ],
            status: "published",
            requiresApproval: true,
            capacity: 500,
            inventoryTotal: 1,
            images: [],
            pricing: {
                basePrice: 5000,
                pricePerHour: 1000,
                currency: "NOK",
                deposit: 2000,
            },
            metadata: {},
        });

        const sportsHallId = await ctx.db.insert("resources", {
            tenantId,
            organizationId: sportsOrgId,
            name: "Skienshallen",
            slug: "skienshallen",
            description: "Idrettshall for ulike aktiviteter",
            categoryKey: "SPORT",
            timeMode: "SLOT",
            features: [
                { name: "indoor", value: true },
                { name: "basketball_court", value: true },
                { name: "handball_court", value: true },
            ],
            status: "published",
            requiresApproval: false,
            capacity: 200,
            inventoryTotal: 1,
            images: [],
            pricing: {
                basePrice: 500,
                pricePerHour: 200,
                currency: "NOK",
            },
            metadata: {},
        });

        const meetingRoomId = await ctx.db.insert("resources", {
            tenantId,
            organizationId: defaultOrgId,
            name: "Møterom A",
            slug: "moterom-a",
            description: "Lite møterom for 10 personer",
            categoryKey: "LOKALER",
            timeMode: "PERIOD",
            features: [
                { name: "capacity", value: 10 },
                { name: "whiteboard", value: true },
                { name: "video_conference", value: true },
            ],
            status: "published",
            requiresApproval: false,
            capacity: 10,
            inventoryTotal: 1,
            images: [],
            pricing: {
                basePrice: 0,
                pricePerHour: 0,
                currency: "NOK",
            },
            metadata: {},
        });
        console.log("Created resources:", hallId, sportsHallId, meetingRoomId);

        // 7. Create sample booking
        const now = Date.now();
        const tomorrow = now + 24 * 60 * 60 * 1000;

        const bookingId = await ctx.db.insert("bookings", {
            tenantId,
            resourceId: meetingRoomId,
            userId: memberUserId,
            organizationId: sportsOrgId,
            status: "confirmed",
            startTime: tomorrow + 9 * 60 * 60 * 1000, // 9:00
            endTime: tomorrow + 11 * 60 * 60 * 1000, // 11:00
            totalPrice: 0,
            currency: "NOK",
            notes: "Styremøte",
            metadata: { source: "seed" },
            version: 1,
            submittedAt: now,
            approvedAt: now,
        });
        console.log("Created booking:", bookingId);

        // 8. Create RBAC roles
        const adminRoleId = await ctx.db.insert("roles", {
            tenantId,
            name: "Administrator",
            description: "Full system access",
            permissions: [
                "tenant:read",
                "tenant:write",
                "tenant:admin",
                "user:read",
                "user:write",
                "user:invite",
                "user:delete",
                "resource:read",
                "resource:write",
                "resource:delete",
                "resource:publish",
                "booking:read",
                "booking:write",
                "booking:approve",
                "booking:cancel",
                "org:read",
                "org:write",
                "org:admin",
                "rbac:read",
                "rbac:write",
                "billing:read",
                "billing:write",
                "reports:read",
                "reports:export",
            ],
            isDefault: false,
            isSystem: true,
        });

        const managerRoleId = await ctx.db.insert("roles", {
            tenantId,
            name: "Manager",
            description: "Resource and booking management",
            permissions: [
                "resource:read",
                "resource:write",
                "resource:publish",
                "booking:read",
                "booking:write",
                "booking:approve",
                "booking:cancel",
                "user:read",
                "reports:read",
            ],
            isDefault: false,
            isSystem: false,
        });

        const memberRoleId = await ctx.db.insert("roles", {
            tenantId,
            name: "Member",
            description: "Basic booking access",
            permissions: ["resource:read", "booking:read", "booking:write"],
            isDefault: true,
            isSystem: false,
        });
        console.log("Created roles:", adminRoleId, managerRoleId, memberRoleId);

        // 9. Assign roles to users
        await ctx.db.insert("userRoles", {
            userId: adminUserId,
            roleId: adminRoleId,
            tenantId,
            assignedAt: Date.now(),
        });

        await ctx.db.insert("userRoles", {
            userId: managerUserId,
            roleId: managerRoleId,
            tenantId,
            assignedAt: Date.now(),
        });

        await ctx.db.insert("userRoles", {
            userId: memberUserId,
            roleId: memberRoleId,
            tenantId,
            assignedAt: Date.now(),
        });
        console.log("Assigned roles to users");

        return {
            success: true,
            created: {
                tenant: tenantId,
                organizations: 2,
                users: 3,
                demoTokens: 3,
                resources: 3,
                bookings: 1,
                roles: 3,
            },
        };
    },
});

// Reset all data (for development)
export const resetAll = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("Resetting all data...");

        // Delete in order to respect foreign key-like constraints
        const tables = [
            "bookingAudit",
            "scheduledReports",
            "reportSchedules",
            "availabilityMetrics",
            "bookingMetrics",
            "rentalAgreements",
            "messages",
            "conversations",
            "favorites",
            "categories",
            "seasonApplications",
            "priorityRules",
            "seasons",
            "custodySubgrants",
            "custodyGrants",
            "resourceAddons",
            "bookingAddons",
            "addons",
            "resourceAmenities",
            "amenities",
            "amenityGroups",
            "userPricingGroups",
            "resourcePricing",
            "orgPricingGroups",
            "pricingGroups",
            "seasonalLeases",
            "blocks",
            "allocations",
            "bookingConflicts",
            "bookings",
            "resources",
            "userRoles",
            "roles",
            "authDemoTokens",
            "tenantUsers",
            "users",
            "organizations",
            "tenants",
        ] as const;

        let deleted = 0;
        for (const table of tables) {
            try {
                const docs = await ctx.db.query(table).collect();
                for (const doc of docs) {
                    await ctx.db.delete(doc._id);
                    deleted++;
                }
            } catch (e) {
                // Table might not exist or be empty
                console.log(`Skipping ${table}`);
            }
        }

        console.log(`Deleted ${deleted} documents`);
        return { success: true, deleted };
    },
});
