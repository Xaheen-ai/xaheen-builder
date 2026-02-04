/**
 * Sentry Test Component - Minside App
 *
 * TEMPORARY COMPONENT FOR TESTING ERROR TRACKING
 * This component should be removed before production deployment.
 *
 * Usage:
 * 1. Import this component in any route (e.g., HomePage)
 * 2. Click the buttons to trigger different types of errors
 * 3. Verify errors appear in Sentry dashboard with proper context
 * 4. Remove this component when testing is complete
 */

import { useState } from 'react';
import { Button, Card } from '@xaheen/ds';
import { setTenantContext, setUserContext, addBreadcrumb, captureException } from '../lib/sentry';

export function SentryTestComponent() {
  const [counter, setCounter] = useState(0);

  const handleSyncError = () => {
    // This will be caught by ErrorBoundary
    throw new Error('Test synchronous error from button click - Minside App');
  };

  const handleAsyncError = async () => {
    // Add breadcrumb before error
    addBreadcrumb('User clicked async error button', 'test', 'info');

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    // This error might not be caught by ErrorBoundary
    // Better to use try-catch and captureException
    try {
      throw new Error('Test async error from setTimeout - Minside App');
    } catch (error) {
      captureException(error as Error, {
        operation: 'test-async-error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handlePromiseRejection = () => {
    // Unhandled promise rejection
    Promise.reject(new Error('Test unhandled promise rejection - Minside App'));
  };

  const handleTypeError = () => {
    // This will throw a TypeError
    const obj: unknown = null;
    (obj as { nonExistentMethod: () => void }).nonExistentMethod();
  };

  const handleSetTenantContext = () => {
    setTenantContext(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'Test Kommune'
    );
    alert('Tenant context set! Next error will include tenant information.');
  };

  const handleSetUserContext = () => {
    setUserContext(
      'test-user-789',
      'test@minside.example.com',
      'citizen'
    );
    alert('User context set! Next error will include user information.');
  };

  const handleAddBreadcrumbs = () => {
    addBreadcrumb('User clicked button', 'ui', 'info');
    addBreadcrumb('Navigation to test page', 'navigation', 'info');
    addBreadcrumb('Data loaded successfully', 'data', 'debug');
    setCounter(counter + 1);
    alert(`Added 3 breadcrumbs! Counter: ${counter + 1}`);
  };

  return (
    <Card style={{ padding: 'var(--ds-spacing-8)', margin: 'var(--ds-spacing-8)', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: 'var(--ds-spacing-4)' }}>🧪 Sentry Error Tracking Test Panel - Minside App</h2>
      <p style={{ marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
        ⚠️ <strong>For testing only!</strong> Remove this component before production.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        <div>
          <h3 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Context Setup</h3>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            <Button onClick={handleSetTenantContext} variant="secondary" type="button">
              Set Tenant Context
            </Button>
            <Button onClick={handleSetUserContext} variant="secondary" type="button">
              Set User Context
            </Button>
            <Button onClick={handleAddBreadcrumbs} variant="secondary" type="button">
              Add Breadcrumbs ({counter})
            </Button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Error Tests</h3>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            <Button onClick={handleSyncError} variant="primary" type="button">
              Throw Sync Error
            </Button>
            <Button onClick={handleAsyncError} variant="primary" type="button">
              Throw Async Error
            </Button>
            <Button onClick={handlePromiseRejection} variant="primary" type="button">
              Promise Rejection
            </Button>
            <Button onClick={handleTypeError} variant="primary" type="button">
              Throw TypeError
            </Button>
          </div>
        </div>

        <div style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
          fontSize: 'var(--ds-font-size-sm)'
        }}>
          <h4 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Testing Instructions:</h4>
          {/* eslint-disable-next-line digdir/prefer-ds-components -- Simple ordered list for testing instructions */}
          <ol style={{ marginLeft: 'var(--ds-spacing-6)', lineHeight: 'var(--ds-font-line-height-body)' }}>
            <li>First, set tenant and user context (optional but recommended)</li>
            <li>Add some breadcrumbs to test breadcrumb tracking</li>
            <li>Click any error button to trigger a test error</li>
            <li>Check the browser console for error logs</li>
            <li>Check your Sentry dashboard for the error report</li>
            <li>Verify context (tenant, user) and breadcrumbs appear in Sentry</li>
          </ol>
          <p style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            <strong>Note:</strong> Sync errors will show the ErrorBoundary screen.
            Async errors are caught and reported but won't trigger ErrorBoundary.
          </p>
        </div>
      </div>
    </Card>
  );
}
