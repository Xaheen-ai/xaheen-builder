/**
 * MapWidget Component
 *
 * Displays a map preview with the listing location.
 * Uses Mapbox static image API for the preview.
 */

import * as React from 'react';
import { Paragraph, Button } from '@xaheen/ds';
import type { Address } from '../../types';

// =============================================================================
// Icons
// =============================================================================

function MapPinIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface MapWidgetProps {
  address: Address;
  mapboxToken?: string;
  height?: number;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function MapWidget({
  address,
  mapboxToken,
  height = 160,
  className,
}: MapWidgetProps): React.ReactElement {
  const [geocodedCoords, setGeocodedCoords] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(false);

  // Use provided coordinates or geocoded ones
  const coordinates = address.coordinates || geocodedCoords;
  const hasCoordinates = coordinates?.latitude && coordinates?.longitude;

  // Geocode address when coordinates are not available
  React.useEffect(() => {
    if (address.coordinates || !mapboxToken || !address.formatted || geocodedCoords) {
      return;
    }

    const geocodeAddress = async () => {
      setIsGeocoding(true);
      try {
        const query = encodeURIComponent(address.formatted);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&country=NO&limit=1`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setGeocodedCoords({ latitude: lat, longitude: lng });
        }
      } catch (error) {
        console.warn('Geocoding failed:', error);
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeAddress();
  }, [address.formatted, address.coordinates, mapboxToken, geocodedCoords]);

  // Build Mapbox static image URL
  const mapUrl = React.useMemo(() => {
    if (!hasCoordinates || !mapboxToken) return null;

    const { latitude, longitude } = coordinates!;
    const zoom = 14;
    const width = 400;
    const mapHeight = height;
    const style = 'mapbox/streets-v12';
    const marker = `pin-s+2563eb(${longitude},${latitude})`;

    return `https://api.mapbox.com/styles/v1/${style}/static/${marker}/${longitude},${latitude},${zoom}/${width}x${mapHeight}@2x?access_token=${mapboxToken}`;
  }, [coordinates, mapboxToken, height, hasCoordinates]);

  // Google Maps link
  const googleMapsUrl = React.useMemo(() => {
    if (hasCoordinates) {
      const { latitude, longitude } = coordinates!;
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(address.formatted)}`;
  }, [address, coordinates, hasCoordinates]);

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Map preview */}
      {mapUrl ? (
        <div
          style={{
            width: '100%',
            height: `${height}px`,
            overflow: 'hidden',
          }}
        >
          <img
            src={mapUrl}
            alt={`Kart som viser ${address.formatted}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            height: `${height}px`,
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <MapPinIcon size={32} />
          {isGeocoding && (
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Laster kart...
            </Paragraph>
          )}
        </div>
      )}

      {/* Content below map */}
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Lokasjon
        </Paragraph>

        {/* Address */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <div style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0, marginTop: '2px' }}>
            <MapPinIcon size={16} />
          </div>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {address.formatted}
          </Paragraph>
        </div>

        {/* Open in maps button */}
        <Button
          type="button"
          variant="secondary"
          data-size="sm"
          onClick={() => window.open(googleMapsUrl, '_blank')}
          style={{ width: '100%' }}
        >
          <ExternalLinkIcon size={16} />
          Åpne i kart
        </Button>
      </div>
    </div>
  );
}

export default MapWidget;
