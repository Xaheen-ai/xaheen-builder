/**
 * Payment Reconciliation Page
 * Admin view for payment reconciliation with filtering and detailed transaction history
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  Card,
  Drawer,
  DrawerSection,
  DrawerItem,
  Stack,
  Text,
  PaymentStatusBadge,
  FilterIcon,
  ChevronRightIcon,
  Select,
  Textfield,
} from '@xaheen/ds';
import { usePaymentReconciliation, formatDate, formatCurrency } from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';

// Payment status filter options
const PAYMENT_STATUS_OPTIONS = [
  { id: 'all', label: 'Alle betalinger' },
  { id: 'paid', label: 'Betalt' },
  { id: 'unpaid', label: 'Ikke betalt' },
  { id: 'partial', label: 'Delvis betalt' },
  { id: 'refunded', label: 'Refundert' },
];

// Payment provider filter options
const PROVIDER_OPTIONS = [
  { id: 'all', label: 'Alle betalingsleverandører' },
  { id: 'vipps', label: 'Vipps' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'manual', label: 'Manuell' },
];

export function PaymentReconciliationPage() {
  const t = useT();
  const { locale } = useLocale();
  const formatLocale = locale === 'en' ? 'en-US' : 'nb-NO';

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Build query params
  const reconciliationParams = useMemo(() => {
    const params: {
      startDate?: string;
      endDate?: string;
      status?: string;
      provider?: string;
    } = {};
    if (dateFrom) params.startDate = dateFrom;
    if (dateTo) params.endDate = dateTo;
    if (selectedPaymentStatus !== 'all') params.status = selectedPaymentStatus;
    if (selectedProvider !== 'all') params.provider = selectedProvider;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [dateFrom, dateTo, selectedPaymentStatus, selectedProvider]);

  // Fetch payment reconciliation data
  const { data: reconciliationData, isLoading } = usePaymentReconciliation(reconciliationParams);

  // Active filter count
  const activeFilterCount = [
    selectedPaymentStatus !== 'all',
    selectedProvider !== 'all',
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Get selected payment details
  const selectedPayment = useMemo(() => {
    if (!selectedBookingId || !reconciliationData?.data) return null;
    return reconciliationData.data.find((p) => p.bookingId === selectedBookingId);
  }, [selectedBookingId, reconciliationData]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedPaymentStatus('all');
    setSelectedProvider('all');
    setDateFrom('');
    setDateTo('');
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!reconciliationData?.data) {
      return { totalAmount: 0, paidAmount: 0, refundedAmount: 0, outstandingAmount: 0 };
    }
    return reconciliationData.data.reduce(
      (acc, payment) => ({
        totalAmount: acc.totalAmount + payment.totalAmount,
        paidAmount: acc.paidAmount + payment.paidAmount,
        refundedAmount: acc.refundedAmount + payment.refundedAmount,
        outstandingAmount: acc.outstandingAmount + (payment.totalAmount - payment.paidAmount),
      }),
      { totalAmount: 0, paidAmount: 0, refundedAmount: 0, outstandingAmount: 0 }
    );
  }, [reconciliationData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('payments.reconciliation.title', 'Betalingsavstemminger')}
          </Heading>
          <Paragraph
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              marginTop: 'var(--ds-spacing-2)',
              marginBottom: 0,
            }}
          >
            {t('payments.reconciliation.subtitle', 'Oversikt over betalinger og transaksjoner')}
          </Paragraph>
        </div>
        <Button
          type="button"
          variant="secondary"
          aria-label={t('common.openFilters', 'Åpne filtre')}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FilterIcon />
          {t('common.filters', 'Filtre')}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </Button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Text style={{ fontSize: 'var(--ds-font-size-body-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('payments.reconciliation.totalAmount', 'Totalt beløp')}
          </Text>
          <Heading level={2} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {formatCurrency(totals.totalAmount, 'NOK', formatLocale)}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Text style={{ fontSize: 'var(--ds-font-size-body-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('payments.reconciliation.paidAmount', 'Betalt')}
          </Text>
          <Heading
            level={2}
            data-size="md"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-success-text-default)',
            }}
          >
            {formatCurrency(totals.paidAmount, 'NOK', formatLocale)}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Text style={{ fontSize: 'var(--ds-font-size-body-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('payments.reconciliation.refundedAmount', 'Refundert')}
          </Text>
          <Heading
            level={2}
            data-size="md"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-warning-text-default)',
            }}
          >
            {formatCurrency(totals.refundedAmount, 'NOK', formatLocale)}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Text style={{ fontSize: 'var(--ds-font-size-body-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('payments.reconciliation.outstandingAmount', 'Utestående')}
          </Text>
          <Heading
            level={2}
            data-size="md"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-danger-text-default)',
            }}
          >
            {formatCurrency(totals.outstandingAmount, 'NOK', formatLocale)}
          </Heading>
        </Card>
      </div>

      {/* Filter Drawer */}
      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen} position="right">
        <DrawerSection title={t('common.filters', 'Filtre')}>
          <Stack direction="column" gap="var(--ds-spacing-4)">
            {/* Payment Status Filter */}
            <div>
              <Text as="label" style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('payments.reconciliation.paymentStatus', 'Betalingsstatus')}
              </Text>
              <Select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Provider Filter */}
            <div>
              <Text as="label" style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('payments.reconciliation.provider', 'Betalingsleverandør')}
              </Text>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Text as="label" style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('payments.reconciliation.dateFrom', 'Fra dato')}
              </Text>
              <Textfield
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Text as="label" style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('payments.reconciliation.dateTo', 'Til dato')}
              </Text>
              <Textfield
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button type="button" variant="tertiary" onClick={clearFilters} style={{ alignSelf: 'flex-start' }}>
                {t('common.clearFilters', 'Nullstill filtre')}
              </Button>
            )}
          </Stack>
        </DrawerSection>
      </Drawer>

      {/* Payment List */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading', 'Laster...')} data-size="lg" />
          </div>
        ) : !reconciliationData?.data || reconciliationData.data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('payments.reconciliation.noPayments', 'Ingen betalinger funnet')}
            </Paragraph>
          </div>
        ) : (
          <Table data-size="sm" zebra>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('payments.reconciliation.bookingId', 'Booking ID')}</Table.HeaderCell>
                <Table.HeaderCell>{t('payments.reconciliation.totalAmount', 'Totalbeløp')}</Table.HeaderCell>
                <Table.HeaderCell>{t('payments.reconciliation.paidAmount', 'Betalt')}</Table.HeaderCell>
                <Table.HeaderCell>{t('payments.reconciliation.refundedAmount', 'Refundert')}</Table.HeaderCell>
                <Table.HeaderCell>{t('payments.reconciliation.status', 'Status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('payments.reconciliation.transactions', 'Transaksjoner')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.actions', 'Handlinger')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {reconciliationData.data.map((payment) => (
                <Table.Row key={payment.bookingId}>
                  <Table.Cell>
                    <Text style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-body-sm)' }}>
                      {payment.bookingId.slice(0, 8)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {formatCurrency(payment.totalAmount, payment.currency, formatLocale)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text style={{ color: 'var(--ds-color-success-text-default)' }}>
                      {formatCurrency(payment.paidAmount, payment.currency, formatLocale)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text style={{ color: 'var(--ds-color-warning-text-default)' }}>
                      {formatCurrency(payment.refundedAmount, payment.currency, formatLocale)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <PaymentStatusBadge status={payment.status as 'paid' | 'unpaid' | 'partial' | 'refunded'} />
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{payment.transactions.length} transaksjoner</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      type="button"
                      variant="tertiary"
                      data-size="sm"
                      aria-label={t('common.viewPaymentDetails', 'Se betalingsdetaljer')}
                      onClick={() => setSelectedBookingId(payment.bookingId)}
                    >
                      {t('common.viewDetails', 'Se detaljer')}
                      <ChevronRightIcon />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Payment Details Drawer */}
      {selectedPayment && (
        <Drawer open={!!selectedBookingId} onOpenChange={() => setSelectedBookingId(null)} position="right">
          <DrawerSection title={t('payments.reconciliation.paymentDetails', 'Betalingsdetaljer')}>
            <Stack direction="column" gap="var(--ds-spacing-4)">
              <DrawerItem
                label={t('payments.reconciliation.bookingId', 'Booking ID')}
                value={selectedPayment.bookingId}
              />
              <DrawerItem
                label={t('payments.reconciliation.totalAmount', 'Totalbeløp')}
                value={formatCurrency(selectedPayment.totalAmount, selectedPayment.currency, formatLocale)}
              />
              <DrawerItem
                label={t('payments.reconciliation.paidAmount', 'Betalt')}
                value={formatCurrency(selectedPayment.paidAmount, selectedPayment.currency, formatLocale)}
              />
              <DrawerItem
                label={t('payments.reconciliation.refundedAmount', 'Refundert')}
                value={formatCurrency(selectedPayment.refundedAmount, selectedPayment.currency, formatLocale)}
              />
              <div>
                <Text style={{ fontSize: 'var(--ds-font-size-body-sm)', color: 'var(--ds-color-neutral-text-subtle)', display: 'block', marginBottom: 'var(--ds-spacing-2)' }}>
                  {t('payments.reconciliation.status', 'Status')}
                </Text>
                <PaymentStatusBadge status={selectedPayment.status as 'paid' | 'unpaid' | 'partial' | 'refunded'} />
              </div>
            </Stack>
          </DrawerSection>

          <DrawerSection title={t('payments.reconciliation.transactionHistory', 'Transaksjonshistorikk')}>
            <Stack direction="column" gap="var(--ds-spacing-3)">
              {selectedPayment.transactions.length === 0 ? (
                <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('payments.reconciliation.noTransactions', 'Ingen transaksjoner')}
                </Text>
              ) : (
                selectedPayment.transactions.map((transaction) => (
                  <Card key={transaction.transactionId} style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-background-subtle)' }}>
                    <Stack direction="column" gap="var(--ds-spacing-2)">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {transaction.transactionType === 'payment' ? 'Betaling' : transaction.transactionType === 'refund' ? 'Refundering' : transaction.transactionType === 'capture' ? 'Trekking' : 'Annet'}
                        </Text>
                        <Text style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {formatCurrency(transaction.amount, transaction.currency, formatLocale)}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ds-font-size-body-sm)' }}>
                        <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {transaction.provider}
                        </Text>
                        <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {formatDate(transaction.createdAt, formatLocale)}
                        </Text>
                      </div>
                      <div style={{ fontSize: 'var(--ds-font-size-body-sm)' }}>
                        <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {transaction.status}
                        </Text>
                      </div>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </DrawerSection>
        </Drawer>
      )}
    </div>
  );
}
