/**
 * ListingHeader Component
 *
 * Displays listing category badge, title with action buttons (favorite, share),
 * and address information.
 */

import * as React from 'react';
import { Heading, Paragraph, Tag } from '@xaheen/ds';
import type { Listing } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';

// =============================================================================
// Icons
// =============================================================================

function MapPinIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface ListingHeaderProps {
  listing: Listing;
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
  isAuthenticated: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
  onAuthRequired: () => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ListingHeader({
  listing,
  isFavorited,
  isFavoriteLoading = false,
  isAuthenticated,
  onFavoriteToggle,
  onShare,
  onAuthRequired,
  className,
}: ListingHeaderProps): React.ReactElement {
  return (
    <header
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        paddingTop: 'var(--ds-spacing-4)',
        paddingBottom: 'var(--ds-spacing-4)',
        width: '100%',
      }}
    >
      {/* Category Tag */}
      {listing.category && (
        <div>
          <Tag data-color="accent" data-size="md">
            {listing.category}
          </Tag>
        </div>
      )}

      {/* Title row with actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {/* Title */}
        <Heading
          level={1}
          data-size="lg"
          style={{
            margin: 0,
            lineHeight: 1.2,
            flex: 1,
            minWidth: '280px',
          }}
        >
          {listing.name}
        </Heading>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            flexShrink: 0,
          }}
        >
          <FavoriteButton
            isFavorited={isFavorited}
            isLoading={isFavoriteLoading}
            isAuthenticated={isAuthenticated}
            onToggle={onFavoriteToggle}
            onAuthRequired={onAuthRequired}
          />
          <ShareButton
            onShare={onShare}
            listingName={listing.name}
          />
        </div>
      </div>

      {/* Address */}
      {listing.address && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          <MapPinIcon size={16} />
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {listing.address.formatted}
          </Paragraph>
        </div>
      )}
    </header>
  );
}

export default ListingHeader;
