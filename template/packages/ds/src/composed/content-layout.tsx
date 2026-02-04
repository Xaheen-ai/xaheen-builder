/**
 * Content Layout Component
 * 
 * High-level layout component for page content
 */

import React, { forwardRef } from 'react';
import { Container, Grid } from '../primitives';

export interface ContentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the content
   * @default '1440px'
   */
  maxWidth?: string;
  
  /**
   * Padding of the container
   * @default '32px'
   */
  padding?: string | number;
  
  /**
   * Whether to use fluid layout
   * @default false
   */
  fluid?: boolean;
  
  /**
   * Header offset to account for fixed headers
   * @default 'none'
   */
  headerOffset?: 'none' | 'sm' | 'md' | 'lg';
  
  /**
   * Grid configuration for content
   */
  grid?: {
    columns?: string;
    gap?: string | number;
    responsive?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
    };
  };
}

export const ContentLayout = forwardRef<HTMLDivElement, ContentLayoutProps>(
  ({
    children,
    maxWidth = '1440px',
    padding = '32px',
    fluid = false,
    headerOffset = 'none',
    grid,
    className,
    style,
    ...props
  }, ref) => {
    const headerOffsets = {
      none: '0',
      sm: '48px',
      md: '64px',
      lg: '80px'
    };

    const containerStyle: React.CSSProperties = {
      containerName: 'ds-content',
      paddingTop: headerOffsets[headerOffset],
      ...style
    };

    const content = grid ? (
      <Grid
        columns={grid.columns || '1fr'}
        gap={grid.gap || 0}
      >
        {children}
      </Grid>
    ) : children;

    return (
      <Container
        ref={ref}
        maxWidth={maxWidth}
        padding={padding}
        fluid={fluid}
        className={className}
        style={containerStyle}
        id="main"
        {...props}
      >
        {content}
      </Container>
    );
  }
);

ContentLayout.displayName = 'ContentLayout';
