/**
 * Basics Step
 * Type selection, name, slug, and visibility settings
 * Enhanced with interactive card selection UI
 */

/* eslint-disable digdir/prefer-ds-components -- Wizard step with native elements */

import { Textfield, Paragraph, Heading, Card, Textarea } from '@xaheen/ds';
import type { BackofficeListing, BackofficeListingType } from '../../../types';

export interface BasicsStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

// SVG Icons for listing types
function SpaceIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ResourceIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ServiceIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EventIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function VehicleIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}

function OtherIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

// SVG Icons for visibility
function PublicIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function UnlistedIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PrivateIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Type options with icons and descriptions
const LISTING_TYPES: { id: BackofficeListingType; label: string; description: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'SPACE', label: 'Lokale', description: 'Rom, sal, eller område for utleie', icon: SpaceIcon },
  { id: 'RESOURCE', label: 'Ressurs', description: 'Utstyr eller inventar som kan lånes', icon: ResourceIcon },
  { id: 'SERVICE', label: 'Tjeneste', description: 'Service eller faglig bistand', icon: ServiceIcon },
  { id: 'EVENT', label: 'Arrangement', description: 'Hendelse eller aktivitet med påmelding', icon: EventIcon },
  { id: 'VEHICLE', label: 'Kjøretøy', description: 'Bil, båt, eller annet transportmiddel', icon: VehicleIcon },
  { id: 'OTHER', label: 'Annet', description: 'Andre typer utleieobjekter', icon: OtherIcon },
];

const VISIBILITY_OPTIONS: { value: 'public' | 'unlisted' | 'private'; label: string; description: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { value: 'public', label: 'Offentlig', description: 'Synlig for alle besøkende', icon: PublicIcon },
  { value: 'unlisted', label: 'Ulistet', description: 'Kun med direkte lenke', icon: UnlistedIcon },
  { value: 'private', label: 'Privat', description: 'Kun for interne brukere', icon: PrivateIcon },
];

// Selection card style helper
const getSelectionCardStyle = (isSelected: boolean) => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--ds-spacing-4)',
  borderRadius: 'var(--ds-border-radius-md)',
  border: isSelected
    ? '2px solid var(--ds-color-accent-base-default)'
    : '1px solid var(--ds-color-neutral-border-default)',
  backgroundColor: isSelected
    ? 'var(--ds-color-neutral-surface-hover)'
    : 'var(--ds-color-neutral-background-default)',
  cursor: 'pointer',
  textAlign: 'center' as const,
  transition: 'all 0.15s ease',
  minHeight: '140px',
});

export function BasicsStep({ data, onChange, errors = [] }: BasicsStepProps) {
  const handleTypeChange = (type: BackofficeListingType) => {
    onChange({ type });
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

  const handleVisibilityChange = (visibility: 'public' | 'unlisted' | 'private') => {
    onChange({ visibility });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ description: e.target.value });
  };

  const selectedType = data.type || 'SPACE';
  const selectedVisibility = data.visibility || 'public';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Grunnleggende informasjon
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Velg type og fyll ut grunnleggende informasjon om utleieobjektet
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

      {/* Type selection - Interactive Cards */}
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            Type utleieobjekt
          </Heading>
          <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg hvilken type objekt dette er
          </Paragraph>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-3)' }}>
            {LISTING_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  style={getSelectionCardStyle(isSelected)}
                  aria-pressed={isSelected}
                >
                  <div
                    style={{
                      marginBottom: 'var(--ds-spacing-2)',
                      color: isSelected ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    <IconComponent size={32} />
                  </div>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {type.label}
                  </Paragraph>
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      marginTop: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {type.description}
                  </Paragraph>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Name and Slug */}
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            Identifikasjon
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label="Navn *"
              description="Et beskrivende navn for utleieobjektet"
              value={data.name || ''}
              onChange={handleNameChange}
              placeholder="f.eks. Stort møterom med projektor"
            />

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
          </div>
        </div>
      </Card>

      {/* Visibility - Interactive Cards */}
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            Synlighet
          </Heading>
          <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Hvem kan se dette utleieobjektet
          </Paragraph>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-3)' }}>
            {VISIBILITY_OPTIONS.map((option) => {
              const isSelected = selectedVisibility === option.value;
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleVisibilityChange(option.value)}
                  style={{
                    ...getSelectionCardStyle(isSelected),
                    minHeight: '100px',
                  }}
                  aria-pressed={isSelected}
                >
                  <div
                    style={{
                      marginBottom: 'var(--ds-spacing-2)',
                      color: isSelected ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    <IconComponent size={28} />
                  </div>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {option.label}
                  </Paragraph>
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      marginTop: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {option.description}
                  </Paragraph>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Short description */}
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            Kort beskrivelse
          </Heading>
          <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            En kort introduksjon som vises i søkeresultater og kort-visning
          </Paragraph>
          <Textarea
            aria-label="Kort beskrivelse"
            value={data.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Skriv en kort beskrivelse av utleieobjektet..."
            rows={4}
          />
        </div>
      </Card>
    </div>
  );
}
