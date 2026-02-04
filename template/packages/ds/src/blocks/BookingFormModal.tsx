/**
 * BookingFormModal
 *
 * Modal dialog for collecting booking details.
 * Shown after user selects time slots from the calendar.
 */
import * as React from 'react';
import {
  Dialog,
  Heading,
  Paragraph,
  Textfield,
  Textarea,
  Checkbox,
  Button,
} from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { CalendarIcon, ClockIcon, CloseIcon } from '../primitives/icons';
import type { TimeSlot, BookingDetails, ActivityType, AdditionalService } from '../types/listing-detail';

export interface BookingFormModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Selected time slots from calendar */
  selectedSlots: TimeSlot[];
  /** Selected additional services */
  selectedServices?: string[];
  /** Available additional services */
  availableServices?: AdditionalService[];
  /** Listing name for display */
  listingName: string;
  /** Base price per hour */
  basePrice?: number;
  /** Currency */
  currency?: string;
  /** Maximum capacity of the venue */
  maxCapacity?: number;
  /** Callback when booking is confirmed */
  onConfirm: (details: BookingDetails) => void;
  /** Custom class name */
  className?: string;
}

// Activity type options
const activityTypeOptions: { value: ActivityType; label: string }[] = [
  { value: 'meeting', label: 'Møte' },
  { value: 'training', label: 'Trening' },
  { value: 'event', label: 'Arrangement' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'presentation', label: 'Presentasjon' },
  { value: 'party', label: 'Fest/Selskap' },
  { value: 'other', label: 'Annet' },
];

/**
 * Format selected slots into readable date/time strings
 */
function formatSelectedSlots(slots: TimeSlot[]): { date: string; timeRange: string } {
  if (slots.length === 0) {
    return { date: 'Ingen valgt', timeRange: '' };
  }

  // Sort slots by date and time
  const sorted = [...slots].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.startTime.localeCompare(b.startTime);
  });

  // Get unique dates
  const dates = [...new Set(sorted.map(s => new Date(s.date).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })))];

  // Get time range
  const firstSlot = sorted[0];
  const lastSlot = sorted[sorted.length - 1];
  if (!firstSlot || !lastSlot) {
    return { date: 'Ingen valgt', timeRange: '' };
  }
  const startTime = firstSlot.startTime;
  const hourPart = lastSlot.startTime.split(':')[0] ?? '0';
  const endTime = lastSlot.endTime || `${parseInt(hourPart) + 1}:00`;

  return {
    date: dates.length === 1 ? dates[0] ?? 'Ukjent dato' : `${dates.length} dager valgt`,
    timeRange: `${startTime} - ${endTime}`
  };
}

/**
 * BookingFormModal component
 *
 * @example
 * ```tsx
 * <BookingFormModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   selectedSlots={selectedSlots}
 *   listingName="Møterom 101"
 *   basePrice={450}
 *   onConfirm={(details) => handleBookingConfirm(details)}
 * />
 * ```
 */
export function BookingFormModal({
  open,
  onClose,
  selectedSlots,
  selectedServices = [],
  availableServices = [],
  listingName,
  basePrice,
  currency = 'NOK',
  maxCapacity,
  onConfirm,
  className,
}: BookingFormModalProps): React.ReactElement {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Form state
  const [formData, setFormData] = React.useState<BookingDetails>({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    showPurposeInCalendar: false,
    bookMultipleDays: false,
    numberOfPeople: 1,
    activityType: 'meeting',
    notes: '',
    acceptedTerms: false,
    organization: '',
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof BookingDetails, string>>>({});

  // Control dialog visibility
  React.useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!open && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [open]);

  // Handle dialog close event
  const handleDialogClose = () => {
    onClose();
  };

  // Update form field
  const updateField = <K extends keyof BookingDetails>(
    field: K,
    value: BookingDetails[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BookingDetails, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon er påkrevd';
    }
    if (!formData.purpose?.trim()) {
      newErrors.purpose = 'Formål er påkrevd';
    }
    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Antall personer må være minst 1';
    }
    if (maxCapacity && formData.numberOfPeople && formData.numberOfPeople > maxCapacity) {
      newErrors.numberOfPeople = `Maks kapasitet er ${maxCapacity} personer`;
    }
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'Du må godkjenne vilkårene';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(formData);
    }
  };

  // Calculate total price
  const calculateTotalPrice = (): number => {
    const hoursBooked = selectedSlots.length;
    const baseTotal = (basePrice || 0) * hoursBooked;

    const servicesTotal = selectedServices.reduce((sum, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);

    return baseTotal + servicesTotal;
  };

  const { date, timeRange } = formatSelectedSlots(selectedSlots);
  const totalPrice = calculateTotalPrice();

  return (
    <Dialog
      ref={dialogRef}
      className={cn('booking-form-modal', className)}
      closedby="closerequest"
      onClose={handleDialogClose}
      style={{
        maxWidth: '600px',
        width: '95vw',
        maxHeight: '90vh',
        borderRadius: 'var(--ds-border-radius-xl)',
        padding: 0,
        border: 'none',
        boxShadow: 'var(--ds-shadow-xl)',
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-xl) var(--ds-border-radius-xl) 0 0',
        }}
      >
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0 }}>
            Bekreft booking
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {listingName}
          </Paragraph>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Lukk"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            border: 'none',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'transparent',
            color: 'var(--ds-color-neutral-text-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon size={20} />
        </button>
      </div>

      {/* Booking Summary */}
      <div
        style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          display: 'flex',
          gap: 'var(--ds-spacing-6)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CalendarIcon size={18} style={{ color: 'var(--ds-color-accent-base-default)' }} />
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Dato
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {date}
            </Paragraph>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <ClockIcon size={18} style={{ color: 'var(--ds-color-accent-base-default)' }} />
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Tidspunkt
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {timeRange || '-'}
            </Paragraph>
          </div>
        </div>
        {basePrice && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right' }}>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Totalt
              </Paragraph>
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-accent-base-default)' }}>
                {totalPrice.toLocaleString('nb-NO')} {currency}
              </Paragraph>
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <div
          style={{
            padding: 'var(--ds-spacing-6)',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 280px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
            {/* Purpose Section */}
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                Formål med bookingen
              </Heading>
              <Textfield
                label="Formål"
                value={formData.purpose || ''}
                onChange={(e) => updateField('purpose', e.target.value)}
                error={errors.purpose}
                placeholder="F.eks. Teammøte, Workshop, etc."
              />
              <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
                <Checkbox
                  aria-label="Vis formål i kalender"
                  checked={formData.showPurposeInCalendar || false}
                  onChange={(e) => updateField('showPurposeInCalendar', e.target.checked)}
                />
                <span style={{ marginLeft: 'var(--ds-spacing-2)' }}>Vis formål i kalender</span>
              </div>
            </div>

            {/* Date/Time and Multi-day Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <Checkbox
                  aria-label="Book flere dager"
                  checked={formData.bookMultipleDays || false}
                  onChange={(e) => updateField('bookMultipleDays', e.target.checked)}
                />
                <span style={{ marginLeft: 'var(--ds-spacing-2)' }}>Book flere dager?</span>
                {formData.bookMultipleDays && (
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Du kan velge flere dager i kalenderen etter at du har sendt denne forespørselen.
                  </Paragraph>
                )}
              </div>
            </div>

            {/* Attendees Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <div>
                <Textfield
                  label="Antall personer"
                  type="number"
                  min={1}
                  max={maxCapacity || 999}
                  value={String(formData.numberOfPeople || 1)}
                  onChange={(e) => updateField('numberOfPeople', parseInt(e.target.value) || 1)}
                  error={errors.numberOfPeople}
                />
                {maxCapacity && (
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Maks kapasitet: {maxCapacity} pers
                  </Paragraph>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--ds-font-size-sm)', marginBottom: 'var(--ds-spacing-2)' }}>
                  Type aktivitet
                </label>
                <select
                  value={formData.activityType || 'meeting'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('activityType', e.target.value as ActivityType)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-md)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                  }}
                >
                  {activityTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                Kontaktinformasjon
              </Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                <Textfield
                  label="Navn"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  error={errors.name}
                  placeholder="Ditt fulle navn"
                  autoComplete="name"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 'var(--ds-spacing-4)',
                  }}
                >
                  <Textfield
                    label="E-post"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    placeholder="din@epost.no"
                    autoComplete="email"
                  />
                  <Textfield
                    label="Telefon"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    error={errors.phone}
                    placeholder="+47 123 45 678"
                    autoComplete="tel"
                  />
                </div>
                <Textfield
                  label="Organisasjon (valgfritt)"
                  value={formData.organization || ''}
                  onChange={(e) => updateField('organization', e.target.value)}
                  placeholder="Bedrift eller organisasjon"
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--ds-font-size-sm)', marginBottom: 'var(--ds-spacing-2)' }}>
                Kort beskrivelse (valgfritt)
              </label>
              <Textarea
                aria-label="Kort beskrivelse"
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Beskriv kort hva bookingen gjelder eller andre relevante detaljer..."
                rows={3}
              />
            </div>

            {/* Terms */}
            <div
              id="terms-label"
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: errors.acceptedTerms ? '1px solid var(--ds-color-danger-border-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <Checkbox
                checked={formData.acceptedTerms}
                onChange={(e) => updateField('acceptedTerms', e.target.checked)}
                error={!!errors.acceptedTerms}
                aria-labelledby="terms-label"
              >
                Jeg godtar vilkår og betingelser for booking
              </Checkbox>
              {errors.acceptedTerms && (
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
                  {errors.acceptedTerms}
                </Paragraph>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: '0 0 var(--ds-border-radius-xl) var(--ds-border-radius-xl)',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            onClick={onClose}
          >
            Avbryt
          </Button>
          <Button
            type="submit"
            variant="primary"
            data-color="accent"
          >
            Bekreft booking
          </Button>
        </div>
      </form>

      {/* Modal Styles */}
      <style>{`
        .booking-form-modal::backdrop {
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .booking-form-modal input:focus,
        .booking-form-modal textarea:focus,
        .booking-form-modal select:focus {
          outline: 2px solid var(--ds-color-focus-outer);
          outline-offset: 2px;
        }

        .booking-form-modal button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        /* Animation */
        .booking-form-modal[open] {
          animation: modal-fade-in 0.2s ease-out;
        }

        @keyframes modal-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 599px) {
          .booking-form-modal {
            max-width: 100vw !important;
            width: 100vw !important;
            max-height: 100vh !important;
            height: 100vh !important;
            border-radius: 0 !important;
          }

          .booking-form-modal > div:first-child,
          .booking-form-modal > div:last-child {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </Dialog>
  );
}

export default BookingFormModal;
