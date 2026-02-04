import {
  Card,
  Heading,
  Paragraph,
  Spinner,
  Button,
  StatCard,
  ActivityItem,
  formatTimeAgo,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  UsersIcon,
  type ActivityItemProps,
  type ActivityStatus,
} from '@xaheen/ds';
import { useDashboardStats, useDashboardActivity, usePendingItems, type RecentActivity } from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Map activity type to activity status
function mapActivityTypeToStatus(type: string): ActivityStatus {
  switch (type) {
    case 'booking':
      return 'pending';
    case 'payment':
      return 'approved';
    case 'message':
      return 'pending';
    default:
      return 'pending';
  }
}

export function DashboardPage(): React.ReactElement {
  const { user, isAdmin, isSaksbehandler } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const { locale } = useLocale();

  // Use dedicated dashboard endpoints — hooks return { data: { data: T } }
  const { data: statsRaw, isLoading: loadingStats } = useDashboardStats();
  const { data: activityRaw, isLoading: loadingActivity } = useDashboardActivity({ limit: 4 });
  const { data: pendingRaw, isLoading: loadingPending } = usePendingItems();

  const isLoading = loadingStats || loadingActivity || loadingPending;

  // Unwrap data from SDK response shape
  const statsData = statsRaw?.data;
  const activityList = activityRaw?.data ?? [];
  const pendingData = pendingRaw?.data;

  // Extract stats
  const pendingCount = pendingData?.pendingBookings ?? statsData?.bookings?.pending ?? 0;
  const confirmedCount = statsData?.bookings?.confirmed ?? 0;
  const cancelledCount = statsData?.bookings?.cancelled ?? 0;
  const totalCount = statsData?.bookings?.total ?? 0;

  // Transform activity feed
  const recentActivity: ActivityItemProps[] = (Array.isArray(activityList) ? activityList : []).map((activity: RecentActivity) => ({
    title: activity.action,
    description: activity.description,
    time: formatTimeAgo(activity.timestamp),
    status: mapActivityTypeToStatus(activity.type),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('dashboard.welcomeBack', { name: user?.name.split(' ')[0] || '' })}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {isAdmin
              ? t('dashboard.fullAccess')
              : isSaksbehandler
              ? t('dashboard.taskOverview')
              : t('dashboard.loggedIn')}
          </Paragraph>
        </div>
        {pendingCount > 0 && (
          // eslint-disable-next-line digdir/require-interactive-labels -- Button has text content
          <Button
            type="button"
            variant="primary"
            data-color="accent"
            onClick={() => navigate('/bookings?status=pending')}
          >
            {t('dashboard.processPending', { count: pendingCount })}
            <ArrowRightIcon />
          </Button>
        )}
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('dashboard.loadingStats')} data-data-size="lg" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <StatCard
            title={t('dashboard.pendingBookings')}
            value={pendingCount}
            description={t('dashboard.requiresAction')}
            color="var(--ds-color-warning-text-default)"
            icon={<ClockIcon />}
            {...(pendingCount > 0 && { trend: { value: 12, isPositive: false as boolean } })}
          />
          <StatCard
            title={t('dashboard.approved')}
            value={confirmedCount}
            description={t('dashboard.thisMonth')}
            color="var(--ds-color-success-text-default)"
            icon={<CheckCircleIcon />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title={t('dashboard.rejected')}
            value={cancelledCount}
            description={t('dashboard.thisMonth')}
            color="var(--ds-color-danger-text-default)"
            icon={<XCircleIcon />}
          />
          <StatCard
            title={t('dashboard.total')}
            value={totalCount}
            description={t('dashboard.allBookings')}
            icon={<CalendarIcon />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>
      )}

      {/* Two column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--ds-spacing-6)',
        }}
      >
        {/* Recent activity */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('dashboard.recentActivity')}
            </Heading>
            <Button type="button" variant="tertiary" data-data-size="sm" onClick={() => navigate('/bookings')}>
              {t('common.seeAll')}
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              {t('dashboard.quickActions')}
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/bookings?status=pending')}
              >
                <ClockIcon />
                {t('dashboard.processPendingBtn')}
              </Button>
              {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/bookings')}
              >
                <CalendarIcon />
                {t('dashboard.viewAllBookings')}
              </Button>
              {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
              {isAdmin && (
                <Button
                  type="button"
                  variant="secondary"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => navigate('/users')}
                >
                  <UsersIcon size={20} />
                  {t('dashboard.manageUsers')}
                </Button>
              )}
            </div>
          </Card>

          {/* System status card */}
          <Card style={{ padding: 'var(--ds-spacing-5)', backgroundColor: 'var(--ds-color-success-surface-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-success-base-default)',
                }}
              />
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('dashboard.systemStatus')}
              </Paragraph>
            </div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-2)' }}
            >
              {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString(locale === 'nb' ? 'nb-NO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </Paragraph>
          </Card>
        </div>
      </div>
    </div>
  );
}
