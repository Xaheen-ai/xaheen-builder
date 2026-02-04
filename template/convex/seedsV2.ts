import { mutation } from "./_generated/server";

/**
 * Seed Data V2 - Aligned with Lovable app categories
 * 
 * Categories:
 * - LOKALER (Selskapslokale, Møterom, Gymsal, Kulturarena, Konferanserom)
 * - SPORT
 * - ARRANGEMENTER
 * - TORGET
 * 
 * Facilities: WiFi, Parkering, Garderober, Kjøkken, Scene, Dusj, Utstyrslån, Kiosk
 * 
 * Run: npx convex run seedsV2:seedAll
 */

// Category definitions matching Lovable app
const CATEGORIES = {
    LOKALER: {
        key: "LOKALER",
        name: "Lokaler",
        icon: "building",
        subcategories: [
            { key: "SELSKAPSLOKALE", name: "Selskapslokale" },
            { key: "MOTEROM", name: "Møterom" },
            { key: "GYMSAL", name: "Gymsal" },
            { key: "KULTURARENA", name: "Kulturarena" },
            { key: "KONFERANSEROM", name: "Konferanserom" },
        ],
    },
    SPORT: {
        key: "SPORT",
        name: "Sport",
        icon: "sports",
        subcategories: [
            { key: "IDRETTSHALL", name: "Idrettshall" },
            { key: "SVOMMEHALL", name: "Svømmehall" },
            { key: "FOTBALLBANE", name: "Fotballbane" },
            { key: "TENNISBANE", name: "Tennisbane" },
            { key: "FRIIDRETTSANLEGG", name: "Friidrettsanlegg" },
        ],
    },
    ARRANGEMENTER: {
        key: "ARRANGEMENTER",
        name: "Arrangementer",
        icon: "event",
        subcategories: [
            { key: "KONSERTARENA", name: "Konsertarena" },
            { key: "FESTIVALPLASS", name: "Festivalplass" },
            { key: "TEATER", name: "Teater" },
            { key: "UTEOMRADE", name: "Uteområde" },
        ],
    },
    TORGET: {
        key: "TORGET",
        name: "Torget",
        icon: "park",
        subcategories: [
            { key: "MARKEDSPLASS", name: "Markedsplass" },
            { key: "TORG", name: "Torg" },
            { key: "UTEOMRADE", name: "Uteområde" },
        ],
    },
};

// Facilities matching Lovable app
const FACILITIES = [
    "WIFI",
    "PARKERING",
    "GARDEROBER",
    "KJOKKEN",
    "SCENE",
    "DUSJ",
    "UTSTYRSLAN",
    "KIOSK",
    "CATERING",
];

// Resources organized by category - 15 Lokaler, 12 Sport, 10 Arrangementer, 12 Torget = 49 total
const SEED_RESOURCES = [
    // ============================================================================
    // LOKALER (15 resources)
    // ============================================================================
    // Selskapslokale (4)
    { name: "Ibsenhuset Festsal", slug: "ibsenhuset-festsal", description: "Elegant festsal for bryllup og selskaper med plass til 200 gjester", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 200, requiresApproval: true, features: ["WIFI", "PARKERING", "KJOKKEN", "CATERING"], images: [] },
    { name: "Porsgrunn Rådhus Festsal", slug: "porsgrunn-radhus-festsal", description: "Historisk festsal i rådhuset med utsikt over byen", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 150, requiresApproval: true, features: ["WIFI", "PARKERING", "CATERING"], images: [] },
    { name: "Bjørntvedt Gård", slug: "bjorntvedt-gard", description: "Sjarmerende gårdslokale for intime selskaper", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 80, requiresApproval: true, features: ["PARKERING", "KJOKKEN"], images: [] },
    { name: "Herkules Samfunnshus", slug: "herkules-samfunnshus", description: "Tradisjonelt samfunnshus med stor kapasitet", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 180, requiresApproval: false, features: ["WIFI", "PARKERING", "KJOKKEN"], images: [] },

    // Møterom (4)
    { name: "Skien Bibliotek Møterom", slug: "skien-bibliotek-moterom", description: "Moderne møterom i biblioteket med AV-utstyr", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 20, requiresApproval: false, features: ["WIFI"], images: [] },
    { name: "Rådhuset Møterom A", slug: "radhuset-moterom-a", description: "Profesjonelt møterom med videokonferanse", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 12, requiresApproval: false, features: ["WIFI"], images: [] },
    { name: "Næringsparken Møtesenter", slug: "naeringsparken-motesenter", description: "Fleksibelt møtesenter for bedrifter", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 30, requiresApproval: false, features: ["WIFI", "PARKERING", "KJOKKEN"], images: [] },
    { name: "Skotfoss Åpent Rom", slug: "skotfoss-apent-rom", description: "Fleksibelt rom for møter og workshops", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 25, requiresApproval: false, features: ["WIFI"], images: [] },

    // Gymsal (3)
    { name: "Bø Gymsal", slug: "bo-gymsal", description: "Gymsal for trening og arrangementer", categoryKey: "LOKALER", subcategoryKeys: ["GYMSAL"], timeMode: "PERIOD", capacity: 100, requiresApproval: false, features: ["GARDEROBER", "DUSJ"], images: [] },
    { name: "Herre Gymsal", slug: "herre-gymsal", description: "Lokal gymsal med god standard", categoryKey: "LOKALER", subcategoryKeys: ["GYMSAL"], timeMode: "PERIOD", capacity: 80, requiresApproval: false, features: ["GARDEROBER", "DUSJ"], images: [] },
    { name: "Mæla Skole Gymsal", slug: "maela-skole-gymsal", description: "Skolegymsal tilgjengelig på kveldstid", categoryKey: "LOKALER", subcategoryKeys: ["GYMSAL"], timeMode: "PERIOD", capacity: 120, requiresApproval: true, features: ["GARDEROBER", "DUSJ", "PARKERING"], images: [] },

    // Kulturarena (2)
    { name: "Ibsenhuset Hovedsal", slug: "ibsenhuset-hovedsal", description: "Stor kultursal for konserter og teater med 500 plasser", categoryKey: "LOKALER", subcategoryKeys: ["KULTURARENA"], timeMode: "PERIOD", capacity: 500, requiresApproval: true, features: ["WIFI", "PARKERING", "SCENE", "GARDEROBER"], images: [] },
    { name: "Porsgrunn Kulturhus", slug: "porsgrunn-kulturhus", description: "Moderne kulturhus med teatersal og utstillingsrom", categoryKey: "LOKALER", subcategoryKeys: ["KULTURARENA"], timeMode: "PERIOD", capacity: 400, requiresApproval: true, features: ["WIFI", "PARKERING", "SCENE", "GARDEROBER", "KIOSK"], images: [] },

    // Konferanserom (2)
    { name: "Frier Vest Konferansesenter", slug: "frier-vest-konferansesenter", description: "Profesjonelt konferansesenter med full AV-pakke", categoryKey: "LOKALER", subcategoryKeys: ["KONFERANSEROM"], timeMode: "PERIOD", capacity: 200, requiresApproval: true, features: ["WIFI", "PARKERING", "KJOKKEN", "CATERING"], images: [] },
    { name: "Grenland Konferansehotell", slug: "grenland-konferansehotell", description: "Konferanselokaler med overnatting", categoryKey: "LOKALER", subcategoryKeys: ["KONFERANSEROM"], timeMode: "PERIOD", capacity: 150, requiresApproval: true, features: ["WIFI", "PARKERING", "KJOKKEN", "CATERING"], images: [] },

    // ============================================================================
    // SPORT (12 resources)
    // ============================================================================
    // Idrettshall (4)
    { name: "Skienshallen", slug: "skienshallen", description: "Moderne idrettshall for håndball, basketball og arrangement", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 2000, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ", "KIOSK"], images: [] },
    { name: "Borgestad Idrettshall", slug: "borgestad-idrettshall", description: "Lokal idrettshall for trening og kamper", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 500, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ"], images: [] },
    { name: "Rjukan Idrettshall", slug: "rjukan-idrettshall", description: "Stor idrettshall i Rjukan", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 400, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ"], images: [] },
    { name: "Telemarkshallen", slug: "telemarkshallen", description: "Stor flerbrukshall for idrett og messer", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 3000, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ", "KIOSK", "CATERING"], images: [] },

    // Svømmehall (2)
    { name: "Porsgrunn Svømmehall", slug: "porsgrunn-svommehall", description: "Moderne svømmeanlegg med flere bassenger", categoryKey: "SPORT", subcategoryKeys: ["SVOMMEHALL"], timeMode: "SLOT", capacity: 200, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ", "KIOSK"], images: [] },
    { name: "Skien Bad", slug: "skien-bad", description: "Svømmehall med stupetårn og barnebasseng", categoryKey: "SPORT", subcategoryKeys: ["SVOMMEHALL"], timeMode: "SLOT", capacity: 150, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ", "KIOSK"], images: [] },

    // Fotballbane (3)
    { name: "Telemark Idrettspark Kunstgress", slug: "telemark-idrettspark-kunstgress", description: "FIFA-godkjent kunstgressbane for fotball", categoryKey: "SPORT", subcategoryKeys: ["FOTBALLBANE"], timeMode: "PERIOD", capacity: 30, requiresApproval: false, features: ["PARKERING", "GARDEROBER"], images: [] },
    { name: "Solum Idrettspark", slug: "solum-idrettspark", description: "Idrettspark med flere baner", categoryKey: "SPORT", subcategoryKeys: ["FOTBALLBANE"], timeMode: "PERIOD", capacity: 100, requiresApproval: false, features: ["PARKERING", "GARDEROBER"], images: [] },
    { name: "Odd Stadion Treningsbane", slug: "odd-stadion-treningsbane", description: "Treningsbane ved Odd Stadion", categoryKey: "SPORT", subcategoryKeys: ["FOTBALLBANE"], timeMode: "PERIOD", capacity: 30, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ"], images: [] },

    // Tennisbane (2)
    { name: "Klyve Tennishall", slug: "klyve-tennishall", description: "Innendørs tennishall med 4 baner", categoryKey: "SPORT", subcategoryKeys: ["TENNISBANE"], timeMode: "SLOT", capacity: 16, requiresApproval: false, features: ["PARKERING", "GARDEROBER", "DUSJ"], images: [] },
    { name: "Skien Tennisklubb", slug: "skien-tennisklubb", description: "Utendørs tennisbaner i sentrum", categoryKey: "SPORT", subcategoryKeys: ["TENNISBANE"], timeMode: "SLOT", capacity: 8, requiresApproval: false, features: ["PARKERING"], images: [] },

    // Friidrettsanlegg (1)
    { name: "Kjølnes Friidrettsstadion", slug: "kjolnes-friidrettsstadion", description: "Komplett friidrettsanlegg med løpebane", categoryKey: "SPORT", subcategoryKeys: ["FRIIDRETTSANLEGG"], timeMode: "PERIOD", capacity: 200, requiresApproval: true, features: ["PARKERING", "GARDEROBER", "DUSJ"], images: [] },

    // ============================================================================
    // ARRANGEMENTER (10 resources)
    // ============================================================================
    // Konsertarena (3)
    { name: "Bø Sommarland Arena", slug: "bo-sommarland-arena", description: "Stor utendørs arena for konserter og festivaler", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["KONSERTARENA"], timeMode: "DAY", capacity: 5000, requiresApproval: true, features: ["PARKERING", "SCENE", "KIOSK"], images: [] },
    { name: "Ibsen Amfi", slug: "ibsen-amfi", description: "Utendørs amfiteater for forestillinger", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["KONSERTARENA"], timeMode: "PERIOD", capacity: 1500, requiresApproval: true, features: ["PARKERING", "SCENE"], images: [] },
    { name: "Nome Kulturarena", slug: "nome-kulturarena", description: "Moderne kulturarena i Nome", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["KONSERTARENA"], timeMode: "PERIOD", capacity: 600, requiresApproval: true, features: ["PARKERING", "SCENE", "GARDEROBER", "KIOSK"], images: [] },

    // Festivalplass (3)
    { name: "Heddal Stavkirke Festplass", slug: "heddal-stavkirke-festplass", description: "Historisk festplass ved Heddal Stavkirke", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["FESTIVALPLASS"], timeMode: "DAY", capacity: 2000, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Kragerø Brygge Festplass", slug: "kragero-brygge-festplass", description: "Festplass på brygga i Kragerø", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["FESTIVALPLASS"], timeMode: "DAY", capacity: 1000, requiresApproval: true, features: ["PARKERING", "KIOSK"], images: [] },
    { name: "Gimsøy Kloster Ruiner", slug: "gimsoy-kloster-ruiner", description: "Historisk område for arrangementer", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["FESTIVALPLASS"], timeMode: "DAY", capacity: 500, requiresApproval: true, features: ["PARKERING"], images: [] },

    // Teater (2)
    { name: "Notodden Teater", slug: "notodden-teater", description: "Historisk teater i Notodden", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["TEATER"], timeMode: "PERIOD", capacity: 350, requiresApproval: true, features: ["PARKERING", "SCENE", "GARDEROBER", "KIOSK"], images: [] },
    { name: "Kulturhuset Scene", slug: "kulturhuset-scene", description: "Profesjonell scene med lyd og lys", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["TEATER"], timeMode: "PERIOD", capacity: 800, requiresApproval: true, features: ["PARKERING", "SCENE", "GARDEROBER"], images: [] },

    // Uteområde (2)
    { name: "Brevik Kulturminneområde", slug: "brevik-kulturminneomrade", description: "Historisk område i Brevik for utendørs arrangementer", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["UTEOMRADE"], timeMode: "DAY", capacity: 300, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Ulefoss Hovedgård", slug: "ulefoss-hovedgard", description: "Historisk hovedgård med hage for arrangementer", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["UTEOMRADE"], timeMode: "DAY", capacity: 100, requiresApproval: true, features: ["PARKERING", "KJOKKEN"], images: [] },

    // ============================================================================
    // TORGET (12 resources)
    // ============================================================================
    // Markedsplass (4)
    { name: "Skien Sentrum Torg", slug: "skien-sentrum-torg", description: "Hovedtorget i Skien sentrum", categoryKey: "TORGET", subcategoryKeys: ["MARKEDSPLASS"], timeMode: "DAY", capacity: 2000, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Porsgrunn Havnefront", slug: "porsgrunn-havnefront", description: "Attraktivt havneområde for markeder og arrangementer", categoryKey: "TORGET", subcategoryKeys: ["MARKEDSPLASS"], timeMode: "DAY", capacity: 2000, requiresApproval: true, features: ["PARKERING", "KIOSK"], images: [] },
    { name: "Brevik Torg", slug: "brevik-torg", description: "Sentral markedsplass for torghandel", categoryKey: "TORGET", subcategoryKeys: ["MARKEDSPLASS"], timeMode: "DAY", capacity: 500, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Stathelle Torg", slug: "stathelle-torg", description: "Sentralt torg i Stathelle", categoryKey: "TORGET", subcategoryKeys: ["MARKEDSPLASS"], timeMode: "DAY", capacity: 300, requiresApproval: true, features: ["PARKERING"], images: [] },

    // Torg (4)
    { name: "Seljord Torg", slug: "seljord-torg", description: "Sentralt torg i Seljord", categoryKey: "TORGET", subcategoryKeys: ["TORG"], timeMode: "DAY", capacity: 400, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Søndre Bydel Torg", slug: "sondre-bydel-torg", description: "Lokalt bydelstorg", categoryKey: "TORGET", subcategoryKeys: ["TORG"], timeMode: "DAY", capacity: 300, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Notodden Torg", slug: "notodden-torg", description: "Sentrum av Notodden", categoryKey: "TORGET", subcategoryKeys: ["TORG"], timeMode: "DAY", capacity: 500, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Rjukan Torg", slug: "rjukan-torg", description: "Historisk torg i Rjukan", categoryKey: "TORGET", subcategoryKeys: ["TORG"], timeMode: "DAY", capacity: 300, requiresApproval: true, features: ["PARKERING"], images: [] },

    // Uteområde (4)
    { name: "Ælvehovden Friluftsområde", slug: "aelvehovden-friluftsomrade", description: "Stort friluftsområde for aktiviteter", categoryKey: "TORGET", subcategoryKeys: ["UTEOMRADE"], timeMode: "DAY", capacity: 1000, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Akkerhaugen Brygge", slug: "akkerhaugen-brygge", description: "Historisk brygge ved vannet", categoryKey: "TORGET", subcategoryKeys: ["UTEOMRADE"], timeMode: "DAY", capacity: 200, requiresApproval: true, features: ["PARKERING"], images: [] },
    { name: "Borgeåsen Friluftsområde", slug: "borgeasen-friluftsomrade", description: "Stort friluftsområde med turløyper", categoryKey: "TORGET", subcategoryKeys: ["UTEOMRADE"], timeMode: "DAY", capacity: 500, requiresApproval: false, features: ["PARKERING"], images: [] },
    { name: "Skien Fritidspark", slug: "skien-fritidspark", description: "Stor fritidspark med mange aktiviteter", categoryKey: "TORGET", subcategoryKeys: ["UTEOMRADE"], timeMode: "DAY", capacity: 500, requiresApproval: false, features: ["PARKERING", "KIOSK"], images: [] },
];

// Main tenant ID
const MAIN_TENANT_ID = "pd73zbrk04k7tnmygstv3sbbyh80frae";

/**
 * Seed all resources with new category structure.
 * This will DELETE existing resources and create new ones.
 */
export const seedAll = mutation({
    args: {},
    handler: async (ctx) => {
        console.log(`Seeding ${SEED_RESOURCES.length} resources...`);

        // Get tenant
        const tenant = await ctx.db.query("tenants").filter((q) => q.eq(q.field("slug"), "skien")).first();
        if (!tenant) {
            throw new Error("Tenant 'skien' not found. Run seedsFull:seedFromJson first.");
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

        // Delete existing resources for this tenant
        const existingResources = await ctx.db.query("resources").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        for (const r of existingResources) {
            await ctx.db.delete(r._id);
        }
        console.log(`Deleted ${existingResources.length} existing resources`);

        // Create new resources
        let created = 0;
        for (const r of SEED_RESOURCES) {
            await ctx.db.insert("resources", {
                tenantId,
                organizationId: org!._id,
                name: r.name,
                slug: r.slug,
                description: r.description,
                categoryKey: r.categoryKey,
                subcategoryKeys: r.subcategoryKeys,
                timeMode: r.timeMode,
                features: r.features,
                status: "published",
                requiresApproval: r.requiresApproval,
                capacity: r.capacity,
                inventoryTotal: 1,
                images: r.images,
                pricing: { basePrice: 0, currency: "NOK" },
                metadata: {},
            });
            created++;
        }

        // Update tenant enabled categories
        await ctx.db.patch(tenantId, {
            enabledCategories: ["LOKALER", "SPORT", "ARRANGEMENTER", "TORGET"],
        });

        // Seed categories
        const existingCats = await ctx.db.query("categories").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        for (const cat of existingCats) {
            await ctx.db.delete(cat._id);
        }

        const catIds: Record<string, any> = {};
        for (const [key, cat] of Object.entries(CATEGORIES)) {
            catIds[key] = await ctx.db.insert("categories", {
                tenantId,
                key: cat.key,
                name: cat.name,
                slug: cat.key.toLowerCase(),
                icon: cat.icon,
                isActive: true,
                settings: {},
            });

            // Create subcategories
            for (const sub of cat.subcategories) {
                await ctx.db.insert("categories", {
                    tenantId,
                    parentId: catIds[key],
                    key: sub.key,
                    name: sub.name,
                    slug: sub.key.toLowerCase(),
                    isActive: true,
                    settings: {},
                });
            }
        }

        // Count by category
        const byCategory: Record<string, number> = {};
        for (const r of SEED_RESOURCES) {
            byCategory[r.categoryKey] = (byCategory[r.categoryKey] || 0) + 1;
        }

        console.log(`Created ${created} resources`);
        return {
            success: true,
            tenant: tenantId,
            deleted: existingResources.length,
            created,
            byCategory,
            categories: Object.keys(CATEGORIES),
        };
    },
});

/**
 * Preview what will be seeded without making changes.
 */
export const preview = mutation({
    args: {},
    handler: async () => {
        const byCategory: Record<string, number> = {};
        const bySubcategory: Record<string, number> = {};

        for (const r of SEED_RESOURCES) {
            byCategory[r.categoryKey] = (byCategory[r.categoryKey] || 0) + 1;
            for (const sub of r.subcategoryKeys) {
                bySubcategory[sub] = (bySubcategory[sub] || 0) + 1;
            }
        }

        return {
            total: SEED_RESOURCES.length,
            byCategory,
            bySubcategory,
            categories: CATEGORIES,
            facilities: FACILITIES,
        };
    },
});
