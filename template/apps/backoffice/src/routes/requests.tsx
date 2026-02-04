/**
 * Requests Inbox Page - Queue-style interface for booking requests
 * Enhanced with detail drawer, messaging, priority, and assignment
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Table,
  Dropdown,
  Spinner,
  Badge,
  // Stack,
  // Alert,
  CheckCircleIcon,
  XCircleIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ClockIcon,
  AlertTriangleIcon,
  UserIcon,
  FilterIcon,
  HeaderSearch,
  useDialog,
} from '@xaheen/ds';
import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  formatTime,
  formatDate,
  // formatDateTime,
  type Booking,
  // type BookingStatus,
} from '@xaheen/sdk';

type RequestFilter = 'all' | 'pending' | 'needs_info' | 'urgent';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

const priorityColors: Record<Priority, 'success' | 'info' | 'warning' | 'danger'> = {
  low: 'success',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Lav',
  normal: 'Normal',
  high: 'Høy',
  urgent: 'Haster',
};

function calculatePriority(booking: Booking): Priority {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Urgent if starts within 24 hours
  if (hoursUntilStart < 24) return 'urgent';
  // High if starts within 3 days
  if (hoursUntilStart < 72) return 'high';
  // Low if starts more than 14 days away
  if (hoursUntilStart > 14 * 24) return 'low';

  return 'normal';
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Akkurat nå';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min siden`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} timer siden`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} dager siden`;

  return formatDate(date);
}

export function RequestsPage() {
  const navigate = useNavigate();

  // State
  const [filter, setFilter] = useState<RequestFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: pendingData, isLoading} = useBookings({
    status: 'pending',
  });
  const pendingBookings = pendingData?.data ?? [];

  // Mutations
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const { confirm } = useDialog();

  // Calculate stats and priorities
  const requestsWithPriority = useMemo(() => {
    return pendingBookings.map(booking => ({
      ...booking,
      priority: calculatePriority(booking),
    }));
  }, [pendingBookings]);

  // Filter logic
  const filteredRequests = useMemo(() => {
    let filtered = requestsWithPriority;

    // Apply status filter
    if (filter === 'needs_info') {
      filtered = filtered.filter(r => r.needsInfo);
    } else if (filter === 'urgent') {
      filtered = filtered.filter(r => r.priority === 'urgent' || r.priority === 'high');
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.userName?.toLowerCase().includes(query) ||
        r.organizationName?.toLowerCase().includes(query) ||
        r.listingName?.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    // Sort by priority (urgent first) then by creation date
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [requestsWithPriority, filter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const pending = requestsWithPriority.filter(r => !r.needsInfo).length;
    const needsInfo = requestsWithPriority.filter(r => r.needsInfo).length;
    const urgent = requestsWithPriority.filter(r => r.priority === 'urgent' || r.priority === 'high').length;

    return { pending, needsInfo, urgent };
  }, [requestsWithPriority]);

  // Handlers
  const handleViewDetail = (booking: Booking) => {
    navigate(`/bookings/${booking.id}`);
  };

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({
      title: 'Godkjenn forespørsel',
      description: 'Er du sikker på at du vil godkjenne denne forespørselen?',
      confirmText: 'Godkjenn',
      cancelText: 'Avbryt',
      variant: 'primary',
    });
    if (confirmed) {
      await confirmBooking.mutateAsync(id);
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Avslå forespørsel',
      description: 'Er du sikker på at du vil avslå denne forespørselen?',
      confirmText: 'Avslå',
      cancelText: 'Avbryt',
      variant: 'danger',
    });
    if (confirmed) {
      await cancelBooking.mutateAsync({ id });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Forespørsler
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Behandle innkommende bookingforespørsler i prioritert rekkefølge
          </Paragraph>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
        <Card
          style={{
            padding: 'var(--ds-spacing-4)',
            cursor: 'pointer',
            border: filter === 'all' || filter === 'pending' ? '2px solid var(--ds-color-accent-border-default)' : undefined,
          }}
          onClick={() => setFilter('all')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-warning-text-default)',
                fontSize: 'var(--ds-font-size-xl)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {stats.pending}
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Ventende
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Krever behandling
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card
          style={{
            padding: 'var(--ds-spacing-4)',
            cursor: 'pointer',
            border: filter === 'needs_info' ? '2px solid var(--ds-color-accent-border-default)' : undefined,
          }}
          onClick={() => setFilter('needs_info')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-info-text-default)',
                fontSize: 'var(--ds-font-size-xl)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {stats.needsInfo}
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Trenger info
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Venter på svar
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card
          style={{
            padding: 'var(--ds-spacing-4)',
            cursor: 'pointer',
            border: filter === 'urgent' ? '2px solid var(--ds-color-accent-border-default)' : undefined,
          }}
          onClick={() => setFilter('urgent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-danger-text-default)',
                fontSize: 'var(--ds-font-size-xl)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {stats.urgent}
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Haster
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Høy prioritet
              </Paragraph>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter søker, organisasjon, lokale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <Button variant="secondary" data-size="sm" onClick={() => setFilter('all')} type="button">
            <FilterIcon />
            {filter === 'all' ? 'Alle' : filter === 'needs_info' ? 'Trenger info' : filter === 'urgent' ? 'Haster' : 'Ventende'}
          </Button>
        </div>
      </Card>

      {/* Requests Queue */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label="Laster..." />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <MessageSquareIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen forespørsler
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || filter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Ingen ventende forespørsler å behandle'}
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell style={{ width: '80px' }}>Prioritet</Table.HeaderCell>
                <Table.HeaderCell>Søker</Table.HeaderCell>
                <Table.HeaderCell>Lokale</Table.HeaderCell>
                <Table.HeaderCell>Tidsrom</Table.HeaderCell>
                <Table.HeaderCell>Opprettet</Table.HeaderCell>
                <Table.HeaderCell>Tildelt</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '160px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredRequests.map((request) => (
                <Table.Row
                  key={request.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetail(request)}
                >
                  <Table.Cell>
                    <Badge color={priorityColors[request.priority]}>
                      {request.priority === 'urgent' && <AlertTriangleIcon />}
                      {request.priority === 'high' && <ClockIcon />}
                      {priorityLabels[request.priority]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {request.userName || 'Ukjent'}
                      </div>
                      {request.organizationName && (
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {request.organizationName}
                        </Paragraph>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {request.listingName || request.listingId}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                        {formatDate(request.startTime)}
                      </div>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontFamily: 'var(--ds-font-family-monospace)' }}>
                        {formatTime(request.startTime)} - {formatTime(request.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatTimeAgo(request.createdAt)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {request.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                        <UserIcon style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                        <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                          {request.assignedToName || 'Tildelt'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>–</span>
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <Button
                        variant="primary"
                       
                        onClick={() => handleApprove(request.id)}
                        title="Godkjenn" type="button"
                      >
                        <CheckCircleIcon />
                      </Button>
                      <Button
                        variant="secondary"
                       
                        onClick={() => handleReject(request.id)}
                        title="Avslå" type="button"
                      >
                        <XCircleIcon />
                      </Button>
                      <Dropdown>
                        <Dropdown.Trigger asChild>
                          <Button variant="tertiary" data-size="sm" aria-label="Flere valg" type="button">
                            <MoreVerticalIcon />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                          <Dropdown.Item onClick={() => handleViewDetail(request)}>
                            Se detaljer
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => {
                            setSelectedRequestId(request.id);
                            handleRequestMoreInfo();
                          }}>
                            <MessageSquareIcon />
                            Be om mer info
                          </Dropdown.Item>
                        </Dropdown.Content>
                      </Dropdown>
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
