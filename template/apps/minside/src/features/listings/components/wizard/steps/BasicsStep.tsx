/**
 * Basics Step
 * Type selection, name, slug, and visibility settings
 */

import { Textfield, Select, Paragraph, Heading, Label, Textarea } from '@xaheen/ds';
import { LISTING_TYPE_OPTIONS } from '@xaheen/sdk';
import type { BackofficeListing, BackofficeListingType } from '../../../types';

export interface BasicsStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Offentlig - Synlig for alle' },
  { value: 'unlisted', label: 'Ulistet - Kun tilgjengelig med direkte lenke' },
  { value: 'private', label: 'Privat - Kun for interne brukere' },
];

export function BasicsStep({ data, onChange, errors = [] }: BasicsStepProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ type: e.target.value as BackofficeListingType });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'o')
      .replace(/[å]/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    onChange({ name, slug });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ slug: e.target.value });
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ visibility: e.target.value as 'public' | 'unlisted' | 'private' });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ description: e.target.value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Grunnleggende informasjon
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Fyll ut grunnleggende informasjon om utleieobjektet
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

      {/* Type selection */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
          Type utleieobjekt
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Velg hvilken type objekt dette er
        </Paragraph>
        <Select
          value={data.type || 'SPACE'}
          onChange={handleTypeChange}
          aria-label="Type utleieobjekt"
        >
          {LISTING_TYPE_OPTIONS.filter(opt => opt.id !== 'ALL').map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Name */}
      <div>
        <Textfield
          label="Navn"
          description="Et beskrivende navn for utleieobjektet"
          value={data.name || ''}
          onChange={handleNameChange}
          placeholder="f.eks. Stort møterom med projektor"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <Textfield
          label="URL-slug"
          description="Brukes i URL-en til objektet. Genereres automatisk fra navnet."
          value={data.slug || ''}
          onChange={handleSlugChange}
          placeholder="stort-moterom-med-projektor"
        />
        {data.slug && (
          <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            URL: /utleie/{data.slug}
          </Paragraph>
        )}
      </div>

      {/* Visibility */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
          Synlighet
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Hvem kan se dette utleieobjektet
        </Paragraph>
        <Select
          value={data.visibility || 'public'}
          onChange={handleVisibilityChange}
          aria-label="Synlighet"
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Short description */}
      <div>
        <Label
          htmlFor="description"
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
          Kort beskrivelse
        </Label>
        <Paragraph
          data-size="xs"
          style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          En kort introduksjon som vises i søkeresultater og kort-visning
        </Paragraph>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Skriv en kort beskrivelse av utleieobjektet..."
          rows={4}
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
    </div>
  );
}
