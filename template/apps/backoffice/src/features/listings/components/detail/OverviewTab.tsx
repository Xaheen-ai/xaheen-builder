/**
 * OverviewTab
 *
 * Overview tab for listing detail view displaying images, description, and key information.
 * First tab in the listing detail view providing administrators with a comprehensive overview.
 */
import * as React from 'react';
import { ImageGallery, KeyFactsRow, FacilityChips, OpeningHoursCard, LocationCard, ContactInfoCard, Card, Heading, Paragraph, Badge, SeasonalLeaseStatusBadge, Button } from '@xaheen/ds';
import type { Listing, SeasonalLease } from '@xaheen/sdk';
import type { GalleryImage, KeyFact, Facility, OpeningHoursDay } from '@xaheen/ds';
import { getListingTypeLabel, formatDateTime, useSeasonalLeases, formatWeekdays, formatPeriod, formatTimeSlot } from '@xaheen/sdk';
import { useNavigate } from 'react-router-dom';

// =============================================================================
// Types
// =============================================================================

export interface OverviewTabProps {
  /** Listing data from SDK */
  listing: Listing;
}

// =============================================================================
// Inline Components
// =============================================================================

/**
 * Copy icon SVG component
 */
const CopyIcon = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map listing status to Norwegian display labels
 */
const STATUS_LABELS: Record<string, string> = {
  published: 'Publisert',
  draft: 'Utkast',
  archived: 'Arkivert',
  maintenance: 'Vedlikehold',
};

/**
 * Transform SDK image URLs to GalleryImage format
 */
function transformImagesToGallery(images: string[], listingName: string): GalleryImage[] {
  return images.map((url, index) => ({
    id: `${index}-${url}`,
    src: url,
    alt: `${listingName} - Bilde ${index + 1}`,
    thumbnail: url, // Use same URL for thumbnail (can be optimized later)
  }));
}

/**
 * Build key facts array from listing data
 */
function buildKeyFacts(listing: Listing): KeyFact[] {
  const facts: KeyFact[] = [];

  // Add capacity if available
  if (listing.capacity) {
    facts.push({
      type: 'capacity',
      label: 'Kapasitet',
      value: `${listing.capacity} personer`,
    });
  }

  // Add listing type
  facts.push({
    type: 'custom',
    label: 'Type',
    value: getListingTypeLabel(listing.type),
  });

  // Add status
  facts.push({
    type: 'custom',
    label: 'Status',
    value: STATUS_LABELS[listing.status] || listing.status,
  });

  return facts;
}

/**
 * Transform SDK facilities/amenities array to Facility format
 */
function transformFacilities(facilities: string[] = [], amenities: string[] = []): Facility[] {
  // Combine facilities and amenities, remove duplicates
  const allFacilities = [...new Set([...facilities, ...amenities])];

  return allFacilities.map((label, index) => ({
    id: `facility-${index}`,
    label,
  }));
}

/**
 * Transform SDK opening hours to OpeningHoursDay format
 */
function transformOpeningHours(
  openingHours?: Record<string, { open: string; close: string }>
): OpeningHoursDay[] {
  if (!openingHours) {
    return [];
  }

  const daysOrder = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
  const result: OpeningHoursDay[] = [];

  // Convert object to array and sort by day order
  Object.entries(openingHours).forEach(([day, times]) => {
    const hours = times.open && times.close ? `${times.open} - ${times.close}` : 'Stengt';
    const isClosed = !times.open || !times.close;

    result.push({
      day: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize first letter
      hours,
      isClosed,
    });
  });

  // Sort by day order
  result.sort((a, b) => {
    const aIndex = daysOrder.findIndex(d => a.day.toLowerCase().startsWith(d));
    const bIndex = daysOrder.findIndex(d => b.day.toLowerCase().startsWith(d));
    return aIndex - bIndex;
  });

  return result;
}

// =============================================================================
// Component
// =============================================================================

export function OverviewTab({ listing }: OverviewTabProps): React.ReactElement {
  // State for copy feedback
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Navigation
  const navigate = useNavigate();

  // Fetch seasonal leases for this listing
  const { data: seasonalLeasesData } = useSeasonalLeases({
    listingId: listing.id,
  });
  const seasonalLeases = seasonalLeasesData?.data ?? [];

  // Transform images to gallery format
  const galleryImages = React.useMemo(
    () => transformImagesToGallery(listing.images || [], listing.name),
    [listing.images, listing.name]
  );

  // Build key facts
  const keyFacts = React.useMemo(
    () => buildKeyFacts(listing),
    [listing]
  );

  // Transform facilities and amenities
  const facilities = React.useMemo(
    () => transformFacilities(listing.metadata?.facilities, listing.metadata?.amenities),
    [listing.metadata?.facilities, listing.metadata?.amenities]
  );

  // Transform opening hours
  const openingHours = React.useMemo(
    () => transformOpeningHours(listing.metadata?.openingHours),
    [listing.metadata?.openingHours]
  );

  // Copy ID handler with feedback
  const handleCopyId = React.useCallback((id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-6)',
      }}
    >
      {/* Image Gallery Section */}
      <section>
        <ImageGallery
          images={galleryImages}
          showCounter
          height={500}
          maxThumbnails={4}
        />
      </section>

      {/* Key Facts Section */}
      <section>
        <KeyFactsRow facts={keyFacts} variant="default" />
      </section>

      {/* Description Section */}
      {listing.description && (
        <section>
          <h2
            style={{
              fontSize: 'var(--ds-font-size-lg)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              margin: '0 0 var(--ds-spacing-3) 0',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Beskrivelse
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-base)',
              lineHeight: 'var(--ds-line-height-relaxed)',
              color: 'var(--ds-color-neutral-text-subtle)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {listing.description}
          </p>
        </section>
      )}

      {/* Facilities and Amenities Section */}
      {facilities.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: 'var(--ds-font-size-lg)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              margin: '0 0 var(--ds-spacing-4) 0',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Fasiliteter
          </h2>
          <FacilityChips facilities={facilities} />
        </section>
      )}

      {/* Opening Hours Section */}
      {openingHours.length > 0 && (
        <section>
          <OpeningHoursCard hours={openingHours} highlightToday />
        </section>
      )}

      {/* Location and Contact Information Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Location Section */}
        {listing.address && (
          <LocationCard
            address={listing.address}
            latitude={listing.location?.latitude}
            longitude={listing.location?.longitude}
            mapboxToken={import.meta.env.VITE_MAPBOX_TOKEN}
            height={250}
            title="Lokasjon"
            showExpandLink
          />
        )}

        {/* Contact Information Section */}
        <ContactInfoCard
          email={listing.metadata?.contactEmail}
          phone={listing.metadata?.contactPhone}
          website={listing.metadata?.contactWebsite}
          contactName={listing.metadata?.contactName}
          title="Kontaktinformasjon"
        />
      </div>

      {/* Metadata Section */}
      <section
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderRadius: 'var(--ds-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--ds-font-size-lg)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            margin: '0 0 var(--ds-spacing-4) 0',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          Metadata
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--ds-spacing-2) var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-sm)',
          }}
        >
          {/* Created */}
          <div
            style={{
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Opprettet:
          </div>
          <div style={{ color: 'var(--ds-color-neutral-text-default)' }}>
            {listing.createdAt ? formatDateTime(listing.createdAt) : 'Ikke tilgjengelig'}
          </div>

          {/* Updated */}
          <div
            style={{
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Oppdatert:
          </div>
          <div style={{ color: 'var(--ds-color-neutral-text-default)' }}>
            {listing.updatedAt ? formatDateTime(listing.updatedAt) : 'Ikke tilgjengelig'}
          </div>

          {/* Listing ID */}
          <div
            style={{
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            ID:
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <code
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                fontFamily: 'var(--ds-font-family-monospace)',
                color: 'var(--ds-color-neutral-text-default)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                borderRadius: 'var(--ds-radius-sm)',
              }}
            >
              {listing.id}
            </code>
            <button
              type="button"
              onClick={() => handleCopyId(listing.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-xs)',
                backgroundColor: copiedId === listing.id
                  ? 'var(--ds-color-success-surface-subtle)'
                  : 'var(--ds-color-neutral-surface-default)',
                color: copiedId === listing.id
                  ? 'var(--ds-color-success-text-default)'
                  : 'var(--ds-color-neutral-text-default)',
                border: '1px solid',
                borderColor: copiedId === listing.id
                  ? 'var(--ds-color-success-border-subtle)'
                  : 'var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (copiedId !== listing.id) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (copiedId !== listing.id) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-default)';
                }
              }}
            >
              <CopyIcon size={12} />
              <span>{copiedId === listing.id ? 'Kopiert!' : 'Kopier'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Seasonal Lease Section */}
      {seasonalLeases.length > 0 && (
        <section>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-4)' }}>
              <div>
                <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                  Sesongleie
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Dette lokalet har {seasonalLeases.length} aktiv{seasonalLeases.length > 1 ? 'e' : ''} sesongleieavtale{seasonalLeases.length > 1 ? 'r' : ''}.
                </Paragraph>
              </div>
              <Button
                type="button"
                variant="secondary"
                data-size="sm"
                onClick={() => navigate('/seasons')}
              >
                Administrer sesongleie
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {seasonalLeases.map((lease: SeasonalLease) => (
                <div
                  key={lease.id}
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-3)' }}>
                    <div>
                      <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-medium)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
                        {lease.organizationName || lease.organizationId}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                        ID: <code style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-xs)' }}>{lease.id.slice(0, 8)}</code>
                      </Paragraph>
                    </div>
                    <SeasonalLeaseStatusBadge status={lease.status} />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--ds-spacing-2)',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Periode: </span>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {formatPeriod(lease.startDate, lease.endDate)}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Ukedager: </span>
                      {formatWeekdays(lease.weekdays).map((day: string, idx: number) => (
                        <Badge key={idx} data-color="neutral" data-size="sm" style={{ marginLeft: 'var(--ds-spacing-1)' }}>
                          {day}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Tidspunkt: </span>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {formatTimeSlot(lease.startTime, lease.endTime)}
                      </span>
                    </div>

                    {lease.totalPrice && (
                      <div>
                        <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Totalpris: </span>
                        <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {lease.totalPrice.toLocaleString('nb-NO')} kr
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
