/**
 * XalaProviders - Complete provider stack for Xaheen apps
 *
 * This is the single provider composition used by all apps.
 * Follows the thin-app architecture: apps compose providers, not logic.
 */
import React, { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import {
    ErrorBoundary as _ErrorBoundary,
    ThemeProvider,
    DesignsystemetProvider,
    useTheme,
} from '@xala-technologies/platform-ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ErrorBoundary = _ErrorBoundary as any;
import { i18n, getDirection } from '@xaheen/i18n';
import type { Locale, Direction, AppId } from '@xaheen/shared';

// Import platform-ui styles for all apps
import '@xala-technologies/platform-ui/styles';

// =============================================================================
// Types
// =============================================================================

export interface XalaProvidersProps {
    /** Unique app identifier */
    appId: AppId;
    /** Child components */
    children: ReactNode;
    /** Default locale */
    defaultLocale?: Locale;
    /** Supported locales */
    supportedLocales?: Locale[];
}

export interface RuntimeContext {
    appId: AppId;
    env: Record<string, unknown>;
}

export interface LocaleContextValue {
    locale: Locale;
    direction: Direction;
    setLocale: (locale: Locale) => void;
}

// =============================================================================
// Contexts
// =============================================================================

const RuntimeContext = React.createContext<RuntimeContext | null>(null);
const LocaleContext = React.createContext<LocaleContextValue | null>(null);

// =============================================================================
// Hooks
// =============================================================================

export function useRuntime(): RuntimeContext {
    const ctx = React.useContext(RuntimeContext);
    if (!ctx) throw new Error('useRuntime must be used within XalaProviders');
    return ctx;
}

export function useLocale(): LocaleContextValue {
    const ctx = React.useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within XalaProviders');
    return ctx;
}

export function useDirection(): Direction {
    const { direction } = useLocale();
    return direction;
}

// Re-export useTheme from platform-ui for convenience
export { useTheme };

// =============================================================================
// LocaleProvider - Manages locale state (i18n is initialized synchronously in @xaheen/i18n)
// =============================================================================

function LocaleProvider({
    defaultLocale = 'nb',
    supportedLocales = ['nb', 'en', 'ar'],
    children,
}: {
    defaultLocale: Locale;
    supportedLocales: Locale[];
    children: ReactNode;
}): React.ReactElement {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale);
    const direction = getDirection(locale);

    // Set initial language
    useEffect(() => {
        if (i18n.language !== defaultLocale) {
            i18n.changeLanguage(defaultLocale);
        }
    }, [defaultLocale]);

    const setLocale = useCallback((newLocale: Locale) => {
        if (supportedLocales.includes(newLocale)) {
            setLocaleState(newLocale);
            i18n.changeLanguage(newLocale);
        }
    }, [supportedLocales]);

    const value: LocaleContextValue = useMemo(
        () => ({
            locale,
            direction,
            setLocale,
        }),
        [locale, direction, setLocale]
    );

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
}

// =============================================================================
// RuntimeProvider - Provides app runtime context
// =============================================================================

function RuntimeProvider({
    appId,
    env,
    children,
}: {
    appId: AppId;
    env: Record<string, unknown>;
    children: ReactNode;
}): React.ReactElement {
    const value: RuntimeContext = useMemo(
        () => ({ appId, env }),
        [appId, env]
    );
    return (
        <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
    );
}

// =============================================================================
// ThemedApp - Inner component that has access to theme context
// =============================================================================

function ThemedApp({
    locale,
    direction,
    children,
}: {
    locale: Locale;
    direction: Direction;
    children: ReactNode;
}): React.ReactElement {
    const { colorScheme } = useTheme();

    return (
        <DesignsystemetProvider
            theme="digilist"
            colorScheme={colorScheme}
            size="md"
            typography="primary"
            locale={locale}
            direction={direction === 'rtl' ? 'rtl' : 'ltr'}
        >
            {children}
        </DesignsystemetProvider>
    );
}

// =============================================================================
// XalaProviders - Complete provider stack
// =============================================================================

/**
 * Order (outside-in):
 * 1. ErrorBoundary - Catches all errors
 * 2. ThemeProvider - Manages color scheme state
 * 3. LocaleProvider - i18n + locale state
 * 4. DesignsystemetProvider - Injects theme CSS + data attributes
 * 5. RuntimeProvider - App context
 */
export function XalaProviders({
    appId,
    children,
    defaultLocale = 'nb',
    supportedLocales = ['nb', 'en', 'ar'],
}: XalaProvidersProps): React.ReactElement {
    return (
        <React.StrictMode>
            <ErrorBoundary>
                <ThemeProvider>
                    <LocaleProvider
                        defaultLocale={defaultLocale}
                        supportedLocales={supportedLocales}
                    >
                        <LocaleContext.Consumer>
                            {(localeCtx: LocaleContextValue | null) => (
                                <ThemedApp
                                    locale={localeCtx?.locale ?? defaultLocale}
                                    direction={localeCtx?.direction ?? 'ltr'}
                                >
                                    <RuntimeProvider
                                        appId={appId}
                                        env={{ appId }}
                                    >
                                        {children}
                                    </RuntimeProvider>
                                </ThemedApp>
                            )}
                        </LocaleContext.Consumer>
                    </LocaleProvider>
                </ThemeProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}

export default XalaProviders;
