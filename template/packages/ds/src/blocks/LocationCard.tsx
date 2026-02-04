/**
 * LocationCard
 *
 * Card displaying location with an embedded map preview.
 * Uses Mapbox static image for the map preview.
 */
import * as React from 'react';
import { Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { MapPinIcon } from '../primitives/icons';

export interface LocationCardProps {
  /** Address text */
  address: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Mapbox access token */
  mapboxToken?: string;
  /** Height of the map preview */
  height?: number | string;
  /** Card title */
  title?: string;
  /** Callback when map is clicked */
  onMapClick?: () => void;
  /** Show "View larger map" link */
  showExpandLink?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * LocationCard component
 *
 * @example
 * ```tsx
 * <LocationCard
 *   address="Storgata 1, 0155 Oslo"
 *   latitude={59.7439}
 *   longitude={10.2045}
 *   mapboxToken="your-mapbox-token"
 * />
 * ```
 */
export function LocationCard({
  address,
  latitude,
  longitude,
  mapboxToken,
  height = 200,
  title = 'Lokasjon',
  onMapClick,
  showExpandLink = true,
  className,
}: LocationCardProps): React.ReactElement {
  const hasCoordinates = latitude !== undefined && longitude !== undefined;
  const mapHeight = typeof height === 'number' ? height : 200;

  // Detect color scheme for map style
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkColorScheme = () => {
      const colorScheme = document.documentElement.getAttribute('data-color-scheme');
      if (colorScheme === 'dark') {
        setIsDark(true);
      } else if (colorScheme === 'auto') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(false);
      }
    };

    checkColorScheme();

    // Listen for changes
    const observer = new MutationObserver(checkColorScheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-scheme'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkColorScheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkColorScheme);
    };
  }, []);

  // Generate Mapbox static image URL
  const mapStyle = isDark ? 'dark-v11' : 'streets-v12';
  const mapUrl = hasCoordinates && mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/pin-s+ef4444(${longitude},${latitude})/${longitude},${latitude},14/400x${mapHeight}@2x?access_token=${mapboxToken}`
    : null;

  // Google Maps URL for larger map link
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div
      className={cn('location-card', className)}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            padding: 'var(--ds-spacing-5) var(--ds-spacing-5) var(--ds-spacing-3)',
          }}
        >
          <MapPinIcon
            size={18}
            style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
          />
          <Heading
            level={3}
            data-size="xs"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </Heading>
        </div>
      )}

      {/* Map preview */}
      <div
        style={{
          position: 'relative',
          height: typeof height === 'number' ? `${height}px` : height,
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}
      >
        {showExpandLink && (
          <Link
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-2)',
              left: 'var(--ds-spacing-2)',
              zIndex: 1,
              fontSize: 'var(--ds-font-size-xs)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              borderRadius: 'var(--ds-border-radius-sm)',
              boxShadow: 'var(--ds-shadow-sm)',
            }}
          >
            Vis større kart
          </Link>
        )}
        <div
          onClick={onMapClick}
          role={onMapClick ? 'button' : undefined}
          tabIndex={onMapClick ? 0 : undefined}
          style={{
            width: '100%',
            height: '100%',
            cursor: onMapClick ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mapUrl ? (
            <img
              src={mapUrl}
              alt={`Kart som viser ${address}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Kart
            </Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationCard;
