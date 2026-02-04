/**
 * Review Step
 * Summary and publish/save actions
 * Enhanced with visual cards and interactive UI
 */

import { Paragraph, Heading, Tag, ListingStatusBadge, Card } from '@xaheen/ds';
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
  value?: string | undefined;
}

// Icons
function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ImageIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function MapPinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SquareIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}

function TagIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
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
  const validCount = validationItems.filter((item) => item.isValid).length;
  const images = data.images || [];
  const amenities = data.content?.amenities || [];
  const documents = data.documents || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Gjennomgang
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
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
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: allValid ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-warning-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: allValid ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-warning-base-default)',
                flexShrink: 0,
              }}
            >
              {allValid ? <CheckCircleIcon size={24} /> : <AlertCircleIcon size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {allValid ? 'Klar for publisering' : 'Krav for publisering'}
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {validCount} av {validationItems.length} krav oppfylt
              </Paragraph>
            </div>
            <Tag data-size="md" data-color={allValid ? 'success' : 'warning'}>
              {Math.round((validCount / validationItems.length) * 100)}%
            </Tag>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-full)',
              overflow: 'hidden',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <div
              style={{
                width: `${(validCount / validationItems.length) * 100}%`,
                height: '100%',
                backgroundColor: allValid ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-warning-base-default)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-3)' }}>
            {validationItems.map((item) => (
              <div
                key={item.field}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: item.isValid
                    ? 'var(--ds-color-success-surface-default)'
                    : 'var(--ds-color-neutral-surface-default)',
                  border: `1px solid ${item.isValid ? 'var(--ds-color-success-border-default)' : 'var(--ds-color-neutral-border-subtle)'}`,
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: item.isValid ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-neutral-background-default)',
                    color: item.isValid ? 'white' : 'var(--ds-color-neutral-text-subtle)',
                    flexShrink: 0,
                  }}
                >
                  {item.isValid ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: item.isValid ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {item.label}
                  </Paragraph>
                  {item.isValid && item.value && (
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.value}
                    </Paragraph>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary card - Preview */}
      <Card data-color="neutral">
        <div style={{ overflow: 'hidden' }}>
          {/* Preview image */}
          {images.length > 0 ? (
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={images[0]}
                alt={data.name || 'Preview'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 'var(--ds-spacing-3)',
                  right: 'var(--ds-spacing-3)',
                  display: 'flex',
                  gap: 'var(--ds-spacing-1)',
                }}
              >
                <Tag data-size="sm" data-color="neutral" style={{ backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                  <ImageIcon size={14} /> {images.length} bilder
                </Tag>
                {documents.length > 0 && (
                  <Tag data-size="sm" data-color="neutral" style={{ backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                    {documents.length} dokumenter
                  </Tag>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                color: 'var(--ds-color-neutral-text-subtle)',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <ImageIcon size={32} />
              <Paragraph data-size="sm" style={{ margin: 0 }}>Ingen bilder lagt til</Paragraph>
            </div>
          )}

          <div style={{ padding: 'var(--ds-spacing-5)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-3)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                  <Tag data-size="sm" data-color="accent">
                    <TagIcon size={12} /> {LISTING_TYPE_LABELS[listingType]}
                  </Tag>
                  <ListingStatusBadge status={data.status || 'draft'} />
                </div>
                <Heading level={3} data-size="md">
                  {data.name || 'Uten navn'}
                </Heading>
              </div>
            </div>

            {/* Location */}
            {data.location && (data.location.address || data.location.city) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  marginBottom: 'var(--ds-spacing-3)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                <MapPinIcon size={16} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {[data.location.address, data.location.postalCode, data.location.city].filter(Boolean).join(', ')}
                </Paragraph>
              </div>
            )}

            {/* Description */}
            {data.description && (
              <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {data.description}
              </Paragraph>
            )}

            {/* Key facts grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--ds-spacing-3)',
                paddingTop: 'var(--ds-spacing-4)',
                borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              {data.capacity && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                  }}
                >
                  <div style={{ color: 'var(--ds-color-accent-base-default)' }}>
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Kapasitet
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      {data.capacity} pers.
                    </Paragraph>
                  </div>
                </div>
              )}
              {data.areaSquareMeters && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                  }}
                >
                  <div style={{ color: 'var(--ds-color-accent-base-default)' }}>
                    <SquareIcon size={20} />
                  </div>
                  <div>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Areal
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      {data.areaSquareMeters} m²
                    </Paragraph>
                  </div>
                </div>
              )}
              {data.visibility && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                  }}
                >
                  <div style={{ color: 'var(--ds-color-accent-base-default)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Synlighet
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      {data.visibility === 'public' ? 'Offentlig' : data.visibility === 'unlisted' ? 'Ulistet' : 'Privat'}
                    </Paragraph>
                  </div>
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
                  {amenities.slice(0, 8).map((amenity) => (
                    <Tag key={amenity} data-size="sm" data-color="neutral">
                      {amenity}
                    </Tag>
                  ))}
                  {amenities.length > 8 && (
                    <Tag data-size="sm" data-color="accent">
                      +{amenities.length - 8} mer
                    </Tag>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Next steps info */}
      <Card data-color="neutral">
        <div
          style={{
            padding: 'var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-info-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-neutral-contrast-default)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
                Hva skjer videre?
              </Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-neutral-background-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-info-text-default)',
                      flexShrink: 0,
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      fontSize: 'var(--ds-font-size-xs)',
                    }}
                  >
                    1
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-info-text-default)' }}>
                      Lagre som utkast
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
                      Objektet lagres og kan redigeres senere
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-neutral-background-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-info-text-default)',
                      flexShrink: 0,
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      fontSize: 'var(--ds-font-size-xs)',
                    }}
                  >
                    2
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-info-text-default)' }}>
                      Publiser
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
                      Objektet blir synlig for brukere (kun admin)
                    </Paragraph>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
