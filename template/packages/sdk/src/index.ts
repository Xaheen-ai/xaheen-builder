/**
 * @xaheen/sdk
 *
 * Source-only SDK for Xaheen applications using Convex backend.
 *
 * @example
 * ```typescript
 * import {
 *   XalaConvexProvider,
 *   useAuth,
 *   useResources,
 *   useBookings,
 * } from '@xaheen/sdk';
 *
 * function App() {
 *   return (
 *     <XalaConvexProvider>
 *       <MyApp />
 *     </XalaConvexProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { user, isAuthenticated, signOut } = useAuth();
 *   const { resources, isLoading } = useResources({ tenantId });
 *
 *   return (
 *     <div>
 *       {isLoading ? 'Loading...' : resources.map(r => r.name)}
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================
// CONVEX PROVIDER
// ============================================

export { XalaConvexProvider, ConvexProvider } from './convex-provider';

// Convex API types for type-safe function references
export { api, type TenantId, type ResourceId, type BookingId, type UserId, type OrganizationId } from './convex-api';

// ============================================
// TYPES
// ============================================

export * from './types';

// ============================================
// HOOKS
// ============================================

export * from './hooks';

// ============================================
// COMPATIBILITY SHIMS
// ============================================
// No-op stubs for code migrated from @digilist/client-sdk.
// initializeClient, queryKeys, realtime hooks, etc.

export * from './compat';

// ============================================
// TRANSFORMS (re-exported for convenience)
// ============================================
// Note: Type names that overlap with ./hooks (Listing, ListingType, etc.)
// are intentionally omitted here — the canonical exports come from ./hooks.

export {
    toPaginatedResponse,
    toQueryResult,
    toMutationResult,
    epochToISO,
    isoToEpoch,
    convexResourceToListing,
    listingInputToConvexResource,
    transformListing,
    convexBookingToBooking,
    bookingInputToConvex,
    bookingUpdateToConvex,
} from './transforms';

export type {
    PaginationMeta,
    QueryResult,
    MutationResult,
    BookingModel,
    PricingUnit,
    ConvexResource,
    UiListing,
    DigdirBooking,
    DigdirBookingStatus,
    PaymentStatus,
    BookingMetadata,
    CreateBookingDTO,
    UpdateBookingDTO,
    CancelBookingDTO,
    BookingQueryParams,
    ConvexBooking,
} from './transforms';

// ============================================
// FORMATTERS
// ============================================

export {
    formatDate,
    formatTime,
    formatDateTime,
    formatCurrency,
    formatPercent,
    formatWeekRange,
    formatWeekdays,
    formatPeriod,
    formatTimeSlot,
    getListingTypeLabel,
} from './formatters';

// ============================================
// CONSTANTS
// ============================================

export { LISTING_TYPE_OPTIONS, LISTING_TYPE_LABELS } from './constants';

// ============================================
// UPLOAD UTILITIES
// ============================================

export {
    UploadProgressTracker,
    formatBytes,
    formatSpeed,
    formatETA,
} from './upload';
export type { UploadProgressEvent } from './upload';
