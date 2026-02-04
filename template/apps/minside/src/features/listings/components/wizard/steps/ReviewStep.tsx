/**
 * Review Step
 * Summary and publish/save actions
 */

import { Paragraph, Heading, Tag, ListingStatusBadge } from '@xaheen/ds';
import { LISTING_TYPE_LABELS } from '@xaheen/sdk';
import type { BackofficeListing } from '../../../types';
import { PUBLISH_REQUIREMENTS } from '../../../types';

export interface ReviewStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

interface ValidationItem {
  field: string;
  label: string;
  isValid: boolean;
  value?: string;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, key) => (acc as Record<string, unknown>)?.[key], obj);
}

export function ReviewStep({ data, errors = [] }: ReviewStepProps) {
  const listingType = data.type || 'SPACE';
  const requirements = PUBLISH_REQUIREMENTS[listingType];

  // Check each requirement
  const validationItems: ValidationItem[] = requirements.map((req) => {
    const value = getNestedValue(data as Record<string, unknown>, req);
    const hasValue = value !== undefined && value !== null && value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true);

    const labels: Record<string, string> = {
      name: 'Navn',
      type: 'Type',
      description: 'Beskrivelse',
      'location.address': 'Adresse',
      capacity: 'Kapasitet',
      quantity: 'Antall',
      openingHours: 'Åpningstider',
      media: 'Bilder',
    };

    return {
      field: req,
      label: labels[req] || req,
      isValid: hasValue,
      value: typeof value === 'string' ? value : Array.isArray(value) ? `${value.length} elementer` : undefined,
    };
  });

  const allValid = validationItems.every((item) => item.isValid);
  const images = data.images || [];
  const amenities = data.content?.amenities || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Gjennomgang
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Se over informasjonen før du lagrer eller publiserer
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

      {/* Publish requirements checklist */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: allValid ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-warning-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: `1px solid ${allValid ? 'var(--ds-color-success-border-default)' : 'var(--ds-color-warning-border-default)'}`,
        }}
      >
        <Heading
          level={3}
          data-size="xs"
          style={{
            marginBottom: 'var(--ds-spacing-3)',
            color: allValid ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-warning-text-default)',
          }}
        >
          {allValid ? '✓ Klar for publisering' : 'Krav for publisering'}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {validationItems.map((item) => (
            <div
              key={item.field}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.isValid ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-neutral-surface-default)',
                  color: item.isValid ? 'white' : 'var(--ds-color-neutral-text-subtle)',
                  fontSize: 'var(--ds-font-size-xs)',
                  border: item.isValid ? 'none' : '1px solid var(--ds-color-neutral-border-default)',
                }}
              >
                {item.isValid ? '✓' : '○'}
              </span>
              <Paragraph data-size="sm" style={{ margin: 0, flex: 1 }}>
                {item.label}
              </Paragraph>
              {item.isValid && item.value && (
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {item.value}
                </Paragraph>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Preview image */}
        {images.length > 0 && (
          <div style={{ height: '200px', overflow: 'hidden' }}>
            <img
              src={images[0]}
              alt={data.name || 'Preview'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                <Tag data-size="sm" data-color="accent">
                  {LISTING_TYPE_LABELS[listingType]}
                </Tag>
                <ListingStatusBadge status={data.status || 'draft'} />
              </div>
              <Heading level={3} data-size="md">
                {data.name || 'Uten navn'}
              </Heading>
            </div>
          </div>

          {/* Location */}
          {data.location && (
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              📍 {[data.location.address, data.location.postalCode, data.location.city].filter(Boolean).join(', ')}
            </Paragraph>
          )}

          {/* Description */}
          {data.description && (
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              {data.description}
            </Paragraph>
          )}

          {/* Key facts */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--ds-spacing-4)',
              paddingTop: 'var(--ds-spacing-3)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {data.capacity && (
              <div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Kapasitet
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {data.capacity} personer
                </Paragraph>
              </div>
            )}
            {data.areaSquareMeters && (
              <div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Areal
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {data.areaSquareMeters} m²
                </Paragraph>
              </div>
            )}
            {images.length > 0 && (
              <div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Bilder
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {images.length} stk
                </Paragraph>
              </div>
            )}
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <Paragraph data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Fasiliteter
              </Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1)' }}>
                {amenities.slice(0, 6).map((amenity) => (
                  <Tag key={amenity} data-size="sm" data-color="neutral">
                    {amenity}
                  </Tag>
                ))}
                {amenities.length > 6 && (
                  <Tag data-size="sm" data-color="neutral">
                    +{amenities.length - 6} mer
                  </Tag>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next steps info */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
        }}
      >
        <Heading level={4} data-size="2xs" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
          Hva skjer videre?
        </Heading>
        {/* eslint-disable-next-line digdir/prefer-ds-components -- Simple information list */}
        <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-info-text-default)' }}>
          <li>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              <strong>Lagre som utkast</strong> - Objektet lagres og kan redigeres senere
            </Paragraph>
          </li>
          <li>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              <strong>Publiser</strong> - Objektet blir synlig for brukere (kun admin)
            </Paragraph>
          </li>
        </ul>
      </div>
    </div>
  );
}
