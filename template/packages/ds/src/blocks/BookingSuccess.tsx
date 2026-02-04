/**
 * BookingSuccess
 *
 * Success message shown after booking submission.
 * Final step in the booking flow.
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { CheckCircleIcon, CalendarIcon, MailIcon, PhoneIcon } from '../primitives/icons';
import type { BookingDetails } from '../types/listing-detail';

export interface BookingSuccessProps {
  /** Booking reference number */
  bookingReference?: string;
  /** Booking details */
  bookingDetails: BookingDetails;
  /** Listing name */
  listingName: string;
  /** Contact email for the venue */
  venueEmail?: string;
  /** Contact phone for the venue */
  venuePhone?: string;
  /** Callback to go back to listing */
  onBackToListing?: () => void;
  /** Callback to make another booking */
  onNewBooking?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * BookingSuccess component
 */
export function BookingSuccess({
  bookingReference,
  bookingDetails,
  listingName,
  venueEmail,
  venuePhone,
  onBackToListing,
  onNewBooking,
  className,
}: BookingSuccessProps): React.ReactElement {
  return (
    <div
      className={cn('booking-success', className)}
      style={{
        textAlign: 'center',
        padding: 'var(--ds-spacing-8)',
      }}
    >
      {/* Success Icon */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          backgroundColor: 'var(--ds-color-success-surface-default)',
          borderRadius: 'var(--ds-border-radius-full)',
          marginBottom: 'var(--ds-spacing-5)',
        }}
      >
        <CheckCircleIcon size={40} style={{ color: 'var(--ds-color-success-base-default)' }} />
      </div>

      {/* Success Message */}
      <Heading level={2} data-size="lg" style={{ margin: 0 }}>
        Booking sendt!
      </Heading>
      <Paragraph
        data-size="md"
        style={{
          margin: 0,
          marginTop: 'var(--ds-spacing-3)',
          color: 'var(--ds-color-neutral-text-subtle)',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Din forespørsel om booking av <strong>{listingName}</strong> er mottatt.
      </Paragraph>

      {/* Reference Number */}
      {bookingReference && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-5)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            display: 'inline-block',
          }}
        >
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Referansenummer
          </Paragraph>
          <Paragraph
            data-size="lg"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-bold)',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: 'var(--ds-color-accent-text-default)',
            }}
          >
            {bookingReference}
          </Paragraph>
        </div>
      )}

      {/* Confirmation Email Notice */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-6)',
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          textAlign: 'left',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              color: 'var(--ds-color-info-base-default)',
            }}
          >
            <MailIcon size={18} />
          </div>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
              Bekreftelse sendt
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              En e-post er sendt til {bookingDetails.email}
            </Paragraph>
          </div>
        </div>

        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Du vil motta en bekreftelse når bookingen er behandlet. Sjekk spam-mappen hvis du ikke finner e-posten.
        </Paragraph>
      </div>

      {/* Contact Info */}
      {(venueEmail || venuePhone) && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-5)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Har du spørsmål? Kontakt oss:
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
            {venueEmail && (
              <a
                href={`mailto:${venueEmail}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-accent-base-default)',
                  textDecoration: 'none',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                <MailIcon size={14} />
                {venueEmail}
              </a>
            )}
            {venuePhone && (
              <a
                href={`tel:${venuePhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-accent-base-default)',
                  textDecoration: 'none',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                <PhoneIcon size={14} />
                {venuePhone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-8)',
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
        }}
      >
        {onNewBooking && (
          <Button
            type="button"
            variant="secondary"
            onClick={onNewBooking}
          >
            <CalendarIcon size={16} />
            Ny booking
          </Button>
        )}
        {onBackToListing && (
          <Button
            type="button"
            variant="primary"
            data-color="accent"
            onClick={onBackToListing}
          >
            Tilbake til lokalet
          </Button>
        )}
      </div>

      {/* Animation styles */}
      <style>{`
        .booking-success {
          animation: booking-success-fade-in 0.5s ease-out;
        }

        @keyframes booking-success-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .booking-success > div:first-child {
          animation: booking-success-bounce 0.6s ease-out 0.2s both;
        }

        @keyframes booking-success-bounce {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default BookingSuccess;
