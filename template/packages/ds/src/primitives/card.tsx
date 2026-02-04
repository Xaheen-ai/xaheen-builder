/**
 * Card Component
 * 
 * Container component for content
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, style, ...props }, ref) => {
    const getStyles = () => {
      const base = {
        borderRadius: 'var(--ds-border-radius-md)',
        transition: 'all 0.2s',
      };

      switch (variant) {
        case 'outlined':
          return {
            ...base,
            border: '1px solid var(--ds-color-neutral-border-default)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
          };
        case 'elevated':
          return {
            ...base,
            boxShadow: 'var(--ds-shadow-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
          };
        default:
          return {
            ...base,
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
          };
      }
    };

    return (
      <div
        ref={ref}
        className={cn('ds-card', className)}
        style={{ ...getStyles(), ...style }}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
