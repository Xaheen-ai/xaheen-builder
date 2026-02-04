/**
 * Xaheen SDK - Transform Layer
 *
 * Re-exports all transform functions and types for converting between
 * the Convex internal data shapes and the digdir client-sdk shapes.
 *
 * Usage:
 *   import { convexResourceToListing, toPaginatedResponse } from '@xaheen/sdk/transforms';
 */

// Common utilities (pagination, query/mutation result wrappers, timestamp helpers)
export {
    toPaginatedResponse,
    toSingleResponse,
    toQueryResult,
    toMutationResult,
    epochToISO,
    isoToEpoch,
} from './common';

export type {
    PaginationMeta,
    PaginatedResponse,
    SingleResponse,
    QueryResult,
    MutationResult,
} from './common';

// Listing transforms and types
export {
    convexResourceToListing,
    listingInputToConvexResource,
    transformListing,
} from './listing';

export type {
    Listing,
    ListingType,
    ListingStatus,
    ListingPricing,
    ListingLocation,
    ListingMetadata,
    BookingModel,
    PricingUnit,
    CreateListingDTO,
    UpdateListingDTO,
    ListingQueryParams,
    AvailabilityQueryParams,
    PublicListingParams,
    ConvexResource,
    UiListing,
} from './listing';

// Booking transforms and types
export {
    convexBookingToBooking,
    bookingInputToConvex,
    bookingUpdateToConvex,
} from './booking';

export type {
    Booking as DigdirBooking,
    BookingStatus as DigdirBookingStatus,
    PaymentStatus,
    BookingMetadata,
    CreateBookingDTO,
    UpdateBookingDTO,
    CancelBookingDTO,
    BookingQueryParams,
    ConvexBooking,
} from './booking';
