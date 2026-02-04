/**
 * Listing Details Feature - Type Definitions
 *
 * Comprehensive types for the listing details page supporting
 * FACILITY, EQUIPMENT, EVENT, and OTHER listing types.
 */

// =============================================================================
// Core Listing Types
// =============================================================================

export type ListingType = 'FACILITY' | 'EQUIPMENT' | 'EVENT' | 'OTHER';

export type BookingMode = 'SLOTS' | 'ALL_DAY' | 'DURATION' | 'TICKETS' | 'NONE';

export type ApprovalMode = 'NONE' | 'REQUIRED' | 'AUTO';

// =============================================================================
// Address & Location
// =============================================================================

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  municipality?: string;
  county?: string;
  country?: string;
  formatted: string;
  coordinates?: GeoCoordinates;
}

// =============================================================================
// Contact Information
// =============================================================================

export interface ContactInfo {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  organization?: string;
}

// =============================================================================
// Opening Hours
// =============================================================================

export interface DayHours {
  day: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, etc.
  open?: string;
  close?: string;
  isClosed: boolean;
  breaks?: Array<{ start: string; end: string }>;
}

export interface ExceptionalDay {
  date: string;
  label: string;
  hours?: { open: string; close: string };
  isClosed: boolean;
}

export interface OpeningHours {
  regular: DayHours[];
  exceptions?: ExceptionalDay[];
}

// =============================================================================
// Amenities & Facilities
// =============================================================================

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
  description?: string;
}

export interface IncludedFacility {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
}

// =============================================================================
// Rules & FAQ
// =============================================================================

export interface Rule {
  id: string;
  title: string;
  content: string;
  category?: 'general' | 'cancellation' | 'safety' | 'cleaning' | 'noise' | 'other';
  icon?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// =============================================================================
// Activity & History
// =============================================================================

export interface ListingEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  organizer?: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
}

export interface RentalHistoryItem {
  id: string;
  date: string;
  duration?: string;
  purpose?: string;
  status: 'completed' | 'cancelled';
}

export interface ActivityData {
  type: 'events' | 'rentals' | 'sessions';
  events?: ListingEvent[];
  rentals?: RentalHistoryItem[];
  totalCount?: number;
}

// =============================================================================
// Booking Configuration
// =============================================================================

export interface BookingConfig {
  enabled: boolean;
  mode: BookingMode;
  approval: ApprovalMode;
  paymentRequired: boolean;
  paymentMethods?: string[];
  minLeadTimeHours?: number;
  maxAdvanceDays?: number;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  freeCancellationHours?: number;
  depositRequired?: boolean;
  depositAmount?: number;
  termsUrl?: string;
}

// =============================================================================
// Listing Metadata
// =============================================================================

export interface ListingMetadata {
  description?: string;
  shortDescription?: string;
  amenities: Amenity[];
  includedFacilities: IncludedFacility[];
  rules: Rule[];
  faq: FAQItem[];
  tags?: string[];
  highlights?: string[];
}

// =============================================================================
// Listing Images
// =============================================================================

export interface ListingImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
  order?: number;
}

// =============================================================================
// Key Facts (Type-specific)
// =============================================================================

export interface KeyFacts {
  // Common
  capacity?: number;
  capacityLabel?: string;

  // Facility specific
  area?: number;
  areaUnit?: 'sqm' | 'sqft';
  floors?: number;

  // Equipment specific
  quantity?: number;
  unitLabel?: string;
  condition?: 'new' | 'good' | 'fair';

  // Event specific
  duration?: string;
  sessions?: number;

  // Accessibility
  wheelchairAccessible?: boolean;
  accessibilityFeatures?: string[];

  // Booking
  bookingMode?: BookingMode;
  approvalRequired?: boolean;
}

// =============================================================================
// Main Listing Type
// =============================================================================

export interface Listing {
  id: string;
  tenantId: string;
  type: ListingType;
  name: string;
  categoryKey?: string;
  category?: string;
  subcategory?: string;
  status: 'draft' | 'published' | 'archived';

  // Media
  images: ListingImage[];

  // Location
  address?: Address;

  // Contact
  contact?: ContactInfo;

  // Hours (primarily for facilities)
  openingHours?: OpeningHours;

  // Key characteristics
  keyFacts: KeyFacts;

  // Detailed metadata
  metadata: ListingMetadata;

  // Booking
  bookingConfig?: BookingConfig;

  // Activity/History
  activityData?: ActivityData;

  // Pricing
  pricing?: {
    basePrice?: number;
    currency?: string;
    unit?: string;
    displayPrice?: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Booking mode settings
  /** Enable season/long-term rental requests */
  allowSeasonRental?: boolean;
  /** Enable recurring booking patterns */
  allowRecurringBooking?: boolean;
}

// =============================================================================
// User Interaction Types
// =============================================================================

export interface FavoriteState {
  isFavorited: boolean;
  count?: number;
  lastToggled?: string;
}

export interface ShareOptions {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

// =============================================================================
// Audit Event Types
// =============================================================================

export type AuditEventType =
  | 'LISTING_VIEWED'
  | 'FAVORITE_ADDED'
  | 'FAVORITE_REMOVED'
  | 'LISTING_SHARED'
  | 'BOOKING_STARTED'
  | 'CONTACT_CLICKED';

export interface AuditEvent {
  type: AuditEventType;
  tenantId: string;
  listingId: string;
  userId?: string;
  correlationId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// =============================================================================
// Real-time Event Types
// =============================================================================

export type RealtimeEventType =
  | 'LISTING_UPDATED'
  | 'AVAILABILITY_CHANGED'
  | 'BOOKING_CREATED'
  | 'FAVORITE_COUNT_CHANGED';

export interface RealtimeEvent {
  type: RealtimeEventType;
  listingId: string;
  payload: unknown;
  timestamp: string;
}

// =============================================================================
// i18n Keys Structure
// =============================================================================

export interface ListingDetailsI18n {
  listingTypes: Record<ListingType, string>;
  bookingModes: Record<BookingMode, string>;
  tabs: {
    overview: string;
    activity: Record<ListingType, string>;
    rules: string;
    faq: string;
  };
  keyFacts: {
    capacity: string;
    area: string;
    quantity: string;
    duration: string;
    accessibility: string;
    bookingMode: string;
  };
  actions: {
    favorite: string;
    unfavorite: string;
    share: string;
    copyLink: string;
    openInMaps: string;
    sendMessage: string;
    book: string;
  };
  status: {
    openNow: string;
    closedNow: string;
    opensAt: string;
    closesAt: string;
  };
  empty: {
    noFaq: string;
    noRules: string;
    noAmenities: string;
    noActivity: string;
    noContact: string;
  };
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface ListingHeaderProps {
  listing: Listing;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
  isLoading?: boolean;
}

export interface KeyFactsRowProps {
  keyFacts: KeyFacts;
  listingType: ListingType;
  bookingMode?: BookingMode;
}

export interface TabsProps {
  listing: Listing;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface SidebarProps {
  listing: Listing;
  onBookingClick?: () => void;
  onContactClick?: () => void;
}
