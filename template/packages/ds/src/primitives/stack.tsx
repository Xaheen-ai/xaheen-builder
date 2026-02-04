/**
 * Stack Primitive
 * 
 * Low-level stack component for vertical/horizontal layouts
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction of the stack
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  
  /**
   * Spacing between items
   * @default '0'
   */
  spacing?: string | number;
  
  /**
   * Align items
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /**
   * Justify items
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  /**
   * Whether to wrap items
   * @default false
   */
  wrap?: boolean;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({
    children,
    direction = 'vertical',
    spacing = 0,
    align,
    justify,
    wrap = false,
    className,
    style,
    ...props
  }, ref) => {
    const stackStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'vertical' ? 'column' : 'row',
      gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn('ds-stack', `ds-stack--${direction}`, className)}
        style={stackStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
