/**
 * Dashboard Components
 *
 * Reusable components for admin dashboards including
 * stat cards, activity feeds, and quick actions.
 */
import * as React from 'react';
import { Card, Heading, Paragraph } from '@digdir/designsystemet-react';
import { TrendUpIcon, TrendDownIcon } from '../primitives/icons';
import { cn } from '../utils';
import { StatusTag, type BadgeColor } from './StatusBadges';

// =============================================================================
// StatCard - KPI/Metric Display Card
// =============================================================================

export interface StatCardProps {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional description text */
  description?: string;
  /** Optional accent color */
  color?: string;
  /** Optional trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Optional icon */
  icon?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  color,
  trend,
  icon,
  className,
}: StatCardProps): React.ReactElement {
  return (
    <Card
      className={cn('stat-card', className)}
      style={{
        padding: 'var(--ds-spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          {title}
        </Paragraph>
        {icon && (
          <div
            style={{
              color: color || 'var(--ds-color-neutral-text-subtle)',
              opacity: 0.5,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-3)' }}>
        <Heading
          level={3}
          data-size="2xl"
          style={{ color: color || 'var(--ds-color-neutral-text-default)', margin: 0 }}
        >
          {value}
        </Heading>
        {trend && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: trend.isPositive
                ? 'var(--ds-color-success-text-default)'
                : 'var(--ds-color-danger-text-default)',
            }}
          >
            {trend.isPositive ? <TrendUpIcon size={16} /> : <TrendDownIcon size={16} />}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <Paragraph
          data-size="xs"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          {description}
        </Paragraph>
      )}
    </Card>
  );
}

// =============================================================================
// ActivityItem - Activity Feed Item
// =============================================================================

export type ActivityStatus = 'pending' | 'approved' | 'rejected';

export interface ActivityItemProps {
  /** Activity title */
  title: string;
  /** Activity description */
  description: string;
  /** Time string (e.g., "For 5 minutter siden") */
  time: string;
  /** Activity status */
  status: ActivityStatus;
  /** Custom class name */
  className?: string;
}

const statusColors: Record<ActivityStatus, string> = {
  pending: 'var(--ds-color-warning-text-default)',
  approved: 'var(--ds-color-success-text-default)',
  rejected: 'var(--ds-color-danger-text-default)',
};

const statusLabels: Record<ActivityStatus, string> = {
  pending: 'Venter',
  approved: 'Godkjent',
  rejected: 'Avslått',
};

const statusBadgeColors: Record<ActivityStatus, BadgeColor> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function ActivityItem({
  title,
  description,
  time,
  status,
  className,
}: ActivityItemProps): React.ReactElement {
  const badgeColor = statusBadgeColors[status];
  
  return (
    <div
      className={cn('activity-item', className)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: statusColors[status],
          marginTop: '6px',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
          <Paragraph
            data-size="sm"
            style={{ fontWeight: 'var(--ds-font-weight-medium)', margin: 0 }}
          >
            {title}
          </Paragraph>
          <StatusTag color={badgeColor} size="sm">
            {statusLabels[status]}
          </StatusTag>
        </div>
        <Paragraph
          data-size="xs"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-1)' }}
        >
          {description}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-2)' }}
        >
          {time}
        </Paragraph>
      </div>
    </div>
  );
}

// =============================================================================
// ActivityFeed - Container for Activity Items
// =============================================================================

export interface ActivityFeedProps {
  /** Activity items */
  children: React.ReactNode;
  /** Optional title */
  title?: string;
  /** Custom class name */
  className?: string;
}

export function ActivityFeed({
  children,
  title,
  className,
}: ActivityFeedProps): React.ReactElement {
  return (
    <div className={cn('activity-feed', className)}>
      {title && (
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {title}
        </Heading>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// QuickActionCard - Quick action button card
// =============================================================================

export interface QuickActionProps {
  /** Action title */
  title: string;
  /** Action description */
  description?: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  className,
}: QuickActionProps): React.ReactElement {
  return (
    <Card
      className={cn('quick-action-card', className)}
      style={{
        padding: 'var(--ds-spacing-4)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            color: 'var(--ds-color-accent-text-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <div>
          <Paragraph
            data-size="sm"
            style={{ fontWeight: 'var(--ds-font-weight-medium)', margin: 0 }}
          >
            {title}
          </Paragraph>
          {description && (
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
            >
              {description}
            </Paragraph>
          )}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format a date string to a relative time string (Norwegian)
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `For ${diffMins} minutt${diffMins === 1 ? '' : 'er'} siden`;
  if (diffHours < 24) return `For ${diffHours} time${diffHours === 1 ? '' : 'r'} siden`;
  return `For ${diffDays} dag${diffDays === 1 ? '' : 'er'} siden`;
}

/**
 * Map booking status to activity status
 */
export function mapBookingStatusToActivity(status: string): ActivityStatus {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'approved';
    case 'cancelled':
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

export default StatCard;
