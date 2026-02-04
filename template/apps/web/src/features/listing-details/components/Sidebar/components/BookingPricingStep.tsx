/**
 * BookingPricingStep Component
 * Step 1: Price group selection, additional services, and terms acceptance
 */

import * as React from 'react';
import { Heading, Paragraph, Alert } from '@digdir/designsystemet-react';
import { InfoIcon } from '@xaheen/ds';

export interface PriceGroup {
  id: string;
  label: string;
  pricePerHour: number;
  description: string;
}

export interface AdditionalService {
  id: string;
  label: string;
  description: string;
  price: number;
}

export interface BookingPricingStepProps {
  priceGroups: PriceGroup[];
  additionalServices: AdditionalService[];
  selectedPriceGroup: string;
  selectedServices: Set<string>;
  termsAccepted: boolean;
  onPriceGroupChange: (groupId: string) => void;
  onServiceToggle: (serviceId: string, checked: boolean) => void;
  onTermsChange: (accepted: boolean) => void;
  /** Enable multi-select for price groups (default: false) */
  allowMultiplePriceGroups?: boolean;
  /** Selected price groups (for multi-select mode) */
  selectedPriceGroups?: Set<string>;
  /** Handler for multi-select price groups */
  onPriceGroupsChange?: (groupIds: Set<string>) => void;
}

export function BookingPricingStep({
  priceGroups,
  additionalServices,
  selectedPriceGroup,
  selectedServices,
  termsAccepted,
  onPriceGroupChange,
  onServiceToggle,
  onTermsChange,
  allowMultiplePriceGroups = false,
  selectedPriceGroups,
  onPriceGroupsChange,
}: BookingPricingStepProps): React.ReactElement {
  const [internalSelectedGroups, setInternalSelectedGroups] = React.useState<Set<string>>(
    selectedPriceGroups ?? new Set(selectedPriceGroup ? [selectedPriceGroup] : [])
  );

  React.useEffect(() => {
    if (selectedPriceGroups) {
      setInternalSelectedGroups(selectedPriceGroups);
    } else if (selectedPriceGroup) {
      setInternalSelectedGroups(new Set([selectedPriceGroup]));
    } else {
      setInternalSelectedGroups(new Set());
    }
  }, [selectedPriceGroup, selectedPriceGroups]);

  const handlePriceGroupClick = (groupId: string): void => {
    if (allowMultiplePriceGroups) {
      const newSelection = new Set(internalSelectedGroups);
      if (newSelection.has(groupId)) {
        newSelection.delete(groupId);
      } else {
        newSelection.add(groupId);
      }
      setInternalSelectedGroups(newSelection);
      onPriceGroupsChange?.(newSelection);
      // Also call single-select handler for backward compatibility
      if (newSelection.size === 1) {
        onPriceGroupChange(Array.from(newSelection)[0] ?? '');
      } else if (newSelection.size === 0) {
        onPriceGroupChange('');
      }
    } else {
      const newValue = selectedPriceGroup === groupId ? '' : groupId;
      onPriceGroupChange(newValue);
    }
  };

  const isSelected = (groupId: string): boolean => {
    if (allowMultiplePriceGroups) {
      return internalSelectedGroups.has(groupId);
    }
    return selectedPriceGroup === groupId;
  };
  return (
    <div style={{ padding: 'var(--ds-spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Price Group Selection */}
      <div>
        <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Prisgruppe
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Utleier tilbyr egne priser til enkelte kundegrupper. Valg av prisgruppe medfører en godkjenningsprosess.
          {allowMultiplePriceGroups && ' Du kan velge flere prisgrupper.'}
        </Paragraph>
        
        {/* Button-based Price Group Selection */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
          {priceGroups.map(group => {
            const selected = isSelected(group.id);
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => handlePriceGroupClick(group.id)}
                aria-pressed={selected}
                aria-label={`${group.label} - ${group.pricePerHour} kr/time`}
                style={{
                  minWidth: '140px',
                  flex: '1 1 auto',
                  position: 'relative',
                  padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: selected
                    ? '2px solid var(--ds-color-accent-base-default)'
                    : '1px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: selected
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-background-default)',
                  color: selected
                    ? 'var(--ds-color-accent-base-contrast-default)'
                    : 'var(--ds-color-neutral-text-default)',
                  fontWeight: selected ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                  boxShadow: selected ? 'var(--ds-shadow-sm)' : 'none',
                  transition: 'all 150ms ease',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
                  } else {
                    e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
                  } else {
                    e.currentTarget.style.boxShadow = 'var(--ds-shadow-sm)';
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--ds-color-focus-outer)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 'var(--ds-font-size-sm)', lineHeight: 1.2 }}>
                    {group.label}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      opacity: 0.9,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {group.pricePerHour} kr/time
                  </span>
                  {allowMultiplePriceGroups && selected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-accent-base-contrast-default)',
                        color: 'var(--ds-color-accent-base-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--ds-font-size-xs)',
                        fontWeight: 'var(--ds-font-weight-bold)',
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Show info alert for selected price groups */}
        {(allowMultiplePriceGroups ? internalSelectedGroups.size > 0 : selectedPriceGroup) && (
          <Alert
            data-color="info"
            data-size="sm"
            style={{
              marginTop: 'var(--ds-spacing-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
              <InfoIcon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
                {allowMultiplePriceGroups ? (
                  <>
                    {Array.from(internalSelectedGroups).map(groupId => {
                      const group = priceGroups.find(pg => pg.id === groupId);
                      return group ? (
                        <Paragraph key={groupId} data-size="sm" style={{ margin: 0 }}>
                          <strong>{group.label}:</strong> {group.description}
                        </Paragraph>
                      ) : null;
                    })}
                  </>
                ) : (
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {priceGroups.find(pg => pg.id === selectedPriceGroup)?.description}
                  </Paragraph>
                )}
              </div>
            </div>
          </Alert>
        )}
      </div>

      {/* Additional Services */}
      <div>
        <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
          ANBEFALTE TILLEGG
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {additionalServices.map(service => (
            <label
              key={service.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: selectedServices.has(service.id)
                  ? '2px solid var(--ds-color-accent-base-default)'
                  : '1px solid var(--ds-color-neutral-border-subtle)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!selectedServices.has(service.id)) {
                  e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                  e.currentTarget.style.boxShadow = 'var(--ds-shadow-sm)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedServices.has(service.id)) {
                  e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedServices.has(service.id)}
                onChange={(e) => onServiceToggle(service.id, e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  accentColor: 'var(--ds-color-accent-base-default)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-1)' }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {service.label}
                  </Paragraph>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-accent-text-default)' }}>
                    +{service.price} kr
                  </Paragraph>
                </div>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {service.description}
                </Paragraph>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div>
        <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
          Vilkår og betingelser
        </Heading>
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            Les viktige vilkår
          </Paragraph>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-sm)', lineHeight: 'var(--ds-line-height-lg)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            <li>Avbestillingsregler og refusjonsvilkår</li>
            <li>Ansvar for skader og utstyr</li>
            <li>Ordensregler for lokalet</li>
          </ul>
          <div style={{ marginTop: 'var(--ds-spacing-3)', display: 'flex', gap: 'var(--ds-spacing-3)' }}>
            <a
              href="#"
              style={{
                color: 'var(--ds-color-accent-text-default)',
                fontSize: 'var(--ds-font-size-sm)',
                textDecoration: 'underline',
              }}
            >
              Les fullstendige vilkår
            </a>
            <a
              href="#"
              style={{
                color: 'var(--ds-color-accent-text-default)',
                fontSize: 'var(--ds-font-size-sm)',
                textDecoration: 'underline',
              }}
            >
              Personvernerklæring
            </a>
          </div>
        </div>

        {/* Terms acceptance checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--ds-spacing-3)',
            cursor: 'pointer',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              marginTop: '2px',
              accentColor: 'var(--ds-color-accent-base-default)',
              cursor: 'pointer',
            }}
          />
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Jeg har lest og godkjenner betingelsene
          </Paragraph>
        </label>
      </div>
    </div>
  );
}
