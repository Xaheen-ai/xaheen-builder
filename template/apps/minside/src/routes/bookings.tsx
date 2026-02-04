/**
 * BookingsPage
 *
 * Mobile-first responsive bookings page for Minside app with offline support
 * - Stacks stats cards on mobile (< 768px)
 * - Converts table to cards on mobile for better touch UX
 * - Touch-friendly buttons (44px+ touch targets)
 * - Horizontal scrollable filters on mobile
 * - Offline-first with IndexedDB caching
 * - Shows offline indicator when viewing cached data
 * - Follows DIGILIST design patterns
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  BookingStatusBadge,
  useDialog,
  CalendarIcon,
  ClockIcon,
  Link,
} from '@xaheen/ds';
import {
  useCancelBooking,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';
import { useOfflineBookings } from '../hooks/useOfflineBookings';

// Web app URL for new bookings
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

export function BookingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch user's own bookings with offline support
  const { data: bookingsData, isLoading, isOffline, isCached } = useOfflineBookings(
    statusFilter ? { status: statusFilter } : undefined
  );
  const bookings = bookingsData?.data ?? [];

  // Fetch counts for each status for filter badges (with offline support)
  const { data: pendingData } = useOfflineBookings({ status: 'pending' });
  const { data: confirmedData } = useOfflineBookings({ status: 'confirmed' });
  const { data: cancelledData } = useOfflineBookings({ status: 'cancelled' });

  const cancelBooking = useCancelBooking();
  const { confirm } = useDialog();

  const handleCancel = async (id: string) => {
    const confirmed = await confirm({
      title: t('bookings.cancelBooking'),
      description: t('bookings.confirmCancel'),
      confirmText: t('bookings.cancel'),
      cancelText: t('common.abort'),
      variant: 'danger',
    });
    if (confirmed) {
      await cancelBooking.mutateAsync(id);
    }
  };

  // Calculate stats from API data
  const stats = useMemo(() => {
    const pendingCount = pendingData?.meta?.total ?? 0;
    const confirmedCount = confirmedData?.meta?.total ?? 0;
    const cancelledCount = cancelledData?.meta?.total ?? 0;

    return {
      total: pendingCount + confirmedCount + cancelledCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      cancelled: cancelledCount,
    };
  }, [pendingData, confirmedData, cancelledData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Offline Indicator - Shows when viewing cached data */}
      {isOffline && isCached && (
        <Card style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-warning-surface-default)',
          borderLeft: '4px solid var(--ds-color-warning-border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <span style={{ fontSize: 'var(--ds-font-size-lg)' }}>📡</span>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
                {t('minside.offlineMode')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('minside.viewingCachedBookings')}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Header - Responsive: stacks on mobile */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        gap: isMobile ? 'var(--ds-spacing-4)' : '0',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('minside.myBookings')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('minside.myBookingsDesc')}
          </Paragraph>
        </div>
        <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Button
            type="button"
            variant="primary"
            data-size="md"
            style={{
              width: isMobile ? '100%' : 'auto',
              minHeight: '44px', // WCAG AA touch target
            }}
          >
            {t('minside.bookNow')} ↗
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Responsive: 1 column on mobile, 3 columns on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)'
      }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {t('booking.confirmed')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.confirmed}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {t('requests.pending')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-warning-text-default)' }}>
            {stats.pending}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {t('booking.cancelled')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {stats.cancelled}
          </Heading>
        </Card>
      </div>

      {/* Filters - Responsive: horizontal scroll on mobile */}
      <div style={{
        display: 'flex',
        gap: 'var(--ds-spacing-2)',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch', // Smooth scroll on iOS
        paddingBottom: isMobile ? 'var(--ds-spacing-2)' : '0',
        margin: isMobile ? '0 calc(var(--ds-spacing-4) * -1)' : '0', // Bleed to edges on mobile
        padding: isMobile ? '0 var(--ds-spacing-4)' : '0',
      }}>
        <Button
          type="button"
          variant={statusFilter === undefined ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter(undefined)}
          style={{
            minHeight: '44px', // WCAG AA touch target
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t('bookings.all')} ({stats.total})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'confirmed' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('confirmed')}
          style={{
            minHeight: '44px', // WCAG AA touch target
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t('booking.confirmed')} ({stats.confirmed})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'pending' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('pending')}
          style={{
            minHeight: '44px', // WCAG AA touch target
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t('requests.pending')} ({stats.pending})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'cancelled' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('cancelled')}
          style={{
            minHeight: '44px', // WCAG AA touch target
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t('booking.cancelled')}
        </Button>
      </div>

      {/* Bookings List - Responsive: cards on mobile, table on desktop */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('bookings.loadingBookings')} data-size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('minside.noUpcomingBookings')}
          </Paragraph>
          <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 'var(--ds-spacing-4)', display: 'inline-block' }}>
            <Button type="button" variant="primary" data-size="md">
              {t('minside.bookNow')} ↗
            </Button>
          </Link>
        </Card>
      ) : isMobile ? (
        // Mobile: Card-based layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {bookings.map((booking: Booking) => (
            <Card key={booking.id} style={{ padding: 'var(--ds-spacing-4)' }}>
              {/* Resource Name & Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--ds-spacing-3)',
              }}>
                <Heading level={3} data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {booking.listingName || booking.listingId}
                </Heading>
                <BookingStatusBadge status={booking.status} />
              </div>

              {/* Date & Time */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-2)',
              }}>
                <CalendarIcon style={{ width: '16px', height: '16px', color: 'var(--ds-color-neutral-text-subtle)' }} />
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  {formatDate(booking.startTime)}
                </Paragraph>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-3)',
              }}>
                <ClockIcon style={{ width: '16px', height: '16px', color: 'var(--ds-color-neutral-text-subtle)' }} />
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </Paragraph>
              </div>

              {/* Price */}
              <Paragraph data-size="md" style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-4)',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}>
                {(booking.totalPrice ?? 0).toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
              </Paragraph>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', width: '100%' }}>
                {booking.status !== 'cancelled' && (
                  <Button
                    type="button"
                    variant="secondary"
                    data-size="sm"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelBooking.isPending}
                    style={{
                      flex: 1,
                      minHeight: '44px', // WCAG AA touch target
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  style={{
                    flex: 1,
                    minHeight: '44px', // WCAG AA touch target
                  }}
                >
                  {t('common.details')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop: Table layout
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('bookings.resource')}</Table.HeaderCell>
                <Table.HeaderCell>{t('bookings.timespan')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.price')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {bookings.map((booking: Booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {booking.listingName || booking.listingId}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {formatDate(booking.startTime)}
                      </span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <BookingStatusBadge status={booking.status} />
                  </Table.Cell>
                  <Table.Cell>
                    {(booking.totalPrice ?? 0).toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      {booking.status !== 'cancelled' && (
                        <Button
                          type="button"
                          variant="secondary"
                          data-size="sm"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelBooking.isPending}
                        >
                          {t('common.cancel')}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                      >
                        {t('common.details')}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}
    </div>
  );
}
