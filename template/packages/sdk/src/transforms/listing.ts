/**
 * Xaheen SDK - Listing Transforms
 *
 * Maps between the Convex "resource" shape (as stored in the database and
 * returned by Convex queries) and the digdir "Listing" shape expected by
 * the client-sdk / UI layer.
 *
 * Convex resources have:
 *   _id, _creationTime, tenantId, name, slug, description, categoryKey,
 *   subcategoryKeys, timeMode, features, status, requiresApproval, capacity,
 *   inventoryTotal, images (array of objects), pricing (object), metadata, ...
 *
 * Digdir Listings expect:
 *   id, tenantId, name, slug, type, status, description, images (string[]),
 *   pricing (ListingPricing), capacity, address, location, metadata,
 *   createdAt (ISO), updatedAt (ISO), ...
 */

import { epochToISO, isoToEpoch } from './common';

// =============================================================================
// Digdir-Compatible Types
// =============================================================================

export type ListingType = 'SPACE' | 'RESOURCE' | 'SERVICE' | 'EVENT' | 'VEHICLE' | 'OTHER';
export type ListingStatus = 'draft' | 'published' | 'archived' | 'maintenance';
export type BookingModel = 'TIME_RANGE' | 'SLOT' | 'ALL_DAY' | 'QUANTITY' | 'CAPACITY' | 'PACKAGE';
export type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';

export interface ListingPricing {
    basePrice: number;
    currency: string;
    unit: PricingUnit;
    weekendMultiplier?: number;
    peakHoursMultiplier?: number;
}

export interface ListingLocation {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    municipality?: string;
}

export interface ListingMetadata {
    address?: string;
    city?: string;
    postalCode?: string;
    location?: ListingLocation;
    facilities?: string[];
    amenities?: string[];
    features?: string[];
    openingHours?: Record<string, { open: string; close: string }>;
    rules?: string[];
    faq?: Array<{ id?: string; question: string; answer: string }>;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
}

export interface Listing {
    id: string;
    tenantId: string;
    organizationId?: string;
    name: string;
    slug: string;
    type: ListingType;
    /** Original Convex categoryKey preserved for backward compatibility. */
    categoryKey?: string;
    subcategoryKeys?: string[];
    bookingModel?: BookingModel;
    status: ListingStatus;
    description?: string;
    images: string[];
    pricing: ListingPricing;
    capacity?: number;
    quantity?: number;
    address?: string;
    location?: ListingLocation;
    metadata?: ListingMetadata;
    averageRating?: number;
    reviewCount?: number;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// DTOs
// =============================================================================

export interface CreateListingDTO {
    name: string;
    slug?: string;
    type: ListingType;
    bookingModel?: BookingModel;
    description?: string;
    images?: string[];
    pricing?: Partial<ListingPricing>;
    capacity?: number;
    organizationId?: string;
    metadata?: ListingMetadata;
}

export interface UpdateListingDTO {
    name?: string;
    description?: string;
    images?: string[];
    pricing?: Partial<ListingPricing>;
    capacity?: number;
    metadata?: ListingMetadata;
}

export interface ListingQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    type?: ListingType;
    status?: ListingStatus;
    organizationId?: string;
    search?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    maxCapacity?: number;
    amenities?: string;
}

export interface AvailabilityQueryParams {
    startDate: string;
    endDate: string;
    duration?: number;
}

export interface PublicListingParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    type?: ListingType;
    city?: string;
    municipality?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
    date?: string;
    search?: string;
}

// =============================================================================
// Convex Raw Shape (loose – matches what Convex queries actually return)
// =============================================================================

/** Minimal shape of a Convex resource document as returned by a query. */
export interface ConvexResource {
    _id: string;
    _creationTime: number;
    tenantId: string;
    organizationId?: string;
    name: string;
    slug: string;
    description?: string;
    categoryKey: string;
    subcategoryKeys?: string[];
    timeMode?: string;
    features?: Array<{ name: string; value: unknown }>;
    ruleSetKey?: string;
    status: string;
    requiresApproval?: boolean;
    capacity?: number;
    inventoryTotal?: number;
    images?: Array<{ url: string; alt?: string; isPrimary?: boolean } | string>;
    pricing?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    /** If the resource carries an explicit updatedAt epoch. */
    updatedAt?: number;
}

// =============================================================================
// Category Key -> ListingType Mapping
// =============================================================================

/**
 * Maps known Convex `categoryKey` values (Norwegian and English) to the
 * digdir `ListingType` enum.  Unknown keys fall back to `'OTHER'`.
 */
const CATEGORY_TO_LISTING_TYPE: Record<string, ListingType> = {
    // Norwegian keys used in the Convex schema (matching seeds/categories.ts)
    'LOKALER': 'SPACE',
    'SPORT': 'RESOURCE',
    'ARRANGEMENTER': 'EVENT',
    'TORGET': 'SERVICE',
    // Legacy keys (keep for backward compatibility)
    'ARRANGEMENT': 'EVENT',
    'TORG': 'SERVICE',
    // English aliases
    'space': 'SPACE',
    'SPACE': 'SPACE',
    'resource': 'RESOURCE',
    'RESOURCE': 'RESOURCE',
    'event': 'EVENT',
    'EVENT': 'EVENT',
    'service': 'SERVICE',
    'SERVICE': 'SERVICE',
    'vehicle': 'VEHICLE',
    'VEHICLE': 'VEHICLE',
    // Common SDK ResourceCategory values
    'boat': 'VEHICLE',
    'cabin': 'SPACE',
    'equipment': 'RESOURCE',
    'facility': 'SPACE',
    'other': 'OTHER',
    'OTHER': 'OTHER',
};

function categoryKeyToListingType(categoryKey: string): ListingType {
    return CATEGORY_TO_LISTING_TYPE[categoryKey] ?? 'OTHER';
}

// =============================================================================
// Status Mapping
// =============================================================================

/**
 * Maps Convex resource statuses to the narrower digdir ListingStatus set.
 * Convex allows: draft | published | active | archived | maintenance | deleted
 * Digdir allows: draft | published | archived | maintenance
 */
function statusToListingStatus(status: string): ListingStatus {
    switch (status) {
        case 'draft':
            return 'draft';
        case 'published':
        case 'active':
            return 'published';
        case 'archived':
        case 'deleted':
            return 'archived';
        case 'maintenance':
            return 'maintenance';
        default:
            return 'draft';
    }
}

// =============================================================================
// Convex Resource -> Listing
// =============================================================================

/**
 * Transform a raw Convex resource document into the digdir `Listing` shape.
 *
 * - `_id` is mapped to `id`
 * - `categoryKey` is mapped to `type` (ListingType) and also kept as-is
 * - Epoch timestamps (`_creationTime`, optional `updatedAt`) become ISO strings
 * - `images` are normalised to `string[]` (Convex may store objects with `url`)
 * - `pricing` is normalised to `ListingPricing`
 * - Location information is extracted from `metadata` when available
 */
export function convexResourceToListing(resource: ConvexResource): Listing {
    const meta = (resource.metadata ?? {}) as Record<string, unknown>;
    const pricingRaw = resource.pricing ?? {};

    // --- images: normalise to string[] ---
    const images: string[] = (resource.images ?? []).map((img) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && 'url' in img) return (img as { url: string }).url;
        return '';
    }).filter(Boolean);

    // --- pricing ---
    const pricing: ListingPricing = {
        basePrice: Number((pricingRaw as Record<string, unknown>).basePrice ?? (pricingRaw as Record<string, unknown>).pricePerHour ?? 0),
        currency: String((pricingRaw as Record<string, unknown>).currency ?? 'NOK'),
        unit: ((pricingRaw as Record<string, unknown>).unit as PricingUnit) ?? 'hour',
        weekendMultiplier: (pricingRaw as Record<string, unknown>).weekendMultiplier as number | undefined,
        peakHoursMultiplier: (pricingRaw as Record<string, unknown>).peakHoursMultiplier as number | undefined,
    };

    // --- location (from metadata or resource-level fields) ---
    const metaCoords = (meta.coordinates ?? {}) as Record<string, unknown>;
    const metaLocation = (meta.location ?? {}) as Record<string, unknown>;
    const location: ListingLocation | undefined = (
        metaLocation.lat != null ||
        metaLocation.lng != null ||
        metaLocation.latitude != null ||
        metaLocation.longitude != null ||
        metaCoords.lat != null ||
        metaCoords.lng != null ||
        metaLocation.address != null ||
        metaLocation.city != null ||
        meta.address != null ||
        meta.city != null
    )
        ? {
              lat: (metaLocation.lat ?? metaCoords.lat) as number | undefined,
              lng: (metaLocation.lng ?? metaCoords.lng) as number | undefined,
              latitude: (metaLocation.latitude ?? metaCoords.lat) as number | undefined,
              longitude: (metaLocation.longitude ?? metaCoords.lng) as number | undefined,
              address: (metaLocation.address as string) ?? (meta.address as string) ?? undefined,
              postalCode: (metaLocation.postalCode as string) ?? (meta.postalCode as string) ?? undefined,
              city: (metaLocation.city as string) ?? (meta.city as string) ?? undefined,
              country: metaLocation.country as string | undefined,
              municipality: metaLocation.municipality as string | undefined,
          }
        : undefined;

    // --- metadata (pass through, cast to ListingMetadata) ---
    const metadata: ListingMetadata | undefined = Object.keys(meta).length > 0
        ? (meta as unknown as ListingMetadata)
        : undefined;

    // --- timestamps ---
    const createdAt = new Date(resource._creationTime).toISOString();
    const updatedAt = resource.updatedAt
        ? new Date(resource.updatedAt).toISOString()
        : createdAt;

    // --- address (root-level convenience) ---
    const address = location?.address ?? (meta.address as string | undefined);

    return {
        id: resource._id,
        tenantId: resource.tenantId,
        organizationId: resource.organizationId,
        name: resource.name,
        slug: resource.slug,
        type: categoryKeyToListingType(resource.categoryKey),
        categoryKey: resource.categoryKey,
        subcategoryKeys: resource.subcategoryKeys,
        status: statusToListingStatus(resource.status),
        description: resource.description,
        images,
        pricing,
        capacity: resource.capacity,
        quantity: resource.inventoryTotal,
        address,
        location,
        metadata,
        createdAt,
        updatedAt,
    };
}

// =============================================================================
// CreateListingDTO -> Convex Create Args
// =============================================================================

/**
 * Transform a `CreateListingDTO` (digdir shape) into the arguments expected
 * by the Convex `domain.resources.create` mutation.
 *
 * The caller is responsible for supplying `tenantId` separately — this
 * function only maps the DTO fields that originate from user input.
 */
// =============================================================================
// Listing -> UI ListingCard Props (transformListing)
// =============================================================================

/** Shape expected by DS ListingCard component. */
export interface UiListing {
    id: string;
    name: string;
    slug: string;
    type: string;
    listingType: string;
    status: string;
    description: string;
    image?: string;
    location: string;
    facilities: string[];
    moreFacilities: number;
    capacity: number;
    price: number;
    priceUnit: string;
    currency: string;
}

const UI_LISTING_TYPE_LABELS: Record<string, string> = {
    SPACE: 'Lokale',
    RESOURCE: 'Utstyr',
    SERVICE: 'Tjeneste',
    VEHICLE: 'Kjøretøy',
    EVENT: 'Arrangement',
    OTHER: 'Annet',
};

/**
 * Transform a Listing into the shape expected by the DS ListingCard component.
 * This is used by admin grid views in backoffice/minside.
 */
export function transformListing(listing: Listing): UiListing {
    const MAX_FACILITIES = 3;
    const amenities = listing.metadata?.amenities as string[] | undefined ?? [];
    const features = listing.metadata?.features as string[] | undefined ?? [];
    const allFacilities = [...amenities, ...features];

    // Location string - check both listing.location and listing.metadata for address/city
    const loc = listing.location;
    const meta = listing.metadata as Record<string, unknown> | undefined;
    const city = loc?.city ?? (meta?.city as string) ?? '';
    const addrRaw = loc?.address ?? (meta?.address as string | undefined) ?? listing.address;
    const address = typeof addrRaw === 'string' ? addrRaw : '';
    const postalCode = loc?.postalCode ?? (meta?.postalCode as string) ?? '';
    const location = [address, postalCode, city].filter(Boolean).join(', ') || '';

    return {
        id: listing.id,
        name: listing.name,
        slug: listing.slug,
        type: listing.type,
        listingType: UI_LISTING_TYPE_LABELS[listing.type] ?? listing.type,
        status: listing.status,
        description: listing.description ?? '',
        image: listing.images[0],
        location,
        facilities: allFacilities.slice(0, MAX_FACILITIES),
        moreFacilities: Math.max(0, allFacilities.length - MAX_FACILITIES),
        capacity: listing.capacity ?? 0,
        price: listing.pricing?.basePrice ?? 0,
        priceUnit: listing.pricing?.unit ?? 'time',
        currency: listing.pricing?.currency ?? 'NOK',
    };
}

// =============================================================================
// CreateListingDTO -> Convex Create Args
// =============================================================================

export function listingInputToConvexResource(input: CreateListingDTO): {
    name: string;
    slug: string;
    description?: string;
    categoryKey: string;
    timeMode: string;
    status: string;
    requiresApproval: boolean;
    capacity?: number;
    inventoryTotal?: number;
    images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    pricing: Record<string, unknown>;
    metadata: Record<string, unknown>;
    organizationId?: string;
} {
    // Reverse-map ListingType back to a categoryKey.  We use the type value
    // directly since the Convex schema accepts arbitrary strings.
    const categoryKey = input.type ?? 'OTHER';

    // Derive a slug when none is provided.
    const slug = input.slug ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Images: convert plain URLs into the Convex image-object shape.
    const images = (input.images ?? []).map((url, i) => ({
        url,
        alt: input.name,
        isPrimary: i === 0,
    }));

    // Pricing
    const pricing: Record<string, unknown> = {};
    if (input.pricing) {
        if (input.pricing.basePrice != null) pricing.basePrice = input.pricing.basePrice;
        if (input.pricing.currency) pricing.currency = input.pricing.currency;
        if (input.pricing.unit) pricing.unit = input.pricing.unit;
        if (input.pricing.weekendMultiplier != null) pricing.weekendMultiplier = input.pricing.weekendMultiplier;
        if (input.pricing.peakHoursMultiplier != null) pricing.peakHoursMultiplier = input.pricing.peakHoursMultiplier;
    }

    // Determine time mode from booking model
    const timeModeMap: Record<string, string> = {
        TIME_RANGE: 'time_range',
        SLOT: 'slot',
        ALL_DAY: 'all_day',
        QUANTITY: 'quantity',
        CAPACITY: 'capacity',
        PACKAGE: 'package',
    };
    const timeMode = input.bookingModel
        ? (timeModeMap[input.bookingModel] ?? 'time_range')
        : 'time_range';

    return {
        name: input.name,
        slug,
        description: input.description,
        categoryKey,
        timeMode,
        status: 'draft',
        requiresApproval: false,
        capacity: input.capacity,
        images,
        pricing,
        metadata: (input.metadata ?? {}) as Record<string, unknown>,
        organizationId: input.organizationId,
    };
}
