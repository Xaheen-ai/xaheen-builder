/**
 * Location Step
 * Address and coordinates input
 */

import { Textfield, Paragraph, Heading } from '@xaheen/ds';
import type { BackofficeListing } from '../../../types';

export interface LocationStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function LocationStep({ data, onChange, errors = [] }: LocationStepProps) {
  const location = data.location || {};

  const handleLocationChange = (field: keyof NonNullable<BackofficeListing['location']>, value: string | number) => {
    onChange({
      location: {
        ...location,
        [field]: value,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Lokasjon
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Oppgi adresse og plassering for utleieobjektet
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

      {/* Address */}
      <div>
        <Textfield
          label="Adresse"
          description="Gateadresse til utleieobjektet"
          value={location.address || ''}
          onChange={(e) => handleLocationChange('address', e.target.value)}
          placeholder="f.eks. Storgata 1"
        />
      </div>

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
          Koordinater (valgfritt)
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Oppgi koordinater for nøyaktig plassering på kart
        </Paragraph>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Textfield
              label="Breddegrad (latitude)"
              type="number"
              step="any"
              value={location.latitude?.toString() || ''}
              onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
              placeholder="59.9139"
            />
          </div>
          <div>
            <Textfield
              label="Lengdegrad (longitude)"
              type="number"
              step="any"
              value={location.longitude?.toString() || ''}
              onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
              placeholder="10.7522"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
