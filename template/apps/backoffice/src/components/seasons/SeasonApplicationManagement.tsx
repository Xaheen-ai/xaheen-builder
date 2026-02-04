/**
 * Season Application Management Component
 * Review and process season applications (søknader)
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Table,
  Badge,
  Heading,
  Paragraph,
  Dropdown,
  Spinner,
  Card,
  FilterIcon,
  MoreVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MessageSquareIcon,
} from '@xaheen/ds';
import {
  // TODO: Implement season application management hooks
  // useSeasonApplications,
  // useApproveApplication,
  // useRejectApplication,
  // type SeasonApplication,
  // type ApplicationStatus,
} from '@xaheen/sdk';

// Temporary type definitions and placeholder hooks until implemented in SDK
type ApplicationStatus = 'pending' | 'approved' | 'rejected';
type SeasonApplication = {
  id: string;
  seasonId: string;
  organizationId: string;
  organizationName: string;
  status: ApplicationStatus;
  requestedSlots: number;
  notes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
};

const useSeasonApplications = (_seasonId: string) => ({ data: { data: [] as SeasonApplication[] }, isLoading: false });
const useApproveApplication = () => ({ mutateAsync: async () => {}, isLoading: false });
const useRejectApplication = () => ({ mutateAsync: async () => {}, isLoading: false });

interface SeasonApplicationManagementProps {
  seasonId: string;
  canProcess: boolean; // Only allow in 'closed' status
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Venter',
  approved: 'Godkjent',
  rejected: 'Avslått',
  allocated: 'Tildelt',
};

const statusVariants: Record<ApplicationStatus, 'warning' | 'success' | 'danger' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  allocated: 'info',
};

export function SeasonApplicationManagement({ seasonId, canProcess }: SeasonApplicationManagementProps) {
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [filterVenue, setFilterVenue] = useState<string | 'all'>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedApplication, setSelectedApplication] = useState<SeasonApplication | null>(null);

  // Queries
  const { data: applicationsData, isLoading } = useSeasonApplications(seasonId);
  const applications = applicationsData?.data ?? [];

  // Mutations
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filterStatus !== 'all' && app.status !== filterStatus) return false;
      if (filterVenue !== 'all' && app.listingId !== filterVenue) return false;
      return true;
    });
  }, [applications, filterStatus, filterVenue]);

  // Group by venue for conflict detection
  const applicationsByVenue = useMemo(() => {
    const groups: Record<string, SeasonApplication[]> = {};
    applications.forEach(app => {
      if (!groups[app.listingId]) {
        groups[app.listingId] = [];
      }
      groups[app.listingId].push(app);
    });
    return groups;
  }, [applications]);

  // Get unique venues
  const venues = useMemo(() => {
    const venueMap = new Map<string, string>();
    applications.forEach(app => {
      venueMap.set(app.listingId, app.listingName);
    });
    return Array.from(venueMap.entries());
  }, [applications]);

  // Handlers
  const handleApprove = async (applicationId: string) => {
    if (confirm('Godkjenn denne søknaden?')) {
      await approveMutation.mutateAsync(applicationId);
    }
  };

  const handleReject = async (applicationId: string) => {
    const reason = prompt('Årsak til avslag (valgfritt):');
    await rejectMutation.mutateAsync({ id: applicationId, reason: reason || undefined });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Header with stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Totalt
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {applications.length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Venter
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
            {applications.filter(a => a.status === 'pending').length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Godkjent
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
            {applications.filter(a => a.status === 'approved').length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Avslått
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
            {applications.filter(a => a.status === 'rejected').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button variant="secondary" data-size="sm" type="button">
              <FilterIcon />
              Status: {filterStatus === 'all' ? 'Alle' : statusLabels[filterStatus]}
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item onClick={() => setFilterStatus('all')}>Alle</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterStatus('pending')}>Venter</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterStatus('approved')}>Godkjent</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterStatus('rejected')}>Avslått</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>

        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button variant="secondary" data-size="sm" type="button">
              <FilterIcon />
              Lokale: {filterVenue === 'all' ? 'Alle' : venues.find(v => v[0] === filterVenue)?.[1] || 'Alle'}
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item onClick={() => setFilterVenue('all')}>Alle lokaler</Dropdown.Item>
            {venues.map(([id, name]) => (
              <Dropdown.Item key={id} onClick={() => setFilterVenue(id)}>
                {name}
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div>

      {/* Applications list */}
      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
          <ClockIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen søknader funnet
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {applications.length === 0
              ? 'Ingen søknader er mottatt ennå'
              : 'Ingen søknader matcher valgte filtre'}
          </Paragraph>
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Organisasjon</Table.HeaderCell>
              <Table.HeaderCell>Lokale</Table.HeaderCell>
              <Table.HeaderCell>Ukedag</Table.HeaderCell>
              <Table.HeaderCell>Tid</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Innsendt</Table.HeaderCell>
              {canProcess && <Table.HeaderCell style={{ width: '100px' }}>Handlinger</Table.HeaderCell>}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredApplications.map(application => {
              // Check for conflicts
              const conflicts = applicationsByVenue[application.listingId]?.filter(
                other =>
                  other.id !== application.id &&
                  other.weekday === application.weekday &&
                  other.startTime === application.startTime &&
                  other.status === 'pending'
              ) ?? [];

              return (
                <Table.Row
                  key={application.id}
                  style={{
                    backgroundColor: conflicts.length > 0 ? 'var(--ds-color-warning-surface-subtle)' : undefined,
                  }}
                >
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{application.organizationName}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {application.listingName}
                      {conflicts.length > 0 && (
                        <Badge color="warning" size="sm" style={{ marginLeft: 'var(--ds-spacing-1)' }}>
                          {conflicts.length} konflikt{conflicts.length > 1 ? 'er' : ''}
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][application.weekday]}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {formatTime(application.startTime)} – {formatTime(application.endTime)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusVariants[application.status]}>
                      {statusLabels[application.status]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatDate(application.createdAt)}
                    </div>
                  </Table.Cell>
                  {canProcess && (
                    <Table.Cell>
                      <Dropdown>
                        <Dropdown.Trigger asChild>
                          <Button variant="tertiary" data-size="sm" type="button">
                            <MoreVerticalIcon />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                          <Dropdown.Item onClick={() => setSelectedApplication(application)}>
                            <EyeIcon />
                            Se detaljer
                          </Dropdown.Item>
                          {application.status === 'pending' && (
                            <>
                              <Dropdown.Item onClick={() => handleApprove(application.id)}>
                                <CheckCircleIcon />
                                Godkjenn
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleReject(application.id)} color="danger">
                                <XCircleIcon />
                                Avslå
                              </Dropdown.Item>
                            </>
                          )}
                          <Dropdown.Item onClick={() => {}}>
                            <MessageSquareIcon />
                            Send melding
                          </Dropdown.Item>
                        </Dropdown.Content>
                      </Dropdown>
                    </Table.Cell>
                  )}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
