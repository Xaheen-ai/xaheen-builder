/**
 * @xaheen/shared - Navigation
 *
 * Shared navigation configurations for Xaheen apps.
 * Sidebar sections, bottom nav items, and skip links.
 */

import type { AppId } from './types';

// =============================================================================
// Navigation Types
// =============================================================================

/** Sidebar navigation item */
export interface NavItem {
    id: string;
    name: string;
    nameKey: string; // i18n key
    description?: string;
    descriptionKey?: string; // i18n key
    href: string;
    icon: string; // Icon name (resolved in app)
    badge?: string | number;
}

/** Sidebar section */
export interface NavSection {
    id?: string;
    title?: string;
    titleKey?: string; // i18n key
    items: NavItem[];
}

/** Bottom navigation item */
export interface BottomNavItem {
    id: string;
    label: string;
    labelKey: string; // i18n key
    icon: string;
    href: string;
}

/** Skip link for accessibility */
export interface SkipLink {
    targetId: string;
    label: string;
    labelKey: string; // i18n key
}

// =============================================================================
// Skip Links (shared across all apps)
// =============================================================================

export const SKIP_LINKS: SkipLink[] = [
    {
        targetId: 'main-content',
        label: 'Hopp til hovedinnhold',
        labelKey: 'common.skipToMain',
    },
    {
        targetId: 'main-navigation',
        label: 'Hopp til navigasjon',
        labelKey: 'common.skipToNav',
    },
];

// =============================================================================
// Backoffice Navigation
// =============================================================================

export const BACKOFFICE_NAV_SECTIONS: NavSection[] = [
    {
        items: [
            {
                id: 'dashboard',
                name: 'Dashboard',
                nameKey: 'backoffice.nav.dashboard',
                descriptionKey: 'backoffice.nav.dashboardDesc',
                href: '/',
                icon: 'home',
            },
        ],
    },
    {
        title: 'Management',
        titleKey: 'backoffice.nav.sectionManagement',
        items: [
            {
                id: 'tenants',
                name: 'Tenants',
                nameKey: 'backoffice.nav.tenants',
                descriptionKey: 'backoffice.nav.tenantsDesc',
                href: '/tenants',
                icon: 'building',
            },
            {
                id: 'modules',
                name: 'Modules',
                nameKey: 'backoffice.nav.modules',
                descriptionKey: 'backoffice.nav.modulesDesc',
                href: '/modules',
                icon: 'sparkles',
            },
            {
                id: 'plans',
                name: 'Plans',
                nameKey: 'backoffice.nav.plans',
                descriptionKey: 'backoffice.nav.plansDesc',
                href: '/plans',
                icon: 'chart',
            },
            {
                id: 'users',
                name: 'Users',
                nameKey: 'backoffice.nav.users',
                descriptionKey: 'backoffice.nav.usersDesc',
                href: '/users',
                icon: 'users',
            },
        ],
    },
    {
        title: 'Operations',
        titleKey: 'backoffice.nav.sectionOperations',
        items: [
            {
                id: 'billing',
                name: 'Billing',
                nameKey: 'backoffice.nav.billing',
                descriptionKey: 'backoffice.nav.billingDesc',
                href: '/billing',
                icon: 'chart',
            },
            {
                id: 'audit',
                name: 'Audit Log',
                nameKey: 'backoffice.nav.audit',
                descriptionKey: 'backoffice.nav.auditDesc',
                href: '/audit',
                icon: 'shield',
            },
            {
                id: 'governance',
                name: 'Governance',
                nameKey: 'backoffice.nav.governance',
                descriptionKey: 'backoffice.nav.governanceDesc',
                href: '/governance',
                icon: 'shield',
            },
            {
                id: 'settings',
                name: 'Settings',
                nameKey: 'backoffice.nav.settings',
                descriptionKey: 'backoffice.nav.settingsDesc',
                href: '/settings',
                icon: 'settings',
            },
        ],
    },
];

export const BACKOFFICE_BOTTOM_NAV: BottomNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', labelKey: 'backoffice.nav.dashboard', icon: 'home', href: '/' },
    { id: 'tenants', label: 'Tenants', labelKey: 'backoffice.nav.tenants', icon: 'building', href: '/tenants' },
    { id: 'billing', label: 'Billing', labelKey: 'backoffice.nav.billing', icon: 'chart', href: '/billing' },
    { id: 'settings', label: 'Settings', labelKey: 'backoffice.nav.settings', icon: 'settings', href: '/settings' },
];

// =============================================================================
// Dashboard Navigation
// =============================================================================

export const DASHBOARD_NAV_SECTIONS: NavSection[] = [
    {
        items: [
            {
                id: 'dashboard',
                name: 'Dashboard',
                nameKey: 'dashboard.nav.dashboard',
                descriptionKey: 'dashboard.nav.dashboardDesc',
                href: '/',
                icon: 'home',
            },
        ],
    },
    {
        title: 'Domain',
        titleKey: 'dashboard.nav.sectionDomain',
        items: [
            {
                id: 'objects',
                name: 'Objects',
                nameKey: 'dashboard.nav.objects',
                descriptionKey: 'dashboard.nav.objectsDesc',
                href: '/objects',
                icon: 'building',
            },
            {
                id: 'bookings',
                name: 'Bookings',
                nameKey: 'dashboard.nav.bookings',
                descriptionKey: 'dashboard.nav.bookingsDesc',
                href: '/bookings',
                icon: 'calendar',
            },
        ],
    },
    {
        title: 'Tenant',
        titleKey: 'dashboard.nav.sectionTenant',
        items: [
            {
                id: 'users',
                name: 'Users',
                nameKey: 'dashboard.nav.users',
                descriptionKey: 'dashboard.nav.usersDesc',
                href: '/users',
                icon: 'users',
            },
            {
                id: 'settings',
                name: 'Settings',
                nameKey: 'dashboard.nav.settings',
                descriptionKey: 'dashboard.nav.settingsDesc',
                href: '/settings',
                icon: 'settings',
            },
        ],
    },
];

export const DASHBOARD_BOTTOM_NAV: BottomNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', labelKey: 'dashboard.nav.dashboard', icon: 'home', href: '/' },
    { id: 'objects', label: 'Objects', labelKey: 'dashboard.nav.objects', icon: 'building', href: '/objects' },
    { id: 'bookings', label: 'Bookings', labelKey: 'dashboard.nav.bookings', icon: 'calendar', href: '/bookings' },
    { id: 'settings', label: 'Settings', labelKey: 'dashboard.nav.settings', icon: 'settings', href: '/settings' },
];

// =============================================================================
// Monitoring Navigation
// =============================================================================

export const MONITORING_NAV_SECTIONS: NavSection[] = [
    {
        items: [
            {
                id: 'health',
                name: 'Health',
                nameKey: 'monitoring.nav.health',
                descriptionKey: 'monitoring.nav.healthDesc',
                href: '/',
                icon: 'home',
            },
        ],
    },
    {
        title: 'Observability',
        titleKey: 'monitoring.nav.sectionObservability',
        items: [
            {
                id: 'metrics',
                name: 'Metrics',
                nameKey: 'monitoring.nav.metrics',
                descriptionKey: 'monitoring.nav.metricsDesc',
                href: '/metrics',
                icon: 'chart',
            },
            {
                id: 'outbox',
                name: 'Outbox',
                nameKey: 'monitoring.nav.outbox',
                descriptionKey: 'monitoring.nav.outboxDesc',
                href: '/outbox',
                icon: 'settings',
            },
            {
                id: 'errors',
                name: 'Errors',
                nameKey: 'monitoring.nav.errors',
                descriptionKey: 'monitoring.nav.errorsDesc',
                href: '/errors',
                icon: 'shield',
            },
        ],
    },
];

// =============================================================================
// Get Navigation by App
// =============================================================================

export function getNavSections(appId: AppId): NavSection[] {
    switch (appId) {
        case 'backoffice':
            return BACKOFFICE_NAV_SECTIONS;
        case 'dashboard':
            return DASHBOARD_NAV_SECTIONS;
        case 'monitoring':
            return MONITORING_NAV_SECTIONS;
        default:
            return [];
    }
}

export function getBottomNav(appId: AppId): BottomNavItem[] {
    switch (appId) {
        case 'backoffice':
            return BACKOFFICE_BOTTOM_NAV;
        case 'dashboard':
            return DASHBOARD_BOTTOM_NAV;
        default:
            return [];
    }
}
