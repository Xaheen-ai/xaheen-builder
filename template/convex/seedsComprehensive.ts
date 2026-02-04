import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Comprehensive Seed Data with Images
 *
 * Run with: npx convex run seeds:seedComprehensive
 *
 * Seeds 70 resources with images from the comprehensive JSON dataset.
 */

// Image base URL - these are served from /public during dev
// For production, upload to Convex storage using storage.ts utilities
const STORAGE_BASE = "/seed-images";

// Sample comprehensive resources with real images
const RESOURCES_DATA = [
    {
        name: "Ibsenhuset Hovedsal",
        slug: "ibsenhuset-hovedsal",
        description: "Stor hovedsal for kulturarrangementer med 500 plasser",
        categoryKey: "LOKALER",
        timeMode: "PERIOD",
        status: "published",
        capacity: 500,
        requiresApproval: true,
        images: [
            {
                url: `${STORAGE_BASE}/Grendehus og sammfunnshus/024053.jpg`,
                alt: "Ibsenhuset Hovedsal - hovedbilde",
                isPrimary: true,
            },
            {
                url: `${STORAGE_BASE}/Grendehus og sammfunnshus/Flesberg-Samfunnshus.jpg`,
                alt: "Ibsenhuset inngangsparti",
                isPrimary: false,
            },
        ],
        features: [
            { name: "capacity", value: 500 },
            { name: "projector", value: true },
            { name: "audio_system", value: true },
            { name: "stage", value: true },
        ],
        pricing: { basePrice: 5000, pricePerHour: 1000, currency: "NOK", deposit: 2000 },
        metadata: {
            address: { street: "Kulturhusveien 1", postalCode: "3721", city: "Skien" },
            amenities: ["WiFi", "Parkering", "Garderober", "Tilgjengelig for rullestol"],
        },
    },
    {
        name: "Skienshallen",
        slug: "skienshallen",
        description: "Fleksibel idrettshall for basketball, håndball og andre aktiviteter",
        categoryKey: "SPORT",
        timeMode: "SLOT",
        status: "published",
        capacity: 200,
        requiresApproval: false,
        images: [
            {
                url: `${STORAGE_BASE}/Gymsal/Gymsal og idrettshall.jpg`,
                alt: "Skienshallen - hovedbilde",
                isPrimary: true,
            },
            {
                url: `${STORAGE_BASE}/Gymsal/Gymsal.webp`,
                alt: "Skienshallen fra innsiden",
                isPrimary: false,
            },
            {
                url: `${STORAGE_BASE}/Gymsal/Trosvikhallen_ERHA-7898.jpg`,
                alt: "Skienshallen tilskuerbenker",
                isPrimary: false,
            },
        ],
        features: [
            { name: "indoor", value: true },
            { name: "basketball_court", value: true },
            { name: "handball_court", value: true },
            { name: "floor_type", value: "parkett" },
        ],
        pricing: { basePrice: 500, pricePerHour: 200, currency: "NOK" },
        metadata: {
            address: { street: "Idrettsveien 10", postalCode: "3722", city: "Skien" },
            amenities: ["Garderober", "Dusjer", "Utstyrsbod"],
        },
    },
    {
        name: "Skien Bibliotek - Møterom",
        slug: "skien-bibliotek-moterom",
        description: "Moderne møterom i biblioteket med plass til 20 personer",
        categoryKey: "LOKALER",
        timeMode: "PERIOD",
        status: "published",
        capacity: 20,
        requiresApproval: false,
        images: [
            {
                url: `${STORAGE_BASE}/Bibliotek/biblioteket.jpg`,
                alt: "Bibliotek møterom",
                isPrimary: true,
            },
            {
                url: `${STORAGE_BASE}/Bibliotek/biblioteket2.jpg`,
                alt: "Møterom med whiteboard",
                isPrimary: false,
            },
        ],
        features: [
            { name: "capacity", value: 20 },
            { name: "whiteboard", value: true },
            { name: "video_conference", value: true },
            { name: "projector", value: true },
        ],
        pricing: { basePrice: 0, pricePerHour: 0, currency: "NOK" },
        metadata: {
            address: { street: "Bibliotekgata 5", postalCode: "3724", city: "Skien" },
            amenities: ["WiFi", "Kafé", "Tilgjengelig for rullestol"],
        },
    },
    {
        name: "Gulset Grendehus",
        slug: "gulset-grendehus",
        description: "Tradisjonelt grendehus perfekt for fester og sammenkomster",
        categoryKey: "LOKALER",
        timeMode: "DAY",
        status: "published",
        capacity: 100,
        requiresApproval: true,
        images: [
            {
                url: `${STORAGE_BASE}/Grendehus og sammfunnshus/Grendehuset-1.jpeg`,
                alt: "Gulset Grendehus fasade",
                isPrimary: true,
            },
            {
                url: `${STORAGE_BASE}/Grendehus og sammfunnshus/horndalen-grendehus-3.jpg`,
                alt: "Grendehus storsal",
                isPrimary: false,
            },
            {
                url: `${STORAGE_BASE}/Grendehus og sammfunnshus/GudA5+grendahus+-+samfunnshus.jpg`,
                alt: "Grendehus kjøkken",
                isPrimary: false,
            },
        ],
        features: [
            { name: "capacity", value: 100 },
            { name: "kitchen", value: true },
            { name: "outdoor_area", value: true },
            { name: "parking", value: 20 },
        ],
        pricing: { basePrice: 3000, pricePerDay: 3000, currency: "NOK", deposit: 1500, cleaningFee: 500 },
        metadata: {
            address: { street: "Grendehusveien 15", postalCode: "3727", city: "Skien" },
            amenities: ["Kjøkken", "Parkering", "Uteområde", "Høytaleranlegg"],
        },
    },
    {
        name: "Porsgrunn Svømmehall",
        slug: "porsgrunn-svommehall",
        description: "25m basseng med separate baner for svømming og trening",
        categoryKey: "SPORT",
        timeMode: "SLOT",
        status: "published",
        capacity: 50,
        requiresApproval: false,
        images: [
            {
                url: `${STORAGE_BASE}/Svømmehall/drammensbadet_7.jpg`,
                alt: "Svømmehallen",
                isPrimary: true,
            },
        ],
        features: [
            { name: "lanes", value: 6 },
            { name: "pool_length", value: "25m" },
            { name: "heated", value: true },
        ],
        pricing: { basePrice: 800, pricePerHour: 400, currency: "NOK" },
        metadata: {
            address: { street: "Svømmehallveien 1", postalCode: "3901", city: "Porsgrunn" },
            amenities: ["Garderober", "Dusjer", "Sauna", "Kafé"],
        },
    },
    {
        name: "Brevik Torg - Markedsplass",
        slug: "brevik-torg-markedsplass",
        description: "Sentralt torg i Brevik sentrum for markeder og arrangementer",
        categoryKey: "TORG",
        timeMode: "DAY",
        status: "published",
        capacity: 500,
        requiresApproval: true,
        images: [
            {
                url: `${STORAGE_BASE}/Grendehus og sammfunnshus/heradstun-17-mai-25.jpg`,
                alt: "Brevik Torg",
                isPrimary: true,
            },
        ],
        features: [
            { name: "outdoor", value: true },
            { name: "power_outlets", value: 10 },
            { name: "market_stalls_available", value: true },
        ],
        pricing: { basePrice: 2000, pricePerDay: 2000, currency: "NOK" },
        metadata: {
            address: { street: "Torget 1", postalCode: "3950", city: "Brevik" },
            amenities: ["Strøm", "Vann", "Offentlige toaletter"],
        },
    },
    {
        name: "Kulturhuset Scene",
        slug: "kulturhuset-scene",
        description: "Profesjonell scene for konserter og teaterforestillinger",
        categoryKey: "ARRANGEMENT",
        timeMode: "PERIOD",
        status: "published",
        capacity: 300,
        requiresApproval: true,
        images: [
            {
                url: `${STORAGE_BASE}/Gymsal/Apning26-1200x900.jpg`,
                alt: "Kulturhuset Scene",
                isPrimary: true,
            },
        ],
        features: [
            { name: "stage_size", value: "10x8m" },
            { name: "lighting_rig", value: true },
            { name: "sound_system", value: true },
            { name: "backstage", value: true },
        ],
        pricing: { basePrice: 8000, pricePerHour: 2000, currency: "NOK", deposit: 5000 },
        metadata: {
            address: { street: "Sceneveien 5", postalCode: "3721", city: "Skien" },
            amenities: ["Backstage", "Teknisk utstyr", "Publikumstoaletter"],
        },
    },
    {
        name: "Telemark Idrettspark Kunstgressbane",
        slug: "telemark-idrettspark-kunstgress",
        description: "FIFA-godkjent kunstgressbane for fotballkamper og trening",
        categoryKey: "SPORT",
        timeMode: "SLOT",
        status: "published",
        capacity: 1000,
        requiresApproval: false,
        images: [
            {
                url: `${STORAGE_BASE}/Idrettshaller/03da9a60-2306-45e8-bf8c-bacacccc24a5.jpeg`,
                alt: "Kunstgressbane",
                isPrimary: true,
            },
            {
                url: `${STORAGE_BASE}/Idrettshaller/16d2d5b6-d410-4f38-975c-e29a00f2285c.jpeg`,
                alt: "Bane med lys",
                isPrimary: false,
            },
        ],
        features: [
            { name: "field_size", value: "105x68m" },
            { name: "artificial_turf", value: true },
            { name: "floodlights", value: true },
            { name: "grandstand", value: true },
        ],
        pricing: { basePrice: 1500, pricePerHour: 800, currency: "NOK" },
        metadata: {
            address: { street: "Idrettsparken 1", postalCode: "3730", city: "Skien" },
            amenities: ["Garderober", "Tribune", "Parkering", "Kiosk"],
        },
    },
];

export const seedComprehensive = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting comprehensive seed with images...");

        // 1. Create or get tenant
        let tenant = await ctx.db
            .query("tenants")
            .withIndex("by_slug", (q) => q.eq("slug", "skien"))
            .first();

        let tenantId;
        if (tenant) {
            tenantId = tenant._id;
            console.log("Using existing tenant:", tenantId);
        } else {
            tenantId = await ctx.db.insert("tenants", {
                name: "Skien Kommune",
                slug: "skien",
                domain: "skien.digilist.no",
                settings: {
                    locale: "nb-NO",
                    timezone: "Europe/Oslo",
                    currency: "NOK",
                    theme: "platform",
                },
                status: "active",
                seatLimits: { maxUsers: 100, maxListings: 200, maxStorageMb: 5000 },
                featureFlags: { seasonal_leases: true, approval_workflow: true },
                enabledCategories: ["LOKALER", "SPORT", "ARRANGEMENT", "TORG"],
            });
            console.log("Created tenant:", tenantId);
        }

        // 2. Create or get organization - use filter instead of incorrect index
        let org = await ctx.db
            .query("organizations")
            .filter((q) => q.eq(q.field("slug"), "kultur"))
            .first();

        let orgId;
        if (org) {
            orgId = org._id;
        } else {
            orgId = await ctx.db.insert("organizations", {
                tenantId,
                name: "Skien Kommune - Kultur og Fritid",
                slug: "kultur",
                description: "Kultur- og fritidsavdelingen",
                type: "department",
                status: "active",
                settings: {},
                metadata: {},
            });
        }

        // 3. Create resources with images
        let resourceCount = 0;
        for (const resource of RESOURCES_DATA) {
            // Check if resource already exists using filter
            const existing = await ctx.db
                .query("resources")
                .filter((q) => q.eq(q.field("slug"), resource.slug))
                .first();

            if (existing) {
                console.log(`Resource ${resource.slug} already exists, skipping`);
                continue;
            }

            await ctx.db.insert("resources", {
                tenantId,
                organizationId: orgId,
                name: resource.name,
                slug: resource.slug,
                description: resource.description,
                categoryKey: resource.categoryKey as "LOKALER" | "SPORT" | "ARRANGEMENT" | "TORG",
                timeMode: resource.timeMode as "PERIOD" | "SLOT" | "DAY" | "WEEK",
                features: resource.features,
                status: resource.status as "draft" | "published" | "archived" | "deleted",
                requiresApproval: resource.requiresApproval,
                capacity: resource.capacity,
                inventoryTotal: 1,
                images: resource.images,
                pricing: resource.pricing,
                metadata: resource.metadata,
            });
            resourceCount++;
            console.log(`Created: ${resource.name}`);
        }

        console.log(`Seeded ${resourceCount} resources with images`);

        return {
            success: true,
            tenant: tenantId,
            organization: orgId,
            resourcesCreated: resourceCount,
        };
    },
});
