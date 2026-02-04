/**
 * BookingCartSidebar Component
 * Displays a cart-like sidebar with accordion sections for:
 * - Selected time slots
 * - Price group selection
 * - Additional services
 * - Detailed price breakdown with 25% MVA
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

// Icons
function ShoppingCartIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ReceiptIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17V7" />
    </svg>
  );
}

function ChevronDownIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export interface SlotDetail {
  duration: number;
  purpose?: string;
  showPurpose?: boolean;
  attendees?: string;
  activityType?: string;
  maxCapacity?: number;
}

export interface PriceGroup {
  id: string;
  label: string;
  pricePerHour: number;
  description?: string;
}

export interface AdditionalService {
  id: string;
  label: string;
  description?: string;
  price: number;
}

export interface BookingCartSidebarProps {
  selectedSlots: Set<string>;
  slotDetails: Record<string, SlotDetail>;
  weekStart: Date;
  priceGroups: PriceGroup[];
  additionalServices: AdditionalService[];
  selectedPriceGroup: string;
  selectedServices: Set<string>;
  onRemoveSlot: (slotKey: string) => void;
  onAdjustTime?: (slotKey: string, minutesDelta: number) => void;
  onChangeDuration?: (slotKey: string, duration: number) => void;
}

interface PriceBreakdown {
  basePrice: number;
  servicesPrice: number;
  subtotal: number;
  mva: number;
  total: number;
}

export function BookingCartSidebar({
  selectedSlots,
  slotDetails,
  weekStart,
  priceGroups,
  additionalServices,
  selectedPriceGroup,
  selectedServices,
  onRemoveSlot,
  onChangeDuration,
}: BookingCartSidebarProps): React.ReactElement {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['slots', 'pricing'])
  );

  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

  const toggleSection = (section: string): void => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Calculate price breakdown
  const priceBreakdown = React.useMemo((): PriceBreakdown => {
    const priceGroup = priceGroups.find(pg => pg.id === selectedPriceGroup);
    const hourlyRate = priceGroup?.pricePerHour ?? 0;

    // Calculate total hours from selected slots
    let totalMinutes = 0;
    selectedSlots.forEach(slotKey => {
      const details = slotDetails[slotKey];
      totalMinutes += details?.duration ?? 60;
    });
    const totalHours = totalMinutes / 60;

    // Base price
    const basePrice = Math.round(hourlyRate * totalHours);

    // Services price
    let servicesPrice = 0;
    selectedServices.forEach(serviceId => {
      const service = additionalServices.find(s => s.id === serviceId);
      if (service) {
        servicesPrice += service.price;
      }
    });

    // Subtotal before MVA
    const subtotal = basePrice + servicesPrice;

    // 25% MVA
    const mva = Math.round(subtotal * 0.25);

    // Total including MVA
    const total = subtotal + mva;

    return { basePrice, servicesPrice, subtotal, mva, total };
  }, [selectedSlots, slotDetails, selectedPriceGroup, selectedServices, priceGroups, additionalServices]);

  const slotCount = selectedSlots.size;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable Content - no header, integrated with main calendar header */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', minWidth: 0 }}>
        {/* Selected Slots Section */}
        <div
          style={{
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-lg)',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => toggleSection('slots')}
            style={{
              width: '100%',
              padding: 'var(--ds-spacing-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <CalendarIcon size={18} />
            <span style={{ flex: 1, fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-md)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Valgte tidspunkter
            </span>
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)', flexShrink: 0 }}>
              {slotCount} {slotCount === 1 ? 'forekomst' : 'forekomster'}
            </span>
            <span style={{ transform: expandedSections.has('slots') ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
              <ChevronDownIcon size={16} />
            </span>
          </button>

          {expandedSections.has('slots') && (
            <div style={{ padding: 'var(--ds-spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {slotCount === 0 ? (
                <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
                  Ingen tidspunkter valgt ennå
                </Paragraph>
              ) : (
                Array.from(selectedSlots).map(slotKey => {
                  const parts = slotKey.split('-');
                  const dayIdx = parseInt(parts[0] ?? '0', 10);
                  const timeStr = parts[1] ?? '';
                  const details = slotDetails[slotKey] ?? { duration: 60 };

                  const [startH, startM] = timeStr.split(':').map(Number);
                  const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
                  const endH = Math.floor(endMins / 60);
                  const endM = endMins % 60;
                  const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

                  const slotDate = new Date(weekStart);
                  slotDate.setDate(weekStart.getDate() + dayIdx);

                  return (
                    <div
                      key={slotKey}
                      style={{
                        padding: 'var(--ds-spacing-3)',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                            <CalendarIcon size={16} />
                            <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', wordBreak: 'break-word' }}>
                              {slotDate.getDate()}. {monthNames[slotDate.getMonth()]} {slotDate.getFullYear()}
                            </Paragraph>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                            <ClockIcon size={16} />
                            <Paragraph data-size="md" style={{ margin: 0, fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>
                              {timeStr} - {endTime} ({details.duration / 60} {details.duration === 60 ? 'time' : 'timer'})
                            </Paragraph>
                          </div>
                          {details.purpose && (
                            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                              Formål: {details.purpose}
                            </Paragraph>
                          )}
                          {details.maxCapacity && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)', marginTop: 'var(--ds-spacing-1)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                                Maks kapasitet: {details.maxCapacity} personer
                              </Paragraph>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveSlot(slotKey)}
                          aria-label="Fjern"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--ds-color-neutral-text-subtle)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Duration selector */}
                      {onChangeDuration && (
                        <div style={{ marginTop: 'var(--ds-spacing-2)', paddingTop: 'var(--ds-spacing-2)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                            Varighet:
                          </Paragraph>
                          <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)', flexWrap: 'wrap' }}>
                            {[60, 90, 120, 180].map(dur => (
                              <button
                                key={dur}
                                type="button"
                                onClick={() => onChangeDuration(slotKey, dur)}
                                style={{
                                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                                  backgroundColor: details.duration === dur ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-surface-default)',
                                  color: details.duration === dur ? 'var(--ds-color-accent-contrast-default)' : 'var(--ds-color-neutral-text-default)',
                                  border: '1px solid var(--ds-color-neutral-border-default)',
                                  borderRadius: 'var(--ds-border-radius-sm)',
                                  cursor: 'pointer',
                                  fontSize: 'var(--ds-font-size-sm)',
                                }}
                              >
                                {dur / 60}t
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown - Always visible at bottom */}
      {slotCount > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-accent-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)', paddingBottom: 'var(--ds-spacing-2)', borderBottom: '1px solid var(--ds-color-accent-border-subtle)' }}>
            <ReceiptIcon size={18} />
            <Heading level={4} data-size="sm" style={{ margin: 0 }}>
              Prisberegning
            </Heading>
            <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {slotCount} {slotCount === 1 ? 'forekomst' : 'forekomster'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {/* Base price */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                Grunnpris:
              </Paragraph>
              <Paragraph data-size="md" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                {priceBreakdown.basePrice} kr
              </Paragraph>
            </div>

            {/* Services price */}
            {priceBreakdown.servicesPrice > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  Tilleggstjenester:
                </Paragraph>
                <Paragraph data-size="md" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {priceBreakdown.servicesPrice} kr
                </Paragraph>
              </div>
            )}

            {/* MVA */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                MVA (25%):
              </Paragraph>
              <Paragraph data-size="md" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                {priceBreakdown.mva} kr
              </Paragraph>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--ds-color-accent-border-subtle)', marginTop: 'var(--ds-spacing-1)', paddingTop: 'var(--ds-spacing-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  Totalt inkl. MVA:
                </Paragraph>
                <Heading level={3} data-size="md" style={{ margin: 0, color: 'var(--ds-color-accent-text-default)' }}>
                  {priceBreakdown.total} kr
                </Heading>
              </div>
            </div>

            {/* Price explanation */}
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
              * Prisen er et resultat av følgende prisfaktorer: timespris basert på prisgruppe og valgte tilleggstjenester.
            </Paragraph>
          </div>
        </div>
      )}

    </div>
  );
}
