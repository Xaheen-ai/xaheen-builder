/**
 * StatusBadges
 *
 * Reusable status badge components for various entity types.
 * Norwegian labels with consistent color coding.
 *
 * Uses custom styled tags instead of Digdir Badge (which is designed for numeric counts).
 */
import * as React from 'react';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeConfig {
  color: BadgeColor;
  label: string;
}

// =============================================================================
// Base StatusTag Component
// =============================================================================

const colorStyles: Record<BadgeColor, { bg: string; text: string }> = {
  success: {
    bg: 'var(--ds-color-success-surface-default)',
    text: 'var(--ds-color-success-text-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-default)',
    text: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-default)',
    text: 'var(--ds-color-danger-text-default)',
  },
  info: {
    bg: 'var(--ds-color-info-surface-default)',
    text: 'var(--ds-color-info-text-default)',
  },
  neutral: {
    bg: 'var(--ds-color-neutral-surface-hover)',
    text: 'var(--ds-color-neutral-text-subtle)',
  },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', { padding: string; fontSize: string }> = {
  sm: {
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-xs)',
  },
  md: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    fontSize: 'var(--ds-font-size-sm)',
  },
  lg: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
    fontSize: 'var(--ds-font-size-md)',
  },
};

export interface StatusTagProps {
  /** The label text to display */
  children: React.ReactNode;
  /** Color scheme */
  color: BadgeColor;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
}

/**
 * Base StatusTag component for displaying status labels.
 * Use this for custom status displays or when you need more control.
 */
export function StatusTag({
  children,
  color,
  size = 'sm',
  className,
}: StatusTagProps): React.ReactElement {
  const colorStyle = colorStyles[color];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={cn('status-tag', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: colorStyle.bg,
        color: colorStyle.text,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// Booking Status Badge
// =============================================================================

export type BookingStatusType = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const bookingStatusConfig: Record<BookingStatusType, StatusBadgeConfig> = {
  pending: { color: 'warning', label: 'Venter' },
  confirmed: { color: 'success', label: 'Bekreftet' },
  cancelled: { color: 'neutral', label: 'Kansellert' },
  completed: { color: 'info', label: 'Fullført' },
};

export interface BookingStatusBadgeProps {
  status: BookingStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function BookingStatusBadge({ status, size = 'sm' }: BookingStatusBadgeProps): React.ReactElement {
  const config = bookingStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Payment Status Badge
// =============================================================================

export type PaymentStatusType = 'paid' | 'unpaid' | 'partial' | 'refunded';

const paymentStatusConfig: Record<PaymentStatusType, StatusBadgeConfig> = {
  paid: { color: 'success', label: 'Betalt' },
  unpaid: { color: 'warning', label: 'Ikke betalt' },
  partial: { color: 'warning', label: 'Delvis betalt' },
  refunded: { color: 'neutral', label: 'Refundert' },
};

export interface PaymentStatusBadgeProps {
  status: PaymentStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function PaymentStatusBadge({ status, size = 'sm' }: PaymentStatusBadgeProps): React.ReactElement {
  const config = paymentStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Listing Status Badge
// =============================================================================

export type ListingStatusType = 'published' | 'draft' | 'archived' | 'maintenance';

const listingStatusConfig: Record<ListingStatusType, StatusBadgeConfig> = {
  published: { color: 'success', label: 'Publisert' },
  draft: { color: 'warning', label: 'Utkast' },
  archived: { color: 'neutral', label: 'Arkivert' },
  maintenance: { color: 'info', label: 'Vedlikehold' },
};

export interface ListingStatusBadgeProps {
  status: ListingStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function ListingStatusBadge({ status, size = 'sm' }: ListingStatusBadgeProps): React.ReactElement {
  const config = listingStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Request Status Badge
// =============================================================================

export type RequestStatusType = 'pending' | 'needs_info' | 'approved' | 'rejected';

const requestStatusConfig: Record<RequestStatusType, StatusBadgeConfig> = {
  pending: { color: 'warning', label: 'Venter' },
  needs_info: { color: 'info', label: 'Trenger info' },
  approved: { color: 'success', label: 'Godkjent' },
  rejected: { color: 'danger', label: 'Avslått' },
};

export interface RequestStatusBadgeProps {
  status: RequestStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function RequestStatusBadge({ status, size = 'sm' }: RequestStatusBadgeProps): React.ReactElement {
  const config = requestStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Seasonal Lease Status Badge
// =============================================================================

export type SeasonalLeaseStatusType = 'draft' | 'pending' | 'approved' | 'active' | 'upcoming' | 'expired' | 'cancelled' | 'terminated';

const seasonalLeaseStatusConfig: Record<SeasonalLeaseStatusType, StatusBadgeConfig> = {
  draft: { color: 'neutral', label: 'Utkast' },
  pending: { color: 'warning', label: 'Venter' },
  approved: { color: 'info', label: 'Godkjent' },
  active: { color: 'success', label: 'Aktiv' },
  upcoming: { color: 'info', label: 'Kommende' },
  expired: { color: 'neutral', label: 'Utløpt' },
  cancelled: { color: 'neutral', label: 'Kansellert' },
  terminated: { color: 'danger', label: 'Avsluttet' },
};

export interface SeasonalLeaseStatusBadgeProps {
  status: SeasonalLeaseStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function SeasonalLeaseStatusBadge({ status, size = 'sm' }: SeasonalLeaseStatusBadgeProps): React.ReactElement {
  const config = seasonalLeaseStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Organization Status Badge
// =============================================================================

export type OrganizationStatusType = 'active' | 'inactive' | 'suspended';

const organizationStatusConfig: Record<OrganizationStatusType, StatusBadgeConfig> = {
  active: { color: 'success', label: 'Aktiv' },
  inactive: { color: 'neutral', label: 'Inaktiv' },
  suspended: { color: 'danger', label: 'Suspendert' },
};

export interface OrganizationStatusBadgeProps {
  status: OrganizationStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function OrganizationStatusBadge({ status, size = 'sm' }: OrganizationStatusBadgeProps): React.ReactElement {
  const config = organizationStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// User Status Badge
// =============================================================================

export type UserStatusType = 'active' | 'inactive' | 'suspended';

const userStatusConfig: Record<UserStatusType, StatusBadgeConfig> = {
  active: { color: 'success', label: 'Aktiv' },
  inactive: { color: 'neutral', label: 'Inaktiv' },
  suspended: { color: 'danger', label: 'Suspendert' },
};

export interface UserStatusBadgeProps {
  status: UserStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function UserStatusBadge({ status, size = 'sm' }: UserStatusBadgeProps): React.ReactElement {
  const config = userStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Generic Status Badge (for custom statuses)
// =============================================================================

export interface GenericStatusBadgeProps {
  status: string;
  config?: Record<string, StatusBadgeConfig>;
  size?: 'sm' | 'md' | 'lg';
}

export function GenericStatusBadge({ status, config, size = 'sm' }: GenericStatusBadgeProps): React.ReactElement {
  const statusConfig = config?.[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={statusConfig.color} size={size}>{statusConfig.label}</StatusTag>;
}

// =============================================================================
// Export config for customization
// =============================================================================

export const statusConfigs = {
  booking: bookingStatusConfig,
  payment: paymentStatusConfig,
  listing: listingStatusConfig,
  request: requestStatusConfig,
  seasonalLease: seasonalLeaseStatusConfig,
  organization: organizationStatusConfig,
  user: userStatusConfig,
};
