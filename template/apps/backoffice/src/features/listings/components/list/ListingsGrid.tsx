/**
 * Listings Grid View
 * Card-based grid display using the reusable DS ListingCard component
 * Enhanced with admin-specific features: selection, status badges, actions
 */

import type { ChangeEvent } from 'react';
import { Paragraph, Spinner, ListingCard, ListingGrid as DSListingGrid, ListingStatusBadge } from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import { ListingRowActions } from './ListingRowActions';
import type { Listing, ListingStatus } from '@xaheen/sdk';
import { transformListing } from '@xaheen/sdk';

interface ListingsGridProps {
  listings: Listing[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectOne: (id: string, selected: boolean) => void;
  onRefresh?: () => void;
}

export function ListingsGrid({
  listings,
  isLoading,
  selectedIds,
  onSelectOne,
  onRefresh,
}: ListingsGridProps) {
  const navigate = useNavigate();

  const handleCardClick = (id: string, slug?: string) => {
    // Use slug for navigation, fall back to id if slug not available
    navigate(`/listings/${slug || id}`);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
        }}
      >
        <Spinner aria-label="Laster..." />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Ingen utleieobjekter funnet
        </Paragraph>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Prøv å endre søkekriteriene eller opprett et nytt objekt
        </Paragraph>
      </div>
    );
  }

  return (
    <DSListingGrid minCardWidth={320} gap="var(--ds-spacing-4)">
      {listings.map((listing) => {
        // Transform raw Listing to UiListing for consistent data display
        const uiListing = transformListing(listing);

        return (
          <div key={listing.id} style={{ position: 'relative' }}>
            {/* Admin overlay: Selection checkbox */}
            <div
              style={{
                position: 'absolute',
                top: 'var(--ds-spacing-3)',
                left: 'var(--ds-spacing-3)',
                zIndex: 10,
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-sm)',
                padding: 'var(--ds-spacing-1)',
                boxShadow: 'var(--ds-shadow-sm)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                aria-label={`Velg ${listing.name}`}
                checked={selectedIds.includes(listing.id)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSelectOne(listing.id, e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--ds-color-accent-base-default)',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Admin overlay: Status badge */}
            <div
              style={{
                position: 'absolute',
                top: 'var(--ds-spacing-3)',
                right: 'var(--ds-spacing-3)',
                zIndex: 10,
              }}
            >
              <ListingStatusBadge status={listing.status as ListingStatus} />
            </div>

            {/* Admin overlay: Row actions */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(var(--ds-spacing-3) + 200px + var(--ds-spacing-4))',
                right: 'var(--ds-spacing-4)',
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ListingRowActions
                listingId={listing.id}
                listingSlug={listing.slug}
                listingName={listing.name}
                status={listing.status as ListingStatus}
                onActionComplete={onRefresh}
              />
            </div>

            {/* Reusable ListingCard from DS - using transformed UiListing */}
            <ListingCard
              id={uiListing.id}
              name={uiListing.name}
              type={uiListing.type}
              listingType={uiListing.listingType}
              location={uiListing.location || '-'}
              description={uiListing.description}
              image={uiListing.image}
              facilities={uiListing.facilities}
              moreFacilities={uiListing.moreFacilities}
              {...(uiListing.capacity > 0 ? { capacity: uiListing.capacity } : {})}
              {...(uiListing.price > 0 ? { price: uiListing.price } : {})}
              priceUnit={uiListing.priceUnit}
              currency={uiListing.currency}
              onClick={() => handleCardClick(listing.id, listing.slug)}
              imageHeight={200}
              showTypeBadge={false}
              showFavoriteButton={false}
              showShareButton={false}
              showRating={false}
              showPrice={uiListing.price > 0}
              showListingType
              showCapacity={uiListing.capacity > 0}
              showLocation
              showDescription
              showFacilities={uiListing.facilities.length > 0}
              maxFacilities={3}
            />
          </div>
        );
      })}
    </DSListingGrid>
  );
}
