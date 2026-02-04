/**
 * Monitoring App Component
 *
 * Ops dashboard, uses shared navigation.
 */
import React, { useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import {
    AppLayout as DSAppLayout,
    DashboardSidebar,
    DashboardHeader,
    SkipLinks,
    Stack,
    Heading,
    Text,
    Card,
    Badge,
    useTheme,
    type SidebarSection,
    HomeIcon,
    ChartIcon,
    ShieldIcon,
    SettingsIcon,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import {
    MONITORING_NAV_SECTIONS,
    SKIP_LINKS,
    type NavItem,
    type NavSection,
} from '@xaheen/shared';

// Icon map
const ICON_MAP: Record<string, React.ReactElement> = {
    home: <HomeIcon />,
    chart: <ChartIcon />,
    shield: <ShieldIcon />,
    settings: <SettingsIcon />,
};

function getIcon(name: string): React.ReactElement {
    return ICON_MAP[name] || <HomeIcon />;
}

function HealthPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('monitoring.nav.health')}</Heading>
            <Stack direction="horizontal" gap="md">
                <Card padding="lg">
                    <Stack gap="sm">
                        <Text data-size="sm" data-color="subtle">API</Text>
                        <Badge data-color="success">{t('monitoring.status.healthy')}</Badge>
                    </Stack>
                </Card>
                <Card padding="lg">
                    <Stack gap="sm">
                        <Text data-size="sm" data-color="subtle">Database</Text>
                        <Badge data-color="success">{t('monitoring.status.healthy')}</Badge>
                    </Stack>
                </Card>
                <Card padding="lg">
                    <Stack gap="sm">
                        <Text data-size="sm" data-color="subtle">Auth</Text>
                        <Badge data-color="success">{t('monitoring.status.healthy')}</Badge>
                    </Stack>
                </Card>
            </Stack>
        </Stack>
    );
}

function MetricsPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('monitoring.nav.metrics')}</Heading>
            <Text>{t('monitoring.nav.metricsDesc')}</Text>
        </Stack>
    );
}

function OutboxPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('monitoring.nav.outbox')}</Heading>
            <Text>{t('monitoring.nav.outboxDesc')}</Text>
        </Stack>
    );
}

function ErrorsPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('monitoring.nav.errors')}</Heading>
            <Text>{t('monitoring.nav.errorsDesc')}</Text>
        </Stack>
    );
}

function AppLayout(): React.ReactElement {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const t = useT();

    const sidebarSections: SidebarSection[] = useMemo(
        () =>
            MONITORING_NAV_SECTIONS.map((section: NavSection) => ({
                title: section.titleKey ? t(section.titleKey) : section.title,
                items: section.items.map((item: NavItem) => ({
                    name: t(item.nameKey),
                    description: item.descriptionKey ? t(item.descriptionKey) : item.description,
                    href: item.href,
                    icon: getIcon(item.icon),
                })),
            })),
        [t]
    );

    const skipLinks = useMemo(
        () =>
            SKIP_LINKS.map((link) => ({
                targetId: link.targetId,
                label: t(link.labelKey) || link.label,
            })),
        [t]
    );

    return (
        <>
            <SkipLinks links={skipLinks} />
            <DSAppLayout
                sidebar={
                    <DashboardSidebar
                        logo={
                            <Link to="/" aria-label={t('monitoring.appTitle')}>
                                <Stack direction="horizontal" align="center" gap="sm" px="sm">
                                    <Heading level={5} data-color="accent">
                                        Monitoring
                                    </Heading>
                                </Stack>
                            </Link>
                        }
                        title={t('monitoring.appTitle')}
                        subtitle={t('monitoring.appSubtitle')}
                        sections={sidebarSections}
                        id="main-navigation"
                        data-testid="monitoring-sidebar"
                    />
                }
                header={
                    <DashboardHeader
                        user={null}
                        showThemeToggle
                        isDark={isDark}
                        onThemeToggle={toggleTheme}
                        data-testid="monitoring-header"
                    />
                }
                mobileBreakpoint={768}
                data-testid="monitoring-layout"
            />
        </>
    );
}

export function App(): React.ReactElement {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<HealthPage />} />
                <Route path="/metrics" element={<MetricsPage />} />
                <Route path="/outbox" element={<OutboxPage />} />
                <Route path="/errors" element={<ErrorsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
