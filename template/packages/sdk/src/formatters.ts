/**
 * Formatting utilities for digdir apps.
 *
 * These were previously part of @digilist/client-sdk and are used
 * across web, backoffice, and minside for date/time/currency display.
 */

// ---------------------------------------------------------------------------
// Date / Time Formatters
// ---------------------------------------------------------------------------

const NB_LOCALE = 'nb-NO';

/**
 * Format a date string or Date to a locale-friendly date string.
 * @example formatDate('2026-01-15T10:00:00Z') → '15. jan. 2026'
 */
export function formatDate(input: string | Date): string {
    if (!input) return '';
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return String(input);
    return date.toLocaleDateString(NB_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format a date string or Date to a time string (HH:mm).
 * @example formatTime('2026-01-15T10:30:00Z') → '10:30'
 */
export function formatTime(input: string | Date): string {
    if (!input) return '';
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return String(input);
    return date.toLocaleTimeString(NB_LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format a date string or Date to a full date+time string.
 * @example formatDateTime('2026-01-15T10:30:00Z') → '15. jan. 2026, 10:30'
 */
export function formatDateTime(input: string | Date): string {
    if (!input) return '';
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return String(input);
    return date.toLocaleDateString(NB_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format a currency amount.
 * @example formatCurrency(1500, 'NOK') → 'kr 1 500,00'
 */
export function formatCurrency(amount: number, currency = 'NOK'): string {
    return new Intl.NumberFormat(NB_LOCALE, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a week range label from a start date.
 * @example formatWeekRange('2026-01-13') → 'Uke 3, 13. jan – 19. jan 2026'
 */
export function formatWeekRange(startDate: string | Date, _endDate?: string | Date): string {
    if (!startDate) return '';
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    if (isNaN(start.getTime())) return String(startDate);

    // Calculate ISO week number
    const d = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    // Calculate end of week (Sunday)
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startStr = start.toLocaleDateString(NB_LOCALE, { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString(NB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });

    return `Uke ${weekNo}, ${startStr} – ${endStr}`;
}

// ---------------------------------------------------------------------------
// Weekday / Period / Time Slot Formatters
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS: Record<string, string> = {
    monday: 'Mandag',
    tuesday: 'Tirsdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lørdag',
    sunday: 'Søndag',
    mon: 'Man',
    tue: 'Tir',
    wed: 'Ons',
    thu: 'Tor',
    fri: 'Fre',
    sat: 'Lør',
    sun: 'Søn',
};

/**
 * Convert weekday identifiers to Norwegian labels.
 * @example formatWeekdays(['monday', 'wednesday']) → ['Mandag', 'Onsdag']
 */
export function formatWeekdays(weekdays: string[] | undefined): string[] {
    if (!weekdays?.length) return [];
    return weekdays.map(d => WEEKDAY_LABELS[d.toLowerCase()] ?? d);
}

/**
 * Format a date period as a human-readable range.
 * @example formatPeriod('2026-06-01', '2026-08-31') → '1. jun. 2026 – 31. aug. 2026'
 */
export function formatPeriod(start: string | Date, end: string | Date): string {
    const s = typeof start === 'string' ? new Date(start) : start;
    const e = typeof end === 'string' ? new Date(end) : end;
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${start} – ${end}`;
    const fmt = (d: Date) =>
        d.toLocaleDateString(NB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(s)} – ${fmt(e)}`;
}

/**
 * Format a time slot range.
 * @example formatTimeSlot('08:00', '16:00') → '08:00 – 16:00'
 */
export function formatTimeSlot(start: string, end: string): string {
    return `${start} – ${end}`;
}

// ---------------------------------------------------------------------------
// Listing Helpers
// ---------------------------------------------------------------------------

const LISTING_TYPE_LABEL_MAP: Record<string, string> = {
    // ListingType enum values -> Norwegian labels
    SPACE: 'Lokaler',
    RESOURCE: 'Sport',
    SERVICE: 'Torget',
    VEHICLE: 'Kjøretøy',
    EVENT: 'Arrangementer',
    OTHER: 'Annet',
    // Category keys -> Norwegian labels
    LOKALER: 'Lokaler',
    SPORT: 'Sport',
    ARRANGEMENTER: 'Arrangementer',
    TORGET: 'Torget',
    // Legacy keys
    boat: 'Båt',
    cabin: 'Hytte',
    equipment: 'Utstyr',
    facility: 'Lokale',
    vehicle: 'Kjøretøy',
    other: 'Annet',
};

/**
 * Get a human-readable Norwegian label for a listing type.
 * @example getListingTypeLabel('SPACE') → 'Lokale'
 */
export function getListingTypeLabel(type: string | undefined): string {
    if (!type) return 'Annet';
    return LISTING_TYPE_LABEL_MAP[type] ?? type;
}

/**
 * Format a number as a percentage string.
 * @example formatPercent(0.85) → '85 %'
 * @example formatPercent(85, false) → '85 %'
 */
export function formatPercent(value: number, isDecimal = true): string {
    const pct = isDecimal ? value * 100 : value;
    return new Intl.NumberFormat(NB_LOCALE, {
        style: 'percent',
        maximumFractionDigits: 1,
    }).format(isDecimal ? value : value / 100);
}
