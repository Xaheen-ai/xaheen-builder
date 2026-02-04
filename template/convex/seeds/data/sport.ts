/**
 * Seed data for SPORT category
 * Subcategories: Padel, Squash, Tennis, Cageball, Badminton
 */

import type { OpeningHoursSeed, ResourceSeed } from "../types";

const SPORT_OPENING_HOURS: OpeningHoursSeed[] = [
    { day: "Søndag", dayIndex: 0, open: "08:00", close: "20:00", isClosed: false },
    { day: "Mandag", dayIndex: 1, open: "06:00", close: "22:00", isClosed: false },
    { day: "Tirsdag", dayIndex: 2, open: "06:00", close: "22:00", isClosed: false },
    { day: "Onsdag", dayIndex: 3, open: "06:00", close: "22:00", isClosed: false },
    { day: "Torsdag", dayIndex: 4, open: "06:00", close: "22:00", isClosed: false },
    { day: "Fredag", dayIndex: 5, open: "06:00", close: "22:00", isClosed: false },
    { day: "Lørdag", dayIndex: 6, open: "08:00", close: "20:00", isClosed: false },
];

const SPORT_EVENTS = [
    {
        title: "Fast trening - IL Sportsklubb",
        description: "Ukentlig trening for medlemmer",
        startDate: "2026-02-10",
        startTime: "18:00",
        endTime: "20:00",
        isRecurring: true,
        organizer: "IL Sportsklubb",
        status: "upcoming" as const,
    },
    {
        title: "Bedriftsturnering",
        description: "Turnering for bedriftslag i regionen",
        startDate: "2026-03-05",
        startTime: "09:00",
        endTime: "17:00",
        organizer: "Bedriftsidrettslaget",
        status: "upcoming" as const,
    },
    {
        title: "Nybegynnerkurs",
        description: "Introduksjonskurs for nybegynnere",
        startDate: "2026-01-22",
        startTime: "10:00",
        endTime: "12:00",
        organizer: "Sportsklubben",
        status: "past" as const,
    },
];

export const SPORT_RESOURCES: ResourceSeed[] = [
    // Padel (3)
    {
        name: "Padelbane 1 - Bergen",
        slug: "padelbane-1-bergen",
        description: "Profesjonell padelbane i Bergen. Moderne fasiliteter og godt vedlikehold. Utstyr kan leies.",
        categoryKey: "SPORT",
        subcategoryKeys: ["PADEL"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ", "UTSTYRSLAN", "PARKERING"],
        price: 218,
        priceUnit: "time",
        cityKey: "Bergen",
        contactEmail: "sport@bergen.kommune.no",
        contactPhone: "+47 553 65 100",
        contactName: "Idrettsavdelingen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Innendørssko påkrevd",
                content: "Det er kun tillatt å bruke rene innendørssko på padelbanen. Sko med mørke såler er ikke tillatt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1,5 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Racketer og baller skal legges tilbake i utstyrsskapet etter bruk. Eventuelt søppel kastes i angitte beholdere.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, vi tilbyr utleie av padelracketer og baller i resepsjonen. Racketleie koster 50 kr per time.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Ja, det er gratis parkering rett utenfor hallen med plass til ca. 30 biler.",
            },
        ],
        events: SPORT_EVENTS,
        allowSeasonRental: true,
        allowRecurringBooking: true,
    },
    {
        name: "Padelbane 2 - Oslo",
        slug: "padelbane-2-oslo",
        description: "Profesjonell padelbane i Oslo sentrum. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["PADEL"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ"],
        price: 270,
        priceUnit: "time",
        cityKey: "Oslo",
        contactEmail: "sport@oslo.kommune.no",
        contactPhone: "+47 234 12 800",
        contactName: "Sportshallen Oslo",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Innendørssko påkrevd",
                content: "Det er kun tillatt å bruke rene innendørssko på padelbanen. Sko med mørke såler er ikke tillatt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1,5 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Racketer og baller skal legges tilbake på angitt plass etter bruk. Hold banen ryddig for neste spiller.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Nei, denne banen tilbyr ikke utleie av utstyr. Du må ta med egen racket og baller.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Nei, det er ikke egen parkering ved hallen. Vi anbefaler offentlig transport eller sykkel. Nærmeste offentlige parkering er ca. 5 minutters gange.",
            },
        ],
        events: SPORT_EVENTS,
    },
    {
        name: "Padelbane 3 - Drammen",
        slug: "padelbane-3-drammen",
        description: "Profesjonell padelbane i Drammen. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["PADEL"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "PARKERING"],
        price: 331,
        priceUnit: "time",
        cityKey: "Drammen",
        contactEmail: "sport@drammen.kommune.no",
        contactPhone: "+47 322 04 500",
        contactName: "Idrettsavdelingen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Innendørssko påkrevd",
                content: "Det er kun tillatt å bruke rene innendørssko på padelbanen. Sko med mørke såler er ikke tillatt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1,5 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Racketer skal henges opp etter bruk. Baller samles i kurven ved nettet. Tørk av banen ved behov.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Nei, denne banen tilbyr ikke utleie av utstyr. Du må ta med egen racket og baller.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Vi har garderober tilgjengelig, men det er dessverre ikke dusj ved denne banen.",
            },
            {
                question: "Er det parkering?",
                answer: "Ja, det er gratis parkering rett utenfor hallen med god kapasitet.",
            },
        ],
        events: SPORT_EVENTS,
    },

    // Squash (2)
    {
        name: "Squashbane 1 - Kristiansand",
        slug: "squashbane-1-kristiansand",
        description: "Profesjonell squashbane i Kristiansand. Moderne fasiliteter og godt vedlikehold. Racket kan leies.",
        categoryKey: "SPORT",
        subcategoryKeys: ["SQUASH"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"],
        price: 255,
        priceUnit: "time",
        cityKey: "Kristiansand",
        contactEmail: "sport@kristiansand.kommune.no",
        contactPhone: "+47 381 07 500",
        contactName: "Sportshallen Kristiansand",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko med lyse såler er tillatt på squashbanen. Dette er viktig for å bevare banens overflate.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Squashracketer og baller skal returneres til utstyrsrommet etter bruk. Tørk av vegger med klut ved synlige merker.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, vi tilbyr utleie av squashracketer og baller i resepsjonen. Racketleie koster 40 kr per time.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Nei, det er ikke egen parkering ved hallen. Nærmeste offentlige parkeringsplass ligger ca. 3 minutters gange unna.",
            },
        ],
        events: SPORT_EVENTS,
    },
    {
        name: "Squashbane 2 - Trondheim",
        slug: "squashbane-2-trondheim",
        description: "Profesjonell squashbane i Trondheim. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["SQUASH"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"],
        price: 370,
        priceUnit: "time",
        cityKey: "Trondheim",
        contactEmail: "sport@trondheim.kommune.no",
        contactPhone: "+47 726 54 300",
        contactName: "Idrettsavdelingen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko med lyse såler er tillatt på squashbanen. Sko som setter merker på gulvet er forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Racketer og baller skal returneres til utstyrsrommet. Sørg for at banen er ryddig for neste spiller.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, vi tilbyr utleie av squashracketer og baller. Kontakt resepsjonen ved ankomst for utleie.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Nei, det er ikke egen parkering ved hallen. Vi anbefaler buss eller trikk til nærmeste holdeplass.",
            },
        ],
        events: SPORT_EVENTS,
    },

    // Tennis (1)
    {
        name: "Tennisbane 1 - Tromsø",
        slug: "tennisbane-1-tromso",
        description: "Profesjonell tennisbane i Tromsø. Innendørs bane med godt underlag. Racket kan leies.",
        categoryKey: "SPORT",
        subcategoryKeys: ["TENNIS"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ", "UTSTYRSLAN", "PARKERING"],
        price: 248,
        priceUnit: "time",
        cityKey: "Tromso",
        contactEmail: "sport@tromso.kommune.no",
        contactPhone: "+47 776 90 200",
        contactName: "Sportshallen Tromsø",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Innendørssko påkrevd",
                content: "Kun rene innendørssko er tillatt på tennisbanen. Utendørssko og sko med mørke såler er forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 2 timer spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Tennisracketer skal returneres til utstyrsrommet. Baller samles i kurven ved nettet. Netthøyden skal ikke justeres.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, vi tilbyr utleie av tennisracketer og baller i resepsjonen. Racketleie koster 60 kr per time.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Ja, det er gratis parkering rett utenfor hallen. Parkeringsplassen har plass til ca. 20 biler.",
            },
        ],
        events: SPORT_EVENTS,
    },

    // Cageball (5)
    {
        name: "Cageballbane 1 - Bergen",
        slug: "cageballbane-1-bergen",
        description: "Profesjonell cageballbane i Bergen. Moderne fasiliteter og godt vedlikehold. Book din tid nå!",
        categoryKey: "SPORT",
        subcategoryKeys: ["CAGEBALL"],
        timeMode: "SLOT",
        capacity: 10,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ", "UTSTYRSLAN", "PARKERING"],
        price: 472,
        priceUnit: "time",
        cityKey: "Bergen",
        contactEmail: "sport@bergen.kommune.no",
        contactPhone: "+47 553 65 200",
        contactName: "Idrettsavdelingen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko er tillatt på cageballbanen. Knottsko og piggsko er strengt forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Baller skal returneres til ballkurven etter bruk. Eventuelt vester og kjegler legges tilbake i utstyrsboden.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, baller og vester kan lånes gratis i resepsjonen. Vi har også kjegler til utlån for trening.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Ja, det er gratis parkering rett utenfor hallen med god kapasitet.",
            },
        ],
        events: SPORT_EVENTS,
    },
    {
        name: "Cageballbane 2 - Bergen",
        slug: "cageballbane-2-bergen",
        description: "Profesjonell cageballbane i Bergen sentrum. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["CAGEBALL"],
        timeMode: "SLOT",
        capacity: 10,
        requiresApproval: false,
        amenities: ["GARDEROBER", "PARKERING"],
        price: 518,
        priceUnit: "time",
        cityKey: "Bergen",
        contactEmail: "sport@bergen.kommune.no",
        contactPhone: "+47 553 65 210",
        contactName: "Sportshallen Bergen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko er tillatt på cageballbanen. Knottsko og piggsko er strengt forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Baller skal returneres til ballkurven etter bruk. Sørg for at banen er klar for neste lag.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Nei, denne banen tilbyr ikke utleie av utstyr. Du må ta med egen ball.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Vi har garderober tilgjengelig, men det er dessverre ikke dusj ved denne banen.",
            },
            {
                question: "Er det parkering?",
                answer: "Ja, det er gratis parkering rett utenfor hallen med plass til ca. 25 biler.",
            },
        ],
        events: SPORT_EVENTS,
    },
    {
        name: "Cageballbane 3 - Stavanger",
        slug: "cageballbane-3-stavanger",
        description: "Profesjonell cageballbane i Stavanger. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["CAGEBALL"],
        timeMode: "SLOT",
        capacity: 10,
        requiresApproval: false,
        amenities: ["GARDEROBER", "PARKERING"],
        price: 270,
        priceUnit: "time",
        cityKey: "Stavanger",
        contactEmail: "sport@stavanger.kommune.no",
        contactPhone: "+47 515 08 700",
        contactName: "Idrettsavdelingen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko er tillatt på cageballbanen. Knottsko og piggsko er strengt forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Baller skal returneres til ballkurven ved utgangen etter bruk. Hold banen fri for søppel.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Nei, denne banen tilbyr ikke utleie av utstyr. Du må ta med egen ball.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Vi har garderober tilgjengelig, men det er dessverre ikke dusj ved denne banen.",
            },
            {
                question: "Er det parkering?",
                answer: "Ja, det er gratis parkering rett utenfor hallen med god kapasitet.",
            },
        ],
        events: SPORT_EVENTS,
    },
    {
        name: "Cageballbane 4 - Drammen",
        slug: "cageballbane-4-drammen",
        description: "Profesjonell cageballbane i Drammen. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["CAGEBALL"],
        timeMode: "SLOT",
        capacity: 10,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ"],
        price: 468,
        priceUnit: "time",
        cityKey: "Drammen",
        contactEmail: "sport@drammen.kommune.no",
        contactPhone: "+47 322 04 600",
        contactName: "Sportshallen Drammen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko er tillatt på cageballbanen. Knottsko og piggsko er strengt forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Baller skal returneres til ballkurven etter bruk. Eventuelt søppel kastes i angitte beholdere.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Nei, denne banen tilbyr ikke utleie av utstyr. Du må ta med egen ball.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Nei, det er ikke egen parkering ved hallen. Nærmeste offentlige parkeringsplass ligger ca. 5 minutters gange unna.",
            },
        ],
        events: SPORT_EVENTS,
    },
    {
        name: "Cageballbane 5 - Tromsø",
        slug: "cageballbane-5-tromso",
        description: "Profesjonell cageballbane i Tromsø. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["CAGEBALL"],
        timeMode: "SLOT",
        capacity: 10,
        requiresApproval: false,
        amenities: ["GARDEROBER", "DUSJ", "UTSTYRSLAN"],
        price: 275,
        priceUnit: "time",
        cityKey: "Tromso",
        contactEmail: "sport@tromso.kommune.no",
        contactPhone: "+47 776 90 300",
        contactName: "Idrettsavdelingen",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Sportsko påkrevd",
                content: "Kun rene sportsko er tillatt på cageballbanen. Knottsko og piggsko er strengt forbudt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Baller og vester skal returneres til utstyrsboden etter bruk. Sørg for at banen er klar for neste lag.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, baller og vester kan lånes gratis i resepsjonen. Kontakt personalet ved ankomst.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Ja, vi har garderober med dusj tilgjengelig for alle spillere. Husk å ta med eget håndkle.",
            },
            {
                question: "Er det parkering?",
                answer: "Nei, det er ikke egen parkering ved hallen. Vi anbefaler buss til nærmeste holdeplass.",
            },
        ],
        events: SPORT_EVENTS,
    },

    // Badminton (1)
    {
        name: "Badmintonbane 1 - Tromsø",
        slug: "badmintonbane-1-tromso",
        description: "Profesjonell badmintonbane i Tromsø. Moderne fasiliteter og godt vedlikehold.",
        categoryKey: "SPORT",
        subcategoryKeys: ["BADMINTON"],
        timeMode: "SLOT",
        capacity: 4,
        requiresApproval: false,
        amenities: ["GARDEROBER", "UTSTYRSLAN"],
        price: 447,
        priceUnit: "time",
        cityKey: "Tromso",
        contactEmail: "sport@tromso.kommune.no",
        contactPhone: "+47 776 90 400",
        contactName: "Sportshallen Tromsø",
        openingHours: SPORT_OPENING_HOURS,
        rules: [
            {
                title: "Innendørssko påkrevd",
                content: "Kun rene innendørssko er tillatt på badmintonbanen. Sko med mørke såler er ikke tillatt.",
                category: "safety",
            },
            {
                title: "Maks spilletid per booking",
                content: "Hver booking gir rett til maks 1,5 time spilletid. Forlengelse kan bestilles om banen er ledig.",
                category: "general",
            },
            {
                title: "Rydd utstyr etter bruk",
                content: "Badmintonracketer og baller skal returneres til utstyrsrommet. Nettet skal ikke justeres eller demonteres.",
                category: "cleaning",
            },
            {
                title: "Avbestilling senest 24 timer før",
                content: "Avbestilling må skje senest 24 timer før bookingens starttid. Ved for sen avbestilling belastes full pris.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Kan jeg leie utstyr?",
                answer: "Ja, vi tilbyr utleie av badmintonracketer og baller i resepsjonen. Racketleie koster 30 kr per time.",
            },
            {
                question: "Er det garderober og dusj?",
                answer: "Vi har garderober tilgjengelig, men det er dessverre ikke dusj ved denne banen.",
            },
            {
                question: "Er det parkering?",
                answer: "Nei, det er ikke egen parkering ved hallen. Nærmeste offentlige parkeringsplass ligger ca. 4 minutters gange unna.",
            },
        ],
        events: SPORT_EVENTS,
    },
];
