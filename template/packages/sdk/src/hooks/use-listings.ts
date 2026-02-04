/**
 * Xaheen SDK - Listing Hooks (Tier 1 Adapter)
 *
 * Provides React Query-shaped hooks (`{ data, isLoading, error }` for queries,
 * `{ mutate, mutateAsync, isLoading, error, isSuccess }` for mutations) backed
 * by the Convex real-time engine.
 *
 * These hooks mirror the function signatures of the digdir client-sdk
 * `use-listings.ts` so that consuming apps can swap implementations without
 * touching component code.
 *
 * Internally each hook delegates to Convex `useQuery` / `useMutation` and
 * transforms the Convex `Resource` document shape into the canonical `Listing`
 * shape expected by the UI layer.
 */

import { useQuery as useConvexQueryRaw, useMutation as useConvexMutationRaw } from "convex/react";
import { api, type TenantId, type ResourceId, type OrganizationId } from "../convex-api";
import { useCallback, useRef, useState } from "react";
import { toPaginatedResponse, toSingleResponse, type PaginatedResponse, type SingleResponse } from "../transforms/common";
import { useResolveTenantId } from "./use-tenant-id";

// ============================================================================
// Listing Domain Types (matches digdir client-sdk types/listing.ts)
// ============================================================================

export type ListingType = "SPACE" | "RESOURCE" | "SERVICE" | "EVENT" | "VEHICLE" | "OTHER";
export type BookingModel = "TIME_RANGE" | "SLOT" | "ALL_DAY" | "QUANTITY" | "CAPACITY" | "PACKAGE";
export type ListingStatus = "draft" | "published" | "archived" | "maintenance";
export type PricingUnit = "hour" | "day" | "booking" | "week" | "month";

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
  openingHours?: Record<string, { open: string; close: string }> | Array<{
    day: string;
    dayIndex: number;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  rules?: string[] | Array<{ title: string; content: string; category?: string }>;
  faq?: Array<{ id?: string; question: string; answer: string }>;
  events?: Array<{
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
    organizer?: string;
    status: 'upcoming' | 'ongoing' | 'past';
  }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
}

export interface ListingImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
  storageId?: string;
}

export interface Listing {
  id: string;
  tenantId: string;
  organizationId?: string;
  name: string;
  slug: string;
  type: ListingType;
  categoryKey?: string;
  subcategoryKeys?: string[];
  bookingModel?: BookingModel;
  status: ListingStatus;
  description?: string;
  images: ListingImage[];
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
  /** Enable season/long-term rental requests */
  allowSeasonRental?: boolean;
  /** Enable recurring booking patterns */
  allowRecurringBooking?: boolean;
}

// ---- DTOs ----

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

// ---- Query Params ----

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListingQueryParams extends BaseQueryParams {
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
  tenantId?: string;
}

export interface PublicListingParams extends BaseQueryParams {
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

export interface AvailabilityQueryParams {
  startDate: string;
  endDate: string;
  duration?: number;
}

// ---- Related Types ----

export interface ListingAvailability {
  listingId: string;
  startDate: string;
  endDate: string;
  blockedSlots: Array<{
    startTime: string;
    endTime: string;
    status: string;
  }>;
}

export interface ListingStats {
  listingId: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  lastBooking?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug?: string;
  description?: string;
  icon?: string;
  listingCount?: number;
  parentId?: string;
  children?: Category[];
}

export interface City {
  name: string;
  slug: string;
  listingCount?: number;
}

export interface Municipality {
  code: string;
  name: string;
  county: string;
  listingCount?: number;
}

// ============================================================================
// Wrapper shapes (React Query compatible)
// ============================================================================

interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
}

interface MutationResult<TArgs, TData = unknown> {
  mutate: (args: TArgs) => void;
  mutateAsync: (args: TArgs) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

// ============================================================================
// Convex -> Listing Transform
// ============================================================================

/** Map Convex categoryKey to ListingType */
function categoryKeyToListingType(categoryKey?: string): ListingType {
  if (!categoryKey) return "OTHER";
  const map: Record<string, ListingType> = {
    // Convex seed category keys (matching seeds/categories.ts)
    lokaler: "SPACE",
    sport: "RESOURCE",
    arrangementer: "EVENT",
    torget: "SERVICE",
    // Legacy keys
    arrangement: "EVENT",
    torg: "SERVICE",
    boat: "VEHICLE",
    cabin: "SPACE",
    equipment: "RESOURCE",
    facility: "SPACE",
    vehicle: "VEHICLE",
    space: "SPACE",
    resource: "RESOURCE",
    service: "SERVICE",
    event: "EVENT",
    other: "OTHER",
  };
  return map[categoryKey.toLowerCase()] ?? "OTHER";
}

/** Norwegian labels for category keys */
function categoryKeyToLabel(categoryKey?: string): string {
  if (!categoryKey) return "Annet";
  const map: Record<string, string> = {
    lokaler: "Lokaler",
    sport: "Sport",
    arrangementer: "Arrangementer",
    torget: "Torget",
    // Legacy keys
    arrangement: "Arrangement",
    torg: "Torg & Utleie",
    space: "Lokale",
    resource: "Utstyr",
    service: "Tjeneste",
    event: "Arrangement",
    vehicle: "Kjøretøy",
    other: "Annet",
  };
  return map[categoryKey.toLowerCase()] ?? categoryKey;
}

/** Norwegian translations for feature/amenity names */
const featureNameNorwegian: Record<string, string> = {
  projector: "Projektor",
  audio_system: "Lydanlegg",
  sound_system: "Lydanlegg",
  video_conference: "Videokonferanse",
  whiteboard: "Tavle",
  kitchen: "Kjøkken",
  outdoor_area: "Uteareal",
  indoor: "Innendørs",
  outdoor: "Utendørs",
  heated: "Oppvarmet",
  basketball_court: "Basketballbane",
  handball_court: "Håndballbane",
  artificial_turf: "Kunstgress",
  floodlights: "Flomlys",
  grandstand: "Tribune",
  backstage: "Backstage",
  lighting_rig: "Lysrigg",
  market_stalls_available: "Markedsboder",
};

/** Translate a feature name to Norwegian */
function translateFeature(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, "_");
  return featureNameNorwegian[key] ?? name.replace(/_/g, " ");
}

/** Map ListingType back to a Convex categoryKey for mutations */
function listingTypeToCategoryKey(type: ListingType): string {
  const map: Record<ListingType, string> = {
    SPACE: "facility",
    RESOURCE: "equipment",
    SERVICE: "service",
    EVENT: "event",
    VEHICLE: "vehicle",
    OTHER: "other",
  };
  return map[type] ?? "other";
}

/**
 * Transform a raw Convex resource document into the canonical Listing shape.
 * Safe to call with any Convex resource row.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformResourceToListing(r: any): Listing {
  // Extract image objects, prioritizing the primary image first
  let images: ListingImage[] = [];
  if (Array.isArray(r.images)) {
    images = r.images.map((img: unknown, idx: number) => {
      if (typeof img === "string") return { id: `img-${idx}`, url: img, alt: r.name ?? "", isPrimary: idx === 0, order: idx };
      if (img && typeof img === "object") {
        const o = img as Record<string, unknown>;
        return {
          id: (o.id as string) ?? `img-${idx}`,
          url: (o.url as string) ?? "",
          alt: (o.alt as string) ?? r.name ?? "",
          isPrimary: !!o.isPrimary,
          order: (o.sort_order as number) ?? (o.order as number) ?? idx,
          storageId: o.storageId as string | undefined,
        };
      }
      return { id: `img-${idx}`, url: "", alt: "", isPrimary: false, order: idx };
    }).filter((o: ListingImage) => o.url);
    // Sort primary images first, then by order
    images.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }

  const rawPricing = r.pricing ?? {};
  const priceAmount =
    typeof rawPricing === "object"
      ? rawPricing.basePrice ?? rawPricing.pricePerHour ?? 0
      : 0;
  const priceCurrency =
    typeof rawPricing === "object" ? rawPricing.currency ?? "NOK" : "NOK";
  const priceUnit =
    typeof rawPricing === "object"
      ? rawPricing.unit ?? (rawPricing.pricePerHour ? "time" : "booking")
      : "booking";

  const pricing: ListingPricing = {
    basePrice: priceAmount,
    currency: priceCurrency,
    unit: (rawPricing.unit as PricingUnit) ?? "hour",
    weekendMultiplier:
      typeof rawPricing === "object" ? rawPricing.weekendMultiplier : undefined,
    peakHoursMultiplier:
      typeof rawPricing === "object" ? rawPricing.peakHoursMultiplier : undefined,
  };

  const metadata: ListingMetadata | undefined = r.metadata
    ? (r.metadata as ListingMetadata)
    : undefined;

  const createdAt = r._creationTime
    ? new Date(r._creationTime).toISOString()
    : new Date().toISOString();

  // Extract amenities from features array, translated to Norwegian
  const amenities: string[] = Array.isArray(r.features)
    ? r.features
        .filter((f: { name: string; value: unknown }) => f.value === true)
        .map((f: { name: string }) => translateFeature(f.name))
    : [];

  // Extract location from metadata if available
  const meta = r.metadata as Record<string, unknown> | undefined;
  const addrRaw = meta?.address;
  const city = (meta?.city as string) ?? "";
  const addressStr = typeof addrRaw === "string" ? addrRaw : (addrRaw as Record<string, unknown>)?.street as string ?? "";
  const postalCode = (meta?.postalCode as string) ?? "";
  const locationFormatted = [addressStr, postalCode, city].filter(Boolean).join(", ") || city || "Skien";

  const listingType = categoryKeyToListingType(r.categoryKey);
  const typeLabel = categoryKeyToLabel(r.categoryKey);

  // Build object satisfying both Listing AND ListingCardProjectionDTO
  return {
    // Listing fields
    id: r._id as string,
    tenantId: r.tenantId as string,
    organizationId: r.organizationId as string | undefined,
    name: r.name ?? "",
    slug: r.slug ?? "",
    type: listingType,
    categoryKey: r.categoryKey as string | undefined,
    subcategoryKeys: Array.isArray(r.subcategoryKeys) ? r.subcategoryKeys : [],
    bookingModel: r.timeMode as BookingModel | undefined,
    status: (r.status ?? "draft") as ListingStatus,
    description: r.description,
    images,
    pricing,
    capacity: r.capacity ?? 0,
    quantity: r.inventoryTotal,
    metadata,
    createdAt,
    updatedAt: createdAt,
    // ListingCardProjectionDTO fields (used by ListingCard component)
    typeLabel,
    city,
    locationFormatted,
    descriptionExcerpt: r.description ? r.description.substring(0, 120) : undefined,
    primaryImageUrl: images[0]?.url || undefined,
    amenities,
    moreAmenitiesCount: Math.max(0, amenities.length - 3),
    priceAmount: priceAmount > 0 ? priceAmount : undefined,
    priceUnit: priceAmount > 0 ? priceUnit : undefined,
    priceCurrency: priceAmount > 0 ? priceCurrency : undefined,
    averageRating: undefined,
    reviewCount: 0,
    latitude: ((r.metadata as Record<string, unknown>)?.coordinates as Record<string, unknown>)?.lat as number | undefined
      ?? (r.metadata as Record<string, unknown>)?.latitude as number | undefined,
    longitude: ((r.metadata as Record<string, unknown>)?.coordinates as Record<string, unknown>)?.lng as number | undefined
      ?? (r.metadata as Record<string, unknown>)?.longitude as number | undefined,
    isAvailable: r.status === "published",
    // Booking mode settings
    allowSeasonRental: r.allowSeasonRental ?? false,
    allowRecurringBooking: r.allowRecurringBooking ?? false,
  } as Listing;
}

// ============================================================================
// Query Wrapper
// ============================================================================

/**
 * Wraps Convex `useQuery` to produce a React-Query-shaped result object.
 *
 * - `raw === undefined` while loading (or when skipped)
 * - Convex propagates errors through React error boundaries; we surface `null`
 *   for `error` here and leave boundary handling to the app shell.
 */
function useConvexQuery<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryRef: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
): QueryResult<TResult> {
  const raw = useConvexQueryRaw(queryRef, args);
  const isSkipped = args === "skip";
  return {
    data: (raw as TResult | undefined) ?? undefined,
    isLoading: raw === undefined && !isSkipped,
    error: null,
    isError: false,
    isSuccess: raw !== undefined,
  };
}

// ============================================================================
// Mutation Wrapper
// ============================================================================

/**
 * Wraps Convex `useMutation` to produce a React-Query-shaped mutation object
 * with `mutate`, `mutateAsync`, `isLoading`, `error`, `isSuccess`, `reset`.
 */
function useConvexMutation<TArgs, TData = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutationRef: any,
  /** Optional transform applied to args before calling the Convex mutation */
  transformArgs?: (args: TArgs) => unknown,
): MutationResult<TArgs, TData> {
  const rawMutation = useConvexMutationRaw(mutationRef);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const mountedRef = useRef(true);

  // Track unmount to avoid state-updates-after-unmount warnings
  // (useEffect cleanup is fine for this lightweight ref)

  const mutateAsync = useCallback(
    async (args: TArgs): Promise<TData> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      try {
        const convexArgs = transformArgs ? transformArgs(args) : args;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (rawMutation as any)(convexArgs);
        if (mountedRef.current) {
          setIsSuccess(true);
          setIsLoading(false);
        }
        return result as TData;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
        throw err;
      }
    },
    [rawMutation, transformArgs],
  );

  const mutate = useCallback(
    (args: TArgs) => {
      mutateAsync(args).catch(() => {
        /* error already captured in state */
      });
    },
    [mutateAsync],
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
    isSuccess,
    isError: error !== null,
    reset,
  };
}

// ============================================================================
// Stub helpers
// ============================================================================

/** Return a static query result (no backend call). */
function useStubQuery<T>(stubData: T): QueryResult<{ data: T }> {
  return { data: { data: stubData }, isLoading: false, error: null, isError: false, isSuccess: true };
}

/** Return a no-op mutation result (backend support not yet available). */
function useStubMutation<TArgs, TData = void>(): MutationResult<TArgs, TData> {
  return {
    mutate: () => {
      /* stub */
    },
    mutateAsync: () => Promise.resolve(undefined as TData),
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
    reset: () => {
      /* stub */
    },
  };
}

// ============================================================================
// Authenticated Listing Hooks (Queries)
// ============================================================================

/**
 * Get paginated listings for the current tenant (admin/backoffice use).
 * Requires user to be logged in with a tenant association.
 * Wraps `api.domain.resources.list` (tenant-scoped).
 * 
 * For public apps (web/minside), use `usePublicListings` instead.
 */
export function useListings(params?: ListingQueryParams): QueryResult<PaginatedResponse<Listing>> {
  const tenantId = useResolveTenantId(params?.tenantId as TenantId | undefined);

  const raw = useConvexQueryRaw(
    api.domain.resources.list,
    tenantId
      ? {
          tenantId,
          categoryKey: params?.type ? listingTypeToCategoryKey(params.type) : undefined,
          status: params?.status,
          limit: params?.limit,
        }
      : "skip",
  );

  // Show loading only when we have a tenantId but data hasn't arrived yet
  // If no tenantId, we're not loading - user needs to log in
  const isLoading = tenantId !== undefined && raw === undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Listing[] | undefined = raw ? (raw as any[]).map(transformResourceToListing) : undefined;
  const data = items ? toPaginatedResponse(items) : undefined;

  return {
    data,
    isLoading,
    error: tenantId === undefined ? new Error("No tenant associated with current user. Please log in.") : null,
    isError: tenantId === undefined,
    isSuccess: data !== undefined,
  };
}

/**
 * Get a single listing by ID.
 * Wraps `api.domain.resources.get`.
 */
export function useListing(
  id: string,
  options?: { enabled?: boolean },
): QueryResult<SingleResponse<Listing>> {
  const enabled = options?.enabled ?? true;
  const shouldFetch = !!id && enabled;

  const raw = useConvexQueryRaw(
    api.domain.resources.get,
    shouldFetch ? { id: id as ResourceId } : "skip",
  );

  const isLoading = shouldFetch && raw === undefined;
  const item = raw ? transformResourceToListing(raw) : undefined;
  const data = item ? toSingleResponse(item) : undefined;

  return {
    data,
    isLoading,
    error: null,
    isError: false,
    isSuccess: data !== undefined,
  };
}

/**
 * Get listing by slug.
 * Falls back to `api.domain.resources.get` if slug lookup is unavailable.
 */
export function useListingBySlug(
  slug: string,
  options?: { enabled?: boolean },
): QueryResult<SingleResponse<Listing>> {
  const enabled = options?.enabled ?? true;
  const shouldFetch = !!slug && enabled;

  // Use getBySlugPublic for public slug lookups (no tenantId required)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryRef = (api.domain.resources as any).getBySlugPublic ?? (api.domain.resources as any).getBySlug ?? null;

  const raw = useConvexQueryRaw(
    queryRef ?? api.domain.resources.get,
    shouldFetch
      ? queryRef
        ? { slug }
        : { id: slug as unknown as ResourceId }
      : "skip",
  );

  const isLoading = shouldFetch && raw === undefined;
  const item = raw ? transformResourceToListing(raw) : undefined;
  const data = item ? toSingleResponse(item) : undefined;

  return {
    data,
    isLoading,
    error: null,
    isError: false,
    isSuccess: data !== undefined,
  };
}

/**
 * Get listing availability.
 * Stub: returns empty availability (Convex backend does not yet expose this).
 */
export function useListingAvailability(
  id: string,
  params: AvailabilityQueryParams,
): QueryResult<{ data: ListingAvailability }> {
  const enabled = !!id && !!params.startDate;
  if (!enabled) {
    return { data: undefined, isLoading: false, error: null, isError: false, isSuccess: false };
  }
  return useStubQuery<ListingAvailability>({
    listingId: id,
    startDate: params.startDate,
    endDate: params.endDate,
    blockedSlots: [],
  });
}

/**
 * Get listing statistics.
 * Stub: returns zeroed stats (Convex backend does not yet expose this).
 */
export function useListingStats(id: string): QueryResult<{ data: ListingStats }> {
  if (!id) {
    return { data: undefined, isLoading: false, error: null, isError: false, isSuccess: false };
  }
  return useStubQuery<ListingStats>({
    listingId: id,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    utilizationRate: 0,
  });
}

// ============================================================================
// Public Listing Hooks (No Auth)
// ============================================================================

/**
 * Get public listings.
 * Wraps `api.domain.resources.listPublic`.
 */
export function usePublicListings(params?: PublicListingParams): QueryResult<PaginatedResponse<Listing>> {
  const raw = useConvexQueryRaw(api.domain.resources.listPublic, {
    categoryKey: params?.type ? listingTypeToCategoryKey(params.type) : params?.category,
    status: "published",
    limit: params?.limit,
  });

  const isLoading = raw === undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Listing[] | undefined = raw ? (raw as any[]).map(transformResourceToListing) : undefined;
  const data = items ? toPaginatedResponse(items) : undefined;

  return {
    data,
    isLoading,
    error: null,
    isError: false,
    isSuccess: data !== undefined,
  };
}

/**
 * Get public listings in UI-ready format.
 * @deprecated API now returns screen-ready projection DTOs directly via usePublicListings()
 */
export function usePublicUiListings(params?: PublicListingParams): QueryResult<PaginatedResponse<Listing>> {
  return usePublicListings(params);
}

/**
 * Get a single public listing by ID.
 * Wraps `api.domain.resources.get`.
 */
export function usePublicListing(id: string): QueryResult<SingleResponse<Listing>> {
  const shouldFetch = !!id;

  const raw = useConvexQueryRaw(
    api.domain.resources.get,
    shouldFetch ? { id: id as ResourceId } : "skip",
  );

  const isLoading = shouldFetch && raw === undefined;
  const item = raw ? transformResourceToListing(raw) : undefined;
  const data = item ? toSingleResponse(item) : undefined;

  return {
    data,
    isLoading,
    error: null,
    isError: false,
    isSuccess: data !== undefined,
  };
}

/**
 * Get public listing by ID in UI-ready format.
 * @deprecated API now returns screen-ready projection DTOs directly via usePublicListing()
 */
export function usePublicUiListing(id: string): QueryResult<SingleResponse<Listing>> {
  return usePublicListing(id);
}

/**
 * Get public availability.
 * Stub: returns empty availability.
 */
export function usePublicAvailability(
  listingId: string,
  params: AvailabilityQueryParams,
): QueryResult<{ data: ListingAvailability }> {
  const enabled = !!listingId && !!params.startDate;
  if (!enabled) {
    return { data: undefined, isLoading: false, error: null, isError: false, isSuccess: false };
  }
  return useStubQuery<ListingAvailability>({
    listingId,
    startDate: params.startDate,
    endDate: params.endDate,
    blockedSlots: [],
  });
}

/**
 * Get public categories.
 * Wraps `api.domain.categories.list` if available; otherwise returns stub.
 */
export function usePublicCategories(): QueryResult<PaginatedResponse<Category>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesApi = (api.domain as any).categories;
  const queryRef = categoriesApi?.list ?? null;

  // If the Convex function does not exist, return a static stub.
  if (!queryRef) {
    return { data: toPaginatedResponse<Category>([]), isLoading: false, error: null, isError: false, isSuccess: true };
  }

  const raw = useConvexQueryRaw(queryRef, {});
  const isLoading = raw === undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Category[] | undefined = raw
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (raw as any[]).map((c: any) => ({
        id: (c._id ?? c.id) as string,
        name: c.name ?? "",
        nameEn: c.nameEn,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        listingCount: c.listingCount,
        parentId: c.parentId,
        children: c.children,
      }))
    : undefined;

  const data = items ? toPaginatedResponse(items) : undefined;

  return {
    data,
    isLoading,
    error: null,
    isError: false,
    isSuccess: data !== undefined,
  };
}

/**
 * Get cities with listings.
 * Stub: Convex backend does not yet expose city aggregation.
 */
export function usePublicCities(): QueryResult<{ data: City[] }> {
  return useStubQuery<City[]>([]);
}

/**
 * Get municipalities.
 * Stub: Convex backend does not yet expose municipality aggregation.
 */
export function usePublicMunicipalities(): QueryResult<{ data: Municipality[] }> {
  return useStubQuery<Municipality[]>([]);
}

/**
 * Get featured listings.
 * Wraps `api.domain.resources.listPublic` with a limited result set.
 */
export function useFeaturedListings(): QueryResult<PaginatedResponse<Listing>> {
  const raw = useConvexQueryRaw(api.domain.resources.listPublic, {
    status: "published",
    limit: 6,
  });

  const isLoading = raw === undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Listing[] | undefined = raw ? (raw as any[]).map(transformResourceToListing) : undefined;
  const data = items ? toPaginatedResponse(items) : undefined;

  return {
    data,
    isLoading,
    error: null,
    isError: false,
    isSuccess: data !== undefined,
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new listing.
 * Wraps `api.domain.resources.create` with DTO-to-Convex input transform.
 */
export function useCreateListing(): MutationResult<CreateListingDTO, { id: string }> {
  return useConvexMutation<CreateListingDTO, { id: string }>(
    api.domain.resources.create,
    (dto: CreateListingDTO) => ({
      tenantId: undefined, // tenantId must be supplied by the caller at app-level
      organizationId: dto.organizationId,
      name: dto.name,
      slug: dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: dto.description,
      categoryKey: listingTypeToCategoryKey(dto.type),
      timeMode: dto.bookingModel,
      status: "draft",
      capacity: dto.capacity,
      images: dto.images,
      pricing: dto.pricing
        ? {
            basePrice: dto.pricing.basePrice ?? 0,
            currency: dto.pricing.currency ?? "NOK",
            unit: dto.pricing.unit ?? "hour",
            weekendMultiplier: dto.pricing.weekendMultiplier,
            peakHoursMultiplier: dto.pricing.peakHoursMultiplier,
          }
        : undefined,
      metadata: dto.metadata,
    }),
  );
}

/**
 * Update an existing listing.
 * Wraps `api.domain.resources.update`.
 */
export function useUpdateListing(): MutationResult<
  { id: string; data: UpdateListingDTO },
  { success: boolean }
> {
  return useConvexMutation<{ id: string; data: UpdateListingDTO }, { success: boolean }>(
    api.domain.resources.update,
    ({ id, data }) => ({
      id: id as unknown as ResourceId,
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      images: data.images,
      pricing: data.pricing
        ? {
            basePrice: data.pricing.basePrice,
            currency: data.pricing.currency,
            unit: data.pricing.unit,
            weekendMultiplier: data.pricing.weekendMultiplier,
            peakHoursMultiplier: data.pricing.peakHoursMultiplier,
          }
        : undefined,
      metadata: data.metadata,
    }),
  );
}

/**
 * Delete a listing (soft-delete).
 * Wraps `api.domain.resources.remove`.
 */
export function useDeleteListing(): MutationResult<string, { success: boolean }> {
  return useConvexMutation<string, { success: boolean }>(
    api.domain.resources.remove,
    (id: string) => ({ id: id as unknown as ResourceId }),
  );
}

/**
 * Publish a listing.
 * Wraps `api.domain.resources.publish`.
 */
export function usePublishListing(): MutationResult<string, { success: boolean }> {
  return useConvexMutation<string, { success: boolean }>(
    api.domain.resources.publish,
    (id: string) => ({ id: id as unknown as ResourceId }),
  );
}

/**
 * Unpublish a listing.
 * Wraps `api.domain.resources.unpublish`.
 */
export function useUnpublishListing(): MutationResult<string, { success: boolean }> {
  return useConvexMutation<string, { success: boolean }>(
    api.domain.resources.unpublish,
    (id: string) => ({ id: id as unknown as ResourceId }),
  );
}

/**
 * Archive a listing.
 * Stub: Convex backend does not yet have an archive mutation.
 */
export function useArchiveListing(): MutationResult<string, { success: boolean }> {
  return useStubMutation<string, { success: boolean }>();
}

/**
 * Restore an archived listing.
 * Stub: Convex backend does not yet have a restore mutation.
 */
export function useRestoreListing(): MutationResult<string, { success: boolean }> {
  return useStubMutation<string, { success: boolean }>();
}

/**
 * Duplicate a listing.
 * Stub: Convex backend does not yet have a duplicate mutation.
 */
export function useDuplicateListing(): MutationResult<string, { id: string }> {
  return useStubMutation<string, { id: string }>();
}

/**
 * Upload media to a listing.
 * Stub: Convex file storage integration not yet wired.
 */
export function useUploadListingMedia(): MutationResult<
  { id: string; files: File[]; options?: { compress?: boolean } },
  void
> {
  return useStubMutation<{ id: string; files: File[]; options?: { compress?: boolean } }, void>();
}

/**
 * Delete media from a listing.
 * Stub: Convex file storage integration not yet wired.
 */
export function useDeleteListingMedia(): MutationResult<
  { listingId: string; mediaId: string },
  void
> {
  return useStubMutation<{ listingId: string; mediaId: string }, void>();
}

// ============================================================================
// Re-export transform utility (useful for tests / one-off transforms)
// ============================================================================

export { transformResourceToListing, categoryKeyToListingType, listingTypeToCategoryKey };
