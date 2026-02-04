/**
 * Navigation Component
 * 
 * Horizontal navigation following Designsystemet patterns
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Navigation links
   */
  children: React.ReactNode;
  
  /**
   * Spacing between items
   * @default 32
   */
  spacing?: number;
}

export const Navigation = forwardRef<HTMLDivElement, NavigationProps>(
  ({ children, spacing = 32, className, style, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('ds-navigation', className)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing}px`,
          ...style
        }}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

// Navigation Link
export interface NavigationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Is this the active page?
   */
  active?: boolean;
}

export const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ active, children, className, style, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn('ds-navigation-link', active && 'ds-navigation-link--active', className)}
        style={{
          color: active
            ? 'var(--ds-color-neutral-text-default)'
            : 'var(--ds-color-neutral-text-default)',
          textDecoration: 'none',
          fontWeight: active ? 'var(--ds-font-weight-semibold)' as unknown as number : 'var(--ds-font-weight-regular)' as unknown as number,
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          borderRadius: 'var(--ds-border-radius-sm)',
          transition: 'all 0.2s',
          ...(active && {
            backgroundColor: 'var(--ds-color-accent-surface-default)'
          }),
          ...style
        }}
        {...props}
      >
        {children}
      </a>
    );
  }
);

NavigationLink.displayName = 'NavigationLink';
