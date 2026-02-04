/**
 * AvailabilityCalendar
 *
 * Weekly calendar grid with time slots for booking.
 * Supports selecting available slots and displays slot status.
 */
import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from '../primitives/icons';
import type { TimeSlot, TimeSlotStatus } from '../types/listing-detail';

export interface AvailabilityCalendarProps {
  /** Start date for the week view */
  startDate: Date;
  /** Array of time slots with availability */
  timeSlots: TimeSlot[];
  /** Currently selected slots */
  selectedSlots?: TimeSlot[];
  /** Callback when a slot is clicked */
  onSlotClick?: (slot: TimeSlot) => void;
  /** Callback when week navigation is clicked */
  onWeekChange?: (direction: 'prev' | 'next') => void;
  /** Start hour for the grid (default: 8) */
  startHour?: number;
  /** End hour for the grid (default: 17) */
  endHour?: number;
  /** Title for the calendar section */
  title?: string;
  /** Show tips panel */
  showTips?: boolean;
  /** Custom class name */
  className?: string;
}

// Norwegian day abbreviations
const dayNames = ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'];
const dayNamesFull = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// Norwegian month names
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Format date to Norwegian format
 */
function formatDateRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = monthNames[startDate.getMonth()];
  const year = startDate.getFullYear();

  return `${startDay}. - ${endDay}. ${month} ${year}`;
}

/**
 * Get status label in Norwegian
 */
function getStatusLabel(status: TimeSlotStatus): string {
  switch (status) {
    case 'available':
      return 'Ledig';
    case 'occupied':
      return 'Opptatt';
    case 'selected':
      return 'Valgt';
    case 'unavailable':
      return 'Ikke tilgjengelig';
    default:
      return '';
  }
}

/**
 * AvailabilityCalendar component
 *
 * @example
 * ```tsx
 * <AvailabilityCalendar
 *   startDate={new Date()}
 *   timeSlots={slots}
 *   onSlotClick={(slot) => toggleSlot(slot)}
 *   onWeekChange={(dir) => changeWeek(dir)}
 * />
 * ```
 */
export function AvailabilityCalendar({
  startDate,
  timeSlots,
  selectedSlots = [],
  onSlotClick,
  onWeekChange,
  startHour = 8,
  endHour = 17,
  title = 'Ledighetskalender',
  showTips = true,
  className,
}: AvailabilityCalendarProps): React.ReactElement {
  // Generate array of hours
  const hours = React.useMemo(() => {
    const result = [];
    for (let h = startHour; h <= endHour; h++) {
      result.push(h);
    }
    return result;
  }, [startHour, endHour]);

  // Generate array of dates for the week
  const weekDates = React.useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [startDate]);

  // Get slot for a specific date and time
  const getSlot = (date: Date, hour: number): TimeSlot | undefined => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    return timeSlots.find((slot) => {
      const slotDate = new Date(slot.date);
      return (
        slotDate.toDateString() === date.toDateString() &&
        slot.startTime === timeStr
      );
    });
  };

  // Check if slot is selected
  const isSlotSelected = (slot: TimeSlot): boolean => {
    return selectedSlots.some(
      (s) =>
        new Date(s.date).toDateString() === new Date(slot.date).toDateString() &&
        s.startTime === slot.startTime
    );
  };

  // Determine slot status including selection
  const getSlotStatus = (slot: TimeSlot | undefined, _date: Date, _hour: number): TimeSlotStatus => {
    if (!slot) return 'unavailable';
    if (isSlotSelected(slot)) return 'selected';
    return slot.status;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className={cn('availability-calendar', className)}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <div>
          <Heading
            level={3}
            data-size="sm"
            style={{ margin: '0 0 var(--ds-spacing-1) 0' }}
          >
            {title}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Legg inn din reservasjon raskt og enkelt på 4 steg.
          </Paragraph>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showTips ? '1fr 280px' : '1fr',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Calendar grid */}
        <div>
          {/* Week navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => onWeekChange?.('prev')}
              aria-label="Forrige uke"
            >
              <ChevronLeftIcon size={16} />
            </Button>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {formatDateRange(startDate)}
            </Paragraph>
            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => onWeekChange?.('next')}
              aria-label="Neste uke"
            >
              <ChevronRightIcon size={16} />
            </Button>
          </div>

          {/* Calendar grid */}
          <div
            className="availability-calendar-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '60px repeat(7, 1fr)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              overflow: 'hidden',
            }}
          >
            {/* Header row */}
            <div
              style={{
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Tid
            </div>
            {weekDates.map((date, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  textAlign: 'center',
                }}
              >
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {dayNames[date.getDay()]}
                </Paragraph>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    color: isToday(date)
                      ? 'var(--ds-color-accent-base-default)'
                      : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {date.getDate()}
                </Paragraph>
                {isToday(date) && (
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      color: 'var(--ds-color-accent-base-default)',
                    }}
                  >
                    i dag
                  </Paragraph>
                )}
              </div>
            ))}

            {/* Time rows */}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div
                  style={{
                    padding: 'var(--ds-spacing-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                    borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                    fontSize: 'var(--ds-font-size-xs)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>

                {/* Day cells */}
                {weekDates.map((date, dayIndex) => {
                  const slot = getSlot(date, hour);
                  const status = getSlotStatus(slot, date, hour);
                  const isClickable = slot && (status === 'available' || status === 'selected');

                  // Get cell color based on status
                  const getCellColor = (s: TimeSlotStatus) => {
                    switch (s) {
                      case 'available':
                        return 'var(--ds-color-success-surface-default)';
                      case 'occupied':
                        return 'var(--ds-color-danger-surface-default)';
                      case 'selected':
                        return 'var(--ds-color-accent-surface-default)';
                      case 'unavailable':
                        return 'var(--ds-color-neutral-surface-hover)';
                      default:
                        return 'var(--ds-color-neutral-surface-hover)';
                    }
                  };

                  const getTextColor = (s: TimeSlotStatus) => {
                    switch (s) {
                      case 'available':
                        return 'var(--ds-color-success-text-default)';
                      case 'occupied':
                        return 'var(--ds-color-danger-text-default)';
                      case 'selected':
                        return 'var(--ds-color-accent-text-default)';
                      case 'unavailable':
                        return 'var(--ds-color-neutral-text-subtle)';
                      default:
                        return 'var(--ds-color-neutral-text-subtle)';
                    }
                  };

                  // Display time in the cell
                  const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

                  return (
                    <div
                      key={dayIndex}
                      style={{
                        padding: 'var(--ds-spacing-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '44px',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                      }}
                    >
                      <div
                        className="availability-calendar-cell"
                        data-status={status}
                        onClick={isClickable && slot ? () => onSlotClick?.(slot) : undefined}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onKeyDown={
                          isClickable && slot
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  onSlotClick?.(slot);
                                }
                              }
                            : undefined
                        }
                        aria-label={`${dayNamesFull[date.getDay()]} ${date.getDate()} kl ${hour}:00 - ${getStatusLabel(status)}`}
                        style={{
                          width: '100%',
                          padding: 'var(--ds-spacing-2)',
                          backgroundColor: getCellColor(status),
                          color: getTextColor(status),
                          fontSize: 'var(--ds-font-size-xs)',
                          textAlign: 'center',
                          cursor: isClickable ? 'pointer' : 'default',
                          transition: 'all 0.15s ease',
                          borderRadius: 'var(--ds-border-radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'var(--ds-font-weight-medium)',
                        }}
                        onMouseEnter={(e) => {
                          if (isClickable) {
                            e.currentTarget.style.opacity = '0.85';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isClickable) {
                            e.currentTarget.style.opacity = '1';
                          }
                        }}
                      >
                        {timeLabel}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend - "Forklaring" */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-5)',
              marginTop: 'var(--ds-spacing-4)',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              Forklaring
            </Paragraph>
            {(['available', 'occupied', 'selected', 'unavailable'] as TimeSlotStatus[]).map(
              (status) => {
                const getLegendColor = (s: TimeSlotStatus) => {
                  switch (s) {
                    case 'available':
                      return 'var(--ds-color-success-base-default)';
                    case 'occupied':
                      return 'var(--ds-color-danger-base-default)';
                    case 'selected':
                      return 'var(--ds-color-accent-base-default)';
                    case 'unavailable':
                      return 'var(--ds-color-neutral-border-default)';
                    default:
                      return 'var(--ds-color-neutral-border-default)';
                  }
                };

                return (
                  <div
                    key={status}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: getLegendColor(status),
                      }}
                    />
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        color: 'var(--ds-color-neutral-text-default)',
                      }}
                    >
                      {getStatusLabel(status)}
                    </Paragraph>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Tips panel */}
        {showTips && (
          <div>
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-lg)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            >
              <Heading
                level={4}
                data-size="xs"
                style={{ margin: '0 0 var(--ds-spacing-2) 0' }}
              >
                Valgte tidspunkter
              </Heading>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Klikk på ledige tidspunkter for å velge dem. Du kan velge flere
                tidspunkter samtidig.
              </Paragraph>
            </div>

            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                border: '1px solid var(--ds-color-info-border-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  marginBottom: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-info-text-default)',
                }}
              >
                <InfoIcon size={16} />
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                  }}
                >
                  Tips
                </Paragraph>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 'var(--ds-spacing-4)',
                  color: 'var(--ds-color-info-text-default)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                <li>Klikk på ledige tidspunkter for å velge dem</li>
                <li>Du kan velge flere tidspunkter samtidig</li>
                <li>Du kan booke flere dager samtidig</li>
                <li>Bytt mellom uker ved å bruke navigasjonen</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
