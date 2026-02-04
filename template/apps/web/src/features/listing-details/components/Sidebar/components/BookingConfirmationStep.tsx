/**
 * BookingConfirmationStep Component
 * Step 2: Login prompt and booking confirmation
 */

import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

function CheckCircleIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export interface BookingConfirmationStepProps {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  isSubmitting: boolean;
  bookingError: string | null;
  isMobile?: boolean;
  selectedSlots: Set<string>;
  slotDetails: Record<string, {
    duration: number;
    purpose?: string;
    attendees?: string;
    activityType?: string;
  }>;
  weekStart: Date;
  onLoginWithVipps?: () => void;
  onLoginAsEmployee?: () => void;
  onConfirmBooking?: () => void;
  onClearError?: () => void;
  /** Selected booking account type */
  bookingAccountType?: 'private' | 'organization';
  /** Selected organization ID */
  selectedOrganizationId?: string;
  /** Handler for account type selection */
  onAccountTypeSelect?: (type: 'private' | 'organization' | undefined, organizationId?: string) => void;
  /** Handler to confirm account type selection and proceed to booking confirmation */
  onConfirmAccountType?: () => void;
  /** User's organizations (for organization selection) */
  organizations?: Array<{ id: string; name: string }>;
  /** Whether account type selection is confirmed */
  isAccountTypeConfirmed?: boolean;
}

export function BookingConfirmationStep({
  isAuthenticated,
  isLoggingIn,
  isSubmitting: _isSubmitting,
  bookingError,
  isMobile: _isMobile = false,
  selectedSlots,
  slotDetails,
  weekStart,
  onLoginWithVipps,
  onLoginAsEmployee,
  onConfirmBooking: _onConfirmBooking,
  onClearError,
  bookingAccountType,
  selectedOrganizationId,
  onAccountTypeSelect,
  onConfirmAccountType,
  organizations = [],
  isAccountTypeConfirmed = false,
}: BookingConfirmationStepProps): React.ReactElement {
  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

  // Show account selection if authenticated but no account type selected yet
  const showAccountSelection = isAuthenticated && !bookingAccountType;

  // Show account type confirmation if account type is selected but not yet confirmed
  // (for organization, we also need the organization to be selected)
  const showAccountTypeConfirmation = isAuthenticated && bookingAccountType && !isAccountTypeConfirmed && (
    bookingAccountType === 'private' || 
    (bookingAccountType === 'organization' && selectedOrganizationId)
  );

  // Show booking confirmation only after account type is confirmed
  const showBookingConfirmation = isAuthenticated && isAccountTypeConfirmed && bookingAccountType && (
    bookingAccountType === 'private' || selectedOrganizationId
  );

  // Explicit check: If not authenticated, ALWAYS show login
  if (!isAuthenticated) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-default)' }}>
          Logg inn for å fullføre
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-5)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          For å sende din bookingforespørsel må du være innlogget. Vi bruker sikker autentisering for å verifisere din identitet.
        </Paragraph>

        {/* Simple Login Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          <Button
            type="button"
            variant="primary"
            data-size="lg"
            data-color="accent"
            onClick={onLoginWithVipps}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              backgroundColor: 'var(--ds-color-warning-base-default)',
              color: 'var(--ds-color-warning-base-contrast-default)',
            }}
          >
            {isLoggingIn ? 'Logger inn...' : 'Logg inn med Vipps'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            data-size="lg"
            onClick={onLoginAsEmployee}
            disabled={isLoggingIn}
            style={{
              width: '100%',
            }}
          >
            {isLoggingIn ? 'Logger inn...' : 'Logg inn med Bank ID'}
          </Button>
        </div>

        {/* Privacy notice */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-4)' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-success-base-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            <CheckCircleIcon size={10} />
          </div>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Din informasjon behandles sikkert og i henhold til personvernlovgivningen. Ved å logge inn godtar du at vi lagrer nødvendige opplysninger for å behandle din booking.
          </Paragraph>
        </div>
      </div>
    );
  }

  // If authenticated, show account selection or confirmation
  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      {showAccountSelection ? (
        /* Account Selection - Choose Private or Organization */
        <>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Hvordan vil du booke?
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg om du vil booke som privatperson eller på vegne av en organisasjon.
          </Paragraph>

          {/* Account Type Selection */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-6)',
            }}
          >
            {/* Private Booking Option */}
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('private')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-accent-border-default)',
                backgroundColor: 'var(--ds-color-accent-surface-tinted)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-base-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-accent-base-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-accent-base-contrast-default)',
                    fontWeight: 'bold',
                    fontSize: 'var(--ds-font-size-md)',
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                    Som privatperson
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Booke for deg selv eller din familie
                  </Paragraph>
                </div>
              </div>
            </button>

            {/* Organization Booking Option */}
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('organization')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontWeight: 'bold',
                    fontSize: 'var(--ds-font-size-md)',
                    flexShrink: 0,
                  }}
                >
                  🏢
                </div>
                <div style={{ flex: 1 }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                    På vegne av organisasjon
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Booke for en organisasjon du representerer
                  </Paragraph>
                </div>
              </div>
            </button>
          </div>

          {/* Organization Selection (shown when organization is selected) */}
          {bookingAccountType === 'organization' && (
            <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
              <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                Velg organisasjon
              </Heading>
              {organizations.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-info-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-info-border-subtle)',
                  }}
                >
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
                    Du er ikke tilknyttet noen organisasjoner ennå. Kontakt din administrator for å bli lagt til i en organisasjon.
                  </Paragraph>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--ds-spacing-2)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => onAccountTypeSelect?.('organization', org.id)}
                      style={{
                        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: selectedOrganizationId === org.id
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : '1px solid var(--ds-color-neutral-border-default)',
                        backgroundColor: selectedOrganizationId === org.id
                          ? 'var(--ds-color-accent-surface-tinted)'
                          : 'var(--ds-color-neutral-background-default)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrganizationId !== org.id) {
                          e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                          e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrganizationId !== org.id) {
                          e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                          e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
                        }
                      }}
                    >
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
                        {org.name}
                      </Paragraph>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : showAccountTypeConfirmation ? (
        /* Account Type Confirmation - Confirm selection before proceeding */
        <>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Bekreft bookingtype
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {bookingAccountType === 'private' 
              ? 'Du har valgt å booke som privatperson.'
              : selectedOrganizationId && organizations.find(o => o.id === selectedOrganizationId)
                ? `Du har valgt å booke på vegne av ${organizations.find(o => o.id === selectedOrganizationId)?.name}.`
                : 'Du har valgt å booke på vegne av en organisasjon.'}
          </Paragraph>

          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: bookingAccountType === 'private' 
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-surface-default)',
                  border: bookingAccountType === 'private' 
                    ? 'none'
                    : '1px solid var(--ds-color-neutral-border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: bookingAccountType === 'private'
                    ? 'var(--ds-color-accent-base-contrast-default)'
                    : 'var(--ds-color-neutral-text-default)',
                  fontWeight: 'bold',
                  fontSize: 'var(--ds-font-size-lg)',
                  flexShrink: 0,
                }}
              >
                {bookingAccountType === 'private' ? '👤' : '🏢'}
              </div>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                  {bookingAccountType === 'private' 
                    ? 'Som privatperson'
                    : selectedOrganizationId && organizations.find(o => o.id === selectedOrganizationId)
                      ? organizations.find(o => o.id === selectedOrganizationId)?.name
                      : 'På vegne av organisasjon'}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {bookingAccountType === 'private' 
                    ? 'Booke for deg selv eller din familie'
                    : 'Booke for en organisasjon du representerer'}
                </Paragraph>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onAccountTypeSelect?.(undefined, undefined);
              }}
              style={{ minWidth: '120px' }}
            >
              Endre valg
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onConfirmAccountType}
              style={{ minWidth: '120px' }}
            >
              Bekreft og fortsett
            </Button>
          </div>
        </>
      ) : showBookingConfirmation ? (
        /* Authenticated with Account Type Selected - Show Confirmation */
        <>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Bekreft booking
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {bookingAccountType === 'private' 
              ? 'Du booker som privatperson.'
              : selectedOrganizationId && organizations.find(o => o.id === selectedOrganizationId)
                ? `Du booker på vegne av ${organizations.find(o => o.id === selectedOrganizationId)?.name}.`
                : 'Du booker på vegne av en organisasjon.'}
          </Paragraph>

          {/* Error Display */}
          {bookingError && (
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-danger-border-default)',
                marginBottom: 'var(--ds-spacing-4)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--ds-spacing-3)',
              }}
            >
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
                  {bookingError}
                </Paragraph>
                {onClearError && (
                  <button
                    type="button"
                    onClick={onClearError}
                    style={{
                      marginTop: 'var(--ds-spacing-2)',
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      color: 'var(--ds-color-danger-text-default)',
                      fontSize: 'var(--ds-font-size-xs)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Lukk
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Booking Summary */}
          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }}>
              Vennligst bekreft at følgende informasjon er korrekt:
            </Paragraph>

            {Array.from(selectedSlots).map((slotKey, index) => {
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
                    paddingTop: index > 0 ? 'var(--ds-spacing-3)' : 0,
                    marginTop: index > 0 ? 'var(--ds-spacing-3)' : 0,
                    borderTop: index > 0 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                  }}
                >
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {dayNames[slotDate.getDay()]} {slotDate.getDate()}. {monthNames[slotDate.getMonth()]}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    <span>{timeStr} – {endTime}</span>
                    {details.purpose && <span> • {details.purpose}</span>}
                    {details.attendees && <span> • {details.attendees} personer</span>}
                  </Paragraph>
                </div>
              );
            })}
          </div>
        </>
      ) : isAuthenticated ? (
        /* Fallback: If authenticated but somehow no account type, show account selection */
        <div style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Hvordan vil du booke?
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg om du vil booke som privatperson eller på vegne av en organisasjon.
          </Paragraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('private')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-accent-border-default)',
                backgroundColor: 'var(--ds-color-accent-surface-tinted)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Som privatperson
              </Paragraph>
            </button>
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('organization')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                På vegne av organisasjon
              </Paragraph>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
