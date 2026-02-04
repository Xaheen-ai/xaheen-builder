/**
 * ListingCard
 *
 * A reusable card component for displaying listing/venue information.
 * Supports images, ratings, pricing, facilities, and action buttons.
 */
import * as React from 'react';
import { Tag, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';

/** Card variant for different display contexts */
export type ListingCardVariant = 'grid' | 'detailed';

export interface ListingCardProps {
  /** Unique identifier */
  id: string;
  /** Listing name/title */
  name: string;
  /** Category/type label (displayed on image badge) */
  type: string;
  /** Listing type from schema: 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER' */
  listingType?: 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';
  /** Location text */
  location: string;
  /** Description text */
  description: string;
  /** Image URL */
  image: string;
  /** List of facilities */
  facilities?: string[];
  /** Number of additional facilities not shown */
  moreFacilities?: number;
  /** Capacity (number of people) */
  capacity?: number;
  /** Price amount */
  price?: number;
  /** Price unit (e.g., 'time', 'person', 'dag') */
  priceUnit?: string;
  /** Currency code */
  currency?: string;
  /** Rating value (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Whether the listing is available */
  available?: boolean;
  /** Click handler for the card */
  onClick?: (id: string) => void;
  /** Click handler for favorite button */
  onFavorite?: (id: string) => void;
  /** Click handler for share button */
  onShare?: (id: string) => void;
  /** Close handler for detailed variant */
  onClose?: () => void;
  /** Whether this listing is favorited */
  isFavorited?: boolean;
  /** Custom class name */
  className?: string;
  /** Image height in pixels */
  imageHeight?: number;
  /** Card variant: 'grid' for compact grid view, 'detailed' for popup/modal view */
  variant?: ListingCardVariant;
  /** Show/hide different elements */
  showRating?: boolean;
  showPrice?: boolean;
  showCapacity?: boolean;
  showFacilities?: boolean;
  showDescription?: boolean;
  showLocation?: boolean;
  showTypeBadge?: boolean;
  showAvailabilityBadge?: boolean;
  showGradientOverlay?: boolean;
  showFavoriteButton?: boolean;
  showShareButton?: boolean;
  showListingType?: boolean;
  /** Max facilities to display */
  maxFacilities?: number;
}

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--ds-color-warning-base-default)" stroke="var(--ds-color-warning-base-default)" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// Listing type labels in Norwegian
const listingTypeLabels: Record<string, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  EVENT: 'Arrangement',
  SERVICE: 'Tjeneste',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};

// Listing type colors for badges
const listingTypeColors: Record<string, string> = {
  SPACE: 'accent',
  RESOURCE: 'info',
  EVENT: 'success',
  SERVICE: 'warning',
  VEHICLE: 'brand1',
  OTHER: 'neutral',
};

export function ListingCard({
  id,
  name,
  type,
  listingType,
  location,
  description,
  image,
  facilities = [],
  moreFacilities = 0,
  capacity,
  price,
  priceUnit = 'time',
  currency = 'kr',
  rating,
  reviewCount,
  available = true,
  onClick,
  onFavorite,
  onShare,
  onClose,
  isFavorited = false,
  className,
  imageHeight = 200,
  variant = 'grid',
  showRating = false, // Disabled by default, enable when rating system is ready
  showPrice = false,
  showCapacity = true,
  showFacilities = true,
  showDescription = true,
  showLocation = true,
  showTypeBadge = true,
  showAvailabilityBadge: _showAvailabilityBadge = true,
  showGradientOverlay = true,
  showFavoriteButton = true,
  showShareButton = true,
  showListingType = true,
  maxFacilities = 3,
}: ListingCardProps): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    onClick?.(id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Detailed variant - larger popup/modal style
  if (variant === 'detailed') {
    return (
      <div
        className={cn('listing-card listing-card--detailed', className)}
        style={{
          position: 'relative',
          width: 'var(--ds-size-card-detailed, 520px)',
          maxWidth: '95vw',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          boxShadow: 'var(--ds-shadow-lg, 0 20px 60px var(--ds-color-neutral-border-default))',
          overflow: 'hidden',
        }}
      >
        {/* Close button - positioned over the image with high contrast */}
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Lukk"
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-3)',
              right: 'var(--ds-spacing-3)',
              zIndex: 10,
              width: 'var(--ds-spacing-10)',
              height: 'var(--ds-spacing-10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              color: 'var(--ds-color-neutral-text-default)',
              cursor: 'pointer',
              boxShadow: 'var(--ds-shadow-md, 0 4px 12px var(--ds-color-neutral-border-default))',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <CloseIcon />
          </button>
        )}

        <div
          style={{ cursor: onClick ? 'pointer' : 'default' }}
          onClick={handleClick}
        >
          {/* Image */}
          {image && (
            <img
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: 'var(--ds-size-image-detailed, 240px)',
                objectFit: 'cover',
              }}
            />
          )}

          <div style={{ padding: 'var(--ds-spacing-5)' }}>
            {/* Listing type badge */}
            {listingType && (
              <span style={{
                display: 'inline-block',
                marginBottom: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                textTransform: 'uppercase',
                letterSpacing: 'var(--ds-letter-spacing-badge, 0.5px)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-text-default)',
                borderRadius: 'var(--ds-border-radius-sm)',
              }}>
                {listingTypeLabels[listingType] || listingType}
              </span>
            )}

            {/* Title */}
            <Heading
              level={3}
              data-size="md"
              style={{ marginBottom: 'var(--ds-spacing-2)' }}
            >
              {name}
            </Heading>

            {/* Location */}
            <Paragraph
              data-size="md"
              style={{
                marginBottom: 'var(--ds-spacing-3)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {location}
            </Paragraph>

            {/* Description */}
            {description && (
              <Paragraph
                data-size="sm"
                variant="long"
                style={{ marginBottom: 'var(--ds-spacing-4)' }}
              >
                {description}
              </Paragraph>
            )}

            {/* Capacity */}
            {capacity && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-4)',
              }}>
                <PeopleIcon />
                <Paragraph data-size="md" style={{ margin: 0 }}>
                  {capacity} personer
                </Paragraph>
              </div>
            )}

            {/* Facilities */}
            {facilities && facilities.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-4)',
              }}>
                {facilities.slice(0, 4).map((facility, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      fontSize: 'var(--ds-font-size-sm)',
                      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                      color: 'var(--ds-color-neutral-text-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                    }}
                  >
                    {facility}
                  </span>
                ))}
                {facilities.length > 4 && (
                  <span style={{
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}>
                    +{facilities.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Footer with availability & CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 'var(--ds-spacing-4)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              {available !== undefined && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  fontSize: 'var(--ds-font-size-md)',
                  color: available
                    ? 'var(--ds-color-success-text-default)'
                    : 'var(--ds-color-danger-text-default)',
                  fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
                }}>
                  <span style={{
                    width: 'var(--ds-spacing-3)',
                    height: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: available
                      ? 'var(--ds-color-success-base-default)'
                      : 'var(--ds-color-danger-base-default)',
                  }} />
                  {available ? 'Ledig' : 'Opptatt'}
                </span>
              )}
              <Paragraph
                data-size="md"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-accent-text-default)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                }}
              >
                Se detaljer →
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default) - compact card style
  return (
    <div
      className={cn('listing-card', className)}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: `0.5px solid ${isHovered ? 'var(--ds-color-accent-border-subtle)' : 'var(--ds-color-neutral-border-subtle)'}`,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered
          ? 'var(--ds-shadow-md, 0 12px 32px var(--ds-color-neutral-border-default))'
          : 'var(--ds-shadow-sm, 0 2px 8px var(--ds-color-neutral-border-subtle))',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Image with overlays */}
      <div style={{
        position: 'relative',
        height: `${imageHeight}px`,
        backgroundColor: 'var(--ds-color-neutral-surface-hover)'
      }}>
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        {showGradientOverlay && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--ds-color-neutral-background-default) 0%, transparent 50%)',
            opacity: 0.4,
          }} />
        )}

        {/* Category badge */}
        {showTypeBadge && (
          <div style={{ position: 'absolute', top: 'var(--ds-spacing-3)', left: 'var(--ds-spacing-3)' }}>
            <Tag data-size="sm" data-color={(listingTypeColors[listingType || type] || 'neutral') as any} style={{ paddingInline: 'var(--ds-spacing-2)' }}>
              {listingTypeLabels[listingType || type] || listingTypeLabels[type] || type}
            </Tag>
          </div>
        )}

        {/* Action buttons */}
        {(showFavoriteButton || showShareButton) && (
          <div style={{
            position: 'absolute',
            top: 'var(--ds-spacing-3)',
            right: 'var(--ds-spacing-3)',
            display: 'flex',
            gap: 'var(--ds-spacing-2)'
          }}>
          {showFavoriteButton && onFavorite && (
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'var(--ds-spacing-9)',
                height: 'var(--ds-spacing-9)',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: isFavorited ? 'var(--ds-color-danger-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--ds-shadow-sm, 0 2px 8px var(--ds-color-neutral-border-subtle))'
              }}
              onClick={handleFavorite}
              title="Legg til favoritter"
            >
              <HeartIcon filled={isFavorited} />
            </button>
          )}
          {showShareButton && onShare && (
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'var(--ds-spacing-9)',
                height: 'var(--ds-spacing-9)',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--ds-shadow-sm, 0 2px 8px var(--ds-color-neutral-border-subtle))'
              }}
              onClick={handleShare}
              title="Del"
            >
              <ShareIcon />
            </button>
          )}
          </div>
        )}

        {/* Rating on image - TODO: Enable when rating system is ready */}
        {showRating && rating !== undefined && (
          <div style={{
            position: 'absolute',
            bottom: 'var(--ds-spacing-3)',
            left: 'var(--ds-spacing-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            boxShadow: 'var(--ds-shadow-sm, 0 2px 8px var(--ds-color-neutral-border-subtle))'
          } as React.CSSProperties}>
            <StarIcon />
            {rating}
            {reviewCount !== undefined && (
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontWeight: 'var(--ds-font-weight-regular)' } as React.CSSProperties}>
                ({reviewCount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--ds-spacing-6)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Heading
          level={3}
          data-size="xs"
          style={{ marginBottom: 'var(--ds-spacing-2)' }}
        >
          {name}
        </Heading>

        {showLocation && (
          <Paragraph
            data-size="sm"
            style={{
              marginBottom: 'var(--ds-spacing-3)',
              color: 'var(--ds-color-neutral-text-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            <MapPinIcon />
            {location}
          </Paragraph>
        )}

        {showDescription && (
          <Paragraph
            data-size="sm"
            variant="short"
            style={{
              marginBottom: 'var(--ds-spacing-4)',
              color: 'var(--ds-color-neutral-text-subtle)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Paragraph>
        )}

        {/* Facility tags */}
        {showFacilities && facilities.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-4)',
            overflow: 'hidden'
          }}>
            {facilities.slice(0, maxFacilities).map((facility) => (
              <Tag key={facility} data-size="sm" data-color="accent" style={{ paddingInline: 'var(--ds-spacing-2)', flexShrink: 0 }}>
                {facility}
              </Tag>
            ))}
            {moreFacilities > 0 && (
              <Tag data-size="sm" data-color="neutral" style={{ paddingInline: 'var(--ds-spacing-2)', flexShrink: 0 }}>
                +{moreFacilities} mer
              </Tag>
            )}
          </div>
        )}

        {/* Footer with capacity and price */}
        {(showCapacity || showPrice) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: 'auto calc(var(--ds-spacing-6) * -1) calc(var(--ds-spacing-6) * -1) calc(var(--ds-spacing-6) * -1)',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-6)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)'
          }}>
            {showCapacity && capacity !== undefined && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                fontFamily: 'var(--ds-font-family)'
              } as React.CSSProperties}>
                <UserIcon />
                {capacity} personer
              </div>
            )}
            {showPrice && price !== undefined && (
              <span style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-default)',
                fontWeight: 'var(--ds-font-weight-medium)',
                fontFamily: 'var(--ds-font-family)'
              } as React.CSSProperties}>
                fra {price} {currency}/{priceUnit}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingCard;
