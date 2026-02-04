/**
 * Backoffice App Component
 *
 * Thin app - uses AppLayout shell with Outlet for route content.
 * Uses shared navigation configs from @xaheen/shared.
 */
import React, { useMemo, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
    AppLayout,
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
    // Icons
    HomeIcon,
    BuildingIcon,
    ChartIcon,
    UsersIcon,
    SettingsIcon,
    ShieldIcon,
    SparklesIcon,
    CreditCardIcon,
    FileTextIcon,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import {
    BACKOFFICE_NAV_SECTIONS,
    BACKOFFICE_BOTTOM_NAV,
    SKIP_LINKS,
    type NavItem,
    type NavSection,
} from '@xaheen/shared';

// Icon map - resolves string icon names to components
const ICON_MAP: Record<string, React.ReactElement> = {
    home: <HomeIcon size={20} />,
    building: <BuildingIcon size={20} />,
    chart: <ChartIcon size={20} />,
    users: <UsersIcon size={20} />,
    settings: <SettingsIcon size={20} />,
    shield: <ShieldIcon size={20} />,
    sparkles: <SparklesIcon size={20} />,
    creditCard: <CreditCardIcon size={20} />,
    fileText: <FileTextIcon size={20} />,
};

function getIcon(name: string): React.ReactElement {
    return ICON_MAP[name] || <HomeIcon size={20} />;
}

// Simple text logo component
function Logo({ height = 32 }: { height?: number }) {
    return (
        <Text
            style={{
                fontSize: height * 0.6,
                fontWeight: 'var(--ds-font-weight-bold)',
                color: 'var(--ds-color-accent-text-default)',
                letterSpacing: 'var(--ds-font-letter-spacing-wide)',
            }}
        >
            Xaheen
        </Text>
    );
}

// =============================================================================
// Pages - Import from routes
// =============================================================================

import {
    DashboardPage,
    TenantsListPage as TenantsPage,
    UsersListPage as UsersPage,
    ModulesListPage as ModulesPage,
    PlansListPage as PlansPage,
    AuditLogPage as AuditPage,
} from './routes';

// Simple placeholder pages for not-yet-implemented routes
function BillingPage() {
    const t = useT();
    return (
        <Stack gap="lg" id="main-content">
            <Heading level={1}>{t('backoffice.nav.billing')}</Heading>
            <Text>{t('backoffice.nav.billingDesc')}</Text>
        </Stack>
    );
}

function GovernancePage() {
    const t = useT();
    return (
        <Stack gap="lg" id="main-content">
            <Heading level={1}>{t('backoffice.nav.governance')}</Heading>
            <Text>{t('backoffice.nav.governanceDesc')}</Text>
        </Stack>
    );
}

function SettingsPage() {
    const t = useT();
    return (
        <Stack gap="lg" id="main-content">
            <Heading level={1}>{t('backoffice.nav.settings')}</Heading>
            <Text>{t('backoffice.nav.settingsDesc')}</Text>
        </Stack>
    );
}

// =============================================================================
// Layout Component (wraps AppLayout with Outlet)
// =============================================================================

function BackofficeLayout(): React.ReactElement {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const t = useT();
    const [searchValue, setSearchValue] = useState('');

    // Convert shared nav config to platform-ui format
    const sidebarSections: SidebarSection[] = useMemo(
        () =>
            BACKOFFICE_NAV_SECTIONS.map((section: NavSection) => ({
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

    // Convert bottom nav config
    const location = useLocation();
    const bottomNavItems: BottomNavigationItem[] = useMemo(
        () =>
            BACKOFFICE_BOTTOM_NAV.map((item) => ({
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

    // Skip links
    const skipLinks = useMemo(
        () =>
            SKIP_LINKS.map((link) => ({
                targetId: link.targetId,
                label: t(link.labelKey) || link.label,
            })),
        [t]
    );

    // Search handler
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        // TODO: Implement search functionality
    };

    return (
        <>
            <SkipLinks links={skipLinks} />
            <AppLayout
                sidebar={
                    <DashboardSidebar
                        logo={<Logo height={28} />}
                        title={t('backoffice.appTitle')}
                        subtitle={t('backoffice.appSubtitle')}
                        sections={sidebarSections}
                        width={320}
                        data-testid="backoffice-sidebar"
                    />
                }
                header={
                    <DashboardHeader
                        logo={<Logo height={24} />}
                        user={null}
                        searchPlaceholder={t('common.search')}
                        searchValue={searchValue}
                        onSearchChange={handleSearchChange}
                        showThemeToggle
                        isDark={isDark}
                        onThemeToggle={toggleTheme}
                        onSettingsClick={() => navigate('/settings')}
                        showNotifications={false}
                        data-testid="backoffice-header"
                    />
                }
                bottomNavItems={bottomNavItems}
                mobileBreakpoint="md"
                data-testid="backoffice-layout"
            />
        </>
    );
}

// =============================================================================
// App Routes
// =============================================================================

export function App(): React.ReactElement {
    return (
        <Routes>
            <Route element={<BackofficeLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/tenants" element={<TenantsPage />} />
                <Route path="/modules" element={<ModulesPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/governance" element={<GovernancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
