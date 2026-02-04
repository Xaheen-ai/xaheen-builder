/**
 * CapacityCard
 *
 * Dark card displaying maximum capacity with people icon.
 * Example: "MAKS TILLATT: 50 personer"
 */
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { PeopleIcon } from '../primitives/icons';

export interface CapacityCardProps {
  /** Maximum capacity number */
  maxCapacity: number;
  /** Label text (defaults to "MAKS TILLATT") */
  label?: string;
  /** Custom icon (defaults to PeopleIcon) */
  icon?: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'dark';
  /** Custom class name */
  className?: string;
}

/**
 * CapacityCard component
 *
 * @example
 * ```tsx
 * <CapacityCard maxCapacity={50} />
 * ```
 */
export function CapacityCard({
  maxCapacity,
  label = 'MAKS TILLATT',
  icon,
  variant = 'dark',
  className,
}: CapacityCardProps): React.ReactElement {
  const isDark = variant === 'dark';

  return (
    <div
      className={cn('capacity-card', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
        backgroundColor: isDark
          ? 'var(--ds-color-neutral-surface-default)'
          : 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: isDark
          ? 'none'
          : '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'var(--ds-spacing-12)',
          height: 'var(--ds-spacing-12)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        {icon || <PeopleIcon size={24} />}
      </div>

      {/* Content */}
      <div>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--ds-letter-spacing-wide, 0.025em)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {label}
        </Paragraph>
        <Paragraph
          data-size="lg"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {maxCapacity} personer
        </Paragraph>
      </div>
    </div>
  );
}

export default CapacityCard;
