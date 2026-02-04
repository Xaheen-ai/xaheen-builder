/**
 * Content Step
 * Full description and amenities/facilities
 */

import { useState } from 'react';
import { Textfield, Paragraph, Heading, Button, Tag, Label, Textarea } from '@xaheen/ds';
import type { BackofficeListing } from '../../../types';

export interface ContentStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

// Common amenities suggestions
const COMMON_AMENITIES = [
  'WiFi',
  'Projektor',
  'Whiteboard',
  'Kaffemaskin',
  'Kjøkken',
  'Toalett',
  'Parkering',
  'Rullestoltilgang',
  'Heis',
  'Aircondition',
  'Lydanlegg',
  'Videokonferanse',
  'Printeskriver',
  'Møbler',
  'Garderobeskap',
];

export function ContentStep({ data, onChange, errors = [] }: ContentStepProps) {
  const [newAmenity, setNewAmenity] = useState('');
  const content = data.content || {};
  const amenities = content.amenities || [];

  const handleFullDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      content: {
        ...content,
        fullDescription: e.target.value,
      },
    });
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !amenities.includes(amenity)) {
      onChange({
        content: {
          ...content,
          amenities: [...amenities, amenity],
        },
      });
    }
    setNewAmenity('');
  };

  const removeAmenity = (amenity: string) => {
    onChange({
      content: {
        ...content,
        amenities: amenities.filter((a) => a !== amenity),
      },
    });
  };

  const handleNewAmenityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAmenity(newAmenity);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Innhold og fasiliteter
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Beskriv utleieobjektet i detalj og legg til tilgjengelige fasiliteter
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

      {/* Full description */}
      <div>
        <Label
          htmlFor="fullDescription"
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
          Fullstendig beskrivelse
        </Label>
        <Paragraph
          data-size="xs"
          style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          En detaljert beskrivelse som vises på objektets detaljside
        </Paragraph>
        <Textarea
          id="fullDescription"
          value={content.fullDescription || ''}
          onChange={handleFullDescriptionChange}
          placeholder="Beskriv utleieobjektet i detalj. Hva gjør det unikt? Hva inkluderes?"
          rows={8}
          style={{
            width: '100%',
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            fontSize: 'var(--ds-font-size-md)',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Amenities */}
      <div>
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          Fasiliteter og utstyr
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Legg til fasiliteter som er inkludert i utleieobjektet
        </Paragraph>

        {/* Current amenities */}
        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
            {amenities.map((amenity) => (
              <Tag
                key={amenity}
                data-size="sm"
                data-color="accent"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  paddingRight: 'var(--ds-spacing-1)',
                }}
              >
                {amenity}
                {/* eslint-disable-next-line digdir/prefer-ds-components -- Small icon button within Tag component */}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    border: 'none',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                  aria-label={`Fjern ${amenity}`}
                >
                  ×
                </button>
              </Tag>
            ))}
          </div>
        )}

        {/* Add new amenity */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ flex: 1 }}>
            <Textfield
              aria-label="Ny fasilitet"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={handleNewAmenityKeyDown}
              placeholder="Skriv inn fasilitet og trykk Enter"
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => addAmenity(newAmenity)} disabled={!newAmenity}>
            Legg til
          </Button>
        </div>

        {/* Quick add suggestions */}
        <div>
          <Paragraph data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Hurtigvalg:
          </Paragraph>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1)' }}>
            {COMMON_AMENITIES.filter((a) => !amenities.includes(a)).map((amenity) => (
              // eslint-disable-next-line digdir/prefer-ds-components -- Small quick-add button with custom styling
              <button
                key={amenity}
                type="button"
                onClick={() => addAmenity(amenity)}
                style={{
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                  fontSize: 'var(--ds-font-size-xs)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                + {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
