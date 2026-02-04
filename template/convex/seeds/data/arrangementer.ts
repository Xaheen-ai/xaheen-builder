/**
 * Seed data for ARRANGEMENTER category
 * Subcategories: Kurs, Foredrag, Konsert, Workshop, Seminar
 */

import type { ResourceSeed } from "../types";

const ARRANGEMENTER_EVENTS = [
    {
        title: "Neste kursmodul",
        description: "Modul 2: Avanserte teknikker",
        startDate: "2026-02-17",
        startTime: "09:00",
        endTime: "16:00",
        organizer: "Kursavdelingen",
        status: "upcoming" as const,
    },
    {
        title: "Semesterstart",
        description: "Velkomstsamling for nye deltakere",
        startDate: "2026-02-24",
        startTime: "10:00",
        endTime: "12:00",
        organizer: "Administrasjonen",
        status: "upcoming" as const,
    },
    {
        title: "Avslutningssamling",
        description: "Sertifikatutdeling og networking",
        startDate: "2026-01-15",
        startTime: "14:00",
        endTime: "17:00",
        organizer: "Kursavdelingen",
        status: "past" as const,
    },
];

export const ARRANGEMENTER_RESOURCES: ResourceSeed[] = [
    // Kurs (1)
    {
        name: "Kurs: Digital markedsføring",
        slug: "kurs-digital-markedsforing",
        description: "Spennende kurs i digital markedsføring. Lær av erfarne eksperter og utvid dine ferdigheter. Inkluderer lunsj og materiell.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["KURS"],
        timeMode: "PERIOD",
        capacity: 25,
        requiresApproval: false,
        amenities: ["CATERING", "STREAMING", "WIFI"],
        price: 1267,
        priceUnit: "stk",
        cityKey: "Stavanger",
        contactEmail: "arrangement@stavanger.kommune.no",
        contactPhone: "+47 511 23 456",
        contactName: "Kursavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Full refusjon ved avbestilling inntil 7 dager før kursstart. Ved senere avbestilling refunderes ikke kursavgiften.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Kurset gjennomføres med minimum 8 deltakere. Ved for få påmeldte vil kurset bli avlyst og full refusjon gis.",
                category: "general",
            },
            {
                title: "Pensum og materiell",
                content: "Alt pensum, kursmateriell og digitale ressurser er inkludert i kursprisen. Deltakere får tilgang til læringsplattform i 6 måneder etter kursslutt.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Har du allergier, matintoleranser eller andre spesielle behov, vennligst meld fra ved påmelding eller senest 3 dager før kursstart.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, kursmateriell, digitale ressurser og tilgang til streaming av forelesninger i etterkant.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er parkering i nærheten av kurslokalet. Vi sender detaljert informasjon om parkering ved bekreftelse av påmelding.",
            },
            {
                question: "Får jeg kursbevis?",
                answer: "Ja, alle deltakere som gjennomfører kurset mottar et offisielt kursbevis som dokumenterer kompetansen.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Ja, kurset tilbyr streaming. Du kan følge forelesningene digitalt og få tilgang til opptak i etterkant.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },

    // Workshop (4)
    {
        name: "Workshop: Ledelse",
        slug: "workshop-ledelse",
        description: "Interaktiv workshop i ledelse. Lær av erfarne eksperter og utvid dine ferdigheter. Praktiske øvelser.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["WORKSHOP"],
        timeMode: "PERIOD",
        capacity: 29,
        requiresApproval: false,
        amenities: ["CATERING", "WIFI"],
        price: 1663,
        priceUnit: "stk",
        cityKey: "Drammen",
        contactEmail: "arrangement@drammen.kommune.no",
        contactPhone: "+47 321 45 678",
        contactName: "Arrangementavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Ved avbestilling inntil 7 dager før workshop-start gis full refusjon. Senere avbestillinger refunderes ikke.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Workshopen krever minimum 6 deltakere for gjennomføring. Ved for få påmeldte varsles deltakerne senest 5 dager i forveien.",
                category: "general",
            },
            {
                title: "Praktiske øvelser og utstyr",
                content: "Alt materiell og utstyr til praktiske øvelser er inkludert i prisen. Deltakere trenger kun å ta med seg selv.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Vennligst informer oss om eventuelle allergier eller spesielle behov ved påmelding, slik at vi kan tilrettelegge.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, materiell til praktiske øvelser og tilgang til digitale ressurser etter workshopen.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er offentlig parkering i nærheten av lokalet. Informasjon om parkering sendes ut i forkant.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, det utstedes ikke formelt kursbevis for denne workshopen, men du får en deltakerattest på forespørsel.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, denne workshopen er basert på praktiske øvelser og interaktivt samarbeid, og er derfor ikke tilgjengelig for streaming.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Workshop: Fotografi",
        slug: "workshop-fotografi",
        description: "Praktisk workshop i fotografi. Lær av profesjonelle fotografer. Ta med eget kamera.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["WORKSHOP"],
        timeMode: "PERIOD",
        capacity: 48,
        requiresApproval: false,
        amenities: ["CATERING", "WIFI"],
        price: 1752,
        priceUnit: "stk",
        cityKey: "Oslo",
        contactEmail: "arrangement@oslo.kommune.no",
        contactPhone: "+47 228 34 567",
        contactName: "Kulturavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Full refusjon ved avbestilling inntil 7 dager før workshopen starter. Avbestilling etter dette gir ikke rett til refusjon.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Workshopen gjennomføres med minimum 10 deltakere. Ved avlysning grunnet for få påmeldte gis full refusjon.",
                category: "general",
            },
            {
                title: "Utstyr til praktiske øvelser",
                content: "Grunnleggende fotoutstyr er tilgjengelig, men deltakere oppfordres til å ta med eget kamera. Alt øvrig materiell er inkludert i prisen.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Gi oss beskjed om allergier eller tilretteleggingsbehov senest 3 dager før workshopen, slik at vi kan tilpasse opplegget.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, tilgang til fotoutstyr under workshopen og digitalt materiell i etterkant.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er flere parkeringsmuligheter i nærheten. Vi anbefaler kollektivtransport da parkeringsplassene kan være begrenset.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, workshopen gir ikke formelt sertifikat, men du får praktisk erfaring og personlig veiledning fra profesjonelle fotografer.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, denne workshopen fokuserer på praktiske øvelser ute i felt og er ikke tilgjengelig for streaming.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Workshop: Musikk",
        slug: "workshop-musikk",
        description: "Kreativ workshop i musikkproduksjon. Lær av erfarne produsenter. Utstyr inkludert.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["WORKSHOP"],
        timeMode: "PERIOD",
        capacity: 42,
        requiresApproval: false,
        amenities: ["CATERING", "UTSTYRSLAN"],
        price: 340,
        priceUnit: "stk",
        cityKey: "Stavanger",
        contactEmail: "arrangement@stavanger.kommune.no",
        contactPhone: "+47 511 67 890",
        contactName: "Kulturavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Avbestilling inntil 7 dager før workshopen gir full refusjon. Ved senere avbestilling beholdes avgiften.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Det kreves minimum 8 påmeldte for gjennomføring av workshopen. Ved avlysning kontaktes deltakerne direkte.",
                category: "general",
            },
            {
                title: "Utstyr og praktiske øvelser",
                content: "Alt musikkutstyr og produksjonsverktøy til praktiske øvelser er inkludert i prisen via utstyrslån. Deltakere trenger ikke medbringe eget utstyr.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Meld fra om allergier eller spesielle behov ved påmelding. Vi ønsker å legge til rette for alle deltakere.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, lån av musikkutstyr og produksjonsverktøy, samt tilgang til digitale ressurser etter workshopen.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er parkering tilgjengelig i nærheten av lokalet. Detaljer sendes ved påmeldingsbekreftelse.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, det utstedes ikke formelt sertifikat for denne workshopen, men du får verdifull praktisk erfaring i musikkproduksjon.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, workshopen er praktisk orientert med hands-on øvelser og er ikke tilgjengelig for streaming.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Workshop: Kreativ skriving",
        slug: "workshop-kreativ-skriving",
        description: "Interaktiv workshop i kreativ skriving. Praktiske øvelser og personlig veiledning.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["WORKSHOP"],
        timeMode: "PERIOD",
        capacity: 86,
        requiresApproval: false,
        amenities: ["CATERING", "WIFI"],
        price: 1269,
        priceUnit: "stk",
        cityKey: "Drammen",
        contactEmail: "arrangement@drammen.kommune.no",
        contactPhone: "+47 321 78 901",
        contactName: "Arrangementavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Full refusjon gis ved avbestilling inntil 7 dager før workshopen. Etter dette tidspunktet refunderes ikke deltakeravgiften.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Workshopen gjennomføres med minimum 12 deltakere. Ved for få påmeldte avlyses arrangementet og full refusjon gis.",
                category: "general",
            },
            {
                title: "Materiell til praktiske øvelser",
                content: "Skrivemateriell, arbeidsbøker og digitale verktøy til praktiske øvelser er inkludert i prisen.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Dersom du har allergier eller behov for tilrettelegging, ber vi deg melde fra ved påmelding eller senest 3 dager i forveien.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, skrivemateriell, arbeidsbøker og tilgang til digitale skriveverkøy under workshopen.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det finnes parkering i nærheten av workshoplokalet. Nærmere informasjon sendes ved bekreftelse.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, workshopen gir ikke formelt sertifikat, men du får personlig tilbakemelding og veiledning på dine tekster.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, denne workshopen bygger på praktiske skriveøvelser og gruppediskusjoner, og er ikke tilgjengelig for streaming.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },

    // Seminar (5)
    {
        name: "Seminar: Kreativ skriving",
        slug: "seminar-kreativ-skriving",
        description: "Inspirerende seminar i kreativ skriving. Lær av erfarne forfattere og utvikle din stemme.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["SEMINAR"],
        timeMode: "PERIOD",
        capacity: 42,
        requiresApproval: false,
        amenities: ["CATERING", "WIFI"],
        price: 633,
        priceUnit: "stk",
        cityKey: "Fredrikstad",
        contactEmail: "arrangement@fredrikstad.kommune.no",
        contactPhone: "+47 691 23 456",
        contactName: "Kulturavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Full refusjon ved avbestilling inntil 7 dager før seminaret. Avbestilling etter fristen gir ikke rett til refusjon.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Seminaret gjennomføres med minimum 15 deltakere. Ved for få påmeldte avlyses seminaret og deltakerne refunderes.",
                category: "general",
            },
            {
                title: "Forelesere og materiell",
                content: "Alle forelesninger, presentasjoner og digitalt materiell fra foreleserne er inkludert i seminarprisen.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Opplys om allergier eller spesielle behov ved påmelding. Vi tilrettelegger gjerne for alle deltakere.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, presentasjonsmateriale fra foreleserne og tilgang til digitale ressurser etter seminaret.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er parkering tilgjengelig i nærheten av seminarlokalet. Informasjon sendes ut i forkant.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, det utstedes ikke formelt sertifikat for seminardeltakelse, men du får tilgang til alle forelesningsmaterialer.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, dette seminaret tilbyr ikke streaming. Vi anbefaler fysisk deltakelse for best utbytte av forelesningene.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Seminar: Digital markedsføring",
        slug: "seminar-digital-markedsforing",
        description: "Omfattende seminar i digital markedsføring. Lær de nyeste trendene og strategiene.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["SEMINAR"],
        timeMode: "PERIOD",
        capacity: 86,
        requiresApproval: false,
        amenities: ["CATERING", "STREAMING", "WIFI"],
        price: 1920,
        priceUnit: "stk",
        cityKey: "Drammen",
        contactEmail: "arrangement@drammen.kommune.no",
        contactPhone: "+47 321 56 789",
        contactName: "Arrangementavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Avbestilling inntil 7 dager før seminaret gir full refusjon av deltakeravgiften. Senere avbestillinger refunderes ikke.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Seminaret krever minimum 20 påmeldte for gjennomføring. Deltakere varsles senest 5 dager før ved eventuell avlysning.",
                category: "general",
            },
            {
                title: "Presentasjoner og forelesere",
                content: "Alt presentasjonsmateriell fra foreleserne og tilgang til digitale ressurser er inkludert i seminarprisen.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Vi ber deltakere med allergier eller spesielle behov om å melde fra ved påmelding, slik at vi kan sørge for god tilrettelegging.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, materiell fra foreleserne, og tilgang til streaming av presentasjonene i etterkant.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det finnes parkering i nærheten. Detaljert veibeskrivelse og parkeringsinformasjon sendes ved påmeldingsbekreftelse.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, seminaret gir ikke formelt sertifikat, men du får tilgang til alle presentasjoner og forelesningsmateriale.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Ja, seminaret tilbyr streaming. Du kan følge forelesningene digitalt og få tilgang til opptak i etterkant.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Seminar: Ledelse",
        slug: "seminar-ledelse",
        description: "Inspirerende seminar i moderne ledelse. Lær av erfarne ledere og eksperter.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["SEMINAR"],
        timeMode: "PERIOD",
        capacity: 82,
        requiresApproval: false,
        amenities: ["CATERING", "STREAMING", "WIFI"],
        price: 1440,
        priceUnit: "stk",
        cityKey: "Tromso",
        contactEmail: "arrangement@tromso.kommune.no",
        contactPhone: "+47 776 12 345",
        contactName: "Kulturavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Full refusjon gis ved avbestilling inntil 7 dager før seminarstart. Etter dette refunderes ikke deltakeravgiften.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Seminaret gjennomføres med minimum 15 deltakere. Ved avlysning på grunn av for få påmeldte gis full refusjon.",
                category: "general",
            },
            {
                title: "Forelesningsmateriale",
                content: "Presentasjoner, casestudier og digitalt materiale fra foreleserne er inkludert i seminarprisen og deles med deltakerne.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Deltakere med allergier eller spesielle behov bes melde fra ved påmelding. Vi sørger for tilrettelegging.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, forelesningsmateriale, casestudier og tilgang til streaming av presentasjonene.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er parkering i nærheten av seminarlokalet. Praktisk informasjon sendes ut i forkant av arrangementet.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, det utstedes ikke formelt sertifikat for seminardeltakelse, men du får tilgang til alle forelesningsmaterialer og casestudier.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Ja, seminaret strømmes live og opptak er tilgjengelig for deltakere i etterkant.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Seminar: Fotografi",
        slug: "seminar-fotografi",
        description: "Omfattende seminar i fotografi. Lær fra grunnleggende til avanserte teknikker.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["SEMINAR"],
        timeMode: "PERIOD",
        capacity: 102,
        requiresApproval: false,
        amenities: ["CATERING", "WIFI"],
        price: 799,
        priceUnit: "stk",
        cityKey: "Tromso",
        contactEmail: "arrangement@tromso.kommune.no",
        contactPhone: "+47 776 34 567",
        contactName: "Arrangementavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Ved avbestilling inntil 7 dager før seminaret refunderes deltakeravgiften i sin helhet. Senere avbestillinger gir ikke rett til refusjon.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Seminaret krever minimum 20 påmeldte deltakere for gjennomføring. Ved avlysning refunderes alle deltakere.",
                category: "general",
            },
            {
                title: "Forelesninger og materiell",
                content: "Alle forelesninger, bildepresentasjoner og teknisk materiell fra foreleserne er inkludert i seminarprisen.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Har du allergier eller behov for tilrettelegging, meld fra senest 3 dager før seminaret slik at vi kan tilpasse.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, presentasjonsmateriale fra foreleserne og tilgang til digitale fotografi-ressurser.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er parkeringsplasser tilgjengelig i nærheten. Vi anbefaler å komme i god tid da plassene kan fylles opp.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, seminaret gir ikke formelt sertifikat, men du får tilgang til forelesningsmaterialer og tekniske guider fra foreleserne.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, dette seminaret tilbyr ikke streaming. Vi anbefaler fysisk oppmøte for å få mest mulig ut av forelesningene.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
    {
        name: "Seminar: Musikk",
        slug: "seminar-musikk",
        description: "Inspirerende seminar om musikkbransjen. Lær av erfarne artister og produsenter.",
        categoryKey: "ARRANGEMENTER",
        subcategoryKeys: ["SEMINAR"],
        timeMode: "PERIOD",
        capacity: 58,
        requiresApproval: false,
        amenities: ["CATERING", "WIFI"],
        price: 485,
        priceUnit: "stk",
        cityKey: "Oslo",
        contactEmail: "arrangement@oslo.kommune.no",
        contactPhone: "+47 228 91 234",
        contactName: "Kulturavdelingen",
        rules: [
            {
                title: "Avbestillingspolicy",
                content: "Full refusjon ved avbestilling inntil 7 dager før seminarstart. Senere avbestillinger refunderes dessverre ikke.",
                category: "cancellation",
            },
            {
                title: "Minimum antall deltakere",
                content: "Seminaret gjennomføres med minimum 15 påmeldte deltakere. Ved avlysning varsles alle og full refusjon gis.",
                category: "general",
            },
            {
                title: "Forelesere og presentasjoner",
                content: "Alle forelesninger, lydfiler og digitalt presentasjonsmateriale fra foreleserne er inkludert i seminarprisen.",
                category: "general",
            },
            {
                title: "Allergier og spesielle behov",
                content: "Opplys om eventuelle allergier eller behov for tilrettelegging ved påmelding, slik at vi kan planlegge deretter.",
                category: "safety",
            },
        ],
        faq: [
            {
                question: "Hva er inkludert i prisen?",
                answer: "Prisen inkluderer lunsj, forelesningsmateriale og tilgang til digitale lydressurser fra foreleserne.",
            },
            {
                question: "Er det parkeringsmuligheter?",
                answer: "Ja, det er parkering i nærheten av lokalet. Kollektivtransport er også et godt alternativ.",
            },
            {
                question: "Får jeg kursbevis/sertifikat?",
                answer: "Nei, seminaret gir ikke formelt sertifikat, men du får verdifull innsikt fra erfarne artister og produsenter i bransjen.",
            },
            {
                question: "Er det mulighet for opptak/streaming?",
                answer: "Nei, dette seminaret er kun tilgjengelig ved fysisk oppmøte. Vi anbefaler å delta på stedet for best opplevelse.",
            },
        ],
        events: ARRANGEMENTER_EVENTS,
    },
];
