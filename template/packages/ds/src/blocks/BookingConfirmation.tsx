/**
 * BookingConfirmation
 *
 * Review step before final booking submission.
 * Shows summary of all booking details for user confirmation.
 */
import * as React from 'react';
import { Heading, Paragraph, Button, Alert } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import {
  CalendarIcon,
  UsersIcon,
  MailIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
} from '../primitives/icons';
import type { TimeSlot, BookingDetails, AdditionalService } from '../types/listing-detail';

export interface BookingConfirmationProps {
  /** Booking details from the form */
  bookingDetails: BookingDetails;
  /** Selected time slots */
  selectedSlots: TimeSlot[];
  /** Selected additional services */
  selectedServices?: string[];
  /** Available services for display */
  availableServices?: AdditionalService[];
  /** Listing name */
  listingName: string;
  /** Base price per hour */
  basePrice?: number;
  /** Currency */
  currency?: string;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Callback to go back to form */
  onBack: () => void;
  /** Callback to confirm and submit */
  onConfirm: () => void;
  /** Custom class name */
  className?: string;
}

// Activity type labels
const activityTypeLabels: Record<string, string> = {
  meeting: 'Møte',
  training: 'Trening',
  event: 'Arrangement',
  workshop: 'Workshop',
  presentation: 'Presentasjon',
  party: 'Fest/Selskap',
  other: 'Annet',
};

/**
 * Format time slots for display
 */
function formatTimeSlots(slots: TimeSlot[]): string[] {
  if (slots.length === 0) return ['Ingen tidspunkter valgt'];

  // Group by date
  const byDate = new Map<string, TimeSlot[]>();
  slots.forEach(slot => {
    const dateKey = new Date(slot.date).toDateString();
    const existing = byDate.get(dateKey) || [];
    byDate.set(dateKey, [...existing, slot]);
  });

  return Array.from(byDate.entries()).map(([_dateKey, dateSlots]) => {
    const sorted = dateSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    const firstSlot = sorted[0];
    const lastSlot = sorted[sorted.length - 1];
    if (!firstSlot || !lastSlot) {
      return 'Ingen tidspunkter';
    }
    const date = new Date(firstSlot.date);
    const dateStr = date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const startTime = firstSlot.startTime;
    const hourPart = lastSlot.startTime.split(':')[0] ?? '0';
    const endTime = lastSlot.endTime || `${parseInt(hourPart) + 1}:00`;

    return `${dateStr}, kl. ${startTime} - ${endTime}`;
  });
}

/**
 * BookingConfirmation component
 */
export function BookingConfirmation({
  bookingDetails,
  selectedSlots,
  selectedServices = [],
  availableServices = [],
  listingName,
  basePrice,
  currency = 'NOK',
  isSubmitting = false,
  onBack,
  onConfirm,
  className,
}: BookingConfirmationProps): React.ReactElement {
  // Calculate totals
  const hoursBooked = selectedSlots.length;
  const baseTotal = (basePrice || 0) * hoursBooked;
  const selectedServiceDetails = availableServices.filter(s => selectedServices.includes(s.id));
  const servicesTotal = selectedServiceDetails.reduce((sum, s) => sum + s.price, 0);
  const totalPrice = baseTotal + servicesTotal;

  const formattedSlots = formatTimeSlots(selectedSlots);

  return (
    <div className={cn('booking-confirmation', className)}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0 }}>
          Bekreft din booking
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Vennligst se over detaljene før du bekrefter bookingen.
        </Paragraph>
      </div>

      {/* Booking Summary Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Venue & Time Card */}
        <div
          style={{
            padding: 'var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <CalendarIcon size={18} style={{ color: 'var(--ds-color-accent-base-default)' }} />
            Lokale og tidspunkt
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lokale
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {listingName}
              </Paragraph>
            </div>

            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tidspunkt
              </Paragraph>
              {formattedSlots.map((slot, i) => (
                <Paragraph key={i} data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  {slot}
                </Paragraph>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--ds-spacing-6)' }}>
              <div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Antall personer
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <UsersIcon size={14} />
                  {bookingDetails.numberOfPeople || 1}
                </Paragraph>
              </div>
              <div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Aktivitet
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  {activityTypeLabels[bookingDetails.activityType || 'meeting']}
                </Paragraph>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose Card */}
        <div
          style={{
            padding: 'var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Formål
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {bookingDetails.purpose || '-'}
          </Paragraph>
          {bookingDetails.notes && (
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {bookingDetails.notes}
            </Paragraph>
          )}
          {bookingDetails.showPurposeInCalendar && (
            <div
              style={{
                marginTop: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                borderRadius: 'var(--ds-border-radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <CheckCircleIcon size={14} style={{ color: 'var(--ds-color-info-base-default)' }} />
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
                Vises i kalender
              </Paragraph>
            </div>
          )}
        </div>

        {/* Contact Card */}
        <div
          style={{
            padding: 'var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Kontaktinformasjon
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Navn
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {bookingDetails.name}
              </Paragraph>
              {bookingDetails.organization && (
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {bookingDetails.organization}
                </Paragraph>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--ds-spacing-6)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <MailIcon size={14} style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {bookingDetails.email}
                </Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <PhoneIcon size={14} style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {bookingDetails.phone}
                </Paragraph>
              </div>
            </div>
          </div>
        </div>

        {/* Services Card (if any selected) */}
        {selectedServiceDetails.length > 0 && (
          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
              Tilleggstjenester
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {selectedServiceDetails.map(service => (
                <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {service.name}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    +{service.price} {service.currency || currency}
                  </Paragraph>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Summary */}
        {basePrice && (
          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-accent-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {hoursBooked} time{hoursBooked !== 1 ? 'r' : ''} × {basePrice} {currency}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {baseTotal.toLocaleString('nb-NO')} {currency}
                </Paragraph>
              </div>
              {servicesTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Tilleggstjenester
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {servicesTotal.toLocaleString('nb-NO')} {currency}
                  </Paragraph>
                </div>
              )}
              <div
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  paddingTop: 'var(--ds-spacing-3)',
                  borderTop: '1px solid var(--ds-color-accent-border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  Totalt
                </Paragraph>
                <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-accent-base-default)' }}>
                  {totalPrice.toLocaleString('nb-NO')} {currency}
                </Paragraph>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <Alert data-color="info" data-size="sm">
          Du vil motta en bekreftelse på e-post når bookingen er registrert.
          Ved spørsmål, kontakt oss direkte.
        </Alert>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Button
          type="button"
          variant="tertiary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ChevronLeftIcon size={16} />
          Tilbake
        </Button>
        <Button
          type="button"
          variant="primary"
          data-color="accent"
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Sender...' : 'Send booking'}
        </Button>
      </div>
    </div>
  );
}

export default BookingConfirmation;
