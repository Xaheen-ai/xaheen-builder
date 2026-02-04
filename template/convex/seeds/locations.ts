/**
 * Location data for Norwegian cities
 */

export interface LocationDefinition {
    city: string;
    region: string;
    postalCode: string;
    lat: number;
    lng: number;
    streets: string[];
}

export const LOCATIONS: Record<string, LocationDefinition> = {
    Tromso: {
        city: "Tromsø",
        region: "Troms og Finnmark",
        postalCode: "9008",
        lat: 69.6496,
        lng: 18.956,
        streets: ["Storgata", "Sjøgata", "Grønnegata", "Kirkegata", "Vestregata"],
    },
    Trondheim: {
        city: "Trondheim",
        region: "Trøndelag",
        postalCode: "7010",
        lat: 63.4305,
        lng: 10.3951,
        streets: ["Munkegata", "Nordre gate", "Olav Tryggvasons gate", "Kongens gate", "Dronningens gate"],
    },
    Bergen: {
        city: "Bergen",
        region: "Vestland",
        postalCode: "5003",
        lat: 60.3913,
        lng: 5.3221,
        streets: ["Torgallmenningen", "Strandgaten", "Kong Oscars gate", "Marken", "Nygårdsgaten"],
    },
    Kristiansand: {
        city: "Kristiansand",
        region: "Agder",
        postalCode: "4608",
        lat: 58.1599,
        lng: 8.0182,
        streets: ["Markens gate", "Dronningens gate", "Vestre Strandgate", "Tollbodgata", "Kirkegata"],
    },
    Oslo: {
        city: "Oslo",
        region: "Oslo",
        postalCode: "0150",
        lat: 59.9139,
        lng: 10.7522,
        streets: ["Karl Johans gate", "Storgata", "Grensen", "Torggata", "Akersgata"],
    },
    Stavanger: {
        city: "Stavanger",
        region: "Rogaland",
        postalCode: "4006",
        lat: 58.97,
        lng: 5.7331,
        streets: ["Klubbgata", "Kirkegata", "Øvre Holmegate", "Skagen", "Breigata"],
    },
    Fredrikstad: {
        city: "Fredrikstad",
        region: "Viken",
        postalCode: "1606",
        lat: 59.2181,
        lng: 10.9298,
        streets: ["Storgata", "Nygaardsgata", "Ferjestedsveien", "Glommengata", "Torggata"],
    },
    Drammen: {
        city: "Drammen",
        region: "Viken",
        postalCode: "3015",
        lat: 59.7441,
        lng: 10.2045,
        streets: ["Bragernes Torg", "Nedre Storgate", "Øvre Storgate", "Grønland", "Tollbugata"],
    },
    Skien: {
        city: "Skien",
        region: "Vestfold og Telemark",
        postalCode: "3724",
        lat: 59.2086,
        lng: 9.6089,
        streets: ["Landmannstorget", "Hesselbergs gate", "Kongensgate", "Telemarksgata", "Lundegata"],
    },
    Porsgrunn: {
        city: "Porsgrunn",
        region: "Vestfold og Telemark",
        postalCode: "3901",
        lat: 59.1405,
        lng: 9.6569,
        streets: ["Storgata", "Jernbanegata", "Skolegata", "Kirkegata", "Havnegata"],
    },
};

export function getAddress(cityKey: string, index: number): string {
    const location = LOCATIONS[cityKey] || LOCATIONS.Oslo;
    const street = location.streets[index % location.streets.length];
    const number = ((index * 7 + 1) % 100) + 1;
    return `${street} ${number}`;
}

export function getLocation(cityKey: string): LocationDefinition {
    return LOCATIONS[cityKey] || LOCATIONS.Oslo;
}
