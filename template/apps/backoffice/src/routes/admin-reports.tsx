/**
 * AdminReportsPage
 *
 * Admin page for generating and viewing reports
 * - Booking statistics
 * - Revenue reports
 * - Usage analytics
 * - Export functionality
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Input,
  Spinner,
  Table,
} from '@xaheen/ds';
import { useLocale } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

// Mock report data
const mockReports = {
  bookings: {
    total: 1247,
    approved: 1089,
    pending: 98,
    rejected: 60,
    thisMonth: 156,
    growth: 12.5,
  },
  revenue: {
    total: 892000,
    thisMonth: 78500,
    growth: 8.2,
    avgBookingValue: 715,
  },
  topListings: [
    { name: 'Idrettshall A', bookings: 312, revenue: 223000, utilization: 78 },
    { name: 'Fotballbane 1', bookings: 289, revenue: 145000, utilization: 65 },
    { name: 'Svømmehall', bookings: 198, revenue: 178500, utilization: 82 },
    { name: 'Idrettshall B', bookings: 176, revenue: 126000, utilization: 54 },
  ],
};

export function AdminReportsPage() {
  const { locale } = useLocale();
  const [reportType, setReportType] = useState<'overview' | 'bookings' | 'revenue' | 'listings'>('overview');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-01-31');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert(`Eksporterer rapport som ${format.toUpperCase()}...`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Rapporter
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Statistikk og analyser for plattformen
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button type="button" variant="secondary" data-size="md" onClick={() => handleExport('csv')} disabled={isLoading} style={{ minHeight: '44px' }}>
            Eksporter CSV
          </Button>
          <Button type="button" variant="primary" data-size="md" onClick={() => handleExport('pdf')} disabled={isLoading} style={{ minHeight: '44px' }}>
            Eksporter PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 'var(--ds-spacing-4)',
          alignItems: isMobile ? 'stretch' : 'flex-end',
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>Rapporttype</label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as typeof reportType)}
              style={{ width: '100%' }}
            >
              <option value="overview">Oversikt</option>
              <option value="bookings">Bookinger</option>
              <option value="revenue">Inntekter</option>
              <option value="listings">Lokaler</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>Fra dato</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>Til dato</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%' }} />
          </div>
          <Button type="button" variant="primary" data-size="md" style={{ minHeight: '44px' }}>
            Generer
          </Button>
        </div>
      </Card>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Totalt bookinger</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{mockReports.bookings.total.toLocaleString()}</Heading>
          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
            +{mockReports.bookings.growth}% fra forrige periode
          </Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Ventende</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>{mockReports.bookings.pending}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Total omsetning</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{formatCurrency(mockReports.revenue.total)}</Heading>
          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
            +{mockReports.revenue.growth}%
          </Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Snitt per booking</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{formatCurrency(mockReports.revenue.avgBookingValue)}</Heading>
        </Card>
      </div>

      {/* Top Listings Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>Topp lokaler</Heading>
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster..." data-size="lg" />
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Lokale</Table.HeaderCell>
                <Table.HeaderCell>Bookinger</Table.HeaderCell>
                <Table.HeaderCell>Omsetning</Table.HeaderCell>
                <Table.HeaderCell>Utnyttelse</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {mockReports.topListings.map((listing) => (
                <Table.Row key={listing.name}>
                  <Table.Cell><span style={{ fontWeight: 600 }}>{listing.name}</span></Table.Cell>
                  <Table.Cell>{listing.bookings}</Table.Cell>
                  <Table.Cell>{formatCurrency(listing.revenue)}</Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <div style={{
                        width: '60px',
                        height: '6px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${listing.utilization}%`,
                          height: '100%',
                          backgroundColor: listing.utilization > 70 ? 'var(--ds-color-success-base-default)' : 
                                          listing.utilization > 50 ? 'var(--ds-color-warning-base-default)' : 
                                          'var(--ds-color-danger-base-default)',
                        }} />
                      </div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{listing.utilization}%</span>
                    </div>
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
