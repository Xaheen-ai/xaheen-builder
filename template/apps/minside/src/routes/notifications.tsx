/**
 * NotificationsPage
 *
 * User portal notifications center
 * - All notifications list
 * - Mark as read/unread
 * - Filter by type
 * - Clear notifications
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Badge,
  Spinner,
} from '@xaheen/ds';
import { useT, useLocale } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

type NotificationType = 'booking' | 'system' | 'message' | 'reminder';

// Mock notifications
const mockNotifications = [
  {
    id: 'notif-001',
    type: 'booking' as NotificationType,
    title: 'Booking bekreftet',
    message: 'Din booking for Idrettshall A er bekreftet for 22. januar 18:00.',
    read: false,
    createdAt: '2026-01-14T15:00:00Z',
  },
  {
    id: 'notif-002',
    type: 'reminder' as NotificationType,
    title: 'Påminnelse',
    message: 'Du har en booking i morgen klokken 18:00.',
    read: false,
    createdAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'notif-003',
    type: 'message' as NotificationType,
    title: 'Ny melding',
    message: 'Du har mottatt svar på din henvendelse.',
    read: true,
    createdAt: '2026-01-13T14:30:00Z',
  },
  {
    id: 'notif-004',
    type: 'system' as NotificationType,
    title: 'Vedlikehold',
    message: 'Planlagt vedlikehold søndag 26. januar 02:00-04:00.',
    read: true,
    createdAt: '2026-01-12T09:00:00Z',
  },
];

export function NotificationsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return locale === 'en' ? 'Just now' : 'Akkurat nå';
    if (diffHours < 24) return locale === 'en' ? `${diffHours}h ago` : `${diffHours}t siden`;
    if (diffDays < 7) return locale === 'en' ? `${diffDays}d ago` : `${diffDays}d siden`;
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'booking': return 'Booking';
      case 'system': return 'System';
      case 'message': return 'Melding';
      case 'reminder': return 'Påminnelse';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'booking': return { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' };
      case 'system': return { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' };
      case 'message': return { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' };
      case 'reminder': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('notifications.title')}
          </Heading>
          {unreadCount > 0 && (
            <Badge style={{ backgroundColor: 'var(--ds-color-danger-surface-default)', color: 'var(--ds-color-danger-text-default)' }}>
              {unreadCount} ulest
            </Badge>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
            style={{ minWidth: '120px' }}
          >
            <option value="all">Alle</option>
            <option value="booking">Bookinger</option>
            <option value="message">Meldinger</option>
            <option value="reminder">Påminnelser</option>
            <option value="system">System</option>
          </Select>
          <Button type="button" variant="secondary" data-size="md" onClick={markAllAsRead} disabled={unreadCount === 0} style={{ minHeight: '44px' }}>
            Merk alle lest
          </Button>
          <Button type="button" variant="tertiary" data-size="md" onClick={clearAll} disabled={notifications.length === 0} style={{ minHeight: '44px' }}>
            Tøm
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading')} data-size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('notifications.empty')}
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {filteredNotifications.map((notif) => {
              const color = getTypeColor(notif.type);
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    display: 'flex',
                    gap: 'var(--ds-spacing-4)',
                    padding: 'var(--ds-spacing-4)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: notif.read ? 'var(--ds-color-neutral-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
                    border: notif.read ? '1px solid var(--ds-color-neutral-border-subtle)' : '2px solid var(--ds-color-accent-border-default)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{
                    width: '8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: notif.read ? 'transparent' : 'var(--ds-color-accent-base-default)',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: notif.read ? 500 : 700 }}>
                        {notif.title}
                      </Paragraph>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                        <Badge style={{ backgroundColor: color.bg, color: color.text }}>
                          {getTypeLabel(notif.type)}
                        </Badge>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {formatRelativeTime(notif.createdAt)}
                        </Paragraph>
                      </div>
                    </div>
                    <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {notif.message}
                    </Paragraph>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
