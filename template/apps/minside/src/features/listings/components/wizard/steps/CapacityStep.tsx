/**
 * Capacity Step
 * Capacity, quantity, and area settings
 */

import { Textfield, Paragraph, Heading } from '@xaheen/ds';
import type { BackofficeListing } from '../../../types';

export interface CapacityStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function CapacityStep({ data, onChange, errors = [] }: CapacityStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Kapasitet og størrelse
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
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

      {/* Capacity */}
      <div>
        <Textfield
          label="Kapasitet (personer)"
          description="Maksimalt antall personer som kan bruke objektet samtidig"
          type="number"
          min={0}
          value={data.capacity?.toString() || ''}
          onChange={(e) => onChange({ capacity: parseInt(e.target.value) || undefined })}
          placeholder="f.eks. 20"
        />
      </div>

      {/* Quantity (for resources) */}
      {(data.type === 'RESOURCE' || data.type === 'VEHICLE') && (
        <div>
          <Textfield
            label="Antall enheter"
            description="Hvor mange enheter som er tilgjengelige for utleie"
            type="number"
            min={1}
            value={data.quantity?.toString() || '1'}
            onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 1 })}
            placeholder="1"
          />
        </div>
      )}

      {/* Area (for spaces) */}
      {data.type === 'SPACE' && (
        <div>
          <Textfield
            label="Areal (m²)"
            description="Totalt areal i kvadratmeter"
            type="number"
            min={0}
            step="0.1"
            value={data.areaSquareMeters?.toString() || ''}
            onChange={(e) => onChange({ areaSquareMeters: parseFloat(e.target.value) || undefined })}
            placeholder="f.eks. 50"
          />
        </div>
      )}

      {/* Floors (for spaces) */}
      {data.type === 'SPACE' && (
        <div>
          <Textfield
            label="Etasje"
            description="Hvilken etasje objektet ligger i"
            type="number"
            value={data.floors?.toString() || ''}
            onChange={(e) => onChange({ floors: parseInt(e.target.value) || undefined })}
            placeholder="f.eks. 2"
          />
        </div>
      )}

      {/* Info box */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
        }}
      >
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-info-text-default)', margin: 0 }}>
          💡 Kapasitetsinformasjon vises til brukere når de søker etter utleieobjekter,
          og hjelper dem å finne riktig størrelse for deres behov.
        </Paragraph>
      </div>
    </div>
  );
}
