/**
 * NotificationItem Component
 * Reusable component for displaying individual notifications in notification center
 */

import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { StatusTag } from './StatusBadges';

// =============================================================================
// Types
// =============================================================================

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_reminder_24h'
  | 'booking_reminder_1h'
  | 'booking_cancelled'
  | 'booking_modified'
  | 'booking_upcoming'
  | 'booking_completed';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationItemData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  createdAt: string;
  readAt?: string | null;
  relatedBookingId?: string;
  relatedListingId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationItemProps {
  /** Notification data */
  notification: NotificationItemData;
  /** Click handler for the notification */
  onClick?: (id: string) => void;
  /** Click handler for mark as read */
  onMarkAsRead?: (id: string) => void;
  /** Click handler for delete */
  onDelete?: (id: string) => void;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Custom time formatting function */
  formatTimeAgo?: (date: string) => string;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Icons (inline SVG)
// =============================================================================

function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function XCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function EditIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TrashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// =============================================================================
// Notification Type Configuration
// =============================================================================

interface NotificationTypeConfig {
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
  label: string;
}

const notificationTypeConfig: Record<NotificationType, NotificationTypeConfig> = {
  booking_confirmed: {
    icon: <CheckCircleIcon />,
    color: 'var(--ds-color-success-text-default)',
    backgroundColor: 'var(--ds-color-success-surface-default)',
    label: 'Bekreftet',
  },
  booking_reminder_24h: {
    icon: <BellIcon />,
    color: 'var(--ds-color-warning-text-default)',
    backgroundColor: 'var(--ds-color-warning-surface-default)',
    label: 'Påminnelse',
  },
  booking_reminder_1h: {
    icon: <BellIcon />,
    color: 'var(--ds-color-warning-text-default)',
    backgroundColor: 'var(--ds-color-warning-surface-default)',
    label: 'Påminnelse',
  },
  booking_cancelled: {
    icon: <XCircleIcon />,
    color: 'var(--ds-color-danger-text-default)',
    backgroundColor: 'var(--ds-color-danger-surface-default)',
    label: 'Kansellert',
  },
  booking_modified: {
    icon: <EditIcon />,
    color: 'var(--ds-color-info-text-default)',
    backgroundColor: 'var(--ds-color-info-surface-default)',
    label: 'Endret',
  },
  booking_upcoming: {
    icon: <CalendarIcon />,
    color: 'var(--ds-color-accent-text-default)',
    backgroundColor: 'var(--ds-color-accent-surface-default)',
    label: 'Kommende',
  },
  booking_completed: {
    icon: <CheckCircleIcon />,
    color: 'var(--ds-color-neutral-text-subtle)',
    backgroundColor: 'var(--ds-color-neutral-surface-default)',
    label: 'Fullført',
  },
};

/**
 * Default configuration for unknown notification types
 */
const defaultNotificationConfig: NotificationTypeConfig = {
  icon: <BellIcon />,
  color: 'var(--ds-color-neutral-text-default)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  label: 'Varsel',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Default time formatting function
 */
function defaultFormatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Akkurat nå';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min siden`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} timer siden`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} dager siden`;

  return then.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: now.getFullYear() !== then.getFullYear() ? 'numeric' : undefined
  });
}

// =============================================================================
// NotificationItem Component
// =============================================================================

/**
 * Displays a single notification item with icon, content, and actions
 */
export function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  showActions = true,
  formatTimeAgo = defaultFormatTimeAgo,
  className = '',
}: NotificationItemProps): React.ReactElement {
  const isUnread = !notification.readAt;
  const config = notificationTypeConfig[notification.type] || defaultNotificationConfig;

  const handleClick = () => {
    onClick?.(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: isUnread
          ? 'var(--ds-color-accent-surface-default)'
          : 'transparent',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
        position: 'relative',
      }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--ds-spacing-4)',
            left: 'var(--ds-spacing-2)',
            width: '8px',
            height: '8px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-accent-base-default)',
          }}
          aria-label="Ulest varsel"
        />
      )}

      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: config.backgroundColor,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isUnread ? 'var(--ds-spacing-2)' : '0',
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header with type tag and time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-1)',
            flexWrap: 'wrap',
          }}
        >
          <StatusTag size="sm" color="neutral">
            {config.label}
          </StatusTag>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {formatTimeAgo(notification.createdAt)}
          </span>
          {notification.priority === 'urgent' && (
            <StatusTag size="sm" color="danger">
              Viktig
            </StatusTag>
          )}
          {notification.priority === 'high' && (
            <StatusTag size="sm" color="warning">
              Høy
            </StatusTag>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: isUnread ? 600 : 500,
            color: 'var(--ds-color-neutral-text-default)',
            marginBottom: 'var(--ds-spacing-1)',
            lineHeight: 1.4,
          }}
        >
          {notification.title}
        </div>

        {/* Message */}
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}
        >
          {notification.message}
        </Paragraph>
      </div>

      {/* Actions */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-1)',
            flexShrink: 0,
          }}
        >
          {isUnread && onMarkAsRead && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              title="Marker som lest"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--ds-border-radius-md)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--ds-color-neutral-text-subtle)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-default)';
                e.currentTarget.style.color = 'var(--ds-color-accent-text-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)';
              }}
              aria-label="Marker som lest"
            >
              <CheckIcon />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              title="Slett varsel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--ds-border-radius-md)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--ds-color-neutral-text-subtle)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-danger-surface-default)';
                e.currentTarget.style.color = 'var(--ds-color-danger-text-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)';
              }}
              aria-label="Slett varsel"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
