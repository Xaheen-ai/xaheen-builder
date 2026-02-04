/**
 * BillingPage
 *
 * User billing dashboard for Minside app
 * - Billing summary cards (paid, outstanding)
 * - Invoice list with status filters
 * - Download invoice actions
 * - Mobile-responsive design
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  Badge,
} from '@xaheen/ds';
import {
  useBillingSummary,
  useInvoices,
  useDownloadInvoice,
} from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useT();
  const colors: Record<InvoiceStatus, { bg: string; text: string }> = {
    paid: { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' },
    sent: { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' },
    overdue: { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' },
    draft: { bg: 'var(--ds-color-neutral-surface-default)', text: 'var(--ds-color-neutral-text-default)' },
    cancelled: { bg: 'var(--ds-color-neutral-surface-subtle)', text: 'var(--ds-color-neutral-text-subtle)' },
  };
  
  const labels: Record<InvoiceStatus, string> = {
    paid: t('invoice.paid'),
    sent: t('invoice.sent'),
    overdue: t('invoice.overdue'),
    draft: t('invoice.draft'),
    cancelled: t('invoice.cancelled'),
  };

  const color = colors[status] || colors.draft;
  
  return (
    <Badge
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {labels[status] || status}
    </Badge>
  );
}

export function BillingPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch billing data
  const { data: summaryData, isLoading: summaryLoading } = useBillingSummary();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices(
    statusFilter ? { status: statusFilter } : undefined
  );
  const downloadInvoice = useDownloadInvoice();

  const summary = summaryData?.data;
  const invoices = invoicesData?.data ?? [];

  const handleDownload = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await downloadInvoice.mutateAsync(id);
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO') + ' kr';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('minside.billing')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('minside.billingDesc')}
        </Paragraph>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-4)' }}>
          <Spinner aria-label={t('common.loading')} />
        </div>
      ) : summary ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 'var(--ds-spacing-4)'
        }}>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('billing.totalPaid')}
            </Paragraph>
            <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
              {formatCurrency(summary.totalPaid)}
            </Heading>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('billing.periodLabel')}: {summary.periodStart} - {summary.periodEnd}
            </Paragraph>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('billing.outstanding')}
            </Paragraph>
            <Heading level={2} data-size="xl" style={{ 
              margin: 0, 
              marginTop: 'var(--ds-spacing-2)', 
              color: summary.totalOutstanding > 0 ? 'var(--ds-color-warning-text-default)' : 'var(--ds-color-neutral-text-default)' 
            }}>
              {formatCurrency(summary.totalOutstanding)}
            </Heading>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('billing.unpaidInvoices')}
            </Paragraph>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'var(--ds-spacing-2)',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: isMobile ? 'var(--ds-spacing-2)' : '0',
      }}>
        {(['all', 'paid', 'sent', 'overdue'] as const).map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={(filter === 'all' && !statusFilter) || statusFilter === filter ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter(filter === 'all' ? undefined : filter as InvoiceStatus)}
            style={{
              minHeight: '44px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {filter === 'all' ? t('bookings.all') : t(`invoice.${filter}`)}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            {t('billing.invoices')}
          </Heading>
        </div>

        {invoicesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading')} data-size="lg" />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('billing.noInvoices')}
            </Paragraph>
          </div>
        ) : isMobile ? (
          // Mobile: Card layout
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {invoices.map((invoice: { id: string; invoiceNumber: string; dueDate: string; status: string; amount: number }) => (
              <div
                key={invoice.id}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-2)' }}>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      {invoice.invoiceNumber}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('billing.dueDate')}: {invoice.dueDate}
                    </Paragraph>
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--ds-spacing-3)' }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {formatCurrency(invoice.amount)}
                  </Paragraph>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                    disabled={downloadInvoice.isPending}
                    style={{ minHeight: '44px' }}
                  >
                    {t('common.download')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Table layout
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('billing.invoiceNumber')}</Table.HeaderCell>
                <Table.HeaderCell>{t('billing.dueDate')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.amount')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '100px' }}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {invoices.map((invoice: { id: string; invoiceNumber: string; dueDate: string; status: string; amount: number }) => (
                <Table.Row key={invoice.id}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {invoice.invoiceNumber}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{invoice.dueDate}</Table.Cell>
                  <Table.Cell>{formatCurrency(invoice.amount)}</Table.Cell>
                  <Table.Cell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      type="button"
                      variant="tertiary"
                      data-size="sm"
                      onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                      disabled={downloadInvoice.isPending}
                    >
                      {t('common.download')}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
