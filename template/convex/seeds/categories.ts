/**
 * Category definitions matching Lovable/Digilist app
 */

export interface CategoryDefinition {
    key: string;
    name: string;
    label: string;
    icon: string;
    subcategories: Array<{ key: string; name: string }>;
}

export const CATEGORIES: Record<string, CategoryDefinition> = {
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

export const ENABLED_CATEGORIES = ["LOKALER", "SPORT", "ARRANGEMENTER", "TORGET"];
