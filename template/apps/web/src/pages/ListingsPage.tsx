/**
 * ListingsPage
 *
 * Clean listings page using projection DTOs from API.
 * Uses ListingFilter component for enhanced filtering UX.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ContentLayout,
  ListingCard,
  ListingListItem,
  ListingGrid,
  ListingFilter,
  ListingMap,
  ListingTableView,
  Stack,
  Text,
  HeaderSearch,
} from '@xaheen/ds';
import type {
  SearchResultItem,
  SearchResultGroup,
  ListingFilterState,
  ListingCategoryOption,
  SubcategoryOption,
  CityOption,
  FacilityOption,
} from '@xaheen/ds';
import {
  usePublicListings,
  type Listing,
  type ListingCardProjectionDTO,
  type PublicListingParams,
} from '@xaheen/sdk';
import { useRealtimeListing } from '../providers';

// API tokens from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// View mode type
type ViewMode = 'grid' | 'list' | 'map' | 'table';

// Map listing types to category keys
const TYPE_TO_CATEGORY: Record<string, string> = {
  SPACE: 'LOKALER',
  RESOURCE: 'SPORT',
  EVENT: 'ARRANGEMENTER',
  SERVICE: 'TORGET',
};

const CATEGORY_TO_TYPE: Record<string, string> = {
  LOKALER: 'SPACE',
  SPORT: 'RESOURCE',
  ARRANGEMENTER: 'EVENT',
  TORGET: 'SERVICE',
};

// Facility options (from seed data amenities)
const FACILITY_OPTIONS: FacilityOption[] = [
  { id: 'WIFI', key: 'wifi', label: 'WiFi' },
  { id: 'PARKERING', key: 'parkering', label: 'Parkering' },
  { id: 'GARDEROBER', key: 'garderober', label: 'Garderober' },
  { id: 'KJOKKEN', key: 'kjokken', label: 'Kjøkken' },
  { id: 'SCENE', key: 'scene', label: 'Scene' },
  { id: 'DUSJ', key: 'dusj', label: 'Dusj' },
  { id: 'UTSTYRSLAN', key: 'utstyrslan', label: 'Utstyrslån' },
  { id: 'KIOSK', key: 'kiosk', label: 'Kiosk' },
];

// Subcategory options per category
const SUBCATEGORY_OPTIONS: Record<string, SubcategoryOption[]> = {
  LOKALER: [
    { id: 'SELSKAPSLOKALE', key: 'SELSKAPSLOKALE', label: 'Selskapslokale', parentKey: 'LOKALER' },
    { id: 'MOTEROM', key: 'MOTEROM', label: 'M\u00f8terom', parentKey: 'LOKALER' },
    { id: 'GYMSAL', key: 'GYMSAL', label: 'Gymsal', parentKey: 'LOKALER' },
    { id: 'KULTURARENA', key: 'KULTURARENA', label: 'Kulturarena', parentKey: 'LOKALER' },
    { id: 'KONFERANSEROM', key: 'KONFERANSEROM', label: 'Konferanserom', parentKey: 'LOKALER' },
  ],
  SPORT: [
    { id: 'PADEL', key: 'PADEL', label: 'Padel', parentKey: 'SPORT' },
    { id: 'SQUASH', key: 'SQUASH', label: 'Squash', parentKey: 'SPORT' },
    { id: 'TENNIS', key: 'TENNIS', label: 'Tennis', parentKey: 'SPORT' },
    { id: 'CAGEBALL', key: 'CAGEBALL', label: 'Cageball', parentKey: 'SPORT' },
    { id: 'BADMINTON', key: 'BADMINTON', label: 'Badminton', parentKey: 'SPORT' },
  ],
  ARRANGEMENTER: [
    { id: 'KURS', key: 'KURS', label: 'Kurs', parentKey: 'ARRANGEMENTER' },
    { id: 'FOREDRAG', key: 'FOREDRAG', label: 'Foredrag', parentKey: 'ARRANGEMENTER' },
    { id: 'KONSERT', key: 'KONSERT', label: 'Konsert', parentKey: 'ARRANGEMENTER' },
    { id: 'WORKSHOP', key: 'WORKSHOP', label: 'Workshop', parentKey: 'ARRANGEMENTER' },
    { id: 'SEMINAR', key: 'SEMINAR', label: 'Seminar', parentKey: 'ARRANGEMENTER' },
  ],
  TORGET: [
    { id: 'TELT', key: 'TELT', label: 'Telt', parentKey: 'TORGET' },
    { id: 'LYDANLEGG', key: 'LYDANLEGG', label: 'Lydanlegg', parentKey: 'TORGET' },
    { id: 'PROJEKTOR', key: 'PROJEKTOR', label: 'Projektor', parentKey: 'TORGET' },
    { id: 'BORD_OG_STOLER', key: 'BORD_OG_STOLER', label: 'Bord og stoler', parentKey: 'TORGET' },
    { id: 'GRILL', key: 'GRILL', label: 'Grill', parentKey: 'TORGET' },
    { id: 'PARTYTELT', key: 'PARTYTELT', label: 'Partytelt', parentKey: 'TORGET' },
  ],
};

// Extended listing type with card projection fields added by the transform
type ListingWithCard = Listing & ListingCardProjectionDTO;

// Get category counts from listings
function getCategoryCounts(listings: ListingWithCard[]): Record<string, number> {
  const counts: Record<string, number> = { ALL: listings.length };

  listings.forEach(l => {
    const categoryKey = TYPE_TO_CATEGORY[l.type] || l.type;
    counts[categoryKey] = (counts[categoryKey] || 0) + 1;
  });

  return counts;
}

export function ListingsPage(): React.ReactElement {
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // API query params
  const [queryParams] = React.useState<PublicListingParams>({ limit: 100 });

  // Fetch listings from API
  const { data: listingsResponse, isLoading, error } = usePublicListings(queryParams);

  // Realtime updates
  const handleListingEvent = React.useCallback((_event: { type: string; data?: unknown }) => {
    // No-op: Convex subscriptions auto-update the UI
  }, []);
  useRealtimeListing(handleListingEvent);

  // Listings from API (transform returns objects satisfying both Listing & ListingCardProjectionDTO)
  const listings = React.useMemo((): ListingWithCard[] => {
    if (!listingsResponse?.data) return [];
    return listingsResponse.data as unknown as ListingWithCard[];
  }, [listingsResponse]);

  // Filter state using ListingFilterState
  const [filters, setFilters] = React.useState<ListingFilterState>({});
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');

  // Category counts for filter badges
  const categoryCounts = React.useMemo(() => getCategoryCounts(listings), [listings]);

  // Category options with counts (no 'Alle' - filter component handles that)
  const categoryOptions: ListingCategoryOption[] = React.useMemo(() => [
    { id: 'LOKALER', key: 'LOKALER', label: 'Lokaler', icon: '🏢', count: categoryCounts.LOKALER || 0 },
    { id: 'SPORT', key: 'SPORT', label: 'Sport', icon: '⚽', count: categoryCounts.SPORT || 0 },
    { id: 'ARRANGEMENTER', key: 'ARRANGEMENTER', label: 'Arrangementer', icon: '📅', count: categoryCounts.ARRANGEMENTER || 0 },
    { id: 'TORGET', key: 'TORGET', label: 'Torget', icon: '🛒', count: categoryCounts.TORGET || 0 },
  ], [categoryCounts]);

  // Subcategory options derived from selected category
  const subcategoryOptions = React.useMemo((): SubcategoryOption[] => {
    if (!filters.category) return [];
    return SUBCATEGORY_OPTIONS[filters.category] ?? [];
  }, [filters.category]);

  // City data with listing counts, sorted by count desc
  const cityData = React.useMemo((): CityOption[] => {
    const counts: Record<string, number> = {};
    for (const l of listings) {
      const city = l.city;
      if (city) {
        counts[city] = (counts[city] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [listings]);

  // Wrap setFilters to clear subcategories when category changes
  const handleFilterChange = React.useCallback((newFilters: ListingFilterState) => {
    if (newFilters.category !== filters.category) {
      setFilters({ ...newFilters, subcategories: undefined });
    } else {
      setFilters(newFilters);
    }
  }, [filters.category]);

  // Filter and sort listings based on filter state
  const filteredListings = React.useMemo(() => {
    const filtered = listings.filter(l => {
      // Filter by category
      if (filters.category) {
        const expectedType = CATEGORY_TO_TYPE[filters.category];
        if (expectedType && l.type !== expectedType) return false;
      }

      // Filter by subcategories
      if (filters.subcategories && filters.subcategories.length > 0) {
        if (!filters.subcategories.some(s => l.subcategoryKeys?.includes(s))) return false;
      }

      // Filter by location (city search)
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const cityMatch = l.city?.toLowerCase().includes(locationLower);
        const addressMatch = l.locationFormatted?.toLowerCase().includes(locationLower);
        if (!cityMatch && !addressMatch) return false;
      }

      // Filter by max price
      if (filters.maxPrice && l.priceAmount > filters.maxPrice) return false;

      // Filter by min capacity
      if (filters.minCapacity && (l.capacity ?? 0) < filters.minCapacity) return false;

      // Filter by facilities/amenities
      if (filters.facilities && filters.facilities.length > 0) {
        const listingAmenities = l.amenities || [];
        const hasAllFacilities = filters.facilities.every(f =>
          listingAmenities.some(a => a.toLowerCase().includes(f.toLowerCase()))
        );
        if (!hasAllFacilities) return false;
      }

      // Filter by "new this week"
      if (filters.newThisWeek) {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (!l.createdAt || new Date(l.createdAt).getTime() < weekAgo) return false;
      }

      return true;
    });

    // Apply sorting
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (filters.sortBy) {
          case 'price':
            cmp = a.priceAmount - b.priceAmount;
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name, 'nb');
            break;
          case 'createdAt':
            cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return filters.sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    return filtered;
  }, [listings, filters]);

  // Pagination
  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filters]);

  // Search handler
  const handleSearchChange = (value: string): void => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = value.toLowerCase();
    const matchingListings = listings.filter(listing =>
      listing.name.toLowerCase().includes(query) ||
      listing.locationFormatted?.toLowerCase().includes(query) ||
      listing.city?.toLowerCase().includes(query)
    );

    const results: SearchResultGroup[] = matchingListings.length > 0
      ? [{
          id: 'listings',
          label: 'Lokaler',
          items: matchingListings.slice(0, 5).map(listing => ({
            id: listing.id,
            label: listing.name,
            description: listing.locationFormatted,
            meta: listing.typeLabel,
          })),
        }]
      : [];

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleResultSelect = (result: SearchResultItem): void => {
    const listing = listings.find(l => l.id === result.id);
    if (listing) {
      navigate(`/listing/${listing.slug || listing.id}`);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleListingClick = (id: string, slug?: string): void => {
    navigate(`/listing/${slug || id}`);
  };

  return (
    <ContentLayout className="main-content-layout">
      <main id="main-content" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        {/* Search */}
        <div className="mobile-search-wrapper" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <HeaderSearch
            placeholder="Søk etter lokaler..."
            value={searchQuery}
            onSearchChange={handleSearchChange}
            onSearch={() => {}}
            results={searchResults}
            onResultSelect={handleResultSelect}
            isLoading={isSearching}
          />
        </div>

        {/* Loading State — Skeleton Cards */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <style>{`
              @keyframes skeletonPulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
              }
            `}</style>
            <ListingGrid minCardWidth={300}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 'var(--ds-border-radius-lg)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                    overflow: 'hidden',
                    animation: `skeletonPulse 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div style={{
                    height: '260px',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ height: '14px', width: '70%', borderRadius: '6px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
                    <div style={{ height: '12px', width: '50%', borderRadius: '6px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
                    <div style={{ height: '12px', width: '90%', borderRadius: '6px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      {[1,2,3].map(j => (
                        <div key={j} style={{ height: '24px', width: '64px', borderRadius: '100px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <div style={{ height: '12px', width: '80px', borderRadius: '6px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
                      <div style={{ height: '14px', width: '100px', borderRadius: '6px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </ListingGrid>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              padding: 'var(--ds-spacing-6)',
              marginBottom: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-danger-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-danger-border-default)',
              textAlign: 'center',
            }}
          >
            <Text size="md" color="var(--ds-color-danger-text-default)">
              Kunne ikke laste lokaler. Prøv igjen senere.
            </Text>
            <Button
              type="button"
              variant="secondary"
              style={{ marginTop: 'var(--ds-spacing-4)' }}
              onClick={() => window.location.reload()}
            >
              Prøv igjen
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && listings.length === 0 && (
          <div style={{
            padding: 'var(--ds-spacing-8)',
            textAlign: 'center',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <Text size="lg" color="var(--ds-color-neutral-text-default)" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen lokaler tilgjengelig
            </Text>
            <Text size="md" color="var(--ds-color-neutral-text-subtle)">
              Det er ingen lokaler registrert ennå. Kom tilbake senere.
            </Text>
          </div>
        )}

        {/* Content with Filter */}
        {!isLoading && !error && listings.length > 0 && (
          <>
            {/* ListingFilter Component */}
            <ListingFilter
              value={filters}
              onChange={handleFilterChange}
              categories={categoryOptions}
              subcategories={subcategoryOptions}
              facilities={FACILITY_OPTIONS}
              cities={cityData}
              maxPriceLimit={10000}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              availableViews={['grid', 'list', 'map', 'table']}
              resultsCount={filteredListings.length}
              resultsLabel="resultater"
              showFilterPanel={true}
            />

            {/* Listings Display */}
            <style>{`
              @keyframes listingStaggerIn {
                from { opacity: 0; transform: translateY(16px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .listing-animate-in {
                animation: listingStaggerIn 0.4s ease both;
              }
            `}</style>
            <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
              {viewMode === 'grid' ? (
                <ListingGrid minCardWidth={300}>
                  {visibleListings.map((listing, idx) => (
                    <div key={listing.id} className="listing-animate-in" style={{ animationDelay: `${Math.min(idx, 11) * 0.05}s` }}>
                    <ListingCard
                      id={listing.id}
                      name={listing.name}
                      type={listing.type as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                      listingType={listing.type as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                      location={listing.locationFormatted || ''}
                      description={listing.descriptionExcerpt || ''}
                      image={listing.primaryImageUrl || ''}
                      facilities={listing.amenities}
                      moreFacilities={listing.moreAmenitiesCount}
                      capacity={listing.capacity}
                      price={listing.priceAmount}
                      priceUnit={listing.priceUnit}
                      currency={listing.priceCurrency}
                      rating={listing.averageRating}
                      reviewCount={listing.reviewCount}
                      imageHeight={260}
                      showLocation={true}
                      showDescription={true}
                      showFacilities={true}
                      showCapacity={true}
                      showListingType={false}
                      showRating={true}
                      showPrice={true}
                      onClick={(id) => handleListingClick(id, listing.slug)}
                      onFavorite={(_id) => { /* TODO: Implement favorite toggle */ }}
                      onShare={(_id) => { /* TODO: Implement share */ }}
                    />
                    </div>
                  ))}
                </ListingGrid>
              ) : viewMode === 'list' ? (
                <Stack spacing="var(--ds-spacing-4)">
                  {visibleListings.map((listing, idx) => (
                    <div key={listing.id} className="listing-animate-in" style={{ animationDelay: `${Math.min(idx, 11) * 0.05}s` }}>
                    <ListingListItem
                      id={listing.id}
                      name={listing.name}
                      type={listing.type as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                      listingType={listing.type as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                      location={listing.locationFormatted || ''}
                      description={listing.descriptionExcerpt || ''}
                      image={listing.primaryImageUrl || ''}
                      facilities={listing.amenities}
                      moreFacilities={listing.moreAmenitiesCount}
                      capacity={listing.capacity}
                      price={listing.priceAmount}
                      priceUnit={listing.priceUnit}
                      currency={listing.priceCurrency}
                      {...(listing.latitude != null && { latitude: listing.latitude })}
                      {...(listing.longitude != null && { longitude: listing.longitude })}
                      mapboxToken={MAPBOX_TOKEN || ''}
                      showListingType={true}
                      showMap={true}
                      showPrice={true}
                      onClick={(id) => handleListingClick(id, listing.slug)}
                      onFavorite={(_id) => { /* TODO: Implement favorite toggle */ }}
                      onShare={(_id) => { 
                        navigator.share?.({ 
                          title: listing.name, 
                          url: `${window.location.origin}/listings/${listing.slug}` 
                        }).catch(() => {});
                      }}
                    />
                    </div>
                  ))}
                </Stack>
              ) : viewMode === 'map' ? (
                <ListingMap
                  listings={filteredListings
                    .filter(l => l.latitude != null && l.longitude != null)
                    .map(l => ({
                      id: l.id,
                      name: l.name,
                      ...(l.slug && { slug: l.slug }),
                      location: l.locationFormatted || '',
                      image: l.primaryImageUrl || '',
                      latitude: l.latitude!,
                      longitude: l.longitude!,
                      type: l.type,
                      listingType: l.type,
                      description: l.descriptionExcerpt || '',
                      capacity: l.capacity,
                      price: l.priceAmount,
                      priceUnit: l.priceUnit,
                      facilities: l.amenities,
                      available: l.isAvailable,
                    }))}
                  mapboxToken={MAPBOX_TOKEN || ''}
                  height="calc(100vh - 350px)"
                  onListingClick={handleListingClick}
                  onFavorite={(_id) => { /* TODO: Implement favorite toggle */ }}
                  onShare={(id, slug) => {
                    const listing = filteredListings.find(l => l.id === id);
                    navigator.share?.({
                      title: listing?.name || 'Digilist',
                      url: `${window.location.origin}/listings/${slug || id}`
                    }).catch(() => {});
                  }}
                />
              ) : (
                <ListingTableView
                  listings={filteredListings.map(l => ({
                    id: l.id,
                    name: l.name,
                    ...(l.slug && { slug: l.slug }),
                    location: l.locationFormatted || '',
                    latitude: l.latitude ?? 0,
                    longitude: l.longitude ?? 0,
                    type: l.type,
                    capacity: l.capacity,
                    price: l.priceAmount,
                    priceUnit: l.priceUnit,
                  }))}
                  height="calc(100vh - 350px)"
                  onListingClick={handleListingClick}
                />
              )}

              {/* Show more - only for grid/list views */}
              {(viewMode === 'grid' || viewMode === 'list') && hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--ds-spacing-8)' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    style={{ paddingInline: 'var(--ds-spacing-8)' }}
                  >
                    Vis flere ({filteredListings.length - visibleCount} gjenstår)
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </ContentLayout>
  );
}

export default ListingsPage;
