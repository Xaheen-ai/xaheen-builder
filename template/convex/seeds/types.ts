/**
 * Shared types for seed data
 */

export interface OpeningHoursSeed {
    day: string;
    dayIndex: number;
    open: string;
    close: string;
    isClosed: boolean;
}

export interface RuleSeed {
    title: string;
    content: string;
    category: "general" | "cancellation" | "safety" | "cleaning" | "noise" | "other";
}

export interface FAQSeed {
    question: string;
    answer: string;
}

export interface EventSeed {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
    organizer?: string;
    status: "upcoming" | "ongoing" | "past";
}

export interface ResourceSeed {
    name: string;
    slug: string;
    description: string;
    categoryKey: string;
    subcategoryKeys: string[];
    timeMode: "SLOT" | "PERIOD" | "DAY";
    capacity: number;
    requiresApproval: boolean;
    amenities: string[];
    price: number;
    priceUnit: string;
    cityKey: string;
    contactEmail?: string;
    contactPhone?: string;
    contactName?: string;
    openingHours?: OpeningHoursSeed[];
    rules?: RuleSeed[];
    faq?: FAQSeed[];
    events?: EventSeed[];
    /** Enable season/long-term rental requests */
    allowSeasonRental?: boolean;
    /** Enable recurring booking patterns */
    allowRecurringBooking?: boolean;
}

export interface ImageData {
    url: string;
    alt: string;
    isPrimary: boolean;
}
