import { mutation } from "./_generated/server";

// 70 resources with subcategories - Norwegian demo data
const SEED_RESOURCES = [
    { name: "Ibsenhuset Hovedsal", slug: "ibsenhuset-hovedsal", description: "Stor hovedsal for kulturarrangementer med 500 plasser", categoryKey: "LOKALER", subcategoryKeys: ["KULTURHUS", "KONSERTSAL"], timeMode: "PERIOD", capacity: 500, requiresApproval: true, images: [{ url: "/seed-images/024053.jpg", alt: "Ibsenhuset Hovedsal", isPrimary: true }] },
    { name: "Skienshallen", slug: "skienshallen", description: "Moderne idrettshall for håndball, basketball og arrangement", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL", "TRENINGSLOKALE"], timeMode: "PERIOD", capacity: 2000, requiresApproval: true, images: [] },
    { name: "Skien Bibliotek - Møterom", slug: "skien-bibliotek-moterom", description: "Møterom i biblioteket for arrangementer og møter", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM", "BIBLIOTEK"], timeMode: "SLOT", capacity: 30, requiresApproval: false, images: [] },
    { name: "Gulset Grendehus", slug: "gulset-grendehus", description: "Tradisjonelt grendehus for lokale arrangementer", categoryKey: "LOKALER", subcategoryKeys: ["GRENDEHUS", "FESTLOKALE"], timeMode: "DAY", capacity: 100, requiresApproval: false, images: [] },
    { name: "Porsgrunn Svømmehall", slug: "porsgrunn-svommehall", description: "Moderne svømmeanlegg med flere bassenger", categoryKey: "SPORT", subcategoryKeys: ["SVOMMEHALL", "VANNAKTIVITETER"], timeMode: "SLOT", capacity: 200, requiresApproval: true, images: [] },
    { name: "Brevik Torg - Markedsplass", slug: "brevik-torg-markedsplass", description: "Sentral markedsplass for torghandel og arrangementer", categoryKey: "TORG", subcategoryKeys: ["MARKEDSPLASS", "UTEOMRADE"], timeMode: "DAY", capacity: 500, requiresApproval: true, images: [] },
    { name: "Kulturhuset Scene", slug: "kulturhuset-scene", description: "Profesjonell scene med lyd og lys", categoryKey: "ARRANGEMENT", subcategoryKeys: ["SCENE", "KONSERT"], timeMode: "PERIOD", capacity: 800, requiresApproval: true, images: [] },
    { name: "Telemark Idrettspark Kunstgressbane", slug: "telemark-idrettspark-kunstgress", description: "FIFA-godkjent kunstgressbane for fotball", categoryKey: "SPORT", subcategoryKeys: ["FOTBALLBANE", "KUNSTGRESS"], timeMode: "PERIOD", capacity: 30, requiresApproval: false, images: [] },
    { name: "Menstad Grendehus", slug: "menstad-grendehus", description: "Koselig grendehus på Menstad", categoryKey: "LOKALER", subcategoryKeys: ["GRENDEHUS"], timeMode: "DAY", capacity: 80, requiresApproval: false, images: [] },
    { name: "Borgestad Idrettshall", slug: "borgestad-idrettshall", description: "Lokal idrettshall for trening og kamper", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 500, requiresApproval: true, images: [] },
    { name: "Skien Sentrum Torg", slug: "skien-sentrum-torg", description: "Hovedtorget i Skien sentrum", categoryKey: "TORG", subcategoryKeys: ["MARKEDSPLASS", "FESTIVALPLASS"], timeMode: "DAY", capacity: 2000, requiresApproval: true, images: [] },
    { name: "Herkules Samfunnshus", slug: "herkules-samfunnshus", description: "Historisk samfunnshus med stor kapasitet", categoryKey: "LOKALER", subcategoryKeys: ["SAMFUNNSHUS", "FESTLOKALE"], timeMode: "DAY", capacity: 200, requiresApproval: true, images: [] },
    { name: "Klosterøya Øvingslokale", slug: "klosteroya-ovingslokale", description: "Øvingslokaler for musikk og teater", categoryKey: "LOKALER", subcategoryKeys: ["OVINGSLOKALE", "MUSIKKLOKALE"], timeMode: "SLOT", capacity: 20, requiresApproval: false, images: [] },
    { name: "Gjerpen Kirke Menighetshus", slug: "gjerpen-kirke-menighetshus", description: "Menighetshus tilknyttet Gjerpen Kirke", categoryKey: "LOKALER", subcategoryKeys: ["MENIGHETSHUS"], timeMode: "PERIOD", capacity: 150, requiresApproval: true, images: [] },
    { name: "Fritidsparken Skatepark", slug: "fritidsparken-skatepark", description: "Moderne skatepark for ungdom", categoryKey: "SPORT", subcategoryKeys: ["SKATEPARK", "AKTIVITETSOMRADE"], timeMode: "SLOT", capacity: 50, requiresApproval: false, images: [] },
    { name: "Lundedalen Aktivitetshus", slug: "lundedalen-aktivitetshus", description: "Aktivitetshus med flere rom og fasiliteter", categoryKey: "LOKALER", subcategoryKeys: ["AKTIVITETSHUS", "UNGDOMSKLUBB"], timeMode: "PERIOD", capacity: 100, requiresApproval: false, images: [] },
    { name: "Porsgrunn Kulturhus", slug: "porsgrunn-kulturhus", description: "Stort kulturhus med teatersal og utstillingsrom", categoryKey: "LOKALER", subcategoryKeys: ["KULTURHUS", "TEATER"], timeMode: "PERIOD", capacity: 400, requiresApproval: true, images: [] },
    { name: "Eidanger Bygdehus", slug: "eidanger-bygdehus", description: "Tradisjonelt bygdehus i Eidanger", categoryKey: "LOKALER", subcategoryKeys: ["BYGDEHUS", "GRENDEHUS"], timeMode: "DAY", capacity: 120, requiresApproval: false, images: [] },
    { name: "Bamble Ishall", slug: "bamble-ishall", description: "Ishall for hockey og skøyting", categoryKey: "SPORT", subcategoryKeys: ["ISHALL", "SKOYTEAKTIVITET"], timeMode: "PERIOD", capacity: 200, requiresApproval: true, images: [] },
    { name: "Stathelle Torg", slug: "stathelle-torg", description: "Sentralt torg i Stathelle", categoryKey: "TORG", subcategoryKeys: ["MARKEDSPLASS"], timeMode: "DAY", capacity: 300, requiresApproval: true, images: [] },
    { name: "Kilebygda Grendehus", slug: "kilebygda-grendehus", description: "Lokalt grendehus i Kilebygda", categoryKey: "LOKALER", subcategoryKeys: ["GRENDEHUS"], timeMode: "DAY", capacity: 60, requiresApproval: false, images: [] },
    { name: "Siljan Samfunnshus", slug: "siljan-samfunnshus", description: "Kommunalt samfunnshus i Siljan", categoryKey: "LOKALER", subcategoryKeys: ["SAMFUNNSHUS"], timeMode: "DAY", capacity: 150, requiresApproval: false, images: [] },
    { name: "Nome Kulturarena", slug: "nome-kulturarena", description: "Moderne kulturarena i Nome", categoryKey: "ARRANGEMENT", subcategoryKeys: ["KONSERTARENA", "TEATER"], timeMode: "PERIOD", capacity: 600, requiresApproval: true, images: [] },
    { name: "Solum Idrettspark", slug: "solum-idrettspark", description: "Idrettspark med flere baner", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSPARK", "FOTBALLBANE"], timeMode: "PERIOD", capacity: 100, requiresApproval: false, images: [] },
    { name: "Kragerø Brygge Festplass", slug: "kragero-brygge-festplass", description: "Festplass på brygga i Kragerø", categoryKey: "TORG", subcategoryKeys: ["FESTPLASS", "UTEOMRADE"], timeMode: "DAY", capacity: 1000, requiresApproval: true, images: [] },
    { name: "Drangedal Kulturhus", slug: "drangedal-kulturhus", description: "Kulturhus i Drangedal sentrum", categoryKey: "LOKALER", subcategoryKeys: ["KULTURHUS"], timeMode: "PERIOD", capacity: 250, requiresApproval: true, images: [] },
    { name: "Notodden Teater", slug: "notodden-teater", description: "Historisk teater i Notodden", categoryKey: "ARRANGEMENT", subcategoryKeys: ["TEATER", "KONSERTSAL"], timeMode: "PERIOD", capacity: 350, requiresApproval: true, images: [] },
    { name: "Rjukan Idrettshall", slug: "rjukan-idrettshall", description: "Stor idrettshall i Rjukan", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 400, requiresApproval: true, images: [] },
    { name: "Tinn Ungdomshus", slug: "tinn-ungdomshus", description: "Ungdomshus i Tinn kommune", categoryKey: "LOKALER", subcategoryKeys: ["UNGDOMSHUS", "AKTIVITETSHUS"], timeMode: "PERIOD", capacity: 80, requiresApproval: false, images: [] },
    { name: "Seljord Torg", slug: "seljord-torg", description: "Sentralt torg i Seljord", categoryKey: "TORG", subcategoryKeys: ["MARKEDSPLASS"], timeMode: "DAY", capacity: 400, requiresApproval: true, images: [] },
    { name: "Bø Sommarland Arena", slug: "bo-sommarland-arena", description: "Stor utendørs arena ved Sommarland", categoryKey: "ARRANGEMENT", subcategoryKeys: ["KONSERTARENA", "FESTIVALPLASS"], timeMode: "DAY", capacity: 5000, requiresApproval: true, images: [] },
    { name: "Kviteseid Bygdehus", slug: "kviteseid-bygdehus", description: "Tradisjonelt bygdehus", categoryKey: "LOKALER", subcategoryKeys: ["BYGDEHUS"], timeMode: "DAY", capacity: 100, requiresApproval: false, images: [] },
    { name: "Fyresdal Idrettsanlegg", slug: "fyresdal-idrettsanlegg", description: "Komplett idrettsanlegg", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSANLEGG"], timeMode: "PERIOD", capacity: 200, requiresApproval: false, images: [] },
    { name: "Vinje Kulturhus", slug: "vinje-kulturhus", description: "Kulturhus i Vinje", categoryKey: "LOKALER", subcategoryKeys: ["KULTURHUS"], timeMode: "PERIOD", capacity: 200, requiresApproval: true, images: [] },
    { name: "Tokke Samfunnshus", slug: "tokke-samfunnshus", description: "Kommunalt samfunnshus", categoryKey: "LOKALER", subcategoryKeys: ["SAMFUNNSHUS"], timeMode: "DAY", capacity: 120, requiresApproval: false, images: [] },
    { name: "Hjartdal Grendehus", slug: "hjartdal-grendehus", description: "Lite grendehus", categoryKey: "LOKALER", subcategoryKeys: ["GRENDEHUS"], timeMode: "DAY", capacity: 70, requiresApproval: false, images: [] },
    { name: "Sauherad Idrettsplass", slug: "sauherad-idrettsplass", description: "Lokal idrettsplass", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSPLASS", "FOTBALLBANE"], timeMode: "PERIOD", capacity: 50, requiresApproval: false, images: [] },
    { name: "Lunde Aktivitetssenter", slug: "lunde-aktivitetssenter", description: "Moderne aktivitetssenter", categoryKey: "LOKALER", subcategoryKeys: ["AKTIVITETSSENTER"], timeMode: "PERIOD", capacity: 150, requiresApproval: false, images: [] },
    { name: "Heddal Stavkirke Festplass", slug: "heddal-stavkirke-festplass", description: "Festplass ved Heddal Stavkirke", categoryKey: "ARRANGEMENT", subcategoryKeys: ["FESTIVALPLASS", "UTEOMRADE"], timeMode: "DAY", capacity: 2000, requiresApproval: true, images: [] },
    { name: "Bø Gymsal", slug: "bo-gymsal", description: "Gymsal for trening", categoryKey: "SPORT", subcategoryKeys: ["GYMSAL", "TRENINGSLOKALE"], timeMode: "PERIOD", capacity: 100, requiresApproval: false, images: [] },
    { name: "Akkerhaugen Brygge", slug: "akkerhaugen-brygge", description: "Historisk brygge", categoryKey: "TORG", subcategoryKeys: ["BRYGGE", "UTEOMRADE"], timeMode: "DAY", capacity: 200, requiresApproval: true, images: [] },
    { name: "Ulefoss Hovedgård", slug: "ulefoss-hovedgard", description: "Historisk hovedgård for arrangementer", categoryKey: "ARRANGEMENT", subcategoryKeys: ["FESTLOKALE", "SELSKAPSLOKALE"], timeMode: "DAY", capacity: 100, requiresApproval: true, images: [] },
    { name: "Herre Gymsalbygg", slug: "herre-gymsalbygg", description: "Gymsalbygg på Herre", categoryKey: "SPORT", subcategoryKeys: ["GYMSAL"], timeMode: "PERIOD", capacity: 80, requiresApproval: false, images: [] },
    { name: "Skotfoss Åpent Rom", slug: "skotfoss-apent-rom", description: "Fleksibelt rom for møter", categoryKey: "LOKALER", subcategoryKeys: ["MOTEROM", "AKTIVITETSHUS"], timeMode: "SLOT", capacity: 40, requiresApproval: false, images: [] },
    { name: "Mæla Ungdomsskole Aula", slug: "maela-ungdomsskole-aula", description: "Skolens aula for arrangementer", categoryKey: "LOKALER", subcategoryKeys: ["AULA", "SKOLELOKALE"], timeMode: "PERIOD", capacity: 300, requiresApproval: true, images: [] },
    { name: "Gimsøy Kloster Ruiner", slug: "gimsoy-kloster-ruiner", description: "Historisk område for arrangementer", categoryKey: "ARRANGEMENT", subcategoryKeys: ["HISTORISK_STED", "UTEOMRADE"], timeMode: "DAY", capacity: 500, requiresApproval: true, images: [] },
    { name: "Ælvehovden Friluftsområde", slug: "aelvehovden-friluftsomrade", description: "Stort friluftsområde", categoryKey: "TORG", subcategoryKeys: ["FRILUFTSOMRADE", "AKTIVITETSOMRADE"], timeMode: "DAY", capacity: 1000, requiresApproval: true, images: [] },
    { name: "Porsgrunn Havnefront", slug: "porsgrunn-havnefront", description: "Attraktivt havneområde for arrangementer", categoryKey: "TORG", subcategoryKeys: ["HAVNEOMRADE", "MARKEDSPLASS"], timeMode: "DAY", capacity: 2000, requiresApproval: true, images: [] },
    { name: "Langesund Badeplass", slug: "langesund-badeplass", description: "Populær badeplass", categoryKey: "SPORT", subcategoryKeys: ["BADEPLASS", "UTEAKTIVITET"], timeMode: "DAY", capacity: 500, requiresApproval: false, images: [] },
    { name: "Knardalstrand Grendehus", slug: "knardalstrand-grendehus", description: "Grendehus ved Knardalstrand", categoryKey: "LOKALER", subcategoryKeys: ["GRENDEHUS"], timeMode: "DAY", capacity: 90, requiresApproval: false, images: [] },
    { name: "Frier Vest Konferansesenter", slug: "frier-vest-konferansesenter", description: "Moderne konferansesenter", categoryKey: "LOKALER", subcategoryKeys: ["KONFERANSESENTER", "MOTEROM"], timeMode: "PERIOD", capacity: 200, requiresApproval: true, images: [] },
    { name: "Herøya Aktivitetspark", slug: "heroya-aktivitetspark", description: "Aktivitetspark for alle aldre", categoryKey: "SPORT", subcategoryKeys: ["AKTIVITETSPARK", "LEKEPLASS"], timeMode: "SLOT", capacity: 100, requiresApproval: false, images: [] },
    { name: "Søndre Bydel Torg", slug: "sondre-bydel-torg", description: "Lokalt bydelstorg", categoryKey: "TORG", subcategoryKeys: ["BYDELSTORG"], timeMode: "DAY", capacity: 300, requiresApproval: true, images: [] },
    { name: "Nordre Bydel Samfunnshus", slug: "nordre-bydel-samfunnshus", description: "Samfunnshus i nordre bydel", categoryKey: "LOKALER", subcategoryKeys: ["SAMFUNNSHUS"], timeMode: "DAY", capacity: 180, requiresApproval: false, images: [] },
    { name: "Vestsiden Idretts- og Kulturpark", slug: "vestsiden-idretts-kulturpark", description: "Kombinert idretts- og kulturpark", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSPARK", "KULTURPARK"], timeMode: "PERIOD", capacity: 300, requiresApproval: true, images: [] },
    { name: "Håøya Båthavn", slug: "haoya-bathavn", description: "Småbåthavn med fasiliteter", categoryKey: "TORG", subcategoryKeys: ["BATHAVN", "MARITIMT_OMRADE"], timeMode: "DAY", capacity: 100, requiresApproval: true, images: [] },
    { name: "Telemarkshallen", slug: "telemarkshallen", description: "Stor flerbrukshall for idrett og messer", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL", "MESSEHALL"], timeMode: "PERIOD", capacity: 3000, requiresApproval: true, images: [] },
    { name: "Skien Fritidspark", slug: "skien-fritidspark", description: "Stor fritidspark med mange aktiviteter", categoryKey: "SPORT", subcategoryKeys: ["FRITIDSPARK", "AKTIVITETSOMRADE"], timeMode: "DAY", capacity: 500, requiresApproval: false, images: [] },
    { name: "Ibsen Amfi", slug: "ibsen-amfi", description: "Utendørs amfiteater for forestillinger", categoryKey: "ARRANGEMENT", subcategoryKeys: ["AMFITEATER", "UTEOMRADE"], timeMode: "PERIOD", capacity: 1500, requiresApproval: true, images: [] },
    { name: "Porsgrunn Studenthus", slug: "porsgrunn-studenthus", description: "Studenthus med festlokale", categoryKey: "LOKALER", subcategoryKeys: ["STUDENTHUS", "FESTLOKALE"], timeMode: "PERIOD", capacity: 250, requiresApproval: true, images: [] },
    { name: "Grenland Motorsportsenter", slug: "grenland-motorsportsenter", description: "Senter for motorsport", categoryKey: "SPORT", subcategoryKeys: ["MOTORSPORTSENTER", "RACINGBANE"], timeMode: "DAY", capacity: 1000, requiresApproval: true, images: [] },
    { name: "Brevik Kulturminneområde", slug: "brevik-kulturminneomrade", description: "Historisk område i Brevik", categoryKey: "ARRANGEMENT", subcategoryKeys: ["KULTURMINNE", "HISTORISK_OMRADE"], timeMode: "DAY", capacity: 300, requiresApproval: true, images: [] },
    { name: "Vallermyrene Friluftsområde", slug: "vallermyrene-friluftsomrade", description: "Naturområde for friluftsliv", categoryKey: "SPORT", subcategoryKeys: ["FRILUFTSOMRADE", "TUROMRADE"], timeMode: "DAY", capacity: 200, requiresApproval: false, images: [] },
    { name: "Porsgrunn Rådhus Festsal", slug: "porsgrunn-radhus-festsal", description: "Festsal i rådhuset", categoryKey: "LOKALER", subcategoryKeys: ["FESTSAL", "SELSKAPSLOKALE"], timeMode: "PERIOD", capacity: 150, requiresApproval: true, images: [] },
    { name: "Skien Rådhus Bystyresal", slug: "skien-radhus-bystyresal", description: "Bystyresal for møter og arrangementer", categoryKey: "LOKALER", subcategoryKeys: ["BYSTYRESAL", "MOTEROM"], timeMode: "PERIOD", capacity: 100, requiresApproval: true, images: [] },
    { name: "Gråtenmoen Flerbrukshall", slug: "gratenmoen-flerbrukshall", description: "Ny flerbrukshall på Gråtenmoen", categoryKey: "SPORT", subcategoryKeys: ["IDRETTSHALL"], timeMode: "PERIOD", capacity: 600, requiresApproval: true, images: [] },
    { name: "Osebakken Kulturkvartal", slug: "osebakken-kulturkvartal", description: "Kulturkvartal med flere lokaler", categoryKey: "LOKALER", subcategoryKeys: ["KULTURHUS", "KUNSTGALLERI"], timeMode: "PERIOD", capacity: 150, requiresApproval: true, images: [] },
    { name: "Bjørntvedt Gård Selskapslokale", slug: "bjorntvedt-gard-selskapslokale", description: "Historisk gård med selskapslokaler", categoryKey: "ARRANGEMENT", subcategoryKeys: ["SELSKAPSLOKALE", "FESTLOKALE"], timeMode: "DAY", capacity: 80, requiresApproval: true, images: [] },
    { name: "Klyve Tennishall", slug: "klyve-tennishall", description: "Innendørs tennishall", categoryKey: "SPORT", subcategoryKeys: ["TENNISHALL", "IDRETTSHALL"], timeMode: "SLOT", capacity: 30, requiresApproval: false, images: [] },
    { name: "Borgeåsen Friluftsområde", slug: "borgeasen-friluftsomrade", description: "Stort friluftsområde med turløyper", categoryKey: "TORG", subcategoryKeys: ["FRILUFTSOMRADE", "TUROMRADE"], timeMode: "DAY", capacity: 500, requiresApproval: false, images: [] },
];

// Run: npx convex run seedsFull:seedFromJson
export const seedFromJson = mutation({
    args: {},
    handler: async (ctx) => {
        console.log(`Seeding ${SEED_RESOURCES.length} resources with subcategories...`);

        // 1. Get or create tenant
        let tenant = await ctx.db.query("tenants").filter((q) => q.eq(q.field("slug"), "skien")).first();
        let tenantId = tenant?._id;
        if (!tenantId) {
            tenantId = await ctx.db.insert("tenants", {
                name: "Skien Kommune", slug: "skien", domain: "skien.digilist.no",
                settings: { locale: "nb-NO", timezone: "Europe/Oslo", currency: "NOK" },
                status: "active", seatLimits: {}, featureFlags: {}, enabledCategories: ["LOKALER", "SPORT", "ARRANGEMENT", "TORG"],
            });
        }

        // 2. Get or create organization
        let org = await ctx.db.query("organizations").filter((q) => q.eq(q.field("tenantId"), tenantId)).first();
        let orgId = org?._id;
        if (!orgId) {
            orgId = await ctx.db.insert("organizations", {
                tenantId, name: "Skien Kommune - Kultur og Fritid", slug: "kultur",
                description: "Kultur- og fritidsavdelingen", type: "municipality", status: "active", settings: {}, metadata: {},
            });
        }

        // 3. Seed resources
        let created = 0, skipped = 0;
        for (const r of SEED_RESOURCES) {
            const existing = await ctx.db.query("resources").filter((q) => q.eq(q.field("slug"), r.slug)).first();
            if (existing) { skipped++; continue; }
            await ctx.db.insert("resources", {
                tenantId, organizationId: orgId, name: r.name, slug: r.slug, description: r.description,
                categoryKey: r.categoryKey, subcategoryKeys: r.subcategoryKeys, timeMode: r.timeMode, features: [],
                status: "published", requiresApproval: r.requiresApproval, capacity: r.capacity, inventoryTotal: 1,
                images: r.images as any, pricing: { basePrice: 0, currency: "NOK" }, metadata: {},
            });
            created++;
        }

        // 4. Create users if needed
        const users = await ctx.db.query("users").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        let usersCreated = 0;
        if (users.length === 0) {
            for (const u of [
                { email: "admin@skien.kommune.no", name: "Admin Bruker", role: "admin" },
                { email: "saksbehandler@skien.kommune.no", name: "Saksbehandler", role: "manager" },
                { email: "bruker@skien.kommune.no", name: "Vanlig Bruker", role: "member" },
            ]) {
                await ctx.db.insert("users", { tenantId, organizationId: orgId, email: u.email, name: u.name, role: u.role, status: "active", metadata: {} });
                usersCreated++;
            }
        }

        // 5. Create demo tokens
        const tokens = await ctx.db.query("authDemoTokens").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        let tokensCreated = 0;
        if (tokens.length === 0) {
            const allUsers = await ctx.db.query("users").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
            const prefixes = ["DEMO_ADMIN_", "DEMO_MANAGER_", "DEMO_MEMBER_"];
            for (let i = 0; i < Math.min(allUsers.length, 3); i++) {
                await ctx.db.insert("authDemoTokens", {
                    key: `${prefixes[i]}001`, tenantId, organizationId: orgId, userId: allUsers[i]._id,
                    tokenHash: `hash_${prefixes[i]}001`, isActive: true,
                });
                tokensCreated++;
            }
        }

        // 6. Create categories hierarchy
        const cats = await ctx.db.query("categories").filter((q) => q.eq(q.field("tenantId"), tenantId)).collect();
        let catsCreated = 0;
        if (cats.length === 0) {
            const mainCats = [
                { key: "LOKALER", name: "Lokaler og Bygg", icon: "building" },
                { key: "SPORT", name: "Sport og Idrett", icon: "sports" },
                { key: "ARRANGEMENT", name: "Arrangement", icon: "event" },
                { key: "TORG", name: "Torg og Uteareal", icon: "park" },
            ];
            const catIds: Record<string, any> = {};
            for (const c of mainCats) {
                catIds[c.key] = await ctx.db.insert("categories", { tenantId, key: c.key, name: c.name, slug: c.key.toLowerCase(), icon: c.icon, isActive: true, settings: {} });
                catsCreated++;
            }
            const subs = [
                { p: "LOKALER", k: "GRENDEHUS", n: "Grendehus" }, { p: "LOKALER", k: "KULTURHUS", n: "Kulturhus" },
                { p: "LOKALER", k: "MOTEROM", n: "Møterom" }, { p: "LOKALER", k: "FESTLOKALE", n: "Festlokale" },
                { p: "SPORT", k: "IDRETTSHALL", n: "Idrettshall" }, { p: "SPORT", k: "FOTBALLBANE", n: "Fotballbane" },
                { p: "ARRANGEMENT", k: "SCENE", n: "Scene" }, { p: "ARRANGEMENT", k: "FESTIVALPLASS", n: "Festivalplass" },
                { p: "TORG", k: "MARKEDSPLASS", n: "Markedsplass" }, { p: "TORG", k: "UTEOMRADE", n: "Uteområde" },
            ];
            for (const s of subs) {
                await ctx.db.insert("categories", { tenantId, parentId: catIds[s.p], key: s.k, name: s.n, slug: s.k.toLowerCase(), isActive: true, settings: {} });
                catsCreated++;
            }
        }

        console.log(`Created: ${created} resources, ${usersCreated} users, ${tokensCreated} tokens, ${catsCreated} categories. Skipped: ${skipped}`);
        return { success: true, tenant: tenantId, organization: orgId, resources: { created, skipped, total: SEED_RESOURCES.length }, users: usersCreated, tokens: tokensCreated, categories: catsCreated };
    },
});
