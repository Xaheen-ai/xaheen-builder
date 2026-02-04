/**
 * Sentry Error Tracking Initialization
 *
 * Initializes Sentry SDK for production error tracking and performance monitoring.
 * Configured with tenant context for multi-tenant support.
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking and performance monitoring
 *
 * Only initializes if VITE_SENTRY_DSN is configured.
 * Includes BrowserTracing for performance monitoring and Replay for session replay.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Don't initialize Sentry if DSN is not configured
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] Skipping initialization - no DSN configured');
    }
    return;
  }

  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
  const release = import.meta.env.VITE_SENTRY_RELEASE;

  Sentry.init({
    dsn,
    environment,
    release,

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration({
        // Enable automatic instrumentation of user interactions
        tracingOrigins: ['localhost', /^\//],
      }),

      // Session replay for debugging
      Sentry.replayIntegration({
        // Capture 10% of all sessions
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
        // Mask all text content by default for privacy
        maskAllText: true,
        // Block all media (images, videos, etc.) for privacy
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    // Capture 100% of transactions in development, 10% in production
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,

    // Set sample rate for profiling
    profilesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,

    // Ignore common errors that don't need tracking
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors that are expected
      'NetworkError',
      'Network request failed',
      // Chrome extensions
      'chrome-extension://',
      'moz-extension://',
    ],

    // Filter events before sending
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (import.meta.env.DEV && !import.meta.env.VITE_SENTRY_SEND_IN_DEV) {
        console.error('[Sentry] Would send error:', event, hint);
        return null;
      }

      return event;
    },
  });

  if (import.meta.env.DEV) {
    console.info('[Sentry] Initialized successfully', {
      environment,
      release: release || 'undefined',
    });
  }
}

/**
 * Set tenant context for error tracking
 *
 * This adds tenant information to all subsequent error reports,
 * which is critical for multi-tenant debugging.
 *
 * @param tenantId - The tenant UUID
 * @param tenantName - Optional tenant name for easier identification
 */
export function setTenantContext(tenantId: string, tenantName?: string): void {
  Sentry.setContext('tenant', {
    id: tenantId,
    name: tenantName,
  });

  // Also set as a tag for easier filtering in Sentry
  Sentry.setTag('tenant_id', tenantId);
}

/**
 * Set user context for error tracking
 *
 * Associates errors with specific users for better debugging.
 *
 * @param userId - The user ID
 * @param email - User email (optional)
 * @param role - User role (optional)
 */
export function setUserContext(
  userId: string,
  email?: string,
  role?: string
): void {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Manually capture an exception
 *
 * Use this for errors that are caught but still need to be reported.
 *
 * @param error - The error to capture
 * @param context - Additional context to attach to the error
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Add breadcrumb for debugging context
 *
 * Breadcrumbs are automatically sent with error reports to provide
 * context about what the user was doing before the error occurred.
 *
 * @param message - Breadcrumb message
 * @param category - Category for filtering (e.g., 'auth', 'navigation')
 * @param level - Severity level
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}
