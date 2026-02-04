/**
 * @xaheen/shared - Constants
 *
 * Shared constants for Xaheen.
 */

import type { AppId, AppConfig, Locale, Direction } from './types';

// =============================================================================
// App Constants
// =============================================================================

/** App configurations */
export const APPS: Record<AppId, AppConfig> = {
    backoffice: {
        appId: 'backoffice',
        name: 'Backoffice',
        port: 5001,
        description: 'Platform administration',
    },
    dashboard: {
        appId: 'dashboard',
        name: 'Dashboard',
        port: 5002,
        description: 'Tenant administration',
    },
    web: {
        appId: 'web',
        name: 'Web',
        port: 5003,
        description: 'End-user application',
    },
    minside: {
        appId: 'minside',
        name: 'Min Side',
        port: 5006,
        description: 'User self-service portal',
    },
    docs: {
        appId: 'docs',
        name: 'Docs',
        port: 5005,
        description: 'Documentation',
    },
    monitoring: {
        appId: 'monitoring',
        name: 'Monitoring',
        port: 5004,
        description: 'Operations dashboard',
    },
};

// =============================================================================
// Locale Constants
// =============================================================================

/** Supported locales */
export const SUPPORTED_LOCALES: Locale[] = ['nb', 'en', 'ar', 'fr'];

/** Default locale */
export const DEFAULT_LOCALE: Locale = 'nb';

/** Locale to direction mapping */
export const LOCALE_DIRECTION: Record<Locale, Direction> = {
    nb: 'ltr',
    en: 'ltr',
    ar: 'rtl',
    fr: 'ltr',
};

/** Locale display names */
export const LOCALE_NAMES: Record<Locale, string> = {
    nb: 'Norsk bokmål',
    en: 'English',
    ar: 'العربية',
    fr: 'Français',
};

// =============================================================================
// SDK Namespace Constants
// =============================================================================

/** SDK namespaces allowed per app (per Architecture Contract) */
export const SDK_ALLOWED_NAMESPACES: Record<AppId, string[]> = {
    backoffice: ['tenant', 'modules', 'billing', 'governance', 'ops'],
    dashboard: ['*.admin', 'tenant.read', 'audit.scoped'],
    web: ['*.public', 'auth'],
    minside: ['*.user', 'auth', 'bookings', 'listings'],
    docs: ['docs.*', 'audit.read'],
    monitoring: ['ops.*', 'audit.read', 'events.read'],
};

// =============================================================================
// API Constants
// =============================================================================

/** Default page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum page size */
export const MAX_PAGE_SIZE = 100;

// =============================================================================
// Tenant Constants
// =============================================================================

/** Tenant status options */
export const TENANT_STATUSES = ['active', 'suspended', 'pending', 'archived'] as const;

// =============================================================================
// Module Constants
// =============================================================================

/** Core modules */
export const CORE_MODULES = ['auth', 'tenant', 'billing', 'audit'] as const;
