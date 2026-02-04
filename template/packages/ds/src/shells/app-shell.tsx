/**
 * App Shell Component
 * 
 * Main application shell with header and content areas
 * Following Designsystemet patterns
 */

import React, { forwardRef } from 'react';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Header component
   */
  header?: React.ReactNode;
  
  /**
   * Footer component
   */
  footer?: React.ReactNode;
  
  /**
   * Maximum width of content
   * @default '1440px'
   */
  maxWidth?: string;
  
  /**
   * Whether to use fluid layout (no max width)
   * @default false
   */
  fluid?: boolean;
  
  /**
   * Background color
   * @default 'var(--ds-color-neutral-background-default)'
   */
  background?: string;
  
  /**
   * Minimum height for the shell
   * @default '100vh'
   */
  minHeight?: string;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  ({
    children,
    fluid = false,
    maxWidth = '1440px',
    background = 'var(--ds-color-neutral-background-default)',
    minHeight = '100vh',
    header,
    footer,
    className,
    style,
    ...props
  }, ref) => {
    const shellStyle: React.CSSProperties = {
      maxWidth: fluid ? 'none' : maxWidth,
      margin: '0 auto',
      background,
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      ...style
    };

    return (
      <div ref={ref} className={className} style={shellStyle} {...props}>
        {/* Header Section */}
        {header && (
          <header style={{ flexShrink: 0 }}>
            {header}
          </header>
        )}

        {/* Main Content */}
        <main style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>

        {/* Footer Section */}
        {footer && (
          <footer style={{ 
            flexShrink: 0,
            marginTop: 'auto'
          }}>
            {footer}
          </footer>
        )}
      </div>
    );
  }
);

AppShell.displayName = 'AppShell';
