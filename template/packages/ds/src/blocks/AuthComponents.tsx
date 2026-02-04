/**
 * Auth-related UI components
 *
 * Reusable components for loading states, access denied screens,
 * and other auth-related UI patterns.
 */
import * as React from 'react';
import { Spinner, Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../utils';

// =============================================================================
// LoadingScreen - Full page loading state
// =============================================================================

export interface LoadingScreenProps {
  /** Loading message */
  message?: string;
  /** Screen height (default: 100vh) */
  height?: string;
  /** Custom class name */
  className?: string;
}

export function LoadingScreen({
  message = 'Laster...',
  height = '100vh',
  className,
}: LoadingScreenProps): React.ReactElement {
  return (
    <div
      className={cn('loading-screen', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height,
        gap: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      <Spinner aria-label={message} data-size="lg" />
      {message && (
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          {message}
        </Paragraph>
      )}
    </div>
  );
}

// =============================================================================
// AccessDeniedScreen - No permission error screen
// =============================================================================

export interface AccessDeniedScreenProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Show back button */
  showBackButton?: boolean;
  /** Back button text */
  backButtonText?: string;
  /** Back button click handler */
  onBack?: () => void;
  /** Custom class name */
  className?: string;
}

export function AccessDeniedScreen({
  title = 'Ingen tilgang',
  description = 'Du har ikke tilgang til denne siden. Kontakt administrator hvis du mener dette er feil.',
  showBackButton = false,
  backButtonText = 'Gå tilbake',
  onBack,
  className,
}: AccessDeniedScreenProps): React.ReactElement {
  return (
    <div
      className={cn('access-denied-screen', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '400px',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-6)',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: 'var(--ds-color-danger-surface-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ds-color-danger-text-default)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <Heading
        level={1}
        data-size="lg"
        style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}
      >
        {title}
      </Heading>

      <Paragraph
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          margin: 0,
          maxWidth: '400px',
        }}
      >
        {description}
      </Paragraph>

      {showBackButton && onBack && (
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          style={{ marginTop: 'var(--ds-spacing-2)' }}
        >
          {backButtonText}
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// NotFoundScreen - 404 error screen
// =============================================================================

export interface NotFoundScreenProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Show home button */
  showHomeButton?: boolean;
  /** Home button text */
  homeButtonText?: string;
  /** Home button click handler */
  onHome?: () => void;
  /** Custom class name */
  className?: string;
}

export function NotFoundScreen({
  title = 'Siden finnes ikke',
  description = 'Beklager, vi kunne ikke finne siden du leter etter.',
  showHomeButton = false,
  homeButtonText = 'Gå til forsiden',
  onHome,
  className,
}: NotFoundScreenProps): React.ReactElement {
  return (
    <div
      className={cn('not-found-screen', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '400px',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-6)',
        textAlign: 'center',
      }}
    >
      {/* 404 Text */}
      <Heading
        level={1}
        data-size="2xl"
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          margin: 0,
          fontSize: '6rem',
          fontWeight: 'var(--ds-font-weight-bold)',
          lineHeight: 1,
        }}
      >
        404
      </Heading>

      <Heading level={2} data-size="lg" style={{ margin: 0 }}>
        {title}
      </Heading>

      <Paragraph
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          margin: 0,
          maxWidth: '400px',
        }}
      >
        {description}
      </Paragraph>

      {showHomeButton && onHome && (
        <Button
          type="button"
          variant="primary"
          onClick={onHome}
          style={{ marginTop: 'var(--ds-spacing-2)' }}
        >
          {homeButtonText}
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// ErrorScreen - Generic error screen
// =============================================================================

export interface ErrorScreenProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Error details (optional) */
  errorDetails?: string;
  /** Show retry button */
  showRetryButton?: boolean;
  /** Retry button text */
  retryButtonText?: string;
  /** Retry button click handler */
  onRetry?: () => void;
  /** Custom class name */
  className?: string;
}

export function ErrorScreen({
  title = 'Noe gikk galt',
  description = 'Beklager, det oppstod en feil. Prøv igjen senere.',
  errorDetails,
  showRetryButton = false,
  retryButtonText = 'Prøv igjen',
  onRetry,
  className,
}: ErrorScreenProps): React.ReactElement {
  return (
    <div
      className={cn('error-screen', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '400px',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-6)',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: 'var(--ds-color-warning-surface-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ds-color-warning-text-default)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <Heading level={1} data-size="lg" style={{ margin: 0 }}>
        {title}
      </Heading>

      <Paragraph
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          margin: 0,
          maxWidth: '400px',
        }}
      >
        {description}
      </Paragraph>

      {errorDetails && (
        <code
          style={{
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-md)',
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-neutral-text-subtle)',
            maxWidth: '100%',
            overflow: 'auto',
          }}
        >
          {errorDetails}
        </code>
      )}

      {showRetryButton && onRetry && (
        <Button
          type="button"
          variant="primary"
          onClick={onRetry}
          style={{ marginTop: 'var(--ds-spacing-2)' }}
        >
          {retryButtonText}
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// PermissionGate - Render children only if condition is met
// =============================================================================

export interface PermissionGateProps {
  /** Whether the user has permission */
  allowed: boolean;
  /** Content to render when allowed */
  children: React.ReactNode;
  /** Content to render when not allowed (defaults to AccessDeniedScreen) */
  fallback?: React.ReactNode;
}

export function PermissionGate({
  allowed,
  children,
  fallback,
}: PermissionGateProps): React.ReactElement | null {
  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <AccessDeniedScreen />;
}
