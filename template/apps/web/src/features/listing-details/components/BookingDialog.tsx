/**
 * BookingDialog Component
 *
 * Professional drawer with smart calendar that respects:
 * - Listing opening hours
 * - Past date/time restrictions
 * - Availability status
 */

import * as React from 'react';
import {
  Heading,
  Paragraph,
  Textfield,
  Textarea,
  Button,
  Label,
  Select,
  SelectOption,
} from '@digdir/designsystemet-react';
import { PaymentSection } from './PaymentSection';

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  repeat: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  close: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  text: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevronLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

// =============================================================================
// Types
// =============================================================================

export interface BookingSlot {
  date: Date;
  startTime: string;
  endTime?: string;
}

export interface OpeningHours {
  open: string; // "10:00"
  close: string; // "21:00"
}

export interface BookingFormData {
  purpose: string;
  showPurposeInCalendar: boolean;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string;
  activityType: string;
  description: string;
  isRecurring: boolean;
  endDate: string;
  selectedDays: string[];
  repetition: string;
}

export interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BookingFormData) => void;
  slot: BookingSlot | undefined;
  openingHours?: OpeningHours;
  busySlots?: Array<{ date: string; startTime: string; endTime: string }>;
}

// =============================================================================
// Constants
// =============================================================================

const WEEKDAYS = [
  { key: 'ma', label: 'Ma' },
  { key: 'ti', label: 'Ti' },
  { key: 'on', label: 'On' },
  { key: 'to', label: 'To' },
  { key: 'fr', label: 'Fr' },
  { key: 'lo', label: 'Lø' },
];

const DAY_NAMES = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

// =============================================================================
// Helper Functions
// =============================================================================

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

// =============================================================================
// Component
// =============================================================================

export function BookingDialog({
  isOpen,
  onClose,
  onConfirm,
  slot,
  openingHours = { open: '08:00', close: '21:00' },
}: BookingDialogProps): React.ReactElement | null {
  const [formData, setFormData] = React.useState<BookingFormData>({
    purpose: '',
    showPurposeInCalendar: false,
    date: '',
    startTime: '',
    endTime: '',
    attendees: '',
    activityType: '',
    description: '',
    isRecurring: false,
    endDate: '',
    selectedDays: [],
    repetition: 'weekly',
  });

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isMounted, setIsMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse opening hours
  const openHour = parseInt(openingHours.open.split(':')[0] ?? '8', 10);
  const closeHour = parseInt(openingHours.close.split(':')[0] ?? '21', 10);

  // Animation handling
  React.useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      closeTimeoutRef.current = setTimeout(() => setIsMounted(false), 350);
    }
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen]);

  // Populate from slot
  React.useEffect(() => {
    if (slot) {
      setSelectedDate(slot.date);
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const endHour = ((startHour ?? 0) + 1).toString().padStart(2, '0');
      const endTime = `${endHour}:${(startMin ?? 0).toString().padStart(2, '0')}`;
      setFormData((prev) => ({
        ...prev,
        date: formatDateKey(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime || endTime,
      }));
    }
  }, [slot]);

  // Update form date when selectedDate changes
  React.useEffect(() => {
    const dateStr = formatDateKey(selectedDate);
    const [year, month, day] = dateStr.split('-');
    setFormData(prev => ({ ...prev, date: `${day}.${month}.${year}` }));
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const updateField = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const selectTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const endHour = ((hours ?? 0) + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${(minutes ?? 0).toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, startTime: time, endTime }));
  };

  // Form validation - check required fields
  const isFormValid = React.useMemo(() => {
    const hasPurpose = formData.purpose.trim().length > 0;
    const hasAttendees = formData.attendees.trim().length > 0 && parseInt(formData.attendees, 10) > 0;
    const hasActivityType = formData.activityType.trim().length > 0;
    const hasTimeSlot = formData.startTime.length > 0;
    return hasPurpose && hasAttendees && hasActivityType && hasTimeSlot;
  }, [formData.purpose, formData.attendees, formData.activityType, formData.startTime]);

  if (!isMounted) return null;

  const baseDelay = isVisible ? 80 : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: isVisible ? 'blur(4px)' : 'blur(0px)',
          zIndex: 1000,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 350ms ease, backdrop-filter 350ms ease',
        }}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        className={`booking-drawer ${isVisible ? 'drawer-visible' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '560px',
          height: '100vh',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          boxShadow: isVisible ? '-8px 0 40px rgba(0, 0, 0, 0.2)' : 'none',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 350ms ease',
        }}
      >
        {/* Drawer Handle (mobile only) */}
        <div className="drawer-handle" style={{ display: 'none', justifyContent: 'center', padding: 'var(--ds-spacing-3) 0 0' }}>
          <div style={{ width: '40px', height: '5px', backgroundColor: 'var(--ds-color-neutral-border-default)', borderRadius: 'var(--ds-border-radius-full)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            background: 'linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-neutral-background-default) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
              transitionDelay: `${baseDelay}ms`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, var(--ds-color-accent-base-hover) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {Icons.calendar}
              </div>
              <div>
                <Heading level={2} data-size="sm" id="booking-dialog-title" style={{ margin: 0 }}>
                  Book tidspunkt
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: '2px' }}>
                  Åpent {openingHours.open} – {openingHours.close}
                </Paragraph>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Lukk"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                border: 'none',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                cursor: 'pointer',
                color: 'var(--ds-color-neutral-text-subtle)',
                borderRadius: 'var(--ds-border-radius-full)',
                transition: 'all 200ms ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-default)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {Icons.close}
            </button>
          </div>
        </div>

        {/* Time Selection Section */}
        <div
          style={{
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
            transitionDelay: `${baseDelay + 50}ms`,
          }}
        >
          {/* Selected Date & Time Display */}
          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-4)',
            }}
          >
            {/* Selected Date */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '1px solid var(--ds-color-accent-border-subtle)',
              }}
            >
              <span style={{ color: 'var(--ds-color-accent-text-default)' }}>{Icons.calendar}</span>
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-accent-text-default)' }}>
                {DAY_NAMES[selectedDate.getDay()]} {selectedDate.getDate()}. {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Paragraph>
            </div>

            {/* Time Selector with +/- 30 min */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-3)',
              }}
            >
              {/* Minus 30 min button */}
              <button
                type="button"
                onClick={() => {
                  const [h, m] = (formData.startTime || '08:00').split(':').map(Number);
                  let totalMins = (h ?? 8) * 60 + (m ?? 0) - 30;
                  const minMins = openHour * 60;
                  if (totalMins < minMins) totalMins = minMins;
                  const newH = Math.floor(totalMins / 60);
                  const newM = totalMins % 60;
                  const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
                  selectTimeSlot(newTime);
                }}
                aria-label="Trekk fra 30 minutter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  border: '2px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-xl)',
                  fontWeight: 'var(--ds-font-weight-bold)',
                  color: 'var(--ds-color-neutral-text-default)',
                  transition: 'all 150ms ease',
                }}
              >
                −
              </button>

              {/* Current Time Display */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  padding: 'var(--ds-spacing-3) var(--ds-spacing-6)',
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  minWidth: '140px',
                }}
              >
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)', opacity: 0.8 }}>
                  Starttid
                </Paragraph>
                <Heading level={3} data-size="lg" style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)', fontVariantNumeric: 'tabular-nums' }}>
                  {formData.startTime || '08:00'}
                </Heading>
              </div>

              {/* Plus 30 min button */}
              <button
                type="button"
                onClick={() => {
                  const [h, m] = (formData.startTime || '08:00').split(':').map(Number);
                  let totalMins = (h ?? 8) * 60 + (m ?? 0) + 30;
                  const maxMins = (closeHour - 1) * 60 + 30;
                  if (totalMins > maxMins) totalMins = maxMins;
                  const newH = Math.floor(totalMins / 60);
                  const newM = totalMins % 60;
                  const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
                  selectTimeSlot(newTime);
                }}
                aria-label="Legg til 30 minutter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  border: '2px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-xl)',
                  fontWeight: 'var(--ds-font-weight-bold)',
                  color: 'var(--ds-color-neutral-text-default)',
                  transition: 'all 150ms ease',
                }}
              >
                +
              </button>
            </div>

            {/* Duration selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-3)',
              }}
            >
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Varighet:
              </Paragraph>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                {['30 min', '1 time', '2 timer', '3 timer'].map((duration, i) => {
                  const durationMinutes = [30, 60, 120, 180][i] ?? 60;
                  const [startH, startM] = (formData.startTime || '08:00').split(':').map(Number);
                  const endMinutes = ((startH ?? 8) * 60 + (startM ?? 0)) + durationMinutes;
                  const endH = Math.floor(endMinutes / 60);
                  const endM = endMinutes % 60;
                  const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                  const isSelectedDur = formData.endTime === endTime;

                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => updateField('endTime', endTime)}
                      style={{
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: isSelectedDur ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
                        backgroundColor: isSelectedDur ? 'var(--ds-color-accent-surface-default)' : 'transparent',
                        color: isSelectedDur ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-default)',
                        fontSize: 'var(--ds-font-size-sm)',
                        fontWeight: isSelectedDur ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {duration}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 'var(--ds-spacing-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-5)',
            }}
          >
            {/* Purpose Field */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                transitionDelay: `${baseDelay + 100}ms`,
              }}
            >
              <Label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                <span style={{ color: 'var(--ds-color-accent-text-default)' }}>{Icons.tag}</span>
                <span>Formål med bookingen</span>
                <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-danger-text-default)', marginLeft: 'auto' }}>Påkrevd</span>
              </Label>
              <Textfield
                aria-label="Formål med bookingen"
                value={formData.purpose}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('purpose', e.target.value)}
                placeholder="f.eks. Trening, Styremøte, Kurs..."
                style={{ width: '100%' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-3)', cursor: 'pointer' }}>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    updateField('showPurposeInCalendar', !formData.showPurposeInCalendar);
                  }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    border: `2px solid ${formData.showPurposeInCalendar ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-border-default)'}`,
                    backgroundColor: formData.showPurposeInCalendar ? 'var(--ds-color-accent-base-default)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 200ms ease',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {formData.showPurposeInCalendar && Icons.check}
                </div>
                <Paragraph data-size="sm" style={{ margin: 0 }}>Vis formål i kalender</Paragraph>
              </label>
            </div>

            {/* Recurring Toggle */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                transitionDelay: `${baseDelay + 150}ms`,
              }}
            >
              <button
                type="button"
                onClick={() => updateField('isRecurring', !formData.isRecurring)}
                aria-expanded={formData.isRecurring}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: formData.isRecurring ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  border: `2px solid ${formData.isRecurring ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <span style={{ color: formData.isRecurring ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)', transition: 'color 200ms ease' }}>{Icons.repeat}</span>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 500 }}>Gjentakende booking</Paragraph>
                </span>
                <div
                  style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    backgroundColor: formData.isRecurring ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-border-default)',
                    position: 'relative',
                    transition: 'background-color 200ms ease',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: formData.isRecurring ? '26px' : '2px',
                      transition: 'left 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                </div>
              </button>

              {/* Recurring Options */}
              <div style={{ maxHeight: formData.isRecurring ? '280px' : '0', overflow: 'hidden', transition: 'max-height 350ms cubic-bezier(0.32, 0.72, 0, 1)' }}>
                <div style={{ paddingTop: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                  <div>
                    <Label style={{ marginBottom: 'var(--ds-spacing-2)' }}>Velg ukedager</Label>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                      {WEEKDAYS.map((day) => (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => toggleDay(day.key)}
                          style={{
                            minWidth: '52px',
                            height: '48px',
                            borderRadius: 'var(--ds-border-radius-lg)',
                            border: 'none',
                            backgroundColor: formData.selectedDays.includes(day.key) ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-surface-hover)',
                            color: formData.selectedDays.includes(day.key) ? 'white' : 'var(--ds-color-neutral-text-default)',
                            fontSize: 'var(--ds-font-size-md)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transform: formData.selectedDays.includes(day.key) ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="booking-recurring-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <div>
                      <Label style={{ marginBottom: 'var(--ds-spacing-2)' }}>Til dato</Label>
                      <Textfield aria-label="Til dato" value={formData.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('endDate', e.target.value)} placeholder="DD.MM.YYYY" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <Label style={{ marginBottom: 'var(--ds-spacing-2)' }}>Gjentagelse</Label>
                      <Select value={formData.repetition} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('repetition', e.target.value)} style={{ width: '100%' }}>
                        <SelectOption value="weekly">Hver uke</SelectOption>
                        <SelectOption value="biweekly">Hver 2. uke</SelectOption>
                        <SelectOption value="monthly">Hver måned</SelectOption>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendees & Activity */}
            <div
              className="booking-details-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--ds-spacing-4)',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                transitionDelay: `${baseDelay + 200}ms`,
              }}
            >
              <div>
                <Label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--ds-color-accent-text-default)' }}>{Icons.users}</span>
                  <span>Antall</span>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-danger-text-default)', marginLeft: 'auto' }}>Påkrevd</span>
                </Label>
                <Textfield aria-label="Antall deltakere" type="number" value={formData.attendees} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('attendees', e.target.value)} placeholder="0" min="1" style={{ width: '100%' }} />
              </div>
              <div>
                <Label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--ds-color-accent-text-default)' }}>{Icons.tag}</span>
                  <span>Aktivitet</span>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-danger-text-default)', marginLeft: 'auto' }}>Påkrevd</span>
                </Label>
                <Select value={formData.activityType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('activityType', e.target.value)} style={{ width: '100%' }}>
                  <SelectOption value="">Velg type...</SelectOption>
                  <SelectOption value="trening">Trening</SelectOption>
                  <SelectOption value="møte">Møte</SelectOption>
                  <SelectOption value="kurs">Kurs</SelectOption>
                  <SelectOption value="arrangement">Arrangement</SelectOption>
                  <SelectOption value="annet">Annet</SelectOption>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                transitionDelay: `${baseDelay + 250}ms`,
              }}
            >
              <Label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                <span style={{ color: 'var(--ds-color-accent-text-default)' }}>{Icons.text}</span>
                <span>Beskrivelse</span>
                <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginLeft: 'auto' }}>Valgfri</span>
              </Label>
              <Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('description', e.target.value)} placeholder="Legg til en kort beskrivelse..." rows={2} style={{ width: '100%' }} />
            </div>

            {/* Payment Section */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                transitionDelay: `${baseDelay + 300}ms`,
              }}
            >
              <PaymentSection
                amount={500}
                currency="NOK"
                description={`Booking: ${formData.purpose || 'Tidspunkt'}`}
                bookingId={undefined}
                onPaymentInitiated={(paymentUrl, orderId) => {
                  // Store payment info before redirect
                  sessionStorage.setItem('pendingPayment', JSON.stringify({ orderId, formData }));
                }}
                disabled={!isFormValid}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
              transitionDelay: `${baseDelay + 350}ms`,
            }}
          >
            {/* Validation message */}
            {!isFormValid && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  marginBottom: 'var(--ds-spacing-3)',
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-warning-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-warning-border-subtle)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-warning-text-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
                  Fyll ut alle påkrevde felt for å bekrefte bookingen
                </Paragraph>
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
              <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                Avbryt
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isFormValid}
                style={{
                  flex: 2,
                  opacity: isFormValid ? 1 : 0.6,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
              >
                Bekreft booking
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Styles */}
      <style>{`
        @media (max-width: 560px) {
          .booking-drawer {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 96vh !important;
            border-radius: var(--ds-border-radius-xl) var(--ds-border-radius-xl) 0 0 !important;
            box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2) !important;
            transform: translateY(100%) !important;
          }
          .booking-drawer.drawer-visible {
            transform: translateY(0) !important;
          }
          .booking-details-grid {
            grid-template-columns: 1fr !important;
          }
          .booking-recurring-grid {
            grid-template-columns: 1fr !important;
          }
          .drawer-handle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

export default BookingDialog;
