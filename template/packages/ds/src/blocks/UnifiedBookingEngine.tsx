/**
 * UnifiedBookingEngine
 *
 * Comprehensive booking system that adapts to all listing types.
 * Supports: Slot-based, Daily, Date Range, Event, Recurring bookings.
 */
import * as React from 'react';
import { Heading, Paragraph, Button, Alert } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  UsersIcon,
  InfoIcon,
  SparklesIcon,
} from '../primitives/icons';
import type {
  BookingConfig,
  BookingMode,
  BookingSelection,
  BookingFormData,
  BookingPriceCalculation,
  AvailabilitySlot,
  DayAvailability,
  PriceItem,
  BookingPricing,
} from '../types/booking';
import { getBookingSteps, formatPrice, formatPriceUnit } from '../types/booking';
import type { AdditionalService } from '../types/listing-detail';

export interface UnifiedBookingEngineProps {
  /** Booking configuration */
  config: BookingConfig;
  /** Listing name for display */
  listingName: string;
  /** Listing image URL */
  listingImage?: string;
  /** Available slots (for slot/daily mode) */
  availableSlots?: AvailabilitySlot[];
  /** Day availability (for calendar view) */
  dayAvailability?: DayAvailability[];
  /** Additional services available */
  additionalServices?: AdditionalService[];
  /** Current step index */
  currentStep?: number;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
  /** Callback when booking is submitted */
  onSubmit?: (selection: BookingSelection, formData: BookingFormData) => Promise<void>;
  /** Callback when selection changes */
  onSelectionChange?: (selection: BookingSelection) => void;
  /** Custom class name */
  className?: string;
}

// Step Icons
function CalendarStepIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

function FormStepIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ConfirmStepIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SuccessStepIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function PaymentStepIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

const stepIconMap: Record<string, React.FC<{ size?: number }>> = {
  calendar: CalendarStepIcon,
  form: FormStepIcon,
  confirm: ConfirmStepIcon,
  success: SuccessStepIcon,
  payment: PaymentStepIcon,
};

// =============================================================================
// Mode View Components
// =============================================================================

interface ModeViewProps {
  formatPrice: (amount: number, currency: string) => string;
  priceCalculation: BookingPriceCalculation;
  onContinue: () => void;
  canContinue: boolean;
}

/**
 * Daily Mode View - Select full days from a month calendar
 */
function DailyModeView({
  calendarDate,
  dayAvailability,
  selection,
  onDateSelect,
  onMonthChange,
  formatPrice,
  currency,
  priceCalculation,
  onContinue,
  canContinue,
}: ModeViewProps & {
  calendarDate: Date;
  dayAvailability: DayAvailability[];
  selection: BookingSelection;
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  currency: string;
}): React.ReactElement {
  const monthName = calendarDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar days
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Adjust for Monday start
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
  }

  const isDateSelected = (date: Date) => {
    return selection.slots.some(s => new Date(s.date).toDateString() === date.toDateString());
  };

  const getDateAvailability = (date: Date): DayAvailability | undefined => {
    return dayAvailability.find(d => new Date(d.date).toDateString() === date.toDateString());
  };

  return (
    <div className="selection-view daily-mode">
      <div className="calendar-panel">
        <div className="calendar-panel-header">
          <div className="calendar-title">
            <CalendarIcon size={20} />
            <Heading level={3} data-size="sm" style={{ margin: 0 }}>
              Velg dato
            </Heading>
          </div>
          <div className="calendar-navigation">
            <button type="button" className="nav-button" onClick={() => onMonthChange('prev')} aria-label="Forrige måned">
              <ChevronLeftIcon size={20} />
            </button>
            <span className="nav-date" style={{ minWidth: '160px' }}>{monthName}</span>
            <button type="button" className="nav-button" onClick={() => onMonthChange('next')} aria-label="Neste måned">
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>

        <div className="month-calendar">
          <div className="month-header">
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
              <div key={day} className="month-day-name">{day}</div>
            ))}
          </div>
          <div className="month-grid">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="month-day empty" />;

              const isPast = date < today;
              const isToday = date.toDateString() === today.toDateString();
              const selected = isDateSelected(date);
              const availability = getDateAvailability(date);
              const isAvailable = availability ? availability.isAvailable : !isPast;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={cn(
                    'month-day',
                    isPast && 'past',
                    isToday && 'today',
                    selected && 'selected',
                    isAvailable && !isPast && 'available',
                    !isAvailable && 'unavailable'
                  )}
                  onClick={() => isAvailable && !isPast && onDateSelect(date)}
                  disabled={isPast || !isAvailable}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {availability?.minPrice && !selected && (
                    <span className="day-price">{formatPrice(availability.minPrice, currency)}</span>
                  )}
                  {selected && <CheckIcon size={14} className="day-check" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot available" />
            <span>Ledig</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot selected" />
            <span>Valgt</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unavailable" />
            <span>Opptatt</span>
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <CalendarIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Valgte datoer
          </Heading>
        </div>

        {selection.slots.length === 0 ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <CalendarIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Klikk på datoer i kalenderen for å velge
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="selected-slots-list">
              {selection.slots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((slot, index) => (
                  <div key={slot.id} className="selected-slot-item" style={{ animationDelay: `${index * 40}ms` }}>
                    <div className="slot-info">
                      <span className="slot-date">
                        {new Date(slot.date).toLocaleDateString('nb-NO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                      <span className="slot-time-range">Hele dagen</span>
                    </div>
                    <button
                      type="button"
                      className="slot-remove"
                      onClick={() => onDateSelect(new Date(slot.date))}
                      aria-label="Fjern"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                ))}
            </div>

            <PriceSummary priceCalculation={priceCalculation} />

            <div className="summary-actions">
              <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                Fortsett
                <ChevronRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Date Range Mode View - Select start and end date
 */
function DateRangeModeView({
  calendarDate,
  dayAvailability: _dayAvailability,
  selection,
  onRangeSelect,
  onMonthChange,
  formatPrice,
  currency,
  pricing,
  priceCalculation,
  onContinue,
  canContinue,
}: ModeViewProps & {
  calendarDate: Date;
  dayAvailability: DayAvailability[];
  selection: BookingSelection;
  onRangeSelect: (start: Date, end: Date | null) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  currency: string;
  pricing: BookingPricing;
}): React.ReactElement {
  const [rangeStart, setRangeStart] = React.useState<Date | null>(selection.dateRange?.start || null);
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(selection.dateRange?.end || null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

  const monthName = calendarDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar days
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
  }

  const handleDateClick = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
      onRangeSelect(date, null);
    } else {
      const newEnd = date >= rangeStart ? date : rangeStart;
      const newStart = date >= rangeStart ? rangeStart : date;
      setRangeStart(newStart);
      setRangeEnd(newEnd);
      onRangeSelect(newStart, newEnd);
    }
  };

  const isInRange = (date: Date) => {
    if (!rangeStart) return false;
    const end = rangeEnd || hoverDate;
    if (!end) return false;

    const start = rangeStart <= end ? rangeStart : end;
    const finish = rangeStart <= end ? end : rangeStart;
    return date >= start && date <= finish;
  };

  const isRangeStart = (date: Date) => rangeStart?.toDateString() === date.toDateString();
  const isRangeEnd = (date: Date) => rangeEnd?.toDateString() === date.toDateString();

  const getDaysCount = () => {
    if (!rangeStart || !rangeEnd) return 0;
    return Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="selection-view range-mode">
      <div className="calendar-panel">
        <div className="calendar-panel-header">
          <div className="calendar-title">
            <CalendarIcon size={20} />
            <Heading level={3} data-size="sm" style={{ margin: 0 }}>
              Velg periode
            </Heading>
          </div>
          <div className="calendar-navigation">
            <button type="button" className="nav-button" onClick={() => onMonthChange('prev')} aria-label="Forrige måned">
              <ChevronLeftIcon size={20} />
            </button>
            <span className="nav-date" style={{ minWidth: '160px' }}>{monthName}</span>
            <button type="button" className="nav-button" onClick={() => onMonthChange('next')} aria-label="Neste måned">
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>

        <div className="range-hint">
          <InfoIcon size={16} />
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {!rangeStart ? 'Klikk for å velge startdato' : !rangeEnd ? 'Klikk for å velge sluttdato' : 'Klikk for å endre'}
          </Paragraph>
        </div>

        <div className="month-calendar">
          <div className="month-header">
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
              <div key={day} className="month-day-name">{day}</div>
            ))}
          </div>
          <div className="month-grid range-grid">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="month-day empty" />;

              const isPast = date < today;
              const inRange = isInRange(date);
              const isStart = isRangeStart(date);
              const isEnd = isRangeEnd(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={cn(
                    'month-day',
                    isPast && 'past',
                    inRange && 'in-range',
                    isStart && 'range-start',
                    isEnd && 'range-end',
                    !isPast && 'available'
                  )}
                  onClick={() => !isPast && handleDateClick(date)}
                  onMouseEnter={() => !isPast && rangeStart && !rangeEnd && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isPast}
                >
                  <span className="day-number">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <CalendarIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Din periode
          </Heading>
        </div>

        {!rangeStart ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <CalendarIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg start- og sluttdato for din booking
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="range-summary">
              <div className="range-date-box">
                <span className="range-label">Fra</span>
                <span className="range-date">
                  {rangeStart.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="range-arrow">→</div>
              <div className="range-date-box">
                <span className="range-label">Til</span>
                <span className="range-date">
                  {rangeEnd
                    ? rangeEnd.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })
                    : 'Velg sluttdato'
                  }
                </span>
              </div>
            </div>

            {rangeEnd && (
              <>
                <div className="range-info">
                  <div className="info-row">
                    <span>Antall {formatPriceUnit(pricing.unit)}er</span>
                    <span className="info-value">{getDaysCount()}</span>
                  </div>
                  <div className="info-row">
                    <span>Pris per {formatPriceUnit(pricing.unit)}</span>
                    <span className="info-value">{formatPrice(pricing.basePrice, currency)}</span>
                  </div>
                </div>

                <PriceSummary priceCalculation={priceCalculation} />

                <div className="summary-actions">
                  <Button type="button" variant="tertiary" onClick={() => { setRangeStart(null); setRangeEnd(null); onRangeSelect(new Date(), null); }}>
                    Tøm valg
                  </Button>
                  <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                    Fortsett
                    <ChevronRightIcon size={18} />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Event Mode View - Select tickets for events
 */
function EventModeView({
  config,
  selection,
  onTicketChange,
  formatPrice,
  priceCalculation,
  onContinue,
  canContinue,
}: ModeViewProps & {
  config: BookingConfig;
  selection: BookingSelection;
  onTicketChange: (tickets: number) => void;
}): React.ReactElement {
  const tickets = selection.tickets || 0;
  const maxTickets = config.eventCapacity || config.rules.maxAttendees || 100;
  const minTickets = config.rules.minAttendees || 1;

  const eventDate = config.eventDate ? new Date(config.eventDate) : null;

  return (
    <div className="selection-view event-mode">
      <div className="event-panel">
        <div className="event-header">
          <div className="event-badge">ARRANGEMENT</div>
          <Heading level={2} data-size="lg" style={{ margin: 0 }}>
            Velg antall billetter
          </Heading>
          {eventDate && (
            <div className="event-date-info">
              <CalendarIcon size={18} />
              <span>
                {eventDate.toLocaleDateString('nb-NO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        <div className="ticket-selector">
          <div className="ticket-type">
            <div className="ticket-info">
              <Heading level={3} data-size="sm" style={{ margin: 0 }}>Standardbillett</Heading>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Inkluderer adgang til arrangementet
              </Paragraph>
            </div>
            <div className="ticket-price">
              {formatPrice(config.pricing.basePrice, config.pricing.currency)}
              <span className="price-per">/person</span>
            </div>
            <div className="ticket-controls">
              <button
                type="button"
                className="ticket-btn"
                onClick={() => onTicketChange(Math.max(0, tickets - 1))}
                disabled={tickets <= 0}
                aria-label="Reduser antall"
              >
                −
              </button>
              <span className="ticket-count">{tickets}</span>
              <button
                type="button"
                className="ticket-btn"
                onClick={() => onTicketChange(Math.min(maxTickets, tickets + 1))}
                disabled={tickets >= maxTickets}
                aria-label="Øk antall"
              >
                +
              </button>
            </div>
          </div>

          <div className="ticket-capacity">
            <UsersIcon size={16} />
            <span>{maxTickets - tickets} plasser igjen</span>
          </div>
        </div>

        {tickets >= minTickets && (
          <Alert data-color="info">
            <InfoIcon size={16} />
            Du har valgt {tickets} billett{tickets !== 1 ? 'er' : ''}. Minimum {minTickets} billett{minTickets !== 1 ? 'er' : ''} kreves.
          </Alert>
        )}
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <UsersIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Din bestilling
          </Heading>
        </div>

        {tickets === 0 ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <UsersIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg antall billetter for å fortsette
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="order-summary">
              <div className="order-item">
                <span>Standardbillett × {tickets}</span>
                <span>{formatPrice(tickets * config.pricing.basePrice, config.pricing.currency)}</span>
              </div>
            </div>

            <PriceSummary priceCalculation={priceCalculation} />

            <div className="summary-actions">
              <Button type="button" variant="tertiary" onClick={() => onTicketChange(0)}>
                Tøm
              </Button>
              <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                Fortsett
                <ChevronRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Recurring Mode View - Set up weekly recurring booking
 */
function RecurringModeView({
  config: _config,
  selection,
  onRecurringChange,
  formatPrice: _formatPrice,
  priceCalculation,
  onContinue,
  canContinue,
}: ModeViewProps & {
  config: BookingConfig;
  selection: BookingSelection;
  onRecurringChange: (pattern: BookingSelection['recurring']) => void;
}): React.ReactElement {
  const [weekdays, setWeekdays] = React.useState<number[]>(selection.recurring?.weekdays || []);
  const [startDate, setStartDate] = React.useState<Date>(selection.recurring?.startDate || new Date());
  const [endDate, setEndDate] = React.useState<Date>(
    selection.recurring?.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  );
  const [startTime, setStartTime] = React.useState(selection.recurring?.startTime || '17:00');
  const [endTime, setEndTime] = React.useState(selection.recurring?.endTime || '19:00');

  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const timeOptions = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const toggleWeekday = (day: number) => {
    const newWeekdays = weekdays.includes(day)
      ? weekdays.filter(d => d !== day)
      : [...weekdays, day].sort();
    setWeekdays(newWeekdays);
    updateRecurring(newWeekdays, startDate, endDate, startTime, endTime);
  };

  const updateRecurring = (days: number[], start: Date, end: Date, sTime: string, eTime: string) => {
    if (days.length > 0) {
      onRecurringChange({ weekdays: days, startDate: start, endDate: end, startTime: sTime, endTime: eTime });
    } else {
      onRecurringChange(undefined);
    }
  };

  // Calculate total sessions
  const totalSessions = React.useMemo(() => {
    if (weekdays.length === 0) return 0;
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = (current.getDay() + 6) % 7; // Adjust for Monday = 0
      if (weekdays.includes(dayOfWeek)) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [weekdays, startDate, endDate]);

  return (
    <div className="selection-view recurring-mode">
      <div className="recurring-panel">
        <Heading level={2} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Sett opp sesongbooking
        </Heading>

        <div className="recurring-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Velg ukedager
          </Heading>
          <div className="weekday-selector">
            {dayNames.map((name, i) => (
              <button
                key={i}
                type="button"
                className={cn('weekday-btn', weekdays.includes(i) && 'selected')}
                onClick={() => toggleWeekday(i)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="recurring-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Tidspunkt
          </Heading>
          <div className="time-selector">
            <div className="time-input">
              <label>Fra</label>
              <select
                value={startTime}
                onChange={e => { setStartTime(e.target.value); updateRecurring(weekdays, startDate, endDate, e.target.value, endTime); }}
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <span className="time-separator">–</span>
            <div className="time-input">
              <label>Til</label>
              <select
                value={endTime}
                onChange={e => { setEndTime(e.target.value); updateRecurring(weekdays, startDate, endDate, startTime, e.target.value); }}
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="recurring-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Periode
          </Heading>
          <div className="date-selector">
            <div className="date-input">
              <label>Fra dato</label>
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={e => { const d = new Date(e.target.value); setStartDate(d); updateRecurring(weekdays, d, endDate, startTime, endTime); }}
              />
            </div>
            <div className="date-input">
              <label>Til dato</label>
              <input
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={e => { const d = new Date(e.target.value); setEndDate(d); updateRecurring(weekdays, startDate, d, startTime, endTime); }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <CalendarIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Sesongsammendrag
          </Heading>
        </div>

        {weekdays.length === 0 ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <CalendarIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg ukedager for å se sammendrag
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="recurring-summary">
              <div className="summary-row">
                <span>Ukedager</span>
                <span>{weekdays.map(d => dayNames[d]).join(', ')}</span>
              </div>
              <div className="summary-row">
                <span>Tidspunkt</span>
                <span>{startTime} - {endTime}</span>
              </div>
              <div className="summary-row">
                <span>Periode</span>
                <span>{startDate.toLocaleDateString('nb-NO')} - {endDate.toLocaleDateString('nb-NO')}</span>
              </div>
              <div className="summary-row highlight">
                <span>Antall økter</span>
                <span>{totalSessions}</span>
              </div>
            </div>

            <PriceSummary priceCalculation={priceCalculation} />

            <div className="summary-actions">
              <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                Fortsett
                <ChevronRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Instant Mode View - Direct booking without calendar
 */
function InstantModeView({
  config,
  formatPrice: _formatPrice,
  priceCalculation: _priceCalculation,
  onContinue,
}: {
  config: BookingConfig;
  formatPrice: (amount: number, currency: string) => string;
  priceCalculation: BookingPriceCalculation;
  onContinue: () => void;
}): React.ReactElement {
  return (
    <div className="selection-view instant-mode">
      <div className="instant-panel">
        <div className="instant-icon">
          <SparklesIcon size={48} />
        </div>
        <Heading level={2} data-size="lg" style={{ margin: 0, textAlign: 'center' }}>
          Direkte booking
        </Heading>
        <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '400px' }}>
          Denne tjenesten krever ingen kalendervalg. Fyll ut skjemaet for å fullføre bestillingen.
        </Paragraph>

        <div className="instant-price-card">
          <span className="instant-price-label">Pris</span>
          <span className="instant-price-amount">
            {formatPrice(config.pricing.basePrice, config.pricing.currency)}
          </span>
          <span className="instant-price-unit">per {formatPriceUnit(config.pricing.unit)}</span>
        </div>

        <Button type="button" variant="primary" data-color="accent" data-size="lg" onClick={onContinue}>
          Fortsett til bestilling
          <ChevronRightIcon size={20} />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Form and Confirm Step Components
// =============================================================================

/**
 * Booking Form Step - Collect user details
 */
function BookingFormStep({
  formData,
  config,
  additionalServices,
  onFormChange,
  onBack,
  onContinue,
  canContinue,
}: {
  formData: Partial<BookingFormData>;
  config: BookingConfig;
  additionalServices: AdditionalService[];
  onFormChange: (field: keyof BookingFormData, value: unknown) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}): React.ReactElement {
  return (
    <div className="form-view">
      <div className="form-grid">
        {/* Contact Information */}
        <div className="form-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Kontaktinformasjon
          </Heading>

          <div className="form-group">
            <label htmlFor="name">Navn *</label>
            <input
              id="name"
              type="text"
              value={formData.name || ''}
              onChange={e => onFormChange('name', e.target.value)}
              placeholder="Ditt fulle navn"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">E-post *</label>
              <input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={e => onFormChange('email', e.target.value)}
                placeholder="din@epost.no"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefon *</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={e => onFormChange('phone', e.target.value)}
                placeholder="+47 XXX XX XXX"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="organization">Organisasjon</label>
            <input
              id="organization"
              type="text"
              value={formData.organization || ''}
              onChange={e => onFormChange('organization', e.target.value)}
              placeholder="Bedrift eller organisasjon (valgfritt)"
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="form-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Bookingdetaljer
          </Heading>

          <div className="form-group">
            <label htmlFor="purpose">Formål *</label>
            <input
              id="purpose"
              type="text"
              value={formData.purpose || ''}
              onChange={e => onFormChange('purpose', e.target.value)}
              placeholder="Hva skal du bruke lokalet til?"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.showPurposeInCalendar || false}
                onChange={e => onFormChange('showPurposeInCalendar', e.target.checked)}
              />
              <span>Vis formål i offentlig kalender</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfPeople">Antall personer *</label>
              <input
                id="numberOfPeople"
                type="number"
                min={1}
                max={config.rules.maxAttendees || 100}
                value={formData.numberOfPeople || 1}
                onChange={e => onFormChange('numberOfPeople', parseInt(e.target.value))}
              />
            </div>
            {config.activityTypes && config.activityTypes.length > 0 && (
              <div className="form-group">
                <label htmlFor="activityType">Aktivitetstype</label>
                <select
                  id="activityType"
                  value={formData.activityType || ''}
                  onChange={e => onFormChange('activityType', e.target.value)}
                >
                  <option value="">Velg type</option>
                  {config.activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Tilleggsinfo</label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={e => onFormChange('notes', e.target.value)}
              placeholder="Eventuelle spesielle behov eller kommentarer"
            />
          </div>
        </div>

        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <div className="form-section services-section">
            <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Tilleggstjenester
            </Heading>
            <div className="services-list">
              {additionalServices.map(service => (
                <label key={service.id} className="service-item">
                  <input
                    type="checkbox"
                    checked={formData.additionalServices?.includes(service.id) || false}
                    onChange={e => {
                      const current = formData.additionalServices || [];
                      const newServices = e.target.checked
                        ? [...current, service.id]
                        : current.filter(id => id !== service.id);
                      onFormChange('additionalServices', newServices);
                    }}
                  />
                  <div className="service-info">
                    <span className="service-name">{service.name}</span>
                    {service.description && (
                      <span className="service-desc">{service.description}</span>
                    )}
                  </div>
                  <span className="service-price">+{formatPrice(service.price, config.pricing.currency)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="form-section terms-section">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.acceptedTerms || false}
                onChange={e => onFormChange('acceptedTerms', e.target.checked)}
                required
              />
              <span>
                Jeg godtar <a href={config.rules.termsUrl || '#'} target="_blank" rel="noopener noreferrer">vilkårene</a> for booking *
              </span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.acceptedCancellationPolicy || false}
                onChange={e => onFormChange('acceptedCancellationPolicy', e.target.checked)}
              />
              <span>
                Jeg har lest og forstår avbestillingsreglene ({config.rules.cancellationPolicy})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <Button type="button" variant="tertiary" onClick={onBack}>
          <ChevronLeftIcon size={18} />
          Tilbake
        </Button>
        <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
          Fortsett til bekreftelse
          <ChevronRightIcon size={18} />
        </Button>
      </div>
    </div>
  );
}

/**
 * Booking Confirm Step - Review and submit
 */
function BookingConfirmStep({
  selection,
  formData,
  config,
  listingName,
  listingImage,
  priceCalculation,
  additionalServices,
  isSubmitting,
  submitError,
  onBack,
  onSubmit,
}: {
  selection: BookingSelection;
  formData: BookingFormData;
  config: BookingConfig;
  listingName: string;
  listingImage?: string;
  priceCalculation: BookingPriceCalculation;
  additionalServices: AdditionalService[];
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: () => void;
}): React.ReactElement {
  const selectedServiceNames = additionalServices
    .filter(s => formData.additionalServices.includes(s.id))
    .map(s => s.name);

  return (
    <div className="confirm-view">
      <div className="confirm-grid">
        {/* Booking Summary */}
        <div className="confirm-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Bookingsammendrag
          </Heading>

          <div className="confirm-card listing-card">
            {listingImage && (
              <img src={listingImage} alt={listingName} className="listing-image" />
            )}
            <div className="listing-info">
              <Heading level={4} data-size="xs" style={{ margin: 0 }}>{listingName}</Heading>
              <span className="listing-type">{config.listingType}</span>
            </div>
          </div>

          {/* Time Selection Summary */}
          <div className="confirm-card">
            <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <CalendarIcon size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Tid
            </Heading>

            {config.mode === 'slots' && selection.slots.length > 0 && (
              <div className="time-list">
                {selection.slots.slice(0, 3).map(slot => (
                  <div key={slot.id} className="time-item">
                    <span>{new Date(slot.date).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
                {selection.slots.length > 3 && (
                  <span className="more-times">+{selection.slots.length - 3} flere tidspunkter</span>
                )}
              </div>
            )}

            {config.mode === 'dateRange' && selection.dateRange && (
              <div className="date-range-display">
                <span>{new Date(selection.dateRange.start).toLocaleDateString('nb-NO')} - {new Date(selection.dateRange.end).toLocaleDateString('nb-NO')}</span>
              </div>
            )}

            {config.mode === 'event' && selection.tickets && (
              <div className="tickets-display">
                <span>{selection.tickets} billett{selection.tickets !== 1 ? 'er' : ''}</span>
                {config.eventDate && (
                  <span className="event-date">{new Date(config.eventDate).toLocaleDateString('nb-NO', { dateStyle: 'full' })}</span>
                )}
              </div>
            )}
          </div>

          {/* Contact Info Summary */}
          <div className="confirm-card">
            <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <UsersIcon size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Kontakt
            </Heading>
            <div className="contact-summary">
              <p><strong>{formData.name}</strong></p>
              <p>{formData.email}</p>
              <p>{formData.phone}</p>
              {formData.organization && <p>{formData.organization}</p>}
            </div>
          </div>

          {/* Booking Details Summary */}
          <div className="confirm-card">
            <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <InfoIcon size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Detaljer
            </Heading>
            <div className="details-summary">
              <div className="detail-row">
                <span>Formål</span>
                <span>{formData.purpose}</span>
              </div>
              <div className="detail-row">
                <span>Antall personer</span>
                <span>{formData.numberOfPeople}</span>
              </div>
              {formData.activityType && (
                <div className="detail-row">
                  <span>Aktivitet</span>
                  <span>{formData.activityType}</span>
                </div>
              )}
              {selectedServiceNames.length > 0 && (
                <div className="detail-row">
                  <span>Tilleggstjenester</span>
                  <span>{selectedServiceNames.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="confirm-section price-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Pris
          </Heading>

          <div className="price-breakdown">
            {priceCalculation.items.map(item => (
              <div key={item.id} className={cn('price-row', item.type)}>
                <span>{item.label}</span>
                <span>{item.type === 'discount' ? '-' : ''}{formatPrice(item.total, priceCalculation.currency)}</span>
              </div>
            ))}

            {priceCalculation.vat > 0 && (
              <div className="price-row vat">
                <span>MVA ({config.pricing.vatPercentage}%)</span>
                <span>{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
              </div>
            )}

            <div className="price-row total">
              <span>Totalt å betale</span>
              <span>{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="policy-notice">
            <InfoIcon size={16} />
            <div>
              <strong>Avbestillingsregler</strong>
              <p>
                {config.rules.cancellationPolicy === 'flexible' && 'Gratis avbestilling inntil 24 timer før.'}
                {config.rules.cancellationPolicy === 'moderate' && `Gratis avbestilling inntil ${config.rules.freeCancellationHours} timer før.`}
                {config.rules.cancellationPolicy === 'strict' && 'Ingen refusjon ved avbestilling.'}
              </p>
            </div>
          </div>

          {submitError && (
            <Alert data-color="danger" style={{ marginTop: 'var(--ds-spacing-4)' }}>
              {submitError}
            </Alert>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="confirm-actions">
        <Button type="button" variant="tertiary" onClick={onBack} disabled={isSubmitting}>
          <ChevronLeftIcon size={18} />
          Tilbake
        </Button>
        <Button
          type="button"
          variant="primary"
          data-color="accent"
          data-size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sender booking...' : config.rules.requireApproval ? 'Send forespørsel' : 'Bekreft booking'}
        </Button>
      </div>

      {config.rules.requireApproval && (
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Denne bookingen krever godkjenning. Du vil motta svar på e-post.
        </Paragraph>
      )}
    </div>
  );
}

/**
 * Price Summary Component
 */
function PriceSummary({ priceCalculation }: { priceCalculation: BookingPriceCalculation }): React.ReactElement {
  return (
    <div className="price-summary">
      {priceCalculation.items.map(item => (
        <div key={item.id} className={cn('price-row', item.type)}>
          <span className="price-label">{item.label}</span>
          <span className="price-value">
            {item.type === 'discount' ? '-' : ''}
            {formatPrice(item.total, priceCalculation.currency)}
          </span>
        </div>
      ))}
      {priceCalculation.vat > 0 && (
        <div className="price-row vat">
          <span className="price-label">MVA</span>
          <span className="price-value">{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
        </div>
      )}
      <div className="price-row total">
        <span className="price-label">Totalt</span>
        <span className="price-value">{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get label for booking mode
 */
function getModeLabel(mode: BookingMode): string {
  const labels: Record<BookingMode, string> = {
    slots: 'Velg tidspunkt',
    daily: 'Velg dato',
    dateRange: 'Velg periode',
    event: 'Velg billetter',
    recurring: 'Velg sesong',
    instant: 'Bestill nå',
  };
  return labels[mode];
}

/**
 * Get description for booking mode
 */
function getModeDescription(mode: BookingMode): string {
  const descriptions: Record<BookingMode, string> = {
    slots: 'Klikk på ledige tidspunkter i kalenderen',
    daily: 'Velg en eller flere dager i kalenderen',
    dateRange: 'Velg start- og sluttdato for din booking',
    event: 'Velg antall billetter eller deltakere',
    recurring: 'Sett opp ukentlig gjentakende booking',
    instant: 'Fullfør din bestilling direkte',
  };
  return descriptions[mode];
}

/**
 * UnifiedBookingEngine component
 */
export function UnifiedBookingEngine({
  config,
  listingName,
  listingImage,
  availableSlots = [],
  dayAvailability = [],
  additionalServices = [],
  currentStep: controlledStep,
  onStepChange,
  onSubmit,
  onSelectionChange,
  className,
}: UnifiedBookingEngineProps): React.ReactElement {
  // Steps
  const steps = React.useMemo(() => getBookingSteps(config.mode, false), [config.mode]);

  // Internal step state
  const [internalStep, setInternalStep] = React.useState(0);
  const currentStep = controlledStep ?? internalStep;

  // Selection state
  const [selection, setSelection] = React.useState<BookingSelection>({
    slots: [],
  });

  // Calendar state
  const [calendarDate, setCalendarDate] = React.useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Form state
  const [formData, setFormData] = React.useState<Partial<BookingFormData>>({
    numberOfPeople: 1,
    additionalServices: [],
    showPurposeInCalendar: false,
    acceptedTerms: false,
    acceptedCancellationPolicy: false,
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Calculate price
  const priceCalculation = React.useMemo((): BookingPriceCalculation => {
    const items: PriceItem[] = [];
    let subtotal = 0;

    // Base price calculation
    if (config.mode === 'slots' && selection.slots.length > 0) {
      const hours = selection.slots.length * (config.slotDurationMinutes || 60) / 60;
      const baseTotal = hours * config.pricing.basePrice;
      items.push({
        id: 'base',
        label: `${hours} ${formatPriceUnit(config.pricing.unit)}${hours !== 1 ? 'r' : ''}`,
        quantity: hours,
        unitPrice: config.pricing.basePrice,
        total: baseTotal,
        type: 'base',
      });
      subtotal += baseTotal;
    } else if (config.mode === 'event' && selection.tickets) {
      const ticketTotal = selection.tickets * config.pricing.basePrice;
      items.push({
        id: 'tickets',
        label: `${selection.tickets} billett${selection.tickets !== 1 ? 'er' : ''}`,
        quantity: selection.tickets,
        unitPrice: config.pricing.basePrice,
        total: ticketTotal,
        type: 'base',
      });
      subtotal += ticketTotal;
    } else if (config.mode === 'dateRange' && selection.dateRange) {
      const days = Math.ceil(
        (selection.dateRange.end.getTime() - selection.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      const rangeTotal = days * config.pricing.basePrice;
      items.push({
        id: 'range',
        label: `${days} ${formatPriceUnit(config.pricing.unit)}${days !== 1 ? 'er' : ''}`,
        quantity: days,
        unitPrice: config.pricing.basePrice,
        total: rangeTotal,
        type: 'base',
      });
      subtotal += rangeTotal;
    }

    // Additional services
    formData.additionalServices?.forEach(serviceId => {
      const service = additionalServices.find(s => s.id === serviceId);
      if (service) {
        items.push({
          id: service.id,
          label: service.name,
          total: service.price,
          type: 'service',
        });
        subtotal += service.price;
      }
    });

    // Fees
    if (config.pricing.setupFee) {
      items.push({
        id: 'setup',
        label: 'Oppstartsavgift',
        total: config.pricing.setupFee,
        type: 'fee',
      });
      subtotal += config.pricing.setupFee;
    }

    if (config.pricing.cleaningFee) {
      items.push({
        id: 'cleaning',
        label: 'Rengjøringsavgift',
        total: config.pricing.cleaningFee,
        type: 'fee',
      });
      subtotal += config.pricing.cleaningFee;
    }

    // VAT
    const vatRate = config.pricing.vatPercentage || 0;
    const vat = subtotal * (vatRate / 100);

    return {
      items,
      subtotal,
      discount: 0,
      vat,
      total: subtotal + vat,
      currency: config.pricing.currency,
    };
  }, [selection, formData.additionalServices, config, additionalServices]);

  // Handle step change
  const handleStepChange = (step: number) => {
    if (onStepChange) {
      onStepChange(step);
    } else {
      setInternalStep(step);
    }
  };

  // Handle slot selection
  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (slot.status !== 'available' && slot.status !== 'selected') return;

    setSelection(prev => {
      const isSelected = prev.slots.some(s => s.id === slot.id);
      const newSlots = isSelected
        ? prev.slots.filter(s => s.id !== slot.id)
        : [...prev.slots, { ...slot, status: 'selected' as const }];

      const newSelection = { ...prev, slots: newSlots };
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle week navigation
  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  // Handle month navigation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Handle day selection (for daily mode)
  const handleDaySelect = (date: Date) => {
    setSelection(prev => {
      // Check if date is already selected
      const isSelected = prev.slots.some(
        s => new Date(s.date).toDateString() === date.toDateString()
      );

      let newSlots: AvailabilitySlot[];
      if (isSelected) {
        newSlots = prev.slots.filter(
          s => new Date(s.date).toDateString() !== date.toDateString()
        );
      } else {
        newSlots = [
          ...prev.slots,
          {
            id: `day-${date.toISOString()}`,
            date,
            startTime: '00:00',
            endTime: '23:59',
            status: 'selected',
          },
        ];
      }

      const newSelection = { ...prev, slots: newSlots };
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle date range selection
  const handleDateRangeSelect = (start: Date, end: Date | null) => {
    setSelection(prev => {
      const newSelection: BookingSelection = {
        slots: [], // Clear slots for range mode
      };
      if (prev.tickets !== undefined) {
        newSelection.tickets = prev.tickets;
      }
      if (prev.recurring !== undefined) {
        newSelection.recurring = prev.recurring;
      }
      if (end) {
        newSelection.dateRange = { start, end };
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle ticket change (for event mode)
  const handleTicketChange = (tickets: number) => {
    setSelection(prev => {
      const newSelection = { ...prev, tickets };
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle recurring pattern change
  const handleRecurringChange = (pattern: BookingSelection['recurring']) => {
    setSelection(prev => {
      const newSelection: BookingSelection = {
        slots: prev.slots,
      };
      if (prev.dateRange !== undefined) {
        newSelection.dateRange = prev.dateRange;
      }
      if (prev.tickets !== undefined) {
        newSelection.tickets = prev.tickets;
      }
      if (pattern) {
        newSelection.recurring = pattern;
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle form data change
  const handleFormChange = (field: keyof BookingFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get week dates
  const weekDates = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(calendarDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [calendarDate]);

  // Group slots by date
  const slotsByDate = React.useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();
    availableSlots.forEach(slot => {
      const dateKey = new Date(slot.date).toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, slot]);
    });
    return grouped;
  }, [availableSlots]);

  // Format date range
  const formatDateRange = (start: Date): string => {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString('nb-NO', { month: 'long' });
    const year = start.getFullYear();
    return `${startDay}. - ${endDay}. ${month} ${year}`;
  };

  // Day names
  const dayNames = ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'];

  // Is slot selected
  const isSlotSelected = (slot: AvailabilitySlot) => {
    return selection.slots.some(s => s.id === slot.id);
  };

  // Can continue to next step
  const canContinue = React.useMemo((): boolean => {
    switch (currentStep) {
      case 0: // Selection step
        if (config.mode === 'slots') return selection.slots.length > 0;
        if (config.mode === 'event') return (selection.tickets || 0) > 0;
        if (config.mode === 'dateRange') return !!selection.dateRange;
        if (config.mode === 'recurring') return !!selection.recurring;
        return true;
      case 1: // Form step
        return !!(
          formData.name &&
          formData.email &&
          formData.phone &&
          formData.purpose &&
          formData.acceptedTerms
        );
      default:
        return true;
    }
  }, [currentStep, selection, formData, config.mode]);

  // Handle continue
  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(selection, formData as BookingFormData);
      handleStepChange(steps.length - 1); // Go to success step
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Noe gikk galt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toDateString();

  return (
    <div className={cn('unified-booking-engine', className)}>
      {/* Main Card */}
      <div className="booking-engine-card">
        {/* Header */}
        <div className="booking-engine-header">
          <div className="header-content">
            <div className="header-badge">
              <span className="badge-label">{config.listingType}</span>
            </div>
            <Heading level={2} data-size="lg" style={{ margin: 0 }}>
              {listingName}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {getModeDescription(config.mode)}
            </Paragraph>
          </div>
          <div className="header-price">
            <span className="price-from">fra</span>
            <span className="price-amount">{formatPrice(config.pricing.basePrice, config.pricing.currency)}</span>
            <span className="price-unit">/{formatPriceUnit(config.pricing.unit)}</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="booking-engine-stepper">
          <div className="stepper-track">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isFuture = index > currentStep;
              const StepIcon = stepIconMap[step.icon] || CalendarStepIcon;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      'stepper-item',
                      isCompleted && 'completed',
                      isActive && 'active',
                      isFuture && 'future'
                    )}
                    onClick={() => isCompleted && handleStepChange(index)}
                    role={isCompleted ? 'button' : undefined}
                    tabIndex={isCompleted ? 0 : undefined}
                  >
                    <div className="stepper-icon">
                      {isCompleted ? <CheckIcon size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className="stepper-label">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn('stepper-connector', isCompleted && 'completed')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="stepper-progress">
            Steg {currentStep + 1} av {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="booking-engine-content">
          {/* Step 0: Selection */}
          {currentStep === 0 && config.mode === 'slots' && (
            <div className="selection-view">
              {/* Calendar Panel */}
              <div className="calendar-panel">
                {/* Calendar Header */}
                <div className="calendar-panel-header">
                  <div className="calendar-title">
                    <CalendarIcon size={20} />
                    <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                      {getModeLabel(config.mode)}
                    </Heading>
                  </div>
                  <div className="calendar-navigation">
                    <button type="button" className="nav-button" onClick={() => handleWeekChange('prev')} aria-label="Forrige uke">
                      <ChevronLeftIcon size={20} />
                    </button>
                    <span className="nav-date">{formatDateRange(calendarDate)}</span>
                    <button type="button" className="nav-button" onClick={() => handleWeekChange('next')} aria-label="Neste uke">
                      <ChevronRightIcon size={20} />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid-wrapper">
                  <div className="calendar-grid">
                    {/* Header Row */}
                    <div className="grid-row header-row">
                      <div className="time-cell">Tid</div>
                      {weekDates.map((date, i) => {
                        const isToday = date.toDateString() === today;
                        return (
                          <div key={i} className={cn('day-cell', isToday && 'today')}>
                            <span className="day-name">{dayNames[i]}</span>
                            <span className="day-number">{date.getDate()}</span>
                            {isToday && <span className="today-indicator">I dag</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Time Rows */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = 8 + i;
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

                      return (
                        <div key={hour} className="grid-row">
                          <div className="time-cell">{timeStr}</div>
                          {weekDates.map((date, dayIndex) => {
                            const dateKey = date.toDateString();
                            const daySlots = slotsByDate.get(dateKey) || [];
                            const slot = daySlots.find(s => s.startTime === timeStr);

                            if (!slot) {
                              return <div key={dayIndex} className="slot-cell unavailable" />;
                            }

                            const selected = isSlotSelected(slot);
                            const status = selected ? 'selected' : slot.status;

                            return (
                              <div
                                key={dayIndex}
                                className={cn('slot-cell', status)}
                                onClick={() => handleSlotClick(slot)}
                                role={slot.status === 'available' ? 'button' : undefined}
                                tabIndex={slot.status === 'available' ? 0 : undefined}
                              >
                                <span className="slot-time">{timeStr}</span>
                                {selected && <CheckIcon size={12} className="slot-check" />}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-dot available" />
                    <span>Ledig</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot selected" />
                    <span>Valgt</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot occupied" />
                    <span>Opptatt</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot blocked" />
                    <span>Utilgjengelig</span>
                  </div>
                </div>
              </div>

              {/* Selection Summary Panel */}
              <div className="summary-panel">
                <div className="summary-header">
                  <ClockIcon size={20} />
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    Din booking
                  </Heading>
                </div>

                {selection.slots.length === 0 ? (
                  <div className="summary-empty">
                    <div className="empty-illustration">
                      <CalendarIcon size={40} />
                    </div>
                    <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Velg tidspunkter fra kalenderen for å starte bookingen
                    </Paragraph>
                  </div>
                ) : (
                  <>
                    {/* Selected Slots List */}
                    <div className="selected-slots-list">
                      {selection.slots
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((slot, index) => (
                          <div
                            key={slot.id}
                            className="selected-slot-item"
                            style={{ animationDelay: `${index * 40}ms` }}
                          >
                            <div className="slot-info">
                              <span className="slot-date">
                                {new Date(slot.date).toLocaleDateString('nb-NO', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <span className="slot-time-range">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="slot-remove"
                              onClick={() => handleSlotClick(slot)}
                              aria-label="Fjern"
                            >
                              <CloseIcon size={14} />
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Price Summary */}
                    <div className="price-summary">
                      {priceCalculation.items.map(item => (
                        <div key={item.id} className={cn('price-row', item.type)}>
                          <span className="price-label">{item.label}</span>
                          <span className="price-value">
                            {item.type === 'discount' ? '-' : ''}
                            {formatPrice(item.total, priceCalculation.currency)}
                          </span>
                        </div>
                      ))}
                      {priceCalculation.vat > 0 && (
                        <div className="price-row vat">
                          <span className="price-label">MVA ({config.pricing.vatPercentage}%)</span>
                          <span className="price-value">{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
                        </div>
                      )}
                      <div className="price-row total">
                        <span className="price-label">Totalt</span>
                        <span className="price-value">{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="summary-actions">
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                        onClick={() => setSelection({ slots: [] })}
                      >
                        Tøm valg
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        data-color="accent"
                        onClick={handleContinue}
                        disabled={!canContinue}
                      >
                        Fortsett
                        <ChevronRightIcon size={18} />
                      </Button>
                    </div>
                  </>
                )}

                {/* Tips Section */}
                <div className="tips-section">
                  <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <InfoIcon size={14} />
                    Tips
                  </Heading>
                  <ul className="tips-list">
                    <li>Klikk på ledige tidspunkter for å velge</li>
                    <li>Du kan velge flere tidspunkter</li>
                    <li>Minimum {config.rules.minLeadTimeHours}t forvarsel</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 0: Daily Mode Selection */}
          {currentStep === 0 && config.mode === 'daily' && (
            <DailyModeView
              calendarDate={calendarDate}
              dayAvailability={dayAvailability}
              selection={selection}
              onDateSelect={handleDaySelect}
              onMonthChange={handleMonthChange}
              formatPrice={formatPrice}
              currency={config.pricing.currency}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Date Range Mode Selection */}
          {currentStep === 0 && config.mode === 'dateRange' && (
            <DateRangeModeView
              calendarDate={calendarDate}
              dayAvailability={dayAvailability}
              selection={selection}
              onRangeSelect={handleDateRangeSelect}
              onMonthChange={handleMonthChange}
              formatPrice={formatPrice}
              currency={config.pricing.currency}
              pricing={config.pricing}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Event Mode Selection */}
          {currentStep === 0 && config.mode === 'event' && (
            <EventModeView
              config={config}
              selection={selection}
              onTicketChange={handleTicketChange}
              formatPrice={formatPrice}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Recurring Mode Selection */}
          {currentStep === 0 && config.mode === 'recurring' && (
            <RecurringModeView
              config={config}
              selection={selection}
              onRecurringChange={handleRecurringChange}
              formatPrice={formatPrice}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Instant Mode (skip to form) */}
          {currentStep === 0 && config.mode === 'instant' && (
            <InstantModeView
              config={config}
              formatPrice={formatPrice}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
            />
          )}

          {/* Step 1: Booking Form */}
          {currentStep === 1 && (
            <BookingFormStep
              formData={formData}
              config={config}
              additionalServices={additionalServices}
              onFormChange={handleFormChange}
              onBack={handleBack}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && (
            <BookingConfirmStep
              selection={selection}
              formData={formData as BookingFormData}
              config={config}
              listingName={listingName}
              {...(listingImage ? { listingImage } : {})}
              priceCalculation={priceCalculation}
              additionalServices={additionalServices}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}

          {/* Success Step */}
          {currentStep === steps.length - 1 && (
            <div className="success-view">
              <div className="success-icon">
                <SuccessStepIcon size={48} />
              </div>
              <Heading level={2} data-size="lg" style={{ margin: 0, textAlign: 'center' }}>
                Booking sendt!
              </Heading>
              <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Du vil motta en bekreftelse på e-post.
              </Paragraph>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .unified-booking-engine {
          --ube-radius: var(--ds-border-radius-xl);
          --ube-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .booking-engine-card {
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ube-radius);
          border: 1px solid var(--ds-color-neutral-border-subtle);
          box-shadow: var(--ube-shadow);
          overflow: hidden;
        }

        /* Header */
        .booking-engine-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--ds-spacing-6);
          background: linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, transparent 100%);
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .header-badge {
          display: inline-flex;
          margin-bottom: var(--ds-spacing-2);
        }

        .badge-label {
          font-size: var(--ds-font-size-xs);
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-accent-text-default);
          background: var(--ds-color-accent-surface-default);
          padding: var(--ds-spacing-1) var(--ds-spacing-2);
          border-radius: var(--ds-border-radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .header-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: var(--ds-spacing-3) var(--ds-spacing-4);
          background: var(--ds-color-accent-base-default);
          border-radius: var(--ds-border-radius-lg);
          color: var(--ds-color-accent-contrast-default);
        }

        .price-from {
          font-size: var(--ds-font-size-xs);
          opacity: 0.8;
        }

        .price-amount {
          font-size: var(--ds-font-size-xl);
          font-weight: var(--ds-font-weight-bold);
          line-height: 1.2;
        }

        .price-unit {
          font-size: var(--ds-font-size-sm);
          opacity: 0.9;
        }

        /* Stepper */
        .booking-engine-stepper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--ds-spacing-4) var(--ds-spacing-6);
          background: var(--ds-color-neutral-surface-default);
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .stepper-track {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .stepper-item {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          padding: var(--ds-spacing-2);
          border-radius: var(--ds-border-radius-md);
          transition: all 0.2s ease;
        }

        .stepper-item.completed {
          cursor: pointer;
        }

        .stepper-item.completed:hover {
          background: var(--ds-color-success-surface-hover);
        }

        .stepper-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--ds-border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .stepper-item.future .stepper-icon {
          background: var(--ds-color-neutral-surface-default);
          border: 2px solid var(--ds-color-neutral-border-subtle);
          color: var(--ds-color-neutral-text-subtle);
        }

        .stepper-item.active .stepper-icon {
          background: var(--ds-color-accent-base-default);
          color: var(--ds-color-accent-contrast-default);
          box-shadow: 0 0 0 4px var(--ds-color-accent-surface-default);
        }

        .stepper-item.completed .stepper-icon {
          background: var(--ds-color-success-surface-default);
          border: 2px solid var(--ds-color-success-border-subtle);
          color: var(--ds-color-success-base-default);
        }

        .stepper-label {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          white-space: nowrap;
        }

        .stepper-item.future .stepper-label {
          color: var(--ds-color-neutral-text-subtle);
        }

        .stepper-item.active .stepper-label {
          color: var(--ds-color-accent-text-default);
        }

        .stepper-item.completed .stepper-label {
          color: var(--ds-color-success-text-default);
        }

        .stepper-connector {
          flex: 1;
          height: 2px;
          background: var(--ds-color-neutral-border-subtle);
          margin: 0 var(--ds-spacing-2);
          min-width: 16px;
          transition: background 0.3s ease;
        }

        .stepper-connector.completed {
          background: var(--ds-color-success-border-default);
        }

        .stepper-progress {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
          padding: var(--ds-spacing-2) var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-full);
          white-space: nowrap;
        }

        /* Content */
        .booking-engine-content {
          min-height: 500px;
        }

        /* Selection View */
        .selection-view {
          display: grid;
          grid-template-columns: 1fr 340px;
        }

        /* Calendar Panel */
        .calendar-panel {
          padding: var(--ds-spacing-5);
          border-right: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .calendar-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--ds-spacing-4);
          flex-wrap: wrap;
          gap: var(--ds-spacing-3);
        }

        .calendar-title {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          color: var(--ds-color-accent-base-default);
        }

        .calendar-navigation {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
        }

        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--ds-color-neutral-border-default);
          border-radius: var(--ds-border-radius-md);
          background: var(--ds-color-neutral-background-default);
          color: var(--ds-color-neutral-text-default);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background: var(--ds-color-neutral-surface-hover);
          border-color: var(--ds-color-accent-border-default);
          color: var(--ds-color-accent-base-default);
        }

        .nav-date {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-semibold);
          min-width: 180px;
          text-align: center;
        }

        /* Calendar Grid */
        .calendar-grid-wrapper {
          overflow-x: auto;
          margin: 0 calc(-1 * var(--ds-spacing-5));
          padding: 0 var(--ds-spacing-5);
        }

        .calendar-grid {
          border: 1px solid var(--ds-color-neutral-border-subtle);
          border-radius: var(--ds-border-radius-lg);
          overflow: hidden;
          min-width: 600px;
        }

        .grid-row {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
        }

        .grid-row.header-row {
          background: var(--ds-color-neutral-surface-default);
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .grid-row:not(.header-row):not(:last-child) {
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .time-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--ds-spacing-2);
          font-size: var(--ds-font-size-xs);
          font-weight: var(--ds-font-weight-medium);
          color: var(--ds-color-neutral-text-subtle);
          background: var(--ds-color-neutral-surface-default);
          border-right: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .day-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--ds-spacing-2) var(--ds-spacing-1);
          gap: 2px;
        }

        .day-cell.today {
          background: var(--ds-color-accent-surface-default);
        }

        .day-name {
          font-size: 10px;
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-neutral-text-subtle);
          letter-spacing: 0.05em;
        }

        .day-number {
          font-size: var(--ds-font-size-md);
          font-weight: var(--ds-font-weight-bold);
          color: var(--ds-color-neutral-text-default);
        }

        .today-indicator {
          font-size: 9px;
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-accent-text-default);
          text-transform: uppercase;
        }

        /* Slot Cells */
        .slot-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          border-right: 1px solid var(--ds-color-neutral-border-subtle);
          position: relative;
          transition: all 0.15s ease;
        }

        .slot-cell:last-child {
          border-right: none;
        }

        .slot-cell.available {
          background: var(--ds-color-success-surface-default);
          cursor: pointer;
        }

        .slot-cell.available:hover {
          background: var(--ds-color-success-surface-hover);
          transform: scale(1.02);
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .slot-cell.selected {
          background: var(--ds-color-accent-base-default);
          color: var(--ds-color-accent-contrast-default);
          cursor: pointer;
        }

        .slot-cell.selected:hover {
          background: var(--ds-color-accent-base-hover);
        }

        .slot-cell.occupied {
          background: var(--ds-color-danger-surface-default);
        }

        .slot-cell.blocked,
        .slot-cell.unavailable {
          background: var(--ds-color-neutral-surface-default);
        }

        .slot-time {
          font-size: var(--ds-font-size-xs);
          font-weight: var(--ds-font-weight-medium);
        }

        .slot-cell.available .slot-time {
          color: var(--ds-color-success-text-default);
        }

        .slot-cell.occupied .slot-time {
          color: var(--ds-color-danger-text-default);
        }

        .slot-check {
          position: absolute;
          top: 2px;
          right: 2px;
        }

        /* Legend */
        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: var(--ds-spacing-5);
          margin-top: var(--ds-spacing-4);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: var(--ds-border-radius-sm);
        }

        .legend-dot.available {
          background: var(--ds-color-success-surface-default);
          border: 1px solid var(--ds-color-success-border-subtle);
        }

        .legend-dot.selected {
          background: var(--ds-color-accent-base-default);
        }

        .legend-dot.occupied {
          background: var(--ds-color-danger-surface-default);
          border: 1px solid var(--ds-color-danger-border-subtle);
        }

        .legend-dot.blocked {
          background: var(--ds-color-neutral-surface-default);
          border: 1px solid var(--ds-color-neutral-border-subtle);
        }

        /* Summary Panel */
        .summary-panel {
          padding: var(--ds-spacing-5);
          background: var(--ds-color-neutral-surface-default);
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-4);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-3);
          color: var(--ds-color-accent-base-default);
        }

        .summary-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--ds-spacing-8) var(--ds-spacing-4);
          gap: var(--ds-spacing-4);
        }

        .empty-illustration {
          width: 72px;
          height: 72px;
          border-radius: var(--ds-border-radius-full);
          background: var(--ds-color-neutral-background-default);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ds-color-neutral-text-subtle);
        }

        /* Selected Slots List */
        .selected-slots-list {
          flex: 1;
          overflow-y: auto;
          max-height: 240px;
        }

        .selected-slot-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
          margin-bottom: var(--ds-spacing-2);
          animation: slideIn 0.2s ease-out forwards;
          opacity: 0;
          transform: translateX(-10px);
        }

        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .slot-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .slot-date {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          text-transform: capitalize;
        }

        .slot-time-range {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .slot-remove {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: var(--ds-border-radius-full);
          background: transparent;
          color: var(--ds-color-neutral-text-subtle);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .slot-remove:hover {
          background: var(--ds-color-danger-surface-default);
          color: var(--ds-color-danger-base-default);
        }

        /* Price Summary */
        .price-summary {
          padding: var(--ds-spacing-4);
          background: var(--ds-color-accent-surface-default);
          border-radius: var(--ds-border-radius-md);
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
          padding: var(--ds-spacing-1) 0;
        }

        .price-row.discount .price-value {
          color: var(--ds-color-success-text-default);
        }

        .price-row.total {
          margin-top: var(--ds-spacing-2);
          padding-top: var(--ds-spacing-3);
          border-top: 1px solid var(--ds-color-accent-border-subtle);
          font-weight: var(--ds-font-weight-semibold);
        }

        .price-row.total .price-value {
          font-size: var(--ds-font-size-lg);
          color: var(--ds-color-accent-base-default);
        }

        /* Summary Actions */
        .summary-actions {
          display: flex;
          gap: var(--ds-spacing-2);
        }

        .summary-actions button {
          flex: 1;
        }

        .summary-actions button:last-child {
          flex: 2;
        }

        /* Tips Section */
        .tips-section {
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
          border: 1px dashed var(--ds-color-neutral-border-default);
          margin-top: auto;
        }

        .tips-list {
          margin: 0;
          padding-left: var(--ds-spacing-4);
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .tips-list li {
          margin-bottom: var(--ds-spacing-1);
        }

        /* Success View */
        .success-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--ds-spacing-12);
          min-height: 400px;
        }

        .success-icon {
          width: 96px;
          height: 96px;
          border-radius: var(--ds-border-radius-full);
          background: var(--ds-color-success-surface-default);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ds-color-success-base-default);
          margin-bottom: var(--ds-spacing-6);
          animation: bounceIn 0.5s ease-out;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        /* Form & Confirm Views */
        .form-view,
        .confirm-view {
          padding: var(--ds-spacing-6);
        }

        /* Responsive */
        @media (max-width: 991px) {
          .selection-view {
            grid-template-columns: 1fr;
          }

          .calendar-panel {
            border-right: none;
            border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
          }

          .summary-panel {
            max-height: 400px;
          }
        }

        @media (max-width: 767px) {
          .booking-engine-header {
            flex-direction: column;
            gap: var(--ds-spacing-4);
          }

          .header-price {
            align-self: flex-start;
          }

          .booking-engine-stepper {
            flex-direction: column;
            gap: var(--ds-spacing-3);
          }

          .stepper-track {
            flex-wrap: wrap;
            justify-content: center;
          }

          .stepper-label {
            display: none;
          }

          .calendar-panel-header {
            flex-direction: column;
            align-items: stretch;
          }

          .calendar-navigation {
            justify-content: center;
          }
        }

        /* ============================================ */
        /* Daily Mode Styles */
        /* ============================================ */
        .daily-mode .month-calendar,
        .range-mode .month-calendar {
          background: var(--ds-color-neutral-background-default);
          border: 1px solid var(--ds-color-neutral-border-subtle);
          border-radius: var(--ds-border-radius-lg);
          padding: var(--ds-spacing-4);
        }

        .month-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--ds-spacing-1);
          margin-bottom: var(--ds-spacing-2);
        }

        .month-day-name {
          text-align: center;
          font-size: var(--ds-font-size-xs);
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-neutral-text-subtle);
          padding: var(--ds-spacing-2);
        }

        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--ds-spacing-1);
        }

        .month-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: var(--ds-border-radius-md);
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          min-height: 48px;
          font-family: inherit;
        }

        .month-day.empty {
          cursor: default;
        }

        .month-day.available:hover {
          background: var(--ds-color-accent-surface-hover);
        }

        .month-day.past {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .month-day.today {
          background: var(--ds-color-accent-surface-default);
        }

        .month-day.today .day-number {
          color: var(--ds-color-accent-base-default);
          font-weight: var(--ds-font-weight-bold);
        }

        .month-day.selected {
          background: var(--ds-color-accent-base-default);
        }

        .month-day.selected .day-number {
          color: var(--ds-color-accent-contrast-default);
        }

        .month-day.selected .day-price {
          display: none;
        }

        .month-day .day-number {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
        }

        .month-day .day-price {
          font-size: 9px;
          color: var(--ds-color-success-text-default);
          margin-top: 2px;
        }

        .month-day .day-check {
          position: absolute;
          top: 4px;
          right: 4px;
          color: var(--ds-color-accent-contrast-default);
        }

        /* ============================================ */
        /* Date Range Mode Styles */
        /* ============================================ */
        .range-hint {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          padding: var(--ds-spacing-3);
          background: var(--ds-color-info-surface-default);
          border-radius: var(--ds-border-radius-md);
          margin-bottom: var(--ds-spacing-4);
          color: var(--ds-color-info-text-default);
        }

        .range-grid .month-day.in-range {
          background: var(--ds-color-accent-surface-default);
        }

        .range-grid .month-day.range-start,
        .range-grid .month-day.range-end {
          background: var(--ds-color-accent-base-default);
        }

        .range-grid .month-day.range-start .day-number,
        .range-grid .month-day.range-end .day-number {
          color: var(--ds-color-accent-contrast-default);
        }

        .range-grid .month-day.range-start {
          border-radius: var(--ds-border-radius-md) 0 0 var(--ds-border-radius-md);
        }

        .range-grid .month-day.range-end {
          border-radius: 0 var(--ds-border-radius-md) var(--ds-border-radius-md) 0;
        }

        .range-grid .month-day.range-start.range-end {
          border-radius: var(--ds-border-radius-md);
        }

        .range-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--ds-spacing-4);
          padding: var(--ds-spacing-4);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
        }

        .range-date-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--ds-spacing-1);
        }

        .range-label {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .range-date {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-semibold);
        }

        .range-arrow {
          font-size: var(--ds-font-size-lg);
          color: var(--ds-color-neutral-text-subtle);
        }

        .range-info {
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
          padding: var(--ds-spacing-1) 0;
        }

        .info-value {
          font-weight: var(--ds-font-weight-semibold);
        }

        /* ============================================ */
        /* Event Mode Styles */
        /* ============================================ */
        .event-mode {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
        }

        .event-panel {
          padding: var(--ds-spacing-8);
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-4);
        }

        .event-badge {
          display: inline-flex;
          padding: var(--ds-spacing-1) var(--ds-spacing-3);
          background: var(--ds-color-brand1-surface-default);
          color: var(--ds-color-brand1-text-default);
          font-size: var(--ds-font-size-xs);
          font-weight: var(--ds-font-weight-semibold);
          border-radius: var(--ds-border-radius-full);
          letter-spacing: 0.05em;
          width: fit-content;
        }

        .event-date-info {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          color: var(--ds-color-neutral-text-subtle);
          font-size: var(--ds-font-size-md);
        }

        .ticket-selector {
          padding: var(--ds-spacing-5);
          background: var(--ds-color-neutral-surface-default);
          border-radius: var(--ds-border-radius-lg);
          border: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .ticket-type {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: var(--ds-spacing-4);
          align-items: center;
        }

        .ticket-info {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-1);
        }

        .ticket-price {
          font-size: var(--ds-font-size-lg);
          font-weight: var(--ds-font-weight-bold);
          color: var(--ds-color-accent-base-default);
        }

        .price-per {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-regular);
          color: var(--ds-color-neutral-text-subtle);
        }

        .ticket-controls {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
        }

        .ticket-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--ds-color-neutral-border-default);
          border-radius: var(--ds-border-radius-md);
          background: var(--ds-color-neutral-background-default);
          font-size: var(--ds-font-size-xl);
          font-weight: var(--ds-font-weight-bold);
          color: var(--ds-color-neutral-text-default);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ticket-btn:hover:not(:disabled) {
          background: var(--ds-color-accent-surface-hover);
          border-color: var(--ds-color-accent-border-default);
          color: var(--ds-color-accent-base-default);
        }

        .ticket-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ticket-count {
          min-width: 48px;
          text-align: center;
          font-size: var(--ds-font-size-xl);
          font-weight: var(--ds-font-weight-bold);
        }

        .ticket-capacity {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          margin-top: var(--ds-spacing-4);
          padding-top: var(--ds-spacing-4);
          border-top: 1px solid var(--ds-color-neutral-border-subtle);
          font-size: var(--ds-font-size-sm);
          color: var(--ds-color-neutral-text-subtle);
        }

        .order-summary {
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
        }

        /* ============================================ */
        /* Recurring Mode Styles */
        /* ============================================ */
        .recurring-mode {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
        }

        .recurring-panel {
          padding: var(--ds-spacing-6);
        }

        .recurring-section {
          margin-bottom: var(--ds-spacing-6);
          padding: var(--ds-spacing-4);
          background: var(--ds-color-neutral-surface-default);
          border-radius: var(--ds-border-radius-lg);
        }

        .weekday-selector {
          display: flex;
          gap: var(--ds-spacing-2);
          flex-wrap: wrap;
        }

        .weekday-btn {
          padding: var(--ds-spacing-2) var(--ds-spacing-3);
          border: 1px solid var(--ds-color-neutral-border-default);
          border-radius: var(--ds-border-radius-md);
          background: var(--ds-color-neutral-background-default);
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .weekday-btn:hover {
          border-color: var(--ds-color-accent-border-default);
          background: var(--ds-color-accent-surface-default);
        }

        .weekday-btn.selected {
          background: var(--ds-color-accent-base-default);
          border-color: var(--ds-color-accent-base-default);
          color: var(--ds-color-accent-contrast-default);
        }

        .time-selector,
        .date-selector {
          display: flex;
          align-items: flex-end;
          gap: var(--ds-spacing-3);
        }

        .time-input,
        .date-input {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-1);
          flex: 1;
        }

        .time-input label,
        .date-input label {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .time-input select,
        .date-input input {
          padding: var(--ds-spacing-2) var(--ds-spacing-3);
          border: 1px solid var(--ds-color-neutral-border-default);
          border-radius: var(--ds-border-radius-md);
          background: var(--ds-color-neutral-background-default);
          font-size: var(--ds-font-size-sm);
          font-family: inherit;
        }

        .time-separator {
          padding-bottom: var(--ds-spacing-2);
          color: var(--ds-color-neutral-text-subtle);
        }

        .recurring-summary {
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
          padding: var(--ds-spacing-2) 0;
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row.highlight {
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-accent-text-default);
        }

        /* ============================================ */
        /* Instant Mode Styles */
        /* ============================================ */
        .instant-mode {
          display: flex;
          justify-content: center;
        }

        .instant-panel {
          padding: var(--ds-spacing-12);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--ds-spacing-4);
          max-width: 500px;
          text-align: center;
        }

        .instant-icon {
          width: 96px;
          height: 96px;
          border-radius: var(--ds-border-radius-full);
          background: linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-brand1-surface-default) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ds-color-accent-base-default);
        }

        .instant-price-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--ds-spacing-5);
          background: var(--ds-color-neutral-surface-default);
          border-radius: var(--ds-border-radius-lg);
          margin: var(--ds-spacing-4) 0;
          width: 100%;
        }

        .instant-price-label {
          font-size: var(--ds-font-size-sm);
          color: var(--ds-color-neutral-text-subtle);
        }

        .instant-price-amount {
          font-size: var(--ds-font-size-2xl);
          font-weight: var(--ds-font-weight-bold);
          color: var(--ds-color-accent-base-default);
        }

        .instant-price-unit {
          font-size: var(--ds-font-size-sm);
          color: var(--ds-color-neutral-text-subtle);
        }

        /* ============================================ */
        /* Form Step Styles */
        /* ============================================ */
        .form-view {
          padding: var(--ds-spacing-6);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--ds-spacing-6);
        }

        .form-section {
          padding: var(--ds-spacing-5);
          background: var(--ds-color-neutral-surface-default);
          border-radius: var(--ds-border-radius-lg);
        }

        .form-section.services-section,
        .form-section.terms-section {
          grid-column: span 2;
        }

        .form-group {
          margin-bottom: var(--ds-spacing-4);
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: var(--ds-spacing-1);
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          color: var(--ds-color-neutral-text-default);
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="tel"],
        .form-group input[type="number"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: var(--ds-spacing-3);
          border: 1px solid var(--ds-color-neutral-border-default);
          border-radius: var(--ds-border-radius-md);
          background: var(--ds-color-neutral-background-default);
          font-size: var(--ds-font-size-sm);
          font-family: inherit;
          transition: border-color 0.15s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--ds-color-accent-border-default);
          box-shadow: 0 0 0 3px var(--ds-color-focus-outer);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--ds-spacing-4);
        }

        .checkbox-group label {
          display: flex;
          align-items: flex-start;
          gap: var(--ds-spacing-2);
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-top: 2px;
          accent-color: var(--ds-color-accent-base-default);
        }

        .checkbox-group span {
          font-size: var(--ds-font-size-sm);
        }

        .checkbox-group a {
          color: var(--ds-color-accent-text-default);
          text-decoration: underline;
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-2);
        }

        .service-item {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-3);
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .service-item:hover {
          background: var(--ds-color-neutral-surface-hover);
        }

        .service-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: var(--ds-color-accent-base-default);
        }

        .service-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .service-name {
          font-weight: var(--ds-font-weight-medium);
        }

        .service-desc {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .service-price {
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-accent-text-default);
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: var(--ds-spacing-6);
          padding-top: var(--ds-spacing-6);
          border-top: 1px solid var(--ds-color-neutral-border-subtle);
        }

        /* ============================================ */
        /* Confirm Step Styles */
        /* ============================================ */
        .confirm-view {
          padding: var(--ds-spacing-6);
        }

        .confirm-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: var(--ds-spacing-6);
        }

        .confirm-section {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-4);
        }

        .confirm-section.price-section {
          padding: var(--ds-spacing-5);
          background: var(--ds-color-neutral-surface-default);
          border-radius: var(--ds-border-radius-lg);
          height: fit-content;
          position: sticky;
          top: var(--ds-spacing-6);
        }

        .confirm-card {
          padding: var(--ds-spacing-4);
          background: var(--ds-color-neutral-surface-default);
          border-radius: var(--ds-border-radius-md);
        }

        .confirm-card.listing-card {
          display: flex;
          gap: var(--ds-spacing-4);
          align-items: center;
        }

        .listing-image {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: var(--ds-border-radius-sm);
        }

        .listing-info {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-1);
        }

        .listing-type {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .time-list {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-2);
        }

        .time-item {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
          padding: var(--ds-spacing-2);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-sm);
        }

        .more-times {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
          text-align: center;
          padding: var(--ds-spacing-2);
        }

        .date-range-display,
        .tickets-display {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-1);
          font-size: var(--ds-font-size-sm);
        }

        .event-date {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .contact-summary p {
          margin: 0;
          padding: var(--ds-spacing-1) 0;
          font-size: var(--ds-font-size-sm);
        }

        .contact-summary p:first-child {
          padding-top: 0;
        }

        .details-summary {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-2);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
        }

        .detail-row span:first-child {
          color: var(--ds-color-neutral-text-subtle);
        }

        .price-breakdown {
          margin-bottom: var(--ds-spacing-4);
        }

        .policy-notice {
          display: flex;
          gap: var(--ds-spacing-3);
          padding: var(--ds-spacing-3);
          background: var(--ds-color-info-surface-default);
          border-radius: var(--ds-border-radius-md);
          font-size: var(--ds-font-size-sm);
          color: var(--ds-color-info-text-default);
        }

        .policy-notice strong {
          display: block;
          margin-bottom: var(--ds-spacing-1);
        }

        .policy-notice p {
          margin: 0;
        }

        .confirm-actions {
          display: flex;
          justify-content: space-between;
          margin-top: var(--ds-spacing-6);
          padding-top: var(--ds-spacing-6);
          border-top: 1px solid var(--ds-color-neutral-border-subtle);
        }

        /* Responsive for new modes */
        @media (max-width: 991px) {
          .event-mode,
          .recurring-mode,
          .form-grid,
          .confirm-grid {
            grid-template-columns: 1fr;
          }

          .form-section.services-section,
          .form-section.terms-section {
            grid-column: span 1;
          }

          .confirm-section.price-section {
            position: static;
          }
        }

        @media (max-width: 767px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .ticket-type {
            grid-template-columns: 1fr;
            gap: var(--ds-spacing-3);
          }

          .ticket-controls {
            justify-content: center;
          }

          .weekday-selector {
            justify-content: center;
          }

          .time-selector,
          .date-selector {
            flex-direction: column;
            gap: var(--ds-spacing-2);
          }

          .time-separator {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default UnifiedBookingEngine;
