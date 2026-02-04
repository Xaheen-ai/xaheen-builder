/**
 * Seed data for TORGET category (Equipment rental)
 * Subcategories: Telt, Lydanlegg, Projektor, Bord og stoler, Grill, Partytelt
 */

import type { ResourceSeed } from "../types";

const TORGET_EVENTS = [
    {
        title: "Sesongkampanje - Partytelt",
        description: "20% rabatt på partyteltutleie i mai og juni",
        startDate: "2026-05-01",
        endDate: "2026-06-30",
        organizer: "Utleieavdelingen",
        status: "upcoming" as const,
    },
    {
        title: "Utvidet åpningstid - Fellesferien",
        description: "Ekstra åpningstider for henting og levering i ferieperioden",
        startDate: "2026-07-01",
        endDate: "2026-07-31",
        startTime: "07:00",
        endTime: "19:00",
        organizer: "Utleieavdelingen",
        status: "upcoming" as const,
    },
    {
        title: "Vedlikeholdsperiode",
        description: "Begrenset utvalg under årlig vedlikehold av utstyr",
        startDate: "2026-01-15",
        endDate: "2026-01-22",
        organizer: "Utstyrsservice",
        status: "past" as const,
    },
];

const STANDARD_OPENING_HOURS = [
    { day: "Søndag", dayIndex: 0, open: "", close: "", isClosed: true },
    { day: "Mandag", dayIndex: 1, open: "08:00", close: "16:00", isClosed: false },
    { day: "Tirsdag", dayIndex: 2, open: "08:00", close: "16:00", isClosed: false },
    { day: "Onsdag", dayIndex: 3, open: "08:00", close: "16:00", isClosed: false },
    { day: "Torsdag", dayIndex: 4, open: "08:00", close: "16:00", isClosed: false },
    { day: "Fredag", dayIndex: 5, open: "08:00", close: "16:00", isClosed: false },
    { day: "Lørdag", dayIndex: 6, open: "09:00", close: "14:00", isClosed: false },
];

export const TORGET_RESOURCES: ResourceSeed[] = [
    // Partytelt (2)
    {
        name: "Partytelt til leie - Fredrikstad",
        slug: "partytelt-fredrikstad",
        description: "Kvalitets partytelt tilgjengelig for leie. Perfekt for utendørs arrangementer og fester. 6x12 meter.",
        categoryKey: "TORGET",
        subcategoryKeys: ["PARTYTELT"],
        timeMode: "DAY",
        capacity: 50,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 311,
        priceUnit: "dag",
        cityKey: "Fredrikstad",
        contactEmail: "utleie@fredrikstad.kommune.no",
        contactPhone: "+47 690 12 345",
        contactName: "Utleieavdelingen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av partytelt",
                content: "Det kreves et depositum på kr 3 000 ved utleie av partytelt. Depositumet refunderes ved retur i avtalt stand.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Partyteltet skal returneres i samme stand som ved utlevering. Montering og demontering skal utføres i henhold til medfølgende instruksjoner.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar",
                content: "Leietaker er ansvarlig for all skade som oppstår i leieperioden. Ved skade på teltduk eller stenger vil reparasjonskostnader bli trukket fra depositumet.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Teltet må returneres innenfor avtalt hente-/leveringstidspunkt.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i prisen?",
                answer: "Ja, levering er inkludert. Vi leverer og henter partyteltet på avtalt adresse innenfor kommunens grenser.",
            },
            {
                question: "Kommer partyteltet med monteringshjelp?",
                answer: "Ja, montering er inkludert. Vårt team hjelper med oppsett og nedrigging av partyteltet.",
            },
            {
                question: "Hva skjer ved skade på partyteltet?",
                answer: "Leietaker er ansvarlig for skade som oppstår i leieperioden. Reparasjonskostnader trekkes fra depositumet. Ved større skader kan ytterligere erstatning kreves.",
            },
        ],
        events: TORGET_EVENTS,
    },
    {
        name: "Partytelt til leie - Bergen",
        slug: "partytelt-bergen",
        description: "Stort partytelt tilgjengelig for leie. Perfekt for bryllup og store fester. 8x15 meter.",
        categoryKey: "TORGET",
        subcategoryKeys: ["PARTYTELT"],
        timeMode: "DAY",
        capacity: 80,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 324,
        priceUnit: "dag",
        cityKey: "Bergen",
        contactEmail: "utleie@bergen.kommune.no",
        contactPhone: "+47 553 21 678",
        contactName: "Utstyrsutleie Bergen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av partytelt",
                content: "Det kreves et depositum på kr 4 000 ved utleie av stort partytelt. Depositumet tilbakebetales ved godkjent retur.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Partyteltet skal returneres rent og i samme stand som ved henting. Sørg for at alle deler, barduner og plugger er med ved retur.",
                category: "general",
            },
            {
                title: "Forsikring og skadeansvar",
                content: "Leietaker er fullt ansvarlig for skade på telt og tilbehør i leieperioden. Montering må gjøres på egnet underlag.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Kontakt oss i god tid dersom du trenger forlenget leieperiode.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i leieprisen?",
                answer: "Ja, levering og henting er inkludert i prisen. Vi leverer partyteltet til ønsket adresse i Bergen kommune.",
            },
            {
                question: "Får vi hjelp til montering av partyteltet?",
                answer: "Ja, monteringshjelp er inkludert. Vi setter opp og tar ned partyteltet for deg.",
            },
            {
                question: "Hva skjer hvis partyteltet blir skadet?",
                answer: "Leietaker er ansvarlig for eventuell skade. Depositumet på kr 4 000 vil bli brukt til å dekke reparasjonskostnader. Overskytende kostnader faktureres.",
            },
        ],
        events: TORGET_EVENTS,
    },

    // Lydanlegg (2)
    {
        name: "Lydanlegg til leie - Drammen",
        slug: "lydanlegg-drammen",
        description: "Profesjonelt lydanlegg tilgjengelig for leie. Perfekt for konserter og arrangementer. 2000W.",
        categoryKey: "TORGET",
        subcategoryKeys: ["LYDANLEGG"],
        timeMode: "DAY",
        capacity: 1,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 254,
        priceUnit: "dag",
        cityKey: "Drammen",
        contactEmail: "utleie@drammen.kommune.no",
        contactPhone: "+47 320 45 789",
        contactName: "Utleieavdelingen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av teknisk utstyr",
                content: "Det kreves et depositum på kr 2 500 ved utleie av lydanlegg. Depositumet refunderes ved retur av komplett og uskadet teknisk utstyr.",
                category: "general",
            },
            {
                title: "Returkondisjon for lydanlegg",
                content: "Det tekniske utstyret skal returneres i samme stand som ved utlevering. Alle kabler, mikrofoner og tilbehør skal pakkes forsvarlig.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar for teknisk utstyr",
                content: "Leietaker er ansvarlig for all skade på lydanlegget i leieperioden. Utstyret skal brukes i tråd med medfølgende bruksanvisning.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur av lydanlegget påløper et gebyr på 200 kr per dag. Utstyret skal returneres innenfor åpningstidene.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering av lydanlegget inkludert?",
                answer: "Ja, levering og henting av lydanlegget er inkludert i leieprisen innenfor Drammen kommune.",
            },
            {
                question: "Får vi teknisk hjelp med oppsett av lydanlegget?",
                answer: "Ja, montering og oppsett er inkludert. Vår tekniker hjelper med tilkobling og lydsjekk.",
            },
            {
                question: "Hva skjer ved skade på lydanlegget?",
                answer: "Leietaker er ansvarlig for skade på det tekniske utstyret. Reparasjon eller erstatning trekkes fra depositumet. Ved totalskade må leietaker dekke full erstatningsverdi.",
            },
        ],
        events: TORGET_EVENTS,
    },
    {
        name: "Lydanlegg til leie - Tromsø",
        slug: "lydanlegg-tromso",
        description: "Kompakt lydanlegg tilgjengelig for leie. Perfekt for mindre arrangementer. 500W.",
        categoryKey: "TORGET",
        subcategoryKeys: ["LYDANLEGG"],
        timeMode: "DAY",
        capacity: 1,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 129,
        priceUnit: "dag",
        cityKey: "Tromso",
        contactEmail: "utleie@tromso.kommune.no",
        contactPhone: "+47 776 54 321",
        contactName: "Utstyrsutleie Tromsø",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av lydanlegg",
                content: "Det kreves et depositum på kr 1 500 ved utleie av kompakt lydanlegg. Depositumet refunderes ved godkjent retur av alt teknisk utstyr.",
                category: "general",
            },
            {
                title: "Returkondisjon for teknisk utstyr",
                content: "Lydanlegget og alt tilhørende teknisk utstyr skal returneres komplett og i samme stand. Kabler skal kviles pent.",
                category: "general",
            },
            {
                title: "Forsikring og skadeansvar",
                content: "Leietaker er ansvarlig for all skade som oppstår på det tekniske utstyret. Unngå bruk i fuktige omgivelser uten beskyttelse.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Ta kontakt dersom du trenger å forlenge leieperioden.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i prisen?",
                answer: "Ja, levering og henting er inkludert i leieprisen innenfor Tromsø kommune.",
            },
            {
                question: "Kommer lydanlegget med monteringshjelp?",
                answer: "Ja, montering er inkludert. Vi hjelper med oppsett og tilkobling av det tekniske utstyret.",
            },
            {
                question: "Hva skjer ved skade på det tekniske utstyret?",
                answer: "Leietaker er ansvarlig for eventuell skade. Depositumet trekkes for å dekke reparasjon. Ved større skader kan ytterligere erstatning bli krevd.",
            },
        ],
        events: TORGET_EVENTS,
    },

    // Projektor (2)
    {
        name: "Projektor til leie - Bergen",
        slug: "projektor-bergen",
        description: "HD projektor tilgjengelig for leie. Perfekt for presentasjoner og filmvisninger. 4000 lumen.",
        categoryKey: "TORGET",
        subcategoryKeys: ["PROJEKTOR"],
        timeMode: "DAY",
        capacity: 1,
        requiresApproval: false,
        amenities: ["LEVERING"],
        price: 1078,
        priceUnit: "dag",
        cityKey: "Bergen",
        contactEmail: "utleie@bergen.kommune.no",
        contactPhone: "+47 553 87 654",
        contactName: "Utleieavdelingen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av projektor",
                content: "Det kreves et depositum på kr 5 000 ved utleie av HD-projektor. Depositumet refunderes ved retur i komplett og uskadet stand.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Projektoren og alt tilbehør (kabler, fjernkontroll, bæreveske) skal returneres i samme stand som ved utlevering.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar",
                content: "Leietaker er ansvarlig for all skade på projektoren i leieperioden. Utstyret skal ikke brukes i direkte sollys eller fuktige forhold.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Projektoren skal leveres tilbake innenfor åpningstidene.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i leieprisen?",
                answer: "Ja, levering og henting av projektoren er inkludert i prisen innenfor Bergen kommune.",
            },
            {
                question: "Kommer projektoren med monteringshjelp?",
                answer: "Nei, montering er ikke inkludert for projektor. Bruksanvisning følger med, og vi gir opplæring ved henting.",
            },
            {
                question: "Hva skjer ved skade på projektoren?",
                answer: "Leietaker er ansvarlig for skade i leieperioden. Reparasjons- eller erstatningskostnader trekkes fra depositumet på kr 5 000.",
            },
        ],
        events: TORGET_EVENTS,
    },
    {
        name: "Projektor til leie - Fredrikstad",
        slug: "projektor-fredrikstad",
        description: "Profesjonell projektor tilgjengelig for leie. Perfekt for konferanser. 6000 lumen.",
        categoryKey: "TORGET",
        subcategoryKeys: ["PROJEKTOR"],
        timeMode: "DAY",
        capacity: 1,
        requiresApproval: false,
        amenities: ["LEVERING"],
        price: 826,
        priceUnit: "dag",
        cityKey: "Fredrikstad",
        contactEmail: "utleie@fredrikstad.kommune.no",
        contactPhone: "+47 690 23 456",
        contactName: "Utstyrsutleie Fredrikstad",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av projektor",
                content: "Det kreves et depositum på kr 4 500 ved utleie av profesjonell projektor. Depositumet tilbakebetales etter godkjent returbefaring.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Projektoren skal returneres komplett med alle kabler, linse og bærekoffert i samme stand som ved utlevering.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar",
                content: "Leietaker er fullt ansvarlig for skade på projektoren. Unngå å flytte utstyret mens det er i bruk, og beskytt linsen med medfølgende deksel.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper det et gebyr på 200 kr per dag. Retur skal skje innenfor våre åpningstider.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering av projektoren inkludert?",
                answer: "Ja, levering og henting er inkludert i leieprisen innenfor Fredrikstad kommune.",
            },
            {
                question: "Får vi hjelp til oppsett av projektoren?",
                answer: "Nei, montering er ikke inkludert. Vi gir en grundig gjennomgang ved utlevering slik at du enkelt kan sette opp utstyret selv.",
            },
            {
                question: "Hva skjer hvis projektoren blir skadet?",
                answer: "Leietaker er ansvarlig for all skade. Depositumet trekkes for å dekke reparasjon eller erstatning av skadet utstyr.",
            },
        ],
        events: TORGET_EVENTS,
    },

    // Bord og stoler (2)
    {
        name: "Bord og stoler til leie - Kristiansand",
        slug: "bord-stoler-kristiansand",
        description: "Bord og stoler tilgjengelig for leie. Perfekt for arrangementer og fester. Sett med 10 bord og 80 stoler.",
        categoryKey: "TORGET",
        subcategoryKeys: ["BORD_OG_STOLER"],
        timeMode: "DAY",
        capacity: 80,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 1012,
        priceUnit: "dag",
        cityKey: "Kristiansand",
        contactEmail: "utleie@kristiansand.kommune.no",
        contactPhone: "+47 381 12 345",
        contactName: "Utleieavdelingen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av møbler",
                content: "Det kreves et depositum på kr 3 000 ved utleie av bord og stoler. Depositumet refunderes ved komplett retur i god stand.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Bord og stoler skal returneres i samme stand som ved utlevering. Alle deler skal telles og kontrolleres ved retur.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar",
                content: "Leietaker er ansvarlig for skade på eller tap av bord og stoler i leieperioden. Manglende enheter faktureres til gjenanskaffelsesverdi.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Sørg for at møblene er tilgjengelige for henting på avtalt tidspunkt.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering av bord og stoler inkludert?",
                answer: "Ja, levering og henting er inkludert i leieprisen. Vi leverer til avtalt adresse innenfor Kristiansand kommune.",
            },
            {
                question: "Får vi hjelp med oppsett av bord og stoler?",
                answer: "Ja, montering er inkludert. Vi hjelper med å sette opp bord og stoler på ønsket lokasjon.",
            },
            {
                question: "Hva skjer ved skade eller tap av møbler?",
                answer: "Leietaker er ansvarlig for skade og tap. Depositumet trekkes for å dekke reparasjon eller erstatning av skadede eller manglende enheter.",
            },
        ],
        events: TORGET_EVENTS,
    },
    {
        name: "Bord og stoler til leie - Drammen",
        slug: "bord-stoler-drammen",
        description: "Elegante bord og stoler tilgjengelig for leie. Perfekt for bryllup. Sett med 15 bord og 120 stoler.",
        categoryKey: "TORGET",
        subcategoryKeys: ["BORD_OG_STOLER"],
        timeMode: "DAY",
        capacity: 120,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 861,
        priceUnit: "dag",
        cityKey: "Drammen",
        contactEmail: "utleie@drammen.kommune.no",
        contactPhone: "+47 320 56 890",
        contactName: "Utstyrsutleie Drammen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av møbler",
                content: "Det kreves et depositum på kr 4 000 ved utleie av elegante bord og stoler. Depositumet refunderes etter godkjent returbefaring.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Alle bord og stoler skal returneres rene og i samme stand som ved utlevering. Antall enheter kontrolleres ved retur.",
                category: "general",
            },
            {
                title: "Forsikring og skadeansvar",
                content: "Leietaker er ansvarlig for all skade på møblene. Flekker, riper eller knekte deler faktureres etter gjeldende erstatningspriser.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Kontakt oss i forkant dersom du trenger utvidet leieperiode.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i prisen?",
                answer: "Ja, levering og henting av bord og stoler er inkludert i leieprisen innenfor Drammen kommune.",
            },
            {
                question: "Kommer bord og stoler med monteringshjelp?",
                answer: "Ja, montering er inkludert. Vi setter opp bord og stoler etter dine ønsker på arrangementstedet.",
            },
            {
                question: "Hva skjer ved skade på møblene?",
                answer: "Leietaker er ansvarlig for skade. Depositumet på kr 4 000 trekkes for å dekke reparasjon eller erstatning av skadede enheter.",
            },
        ],
        events: TORGET_EVENTS,
    },

    // Grill (2)
    {
        name: "Grill til leie - Trondheim",
        slug: "grill-trondheim",
        description: "Profesjonell gassgrill tilgjengelig for leie. Perfekt for utendørs arrangementer. Weber Genesis.",
        categoryKey: "TORGET",
        subcategoryKeys: ["GRILL"],
        timeMode: "DAY",
        capacity: 1,
        requiresApproval: false,
        amenities: ["LEVERING"],
        price: 416,
        priceUnit: "dag",
        cityKey: "Trondheim",
        contactEmail: "utleie@trondheim.kommune.no",
        contactPhone: "+47 735 43 210",
        contactName: "Utleieavdelingen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av grill",
                content: "Det kreves et depositum på kr 2 000 ved utleie av gassgrill. Depositumet refunderes ved retur av rengjort og uskadet grill.",
                category: "general",
            },
            {
                title: "Returkondisjon og rengjøring",
                content: "Grillen skal returneres grundig rengjort. Grillristen, brennerne og fettoppsamleren skal være fri for matrester og fett.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar",
                content: "Leietaker er ansvarlig for skade på grillen i leieperioden. Grillen skal kun brukes utendørs og i tråd med sikkerhetsanvisningene.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Grillen skal returneres rengjort innenfor åpningstidene.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering av grillen inkludert?",
                answer: "Ja, levering og henting av grillen er inkludert i leieprisen innenfor Trondheim kommune.",
            },
            {
                question: "Kommer grillen med monteringshjelp?",
                answer: "Nei, montering er ikke inkludert for grill. Grillen leveres ferdig montert og klar til bruk. Gassflaske er inkludert.",
            },
            {
                question: "Hva skjer ved skade på grillen?",
                answer: "Leietaker er ansvarlig for skade. Depositumet trekkes for å dekke reparasjon eller erstatning. Manglende rengjøring medfører et gebyr på kr 500.",
            },
        ],
        events: TORGET_EVENTS,
    },
    {
        name: "Grill til leie - Tromsø",
        slug: "grill-tromso",
        description: "Stor gassgrill tilgjengelig for leie. Perfekt for store arrangementer. Broil King Imperial.",
        categoryKey: "TORGET",
        subcategoryKeys: ["GRILL"],
        timeMode: "DAY",
        capacity: 1,
        requiresApproval: false,
        amenities: ["LEVERING"],
        price: 952,
        priceUnit: "dag",
        cityKey: "Tromso",
        contactEmail: "utleie@tromso.kommune.no",
        contactPhone: "+47 776 98 765",
        contactName: "Utstyrsutleie Tromsø",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av stor grill",
                content: "Det kreves et depositum på kr 3 500 ved utleie av Broil King Imperial-grill. Depositumet tilbakebetales etter godkjent rengjøring og tilstandskontroll.",
                category: "general",
            },
            {
                title: "Returkondisjon og rengjøring",
                content: "Grillen skal returneres rengjort og i god stand. Alle brennere, rister og tilbehør skal være fri for matrester. Manglende rengjøring medfører gebyr.",
                category: "general",
            },
            {
                title: "Forsikring og skadeansvar",
                content: "Leietaker er fullt ansvarlig for skade på grillen. Utstyret skal brukes utendørs på brannsikkert underlag og i henhold til produsentens anvisninger.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Sørg for at grillen er rengjort og tilgjengelig for henting til avtalt tid.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i leieprisen?",
                answer: "Ja, levering og henting er inkludert i prisen innenfor Tromsø kommune.",
            },
            {
                question: "Får vi hjelp med oppsett av grillen?",
                answer: "Nei, montering er ikke inkludert. Grillen leveres ferdig montert med gassflaske og er klar til bruk umiddelbart.",
            },
            {
                question: "Hva skjer hvis grillen blir skadet?",
                answer: "Leietaker er ansvarlig for all skade i leieperioden. Depositumet trekkes for reparasjon eller erstatning. Manglende rengjøring medfører et tilleggsgebyr på kr 750.",
            },
        ],
        events: TORGET_EVENTS,
    },

    // Telt (2)
    {
        name: "Telt til leie - Stavanger",
        slug: "telt-stavanger",
        description: "Kvalitetstelt tilgjengelig for leie. Perfekt for camping og utendørs arrangementer. 4-manns.",
        categoryKey: "TORGET",
        subcategoryKeys: ["TELT"],
        timeMode: "DAY",
        capacity: 4,
        requiresApproval: false,
        amenities: ["LEVERING"],
        price: 150,
        priceUnit: "dag",
        cityKey: "Stavanger",
        contactEmail: "utleie@stavanger.kommune.no",
        contactPhone: "+47 515 67 890",
        contactName: "Utleieavdelingen",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av telt",
                content: "Det kreves et depositum på kr 1 000 ved utleie av telt. Depositumet refunderes ved retur av komplett og tørt telt.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Teltet skal returneres tørt, rent og i samme stand som ved utlevering. Alle stenger, plugger og barduner skal være med.",
                category: "general",
            },
            {
                title: "Forsikring og ansvar",
                content: "Leietaker er ansvarlig for skade på teltet i leieperioden. Unngå bruk av åpen ild i nærheten av teltet.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Teltet skal leveres tilbake innenfor åpningstidene.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering av teltet inkludert?",
                answer: "Ja, levering og henting er inkludert i leieprisen innenfor Stavanger kommune.",
            },
            {
                question: "Kommer teltet med monteringshjelp?",
                answer: "Nei, montering er ikke inkludert for dette teltet. Monteringsanvisning følger med, og teltet er enkelt å sette opp selv.",
            },
            {
                question: "Hva skjer ved skade på teltet?",
                answer: "Leietaker er ansvarlig for skade. Depositumet på kr 1 000 trekkes for å dekke reparasjon av hull, ødelagte stenger eller manglende deler.",
            },
        ],
        events: TORGET_EVENTS,
    },
    {
        name: "Telt til leie - Trondheim",
        slug: "telt-trondheim",
        description: "Familietelt tilgjengelig for leie. Perfekt for camping og festivaler. 6-manns.",
        categoryKey: "TORGET",
        subcategoryKeys: ["TELT"],
        timeMode: "DAY",
        capacity: 6,
        requiresApproval: false,
        amenities: ["LEVERING", "MONTERING"],
        price: 200,
        priceUnit: "dag",
        cityKey: "Trondheim",
        contactEmail: "utleie@trondheim.kommune.no",
        contactPhone: "+47 735 12 678",
        contactName: "Utstyrsutleie Trondheim",
        openingHours: STANDARD_OPENING_HOURS,
        rules: [
            {
                title: "Depositum ved utleie av familietelt",
                content: "Det kreves et depositum på kr 1 500 ved utleie av 6-manns familietelt. Depositumet refunderes ved komplett retur i god stand.",
                category: "general",
            },
            {
                title: "Returkondisjon",
                content: "Familieteltet skal returneres tørt, rent og komplett. Dersom teltet er vått ved retur, tørker vi det mot et gebyr på kr 300.",
                category: "general",
            },
            {
                title: "Forsikring og skadeansvar",
                content: "Leietaker er ansvarlig for all skade på teltet i leieperioden. Bruk av åpen ild og grilling skal skje i trygg avstand fra teltet.",
                category: "safety",
            },
            {
                title: "Forsinkelsesgebyr",
                content: "Ved forsinket retur påløper et gebyr på 200 kr per dag. Meld fra i god tid dersom du trenger forlenget leieperiode.",
                category: "cancellation",
            },
        ],
        faq: [
            {
                question: "Er levering inkludert i prisen?",
                answer: "Ja, levering og henting av familieteltet er inkludert i leieprisen innenfor Trondheim kommune.",
            },
            {
                question: "Får vi hjelp med montering av teltet?",
                answer: "Ja, montering er inkludert. Vårt team hjelper med oppsett og nedrigging av familieteltet.",
            },
            {
                question: "Hva skjer hvis teltet blir skadet?",
                answer: "Leietaker er ansvarlig for skade. Depositumet på kr 1 500 trekkes for reparasjon av skader. Ved totalskade må leietaker dekke full erstatningsverdi.",
            },
        ],
        events: TORGET_EVENTS,
    },
];
