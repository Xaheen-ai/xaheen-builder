/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from '@xaheen/ds';
import * as Sentry from '@sentry/react';
import { auditService } from '@xaheen/sdk';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to audit service for compliance tracking
    auditService.logError('react_error_boundary', 'application', error, {
      componentStack: errorInfo.componentStack,
    });

    // Report to Sentry with component stack context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorScreen
          title="Noe gikk galt"
          description={this.state.error?.message || 'En uventet feil har oppstått. Vennligst prøv igjen.'}
          showRetryButton
          retryButtonText="Last siden på nytt"
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
