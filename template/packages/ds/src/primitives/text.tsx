/**
 * Text Component
 * 
 * Typography component
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Text variant
   * @default 'body'
   */
  variant?: 'body' | 'subtitle' | 'caption' | 'overline';
  
  /**
   * Text size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Text weight
   * @default 'normal'
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Text color
   */
  color?: string;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ 
    variant = 'body', 
    size = 'md', 
    weight = 'normal',
    color,
    className,
    style,
    ...props 
  }, ref) => {
    const getStyles = () => {
      const base: React.CSSProperties = {
        margin: 0,
        color: color || 'var(--ds-color-neutral-text-default)',
      };

      // Size mapping using design tokens
      const sizes = {
        xs: { fontSize: 'var(--ds-font-size-xs)', lineHeight: 'var(--ds-line-height-tight, 1.3)' },
        sm: { fontSize: 'var(--ds-font-size-sm)', lineHeight: 'var(--ds-line-height-snug, 1.4)' },
        md: { fontSize: 'var(--ds-font-size-md)', lineHeight: 'var(--ds-line-height-normal, 1.5)' },
        lg: { fontSize: 'var(--ds-font-size-lg)', lineHeight: 'var(--ds-line-height-relaxed, 1.55)' },
        xl: { fontSize: 'var(--ds-font-size-xl)', lineHeight: 'var(--ds-line-height-relaxed, 1.5)' },
      };

      // Weight mapping using design tokens
      const weights = {
        normal: 'var(--ds-font-weight-regular)',
        medium: 'var(--ds-font-weight-medium)',
        semibold: 'var(--ds-font-weight-semibold)',
        bold: 'var(--ds-font-weight-bold)',
      };

      return {
        ...base,
        ...sizes[size],
        fontWeight: weights[weight] as unknown as number,
      };
    };

    const Component = variant === 'overline' ? 'span' : 'p';

    return (
      <Component
        ref={ref}
        className={cn('ds-text', className)}
        style={{ ...getStyles(), ...style }}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
