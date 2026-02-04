/**
 * ListingDetailPage
 *
 * Listing detail page using feature-based architecture.
 * Structure: Breadcrumb -> ImageSlider -> ListingDetailsLayout
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Breadcrumb,
  ImageSlider,
  Spinner,
  Paragraph,
  Heading,
  Stack,
} from '@xaheen/ds';
import type { BreadcrumbItem, GalleryImage } from '@xaheen/ds';
import {
  useListing,
  useListingBySlug,
  type Listing as ApiListing,
} from '@xaheen/sdk';
import {
  ListingDetailsLayout,
  type Listing,
  type ListingType,
  type BookingMode,
  type DayHours,
  type OpeningHours,
  type KeyFacts,
  type ListingMetadata,
  type Rule,
  type FAQItem,
  type Amenity,
  type IncludedFacility,
  type ListingEvent,
  logAuditEvent,
} from '../features/listing-details';
import { ReviewList } from '../features/reviews/components/ReviewList';
import { ReviewForm } from '../features/reviews/components/ReviewForm';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

/**
 * Map API DTO directly to feature Listing type
 * The API now returns pre-formatted DTOs via toDetailsProjection,
 * so we just need to map field names - no complex transformation needed.
 */
function transformApiToListing(api: ApiListing): Listing {
  // API DTO is already well-structured, just map to feature types
  const dto = api as any; // API returns flat DTO with all fields

  // Map listing type - RESOURCE and SPACE are venues so map to FACILITY
  const typeMap: Record<string, ListingType> = {
    EQUIPMENT: 'EQUIPMENT', EVENT: 'EVENT', FACILITY: 'FACILITY',
    SPACE: 'FACILITY', RESOURCE: 'FACILITY', SERVICE: 'EQUIPMENT',
  };
  const listingType: ListingType = typeMap[dto.type] || 'OTHER';

  // Dynamic booking mode from timeMode (fixes hardcoded 'SLOTS' bug)
  const timeModeMap: Record<string, BookingMode> = {
    'SLOT': 'SLOTS', 'DAY': 'ALL_DAY', 'PERIOD': 'DURATION',
    'TIME_RANGE': 'SLOTS', 'ALL_DAY': 'ALL_DAY', 'QUANTITY': 'TICKETS',
  };
  const rawMode = dto.bookingModel || dto.timeMode || 'SLOT';
  let bookingMode: BookingMode = timeModeMap[rawMode] || 'SLOTS';

  // Override: ARRANGEMENTER (priceUnit "stk") → TICKETS
  if (dto.priceUnit === 'stk' || dto.categoryKey === 'ARRANGEMENTER') {
    bookingMode = 'TICKETS';
  }

  // Map images directly from DTO (already has correct structure)
  const images = (dto.images || []).map((img: any, index: number) => ({
    id: img.id || `img-${index}`,
    url: img.url || img.src || '',
    alt: img.alt || dto.name || '',
    isPrimary: img.isPrimary ?? index === 0,
    order: img.order ?? index,
  }));

  // Map amenities from DTO
  const amenities: Amenity[] = (dto.amenities || []).map((a: any, i: number) => ({
    id: typeof a === 'string' ? a : a.id || `amenity-${i}`,
    name: typeof a === 'string' ? a : a.name || a,
    icon: typeof a === 'object' ? a.icon : undefined,
    category: typeof a === 'object' ? a.category : 'general',
    description: typeof a === 'string' ? a : a.name || a,
  }));

  // Extract metadata fields (contact, opening hours, rules, faq) from DTO or nested metadata
  const meta = dto.metadata || {};

  // Map FAQ from DTO or metadata
  const rawFaq = dto.faq || meta.faq || [];
  const faq: FAQItem[] = rawFaq.map((f: any, i: number) => ({
    id: f.id || `faq-${i}`,
    question: f.question || '',
    answer: f.answer || '',
  }));

  // Map rules from DTO or metadata
  const rawRules = dto.rules || meta.rules || [];
  const rules: Rule[] = rawRules.map((r: any, i: number) => ({
    id: r.id || `rule-${i}`,
    title: r.title || '',
    content: r.content || r.description || '',
    category: r.category || 'general',
  }));

  // Map opening hours from DTO or metadata
  const rawOpeningHours = Array.isArray(dto.openingHours) ? dto.openingHours
    : Array.isArray(meta.openingHours) ? meta.openingHours : [];
  const openingHours: OpeningHours = {
    regular: rawOpeningHours.map((day: any) => ({
      day: day.day || '',
      dayIndex: day.dayIndex ?? 0,
      open: day.open || day.openTime || '',
      close: day.close || day.closeTime || '',
      isClosed: day.isClosed ?? false,
    })),
  };

  // Build contact from flat DTO fields, falling back to metadata
  const contactName = dto.contactName || meta.contactName;
  const contactEmail = dto.contactEmail || meta.contactEmail;
  const contactPhone = dto.contactPhone || meta.contactPhone;
  const contact = (contactName || contactEmail || contactPhone) ? {
    ...(contactName ? { name: contactName } : {}),
    ...(contactEmail ? { email: contactEmail } : {}),
    ...(contactPhone ? { phone: contactPhone } : {}),
  } : undefined;

  // Build address from flat DTO fields
  const address = {
    formatted: dto.locationFormatted || '',
    street: dto.addressStreet || '',
    postalCode: dto.addressPostalCode || '',
    city: dto.addressCity || dto.city || '',
    ...(dto.latitude && dto.longitude ? {
      coordinates: { latitude: dto.latitude, longitude: dto.longitude }
    } : {}),
  };

  // Build metadata
  const metadata: ListingMetadata = {
    description: dto.description || '',
    amenities,
    includedFacilities: (dto.includedEquipment || []).map((f: any, i: number) => ({
      id: f.id || `facility-${i}`,
      name: f.name || f,
      quantity: f.quantity,
      description: f.description,
    })),
    rules,
    faq,
    highlights: dto.highlights || [],
  };

  // Build key facts
  const keyFacts: KeyFacts = {
    ...(dto.capacity ? { capacity: dto.capacity } : {}),
    bookingMode,
  };

  // Map events from DTO or metadata to activityData
  const rawEvents = dto.events || meta.events || [];
  const activityData = rawEvents.length > 0 ? {
    type: 'events' as const,
    events: rawEvents.map((e: any, i: number) => ({
      id: e.id || `event-${i}`,
      title: e.title || '',
      description: e.description,
      startDate: e.startDate || '',
      endDate: e.endDate,
      startTime: e.startTime,
      endTime: e.endTime,
      isRecurring: e.isRecurring,
      organizer: e.organizer,
      status: e.status || 'upcoming',
    })),
    totalCount: rawEvents.length,
  } : undefined;

  return {
    id: dto.id,
    tenantId: dto.tenantId || TENANT_ID,
    type: listingType,
    categoryKey: dto.categoryKey,
    name: dto.name || '',
    category: dto.categoryKey || dto.typeLabel || dto.type,
    subcategory: dto.subcategoryKeys?.[0],
    status: 'published',
    images,
    address,
    ...(contact && Object.keys(contact).length > 0 ? { contact } : {}),
    openingHours,
    keyFacts,
    metadata,
    bookingConfig: { enabled: true, mode: bookingMode, approval: dto.requiresApproval ? 'REQUIRED' : 'NONE', paymentRequired: false },
    ...(activityData ? { activityData } : {}),
    ...(dto.priceAmount ? {
      pricing: {
        basePrice: dto.priceAmount,
        currency: dto.priceCurrency || 'NOK',
        unit: dto.priceUnit || 'hour',
        displayPrice: dto.priceDisplay || `${dto.priceAmount} ${dto.priceCurrency}`,
      },
    } : {}),
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
    // Booking mode settings
    allowSeasonRental: dto.allowSeasonRental ?? false,
    allowRecurringBooking: dto.allowRecurringBooking ?? false,
  };
}


export function ListingDetailPage(): React.ReactElement {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Check if the ID looks like a UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id || '');
  
  // Fetch by ID if UUID, otherwise fetch by slug
  const { data: apiResponse, isLoading, error } = isUuid 
    ? useListing(params.id || '')
    : useListingBySlug(params.id || '');
  
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  // TODO: Replace with real auth state from SDK/provider
  const isAuthenticated = false;
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const hasCompletedBooking = false;

  // Transform API data
  const listing = React.useMemo((): Listing | null => {
    if (apiResponse?.data) return transformApiToListing(apiResponse.data);
    return null;
  }, [apiResponse]);

  // Gallery images for ImageSlider
  const galleryImages: GalleryImage[] = React.useMemo(() =>
    listing?.images.map(img => ({ id: img.id, src: img.url, alt: img.alt || listing.name, thumbnail: img.url })) || [],
  [listing]);


  // Handle favorite toggle
  const handleFavoriteToggle = React.useCallback(async () => {
    if (!listing) return;
    setIsFavoriteLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setIsFavorited(prev => !prev);
      await logAuditEvent(isFavorited ? 'FAVORITE_REMOVED' : 'FAVORITE_ADDED', listing.tenantId, listing.id);
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [listing, isFavorited]);

  // Handle booking click
  const handleBookingClick = React.useCallback(() => {
    const el = document.getElementById('booking-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Log page view
  React.useEffect(() => {
    if (listing) {
      logAuditEvent('LISTING_VIEWED', listing.tenantId, listing.id);
    }
  }, [listing]);

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div role="status" aria-live="polite" aria-busy="true" style={{ textAlign: 'center' }}>
            <Spinner aria-label="Laster innhold..." />
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Laster lokale...
            </Paragraph>
          </div>
        </main>
      </ContentLayout>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div role="alert" aria-live="assertive" style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Paragraph data-size="lg" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-default)' }}>
              Lokalet ble ikke funnet
            </Paragraph>
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {error ? 'Det oppstod en feil ved lasting av lokalet.' : 'Lokalet du leter etter finnes ikke eller er ikke tilgjengelig.'}
            </Paragraph>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: 'var(--ds-spacing-3) var(--ds-spacing-6)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-accent-contrast-default)',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              Tilbake til oversikten
            </button>
          </div>
        </main>
      </ContentLayout>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hjem', href: '/', onClick: () => navigate('/') },
    { label: 'Listing', href: '/', onClick: () => navigate('/') },
    { label: listing.name },
  ];

  return (
    <ContentLayout maxWidth="1440px">
      <main id="main-content" style={{ paddingTop: 'var(--ds-spacing-4)', paddingBottom: 'var(--ds-spacing-8)' }}>
        <div style={{ paddingLeft: 'var(--ds-spacing-2)', paddingRight: 'var(--ds-spacing-2)' }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Image Slider with arrows and dots */}
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          <ImageSlider
            images={galleryImages}
            height={480}
            showArrows
            showDots
            showThumbnails
            showCounter
            enableFullscreen
          />
        </div>

        {/* New feature-based layout */}
        <div style={{ paddingLeft: 'var(--ds-spacing-1)', paddingRight: 'var(--ds-spacing-1)' }}>
          <ListingDetailsLayout
            listing={listing}
            isAuthenticated={isAuthenticated}
            isFavorited={isFavorited}
            isFavoriteLoading={isFavoriteLoading}
            onFavoriteToggle={handleFavoriteToggle}
            onBookingClick={handleBookingClick}
            {...(MAPBOX_TOKEN ? { mapboxToken: MAPBOX_TOKEN } : {})}
          />
        </div>

        {/* Reviews Section */}
        <div
          style={{
            marginTop: 'var(--ds-spacing-8)',
            paddingLeft: 'var(--ds-spacing-1)',
            paddingRight: 'var(--ds-spacing-1)',
          }}
        >
          <Stack gap="32px">
            {/* Reviews Header */}
            <div>
              <Heading
                level={2}
                data-size="lg"
                style={{
                  marginBottom: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                Anmeldelser
              </Heading>
              <Paragraph
                data-size="md"
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: 0,
                }}
              >
                Les hva andre brukere sier om dette lokalet
              </Paragraph>
            </div>

            {/* Review Form - Show for authenticated users with completed bookings */}
            {isAuthenticated && hasCompletedBooking && showReviewForm && (
              <ReviewForm
                listingId={listing.id}
                bookingId="" // TODO: Get from user's completed bookings via SDK
                onSuccess={() => {
                  setShowReviewForm(false);
                  // Optionally show a success message
                }}
                onCancel={() => {
                  setShowReviewForm(false);
                }}
              />
            )}

            {/* Review List */}
            <ReviewList
              listingId={listing.id}
              queryParams={{ status: 'approved' }}
              showHelpfulCount={true}
              showStatus={false}
              variant="default"
            />
          </Stack>
        </div>

        {/* Responsive styles */}
        <style>{`
          /* Fade-in animation */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Section animations */
          .listing-details-layout > div {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          /* Tab panel animations */
          [role="tabpanel"] > div {
            animation: fadeInUp 0.3s ease-out;
          }

          /* Card hover effects */
          .contact-widget,
          .map-widget,
          .opening-hours-widget,
          .booking-widget-placement {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .contact-widget:hover,
          .map-widget:hover,
          .opening-hours-widget:hover,
          .booking-widget-placement:hover {
            transform: translateY(-2px);
            box-shadow: var(--ds-shadow-md);
          }

          /* Responsive breakpoints */
          @media (max-width: 991px) {
            .listing-content-grid {
              grid-template-columns: 1fr !important;
            }

            .booking-widget-placement {
              margin-left: calc(-1 * var(--ds-spacing-4));
              margin-right: calc(-1 * var(--ds-spacing-4));
              border-radius: 0 !important;
            }
          }

          @media (max-width: 599px) {
            /* Image slider mobile adjustments */
            .image-slider {
              margin-left: calc(-1 * var(--ds-spacing-4));
              margin-right: calc(-1 * var(--ds-spacing-4));
              border-radius: 0 !important;
            }

            .image-slider-main {
              border-radius: 0 !important;
            }

            /* Hide thumbnails on mobile */
            .image-slider-thumbnails {
              display: none !important;
            }

            /* Tabs stay horizontal on mobile, just smaller */
            .ds-tabs [role="tab"] {
              padding: var(--ds-spacing-3) var(--ds-spacing-2) !important;
              font-size: var(--ds-font-size-xs) !important;
            }
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Button hover enhancements */
          button[type="button"] {
            transition: all 0.2s ease !important;
          }
        `}</style>
      </main>
    </ContentLayout>
  );
}

export default ListingDetailPage;
