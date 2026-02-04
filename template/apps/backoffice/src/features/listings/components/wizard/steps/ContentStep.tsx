/**
 * Content Step
 * Full description, amenities/facilities, FAQ, and rules
 * Enhanced with visual cards and interactive UI
 */

import { useState } from 'react';
import {
  Paragraph,
  Heading,
  Button,
  Tag,
  Textfield,
  Textarea,
  Select,
  Card,
  Details,
  DetailsSummary,
  DetailsContent,
} from '@xaheen/ds';
import type { BackofficeListing, ListingFAQItem, ListingRule } from '../../../types';

export interface ContentStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

// SVG Icons for amenities categories
function WifiIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function ProjectorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="6" cy="12" r="2" />
      <line x1="10" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function CoffeeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function ParkingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

function AccessibilityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1" />
      <path d="M12 21v-8" />
      <path d="M9 12l3 4 3-4" />
      <path d="M6 8h12" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Common amenities suggestions with icons
const COMMON_AMENITIES: { name: string; icon?: React.ComponentType<{ size?: number }>; category: string }[] = [
  { name: 'WiFi', icon: WifiIcon, category: 'technology' },
  { name: 'Projektor', icon: ProjectorIcon, category: 'technology' },
  { name: 'Whiteboard', category: 'equipment' },
  { name: 'Kaffemaskin', icon: CoffeeIcon, category: 'comfort' },
  { name: 'Kjøkken', category: 'comfort' },
  { name: 'Toalett', category: 'facilities' },
  { name: 'Parkering', icon: ParkingIcon, category: 'access' },
  { name: 'Rullestoltilgang', icon: AccessibilityIcon, category: 'access' },
  { name: 'Heis', category: 'access' },
  { name: 'Aircondition', category: 'comfort' },
  { name: 'Lydanlegg', category: 'technology' },
  { name: 'Videokonferanse', category: 'technology' },
  { name: 'Printeskriver', category: 'equipment' },
  { name: 'Møbler', category: 'equipment' },
  { name: 'Garderobeskap', category: 'facilities' },
];

// Rule types with Norwegian labels
const RULE_TYPES = [
  { value: 'general', label: 'Generelt' },
  { value: 'booking', label: 'Booking' },
  { value: 'cancellation', label: 'Avbestilling' },
  { value: 'access', label: 'Tilgang' },
  { value: 'safety', label: 'Sikkerhet' },
  { value: 'other', label: 'Annet' },
] as const;

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function ContentStep({ data, onChange, errors = [] }: ContentStepProps) {
  const [newAmenity, setNewAmenity] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [newRule, setNewRule] = useState({ title: '', description: '', type: 'general' as ListingRule['type'] });

  const content = data.content || {};
  const amenities = content.amenities || [];
  const extras = data.extras || {};
  const faqItems = extras.faq || [];
  const rules = extras.rules || [];

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

  // FAQ handlers
  const addFAQ = () => {
    if (newFAQ.question && newFAQ.answer) {
      const newItem: ListingFAQItem = {
        id: generateId(),
        question: newFAQ.question,
        answer: newFAQ.answer,
        order: faqItems.length,
      };
      onChange({
        extras: {
          ...extras,
          faq: [...faqItems, newItem],
        },
      });
      setNewFAQ({ question: '', answer: '' });
    }
  };

  const removeFAQ = (id: string) => {
    onChange({
      extras: {
        ...extras,
        faq: faqItems.filter((item) => item.id !== id),
      },
    });
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    onChange({
      extras: {
        ...extras,
        faq: faqItems.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  // Rules handlers
  const addRule = () => {
    if (newRule.title) {
      const item: ListingRule = {
        id: generateId(),
        title: newRule.title,
        type: newRule.type,
        order: rules.length,
      };
      if (newRule.description) {
        item.description = newRule.description;
      }
      onChange({
        extras: {
          ...extras,
          rules: [...rules, item],
        },
      });
      setNewRule({ title: '', description: '', type: 'general' });
    }
  };

  const removeRule = (id: string) => {
    onChange({
      extras: {
        ...extras,
        rules: rules.filter((item) => item.id !== id),
      },
    });
  };

  const updateRule = (id: string, field: keyof Omit<ListingRule, 'id' | 'order'>, value: string) => {
    onChange({
      extras: {
        ...extras,
        rules: rules.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Innhold og fasiliteter
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Beskriv utleieobjektet i detalj og legg til tilgjengelige fasiliteter
        </Paragraph>
      </div>

      {/* Error messages */}
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
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-accent-base-default)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Fullstendig beskrivelse
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                En detaljert beskrivelse som vises på objektets detaljside
              </Paragraph>
            </div>
          </div>
          <Textarea
            aria-label="Fullstendig beskrivelse"
            value={content.fullDescription || ''}
            onChange={handleFullDescriptionChange}
            placeholder="Beskriv utleieobjektet i detalj. Hva gjør det unikt? Hva inkluderes?"
            rows={8}
          />
          {content.fullDescription && (
            <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {content.fullDescription.length} tegn
            </Paragraph>
          )}
        </div>
      </Card>

      {/* Amenities Section */}
      <Card data-color="neutral">
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-success-base-default)',
                flexShrink: 0,
              }}
            >
              <CheckIcon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                  Fasiliteter og utstyr
                </Heading>
                {amenities.length > 0 && (
                  <Tag data-size="sm" data-color="success">
                    {amenities.length} valgt
                  </Tag>
                )}
              </div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Legg til fasiliteter som er inkludert i utleieobjektet
              </Paragraph>
            </div>
          </div>

          {/* Current amenities as Tags */}
          {amenities.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-success-border-default)',
              }}
            >
              {amenities.map((amenity) => (
                <Tag
                  key={amenity}
                  data-size="sm"
                  data-color="success"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <CheckIcon size={14} />
                  {amenity}
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => removeAmenity(amenity)}
                    aria-label={`Fjern ${amenity}`}
                    style={{
                      padding: 0,
                      minWidth: 'auto',
                      height: 'auto',
                      marginLeft: 'var(--ds-spacing-1)',
                    }}
                  >
                    ×
                  </Button>
                </Tag>
              ))}
            </div>
          )}

          {/* Add new amenity */}
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Textfield
                label="Ny fasilitet"
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

          {/* Quick add grid */}
          <div>
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Hurtigvalg fasiliteter:
            </Paragraph>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--ds-spacing-2)' }}>
              {COMMON_AMENITIES.filter((a) => !amenities.includes(a.name)).map((amenity) => {
                const IconComponent = amenity.icon;
                return (
                  <button
                    key={amenity.name}
                    type="button"
                    onClick={() => addAmenity(amenity.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--ds-spacing-1)',
                      padding: 'var(--ds-spacing-2)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                      backgroundColor: 'var(--ds-color-neutral-background-default)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minHeight: '60px',
                    }}
                  >
                    {IconComponent ? (
                      <IconComponent size={18} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                    <Paragraph data-size="xs" style={{ margin: 0, textAlign: 'center' }}>
                      {amenity.name}
                    </Paragraph>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* FAQ Section using Details accordion */}
      <Card data-color="neutral">
        <Details data-color="neutral" style={{ border: 'none' }}>
          <DetailsSummary style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-info-surface-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-color-info-base-default)',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                    Ofte stilte spørsmål (FAQ)
                  </Heading>
                  {faqItems.length > 0 && (
                    <Tag data-size="sm" data-color="info">
                      {faqItems.length}
                    </Tag>
                  )}
                </div>
                <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Legg til vanlige spørsmål og svar
                </Paragraph>
              </div>
            </div>
          </DetailsSummary>
          <DetailsContent style={{ padding: '0 var(--ds-spacing-5) var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              {/* Existing FAQ items */}
              {faqItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  {faqItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 'var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-3)' }}>
                        <Tag data-size="sm" data-color="neutral">
                          Spørsmål {index + 1}
                        </Tag>
                        <Button
                          type="button"
                          variant="tertiary"
                          data-size="sm"
                          data-color="danger"
                          onClick={() => removeFAQ(item.id)}
                          aria-label="Fjern spørsmål"
                        >
                          Fjern
                        </Button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                        <Textfield
                          label="Spørsmål"
                          value={item.question}
                          onChange={(e) => updateFAQ(item.id, 'question', e.target.value)}
                          placeholder="Skriv spørsmålet"
                        />
                        <div>
                          <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                            Svar
                          </Paragraph>
                          <Textarea
                            aria-label="Svar"
                            value={item.answer}
                            onChange={(e) => updateFAQ(item.id, 'answer', e.target.value)}
                            placeholder="Skriv svaret"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new FAQ */}
              <div
                style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px dashed var(--ds-color-neutral-border-default)',
                }}
              >
                <Heading level={4} data-size="2xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Legg til nytt spørsmål
                </Heading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  <Textfield
                    label="Spørsmål"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                    placeholder="Hva ønsker du å spørre om?"
                  />
                  <div>
                    <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Svar
                    </Paragraph>
                    <Textarea
                      aria-label="Svar"
                      value={newFAQ.answer}
                      onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                      placeholder="Skriv svaret på spørsmålet"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addFAQ}
                    disabled={!newFAQ.question || !newFAQ.answer}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Legg til spørsmål
                  </Button>
                </div>
              </div>
            </div>
          </DetailsContent>
        </Details>
      </Card>

      {/* Rules Section using Details accordion */}
      <Card data-color="neutral">
        <Details data-color="neutral" style={{ border: 'none' }}>
          <DetailsSummary style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-warning-surface-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-color-warning-base-default)',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                    Regler og vilkår
                  </Heading>
                  {rules.length > 0 && (
                    <Tag data-size="sm" data-color="warning">
                      {rules.length}
                    </Tag>
                  )}
                </div>
                <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Legg til regler som brukere må følge
                </Paragraph>
              </div>
            </div>
          </DetailsSummary>
          <DetailsContent style={{ padding: '0 var(--ds-spacing-5) var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              {/* Existing rules */}
              {rules.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        padding: 'var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-3)' }}>
                        <Tag data-size="sm" data-color="neutral">
                          {RULE_TYPES.find((t) => t.value === rule.type)?.label || rule.type}
                        </Tag>
                        <Button
                          type="button"
                          variant="tertiary"
                          data-size="sm"
                          data-color="danger"
                          onClick={() => removeRule(rule.id)}
                          aria-label="Fjern regel"
                        >
                          Fjern
                        </Button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                        <Textfield
                          label="Regeltittel"
                          value={rule.title}
                          onChange={(e) => updateRule(rule.id, 'title', e.target.value)}
                          placeholder="Regeltittel"
                        />
                        <div>
                          <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                            Beskrivelse (valgfritt)
                          </Paragraph>
                          <Textarea
                            aria-label="Beskrivelse"
                            value={rule.description || ''}
                            onChange={(e) => updateRule(rule.id, 'description', e.target.value)}
                            placeholder="Utfyllende beskrivelse av regelen"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new rule */}
              <div
                style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px dashed var(--ds-color-neutral-border-default)',
                }}
              >
                <Heading level={4} data-size="2xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Legg til ny regel
                </Heading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--ds-spacing-3)' }}>
                    <div>
                      <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                        Regeltype
                      </Paragraph>
                      <Select
                        aria-label="Regeltype"
                        value={newRule.type}
                        onChange={(e) => setNewRule({ ...newRule, type: e.target.value as ListingRule['type'] })}
                      >
                        {RULE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Textfield
                      label="Regeltittel"
                      value={newRule.title}
                      onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                      placeholder="F.eks. Røyking forbudt"
                    />
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Beskrivelse (valgfritt)
                    </Paragraph>
                    <Textarea
                      aria-label="Beskrivelse"
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      placeholder="Utfyllende beskrivelse av regelen"
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addRule}
                    disabled={!newRule.title}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Legg til regel
                  </Button>
                </div>
              </div>
            </div>
          </DetailsContent>
        </Details>
      </Card>
    </div>
  );
}
