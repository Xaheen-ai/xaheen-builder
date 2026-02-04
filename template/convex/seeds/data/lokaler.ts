/**
 * Seed data for LOKALER category
 * Subcategories: Selskapslokale, Møterom, Gymsal, Kulturarena, Konferanserom
 */

import type { ResourceSeed } from "../types";

// --- Reusable opening hours ---

const SELSKAPSLOKALE_HOURS = [
    { day: "Søndag", dayIndex: 0, open: "", close: "", isClosed: true },
    { day: "Mandag", dayIndex: 1, open: "08:00", close: "22:00", isClosed: false },
    { day: "Tirsdag", dayIndex: 2, open: "08:00", close: "22:00", isClosed: false },
    { day: "Onsdag", dayIndex: 3, open: "08:00", close: "22:00", isClosed: false },
    { day: "Torsdag", dayIndex: 4, open: "08:00", close: "22:00", isClosed: false },
    { day: "Fredag", dayIndex: 5, open: "08:00", close: "22:00", isClosed: false },
    { day: "Lørdag", dayIndex: 6, open: "10:00", close: "18:00", isClosed: false },
];

const MOTEROM_KONFERANSEROM_HOURS = [
    { day: "Søndag", dayIndex: 0, open: "", close: "", isClosed: true },
    { day: "Mandag", dayIndex: 1, open: "07:00", close: "21:00", isClosed: false },
    { day: "Tirsdag", dayIndex: 2, open: "07:00", close: "21:00", isClosed: false },
    { day: "Onsdag", dayIndex: 3, open: "07:00", close: "21:00", isClosed: false },
    { day: "Torsdag", dayIndex: 4, open: "07:00", close: "21:00", isClosed: false },
    { day: "Fredag", dayIndex: 5, open: "07:00", close: "21:00", isClosed: false },
    { day: "Lørdag", dayIndex: 6, open: "08:00", close: "18:00", isClosed: false },
];

const GYMSAL_HOURS = [
    { day: "Søndag", dayIndex: 0, open: "", close: "", isClosed: true },
    { day: "Mandag", dayIndex: 1, open: "06:00", close: "22:00", isClosed: false },
    { day: "Tirsdag", dayIndex: 2, open: "06:00", close: "22:00", isClosed: false },
    { day: "Onsdag", dayIndex: 3, open: "06:00", close: "22:00", isClosed: false },
    { day: "Torsdag", dayIndex: 4, open: "06:00", close: "22:00", isClosed: false },
    { day: "Fredag", dayIndex: 5, open: "06:00", close: "22:00", isClosed: false },
    { day: "Lørdag", dayIndex: 6, open: "08:00", close: "20:00", isClosed: false },
];

const KULTURARENA_HOURS = [
    { day: "Søndag", dayIndex: 0, open: "", close: "", isClosed: true },
    { day: "Mandag", dayIndex: 1, open: "10:00", close: "22:00", isClosed: false },
    { day: "Tirsdag", dayIndex: 2, open: "10:00", close: "22:00", isClosed: false },
    { day: "Onsdag", dayIndex: 3, open: "10:00", close: "22:00", isClosed: false },
    { day: "Torsdag", dayIndex: 4, open: "10:00", close: "22:00", isClosed: false },
    { day: "Fredag", dayIndex: 5, open: "10:00", close: "22:00", isClosed: false },
    { day: "Lørdag", dayIndex: 6, open: "10:00", close: "18:00", isClosed: false },
];

// --- Reusable rules ---

const SELSKAPSLOKALE_RULES = [
    {
        title: "Støyreglement",
        content: "Musikk og støyende aktiviteter må avsluttes innen kl. 23:00 på hverdager og kl. 01:00 i helger. Lydnivået skal til enhver tid holdes innenfor kommunens retningslinjer for innendørs arrangementer.",
        category: "noise" as const,
    },
    {
        title: "Rengjøring etter bruk",
        content: "Lokalet skal vaskes og ryddes etter bruk. Alt søppel skal sorteres og kastes i anviste beholdere. Kjøkken skal rengjøres grundig. Ved manglende rengjøring vil et gebyr på kr 2 500 bli belastet.",
        category: "cleaning" as const,
    },
    {
        title: "Maksimalt antall gjester",
        content: "Antall gjester skal ikke overstige oppgitt kapasitet for lokalet. Arrangør er ansvarlig for å føre oversikt over antall deltakere og sikre at brannforskriftene overholdes.",
        category: "general" as const,
    },
    {
        title: "Røykfritt lokale",
        content: "All røyking, inkludert e-sigaretter og vaping, er strengt forbudt innendørs. Røyking er kun tillatt på anviste uteområder. Brudd på røykeforbudet medfører gebyr.",
        category: "safety" as const,
    },
];

const MOTEROM_RULES = [
    {
        title: "Bruk av AV-utstyr",
        content: "Alt audiovisuelt utstyr skal behandles med forsiktighet. Kontakt driftspersonalet ved tekniske problemer. Utstyret skal ikke flyttes mellom rom uten forhåndsgodkjenning.",
        category: "general" as const,
    },
    {
        title: "Avbestillingsregler",
        content: "Avbestilling må skje minst 24 timer før reservert tid. Ved avbestilling senere enn 24 timer belastes 50 % av bookingprisen. Manglende oppmøte belastes full pris.",
        category: "cancellation" as const,
    },
    {
        title: "Tilbakestilling av rom",
        content: "Møterommet skal settes tilbake til opprinnelig oppsett etter bruk. Stoler og bord skal plasseres i standard konfigurasjon. Tavler skal viskes rene og utstyr settes på plass.",
        category: "cleaning" as const,
    },
];

const KONFERANSEROM_RULES = [
    {
        title: "Bruk av AV-utstyr",
        content: "Konferanserommet er utstyrt med profesjonelt AV-utstyr inkludert projektor, høyttalere og videokonferansesystem. Kontakt teknisk ansvarlig ved behov for opplæring. Utstyret skal ikke kobles fra uten tillatelse.",
        category: "general" as const,
    },
    {
        title: "Avbestillingsregler",
        content: "Avbestilling må skje minst 48 timer før reservert tid. Ved avbestilling senere enn 48 timer belastes 50 % av totalprisen. Manglende oppmøte belastes full pris.",
        category: "cancellation" as const,
    },
    {
        title: "Catering og servering",
        content: "Catering kan bestilles gjennom vår samarbeidspartner. Bestilling må gjøres minst 3 virkedager i forveien. Ekstern catering er tillatt, men arrangør er ansvarlig for opprydding.",
        category: "general" as const,
    },
];

const GYMSAL_RULES = [
    {
        title: "Bruk av sportsutstyr",
        content: "Alt utstyr skal brukes i henhold til instruksjoner. Utstyret skal settes tilbake på plass etter bruk. Skader på utstyr skal meldes umiddelbart til driftspersonalet. Bruk av egne apparater krever forhåndsgodkjenning.",
        category: "general" as const,
    },
    {
        title: "Rengjøring av gymsal",
        content: "Gymsalen skal feies og ryddes etter bruk. Hallgulvet skal ikke brukes med sko som setter merker. Eventuelt søl skal tørkes opp umiddelbart. Garderobene skal forlates i ryddig stand.",
        category: "cleaning" as const,
    },
    {
        title: "Tidsbegrensning for booking",
        content: "Maksimal sammenhengende bookingtid er 4 timer. Avbestilling må skje minst 48 timer i forveien. Gjentakende bookinger som ikke benyttes kan bli kansellert av administrasjonen.",
        category: "cancellation" as const,
    },
];

const KULTURARENA_RULES = [
    {
        title: "Bruk av sceneutstyr",
        content: "Sceneutstyr inkludert lys- og lydanlegg skal kun betjenes av autorisert personell eller etter opplæring. Rigging og nedrigging skal avtales på forhånd med teknisk ansvarlig.",
        category: "general" as const,
    },
    {
        title: "Lydnivå",
        content: "Lydnivået skal ikke overstige 100 dB ved mikseposisjon. Lydprøver er kun tillatt i avtalt tidsrom. Nabovarsel skal sendes ved arrangementer med forventet høyt lydnivå.",
        category: "noise" as const,
    },
    {
        title: "Avbestillingsregler",
        content: "Avbestilling av kulturarenaen må skje minst 14 dager før arrangementet. Ved avbestilling senere enn 14 dager belastes 75 % av totalprisen. Ved avbestilling senere enn 7 dager belastes full pris.",
        category: "cancellation" as const,
    },
];

// --- Reusable FAQs ---

const SELSKAPSLOKALE_FAQ = [
    {
        question: "Er det parkering tilgjengelig ved lokalet?",
        answer: "Ja, det er gratis parkering for gjester rett utenfor lokalet. Antall plasser varierer, men det er vanligvis god tilgjengelighet. Ved store arrangementer anbefaler vi å informere gjestene om alternative parkeringsmuligheter i nærheten.",
    },
    {
        question: "Kan vi bestille catering til arrangementet?",
        answer: "Ja, vi samarbeider med flere lokale cateringfirmaer som kan levere alt fra buffet til sittende middag. Du kan også bruke eget cateringfirma eller lage maten selv i vårt fullt utstyrte kjøkken. Kontakt oss for anbefalinger.",
    },
    {
        question: "Er lokalet universelt utformet og tilgjengelig for rullestolbrukere?",
        answer: "Lokalet er tilrettelagt for rullestolbrukere med rampe ved inngangspartiet og tilgjengelig toalett. Kontakt oss på forhånd dersom du har spesielle behov, så tilrettelegger vi best mulig.",
    },
    {
        question: "Hva slags utstyr er inkludert i leieprisen?",
        answer: "Leieprisen inkluderer bord, stoler, kjøkkenutstyr (tallerkener, glass, bestikk), kjøleskap og oppvaskmaskin. Lydanlegg og projektor kan leies som tilleggsutstyr mot et ekstra gebyr.",
    },
];

const MOTEROM_FAQ = [
    {
        question: "Har møterommet utstyr for videokonferanse?",
        answer: "Ja, møterommet er utstyrt med videokonferanseløsning som støtter Teams, Zoom og Google Meet. Det er også tilgjengelig storskjerm, webkamera og mikrofon. Teknisk support er tilgjengelig ved behov.",
    },
    {
        question: "Er det parkering for møtedeltakere?",
        answer: "Ja, det er parkeringsplasser tilgjengelig for besøkende. Vi anbefaler å reservere plass på forhånd ved større møter. Det er også gode kollektivforbindelser i nærheten.",
    },
    {
        question: "Finnes det kantine eller kafetilbud i bygget?",
        answer: "Ja, det er kantine i bygget med åpningstid mandag til fredag kl. 08:00-15:00. Kaffe, te og vann er tilgjengelig gratis på møterommet. Ved behov for lunsj eller servering til møtet, kontakt oss minst 2 virkedager i forveien.",
    },
];

const KONFERANSEROM_FAQ = [
    {
        question: "Hva slags AV-utstyr er tilgjengelig?",
        answer: "Konferanserommet er utstyrt med profesjonell projektor, storskjerm, surroundlyd, trådløs presentasjon (AirPlay/Miracast) og videokonferansesystem med kamera og mikrofoner. Teknisk personale kan bistå med oppsett.",
    },
    {
        question: "Er det parkering tilgjengelig for konferansedeltakere?",
        answer: "Ja, det er parkering i byggets parkeringsanlegg. For store konferanser anbefaler vi å informere deltakerne om offentlig transport, da parkeringsplassene kan være begrenset. Ladeplasser for elbil er tilgjengelig.",
    },
    {
        question: "Kan vi bestille catering til konferansen?",
        answer: "Ja, vi tilbyr cateringpakker for konferanser inkludert lunsj, pauseservering og forfriskninger. Bestilling må gjøres minst 3 virkedager i forveien. Vi kan tilpasse menyen etter allergier og kostbehov.",
    },
];

const GYMSAL_FAQ = [
    {
        question: "Kan vi leie sportsutstyr sammen med gymsalen?",
        answer: "Ja, vi har et utvalg sportsutstyr tilgjengelig for utleie, inkludert baller, nett, matter og målbur. Utstyr bestilles ved booking og er inkludert i leieprisen. Spesialutstyr kan bestilles mot tillegg.",
    },
    {
        question: "Er det garderober og dusjer tilgjengelig?",
        answer: "Ja, det er separate garderober for damer og herrer med dusjer og toaletter. Garderobene har låsbare skap. Vi anbefaler å ta med egen hengelås. Håndklær er ikke inkludert.",
    },
    {
        question: "Finnes det parkering ved gymsalen?",
        answer: "Ja, det er gratis parkering rett utenfor gymsalen med god kapasitet. Ved store arrangementer kan det være begrenset med plasser, og vi anbefaler samkjøring eller kollektivtransport.",
    },
];

const KULTURARENA_FAQ = [
    {
        question: "Er det backstage-fasiliteter tilgjengelig?",
        answer: "Ja, kulturarenaen har backstage-rom med speil, garderobe, toalett og enkel servering. Det er plass til opptil 20 personer backstage. Behov for ekstra fasiliteter bør avtales på forhånd.",
    },
    {
        question: "Hva slags sceneutstyr er inkludert?",
        answer: "Scenen er utstyrt med profesjonelt lysanlegg, lydanlegg med PA-system, scenetepper og grunnleggende backline. Ekstra utstyr som røykmaskin, spesialbelysning eller ekstra mikrofoner kan leies mot tillegg.",
    },
    {
        question: "Er det parkering for publikum og artister?",
        answer: "Ja, det er stor parkeringsplass med kapasitet for opptil 150 biler. Artister og crew har egen innkjøring og reservert parkering bak scenen. Busstopp med gode forbindelser er rett utenfor arenaen.",
    },
];

// --- Reusable events ---

const SELSKAPSLOKALE_EVENTS = [
    {
        title: "Bryllup - Familien Hansen",
        description: "Privat bryllupsfest med middag og dans",
        startDate: "2026-03-15",
        startTime: "15:00",
        endTime: "01:00",
        organizer: "Familien Hansen",
        status: "upcoming" as const,
    },
    {
        title: "50-årslag",
        description: "Jubileumsfest med tapas og underholdning",
        startDate: "2026-03-22",
        startTime: "18:00",
        endTime: "23:00",
        organizer: "Privat arrangement",
        status: "upcoming" as const,
    },
    {
        title: "Firmafest Techno AS",
        description: "Årlig firmafest med middag og quiz",
        startDate: "2026-02-01",
        startTime: "18:00",
        endTime: "23:00",
        organizer: "Techno AS",
        status: "past" as const,
    },
];

const MOTEROM_EVENTS = [
    {
        title: "Prosjektmøte - Innovasjon",
        description: "Ukentlig statusmøte for innovasjonsprosjektet",
        startDate: "2026-02-10",
        startTime: "09:00",
        endTime: "11:00",
        isRecurring: true,
        organizer: "Innovasjonsavdelingen",
        status: "upcoming" as const,
    },
    {
        title: "Strategiworkshop",
        description: "Heldags workshop for ledergruppen",
        startDate: "2026-02-15",
        startTime: "08:30",
        endTime: "16:00",
        organizer: "Ledelsen",
        status: "upcoming" as const,
    },
    {
        title: "Kundemøte - Norsk Industri",
        description: "Presentasjon av årsresultater",
        startDate: "2026-01-28",
        startTime: "13:00",
        endTime: "15:00",
        organizer: "Salgsavdelingen",
        status: "past" as const,
    },
];

const GYMSAL_EVENTS = [
    {
        title: "Håndballtrening U16",
        description: "Fast ukentlig trening for junior-laget",
        startDate: "2026-02-11",
        startTime: "17:00",
        endTime: "19:00",
        isRecurring: true,
        organizer: "IL Håndball",
        status: "upcoming" as const,
    },
    {
        title: "Skoleoppvisning",
        description: "Årlig gymnastikkoppvisning for foreldre",
        startDate: "2026-03-01",
        startTime: "18:00",
        endTime: "20:00",
        organizer: "Kulturskolen",
        status: "upcoming" as const,
    },
    {
        title: "Innebandy-turnering",
        description: "Regional turnering for bedriftslag",
        startDate: "2026-01-20",
        startTime: "09:00",
        endTime: "17:00",
        organizer: "Bedriftsidrettslaget",
        status: "past" as const,
    },
];

const KULTURARENA_EVENTS = [
    {
        title: "Stand-up kveld",
        description: "Lokal stand-up kveld med 3 komikere",
        startDate: "2026-02-14",
        startTime: "20:00",
        endTime: "22:30",
        organizer: "Latterkula Produksjon",
        status: "upcoming" as const,
    },
    {
        title: "Vårrevy",
        description: "Den årlige revyen med lokale artister",
        startDate: "2026-03-08",
        endDate: "2026-03-10",
        startTime: "19:00",
        endTime: "22:00",
        organizer: "Revygruppa",
        status: "upcoming" as const,
    },
    {
        title: "Konsert - Lokalt band",
        description: "Releasekonsert for nytt album",
        startDate: "2026-01-25",
        startTime: "20:00",
        endTime: "23:00",
        organizer: "Lydproduksjon AS",
        status: "past" as const,
    },
];

const KONFERANSEROM_EVENTS = [
    {
        title: "Fagkonferanse 2026",
        description: "Årlig bransjekonferanse med foredrag og networking",
        startDate: "2026-02-20",
        endDate: "2026-02-21",
        startTime: "09:00",
        endTime: "17:00",
        organizer: "Bransjeforeningen",
        status: "upcoming" as const,
    },
    {
        title: "Styremøte Q1",
        description: "Kvartalsmøte for styret",
        startDate: "2026-02-05",
        startTime: "10:00",
        endTime: "14:00",
        organizer: "Administrasjonen",
        status: "upcoming" as const,
    },
    {
        title: "Webinar-innspilling",
        description: "Innspilling av opplæringswebinar",
        startDate: "2026-01-30",
        startTime: "13:00",
        endTime: "16:00",
        organizer: "HR-avdelingen",
        status: "past" as const,
    },
];

export const LOKALER_RESOURCES: ResourceSeed[] = [
    // Selskapslokaler (5)
    {
        name: "Selskapslokale 1 - Trondheim",
        slug: "selskapslokale-1-trondheim",
        description: "Moderne selskapslokale i Trondheim. Perfekt for bryllup, jubileum og firmafester. Fullt utstyrt kjøkken.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["SELSKAPSLOKALE"],
        timeMode: "DAY",
        capacity: 63,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "KJOKKEN", "CATERING"],
        price: 2430,
        priceUnit: "dag",
        cityKey: "Trondheim",
        contactEmail: "booking@trondheim.kommune.no",
        contactPhone: "+47 735 42 100",
        contactName: "Kultur- og fritidsavdelingen",
        openingHours: SELSKAPSLOKALE_HOURS,
        rules: SELSKAPSLOKALE_RULES,
        faq: SELSKAPSLOKALE_FAQ,
        events: SELSKAPSLOKALE_EVENTS,
        allowSeasonRental: true,
        allowRecurringBooking: false,
    },
    {
        name: "Selskapslokale 2 - Kristiansand",
        slug: "selskapslokale-2-kristiansand",
        description: "Stort selskapslokale i Kristiansand med havutsikt. Ideelt for store arrangementer og firmafester.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["SELSKAPSLOKALE"],
        timeMode: "DAY",
        capacity: 260,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "KJOKKEN", "SCENE", "CATERING"],
        price: 4959,
        priceUnit: "dag",
        cityKey: "Kristiansand",
        contactEmail: "booking@kristiansand.kommune.no",
        contactPhone: "+47 381 07 500",
        contactName: "Eiendomsavdelingen",
        openingHours: SELSKAPSLOKALE_HOURS,
        rules: SELSKAPSLOKALE_RULES,
        faq: SELSKAPSLOKALE_FAQ,
        events: SELSKAPSLOKALE_EVENTS,
    },
    {
        name: "Selskapslokale 3 - Oslo",
        slug: "selskapslokale-3-oslo",
        description: "Intimt selskapslokale i Oslo sentrum. Perfekt for mindre selskaper og private arrangementer.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["SELSKAPSLOKALE"],
        timeMode: "DAY",
        capacity: 21,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "KJOKKEN"],
        price: 2672,
        priceUnit: "dag",
        cityKey: "Oslo",
        contactEmail: "booking@oslo.kommune.no",
        contactPhone: "+47 234 61 800",
        contactName: "Kultur- og idrettsavdelingen",
        openingHours: SELSKAPSLOKALE_HOURS,
        rules: SELSKAPSLOKALE_RULES,
        faq: SELSKAPSLOKALE_FAQ,
        events: SELSKAPSLOKALE_EVENTS,
    },
    {
        name: "Selskapslokale 4 - Fredrikstad",
        slug: "selskapslokale-4-fredrikstad",
        description: "Stort selskapslokale i Fredrikstad. Perfekt for bryllup og store feiringer. Historisk bygning.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["SELSKAPSLOKALE"],
        timeMode: "DAY",
        capacity: 347,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "KJOKKEN", "SCENE", "CATERING"],
        price: 3557,
        priceUnit: "dag",
        cityKey: "Fredrikstad",
        contactEmail: "booking@fredrikstad.kommune.no",
        contactPhone: "+47 692 06 000",
        contactName: "Kulturavdelingen",
        openingHours: SELSKAPSLOKALE_HOURS,
        rules: SELSKAPSLOKALE_RULES,
        faq: SELSKAPSLOKALE_FAQ,
        events: SELSKAPSLOKALE_EVENTS,
    },
    {
        name: "Selskapslokale 5 - Stavanger",
        slug: "selskapslokale-5-stavanger",
        description: "Koselig selskapslokale i Stavanger. Perfekt for mindre selskaper og private feiringer.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["SELSKAPSLOKALE"],
        timeMode: "DAY",
        capacity: 183,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "KJOKKEN"],
        price: 597,
        priceUnit: "dag",
        cityKey: "Stavanger",
        contactEmail: "booking@stavanger.kommune.no",
        contactPhone: "+47 515 08 900",
        contactName: "Innbygger- og samfunnskontakt",
        openingHours: SELSKAPSLOKALE_HOURS,
        rules: SELSKAPSLOKALE_RULES,
        faq: SELSKAPSLOKALE_FAQ,
        events: SELSKAPSLOKALE_EVENTS,
    },

    // Møterom (5)
    {
        name: "Møterom 1 - Tromsø",
        slug: "moterom-1-tromso",
        description: "Moderne møterom i Tromsø. Perfekt for selskap, møter og arrangementer. Godt vedlikeholdt med profesjonelt AV-utstyr.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["MOTEROM"],
        timeMode: "SLOT",
        capacity: 94,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "RULLESTOL"],
        price: 2117,
        priceUnit: "time",
        cityKey: "Tromso",
        contactEmail: "booking@tromso.kommune.no",
        contactPhone: "+47 776 90 000",
        contactName: "Eiendomsavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: MOTEROM_RULES,
        faq: MOTEROM_FAQ,
        events: MOTEROM_EVENTS,
    },
    {
        name: "Møterom 2 - Fredrikstad",
        slug: "moterom-2-fredrikstad",
        description: "Stort møterom i Fredrikstad. Perfekt for styremøter og workshops. Moderne fasiliteter.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["MOTEROM"],
        timeMode: "SLOT",
        capacity: 203,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "HEIS"],
        price: 4310,
        priceUnit: "time",
        cityKey: "Fredrikstad",
        contactEmail: "booking@fredrikstad.kommune.no",
        contactPhone: "+47 692 06 100",
        contactName: "Serviceavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: MOTEROM_RULES,
        faq: MOTEROM_FAQ,
        events: MOTEROM_EVENTS,
    },
    {
        name: "Møterom 3 - Stavanger",
        slug: "moterom-3-stavanger",
        description: "Moderne møterom i Stavanger sentrum. Perfekt for forretingsmøter og presentasjoner.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["MOTEROM"],
        timeMode: "SLOT",
        capacity: 40,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ", "STREAMING"],
        price: 2188,
        priceUnit: "time",
        cityKey: "Stavanger",
        contactEmail: "booking@stavanger.kommune.no",
        contactPhone: "+47 515 08 700",
        contactName: "Administrasjonsavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: MOTEROM_RULES,
        faq: MOTEROM_FAQ,
        events: MOTEROM_EVENTS,
    },
    {
        name: "Møterom 4 - Trondheim",
        slug: "moterom-4-trondheim",
        description: "Moderne møterom i Trondheim. Perfekt for workshops og teambuilding. Fleksibel møblering.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["MOTEROM"],
        timeMode: "SLOT",
        capacity: 60,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ", "KJOKKEN"],
        price: 5225,
        priceUnit: "time",
        cityKey: "Trondheim",
        contactEmail: "booking@trondheim.kommune.no",
        contactPhone: "+47 735 42 200",
        contactName: "Eiendomsavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: MOTEROM_RULES,
        faq: MOTEROM_FAQ,
        events: MOTEROM_EVENTS,
    },
    {
        name: "Møterom 5 - Tromsø",
        slug: "moterom-5-tromso",
        description: "Stort møterom i Tromsø med nordlys-utsikt. Perfekt for kreative workshops og seminarer.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["MOTEROM"],
        timeMode: "SLOT",
        capacity: 183,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ", "STREAMING"],
        price: 4983,
        priceUnit: "time",
        cityKey: "Tromso",
        contactEmail: "booking@tromso.kommune.no",
        contactPhone: "+47 776 90 100",
        contactName: "Kultur- og fritidsavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: MOTEROM_RULES,
        faq: MOTEROM_FAQ,
        events: MOTEROM_EVENTS,
    },

    // Gymsal (2)
    {
        name: "Gymsal 1 - Fredrikstad",
        slug: "gymsal-1-fredrikstad",
        description: "Stor gymsal i Fredrikstad. Perfekt for idrettsarrangementer, messer og konserter.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["GYMSAL"],
        timeMode: "PERIOD",
        capacity: 308,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ"],
        price: 2823,
        priceUnit: "time",
        cityKey: "Fredrikstad",
        contactEmail: "booking@fredrikstad.kommune.no",
        contactPhone: "+47 692 06 200",
        contactName: "Idrettsavdelingen",
        openingHours: GYMSAL_HOURS,
        rules: GYMSAL_RULES,
        faq: GYMSAL_FAQ,
        events: GYMSAL_EVENTS,
    },
    {
        name: "Gymsal 2 - Skien",
        slug: "gymsal-2-skien",
        description: "Moderne gymsal i Skien. Perfekt for trening, kamper og arrangementer.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["GYMSAL"],
        timeMode: "PERIOD",
        capacity: 200,
        requiresApproval: false,
        amenities: ["PARKERING", "GARDEROBER", "DUSJ"],
        price: 1800,
        priceUnit: "time",
        cityKey: "Skien",
        contactEmail: "booking@skien.kommune.no",
        contactPhone: "+47 355 81 000",
        contactName: "Idrettsavdelingen",
        openingHours: GYMSAL_HOURS,
        rules: GYMSAL_RULES,
        faq: GYMSAL_FAQ,
        events: GYMSAL_EVENTS,
    },

    // Kulturarena (1)
    {
        name: "Kulturarena 1 - Tromsø",
        slug: "kulturarena-1-tromso",
        description: "Moderne kulturarena i Tromsø. Perfekt for konserter, teater og kulturarrangementer. Profesjonell scene.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["KULTURARENA"],
        timeMode: "DAY",
        capacity: 323,
        requiresApproval: true,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "DUSJ", "SCENE", "KIOSK"],
        price: 3152,
        priceUnit: "dag",
        cityKey: "Tromso",
        contactEmail: "booking@tromso.kommune.no",
        contactPhone: "+47 776 90 200",
        contactName: "Kulturavdelingen",
        openingHours: KULTURARENA_HOURS,
        rules: KULTURARENA_RULES,
        faq: KULTURARENA_FAQ,
        events: KULTURARENA_EVENTS,
    },

    // Konferanserom (3)
    {
        name: "Konferanserom 1 - Bergen",
        slug: "konferanserom-1-bergen",
        description: "Moderne konferanserom i Bergen sentrum. Perfekt for bedriftsmøter og presentasjoner. Videokonferanse inkludert.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["KONFERANSEROM"],
        timeMode: "SLOT",
        capacity: 99,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "STREAMING"],
        price: 2985,
        priceUnit: "time",
        cityKey: "Bergen",
        contactEmail: "booking@bergen.kommune.no",
        contactPhone: "+47 555 66 300",
        contactName: "Eiendomsavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: KONFERANSEROM_RULES,
        faq: KONFERANSEROM_FAQ,
        events: KONFERANSEROM_EVENTS,
    },
    {
        name: "Konferanserom 2 - Kristiansand",
        slug: "konferanserom-2-kristiansand",
        description: "Moderne konferanserom i Kristiansand. Perfekt for seminarer og kurs. Inkluderer AV-utstyr.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["KONFERANSEROM"],
        timeMode: "SLOT",
        capacity: 47,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "STREAMING"],
        price: 2579,
        priceUnit: "time",
        cityKey: "Kristiansand",
        contactEmail: "booking@kristiansand.kommune.no",
        contactPhone: "+47 381 07 600",
        contactName: "Serviceavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: KONFERANSEROM_RULES,
        faq: KONFERANSEROM_FAQ,
        events: KONFERANSEROM_EVENTS,
    },
    {
        name: "Konferanserom 3 - Oslo",
        slug: "konferanserom-3-oslo",
        description: "Stort konferanserom i Oslo sentrum. Perfekt for store konferanser og seminarer. Fullt AV-utstyr.",
        categoryKey: "LOKALER",
        subcategoryKeys: ["KONFERANSEROM"],
        timeMode: "SLOT",
        capacity: 175,
        requiresApproval: false,
        amenities: ["WIFI", "PARKERING", "GARDEROBER", "STREAMING", "CATERING", "HEIS"],
        price: 4752,
        priceUnit: "time",
        cityKey: "Oslo",
        contactEmail: "booking@oslo.kommune.no",
        contactPhone: "+47 234 61 900",
        contactName: "Næring- og eiendomsavdelingen",
        openingHours: MOTEROM_KONFERANSEROM_HOURS,
        rules: KONFERANSEROM_RULES,
        faq: KONFERANSEROM_FAQ,
        events: KONFERANSEROM_EVENTS,
    },
];
