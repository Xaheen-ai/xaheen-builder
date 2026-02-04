/**
 * DetailTabs
 *
 * Tabbed navigation component for listing detail view in backoffice.
 * Supports tabs for Overview, Bookings, Availability, and Audit Trail.
 */
import * as React from 'react';
import { Tabs } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export interface TabConfig {
  /** Unique tab identifier */
  id: string;
  /** Display label */
  label: string;
  /** Tab icon (optional) */
  icon?: React.ReactNode;
  /** Whether to show this tab */
  visible?: boolean;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Tab content */
  content: React.ReactNode;
}

export interface DetailTabsProps {
  /** Tab configurations */
  tabs: TabConfig[];
  /** Currently active tab id */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Default tab if activeTab not provided */
  defaultTab?: string;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function DetailTabs({
  tabs,
  activeTab,
  onTabChange,
  defaultTab = 'overview',
  className,
}: DetailTabsProps): React.ReactElement {
  // Filter visible tabs
  const visibleTabs = tabs.filter((tab) => tab.visible !== false);

  // Determine active tab
  const effectiveActiveTab = activeTab || defaultTab || visibleTabs[0]?.id || '';

  return (
    <div className={className}>
      <Tabs value={effectiveActiveTab} onChange={onTabChange || (() => {})}>
        <Tabs.List
          style={{
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          {visibleTabs.map((tab) => (
            <Tabs.Tab key={tab.id} value={tab.id}>
              {tab.icon && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: 'var(--ds-spacing-1)',
                  }}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: '0 var(--ds-spacing-1)',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    fontSize: 'var(--ds-font-size-xs)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {visibleTabs.map((tab) => (
          <Tabs.Panel
            key={tab.id}
            value={tab.id}
            style={{
              padding: 'var(--ds-spacing-4) 0',
            }}
          >
            {tab.content}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

// =============================================================================
// Tab Content Wrapper
// =============================================================================

export interface TabContentProps {
  /** Content to render */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function TabContent({
  children,
  className,
}: TabContentProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Empty State
// =============================================================================

export interface TabEmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function TabEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: TabEmptyStateProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-8)',
        textAlign: 'center',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: 'var(--ds-spacing-3)',
            fontSize: 'var(--ds-font-size-heading-xl)',
            opacity: 0.5,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 'var(--ds-font-size-lg)',
          fontWeight: 'var(--ds-font-weight-medium)',
          marginBottom: 'var(--ds-spacing-2)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            marginBottom: action ? 'var(--ds-spacing-4)' : 0,
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
