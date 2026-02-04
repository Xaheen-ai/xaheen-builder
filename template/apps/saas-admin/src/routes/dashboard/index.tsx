/**
 * Dashboard Route - Xaheen Backoffice
 * 
 * Shows overview stats, recent activity, and quick actions.
 * Adapted from backoffice2 reference.
 */
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paragraph,
    Button,
    Spinner,
    Card,
    Heading,
    Stack,
    Grid,
    BuildingIcon,
    UsersIcon,
    ChartIcon,
    SparklesIcon,
    ArrowRightIcon,
    ClockIcon,
    RepeatIcon,
    DashboardPageHeader,
    StatsGrid,
    Timeline,
    type StatItem,
    type TimelineItem,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import { useDashboardStats, useAuditLog } from '@xaheen/app-shell';

// Format numbers for display
function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('nb-NO');
}

// Format relative time
function formatRelativeTime(date: Date, t: (key: string, options?: { count?: number }) => string): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('backoffice.dashboard.time.justNow', { defaultValue: 'Akkurat nå' });
    if (diffMins < 60) return t('backoffice.dashboard.time.minutesAgo', { count: diffMins, defaultValue: `${diffMins} min siden` });
    if (diffHours < 24) return t('backoffice.dashboard.time.hoursAgo', { count: diffHours, defaultValue: `${diffHours}t siden` });
    return t('backoffice.dashboard.time.daysAgo', { count: diffDays, defaultValue: `${diffDays}d siden` });
}

// Map audit events to timeline items
function mapToTimelineItem(event: {
    id: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    created_at: string;
}): TimelineItem {
    return {
        id: event.id,
        title: `${event.action} on ${event.resource_type}`,
        description: event.resource_id || '',
        timestamp: event.created_at,
        type: event.action === 'INSERT' ? 'success' : event.action === 'DELETE' ? 'warning' : 'info',
    };
}

export function DashboardPage(): React.ReactElement {
    const t = useT();
    const navigate = useNavigate();

    // Fetch data
    const { data: stats, loading: loadingStats, refetch: refetchStats } = useDashboardStats();
    const { data: auditEvents, loading: loadingAudit, refetch: refetchAudit } = useAuditLog(10);

    const isLoading = loadingStats || loadingAudit;

    // Refresh handler
    const handleRefresh = useCallback(async () => {
        await Promise.all([refetchStats(), refetchAudit()]);
    }, [refetchStats, refetchAudit]);

    // Build stats for StatsGrid
    const statItems: StatItem[] = useMemo(() => [
        {
            id: 'tenants',
            label: t('backoffice.dashboard.tenantsCount', { defaultValue: 'Tenants' }),
            value: formatNumber(stats?.totalTenants ?? 0),
            icon: <BuildingIcon aria-hidden />,
            color: 'info',
            onClick: () => navigate('/tenants'),
        },
        {
            id: 'users',
            label: t('backoffice.dashboard.usersCount', { defaultValue: 'Brukere' }),
            value: formatNumber(stats?.totalUsers ?? 0),
            icon: <UsersIcon aria-hidden />,
            color: 'success',
            onClick: () => navigate('/users'),
        },
        {
            id: 'modules',
            label: t('backoffice.dashboard.modulesCount', { defaultValue: 'Moduler' }),
            value: formatNumber(stats?.activeModules ?? 0),
            icon: <ChartIcon aria-hidden />,
            color: 'warning',
            onClick: () => navigate('/modules'),
        },
        {
            id: 'active',
            label: t('backoffice.dashboard.activeTenantsCount', { defaultValue: 'Aktive Tenants' }),
            value: formatNumber(stats?.activeTenants ?? 0),
            icon: <SparklesIcon aria-hidden />,
            color: 'default',
            onClick: () => navigate('/tenants'),
        },
    ], [stats, t, navigate]);

    // Build timeline items from audit events
    const timelineItems: TimelineItem[] = useMemo(() => {
        if (!auditEvents) return [];
        return auditEvents.map(mapToTimelineItem);
    }, [auditEvents]);

    // Quick actions
    const quickActions = [
        { label: t('backoffice.dashboard.createTenant', { defaultValue: 'Opprett Tenant' }), icon: <BuildingIcon aria-hidden />, href: '/tenants/new' },
        { label: t('backoffice.dashboard.inviteUser', { defaultValue: 'Inviter Bruker' }), icon: <UsersIcon aria-hidden />, href: '/users/invite' },
        { label: t('backoffice.dashboard.viewAudit', { defaultValue: 'Se Audit Log' }), icon: <ClockIcon aria-hidden />, href: '/audit' },
    ];

    // Loading state
    if (isLoading && !stats) {
        return (
            <Stack direction="vertical" align="center" justify="center" gap="md" id="main-content">
                <Spinner aria-hidden="true" />
                <Paragraph data-size="sm">{t('common.loading', { defaultValue: 'Laster...' })}</Paragraph>
            </Stack>
        );
    }

    return (
        <Stack direction="vertical" gap="lg" id="main-content">
            {/* Page Header */}
            <DashboardPageHeader
                title={t('backoffice.nav.dashboard', { defaultValue: 'Dashboard' })}
                subtitle={t('backoffice.dashboard.subtitle', { defaultValue: 'Oversikt over plattformen' })}
                lastUpdated={`${t('common.lastUpdated', { defaultValue: 'Sist oppdatert' })}: ${formatRelativeTime(new Date(), t)}`}
                primaryAction={
                    <Button data-variant="secondary" data-size="sm" onClick={handleRefresh} disabled={isLoading}>
                        <RepeatIcon aria-hidden />
                        {t('common.refresh', { defaultValue: 'Oppdater' })}
                    </Button>
                }
            />

            {/* Stats Grid */}
            <StatsGrid stats={statItems} columns={4} loading={isLoading} />

            {/* Main Content Grid */}
            <Grid cols={{ base: 1, md: 2 }} gap="md">
                {/* Activity Feed */}
                <Card data-color="neutral">
                    <Stack direction="vertical" gap="md">
                        <Stack direction="horizontal" justify="between" align="center">
                            <Stack direction="horizontal" align="center" gap="sm">
                                <ClockIcon aria-hidden />
                                <Heading level={3} data-size="sm">
                                    {t('backoffice.dashboard.recentActivity', { defaultValue: 'Siste aktivitet' })}
                                </Heading>
                            </Stack>
                            <Button data-variant="tertiary" data-size="sm" onClick={() => navigate('/audit')}>
                                {t('common.viewAll', { defaultValue: 'Se alle' })}
                                <ArrowRightIcon aria-hidden />
                            </Button>
                        </Stack>
                        <Timeline
                            items={timelineItems}
                            loading={loadingAudit}
                            emptyMessage={t('backoffice.dashboard.noActivity', { defaultValue: 'Ingen aktivitet ennå' })}
                            showConnector={true}
                        />
                    </Stack>
                </Card>

                {/* Quick Actions */}
                <Card data-color="neutral">
                    <Stack direction="vertical" gap="md">
                        <Stack direction="horizontal" align="center" gap="sm">
                            <SparklesIcon aria-hidden />
                            <Heading level={3} data-size="sm">
                                {t('backoffice.dashboard.quickActions', { defaultValue: 'Hurtighandlinger' })}
                            </Heading>
                        </Stack>
                        <Grid cols={{ base: 1 }} gap="sm">
                            {quickActions.map((action) => (
                                <Button
                                    key={action.href}
                                    data-variant="secondary"
                                    data-size="sm"
                                    onClick={() => navigate(action.href)}
                                >
                                    {action.icon}
                                    {action.label}
                                </Button>
                            ))}
                        </Grid>
                    </Stack>
                </Card>
            </Grid>
        </Stack>
    );
}

export default DashboardPage;
