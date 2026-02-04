/**
 * OrganizationInvoicesPage
 *
 * Organization invoices list for Minside app
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
import { useOrgInvoices, useDownloadOrgInvoice } from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';
import { NavLink } from 'react-router-dom';

const MOBILE_BREAKPOINT = 768;
const ORG_ID = 'demo-org';

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
  
  const color = colors[status] || colors.draft;
  
  return (
    <Badge style={{ backgroundColor: color.bg, color: color.text }}>
      {t(`invoice.${status}`)}
    </Badge>
  );
}

export function OrganizationInvoicesPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: invoicesData, isLoading } = useOrgInvoices(ORG_ID, 
    statusFilter ? { status: statusFilter } : undefined
  );
  const downloadInvoice = useDownloadOrgInvoice();
  
  const invoices = invoicesData?.data ?? [];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO') + ' kr';
  };

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await downloadInvoice.mutateAsync({ orgId: ORG_ID, invoiceId });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <NavLink to="/org" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none', fontSize: 'var(--ds-font-size-sm)' }}>
          ← {t('org.backToDashboard')}
        </NavLink>
        <Heading level={1} data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
          {t('org.invoices')}
        </Heading>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', overflowX: 'auto' }}>
        {(['all', 'paid', 'sent', 'overdue'] as const).map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={(filter === 'all' && !statusFilter) || statusFilter === filter ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter(filter === 'all' ? undefined : filter as InvoiceStatus)}
            style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
          >
            {filter === 'all' ? t('bookings.all') : t(`invoice.${filter}`)}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading')} data-size="lg" />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('org.noInvoices')}
            </Paragraph>
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {invoices.map((invoice: { id: string; invoiceNumber: string; dueDate: string; amount: number; status: string }) => (
              <div
                key={invoice.id}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-2)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {invoice.invoiceNumber}
                  </Paragraph>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('billing.dueDate')}: {invoice.dueDate}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--ds-spacing-3)' }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {formatCurrency(invoice.amount)}
                  </Paragraph>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                    style={{ minHeight: '44px' }}
                  >
                    {t('common.download')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
              {invoices.map((invoice: { id: string; invoiceNumber: string; dueDate: string; amount: number; status: string }) => (
                <Table.Row key={invoice.id}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{invoice.invoiceNumber}</span>
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
