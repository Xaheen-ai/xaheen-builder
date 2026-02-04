/**
 * Main seed runner - imports modular seed data and runs seeding
 * 
 * Run: npx convex run seeds/index:seedAll
 */

import { mutation } from "../_generated/server";
import { CATEGORIES, ENABLED_CATEGORIES } from "./categories";
import { AMENITIES } from "./amenities";
import { getAddress, getLocation } from "./locations";
import { getImagesForSubcategory } from "./images";
import { ALL_RESOURCES } from "./data";

export const seedAll = mutation({
    args: {},
    handler: async (ctx) => {
        console.log(`Seeding ${ALL_RESOURCES.length} resources...`);

        // Get tenant
        const tenant = await ctx.db.query("tenants").filter((q) => q.eq(q.field("slug"), "skien")).first();
        if (!tenant) {
            throw new Error("Tenant 'skien' not found. Run seeds.ts first to create tenant.");
        }
        const tenantId = tenant._id;

        // Get or create organization
        let org = await ctx.db.query("organizations").filter((q) => q.eq(q.field("tenantId"), tenantId)).first();
        if (!org) {
            const orgId = await ctx.db.insert("organizations", {
                tenantId,
                name: "Skien Kommune - Kultur og Fritid",
                slug: "kultur",
                description: "Kultur- og fritidsavdelingen",
                type: "municipality",
                status: "active",
                settings: {},
                metadata: {},
            });
            org = await ctx.db.get(orgId);
        }

        // Delete existing resources
        const existing = await ctx.db.query("resources").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        for (const r of existing) {
            await ctx.db.delete(r._id);
        }
        console.log(`Deleted ${existing.length} existing resources`);

        // Create new resources with full data
        let created = 0;
        for (let i = 0; i < ALL_RESOURCES.length; i++) {
            const r = ALL_RESOURCES[i];
            const location = getLocation(r.cityKey);
            const address = getAddress(r.cityKey, i);
            const subcategoryKey = r.subcategoryKeys[0];
            const images = getImagesForSubcategory(subcategoryKey, i, 3);

            // Convert amenity strings to feature objects { name, value: true }
            const features = r.amenities.map((amenityKey: string) => ({
                name: amenityKey,
                value: true,
            }));

            await ctx.db.insert("resources", {
                tenantId,
                organizationId: org!._id,
                name: r.name,
                slug: r.slug,
                description: r.description,
                categoryKey: r.categoryKey,
                subcategoryKeys: r.subcategoryKeys,
                timeMode: r.timeMode,
                features,
                status: "published",
                requiresApproval: r.requiresApproval,
                capacity: r.capacity,
                inventoryTotal: 1,
                images: images,
                pricing: { basePrice: r.price, currency: "NOK", unit: r.priceUnit },
                metadata: {
                    city: location.city,
                    region: location.region,
                    postalCode: location.postalCode,
                    address: address,
                    coordinates: { lat: location.lat, lng: location.lng },
                    ...(r.contactEmail && { contactEmail: r.contactEmail }),
                    ...(r.contactPhone && { contactPhone: r.contactPhone }),
                    ...(r.contactName && { contactName: r.contactName }),
                    ...(r.openingHours && { openingHours: r.openingHours }),
                    ...(r.rules && { rules: r.rules }),
                    ...(r.faq && { faq: r.faq }),
                    ...(r.events && { events: r.events }),
                },
                // Booking mode settings
                allowSeasonRental: r.allowSeasonRental ?? false,
                allowRecurringBooking: r.allowRecurringBooking ?? false,
            });
            created++;
        }

        // Update tenant categories
        await ctx.db.patch(tenantId, {
            enabledCategories: ENABLED_CATEGORIES,
        });

        // Seed categories to database (making them configurable)
        const existingCats = await ctx.db.query("categories").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        for (const cat of existingCats) {
            await ctx.db.delete(cat._id);
        }

        let categoriesCreated = 0;
        for (const [, cat] of Object.entries(CATEGORIES)) {
            const catId = await ctx.db.insert("categories", {
                tenantId,
                key: cat.key,
                name: cat.name,
                slug: cat.key.toLowerCase(),
                icon: cat.icon,
                isActive: true,
                settings: { label: cat.label },
            });
            categoriesCreated++;

            for (const sub of cat.subcategories) {
                await ctx.db.insert("categories", {
                    tenantId,
                    parentId: catId,
                    key: sub.key,
                    name: sub.name,
                    slug: sub.key.toLowerCase().replace(/_/g, "-"),
                    isActive: true,
                    settings: {},
                });
                categoriesCreated++;
            }
        }

        // Seed amenities to database (making them configurable)
        const existingAmenities = await ctx.db.query("amenities").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        for (const amenity of existingAmenities) {
            await ctx.db.delete(amenity._id);
        }

        let amenitiesCreated = 0;
        for (const [key, amenity] of Object.entries(AMENITIES)) {
            await ctx.db.insert("amenities", {
                tenantId,
                name: amenity.name,
                slug: key.toLowerCase().replace(/_/g, "-"),
                icon: amenity.icon,
                displayOrder: amenitiesCreated + 1,
                isHighlighted: false,
                isActive: true,
                metadata: {},
            });
            amenitiesCreated++;
        }

        // Count by category
        const byCategory: Record<string, number> = {};
        for (const r of ALL_RESOURCES) {
            byCategory[r.categoryKey] = (byCategory[r.categoryKey] || 0) + 1;
        }

        console.log(`Created ${created} resources, ${categoriesCreated} categories, ${amenitiesCreated} amenities`);
        return {
            success: true,
            tenant: tenantId,
            deleted: existing.length,
            created,
            categoriesCreated,
            amenitiesCreated,
            byCategory,
            categories: ENABLED_CATEGORIES,
        };
    },
});

export const preview = mutation({
    args: {},
    handler: async () => {
        const byCategory: Record<string, number> = {};
        const bySubcategory: Record<string, number> = {};
        const byCity: Record<string, number> = {};

        for (const r of ALL_RESOURCES) {
            byCategory[r.categoryKey] = (byCategory[r.categoryKey] || 0) + 1;
            for (const sub of r.subcategoryKeys) {
                bySubcategory[sub] = (bySubcategory[sub] || 0) + 1;
            }
            byCity[r.cityKey] = (byCity[r.cityKey] || 0) + 1;
        }

        return {
            total: ALL_RESOURCES.length,
            byCategory,
            bySubcategory,
            byCity,
            categories: CATEGORIES,
        };
    },
});
