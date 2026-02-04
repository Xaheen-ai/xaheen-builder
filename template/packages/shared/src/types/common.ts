/**
 * Common Types
 * 
 * Base types used across the platform.
 */

// =============================================================================
// App Types
// =============================================================================

export type AppId = 'backoffice' | 'dashboard' | 'web' | 'minside' | 'docs' | 'monitoring';

export interface AppConfig {
    appId: AppId;
    name: string;
    port: number;
    description: string;
}

// =============================================================================
// Locale Types
// =============================================================================

export type Locale = 'nb' | 'en' | 'ar' | 'fr';
export type Direction = 'ltr' | 'rtl';

// =============================================================================
// Status Types
// =============================================================================

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'deleted' | 'archived';
export type PublishStatus = 'draft' | 'published' | 'unpublished' | 'archived';

// =============================================================================
// ID Types (branded types for type safety)
// =============================================================================

export type TenantId = string & { readonly __brand: 'TenantId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type OrganizationId = string & { readonly __brand: 'OrganizationId' };
export type ResourceId = string & { readonly __brand: 'ResourceId' };
export type BookingId = string & { readonly __brand: 'BookingId' };
export type CategoryId = string & { readonly __brand: 'CategoryId' };
export type AmenityId = string & { readonly __brand: 'AmenityId' };

// =============================================================================
// Timestamp Types
// =============================================================================

export interface Timestamps {
    createdAt: string;
    updatedAt: string;
}

export interface SoftDelete {
    deletedAt?: string;
}

// =============================================================================
// Pricing Types
// =============================================================================

export type Currency = 'NOK' | 'SEK' | 'DKK' | 'EUR' | 'USD';

export type PricingUnit = 
    | 'hour' 
    | 'day' 
    | 'week' 
    | 'month' 
    | 'session' 
    | 'person' 
    | 'unit'
    | 'time'
    | 'dag'
    | 'uke'
    | 'måned'
    | 'stk';

export interface Pricing {
    basePrice: number;
    currency: Currency;
    unit: PricingUnit;
    weekendMultiplier?: number;
    peakHoursMultiplier?: number;
    depositAmount?: number;
    cleaningFee?: number;
}

// =============================================================================
// Location Types
// =============================================================================

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Address {
    street?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    country?: string;
    municipality?: string;
}

export interface Location extends Address {
    coordinates?: Coordinates;
}

// =============================================================================
// Image Types
// =============================================================================

export interface Image {
    url: string;
    alt?: string;
    isPrimary?: boolean;
    width?: number;
    height?: number;
}

// =============================================================================
// Metadata Types
// =============================================================================

export type Metadata = Record<string, unknown>;
