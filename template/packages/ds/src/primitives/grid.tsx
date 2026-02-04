/**
 * Grid Primitive
 * 
 * Low-level grid layout component following Xala SDK patterns
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * CSS Grid template columns
   * @default '1fr'
   */
  columns?: string;
  
  /**
   * CSS Grid template rows
   */
  rows?: string;
  
  /**
   * Gap between grid items
   * @default '0'
   */
  gap?: string | number;
  
  /**
   * Column gap
   */
  gapX?: string | number;
  
  /**
   * Row gap
   */
  gapY?: string | number;
  
  /**
   * Responsive columns object
   */
  responsive?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    children,
    columns = '1fr',
    rows,
    gap = 0,
    gapX,
    gapY,
    responsive,
    className,
    style,
    ...props
  }, ref) => {
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: columns,
      gridTemplateRows: rows,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      columnGap: gapX ? (typeof gapX === 'number' ? `${gapX}px` : gapX) : undefined,
      rowGap: gapY ? (typeof gapY === 'number' ? `${gapY}px` : gapY) : undefined,
      ...style
    };

    // Note: Responsive styles would need to be handled via CSS classes or inline styles
    // For now, we'll skip the responsive implementation to keep it simple

    return (
      <div
        ref={ref}
        className={cn('ds-grid', className)}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
