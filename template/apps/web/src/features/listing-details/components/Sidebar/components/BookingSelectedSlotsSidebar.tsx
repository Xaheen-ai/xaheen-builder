/**
 * BookingSelectedSlotsSidebar Component
 * Displays selected time slots with editing controls and price summary
 * This component should be fixed in the layout (not hidden between steps)
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

// Import icon from parent or create inline
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

export interface SlotDetail {
  duration: number;
  purpose?: string;
  showPurpose?: boolean;
  attendees?: string;
  activityType?: string;
}

export interface BookingSelectedSlotsSidebarProps {
  selectedSlots: Set<string>;
  slotDetails: Record<string, SlotDetail>;
  weekStart: Date;
  selectedPriceGroup?: string;
  totalPrice?: number;
  onRemoveSlot: (slotKey: string) => void;
  onAdjustTime?: (slotKey: string, minutesDelta: number) => void;
  onChangeDuration?: (slotKey: string, duration: number) => void;
}

export function BookingSelectedSlotsSidebar({
  selectedSlots,
  slotDetails,
  weekStart,
  selectedPriceGroup,
  totalPrice,
  onRemoveSlot,
  onAdjustTime,
  onChangeDuration,
}: BookingSelectedSlotsSidebarProps): React.ReactElement {
  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          paddingBottom: 'var(--ds-spacing-3)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <CalendarIcon size={20} />
        <Heading level={4} data-size="xs" style={{ margin: 0 }}>
          Valgte tidspunkter
        </Heading>
      </div>

      {/* Selected Slots List or Empty State */}
      {selectedSlots.size > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)', flex: 1, overflow: 'auto' }}>
          {Array.from(selectedSlots).map((slotKey) => {
            const parts = slotKey.split('-');
            const dayIdxStr = parts[0] ?? '0';
            const timeStr = parts[1] ?? '';
            const dayIdx = parseInt(dayIdxStr, 10);
            const details = slotDetails[slotKey] ?? { duration: 60 };

            // Calculate end time
            const [startH, startM] = timeStr.split(':').map(Number);
            const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
            const endH = Math.floor(endMins / 60);
            const endM = endMins % 60;
            const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

            // Get full date
            const slotDate = new Date(weekStart);
            slotDate.setDate(weekStart.getDate() + dayIdx);

            return (
              <details
                key={slotKey}
                style={{
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-default)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-accent-text-default)' }}>
                        {dayNames[slotDate.getDay()]} {slotDate.getDate()}. {monthNames[slotDate.getMonth()]}
                      </Paragraph>
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>•</span>
                      <Paragraph data-size="sm" style={{ margin: 0, fontVariantNumeric: 'tabular-nums', color: 'var(--ds-color-accent-text-default)' }}>
                        {timeStr} – {endTime}
                      </Paragraph>
                    </div>
                    {details.purpose && (
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {details.purpose}
                      </Paragraph>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveSlot(slotKey);
                    }}
                    aria-label="Fjern tidspunkt"
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
                      fontSize: 'var(--ds-font-size-md)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ds-color-danger-surface-default)';
                      e.currentTarget.style.color = 'var(--ds-color-danger-text-default)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)';
                    }}
                  >
                    ✕
                  </button>
                </summary>

                {/* Accordion Content - Slot Controls */}
                <div style={{ padding: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  {/* Time adjustment */}
                  {onAdjustTime && (
                    <div>
                      <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                        Juster tid
                      </Paragraph>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                        <button
                          type="button"
                          onClick={() => onAdjustTime(slotKey, -30)}
                          style={{
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            border: '1px solid var(--ds-color-neutral-border-default)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--ds-font-size-sm)',
                          }}
                        >
                          −30 min
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustTime(slotKey, 30)}
                          style={{
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            border: '1px solid var(--ds-color-neutral-border-default)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--ds-font-size-sm)',
                          }}
                        >
                          +30 min
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Duration selector */}
                  {onChangeDuration && (
                    <div>
                      <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                        Varighet
                      </Paragraph>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                        {[60, 90, 120, 180, 240].map(dur => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => onChangeDuration(slotKey, dur)}
                            style={{
                              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                              backgroundColor: details.duration === dur ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-surface-default)',
                              color: details.duration === dur ? 'var(--ds-color-accent-contrast-default)' : 'var(--ds-color-neutral-text-default)',
                              border: details.duration === dur ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-default)',
                              borderRadius: 'var(--ds-border-radius-md)',
                              cursor: 'pointer',
                              fontSize: 'var(--ds-font-size-sm)',
                              fontWeight: 'var(--ds-font-weight-medium)',
                            }}
                          >
                            {dur / 60}t
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  {(details.purpose || details.attendees || details.activityType) && (
                    <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                      {details.purpose && (
                        <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>Formål</Paragraph>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>{details.purpose}</Paragraph>
                        </div>
                      )}
                      {details.attendees && (
                        <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>Deltakere</Paragraph>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>{details.attendees}</Paragraph>
                        </div>
                      )}
                      {details.activityType && (
                        <div>
                          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>Aktivitet</Paragraph>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>{details.activityType}</Paragraph>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: 'var(--ds-spacing-6)',
            textAlign: 'center',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          <div style={{ marginBottom: 'var(--ds-spacing-2)', opacity: 0.3 }}>
            <CalendarIcon size={32} />
          </div>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Ingen tidspunkter valgt
          </Paragraph>
        </div>
      )}

      {/* Price Summary */}
      {selectedPriceGroup && totalPrice !== undefined && selectedSlots.size > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-accent-border-subtle)',
            marginTop: 'auto',
          }}
        >
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
            Totalpris
          </Paragraph>
          <Heading level={3} data-size="md" style={{ margin: 0, color: 'var(--ds-color-accent-text-default)' }}>
            {totalPrice} kr
          </Heading>
        </div>
      )}
    </div>
  );
}
