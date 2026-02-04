/**
 * Capacity Step
 * Capacity, quantity, and area settings
 * Enhanced with visual cards and interactive UI
 */

import { Textfield, Paragraph, Heading, Card } from '@xaheen/ds';
import type { BackofficeListing } from '../../../types';

export interface CapacityStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

// SVG Icons for capacity fields
function PeopleIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function QuantityIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AreaIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

function FloorIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M5 20V8l7-6 7 6v12" />
      <path d="M10 14v6" />
      <path d="M14 14v6" />
      <path d="M10 8h4" />
      <path d="M10 11h4" />
    </svg>
  );
}

// Metric card style for visual enhancement
const metricCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ds-spacing-4)',
  padding: 'var(--ds-spacing-4)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  borderRadius: 'var(--ds-border-radius-md)',
  border: '1px solid var(--ds-color-neutral-border-subtle)',
};

const iconContainerStyle = {
  width: '56px',
  height: '56px',
  borderRadius: 'var(--ds-border-radius-md)',
  backgroundColor: 'var(--ds-color-accent-surface-default)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--ds-color-accent-base-default)',
  flexShrink: 0,
};

export function CapacityStep({ data, onChange, errors = [] }: CapacityStepProps) {
  const showQuantity = data.type === 'RESOURCE' || data.type === 'VEHICLE';
  const showAreaAndFloor = data.type === 'SPACE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Kapasitet og størrelse
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Oppgi kapasitet og dimensjoner for utleieobjektet
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

      {/* Capacity - Always visible */}
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={metricCardStyle}>
            <div style={iconContainerStyle}>
              <PeopleIcon size={28} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-6)', flexWrap: 'wrap' }}>
              {/* Left side - Input */}
              <div style={{ minWidth: '200px' }}>
                <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                  Personkapasitet
                </Heading>
                <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Maksimalt antall personer
                </Paragraph>
                <div style={{ maxWidth: '140px' }}>
                  <Textfield
                    aria-label="Kapasitet (personer)"
                    type="number"
                    min={0}
                    value={data.capacity?.toString() || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onChange(val ? { capacity: val } : {});
                    }}
                    placeholder="f.eks. 20"
                  />
                </div>
                {data.capacity && (
                  <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
                    {data.capacity} {data.capacity === 1 ? 'person' : 'personer'}
                  </Paragraph>
                )}
              </div>

              {/* Right side - Quick presets */}
              <div style={{ marginLeft: 'auto' }}>
                <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Hurtigvalg
                </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                  {[5, 10, 15, 20, 30, 50, 100].map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => onChange({ capacity: cap })}
                      style={{
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: data.capacity === cap
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : '1px solid var(--ds-color-neutral-border-default)',
                        backgroundColor: data.capacity === cap
                          ? 'var(--ds-color-neutral-surface-hover)'
                          : 'var(--ds-color-neutral-background-default)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-1)',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          color: data.capacity === cap ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      <Paragraph
                        data-size="sm"
                        style={{
                          margin: 0,
                          fontWeight: data.capacity === cap ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                          color: data.capacity === cap ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                        }}
                      >
                        {cap}
                      </Paragraph>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quantity - For resources and vehicles */}
      {showQuantity && (
        <Card data-color="neutral">
          <div style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={metricCardStyle}>
              <div style={iconContainerStyle}>
                <QuantityIcon size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                  Antall enheter
                </Heading>
                <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Hvor mange enheter som er tilgjengelige for utleie
                </Paragraph>
                <div style={{ maxWidth: '200px' }}>
                  <Textfield
                    aria-label="Antall enheter"
                    type="number"
                    min={1}
                    value={data.quantity?.toString() || '1'}
                    onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    />
                </div>
                {data.quantity && data.quantity > 1 && (
                  <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
                    {data.quantity} enheter kan bookes uavhengig av hverandre
                  </Paragraph>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Area and Floor - For spaces */}
      {showAreaAndFloor && (
        <Card data-color="neutral">
          <div style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Fysiske dimensjoner
            </Heading>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
              {/* Area */}
              <div style={metricCardStyle}>
                <div style={{ ...iconContainerStyle, width: '48px', height: '48px' }}>
                  <AreaIcon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
                    Areal
                  </Paragraph>
                  <Textfield
                    aria-label="Areal (m²)"
                    type="number"
                    min={0}
                    step="0.1"
                    value={data.areaSquareMeters?.toString() || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChange(val ? { areaSquareMeters: val } : {});
                    }}
                    placeholder="m²"
                    />
                  {data.areaSquareMeters && (
                    <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {data.areaSquareMeters} m²
                    </Paragraph>
                  )}
                </div>
              </div>

              {/* Floor */}
              <div style={metricCardStyle}>
                <div style={{ ...iconContainerStyle, width: '48px', height: '48px' }}>
                  <FloorIcon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
                    Etasje
                  </Paragraph>
                  <Textfield
                    aria-label="Etasje"
                    type="number"
                    value={data.floors?.toString() || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onChange(val ? { floors: val } : {});
                    }}
                    placeholder="f.eks. 2"
                    />
                  {data.floors && (
                    <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {data.floors}. etasje
                    </Paragraph>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Info box */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-info-text-default)', margin: 0 }}>
          Kapasitetsinformasjon vises til brukere når de søker etter utleieobjekter, og hjelper dem å finne riktig størrelse for deres behov.
        </Paragraph>
      </div>
    </div>
  );
}
