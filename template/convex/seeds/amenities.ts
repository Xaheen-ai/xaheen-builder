/**
 * Amenities/Facilities definitions
 */

export interface AmenityDefinition {
    key: string;
    name: string;
    icon: string;
}

export const AMENITIES: Record<string, AmenityDefinition> = {
    WIFI: { key: "WIFI", name: "WiFi", icon: "wifi" },
    PARKERING: { key: "PARKERING", name: "Parkering", icon: "local_parking" },
    GARDEROBER: { key: "GARDEROBER", name: "Garderober", icon: "checkroom" },
    KJOKKEN: { key: "KJOKKEN", name: "Kjøkken", icon: "kitchen" },
    SCENE: { key: "SCENE", name: "Scene", icon: "theater_comedy" },
    DUSJ: { key: "DUSJ", name: "Dusj", icon: "shower" },
    UTSTYRSLAN: { key: "UTSTYRSLAN", name: "Utstyrslån", icon: "sports_tennis" },
    KIOSK: { key: "KIOSK", name: "Kiosk", icon: "storefront" },
    CATERING: { key: "CATERING", name: "Catering tilgjengelig", icon: "restaurant" },
    STREAMING: { key: "STREAMING", name: "Streaming", icon: "videocam" },
    LEVERING: { key: "LEVERING", name: "Levering", icon: "local_shipping" },
    MONTERING: { key: "MONTERING", name: "Montering", icon: "build" },
    RULLESTOL: { key: "RULLESTOL", name: "Rullestoltilgang", icon: "accessible" },
    HEIS: { key: "HEIS", name: "Heis", icon: "elevator" },
    PROJEKTOR: { key: "PROJEKTOR", name: "Projektor", icon: "videocam" },
    WHITEBOARD: { key: "WHITEBOARD", name: "Whiteboard", icon: "edit" },
    VIDEOKONFERANSE: { key: "VIDEOKONFERANSE", name: "Videokonferanse", icon: "video_call" },
};

// Amenity sets for different resource types
export const AMENITY_SETS = {
    MOTEROM: ["WIFI", "PARKERING", "PROJEKTOR", "WHITEBOARD", "VIDEOKONFERANSE"],
    SELSKAPSLOKALE: ["WIFI", "PARKERING", "KJOKKEN", "CATERING", "SCENE"],
    GYMSAL: ["PARKERING", "GARDEROBER", "DUSJ"],
    KULTURARENA: ["WIFI", "PARKERING", "GARDEROBER", "SCENE", "KIOSK"],
    KONFERANSEROM: ["WIFI", "PARKERING", "PROJEKTOR", "STREAMING", "CATERING"],
    SPORT: ["PARKERING", "GARDEROBER", "DUSJ", "UTSTYRSLAN"],
    EQUIPMENT: ["LEVERING", "MONTERING"],
};
