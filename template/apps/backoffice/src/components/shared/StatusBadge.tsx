/**
 * StatusBadge Component
 * Standardized status indicator for bookings, listings, users, etc.
 * Provides consistent visual styling for different status types
 */

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'pending';

export interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<StatusVariant, { bg: string; color: string; border?: string }> = {
  success: {
    bg: 'var(--ds-color-success-surface-default)',
    color: 'var(--ds-color-success-text-default)',
    border: 'var(--ds-color-success-border-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-default)',
    color: 'var(--ds-color-warning-text-default)',
    border: 'var(--ds-color-warning-border-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-default)',
    color: 'var(--ds-color-danger-text-default)',
    border: 'var(--ds-color-danger-border-default)',
  },
  info: {
    bg: 'var(--ds-color-info-surface-default)',
    color: 'var(--ds-color-info-text-default)',
    border: 'var(--ds-color-info-border-default)',
  },
  neutral: {
    bg: 'var(--ds-color-neutral-surface-default)',
    color: 'var(--ds-color-neutral-text-default)',
    border: 'var(--ds-color-neutral-border-default)',
  },
  pending: {
    bg: 'var(--ds-color-accent-surface-default)',
    color: 'var(--ds-color-accent-text-default)',
    border: 'var(--ds-color-accent-border-default)',
  },
};

const sizeStyles = {
  sm: {
    fontSize: 'var(--ds-font-size-xs)',
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
  },
  md: {
    fontSize: 'var(--ds-font-size-sm)',
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
  },
};

export function StatusBadge({ variant, label, size = 'sm' }: StatusBadgeProps) {
  const styles = variantStyles[variant];
  const sizing = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: styles.bg,
        color: styles.color,
        border: styles.border ? `1px solid ${styles.border}` : 'none',
        borderRadius: 'var(--ds-border-radius-full)',
        fontWeight: 'var(--ds-font-weight-medium)',
        fontSize: sizing.fontSize,
        padding: sizing.padding,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
