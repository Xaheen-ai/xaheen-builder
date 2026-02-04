import { mutation } from "./_generated/server";

/**
 * Seed Data V3 - Exact match with Lovable/Digilist app
 * 
 * Categories from screenshots:
 * 1. LOKALER (15) - Selskapslokale, Møterom, Gymsal, Kulturarena, Konferanserom
 * 2. SPORT (12) - Padel, Squash, Tennis, Cageball, Badminton (Innendørs/Utendørs)
 * 3. ARRANGEMENTER (10) - Kurs, Foredrag, Konsert, Workshop, Seminar
 * 4. TORGET (12) - Equipment: Telt, Lydanlegg, Projektor, Bord og stoler, Grill, Partytelt
 * 
 * Run: npx convex run seedsV3:seedAll
 */

const CATEGORIES = {
    LOKALER: {
        key: "LOKALER",
        name: "Lokaler",
        label: "Lokaler og rom",
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
        label: "Sport og trening",
        icon: "sports",
        subcategories: [
            { key: "PADEL", name: "Padel" },
            { key: "SQUASH", name: "Squash" },
            { key: "TENNIS", name: "Tennis" },
            { key: "CAGEBALL", name: "Cageball" },
            { key: "BADMINTON", name: "Badminton" },
        ],
    },
    ARRANGEMENTER: {
        key: "ARRANGEMENTER",
        name: "Arrangementer",
        label: "Opplevelser og arrangement",
        icon: "event",
        subcategories: [
            { key: "KURS", name: "Kurs" },
            { key: "FOREDRAG", name: "Foredrag" },
            { key: "KONSERT", name: "Konsert" },
            { key: "WORKSHOP", name: "Workshop" },
            { key: "SEMINAR", name: "Seminar" },
        ],
    },
    TORGET: {
        key: "TORGET",
        name: "Torget",
        label: "Utstyr og tjenester",
        icon: "shopping",
        subcategories: [
            { key: "TELT", name: "Telt" },
            { key: "LYDANLEGG", name: "Lydanlegg" },
            { key: "PROJEKTOR", name: "Projektor" },
            { key: "BORD_OG_STOLER", name: "Bord og stoler" },
            { key: "GRILL", name: "Grill" },
            { key: "PARTYTELT", name: "Partytelt" },
        ],
    },
};

// Norwegian cities for variety (ASCII-safe keys)
const CITIES = ["Tromso", "Trondheim", "Bergen", "Kristiansand", "Oslo", "Stavanger", "Fredrikstad", "Drammen"];

// Resources matching Lovable app exactly
const SEED_RESOURCES = [
    // ============================================================================
    // LOKALER (15) - Rooms and venues
    // ============================================================================
    { name: "Møterom 1 - Tromsø", slug: "moterom-1-tromso", description: "Moderne møterom i Tromsø. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 94, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 2117, priceUnit: "time", city: "Tromso", images: [] },
    { name: "Selskapslokale 2 - Trondheim", slug: "selskapslokale-2-trondheim", description: "Moderne selskapslokale i Trondheim. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 63, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 2430, priceUnit: "dag", city: "Trondheim", images: [] },
    { name: "Konferanserom 3 - Bergen", slug: "konferanserom-3-bergen", description: "Moderne konferanserom i Bergen. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["KONFERANSEROM"], timeMode: "SLOT", capacity: 99, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 2985, priceUnit: "time", city: "Bergen", images: [] },
    { name: "Selskapslokale 4 - Kristiansand", slug: "selskapslokale-4-kristiansand", description: "Moderne selskapslokale i Kristiansand. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 260, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 4959, priceUnit: "dag", city: "Kristiansand", images: [] },
    { name: "Selskapslokale 5 - Oslo", slug: "selskapslokale-5-oslo", description: "Moderne selskapslokale i Oslo. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 21, requiresApproval: false, features: ["WIFI", "PARKERING"], price: 2672, priceUnit: "dag", city: "Oslo", images: [] },
    { name: "Møterom 6 - Fredrikstad", slug: "moterom-6-fredrikstad", description: "Moderne møterom i Fredrikstad. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 203, requiresApproval: false, features: ["WIFI", "PARKERING"], price: 4310, priceUnit: "time", city: "Fredrikstad", images: [] },
    { name: "Konferanserom 7 - Kristiansand", slug: "konferanserom-7-kristiansand", description: "Moderne konferanserom i Kristiansand. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["KONFERANSEROM"], timeMode: "SLOT", capacity: 47, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 2579, priceUnit: "time", city: "Kristiansand", images: [] },
    { name: "Gymsal 8 - Fredrikstad", slug: "gymsal-8-fredrikstad", description: "Moderne gymsal i Fredrikstad. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["GYMSAL"], timeMode: "PERIOD", capacity: 308, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 2823, priceUnit: "time", city: "Fredrikstad", images: [] },
    { name: "Kulturarena 9 - Tromsø", slug: "kulturarena-9-tromso", description: "Moderne kulturarena i Tromsø. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["KULTURARENA"], timeMode: "DAY", capacity: 323, requiresApproval: true, features: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ"], price: 3152, priceUnit: "dag", city: "Tromso", images: [] },
    { name: "Møterom 10 - Stavanger", slug: "moterom-10-stavanger", description: "Moderne møterom i Stavanger. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 40, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ"], price: 2188, priceUnit: "time", city: "Stavanger", images: [] },
    { name: "Konferanserom 11 - Oslo", slug: "konferanserom-11-oslo", description: "Moderne konferanserom i Oslo. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["KONFERANSEROM"], timeMode: "SLOT", capacity: 175, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER"], price: 4752, priceUnit: "time", city: "Oslo", images: [] },
    { name: "Møterom 12 - Trondheim", slug: "moterom-12-trondheim", description: "Moderne møterom i Trondheim. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 60, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ"], price: 5225, priceUnit: "time", city: "Trondheim", images: [] },
    { name: "Møterom 13 - Tromsø", slug: "moterom-13-tromso", description: "Moderne møterom i Tromsø. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM"], timeMode: "SLOT", capacity: 183, requiresApproval: false, features: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ"], price: 4983, priceUnit: "time", city: "Tromso", images: [] },
    { name: "Selskapslokale 14 - Fredrikstad", slug: "selskapslokale-14-fredrikstad", description: "Moderne selskapslokale i Fredrikstad. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 347, requiresApproval: false, features: ["WIFI", "PARKERING"], price: 3557, priceUnit: "dag", city: "Fredrikstad", images: [] },
    { name: "Selskapslokale 15 - Stavanger", slug: "selskapslokale-15-stavanger", description: "Moderne selskapslokale i Stavanger. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt.", categoryKey: "LOKALER", subcategoryKeys: ["SELSKAPSLOKALE"], timeMode: "DAY", capacity: 183, requiresApproval: false, features: ["WIFI", "PARKERING"], price: 597, priceUnit: "dag", city: "Stavanger", images: [] },

    // ============================================================================
    // SPORT (12) - Sports facilities
    // ============================================================================
    { name: "Cageballbane 1 - Bergen", slug: "cageballbane-1-bergen", description: "Profesjonell cageballbane i Bergen. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["CAGEBALL"], timeMode: "SLOT", capacity: 10, requiresApproval: false, features: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"], price: 472, priceUnit: "time", city: "Bergen", images: [] },
    { name: "Squashbane 2 - Kristiansand", slug: "squashbane-2-kristiansand", description: "Profesjonell squashbane i Kristiansand. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["SQUASH"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER", "DUSJ"], price: 255, priceUnit: "time", city: "Kristiansand", images: [] },
    { name: "Padelbane 3 - Bergen", slug: "padelbane-3-bergen", description: "Profesjonell padelbane i Bergen. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["PADEL"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"], price: 218, priceUnit: "time", city: "Bergen", images: [] },
    { name: "Tennisbane 4 - Tromsø", slug: "tennisbane-4-tromso", description: "Profesjonell tennisbane i Tromsø. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["TENNIS"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"], price: 248, priceUnit: "time", city: "Tromso", images: [] },
    { name: "Padelbane 5 - Oslo", slug: "padelbane-5-oslo", description: "Profesjonell padelbane i Oslo. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["PADEL"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER"], price: 270, priceUnit: "time", city: "Oslo", images: [] },
    { name: "Badmintonbane 6 - Tromsø", slug: "badmintonbane-6-tromso", description: "Profesjonell badmintonbane i Tromsø. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["BADMINTON"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER"], price: 447, priceUnit: "time", city: "Tromso", images: [] },
    { name: "Cageballbane 7 - Bergen", slug: "cageballbane-7-bergen", description: "Profesjonell cageballbane i Bergen. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["CAGEBALL"], timeMode: "SLOT", capacity: 10, requiresApproval: false, features: ["GARDEROBER"], price: 518, priceUnit: "time", city: "Bergen", images: [] },
    { name: "Cageballbane 8 - Stavanger", slug: "cageballbane-8-stavanger", description: "Profesjonell cageballbane i Stavanger. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["CAGEBALL"], timeMode: "SLOT", capacity: 10, requiresApproval: false, features: ["GARDEROBER"], price: 270, priceUnit: "time", city: "Stavanger", images: [] },
    { name: "Cageballbane 9 - Drammen", slug: "cageballbane-9-drammen", description: "Profesjonell cageballbane i Drammen. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["CAGEBALL"], timeMode: "SLOT", capacity: 10, requiresApproval: false, features: ["GARDEROBER"], price: 468, priceUnit: "time", city: "Drammen", images: [] },
    { name: "Cageballbane 10 - Tromsø", slug: "cageballbane-10-tromso", description: "Profesjonell cageballbane i Tromsø. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["CAGEBALL"], timeMode: "SLOT", capacity: 10, requiresApproval: false, features: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"], price: 275, priceUnit: "time", city: "Tromso", images: [] },
    { name: "Padelbane 11 - Drammen", slug: "padelbane-11-drammen", description: "Profesjonell padelbane i Drammen. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["PADEL"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER"], price: 331, priceUnit: "time", city: "Drammen", images: [] },
    { name: "Squashbane 12 - Trondheim", slug: "squashbane-12-trondheim", description: "Profesjonell squashbane i Trondheim. Moderne fasiliteter og godt vedlikehold. Book din tid.", categoryKey: "SPORT", subcategoryKeys: ["SQUASH"], timeMode: "SLOT", capacity: 4, requiresApproval: false, features: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"], price: 370, priceUnit: "time", city: "Trondheim", images: [] },

    // ============================================================================
    // ARRANGEMENTER (10) - Events and experiences
    // ============================================================================
    { name: "Kurs: Digital markedsføring", slug: "kurs-digital-markedsforing", description: "Spennende kurs i Stavanger. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["KURS"], timeMode: "PERIOD", capacity: 25, requiresApproval: false, features: ["CATERING", "STREAMING"], price: 1267, priceUnit: "stk", city: "Stavanger", images: [] },
    { name: "Workshop: Ledelse", slug: "workshop-ledelse", description: "Spennende workshop i Drammen. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["WORKSHOP"], timeMode: "PERIOD", capacity: 29, requiresApproval: false, features: ["CATERING"], price: 1663, priceUnit: "stk", city: "Drammen", images: [] },
    { name: "Seminar: Kreativ skriving", slug: "seminar-kreativ-skriving", description: "Spennende seminar i Fredrikstad. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["SEMINAR"], timeMode: "PERIOD", capacity: 42, requiresApproval: false, features: ["CATERING"], price: 633, priceUnit: "stk", city: "Fredrikstad", images: [] },
    { name: "Workshop: Fotografi", slug: "workshop-fotografi", description: "Spennende workshop i Oslo. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["WORKSHOP"], timeMode: "PERIOD", capacity: 48, requiresApproval: false, features: ["CATERING"], price: 1752, priceUnit: "stk", city: "Oslo", images: [] },
    { name: "Workshop: Musikk", slug: "workshop-musikk", description: "Spennende workshop i Stavanger. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["WORKSHOP"], timeMode: "PERIOD", capacity: 42, requiresApproval: false, features: ["CATERING"], price: 340, priceUnit: "stk", city: "Stavanger", images: [] },
    { name: "Seminar: Digital markedsføring", slug: "seminar-digital-markedsforing", description: "Spennende seminar i Drammen. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["SEMINAR"], timeMode: "PERIOD", capacity: 86, requiresApproval: false, features: ["CATERING"], price: 1920, priceUnit: "stk", city: "Drammen", images: [] },
    { name: "Seminar: Ledelse", slug: "seminar-ledelse", description: "Spennende seminar i Tromsø. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["SEMINAR"], timeMode: "PERIOD", capacity: 82, requiresApproval: false, features: ["CATERING", "STREAMING"], price: 1440, priceUnit: "stk", city: "Tromso", images: [] },
    { name: "Workshop: Kreativ skriving", slug: "workshop-kreativ-skriving", description: "Spennende workshop i Drammen. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["WORKSHOP"], timeMode: "PERIOD", capacity: 86, requiresApproval: false, features: ["CATERING"], price: 1269, priceUnit: "stk", city: "Drammen", images: [] },
    { name: "Seminar: Fotografi", slug: "seminar-fotografi", description: "Spennende seminar i Tromsø. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["SEMINAR"], timeMode: "PERIOD", capacity: 102, requiresApproval: false, features: ["CATERING"], price: 799, priceUnit: "stk", city: "Tromso", images: [] },
    { name: "Seminar: Musikk", slug: "seminar-musikk", description: "Spennende seminar i Oslo. Lær av erfarne eksperter og utvid dine ferdigheter.", categoryKey: "ARRANGEMENTER", subcategoryKeys: ["SEMINAR"], timeMode: "PERIOD", capacity: 58, requiresApproval: false, features: ["CATERING"], price: 485, priceUnit: "stk", city: "Oslo", images: [] },

    // ============================================================================
    // TORGET (12) - Equipment rental
    // ============================================================================
    { name: "Partytelt til leie - Fredrikstad (Dagsleie)", slug: "partytelt-fredrikstad", description: "Kvalitets partytelt tilgjengelig for leie i Fredrikstad. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["PARTYTELT"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 311, priceUnit: "dag", city: "Fredrikstad", images: [] },
    { name: "Lydanlegg til leie - Drammen (Dagsleie)", slug: "lydanlegg-drammen", description: "Kvalitets lydanlegg tilgjengelig for leie i Drammen. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["LYDANLEGG"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 254, priceUnit: "dag", city: "Drammen", images: [] },
    { name: "Projektor til leie - Bergen (Dagsleie)", slug: "projektor-bergen", description: "Kvalitets projektor tilgjengelig for leie i Bergen. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["PROJEKTOR"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING"], price: 1078, priceUnit: "dag", city: "Bergen", images: [] },
    { name: "Bord og stoler til leie - Kristiansand", slug: "bord-stoler-kristiansand", description: "Kvalitets bord og stoler tilgjengelig for leie i Kristiansand. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["BORD_OG_STOLER"], timeMode: "DAY", capacity: 50, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 1012, priceUnit: "dag", city: "Kristiansand", images: [] },
    { name: "Grill til leie - Trondheim", slug: "grill-trondheim", description: "Kvalitets grill tilgjengelig for leie i Trondheim. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["GRILL"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING"], price: 416, priceUnit: "dag", city: "Trondheim", images: [] },
    { name: "Telt til leie - Stavanger", slug: "telt-stavanger", description: "Kvalitets telt tilgjengelig for leie i Stavanger. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["TELT"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING"], price: 150, priceUnit: "dag", city: "Stavanger", images: [] },
    { name: "Partytelt til leie - Bergen (Dagsleie)", slug: "partytelt-bergen", description: "Kvalitets partytelt tilgjengelig for leie i Bergen. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["PARTYTELT"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 324, priceUnit: "dag", city: "Bergen", images: [] },
    { name: "Lydanlegg til leie - Tromsø (Dagsleie)", slug: "lydanlegg-tromso", description: "Kvalitets lydanlegg tilgjengelig for leie i Tromsø. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["LYDANLEGG"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 129, priceUnit: "dag", city: "Tromso", images: [] },
    { name: "Projektor til leie - Fredrikstad (Dagsleie)", slug: "projektor-fredrikstad", description: "Kvalitets projektor tilgjengelig for leie i Fredrikstad. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["PROJEKTOR"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING"], price: 826, priceUnit: "dag", city: "Fredrikstad", images: [] },
    { name: "Bord og stoler til leie - Drammen", slug: "bord-stoler-drammen", description: "Kvalitets bord og stoler tilgjengelig for leie i Drammen. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["BORD_OG_STOLER"], timeMode: "DAY", capacity: 50, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 861, priceUnit: "dag", city: "Drammen", images: [] },
    { name: "Grill til leie - Tromsø", slug: "grill-tromso", description: "Kvalitets grill tilgjengelig for leie i Tromsø. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["GRILL"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING"], price: 952, priceUnit: "dag", city: "Tromso", images: [] },
    { name: "Telt til leie - Trondheim", slug: "telt-trondheim", description: "Kvalitets telt tilgjengelig for leie i Trondheim. Perfekt for arrangementer og fester.", categoryKey: "TORGET", subcategoryKeys: ["TELT"], timeMode: "DAY", capacity: 1, requiresApproval: false, features: ["LEVERING", "MONTERING"], price: 200, priceUnit: "dag", city: "Trondheim", images: [] },
];

const MAIN_TENANT_ID = "pd73zbrk04k7tnmygstv3sbbyh80frae";

export const seedAll = mutation({
    args: {},
    handler: async (ctx) => {
        console.log(`Seeding ${SEED_RESOURCES.length} resources (Lovable V3)...`);

        const tenant = await ctx.db.query("tenants").filter((q) => q.eq(q.field("slug"), "skien")).first();
        if (!tenant) {
            throw new Error("Tenant 'skien' not found.");
        }
        const tenantId = tenant._id;

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
                pricing: { basePrice: r.price, currency: "NOK", unit: r.priceUnit },
                metadata: { city: r.city },
            });
            created++;
        }

        // Update tenant categories
        await ctx.db.patch(tenantId, {
            enabledCategories: ["LOKALER", "SPORT", "ARRANGEMENTER", "TORGET"],
        });

        // Seed categories
        const existingCats = await ctx.db.query("categories").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        for (const cat of existingCats) {
            await ctx.db.delete(cat._id);
        }

        for (const [key, cat] of Object.entries(CATEGORIES)) {
            const catId = await ctx.db.insert("categories", {
                tenantId,
                key: cat.key,
                name: cat.name,
                slug: cat.key.toLowerCase(),
                icon: cat.icon,
                isActive: true,
                settings: { label: cat.label },
            });

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
            }
        }

        const byCategory: Record<string, number> = {};
        for (const r of SEED_RESOURCES) {
            byCategory[r.categoryKey] = (byCategory[r.categoryKey] || 0) + 1;
        }

        console.log(`Created ${created} resources`);
        return { success: true, deleted: existing.length, created, byCategory };
    },
});

export const preview = mutation({
    args: {},
    handler: async () => {
        const byCategory: Record<string, number> = {};
        const bySubcategory: Record<string, number> = {};
        const byCity: Record<string, number> = {};

        for (const r of SEED_RESOURCES) {
            byCategory[r.categoryKey] = (byCategory[r.categoryKey] || 0) + 1;
            for (const sub of r.subcategoryKeys) {
                bySubcategory[sub] = (bySubcategory[sub] || 0) + 1;
            }
            byCity[r.city] = (byCity[r.city] || 0) + 1;
        }

        return { total: SEED_RESOURCES.length, byCategory, bySubcategory, byCity, categories: CATEGORIES };
    },
});
