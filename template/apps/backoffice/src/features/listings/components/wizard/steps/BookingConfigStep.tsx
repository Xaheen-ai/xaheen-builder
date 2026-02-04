/**
 * Booking Config Step
 * Booking rules and configuration with enhanced UX
 */

/* eslint-disable digdir/prefer-ds-components -- Wizard step with native elements */

import { Textfield, Paragraph, Heading, Switch, Card } from '@xaheen/ds';
import type { BackofficeListing, ListingBookingConfig } from '../../../types';

export interface BookingConfigStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

// Icons for booking models
function TimeRangeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SlotIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="6" y="13" width="4" height="3" rx="0.5" />
      <rect x="14" y="13" width="4" height="3" rx="0.5" />
    </svg>
  );
}

function AllDayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function QuantityIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="6" height="10" rx="1" />
      <rect x="9" y="7" width="6" height="10" rx="1" />
      <rect x="16" y="7" width="6" height="10" rx="1" />
    </svg>
  );
}

function CapacityIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PackageIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

// Icons for cancellation policies
function FlexibleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ModerateIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function StrictIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

const BOOKING_MODELS = [
  { value: 'TIME_RANGE', label: 'Tidsperiode', description: 'Velg start og sluttid', Icon: TimeRangeIcon },
  { value: 'SLOT', label: 'Tidsluke', description: 'Faste bookingtider', Icon: SlotIcon },
  { value: 'ALL_DAY', label: 'Heldags', description: 'Book hele dagen', Icon: AllDayIcon },
  { value: 'QUANTITY', label: 'Antall', description: 'Book ett eller flere', Icon: QuantityIcon },
  { value: 'CAPACITY', label: 'Kapasitet', description: 'Delt booking med andre', Icon: CapacityIcon },
  { value: 'PACKAGE', label: 'Pakke', description: 'Forhåndsdefinerte pakker', Icon: PackageIcon },
];

const CANCELLATION_POLICIES = [
  { value: 'flexible', label: 'Fleksibel', description: 'Gratis avbestilling inntil 24 timer før', Icon: FlexibleIcon },
  { value: 'moderate', label: 'Moderat', description: 'Gratis avbestilling inntil 5 dager før', Icon: ModerateIcon },
  { value: 'strict', label: 'Streng', description: 'Ingen refusjon ved avbestilling', Icon: StrictIcon },
];

export function BookingConfigStep({ data, onChange, errors = [] }: BookingConfigStepProps) {
  const defaultConfig: ListingBookingConfig = {
    bookingModel: 'TIME_RANGE',
    slotDurationMinutes: 60,
    minLeadTimeHours: 1,
    maxAdvanceDays: 90,
    bufferAfterMinutes: 0,
    approvalRequired: false,
    paymentRequired: false,
    depositPercent: 0,
    cancellationPolicy: 'flexible',
    allowRecurring: false,
    allowSeasonalLease: false,
  };
  const config = { ...defaultConfig, ...data.bookingConfig };

  const handleConfigChange = <K extends keyof ListingBookingConfig>(
    field: K,
    value: ListingBookingConfig[K]
  ) => {
    onChange({
      bookingConfig: {
        ...config,
        [field]: value,
      } as ListingBookingConfig,
    });
  };

  // Shared styles for selection cards (matching sidebar selected state)
  const getSelectionCardStyle = (isSelected: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--ds-spacing-4)',
    borderRadius: 'var(--ds-border-radius-md)',
    border: isSelected
      ? '2px solid var(--ds-color-accent-base-default)'
      : '1px solid var(--ds-color-neutral-border-default)',
    backgroundColor: isSelected
      ? 'var(--ds-color-neutral-surface-hover)'  // Light grayish like sidebar selected
      : 'var(--ds-color-neutral-background-default)',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.15s ease',
    minHeight: '120px',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Bookinginnstillinger
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Konfigurer hvordan bookinger skal håndteres
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* Booking Type Selection */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Bookingtype
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Velg hvordan brukere kan booke dette objektet
        </Paragraph>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-3)' }}>
          {BOOKING_MODELS.map((model) => {
            const isSelected = config.bookingModel === model.value;
            const IconComponent = model.Icon;
            return (
              <button
                key={model.value}
                type="button"
                onClick={() => handleConfigChange('bookingModel', model.value as ListingBookingConfig['bookingModel'])}
                style={getSelectionCardStyle(isSelected)}
              >
                <div
                  style={{
                    marginBottom: 'var(--ds-spacing-2)',
                    color: isSelected ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  <IconComponent size={32} />
                </div>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {model.label}
                </Paragraph>
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    marginTop: 'var(--ds-spacing-1)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {model.description}
                </Paragraph>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Time Configuration */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Tidsinnstillinger
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <Textfield
            label="Booking-intervall"
            description="Minste bookbare enhet (minutter)"
            type="number"
            min={15}
            step={15}
            value={config.slotDurationMinutes?.toString() || '60'}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0) handleConfigChange('slotDurationMinutes', val);
            }}
            placeholder="60"
          />
          <Textfield
            label="Buffer mellom bookinger"
            description="Tid mellom avsluttet og ny booking (minutter)"
            type="number"
            min={0}
            step={5}
            value={config.bufferAfterMinutes?.toString() || '0'}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 0) handleConfigChange('bufferAfterMinutes', val);
            }}
            placeholder="0"
          />
        </div>
      </Card>

      {/* Booking Limits */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Bookingbegrensninger
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <Textfield
            label="Minimum varsel"
            description="Hvor tidlig før start må booking gjøres (timer)"
            type="number"
            min={0}
            value={config.minLeadTimeHours?.toString() || '1'}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 0) handleConfigChange('minLeadTimeHours', val);
            }}
            placeholder="1"
          />
          <Textfield
            label="Maks fremtidig booking"
            description="Hvor langt frem i tid kan man booke (dager)"
            type="number"
            min={1}
            value={config.maxAdvanceDays?.toString() || '90'}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0) handleConfigChange('maxAdvanceDays', val);
            }}
            placeholder="90"
          />
        </div>
      </Card>

      {/* Cancellation Policy */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Avbestillingsregler
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Velg hvor fleksibel avbestillingen skal være
        </Paragraph>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-3)' }}>
          {CANCELLATION_POLICIES.map((policy) => {
            const isSelected = config.cancellationPolicy === policy.value;
            const IconComponent = policy.Icon;
            return (
              <button
                key={policy.value}
                type="button"
                onClick={() => handleConfigChange('cancellationPolicy', policy.value as ListingBookingConfig['cancellationPolicy'])}
                style={getSelectionCardStyle(isSelected)}
              >
                <div
                  style={{
                    marginBottom: 'var(--ds-spacing-2)',
                    color: isSelected
                      ? policy.value === 'flexible' ? 'var(--ds-color-success-base-default)'
                        : policy.value === 'moderate' ? 'var(--ds-color-warning-base-default)'
                        : 'var(--ds-color-danger-base-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  <IconComponent size={32} />
                </div>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {policy.label}
                </Paragraph>
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    marginTop: 'var(--ds-spacing-1)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {policy.description}
                </Paragraph>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Additional Options */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Tilleggsvalg
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {/* Approval Required */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: config.approvalRequired ? 'var(--ds-color-neutral-surface-hover)' : 'var(--ds-color-neutral-background-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: config.approvalRequired ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: config.approvalRequired ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Krever godkjenning
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Booking må godkjennes manuelt før den bekreftes
                </Paragraph>
              </div>
            </div>
            <Switch
              checked={config.approvalRequired}
              onChange={(e) => handleConfigChange('approvalRequired', e.target.checked)}
              aria-label="Krever godkjenning"
            />
          </div>

          {/* Payment Required */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: config.paymentRequired ? 'var(--ds-color-neutral-surface-hover)' : 'var(--ds-color-neutral-background-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: config.paymentRequired ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: config.paymentRequired ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Krever betaling
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Bruker må betale ved booking
                </Paragraph>
              </div>
            </div>
            <Switch
              checked={config.paymentRequired}
              onChange={(e) => handleConfigChange('paymentRequired', e.target.checked)}
              aria-label="Krever betaling"
            />
          </div>

          {/* Deposit (shown only if payment required) */}
          {config.paymentRequired && (
            <div
              style={{
                marginLeft: 'var(--ds-spacing-6)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderLeft: '3px solid var(--ds-color-accent-base-default)',
              }}
            >
              <Textfield
                label="Depositum (%)"
                description="Prosentandel som må betales ved booking"
                type="number"
                min={0}
                max={100}
                value={config.depositPercent?.toString() || '0'}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 0 && val <= 100) handleConfigChange('depositPercent', val);
                }}
                placeholder="0"
              />
            </div>
          )}

          {/* Allow Recurring */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: config.allowRecurring ? 'var(--ds-color-neutral-surface-hover)' : 'var(--ds-color-neutral-background-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: config.allowRecurring ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: config.allowRecurring ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Tillat gjentakende bookinger
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Brukere kan opprette repeterende bookinger
                </Paragraph>
              </div>
            </div>
            <Switch
              checked={config.allowRecurring}
              onChange={(e) => handleConfigChange('allowRecurring', e.target.checked)}
              aria-label="Tillat gjentakende bookinger"
            />
          </div>

          {/* Allow Seasonal Lease */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: config.allowSeasonalLease ? 'var(--ds-color-neutral-surface-hover)' : 'var(--ds-color-neutral-background-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: config.allowSeasonalLease ? '2px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: config.allowSeasonalLease ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
              </svg>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Tillat sesongbasert leie
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Aktiver langtidsleie for sesonger
                </Paragraph>
              </div>
            </div>
            <Switch
              checked={config.allowSeasonalLease}
              onChange={(e) => handleConfigChange('allowSeasonalLease', e.target.checked)}
              aria-label="Tillat sesongbasert leie"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
