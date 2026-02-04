/**
 * Location Step
 * Address input with Google Places autocomplete and coordinates
 */

/* eslint-disable digdir/prefer-ds-components -- Location form with Google Places */

import { useRef, useEffect, useState } from 'react';
import { Textfield, Paragraph, Heading } from '@xaheen/ds';
import { useGooglePlaces, type PlaceResult } from '../../../../../hooks/useGooglePlaces';
import type { BackofficeListing } from '../../../types';

export interface LocationStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function LocationStep({ data, onChange, errors = [] }: LocationStepProps) {
  const location = data.location || {};
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(location.address || '');
  const { isLoaded, error: placesError, initAutocomplete } = useGooglePlaces({
    country: 'no', // Restrict to Norway
    types: ['address'],
  });

  const handleLocationChange = (field: keyof NonNullable<BackofficeListing['location']>, value: string | number) => {
    onChange({
      location: {
        ...location,
        [field]: value,
      },
    });
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place: PlaceResult) => {
    const newLocation: Partial<NonNullable<BackofficeListing['location']>> = {
      ...location,
    };

    if (place.address) {
      newLocation.address = place.address;
      setInputValue(place.address);
    }
    if (place.postalCode) {
      newLocation.postalCode = place.postalCode;
    }
    if (place.city) {
      newLocation.city = place.city;
    }
    if (place.municipality) {
      newLocation.municipality = place.municipality;
    }
    if (place.country) {
      newLocation.country = place.country;
    }
    if (place.latitude !== undefined) {
      newLocation.latitude = place.latitude;
    }
    if (place.longitude !== undefined) {
      newLocation.longitude = place.longitude;
    }

    onChange({ location: newLocation });
  };

  // Initialize autocomplete when loaded
  useEffect(() => {
    if (isLoaded && inputRef.current) {
      initAutocomplete(inputRef.current, handlePlaceSelect);
    }
  }, [isLoaded, initAutocomplete]);

  // Sync input value with location.address
  useEffect(() => {
    if (location.address && location.address !== inputValue) {
      setInputValue(location.address);
    }
  }, [location.address]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Lokasjon
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Søk etter adresse eller fyll ut manuelt
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* Address with Autocomplete */}
      <fieldset
        style={{
          border: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-1)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
          asChild
        >
          <label htmlFor="address-autocomplete">Adresse *</label>
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          {isLoaded
            ? 'Begynn å skrive for å søke etter adresse'
            : placesError
              ? 'Adressesøk ikke tilgjengelig - fyll ut manuelt'
              : 'Laster adressesøk...'}
        </Paragraph>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            id="address-autocomplete"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleLocationChange('address', e.target.value);
            }}
            placeholder="f.eks. Skuldsvei 19, Frogner"
            autoComplete="off"
            className="ds-textfield"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: 'var(--ds-spacing-3)',
              paddingRight: isLoaded ? 'var(--ds-spacing-10)' : 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-default)',
              fontSize: 'var(--ds-font-size-md)',
              fontFamily: 'inherit',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              color: 'var(--ds-color-neutral-text-default)',
              lineHeight: 'var(--ds-line-height-md)',
            }}
          />
          {isLoaded && (
            <div
              style={{
                position: 'absolute',
                right: 'var(--ds-spacing-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ds-color-success-text-default)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
              }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          )}
          {!isLoaded && !placesError && (
            <div
              style={{
                position: 'absolute',
                right: 'var(--ds-spacing-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ds-color-neutral-text-subtle)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
            </div>
          )}
        </div>
      </fieldset>

      {/* Postal code and city row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--ds-spacing-4)' }}>
        <div>
          <Textfield
            label="Postnummer"
            value={location.postalCode || ''}
            onChange={(e) => handleLocationChange('postalCode', e.target.value)}
            placeholder="0001"
          />
        </div>
        <div>
          <Textfield
            label="By"
            value={location.city || ''}
            onChange={(e) => handleLocationChange('city', e.target.value)}
            placeholder="Oslo"
          />
        </div>
      </div>

      {/* Municipality */}
      <div>
        <Textfield
          label="Kommune"
          description="Kommune der objektet ligger"
          value={location.municipality || ''}
          onChange={(e) => handleLocationChange('municipality', e.target.value)}
          placeholder="f.eks. Oslo"
        />
      </div>

      {/* Country */}
      <div>
        <Textfield
          label="Land"
          value={location.country || 'Norge'}
          onChange={(e) => handleLocationChange('country', e.target.value)}
          placeholder="Norge"
        />
      </div>

      {/* Coordinates */}
      <div>
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          Koordinater
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {location.latitude && location.longitude
            ? 'Koordinater fylles automatisk fra adressesøk'
            : 'Koordinater fylles automatisk når du velger en adresse fra søket'}
        </Paragraph>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Textfield
              label="Breddegrad (latitude)"
              type="number"
              step="any"
              value={location.latitude?.toString() || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  handleLocationChange('latitude', val);
                }
              }}
              placeholder="59.9139"
            />
          </div>
          <div>
            <Textfield
              label="Lengdegrad (longitude)"
              type="number"
              step="any"
              value={location.longitude?.toString() || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  handleLocationChange('longitude', val);
                }
              }}
              placeholder="10.7522"
            />
          </div>
        </div>
      </div>

      {/* Map preview when coordinates are available */}
      {location.latitude && location.longitude && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-info-border-default)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
            Lokasjon registrert
          </Paragraph>
          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-accent-text-default)',
              textDecoration: 'none',
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Vis på kart →
          </a>
        </div>
      )}
    </div>
  );
}
