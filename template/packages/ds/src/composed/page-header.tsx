/**
 * Page Header Component
 * 
 * A consistent header component for pages with title, subtitle, and actions
 */

import React, { forwardRef } from 'react';
import { Heading } from '@digdir/designsystemet-react';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The page title
   */
  title: string;
  
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  
  /**
   * Action buttons to display on the right
   */
  actions?: React.ReactNode;
  
  /**
   * Breadcrumb navigation
   */
  breadcrumb?: React.ReactNode;
  
  /**
   * Whether to show a border bottom
   * @default false
   */
  bordered?: boolean;
  
  /**
   * Heading level for the title
   * @default 1
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({
    children,
    title,
    subtitle,
    actions,
    breadcrumb,
    bordered = false,
    level = 1,
    className,
    style,
    ...props
  }, ref) => {
    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 'var(--ds-spacing-8)',
      paddingBottom: bordered ? 'var(--ds-spacing-6)' : 0,
      borderBottom: bordered ? '1px solid var(--ds-color-neutral-border-default)' : 'none',
      ...style
    };

    return (
      <div ref={ref} className={className} style={headerStyle} {...props}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {breadcrumb && (
            <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>{breadcrumb}</div>
          )}
          <Heading level={level} style={{ marginBottom: subtitle ? 'var(--ds-spacing-2)' : 0 }}>
            {title}
          </Heading>
          {subtitle && (
            <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 0 }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
        
        {actions && (
          <div style={{ marginLeft: 'var(--ds-spacing-6)', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
