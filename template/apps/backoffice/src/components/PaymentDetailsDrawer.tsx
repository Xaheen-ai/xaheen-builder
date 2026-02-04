/**
 * PaymentDetailsDrawer Component
 *
 * Displays complete payment history for a booking, including all transactions,
 * refunds, and captures. Used in payment reconciliation and booking management.
 *
 * @module apps/backoffice/src/components/PaymentDetailsDrawer
 */

import { useMemo } from 'react';
import {
  Drawer,
  DrawerSection,
  DrawerItem,
  Stack,
  Card,
  Text,
  Spinner,
  Heading,
} from '@xaheen/ds';
import { usePaymentHistory, formatCurrency, formatDate, type PaymentTransaction } from '@xaheen/sdk';
import { useT } from '@xaheen/i18n';

// =============================================================================
// TYPES
// =============================================================================

export interface PaymentDetailsDrawerProps {
  /** Booking ID to show payment history for */
  bookingId: string | null;
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get display label for transaction type
 */
function getTransactionTypeLabel(type: PaymentTransaction['transactionType']): string {
  const labels: Record<PaymentTransaction['transactionType'], string> = {
    payment: 'Betaling',
    refund: 'Refundering',
    capture: 'Trekking',
    reserve: 'Reservering',
  };
  return labels[type] || type;
}

/**
 * Get display label for transaction status
 */
function getTransactionStatusLabel(status: PaymentTransaction['status']): string {
  const labels: Record<PaymentTransaction['status'], string> = {
    initiated: 'Initiert',
    pending: 'Venter',
    completed: 'Fullført',
    failed: 'Feilet',
    cancelled: 'Avbrutt',
  };
  return labels[status] || status;
}

/**
 * Get display label for provider
 */
function getProviderLabel(provider: PaymentTransaction['provider']): string {
  const labels: Record<PaymentTransaction['provider'], string> = {
    vipps: 'Vipps',
    stripe: 'Stripe',
    invoice: 'Faktura',
  };
  return labels[provider] || provider;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * PaymentDetailsDrawer - Displays payment history for a booking
 *
 * @example Basic usage
 * ```tsx
 * <PaymentDetailsDrawer
 *   bookingId={selectedBookingId}
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 * />
 * ```
 */
export function PaymentDetailsDrawer({
  bookingId,
  isOpen,
  onClose,
}: PaymentDetailsDrawerProps): React.ReactElement {
  const t = useT();

  // Fetch payment history for the booking
  const { data: historyData, isLoading, error } = usePaymentHistory(bookingId || '');

  // Calculate payment summary
  const summary = useMemo(() => {
    if (!historyData?.data) {
      return { totalPaid: 0, totalRefunded: 0, currency: 'NOK' };
    }

    const transactions = historyData.data;
    const totalPaid = transactions
      .filter((t) => t.transactionType === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunded = transactions
      .filter((t) => t.transactionType === 'refund' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const currency = transactions[0]?.currency || 'NOK';

    return { totalPaid, totalRefunded, currency };
  }, [historyData]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      size="md"
      title={t('payments.details.title', 'Betalingsdetaljer')}
      aria-label={t('payments.details.ariaLabel', 'Betalingsdetaljer for booking')}
    >
      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--ds-spacing-8)',
          }}
        >
          <Spinner
            aria-label={t('common.loading', 'Laster...')}
            data-size="lg"
          />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <DrawerSection title={t('common.error', 'Feil')}>
          <Text style={{ color: 'var(--ds-color-danger-text-default)' }}>
            {t('payments.details.errorLoading', 'Kunne ikke laste betalingshistorikk')}
          </Text>
        </DrawerSection>
      )}

      {/* Payment Summary */}
      {!isLoading && !error && historyData?.data && (
        <>
          <DrawerSection title={t('payments.details.summary', 'Sammendrag')}>
            <Stack direction="vertical" gap="var(--ds-spacing-4)">
              <DrawerItem>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{t('payments.details.bookingId', 'Booking ID')}</span>
                  <strong>{bookingId || ''}</strong>
                </div>
              </DrawerItem>
              <DrawerItem>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{t('payments.details.totalPaid', 'Totalt betalt')}</span>
                  <strong>{formatCurrency(summary.totalPaid, summary.currency)}</strong>
                </div>
              </DrawerItem>
              <DrawerItem>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{t('payments.details.totalRefunded', 'Totalt refundert')}</span>
                  <strong>{formatCurrency(summary.totalRefunded, summary.currency)}</strong>
                </div>
              </DrawerItem>
              <DrawerItem>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{t('payments.details.netAmount', 'Netto beløp')}</span>
                  <strong>{formatCurrency(summary.totalPaid - summary.totalRefunded, summary.currency)}</strong>
                </div>
              </DrawerItem>
            </Stack>
          </DrawerSection>

          {/* Transaction History */}
          <DrawerSection title={t('payments.details.transactionHistory', 'Transaksjonshistorikk')}>
            <Stack direction="vertical" gap="var(--ds-spacing-3)">
              {historyData.data.length === 0 ? (
                <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('payments.details.noTransactions', 'Ingen transaksjoner funnet')}
                </Text>
              ) : (
                historyData.data.map((transaction) => (
                  <Card
                    key={transaction.transactionId}
                    style={{
                      padding: 'var(--ds-spacing-4)',
                      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                      borderLeft: `4px solid ${
                        transaction.status === 'completed'
                          ? 'var(--ds-color-success-border-default)'
                          : transaction.status === 'failed'
                            ? 'var(--ds-color-danger-border-default)'
                            : 'var(--ds-color-neutral-border-default)'
                      }`,
                    }}
                  >
                    <Stack direction="vertical" gap="var(--ds-spacing-3)">
                      {/* Transaction Type and Amount */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                            {getTransactionTypeLabel(transaction.transactionType)}
                          </Heading>
                          <Text
                            style={{
                              fontSize: 'var(--ds-font-size-sm)',
                              color: 'var(--ds-color-neutral-text-subtle)',
                              marginTop: 'var(--ds-spacing-1)',
                            }}
                          >
                            {getProviderLabel(transaction.provider)}
                          </Text>
                        </div>
                        <Heading
                          level={3}
                          data-size="sm"
                          style={{
                            margin: 0,
                            color:
                              transaction.transactionType === 'refund'
                                ? 'var(--ds-color-warning-text-default)'
                                : 'var(--ds-color-neutral-text-default)',
                          }}
                        >
                          {transaction.transactionType === 'refund' ? '−' : ''}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </Heading>
                      </div>

                      {/* Transaction Details */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'var(--ds-spacing-2)',
                          fontSize: 'var(--ds-font-size-sm)',
                        }}
                      >
                        <div>
                          <Text
                            style={{
                              color: 'var(--ds-color-neutral-text-subtle)',
                              display: 'block',
                              marginBottom: 'var(--ds-spacing-1)',
                            }}
                          >
                            {t('payments.details.status', 'Status')}
                          </Text>
                          <Text style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                            {getTransactionStatusLabel(transaction.status)}
                          </Text>
                        </div>
                        <div>
                          <Text
                            style={{
                              color: 'var(--ds-color-neutral-text-subtle)',
                              display: 'block',
                              marginBottom: 'var(--ds-spacing-1)',
                            }}
                          >
                            {t('payments.details.date', 'Dato')}
                          </Text>
                          <Text style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                            {formatDate(transaction.createdAt)}
                          </Text>
                        </div>
                      </div>

                      {/* Transaction ID */}
                      {transaction.orderId && (
                        <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                          <Text
                            style={{
                              color: 'var(--ds-color-neutral-text-subtle)',
                              display: 'block',
                              marginBottom: 'var(--ds-spacing-1)',
                            }}
                          >
                            {t('payments.details.orderId', 'Ordre-ID')}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'var(--ds-font-family-mono)',
                              fontSize: 'var(--ds-font-size-xs)',
                            }}
                          >
                            {transaction.orderId}
                          </Text>
                        </div>
                      )}

                      {/* Completed At */}
                      {transaction.completedAt && (
                        <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                          <Text
                            style={{
                              color: 'var(--ds-color-neutral-text-subtle)',
                              display: 'block',
                              marginBottom: 'var(--ds-spacing-1)',
                            }}
                          >
                            {t('payments.details.completedAt', 'Fullført')}
                          </Text>
                          <Text>
                            {formatDate(transaction.completedAt)}
                          </Text>
                        </div>
                      )}

                      {/* Failure Reason */}
                      {transaction.failureReason && (
                        <div
                          style={{
                            fontSize: 'var(--ds-font-size-sm)',
                            padding: 'var(--ds-spacing-2)',
                            backgroundColor: 'var(--ds-color-danger-surface-default)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                          }}
                        >
                          <Text
                            style={{
                              color: 'var(--ds-color-danger-text-default)',
                              fontWeight: 'var(--ds-font-weight-medium)',
                            }}
                          >
                            {t('payments.details.failureReason', 'Feilmelding')}:{' '}
                            {transaction.failureReason}
                          </Text>
                        </div>
                      )}
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </DrawerSection>
        </>
      )}
    </Drawer>
  );
}
