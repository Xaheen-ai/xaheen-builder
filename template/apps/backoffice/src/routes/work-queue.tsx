/**
 * WorkQueuePage
 *
 * Saksbehandler work queue for pending requests
 * - Filterable queue of pending bookings/season applications
 * - Priority indicators
 * - Quick approve/reject actions
 * - Assignment to self
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Badge,
  Table,
  useDialog,
} from '@xaheen/ds';
import { useT, useLocale } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

// Mock work queue data
const mockQueue = [
  {
    id: 'req-001',
    type: 'booking',
    title: 'Idrettshall A - 2 timer',
    requester: 'Erik Hansen',
    organization: null,
    requestedDate: '2026-01-20',
    createdAt: '2026-01-14T09:00:00Z',
    priority: 'normal',
    status: 'pending',
  },
  {
    id: 'req-002',
    type: 'season-application',
    title: 'Sesongbooking Vår 2026',
    requester: 'Skien IL',
    organization: 'Skien IL',
    requestedDate: '2026-02-01 - 2026-06-30',
    createdAt: '2026-01-10T14:30:00Z',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'req-003',
    type: 'booking',
    title: 'Fotballbane 1 - 4 timer',
    requester: 'Kari Olsen',
    organization: 'Telemark FK',
    requestedDate: '2026-01-25',
    createdAt: '2026-01-13T11:15:00Z',
    priority: 'normal',
    status: 'pending',
  },
];

type Priority = 'low' | 'normal' | 'high' | 'urgent';
type RequestType = 'booking' | 'season-application' | 'change-request';

function PriorityBadge({ priority }: { priority: Priority }) {
  const colors: Record<Priority, { bg: string; text: string }> = {
    urgent: { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' },
    high: { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' },
    normal: { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' },
    low: { bg: 'var(--ds-color-neutral-surface-default)', text: 'var(--ds-color-neutral-text-default)' },
  };
  const color = colors[priority] || colors.normal;
  return <Badge style={{ backgroundColor: color.bg, color: color.text }}>{priority}</Badge>;
}

function TypeBadge({ type }: { type: RequestType }) {
  const t = useT();
  const labels: Record<RequestType, string> = {
    'booking': t('workQueue.booking'),
    'season-application': t('workQueue.seasonApplication'),
    'change-request': t('workQueue.changeRequest'),
  };
  return <Badge>{labels[type] || type}</Badge>;
}

export function WorkQueuePage() {
  const t = useT();
  const { locale } = useLocale();
  const { confirm } = useDialog();
  const [typeFilter, setTypeFilter] = useState<RequestType | undefined>(undefined);
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const queue = typeFilter 
    ? mockQueue.filter(r => r.type === typeFilter)
    : mockQueue;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({
      title: t('workQueue.approveRequest'),
      description: t('workQueue.confirmApprove'),
      confirmText: t('common.approve'),
      cancelText: t('common.cancel'),
      variant: 'default',
    });
    if (confirmed) {
      console.log('Approved:', id);
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = await confirm({
      title: t('workQueue.rejectRequest'),
      description: t('workQueue.confirmReject'),
      confirmText: t('common.reject'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    });
    if (confirmed) {
      console.log('Rejected:', id);
    }
  };

  // Stats
  const stats = {
    total: mockQueue.length,
    bookings: mockQueue.filter(r => r.type === 'booking').length,
    seasonApps: mockQueue.filter(r => r.type === 'season-application').length,
    highPriority: mockQueue.filter(r => r.priority === 'high' || r.priority === 'urgent').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('workQueue.title')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('workQueue.description')}
        </Paragraph>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('workQueue.total')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>
            {stats.total}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('workQueue.bookings')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>
            {stats.bookings}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('workQueue.seasonApps')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>
            {stats.seasonApps}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('workQueue.highPriority')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: stats.highPriority > 0 ? 'var(--ds-color-warning-text-default)' : undefined }}>
            {stats.highPriority}
          </Heading>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        {(['all', 'booking', 'season-application'] as const).map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={(filter === 'all' && !typeFilter) || typeFilter === filter ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setTypeFilter(filter === 'all' ? undefined : filter as RequestType)}
            style={{ minHeight: '44px' }}
          >
            {filter === 'all' ? t('common.all') : t(`workQueue.${filter.replace('-', '')}`)}
          </Button>
        ))}
      </div>

      {/* Queue Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading')} data-size="lg" />
          </div>
        ) : queue.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('workQueue.empty')}
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('workQueue.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('workQueue.request')}</Table.HeaderCell>
                <Table.HeaderCell>{t('workQueue.requester')}</Table.HeaderCell>
                <Table.HeaderCell>{t('workQueue.date')}</Table.HeaderCell>
                <Table.HeaderCell>{t('workQueue.priority')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '180px' }}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {queue.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <TypeBadge type={item.type as RequestType} />
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{item.title}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span>{item.requester}</span>
                      {item.organization && (
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {item.organization}
                        </Paragraph>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{item.requestedDate}</span>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('workQueue.received')}: {formatDate(item.createdAt)}
                    </Paragraph>
                  </Table.Cell>
                  <Table.Cell>
                    <PriorityBadge priority={item.priority as Priority} />
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <Button
                        type="button"
                        variant="primary"
                        data-size="sm"
                        onClick={() => handleApprove(item.id)}
                      >
                        {t('common.approve')}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        data-size="sm"
                        onClick={() => handleReject(item.id)}
                      >
                        {t('common.reject')}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
