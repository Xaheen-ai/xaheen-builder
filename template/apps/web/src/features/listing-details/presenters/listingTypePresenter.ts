/**
 * Listing Type Presenter
 *
 * Configuration-driven presenter that controls how each listing type
 * is displayed. This enables dynamic, type-specific rendering without
 * hardcoding logic in components.
 */

import type { ListingType, KeyFacts, BookingMode } from '../types';

// =============================================================================
// Presenter Configuration Types
// =============================================================================

export interface KeyFactConfig {
  key: keyof KeyFacts;
  icon: string;
  labelKey: string;
  format?: (value: unknown, keyFacts: KeyFacts) => string;
  show: (keyFacts: KeyFacts) => boolean;
  priority: number;
}

export interface ActivityTabConfig {
  labelKey: string;
  type: 'events' | 'rentals' | 'sessions';
  showCalendar: boolean;
  showTimeline: boolean;
  emptyStateKey: string;
}

export interface ListingTypeConfig {
  type: ListingType;
  labelKey: string;
  iconName: string;
  keyFacts: KeyFactConfig[];
  activityTab: ActivityTabConfig;
  showOpeningHours: boolean;
  showCapacity: boolean;
  showArea: boolean;
  amenityCategories: string[];
  defaultBookingMode: BookingMode;
  emptyStates: {
    description: string;
    amenities: string;
    rules: string;
    faq: string;
    activity: string;
  };
}

// =============================================================================
// Key Fact Formatters
// =============================================================================

const formatCapacity = (value: unknown, keyFacts: KeyFacts): string => {
  const capacity = value as number;
  const label = keyFacts.capacityLabel || 'personer';
  return `${capacity} ${label}`;
};

const formatArea = (value: unknown, keyFacts: KeyFacts): string => {
  const area = value as number;
  const unit = keyFacts.areaUnit === 'sqft' ? 'sq ft' : 'm²';
  return `${area} ${unit}`;
};

const formatQuantity = (value: unknown, keyFacts: KeyFacts): string => {
  const qty = value as number;
  const label = keyFacts.unitLabel || 'enheter';
  return `${qty} ${label}`;
};

const formatDuration = (value: unknown): string => {
  return value as string;
};

const formatAccessibility = (value: unknown): string => {
  return value ? 'Universell utforming' : '';
};

// =============================================================================
// Presenter Configurations per Type
// =============================================================================

const facilityConfig: ListingTypeConfig = {
  type: 'FACILITY',
  labelKey: 'listingTypes.facility',
  iconName: 'building',
  keyFacts: [
    {
      key: 'capacity',
      icon: 'users',
      labelKey: 'keyFacts.capacity',
      format: formatCapacity,
      show: (kf) => !!kf.capacity && kf.capacity > 0,
      priority: 1,
    },
    {
      key: 'area',
      icon: 'maximize',
      labelKey: 'keyFacts.area',
      format: formatArea,
      show: (kf) => !!kf.area && kf.area > 0,
      priority: 2,
    },
    {
      key: 'bookingMode',
      icon: 'calendar',
      labelKey: 'keyFacts.bookingMode',
      format: (v) => {
        const modes: Record<string, string> = {
          SLOTS: 'Timebasert',
          ALL_DAY: 'Heldags',
          DURATION: 'Varighet',
          TICKETS: 'Billetter',
          NONE: 'Ikke bookbar',
        };
        return modes[v as string] || '';
      },
      show: (kf) => !!kf.bookingMode && kf.bookingMode !== 'NONE',
      priority: 3,
    },
    {
      key: 'wheelchairAccessible',
      icon: 'accessibility',
      labelKey: 'keyFacts.accessibility',
      format: formatAccessibility,
      show: (kf) => !!kf.wheelchairAccessible,
      priority: 4,
    },
  ],
  activityTab: {
    labelKey: 'Aktivitetskalender',
    type: 'events',
    showCalendar: true,
    showTimeline: true,
    emptyStateKey: 'empty.noEvents',
  },
  showOpeningHours: true,
  showCapacity: true,
  showArea: true,
  amenityCategories: ['equipment', 'comfort', 'technology', 'accessibility'],
  defaultBookingMode: 'SLOTS',
  emptyStates: {
    description: 'Ingen beskrivelse tilgjengelig for dette lokalet.',
    amenities: 'Ingen fasiliteter er registrert for dette lokalet.',
    rules: 'Ingen regler er spesifisert for dette lokalet.',
    faq: 'Ingen ofte stilte spørsmål er tilgjengelig.',
    activity: 'Ingen arrangementer er registrert for dette lokalet.',
  },
};

const equipmentConfig: ListingTypeConfig = {
  type: 'EQUIPMENT',
  labelKey: 'listingTypes.equipment',
  iconName: 'tool',
  keyFacts: [
    {
      key: 'quantity',
      icon: 'package',
      labelKey: 'keyFacts.quantity',
      format: formatQuantity,
      show: (kf) => !!kf.quantity && kf.quantity > 0,
      priority: 1,
    },
    {
      key: 'condition',
      icon: 'check-circle',
      labelKey: 'keyFacts.condition',
      format: (v) => {
        const conditions: Record<string, string> = {
          new: 'Ny',
          good: 'God stand',
          fair: 'Brukbar stand',
        };
        return conditions[v as string] || '';
      },
      show: (kf) => !!kf.condition,
      priority: 2,
    },
    {
      key: 'bookingMode',
      icon: 'calendar',
      labelKey: 'keyFacts.bookingMode',
      format: (v) => {
        const modes: Record<string, string> = {
          SLOTS: 'Timebasert',
          ALL_DAY: 'Heldags',
          DURATION: 'Varighet',
          NONE: 'Ikke bookbar',
        };
        return modes[v as string] || '';
      },
      show: (kf) => !!kf.bookingMode && kf.bookingMode !== 'NONE',
      priority: 3,
    },
  ],
  activityTab: {
    labelKey: 'Utleiehistorikk',
    type: 'rentals',
    showCalendar: false,
    showTimeline: true,
    emptyStateKey: 'empty.noRentals',
  },
  showOpeningHours: false,
  showCapacity: false,
  showArea: false,
  amenityCategories: ['included', 'accessories'],
  defaultBookingMode: 'DURATION',
  emptyStates: {
    description: 'Ingen beskrivelse tilgjengelig for dette utstyret.',
    amenities: 'Ingen tilleggsutstyr er registrert.',
    rules: 'Ingen regler er spesifisert for dette utstyret.',
    faq: 'Ingen ofte stilte spørsmål er tilgjengelig.',
    activity: 'Ingen utleiehistorikk er tilgjengelig.',
  },
};

const eventConfig: ListingTypeConfig = {
  type: 'EVENT',
  labelKey: 'listingTypes.event',
  iconName: 'calendar-event',
  keyFacts: [
    {
      key: 'capacity',
      icon: 'users',
      labelKey: 'keyFacts.seats',
      format: (v, kf) => `${v} ${kf.capacityLabel || 'plasser'}`,
      show: (kf) => !!kf.capacity && kf.capacity > 0,
      priority: 1,
    },
    {
      key: 'duration',
      icon: 'clock',
      labelKey: 'keyFacts.duration',
      format: formatDuration,
      show: (kf) => !!kf.duration,
      priority: 2,
    },
    {
      key: 'sessions',
      icon: 'repeat',
      labelKey: 'keyFacts.sessions',
      format: (v) => `${v} økter`,
      show: (kf) => !!kf.sessions && kf.sessions > 1,
      priority: 3,
    },
    {
      key: 'wheelchairAccessible',
      icon: 'accessibility',
      labelKey: 'keyFacts.accessibility',
      format: formatAccessibility,
      show: (kf) => !!kf.wheelchairAccessible,
      priority: 4,
    },
  ],
  activityTab: {
    labelKey: 'Økter',
    type: 'sessions',
    showCalendar: true,
    showTimeline: false,
    emptyStateKey: 'empty.noSessions',
  },
  showOpeningHours: false,
  showCapacity: true,
  showArea: false,
  amenityCategories: ['included', 'accessibility'],
  defaultBookingMode: 'TICKETS',
  emptyStates: {
    description: 'Ingen beskrivelse tilgjengelig for dette arrangementet.',
    amenities: 'Ingen fasiliteter er registrert.',
    rules: 'Ingen regler er spesifisert for dette arrangementet.',
    faq: 'Ingen ofte stilte spørsmål er tilgjengelig.',
    activity: 'Ingen økter er planlagt.',
  },
};

const otherConfig: ListingTypeConfig = {
  type: 'OTHER',
  labelKey: 'listingTypes.other',
  iconName: 'grid',
  keyFacts: [
    {
      key: 'capacity',
      icon: 'users',
      labelKey: 'keyFacts.capacity',
      format: formatCapacity,
      show: (kf) => !!kf.capacity && kf.capacity > 0,
      priority: 1,
    },
    {
      key: 'quantity',
      icon: 'package',
      labelKey: 'keyFacts.quantity',
      format: formatQuantity,
      show: (kf) => !!kf.quantity && kf.quantity > 0,
      priority: 2,
    },
    {
      key: 'bookingMode',
      icon: 'calendar',
      labelKey: 'keyFacts.bookingMode',
      format: (v) => {
        const modes: Record<string, string> = {
          SLOTS: 'Timebasert',
          ALL_DAY: 'Heldags',
          DURATION: 'Varighet',
          TICKETS: 'Billetter',
          NONE: 'Ikke bookbar',
        };
        return modes[v as string] || '';
      },
      show: (kf) => !!kf.bookingMode && kf.bookingMode !== 'NONE',
      priority: 3,
    },
  ],
  activityTab: {
    labelKey: 'Aktivitet',
    type: 'rentals',
    showCalendar: false,
    showTimeline: true,
    emptyStateKey: 'empty.noHistory',
  },
  showOpeningHours: false,
  showCapacity: true,
  showArea: true,
  amenityCategories: ['general'],
  defaultBookingMode: 'DURATION',
  emptyStates: {
    description: 'Ingen beskrivelse tilgjengelig.',
    amenities: 'Ingen fasiliteter er registrert.',
    rules: 'Ingen regler er spesifisert.',
    faq: 'Ingen ofte stilte spørsmål er tilgjengelig.',
    activity: 'Ingen aktivitetshistorikk er tilgjengelig.',
  },
};

// =============================================================================
// Configuration Map
// =============================================================================

const configMap: Record<ListingType, ListingTypeConfig> = {
  FACILITY: facilityConfig,
  EQUIPMENT: equipmentConfig,
  EVENT: eventConfig,
  OTHER: otherConfig,
};

// =============================================================================
// Category Overrides (tab labels + config per Convex categoryKey)
// =============================================================================

export interface TabConfig {
  id: string;
  label: string;
}

interface CategoryOverride {
  tabs: TabConfig[];
  showOpeningHours: boolean;
  defaultBookingMode: BookingMode;
  activityTabLabel?: string;
}

const categoryOverrides: Record<string, CategoryOverride> = {
  LOKALER: {
    tabs: [
      { id: 'overview', label: 'Oversikt' },
      { id: 'activity', label: 'Aktivitetskalender' },
      { id: 'rules', label: 'Retningslinjer' },
      { id: 'faq', label: 'Ofte stilte spørsmål' },
    ],
    showOpeningHours: true,
    defaultBookingMode: 'SLOTS',
  },
  SPORT: {
    tabs: [
      { id: 'overview', label: 'Oversikt' },
      { id: 'activity', label: 'Book tid' },
      { id: 'rules', label: 'Regler' },
      { id: 'faq', label: 'FAQ' },
    ],
    showOpeningHours: true,
    defaultBookingMode: 'SLOTS',
  },
  ARRANGEMENTER: {
    tabs: [
      { id: 'overview', label: 'Oversikt' },
      { id: 'activity', label: 'Program' },
      { id: 'rules', label: 'Billetter' },
      { id: 'faq', label: 'FAQ' },
    ],
    showOpeningHours: false,
    defaultBookingMode: 'TICKETS',
  },
  TORGET: {
    tabs: [
      { id: 'overview', label: 'Oversikt' },
      { id: 'activity', label: 'Tilgjengelighet' },
      { id: 'rules', label: 'Leiebetingelser' },
      { id: 'faq', label: 'FAQ' },
    ],
    showOpeningHours: true,
    defaultBookingMode: 'ALL_DAY',
  },
};

// =============================================================================
// Presenter Class
// =============================================================================

export class ListingTypePresenter {
  private config: ListingTypeConfig;
  private categoryOverride: CategoryOverride | undefined;

  constructor(listingType: ListingType, categoryKey?: string) {
    this.config = configMap[listingType] || configMap.OTHER;
    if (categoryKey) {
      this.categoryOverride = categoryOverrides[categoryKey.toUpperCase()];
    }
  }

  get type(): ListingType {
    return this.config.type;
  }

  get labelKey(): string {
    return this.config.labelKey;
  }

  get iconName(): string {
    return this.config.iconName;
  }

  get showOpeningHours(): boolean {
    return this.categoryOverride?.showOpeningHours ?? this.config.showOpeningHours;
  }

  get activityTabConfig(): ActivityTabConfig {
    return this.config.activityTab;
  }

  get amenityCategories(): string[] {
    return this.config.amenityCategories;
  }

  get defaultBookingMode(): BookingMode {
    return this.categoryOverride?.defaultBookingMode ?? this.config.defaultBookingMode;
  }

  /**
   * Get category-aware tab configuration.
   * Returns category-specific tabs if available, otherwise falls back to type defaults.
   */
  get tabs(): TabConfig[] {
    if (this.categoryOverride) {
      return this.categoryOverride.tabs;
    }
    return [
      { id: 'overview', label: 'Oversikt' },
      { id: 'activity', label: this.config.activityTab.labelKey },
      { id: 'rules', label: 'Retningslinjer' },
      { id: 'faq', label: 'FAQ' },
    ];
  }

  /**
   * Get the key facts to display, sorted by priority
   */
  getKeyFacts(keyFacts: KeyFacts): Array<{
    key: string;
    icon: string;
    label: string;
    value: string;
  }> {
    return this.config.keyFacts
      .filter((config) => config.show(keyFacts))
      .sort((a, b) => a.priority - b.priority)
      .map((config) => ({
        key: config.key,
        icon: config.icon,
        label: config.labelKey,
        value: config.format
          ? config.format(keyFacts[config.key], keyFacts)
          : String(keyFacts[config.key] || ''),
      }));
  }

  /**
   * Get empty state message for a section
   */
  getEmptyState(section: keyof ListingTypeConfig['emptyStates']): string {
    return this.config.emptyStates[section];
  }

  /**
   * Check if a specific feature should be shown
   */
  shouldShow(feature: 'openingHours' | 'capacity' | 'area'): boolean {
    switch (feature) {
      case 'openingHours':
        return this.config.showOpeningHours;
      case 'capacity':
        return this.config.showCapacity;
      case 'area':
        return this.config.showArea;
      default:
        return false;
    }
  }
}

// =============================================================================
// Factory Function
// =============================================================================

export function createPresenter(listingType: ListingType, categoryKey?: string): ListingTypePresenter {
  return new ListingTypePresenter(listingType, categoryKey);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get localized listing type label
 */
export function getListingTypeLabel(type: ListingType): string {
  const labels: Record<ListingType, string> = {
    FACILITY: 'Lokale',
    EQUIPMENT: 'Utstyr',
    EVENT: 'Arrangement',
    OTHER: 'Annet',
  };
  return labels[type] || labels.OTHER;
}

/**
 * Get booking mode label
 */
export function getBookingModeLabel(mode: BookingMode): string {
  const labels: Record<BookingMode, string> = {
    SLOTS: 'Timebasert booking',
    ALL_DAY: 'Heldagsbooking',
    DURATION: 'Varighetsbasert',
    TICKETS: 'Billettbooking',
    NONE: 'Ikke bookbar',
  };
  return labels[mode] || '';
}

/**
 * Check if listing is currently open (for facilities)
 */
export function isCurrentlyOpen(
  openingHours: { regular: Array<{ dayIndex: number; open?: string; close?: string; isClosed: boolean }> } | undefined
): { isOpen: boolean; statusText: string; nextChange?: string } {
  if (!openingHours?.regular) {
    return { isOpen: false, statusText: 'Ukjent' };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todayHours = openingHours.regular.find((h) => h.dayIndex === currentDay);

  if (!todayHours || todayHours.isClosed || !todayHours.open || !todayHours.close) {
    return { isOpen: false, statusText: 'Stengt i dag' };
  }

  const isOpen = currentTime >= todayHours.open && currentTime < todayHours.close;

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Åpent nå',
      nextChange: `Stenger ${todayHours.close}`,
    };
  } else if (currentTime < todayHours.open) {
    return {
      isOpen: false,
      statusText: 'Stengt nå',
      nextChange: `Åpner ${todayHours.open}`,
    };
  } else {
    return { isOpen: false, statusText: 'Stengt' };
  }
}
