/**
 * Dashboard App Component
 *
 * Tenant admin portal, uses shared navigation.
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
    useTheme,
    type SidebarSection,
    type BottomNavigationItem,
    HomeIcon,
    BuildingIcon,
    CalendarIcon,
    UsersIcon,
    SettingsIcon,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import {
    DASHBOARD_NAV_SECTIONS,
    DASHBOARD_BOTTOM_NAV,
    SKIP_LINKS,
    type NavItem,
    type NavSection,
} from '@xaheen/shared';

// Icon map
const ICON_MAP: Record<string, React.ReactElement> = {
    home: <HomeIcon />,
    building: <BuildingIcon />,
    calendar: <CalendarIcon />,
    users: <UsersIcon />,
    settings: <SettingsIcon />,
};

function getIcon(name: string): React.ReactElement {
    return ICON_MAP[name] || <HomeIcon />;
}

// Pages
function DashboardPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('dashboard.nav.dashboard')}</Heading>
            <Text>{t('dashboard.nav.dashboardDesc')}</Text>
            <Stack direction="horizontal" gap="md">
                <Card padding="lg">
                    <Stack gap="sm">
                        <Text data-size="sm" data-color="subtle">{t('dashboard.stats.objects')}</Text>
                        <Heading level={2}>0</Heading>
                    </Stack>
                </Card>
                <Card padding="lg">
                    <Stack gap="sm">
                        <Text data-size="sm" data-color="subtle">{t('dashboard.stats.bookings')}</Text>
                        <Heading level={2}>0</Heading>
                    </Stack>
                </Card>
                <Card padding="lg">
                    <Stack gap="sm">
                        <Text data-size="sm" data-color="subtle">{t('dashboard.stats.users')}</Text>
                        <Heading level={2}>0</Heading>
                    </Stack>
                </Card>
            </Stack>
        </Stack>
    );
}

function ObjectsPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('dashboard.nav.objects')}</Heading>
            <Text>{t('dashboard.nav.objectsDesc')}</Text>
        </Stack>
    );
}

function BookingsPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('dashboard.nav.bookings')}</Heading>
            <Text>{t('dashboard.nav.bookingsDesc')}</Text>
        </Stack>
    );
}

function UsersPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('dashboard.nav.users')}</Heading>
            <Text>{t('dashboard.nav.usersDesc')}</Text>
        </Stack>
    );
}

function SettingsPage() {
    const t = useT();
    return (
        <Stack gap="lg" padding="lg">
            <Heading level={1}>{t('dashboard.nav.settings')}</Heading>
            <Text>{t('dashboard.nav.settingsDesc')}</Text>
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
            DASHBOARD_NAV_SECTIONS.map((section: NavSection) => ({
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

    const bottomNavItems: BottomNavigationItem[] = useMemo(
        () =>
            DASHBOARD_BOTTOM_NAV.map((item) => ({
                id: item.id,
                label: t(item.labelKey),
                icon: getIcon(item.icon),
                href: item.href,
                active: item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href),
            })),
        [location.pathname, t]
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
                            <Link to="/" aria-label={t('dashboard.appTitle')}>
                                <Stack direction="horizontal" align="center" gap="sm" px="sm">
                                    <Heading level={5} data-color="accent">
                                        Dashboard
                                    </Heading>
                                </Stack>
                            </Link>
                        }
                        title={t('dashboard.appTitle')}
                        subtitle={t('dashboard.appSubtitle')}
                        sections={sidebarSections}
                        id="main-navigation"
                        data-testid="dashboard-sidebar"
                    />
                }
                header={
                    <DashboardHeader
                        user={null}
                        searchPlaceholder={t('common.search')}
                        showThemeToggle
                        isDark={isDark}
                        onThemeToggle={toggleTheme}
                        onSettingsClick={() => navigate('/settings')}
                        data-testid="dashboard-header"
                    />
                }
                bottomNavItems={bottomNavItems}
                mobileBreakpoint={768}
                data-testid="dashboard-layout"
            />
        </>
    );
}

export function App(): React.ReactElement {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/objects" element={<ObjectsPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
