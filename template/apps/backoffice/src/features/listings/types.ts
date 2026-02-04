/**
 * Listings Feature Types
 *
 * Type definitions for the Listings module in Backoffice
 */

import type { Listing, ListingStatus, ListingType, BookingModel, PricingUnit } from '@xaheen/sdk';

// Re-export SDK ListingType for backoffice use
export type { ListingType };

// =============================================================================
// Listing Types Extended for Backoffice
// =============================================================================

// Use SDK's ListingType directly - no custom types needed
export type BackofficeListingType = ListingType;

export interface ListingLocation {
  address?: string;
  city?: string;
  postalCode?: string;
  municipality?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ListingOpeningHours {
  monday?: { open: string; close: string } | null;
  tuesday?: { open: string; close: string } | null;
  wednesday?: { open: string; close: string } | null;
  thursday?: { open: string; close: string } | null;
  friday?: { open: string; close: string } | null;
  saturday?: { open: string; close: string } | null;
  sunday?: { open: string; close: string } | null;
}

export interface ListingOpeningException {
  date: string;
  closed?: boolean;
  open?: string;
  close?: string;
  reason?: string;
}

export interface ListingBookingConfig {
  bookingModel: BookingModel;
  slotDurationMinutes?: number;
  minLeadTimeHours?: number;
  maxAdvanceDays?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  approvalRequired?: boolean;
  paymentRequired?: boolean;
  depositPercent?: number;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  allowRecurring?: boolean;
  allowSeasonalLease?: boolean;
}

export interface ListingSEO {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface ListingFAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ListingRule {
  id: string;
  title: string;
  description?: string;
  type: 'general' | 'booking' | 'cancellation' | 'access' | 'safety' | 'other';
  order: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  unit: 'per_booking' | 'per_hour' | 'per_day' | 'per_person';
  isRequired?: boolean;
  maxQuantity?: number;
  availableFor?: BackofficeListingType[];
}

export interface ListingContent {
  fullDescription?: string;
  highlights?: string[];
  amenities?: string[];
  includedFacilities?: string[];
  tags?: string[];
}

export interface ListingExtras {
  faq?: ListingFAQItem[];
  rules?: ListingRule[];
  additionalServices?: AdditionalService[];
}

export interface ListingMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  order: number;
  alt?: string;
  isCover?: boolean;
}

export interface ListingDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  description?: string;
}

/**
 * BackofficeListing extends the SDK Listing with additional fields
 * for the backoffice admin interface
 */
export interface BackofficeListing {
  // Core fields from SDK Listing
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: ListingStatus;
  pricing?: {
    basePrice: number;
    currency: string;
    unit: PricingUnit;
    hourlyRate?: number;
  };
  images?: string[];
  createdAt: string;
  updatedAt: string;

  // Extended fields for backoffice
  type: BackofficeListingType;
  slug: string;
  visibility?: 'public' | 'unlisted' | 'private';
  location?: ListingLocation;
  openingHours?: ListingOpeningHours;
  openingExceptions?: ListingOpeningException[];
  bookingConfig?: ListingBookingConfig;
  seo?: ListingSEO;
  content?: ListingContent;
  extras?: ListingExtras;
  media?: ListingMedia[];
  documents?: ListingDocument[];
  capacity?: number;
  quantity?: number;
  areaSquareMeters?: number;
  floors?: number;
  organizationId?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Type alias for SDK Listing - used when working with API responses
 */
export type SDKListing = Listing;

// =============================================================================
// Create/Update DTOs
// =============================================================================

export interface CreateListingDTO {
  type: BackofficeListingType;
  name: string;
  slug?: string;
  description?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  location?: ListingLocation;
  capacity?: number;
  quantity?: number;
  areaSquareMeters?: number;
  pricing?: {
    basePrice: number;
    currency?: string;
    unit: PricingUnit;
  };
  content?: ListingContent;
  openingHours?: ListingOpeningHours;
  bookingConfig?: ListingBookingConfig;
  seo?: ListingSEO;
  organizationId?: string;
}

export interface UpdateListingDTO extends Partial<CreateListingDTO> {
  status?: ListingStatus;
  openingExceptions?: ListingOpeningException[];
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface ListingQueryFilters {
  type?: BackofficeListingType;
  status?: ListingStatus;
  search?: string;
  city?: string;
  municipality?: string;
  organizationId?: string;
  minCapacity?: number;
  maxCapacity?: number;
  hasBookingConfig?: boolean;
  updatedBy?: string;
  sortBy?: 'updatedAt' | 'createdAt' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================================================
// Wizard Types
// =============================================================================

export type WizardStepId =
  | 'basics'
  | 'location'
  | 'capacity'
  | 'content'
  | 'openingHours'
  | 'bookingConfig'
  | 'media'
  | 'review';

export interface WizardStep {
  id: WizardStepId;
  label: string;
  labelNorwegian: string;
  icon?: string;
  required?: boolean;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  data: Partial<BackofficeListing>;
  errors: Record<string, string[]>;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt?: Date;
}

// Type-aware step visibility (using SDK ListingType values)
export const WIZARD_STEPS_BY_TYPE: Record<BackofficeListingType, WizardStepId[]> = {
  SPACE: ['basics', 'location', 'capacity', 'content', 'openingHours', 'bookingConfig', 'media', 'review'],
  RESOURCE: ['basics', 'capacity', 'content', 'bookingConfig', 'media', 'review'],
  SERVICE: ['basics', 'content', 'bookingConfig', 'media', 'review'],
  EVENT: ['basics', 'location', 'capacity', 'content', 'bookingConfig', 'media', 'review'],
  VEHICLE: ['basics', 'capacity', 'content', 'bookingConfig', 'media', 'review'],
  OTHER: ['basics', 'content', 'bookingConfig', 'media', 'review'],
};

export const ALL_WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', label: 'Basics', labelNorwegian: 'Grunnleggende', required: true },
  { id: 'location', label: 'Location', labelNorwegian: 'Lokasjon', required: false },
  { id: 'capacity', label: 'Capacity', labelNorwegian: 'Kapasitet', required: false },
  { id: 'content', label: 'Content', labelNorwegian: 'Innhold', required: false },
  { id: 'openingHours', label: 'Opening Hours', labelNorwegian: 'Åpningstider', required: false },
  { id: 'bookingConfig', label: 'Booking', labelNorwegian: 'Booking', required: true },
  { id: 'media', label: 'Media', labelNorwegian: 'Media', required: true },
  { id: 'review', label: 'Review', labelNorwegian: 'Gjennomgang', required: true },
];

// =============================================================================
// Filter State Types
// =============================================================================

export type ViewMode = 'table' | 'grid';

export interface FilterState {
  filters: ListingQueryFilters;
  viewMode: ViewMode;
}

// =============================================================================
// Realtime Event Types
// =============================================================================

export type ListingRealtimeEventType =
  | 'LISTING_CREATED'
  | 'LISTING_UPDATED'
  | 'LISTING_PUBLISHED'
  | 'LISTING_ARCHIVED'
  | 'LISTING_DELETED'
  | 'LISTING_MEDIA_UPLOADED'
  | 'LISTING_MEDIA_DELETED';

export interface ListingRealtimeEvent {
  type: ListingRealtimeEventType;
  listingId: string;
  tenantId: string;
  userId: string;
  userName?: string;
  timestamp: string;
  changes?: string[];
  payload?: unknown;
}

// =============================================================================
// Audit Types
// =============================================================================

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'publish' | 'archive';
  resourceId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditQueryParams {
  resource?: string;
  action?: string;
  userId?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Permission Types
// =============================================================================

export interface ListingPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
  canViewAudit: boolean;
}

// =============================================================================
// Validation Types
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Publishing requirements by type (using SDK ListingType values)
export const PUBLISH_REQUIREMENTS: Record<BackofficeListingType, string[]> = {
  SPACE: ['name', 'type', 'description', 'location.address', 'openingHours', 'media'],
  RESOURCE: ['name', 'type', 'description', 'quantity', 'media'],
  SERVICE: ['name', 'type', 'description', 'media'],
  EVENT: ['name', 'type', 'description', 'capacity', 'media'],
  VEHICLE: ['name', 'type', 'description', 'quantity', 'media'],
  OTHER: ['name', 'type', 'description', 'media'],
};
