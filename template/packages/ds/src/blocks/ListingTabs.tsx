/**
 * ListingTabs
 *
 * Tabbed navigation component for listing detail pages.
 * Supports dynamic tabs based on listing type and available content.
 */
import * as React from 'react';
import { Tabs } from '@digdir/designsystemet-react';
import { cn } from '../utils';

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

export interface ListingTabsProps {
  /** Tab configurations */
  tabs: TabConfig[];
  /** Currently active tab id */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Default tab if activeTab not provided */
  defaultTab?: string;
  /** Tab list variant */
  variant?: 'default' | 'secondary' | 'subtle';
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ListingTabs({
  tabs,
  activeTab,
  onTabChange,
  defaultTab,
  variant = 'default',
  className,
}: ListingTabsProps): React.ReactElement {
  // Filter visible tabs
  const visibleTabs = tabs.filter((tab) => tab.visible !== false);

  // Determine active tab
  const effectiveActiveTab = activeTab || defaultTab || visibleTabs[0]?.id || '';

  // Get background style based on variant
  const getTabListStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        };
      case 'subtle':
        return {
          backgroundColor: 'transparent',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        };
      default:
        return {};
    }
  };

  return (
    <div className={cn('listing-tabs', className)}>
      <Tabs
        value={effectiveActiveTab}
        onChange={onTabChange || (() => {})}
      >
        <Tabs.List style={getTabListStyle()}>
          {visibleTabs.map((tab) => (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
            >
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
      className={cn('tab-content', className)}
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
      className={cn('tab-empty-state', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-8)',
        textAlign: 'center',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px dashed var(--ds-color-neutral-border-subtle)',
      }}
    >
      {icon && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            marginBottom: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-full)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {icon}
        </span>
      )}
      <p
        style={{
          margin: 0,
          marginBottom: description ? 'var(--ds-spacing-1)' : 0,
          fontSize: 'var(--ds-font-size-md)',
          fontWeight: 'var(--ds-font-weight-medium)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {title}
      </p>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>{action}</div>
      )}
    </div>
  );
}

export default ListingTabs;
