import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  CalendarIcon,
  MessageSquareIcon,
  ClockIcon,
  SettingsIcon,
  HomeIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  BookingStatusBadge,
  Link as DSLink,
} from '@xaheen/ds';
import { useT } from '@xaheen/i18n';
import { useMyBookings, formatDate, formatTime, type Booking } from '@xaheen/sdk';
import { useAuth } from '../hooks/useAuth';

// Web app URL for booking - can be configured via env
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

const MOBILE_BREAKPOINT = 768;

export function DashboardPage() {
  const t = useT();
  const { user } = useAuth();
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

  // Fetch user's upcoming bookings (confirmed only, sorted by start time)
  const { data: bookingsData, isLoading } = useMyBookings({ status: 'confirmed' });
  const upcomingBookings = (bookingsData?.data ?? [])
    .filter((b: Booking) => new Date(b.startTime) >= new Date())
    .slice(0, 5);

  // Count stats
  const { data: pendingData } = useMyBookings({ status: 'pending' });
  const { data: allData } = useMyBookings();

  const pendingCount = pendingData?.meta?.total ?? 0;
  const totalBookings = allData?.meta?.total ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome Section */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('minside.welcome')}, {user?.name?.split(' ')[0] || 'Bruker'}!
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('minside.dashboardDesc')}
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)'
      }}>
        <Link to="/bookings" style={{ textDecoration: 'none' }}>
          <Card style={{ 
            padding: 'var(--ds-spacing-5)', 
            borderLeft: '4px solid var(--ds-color-success-base-default)',
            transition: 'box-shadow 0.2s ease',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-3)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-success-base-default)',
              }}>
                <CalendarIcon />
              </div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('minside.upcomingBookings')}
              </Paragraph>
            </div>
            <Heading level={2} data-size="2xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
              {upcomingBookings.length}
            </Heading>
          </Card>
        </Link>
        
        <Link to="/bookings?status=pending" style={{ textDecoration: 'none' }}>
          <Card style={{ 
            padding: 'var(--ds-spacing-5)', 
            borderLeft: '4px solid var(--ds-color-warning-base-default)',
            transition: 'box-shadow 0.2s ease',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-3)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-warning-base-default)',
              }}>
                <ClockIcon />
              </div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('requests.pending')}
              </Paragraph>
            </div>
            <Heading level={2} data-size="2xl" style={{ margin: 0, color: pendingCount > 0 ? 'var(--ds-color-warning-text-default)' : undefined }}>
              {pendingCount}
            </Heading>
          </Card>
        </Link>
        
        <Link to="/bookings" style={{ textDecoration: 'none' }}>
          <Card style={{ 
            padding: 'var(--ds-spacing-5)', 
            borderLeft: '4px solid var(--ds-color-brand-1-base-default)',
            transition: 'box-shadow 0.2s ease',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-3)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-brand-1-base-default)',
              }}>
                <CheckCircleIcon />
              </div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('bookings.totalBookings')}
              </Paragraph>
            </div>
            <Heading level={2} data-size="2xl" style={{ margin: 0 }}>
              {totalBookings}
            </Heading>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('common.actions')}
        </Heading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 'var(--ds-spacing-3)'
        }}>
          <DSLink href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Card style={{ 
              padding: 'var(--ds-spacing-4)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-brand-1-base-default)',
              }}>
                <HomeIcon />
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', textAlign: 'center', color: 'var(--ds-color-neutral-text-default)' }}>
                {t('minside.bookNow')}
              </Paragraph>
            </Card>
          </DSLink>
          <Link to="/bookings" style={{ textDecoration: 'none' }}>
            <Card style={{ 
              padding: 'var(--ds-spacing-4)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-success-base-default)',
              }}>
                <CalendarIcon />
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', textAlign: 'center', color: 'var(--ds-color-neutral-text-default)' }}>
                {t('minside.myBookings')}
              </Paragraph>
            </Card>
          </Link>
          <Link to="/messages" style={{ textDecoration: 'none' }}>
            <Card style={{ 
              padding: 'var(--ds-spacing-4)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-accent-base-default)',
              }}>
                <MessageSquareIcon />
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', textAlign: 'center', color: 'var(--ds-color-neutral-text-default)' }}>
                {t('minside.messages')}
              </Paragraph>
            </Card>
          </Link>
          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <Card style={{ 
              padding: 'var(--ds-spacing-4)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-neutral-text-default)',
              }}>
                <SettingsIcon />
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', textAlign: 'center', color: 'var(--ds-color-neutral-text-default)' }}>
                {t('minside.settings')}
              </Paragraph>
            </Card>
          </Link>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <Card style={{ padding: isMobile ? 'var(--ds-spacing-4)' : 'var(--ds-spacing-5)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 'var(--ds-spacing-2)' : '0'
        }}>
          <Heading level={2} data-size={isMobile ? 'sm' : 'md'} style={{ margin: 0 }}>
            {t('minside.upcomingBookings')}
          </Heading>
          <Link to="/bookings">
            <Button type="button" variant="tertiary" data-size="sm" aria-label={t('minside.viewAll') || 'View all'}>
              {t('minside.viewAll')}
              <ChevronRightIcon />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: isMobile ? 'var(--ds-spacing-6)' : 'var(--ds-spacing-8)', display: 'flex', justifyContent: 'center' }}>
            <Spinner aria-label={t('common.loading')} data-size="md" />
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? 'var(--ds-spacing-6)' : 'var(--ds-spacing-8)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-md)'
          }}>
            <div style={{
              width: isMobile ? '48px' : '64px',
              height: isMobile ? '48px' : '64px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: `0 auto ${isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)'}`,
              color: 'var(--ds-color-neutral-text-subtle)',
            }}>
              <CalendarIcon />
            </div>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, marginBottom: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)' }}>
              {t('minside.noUpcomingBookings')}
            </Paragraph>
            <DSLink href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="primary" data-size={isMobile ? 'sm' : 'md'}>
                {t('minside.bookNow')}
              </Button>
            </DSLink>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {upcomingBookings.map((booking: Booking) => (
              <Link key={booking.id} to={`/bookings?id=${booking.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  padding: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? 'var(--ds-spacing-3)' : '0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)' }}>
                    <div style={{
                      width: isMobile ? '40px' : '48px',
                      height: isMobile ? '40px' : '48px',
                      minWidth: isMobile ? '40px' : '48px',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-brand-1-base-default)',
                    }}>
                      <HomeIcon />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Paragraph data-size={isMobile ? 'sm' : 'md'} style={{
                        margin: 0,
                        fontWeight: 'var(--ds-font-weight-semibold)',
                        color: 'var(--ds-color-neutral-text-default)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: isMobile ? 'nowrap' : 'normal'
                      }}>
                        {booking.listingName || booking.listingId}
                      </Paragraph>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-2)',
                        marginTop: 'var(--ds-spacing-1)',
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                      }}>
                        <CalendarIcon style={{ width: '14px', height: '14px', color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }} />
                        <Paragraph data-size="sm" style={{
                          margin: 0,
                          color: 'var(--ds-color-neutral-text-default)',
                          fontSize: isMobile ? '0.75rem' : undefined
                        }}>
                          {formatDate(booking.startTime)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </Paragraph>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'space-between' : 'flex-end',
                    gap: 'var(--ds-spacing-3)',
                    marginLeft: isMobile ? 'calc(40px + var(--ds-spacing-3))' : '0'
                  }}>
                    {booking.totalPrice && (
                      <Paragraph data-size={isMobile ? 'sm' : 'md'} style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                        {Number(booking.totalPrice).toLocaleString('nb-NO')} kr
                      </Paragraph>
                    )}
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
