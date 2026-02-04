/**
 * Image paths for seed data - using local seed-images folder
 */

export interface ImageDefinition {
    url: string;
    alt: string;
    isPrimary?: boolean;
}

// Base path for seed images
const BASE_PATH = "/seed-images";

// Images organized by category/subcategory
export const IMAGES = {
    // Lokaler - Selskapslokaler
    SELSKAPSLOKALE: [
        { url: `${BASE_PATH}/Selskapslokaler/Julebygda-grendahus-salen-selskapslokale-2.jpg`, alt: "Selskapslokale med festoppsett" },
        { url: `${BASE_PATH}/Selskapslokaler/storaas_bryllup-2.jpg`, alt: "Bryllupslokale" },
        { url: `${BASE_PATH}/Selskapslokaler/norway-bergen-selskapslokaler-event-venues-and-banquet-halls-restaurants-bryllup-11.avif`, alt: "Festlokale Bergen" },
        { url: `${BASE_PATH}/Selskapslokaler/inside.jpg`, alt: "Innendørs selskapslokale" },
        { url: `${BASE_PATH}/Selskapslokaler/catering.jpg`, alt: "Selskapslokale med catering" },
        { url: `${BASE_PATH}/Selskapslokaler/1ZQSyaO8dmvay9ZuLZDjD.jpg`, alt: "Moderne selskapslokale" },
    ],

    // Lokaler - Møterom
    MOTEROM: [
        { url: `${BASE_PATH}/Møterom og kursrom/moterom_1d1_a.webp`, alt: "Moderne møterom" },
        { url: `${BASE_PATH}/Møterom og kursrom/moterom_u1c6.webp`, alt: "Møterom med utstyr" },
        { url: `${BASE_PATH}/Møterom og kursrom/møterom-magnus-web_1.webp`, alt: "Profesjonelt møterom" },
        { url: `${BASE_PATH}/Møterom og kursrom/møterom-matt-web_3.webp`, alt: "Lyst møterom" },
        { url: `${BASE_PATH}/Møterom og kursrom/691bbcd6c2b9e4be057ff8e5_Pipervika.webp`, alt: "Møterom Pipervika" },
        { url: `${BASE_PATH}/Møterom og kursrom/IMG_3107.jpg`, alt: "Kursrom" },
    ],

    // Lokaler - Gymsal
    GYMSAL: [
        { url: `${BASE_PATH}/Gymsal/Gymsal.webp`, alt: "Gymsal" },
        { url: `${BASE_PATH}/Gymsal/Gymsal og idrettshall.jpg`, alt: "Gymsal og idrettshall" },
        { url: `${BASE_PATH}/Gymsal/IMG_3331+Gymsal.jpeg`, alt: "Stor gymsal" },
        { url: `${BASE_PATH}/Gymsal/Vikasen-skole-gymsal-Carl-Erik-Eriksson-scaled.jpg`, alt: "Skolegymsal" },
        { url: `${BASE_PATH}/Gymsal/unisport-as-VGS-Flerbrukshall-7.jpg`, alt: "Flerbrukshall" },
        { url: `${BASE_PATH}/Gymsal/Trosvikhallen_ERHA-7898.jpg`, alt: "Idrettshall" },
    ],

    // Lokaler - Kulturarena
    KULTURARENA: [
        { url: `${BASE_PATH}/Kulturhus/storesal_fra_scenen_erika_hebbert_16_9_krympet.webp`, alt: "Kulturhus storsal" },
        { url: `${BASE_PATH}/Kulturhus/scene_7_1.jpg`, alt: "Scene i kulturhus" },
        { url: `${BASE_PATH}/Kulturhus/arendal-kulturhus9500.jpg`, alt: "Arendal kulturhus" },
        { url: `${BASE_PATH}/Kulturhus/Sal-2.jpg`, alt: "Konsertsal" },
        { url: `${BASE_PATH}/Kulturhus/kulturhuset-Highasakite-aa.jpg`, alt: "Konsert i kulturhus" },
        { url: `${BASE_PATH}/Kulturhus/oppsett-3.jpg`, alt: "Teateroppsett" },
    ],

    // Lokaler - Konferanserom
    KONFERANSEROM: [
        { url: `${BASE_PATH}/Møterom og kursrom/RKH-innendors-scaled.jpg`, alt: "Konferanserom" },
        { url: `${BASE_PATH}/Møterom og kursrom/49163_153896_377661_R.jpg`, alt: "Stort konferanserom" },
        { url: `${BASE_PATH}/Møterom og kursrom/andreas-tangen (1).jpg`, alt: "Moderne konferanserom" },
        { url: `${BASE_PATH}/Selskapslokaler/Kursrom-Himmel-og-HavWordpress-scaled.jpg`, alt: "Kursrom" },
    ],

    // Sport - Idrettshaller og baner
    PADEL: [
        { url: `${BASE_PATH}/Idrettshaller/A-Sport-padelbaner-1430px.jpg`, alt: "Padelbane" },
        { url: `${BASE_PATH}/Idrettshaller/norsk-padel-leverandoer-padegalis-padelbaner-2.jpg`, alt: "Innendørs padelbane" },
        { url: `${BASE_PATH}/Idrettshaller/padelhall-1-1200x675.jpg`, alt: "Padelhall" },
    ],

    SQUASH: [
        { url: `${BASE_PATH}/Idrettshaller/Gallery_3.jpg`, alt: "Squashbane" },
        { url: `${BASE_PATH}/Idrettshaller/NFS_Idrettsbygg_Hallen_04.jpg`, alt: "Innendørs squash" },
    ],

    TENNIS: [
        { url: `${BASE_PATH}/Idrettshaller/Tennisbane.webp`, alt: "Tennisbane" },
        { url: `${BASE_PATH}/Idrettshaller/kunstgraesbane-tennis-kit-safefloor.w1200.webp`, alt: "Tennisbane kunstgress" },
    ],

    CAGEBALL: [
        { url: `${BASE_PATH}/Idrettshaller/offlines_1759237521224-36381a6d-28ca-4c95-b587-9e025923e74f-cageball.jpg`, alt: "Cageballbane" },
        { url: `${BASE_PATH}/Idrettshaller/baner3_16x9__fullskjerm.jpg`, alt: "Innendørs cageball" },
    ],

    BADMINTON: [
        { url: `${BASE_PATH}/Idrettshaller/Ullern-flerbrukshall_01.jpg`, alt: "Badmintonhall" },
        { url: `${BASE_PATH}/Idrettshaller/Ullern-flerbrukshall_02.jpg`, alt: "Badmintonbaner" },
    ],

    // Svømmehall
    SVOMMEHALL: [
        { url: `${BASE_PATH}/Svømmehall/drammensbadet_7.jpg`, alt: "Svømmehall" },
        { url: `${BASE_PATH}/Svømmehall/Stavanger-Svømmehall-computer-aided-drowning-swimeye-gallery-1.jpg`, alt: "Svømmebasseng" },
        { url: `${BASE_PATH}/Svømmehall/tonsberg-svommehall-nedre-basseng.jpg`, alt: "Innendørs basseng" },
        { url: `${BASE_PATH}/Svømmehall/Familiebasseng Sklie1.jpg`, alt: "Familiebasseng" },
    ],

    // Arrangementer
    KURS: [
        { url: `${BASE_PATH}/Møterom og kursrom/RKH-innendors-scaled.jpg`, alt: "Kursrom" },
        { url: `${BASE_PATH}/Møterom og kursrom/6852bd2137b6a42466a42f27_Biblioteket_sentralen_oslo_foto_katrine_lunke_20256.jpg`, alt: "Kurslokale" },
    ],

    WORKSHOP: [
        { url: `${BASE_PATH}/Møterom og kursrom/IMG20231024145510_31d736.jpg`, alt: "Workshop-rom" },
        { url: `${BASE_PATH}/Møterom og kursrom/2020-deichman-foto-joerg-wiesner-DSC0492-H-9071822- Foto_Jörg_Wiesner.jpg`, alt: "Kreativt rom" },
    ],

    SEMINAR: [
        { url: `${BASE_PATH}/Kulturhus/SAL.jpg`, alt: "Seminarsal" },
        { url: `${BASE_PATH}/Kulturhus/storsalen-bolgen-kulturhus_1280-x-720.jpg`, alt: "Stor seminarsal" },
    ],

    KONSERT: [
        { url: `${BASE_PATH}/Kulturhus/kulturhuset-Highasakite-aa.jpg`, alt: "Konsertscene" },
        { url: `${BASE_PATH}/Kulturhus/scene_7_1.jpg`, alt: "Konsertsal" },
    ],

    FOREDRAG: [
        { url: `${BASE_PATH}/Kulturhus/oppsett-3.jpg`, alt: "Foredragssal" },
        { url: `${BASE_PATH}/Møterom og kursrom/49163_153896_377661_R.jpg`, alt: "Auditorium" },
    ],

    // Torget - Utstyr
    TELT: [
        { url: `${BASE_PATH}/utstyr/leietelt_stor.jpg`, alt: "Leietelt" },
        { url: `${BASE_PATH}/utstyr/4x8-med-3-vegger.jpg`, alt: "Partytelt" },
    ],

    PARTYTELT: [
        { url: `${BASE_PATH}/utstyr/leietelt_stor.jpg`, alt: "Stort partytelt" },
        { url: `${BASE_PATH}/Selskapslokaler/Utleiepartner-telt-bord-og-benker.jpg`, alt: "Telt med møbler" },
    ],

    LYDANLEGG: [
        { url: `${BASE_PATH}/utstyr/utstyr07.jpeg`, alt: "Lydanlegg" },
    ],

    PROJEKTOR: [
        { url: `${BASE_PATH}/utstyr/w1200h1200-3.jpg`, alt: "Projektor" },
    ],

    BORD_OG_STOLER: [
        { url: `${BASE_PATH}/utstyr/28cbf6_klappbord-med-stoler-tilgjengelig-for-leie.jpg`, alt: "Bord og stoler" },
        { url: `${BASE_PATH}/utstyr/Utleie-av-bryllupsstoler-1280.jpg`, alt: "Bryllupsstoler" },
        { url: `${BASE_PATH}/utstyr/svart-klappstol-uten-pute-mai-2025-1.jpeg`, alt: "Klappstol" },
    ],

    GRILL: [
        { url: `${BASE_PATH}/utstyr/catering-oslo-scaled.jpg`, alt: "Grill og catering" },
    ],
};

export function getImagesForSubcategory(subcategoryKey: string, resourceIndex: number, count: number = 3): ImageDefinition[] {
    const images = IMAGES[subcategoryKey as keyof typeof IMAGES] || IMAGES.MOTEROM;
    const result: ImageDefinition[] = [];

    // Start from a different index based on resourceIndex to get variety
    const startIndex = resourceIndex % images.length;

    for (let i = 0; i < count; i++) {
        const imgIndex = (startIndex + i) % images.length;
        result.push({
            ...images[imgIndex],
            isPrimary: i === 0,
        });
    }

    return result;
}

export function getRandomImage(subcategoryKey: string): ImageDefinition {
    const images = IMAGES[subcategoryKey as keyof typeof IMAGES] || IMAGES.MOTEROM;
    const randomIndex = Math.floor(Math.random() * images.length);
    return { ...images[randomIndex], isPrimary: true };
}
