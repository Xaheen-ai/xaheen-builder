/**
 * PaymentSection Component
 *
 * Payment section for BookingDialog that shows:
 * - Pricing breakdown
 * - Vipps payment option
 * - Payment initiation flow
 */

import * as React from 'react';
import {
  Heading,
  Paragraph,
  Button,
  Label,
} from '@digdir/designsystemet-react';
import { useInitiatePayment, auditService } from '@xaheen/sdk';
import type { InitiatePaymentDTO } from '@xaheen/sdk';

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  vipps: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#FF5B24" stroke="none"/>
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// =============================================================================
// Types
// =============================================================================

export interface PaymentSectionProps {
  amount: number;
  currency?: string;
  description?: string;
  bookingId?: string;
  onPaymentInitiated?: (paymentUrl: string, orderId: string) => void;
  disabled?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function PaymentSection({
  amount,
  currency = 'NOK',
  description = 'Booking betaling',
  bookingId,
  onPaymentInitiated,
  disabled = false,
}: PaymentSectionProps): React.ReactElement {
  const initiatePayment = useInitiatePayment();

  const handlePayment = async () => {
    try {
      // Build return URL for Vipps callback
      const returnUrl = `${window.location.origin}/payment/callback`;

      const paymentData: InitiatePaymentDTO = {
        bookingId: bookingId ?? 'temp-booking-id',
        amount,
        description,
        returnUrl,
      };

      const response = await initiatePayment.mutateAsync(paymentData);

      // Extract payment URL and order ID from response
      const paymentUrl = response.data?.url ?? '';
      const orderId = response.data?.orderId ?? '';

      if (paymentUrl && onPaymentInitiated) {
        onPaymentInitiated(paymentUrl, orderId);
      }

      // Redirect to Vipps payment page
      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
    } catch (error) {
      // Error handling is managed by React Query mutation
      auditService.logError('payment_initiation_failed', 'payment', error instanceof Error ? error : String(error), { bookingId, amount, currency });
    }
  };

  const formattedAmount = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency,
  }).format(amount);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
        <span style={{ color: 'var(--ds-color-accent-text-default)' }}>{Icons.wallet}</span>
        <Heading data-size="xs" style={{ margin: 0 }}>
          Betaling
        </Heading>
      </div>

      {/* Pricing Breakdown */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label style={{ margin: 0 }}>Bookinggebyr</Label>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {formattedAmount}
          </Paragraph>
        </div>
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--ds-color-neutral-border-subtle)',
            margin: 'var(--ds-spacing-1) 0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
            Totalt
          </Paragraph>
          <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-accent-text-default)' }}>
            {formattedAmount}
          </Paragraph>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        <Label style={{ margin: 0 }}>Betalingsmetode</Label>

        {/* Vipps Button */}
        <Button
          type="button"
          onClick={handlePayment}
          disabled={disabled || initiatePayment.isPending}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--ds-spacing-2)',
            width: '100%',
            backgroundColor: 'var(--ds-color-accent-base)',
            color: 'var(--ds-color-text-on-accent)',
            border: 'none',
            padding: 'var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            borderRadius: 'var(--ds-border-radius-md)',
            cursor: disabled || initiatePayment.isPending ? 'not-allowed' : 'pointer',
            opacity: disabled || initiatePayment.isPending ? 0.6 : 1,
            transition: 'all 200ms ease',
          }}
        >
          {initiatePayment.isPending ? (
            <>
              <span style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--ds-color-border-on-accent)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
              <span>Behandler...</span>
            </>
          ) : (
            <>
              {Icons.vipps}
              <span>Betal med Vipps</span>
            </>
          )}
        </Button>

        {/* Error Message */}
        {initiatePayment.isError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-danger-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-danger-border-default)',
            }}
          >
            <span style={{ color: 'var(--ds-color-danger-text-default)', flexShrink: 0 }}>
              {Icons.info}
            </span>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
              Kunne ikke starte betaling. Vennligst prøv igjen.
            </Paragraph>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-2)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-info-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <span style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}>
          {Icons.info}
        </span>
        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
          Du vil bli sendt til Vipps for å fullføre betalingen. Bookingen bekreftes først når betaling er godkjent.
        </Paragraph>
      </div>

      {/* Inline keyframe animation for spinner */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
