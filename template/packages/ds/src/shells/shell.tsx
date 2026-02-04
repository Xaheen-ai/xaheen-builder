/**
 * Application Shell Component
 * 
 * A reusable shell component that provides consistent layout structure
 * across all applications in the monorepo.
 */

import React, { forwardRef } from 'react';
import { Fieldset, Heading } from '@digdir/designsystemet-react';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The main heading for the application
   */
  title?: string;
  
  /**
   * The subtitle or description for the application
   */
  subtitle?: string;
  
  /**
   * Whether to use fluid layout (no max-width)
   * @default false
   */
  fluid?: boolean;
  
  /**
   * Maximum width of the content area
   * @default '1440px' - More spacious layout for modern screens
   */
  maxWidth?: string;
  
  /**
   * Padding for the shell
   * @default 'var(--ds-spacing-8)' - Uses design token
   */
  padding?: string;
  
  /**
   * Whether to show the branding section
   * @default true
   */
  showBranding?: boolean;
  
  /**
   * Additional header content
   */
  header?: React.ReactNode;
  
  /**
   * Additional footer content
   */
  footer?: React.ReactNode;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  ({
    children,
    title,
    subtitle,
    fluid = false,
    maxWidth = '1440px',
    padding = 'var(--ds-spacing-8)',
    showBranding = true,
    header,
    footer,
    className,
    style,
    ...props
  }, ref) => {
    const shellStyle = {
      maxWidth: fluid ? 'none' : maxWidth,
      margin: '0 auto',
      padding,
      ...style
    };

    return (
      <div ref={ref} className={className} style={shellStyle} {...props}>
        {/* Header Section */}
        {header || (title || showBranding) ? (
          <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
            {header || (
              <>
                {title && (
                  <Heading level={1} style={{ marginBottom: subtitle ? 'var(--ds-spacing-2)' : 0 }}>
                    {title}
                  </Heading>
                )}
                {subtitle && (
                  <p style={{ opacity: 0.8, marginTop: 0 }}>{subtitle}</p>
                )}
              </>
            )}
          </header>
        ) : null}

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer Section */}
        {footer && (
          <footer style={{ marginTop: 'var(--ds-spacing-16)' }}>
            {footer}
          </footer>
        )}
      </div>
    );
  }
);

AppShell.displayName = 'AppShell';
