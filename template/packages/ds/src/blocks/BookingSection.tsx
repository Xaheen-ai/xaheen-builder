/**
 * BookingSection
 *
 * Professional booking section with step-based flow.
 * Combines calendar, stepper, selected slots panel, and CTAs.
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../primitives/icons';
import type { TimeSlot, BookingStep } from '../types/listing-detail';

export interface BookingSectionProps {
  /** Listing name */
  listingName: string;
  /** Base price per hour */
  basePrice?: number;
  /** Currency */
  currency?: string;
  /** Booking steps */
  steps: BookingStep[];
  /** Current step index */
  currentStep: number;
  /** Calendar start date */
  startDate: Date;
  /** Available time slots */
  timeSlots: TimeSlot[];
  /** Selected time slots */
  selectedSlots: TimeSlot[];
  /** Callback when a slot is clicked */
  onSlotClick: (slot: TimeSlot) => void;
  /** Callback when week changes */
  onWeekChange: (direction: 'prev' | 'next') => void;
  /** Callback when step changes */
  onStepChange: (step: number) => void;
  /** Callback to continue to next step */
  onContinue: () => void;
  /** Callback to clear all selections */
  onClearSelection?: () => void;
  /** Custom class name */
  className?: string;
}

// Step icons
function SelectIcon({ size = 20 }: { size?: number }) {
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

function DetailsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ConfirmIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SendIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

const stepIcons = [SelectIcon, DetailsIcon, ConfirmIcon, SendIcon];

/**
 * Format date for display
 */
function formatDateRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = startDate.toLocaleDateString('nb-NO', { month: 'long' });
  const year = startDate.getFullYear();

  return `${startDay}. - ${endDay}. ${month} ${year}`;
}

/**
 * Get day names
 */
function getDayNames(): string[] {
  return ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'];
}

/**
 * BookingSection component
 */
export function BookingSection({
  listingName: _listingName,
  basePrice,
  currency = 'NOK',
  steps,
  currentStep,
  startDate,
  timeSlots,
  selectedSlots,
  onSlotClick,
  onWeekChange,
  onStepChange,
  onContinue,
  onClearSelection,
  className,
}: BookingSectionProps): React.ReactElement {
  // Group time slots by date
  const slotsByDate = React.useMemo(() => {
    const grouped = new Map<string, TimeSlot[]>();
    timeSlots.forEach(slot => {
      const dateKey = new Date(slot.date).toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, slot]);
    });
    return grouped;
  }, [timeSlots]);

  // Get dates for the week
  const weekDates = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [startDate]);

  // Check if a slot is selected
  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlots.some(
      s => new Date(s.date).toDateString() === new Date(slot.date).toDateString() &&
           s.startTime === slot.startTime
    );
  };

  // Calculate total price
  const totalPrice = selectedSlots.length * (basePrice || 0);

  // Get today's date for highlighting
  const today = new Date().toDateString();

  return (
    <div className={cn('booking-section-pro', className)}>
      {/* Main Card */}
      <div className="booking-card">
        {/* Header */}
        <div className="booking-header">
          <div className="booking-header-content">
            <Heading level={2} data-size="lg" style={{ margin: 0 }}>
              Book dette lokalet
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg tidspunkt og fullfør booking i 4 enkle steg
            </Paragraph>
          </div>
          {basePrice && (
            <div className="booking-price-badge">
              <span className="price-amount">{basePrice}</span>
              <span className="price-unit">{currency}/time</span>
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="booking-stepper-container">
          <div className="booking-stepper-pro">
            {steps.map((step, index) => {
              const StepIcon = stepIcons[index] || SelectIcon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isFuture = index > currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      'stepper-step',
                      isCompleted && 'completed',
                      isActive && 'active',
                      isFuture && 'future'
                    )}
                    onClick={() => isCompleted && onStepChange(index)}
                    role={isCompleted ? 'button' : undefined}
                    tabIndex={isCompleted ? 0 : undefined}
                  >
                    <div className="stepper-circle">
                      {isCompleted ? <CheckIcon size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className="stepper-label">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn('stepper-line', isCompleted && 'completed')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="stepper-counter">
            Steg {currentStep + 1} av {steps.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="booking-content">
          {/* Left: Calendar */}
          <div className="calendar-section">
            {/* Calendar Header */}
            <div className="calendar-header">
              <div className="calendar-title">
                <CalendarIcon size={20} />
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Velg tidspunkt
                </Heading>
              </div>
              <div className="calendar-nav">
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => onWeekChange('prev')}
                  aria-label="Forrige uke"
                >
                  <ChevronLeftIcon size={20} />
                </button>
                <span className="date-range">{formatDateRange(startDate)}</span>
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => onWeekChange('next')}
                  aria-label="Neste uke"
                >
                  <ChevronRightIcon size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Info */}
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Klikk på ledige tidspunkter for å velge dem. Du kan velge flere tidspunkter samtidig.
            </Paragraph>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Header Row */}
              <div className="calendar-row header">
                <div className="time-column">Tid</div>
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === today;
                  return (
                    <div key={i} className={cn('day-column', isToday && 'today')}>
                      <span className="day-name">{getDayNames()[i]}</span>
                      <span className="day-number">{date.getDate()}</span>
                      {isToday && <span className="today-badge">I dag</span>}
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              {Array.from({ length: 10 }, (_, hourIndex) => {
                const hour = 8 + hourIndex;
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;

                return (
                  <div key={hour} className="calendar-row">
                    <div className="time-column">{timeStr}</div>
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
                          onClick={() => slot.status === 'available' && onSlotClick(slot)}
                          role={slot.status === 'available' ? 'button' : undefined}
                          tabIndex={slot.status === 'available' ? 0 : undefined}
                          aria-label={`${timeStr} - ${status === 'available' ? 'Ledig' : status === 'selected' ? 'Valgt' : 'Opptatt'}`}
                        >
                          <span className="slot-time">{timeStr}</span>
                          {selected && <CheckIcon size={14} className="slot-check" />}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
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
            </div>
          </div>

          {/* Right: Selection Panel */}
          <div className="selection-panel">
            <div className="selection-header">
              <div className="selection-icon">
                <ClockIcon size={20} />
              </div>
              <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                Valgte tidspunkter
              </Heading>
            </div>

            {selectedSlots.length === 0 ? (
              <div className="selection-empty">
                <div className="empty-icon">
                  <CalendarIcon size={32} />
                </div>
                <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Klikk på ledige tidspunkter i kalenderen for å velge dem.
                </Paragraph>
              </div>
            ) : (
              <>
                <div className="selection-list">
                  {selectedSlots
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime))
                    .map((slot, index) => (
                      <div key={slot.id} className="selection-item" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="item-content">
                          <span className="item-date">
                            {new Date(slot.date).toLocaleDateString('nb-NO', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span className="item-time">kl. {slot.startTime}</span>
                        </div>
                        <button
                          type="button"
                          className="item-remove"
                          onClick={() => onSlotClick(slot)}
                          aria-label="Fjern tidspunkt"
                        >
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Price Summary */}
                {basePrice && (
                  <div className="selection-summary">
                    <div className="summary-row">
                      <span>{selectedSlots.length} time{selectedSlots.length !== 1 ? 'r' : ''}</span>
                      <span>{selectedSlots.length} × {basePrice} {currency}</span>
                    </div>
                    <div className="summary-total">
                      <span>Totalt</span>
                      <span className="total-price">{totalPrice.toLocaleString('nb-NO')} {currency}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="selection-actions">
                  {onClearSelection && (
                    <Button
                      type="button"
                      variant="tertiary"
                      data-size="sm"
                      onClick={onClearSelection}
                    >
                      Tøm valg
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    data-color="accent"
                    onClick={onContinue}
                    style={{ flex: 1 }}
                  >
                    Fortsett
                    <ChevronRightIcon size={18} />
                  </Button>
                </div>
              </>
            )}

            {/* Tips */}
            <div className="selection-tips">
              <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                Tips
              </Heading>
              <ul>
                <li>Klikk på ledige tidspunkter for å velge</li>
                <li>Du kan velge flere tidspunkter samtidig</li>
                <li>Klikk igjen for å fjerne valget</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .booking-section-pro {
          --booking-radius: var(--ds-border-radius-xl);
          --booking-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .booking-card {
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--booking-radius);
          border: 1px solid var(--ds-color-neutral-border-subtle);
          box-shadow: var(--booking-shadow);
          overflow: hidden;
        }

        /* Header */
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--ds-spacing-6);
          background: linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-neutral-background-default) 100%);
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .booking-price-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: var(--ds-spacing-3) var(--ds-spacing-4);
          background: var(--ds-color-accent-base-default);
          border-radius: var(--ds-border-radius-lg);
          color: var(--ds-color-accent-contrast-default);
        }

        .price-amount {
          font-size: var(--ds-font-size-xl);
          font-weight: var(--ds-font-weight-bold);
          line-height: 1;
        }

        .price-unit {
          font-size: var(--ds-font-size-xs);
          opacity: 0.9;
          margin-top: var(--ds-spacing-1);
        }

        /* Stepper */
        .booking-stepper-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--ds-spacing-4) var(--ds-spacing-6);
          background: var(--ds-color-neutral-surface-default);
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .booking-stepper-pro {
          display: flex;
          align-items: center;
          gap: 0;
          flex: 1;
        }

        .stepper-step {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          padding: var(--ds-spacing-2);
          border-radius: var(--ds-border-radius-md);
          transition: all 0.2s ease;
        }

        .stepper-step.completed {
          cursor: pointer;
        }

        .stepper-step.completed:hover {
          background: var(--ds-color-success-surface-hover);
        }

        .stepper-circle {
          width: 36px;
          height: 36px;
          border-radius: var(--ds-border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .stepper-step.future .stepper-circle {
          background: var(--ds-color-neutral-surface-default);
          border: 2px solid var(--ds-color-neutral-border-subtle);
          color: var(--ds-color-neutral-text-subtle);
        }

        .stepper-step.active .stepper-circle {
          background: var(--ds-color-accent-base-default);
          color: var(--ds-color-accent-contrast-default);
          box-shadow: 0 0 0 4px var(--ds-color-accent-surface-default);
        }

        .stepper-step.completed .stepper-circle {
          background: var(--ds-color-success-surface-default);
          border: 2px solid var(--ds-color-success-border-subtle);
          color: var(--ds-color-success-base-default);
        }

        .stepper-label {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          white-space: nowrap;
        }

        .stepper-step.future .stepper-label {
          color: var(--ds-color-neutral-text-subtle);
        }

        .stepper-step.active .stepper-label {
          color: var(--ds-color-accent-text-default);
        }

        .stepper-step.completed .stepper-label {
          color: var(--ds-color-success-text-default);
        }

        .stepper-line {
          flex: 1;
          height: 2px;
          background: var(--ds-color-neutral-border-subtle);
          margin: 0 var(--ds-spacing-2);
          min-width: 20px;
          transition: background 0.3s ease;
        }

        .stepper-line.completed {
          background: var(--ds-color-success-border-default);
        }

        .stepper-counter {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
          padding: var(--ds-spacing-2) var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-full);
          white-space: nowrap;
        }

        /* Content */
        .booking-content {
          display: grid;
          grid-template-columns: 1fr 320px;
          min-height: 500px;
        }

        /* Calendar Section */
        .calendar-section {
          padding: var(--ds-spacing-5);
          border-right: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--ds-spacing-3);
          flex-wrap: wrap;
          gap: var(--ds-spacing-3);
        }

        .calendar-title {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
          color: var(--ds-color-accent-base-default);
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-2);
        }

        .nav-btn {
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

        .nav-btn:hover {
          background: var(--ds-color-neutral-surface-hover);
          border-color: var(--ds-color-accent-border-default);
          color: var(--ds-color-accent-base-default);
        }

        .date-range {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          min-width: 180px;
          text-align: center;
        }

        /* Calendar Grid */
        .calendar-grid {
          border: 1px solid var(--ds-color-neutral-border-subtle);
          border-radius: var(--ds-border-radius-lg);
          overflow: hidden;
        }

        .calendar-row {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
        }

        .calendar-row.header {
          background: var(--ds-color-neutral-surface-default);
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .calendar-row:not(.header):not(:last-child) {
          border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
        }

        .time-column {
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

        .day-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--ds-spacing-2);
          gap: var(--ds-spacing-1);
        }

        .day-column.today {
          background: var(--ds-color-accent-surface-default);
        }

        .day-name {
          font-size: var(--ds-font-size-xs);
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-neutral-text-subtle);
        }

        .day-number {
          font-size: var(--ds-font-size-md);
          font-weight: var(--ds-font-weight-bold);
          color: var(--ds-color-neutral-text-default);
        }

        .today-badge {
          font-size: 9px;
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-accent-text-default);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Slot Cells */
        .slot-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--ds-spacing-2);
          min-height: 40px;
          border-right: 1px solid var(--ds-color-neutral-border-subtle);
          transition: all 0.15s ease;
          position: relative;
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

        .slot-cell.occupied {
          background: var(--ds-color-danger-surface-default);
        }

        .slot-cell.unavailable {
          background: var(--ds-color-neutral-surface-default);
        }

        .slot-cell.selected {
          background: var(--ds-color-accent-base-default);
          color: var(--ds-color-accent-contrast-default);
          cursor: pointer;
        }

        .slot-cell.selected:hover {
          background: var(--ds-color-accent-base-hover);
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
          gap: var(--ds-spacing-5);
          margin-top: var(--ds-spacing-4);
          justify-content: center;
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

        /* Selection Panel */
        .selection-panel {
          padding: var(--ds-spacing-5);
          background: var(--ds-color-neutral-surface-default);
          display: flex;
          flex-direction: column;
        }

        .selection-header {
          display: flex;
          align-items: center;
          gap: var(--ds-spacing-3);
          margin-bottom: var(--ds-spacing-4);
        }

        .selection-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--ds-border-radius-md);
          background: var(--ds-color-accent-surface-default);
          color: var(--ds-color-accent-base-default);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selection-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--ds-spacing-6);
          gap: var(--ds-spacing-3);
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--ds-border-radius-full);
          background: var(--ds-color-neutral-background-default);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ds-color-neutral-text-subtle);
        }

        .selection-list {
          flex: 1;
          overflow-y: auto;
          margin-bottom: var(--ds-spacing-4);
        }

        .selection-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .item-content {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-1);
        }

        .item-date {
          font-size: var(--ds-font-size-sm);
          font-weight: var(--ds-font-weight-medium);
          color: var(--ds-color-neutral-text-default);
          text-transform: capitalize;
        }

        .item-time {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .item-remove {
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

        .item-remove:hover {
          background: var(--ds-color-danger-surface-default);
          color: var(--ds-color-danger-base-default);
        }

        /* Summary */
        .selection-summary {
          padding: var(--ds-spacing-4);
          background: var(--ds-color-accent-surface-default);
          border-radius: var(--ds-border-radius-md);
          margin-bottom: var(--ds-spacing-4);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--ds-font-size-sm);
          color: var(--ds-color-neutral-text-subtle);
          margin-bottom: var(--ds-spacing-2);
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding-top: var(--ds-spacing-2);
          border-top: 1px solid var(--ds-color-accent-border-subtle);
          font-weight: var(--ds-font-weight-semibold);
        }

        .total-price {
          font-size: var(--ds-font-size-lg);
          color: var(--ds-color-accent-base-default);
        }

        /* Actions */
        .selection-actions {
          display: flex;
          gap: var(--ds-spacing-2);
          margin-bottom: var(--ds-spacing-4);
        }

        .selection-actions button {
          transition: all 0.2s ease;
        }

        .selection-actions button:hover {
          transform: translateY(-1px);
        }

        /* Tips */
        .selection-tips {
          padding: var(--ds-spacing-3);
          background: var(--ds-color-neutral-background-default);
          border-radius: var(--ds-border-radius-md);
          border: 1px dashed var(--ds-color-neutral-border-default);
        }

        .selection-tips ul {
          margin: 0;
          padding-left: var(--ds-spacing-4);
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-subtle);
        }

        .selection-tips li {
          margin-bottom: var(--ds-spacing-1);
        }

        .selection-tips li:last-child {
          margin-bottom: 0;
        }

        /* Responsive */
        @media (max-width: 991px) {
          .booking-content {
            grid-template-columns: 1fr;
          }

          .calendar-section {
            border-right: none;
            border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
          }

          .selection-panel {
            max-height: 400px;
          }
        }

        @media (max-width: 767px) {
          .booking-header {
            flex-direction: column;
            gap: var(--ds-spacing-4);
          }

          .booking-price-badge {
            align-self: flex-start;
          }

          .booking-stepper-container {
            flex-direction: column;
            gap: var(--ds-spacing-3);
          }

          .booking-stepper-pro {
            flex-wrap: wrap;
            justify-content: center;
          }

          .stepper-label {
            display: none;
          }

          .calendar-header {
            flex-direction: column;
            align-items: stretch;
          }

          .calendar-nav {
            justify-content: center;
          }

          .calendar-grid {
            overflow-x: auto;
          }

          .calendar-row {
            min-width: 500px;
          }
        }
      `}</style>
    </div>
  );
}

export default BookingSection;
