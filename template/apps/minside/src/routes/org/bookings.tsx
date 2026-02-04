/**
 * OrganizationBookingsPage
 *
 * Organization bookings list for Minside app
 * - Filterable by status
 * - Mobile responsive
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  BookingStatusBadge,
} from '@xaheen/ds';
import { useT, useLocale } from '@xaheen/i18n';
import { NavLink } from 'react-router-dom';

const MOBILE_BREAKPOINT = 768;

// Mock org bookings
const mockOrgBookings = [
  {
    id: 'org-booking-1',
    listingName: 'Idrettshall A',
    startTime: '2026-01-20T18:00:00Z',
    endTime: '2026-01-20T20:00:00Z',
    status: 'confirmed',
    bookedBy: 'Erik Hansen',
    totalPrice: 1500,
  },
  {
    id: 'org-booking-2',
    listingName: 'Fotballbane 1',
    startTime: '2026-01-22T16:00:00Z',
    endTime: '2026-01-22T18:00:00Z',
    status: 'pending',
    bookedBy: 'Kari Olsen',
    totalPrice: 1200,
  },
];

export function OrganizationBookingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [isLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bookings = statusFilter 
    ? mockOrgBookings.filter(b => b.status === statusFilter)
    : mockOrgBookings;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(locale === 'en' ? 'en-US' : 'nb-NO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO') + ' kr';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <NavLink to="/org" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none', fontSize: 'var(--ds-font-size-sm)' }}>
            ← {t('org.backToDashboard')}
          </NavLink>
          <Heading level={1} data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {t('org.bookings')}
          </Heading>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', overflowX: 'auto' }}>
        {['all', 'confirmed', 'pending', 'cancelled'].map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={(filter === 'all' && !statusFilter) || statusFilter === filter ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter(filter === 'all' ? undefined : filter)}
            style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
          >
            {filter === 'all' ? t('bookings.all') : t(`booking.${filter}`)}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading')} data-size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('org.noBookings')}
            </Paragraph>
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-2)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {booking.listingName}
                  </Paragraph>
                  <BookingStatusBadge status={booking.status as string} />
                </div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {formatDate(booking.startTime)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('org.bookedBy')}: {booking.bookedBy}
                </Paragraph>
                <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {formatCurrency(booking.totalPrice)}
                </Paragraph>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('bookings.resource')}</Table.HeaderCell>
                <Table.HeaderCell>{t('bookings.timespan')}</Table.HeaderCell>
                <Table.HeaderCell>{t('org.bookedBy')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.price')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {bookings.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{booking.listingName}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(booking.startTime)}</span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{booking.bookedBy}</Table.Cell>
                  <Table.Cell>
                    <BookingStatusBadge status={booking.status as string} />
                  </Table.Cell>
                  <Table.Cell>{formatCurrency(booking.totalPrice)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
