import { useState, useMemo } from 'react';
import { Container, Heading, Paragraph, Card, Button, Spinner } from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import { useAccountContext } from '../providers/AccountContextProvider';
import { ApplicationCard } from '../features/seasons/components/ApplicationCard';

// Local type for season application status
type SeasonApplicationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Season Applications Page
 *
 * Displays all season applications submitted by the user.
 * Includes filtering by status and account context awareness.
 */

// Icons
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Filter options
const APPLICATION_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'Alle søknader' },
  { value: 'pending' as SeasonApplicationStatus, label: 'Til behandling' },
  { value: 'approved' as SeasonApplicationStatus, label: 'Godkjent' },
  { value: 'rejected' as SeasonApplicationStatus, label: 'Avslått' },
];

export function SeasonApplicationsPage() {
  const navigate = useNavigate();
  const { accountType, selectedOrganization } = useAccountContext();
  const [statusFilter, setStatusFilter] = useState<SeasonApplicationStatus | 'all'>('all');

  // TODO: Replace with useSeasonApplications() from SDK
  // const { data: applicationsResponse, isLoading, error } = useSeasonApplications(
  //   statusFilter !== 'all' ? { status: statusFilter } : undefined
  // );

  // Mock data for now
  const isLoading = false;
  const error = null;
  const applications: Array<{ status: string; [key: string]: unknown }> = []; // Empty for now

  // Calculate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  return (
    <Container style={{ padding: 'var(--ds-spacing-8)' }}>
      {/* Account Context Banner */}
      {accountType === 'organization' && selectedOrganization && (
        <Card
          style={{
            marginBottom: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            border: '1px solid var(--ds-color-success-border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Viser søknader for: {selectedOrganization.name}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Søknader sendt inn som organisasjon
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Mine søknader
        </Heading>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '800px' }}>
          Oversikt over alle dine sesongbookingsøknader. Se status og detaljer for hver søknad.
        </Paragraph>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-8)',
        }}
      >
        {/* Total Applications */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileTextIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Totalt
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.total}
              </Heading>
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                color: 'var(--ds-color-warning-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ClockIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Til behandling
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.pending}
              </Heading>
            </div>
          </div>
        </Card>

        {/* Approved */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                color: 'var(--ds-color-success-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircleIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Godkjent
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.approved}
              </Heading>
            </div>
          </div>
        </Card>

        {/* Rejected */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                color: 'var(--ds-color-danger-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <XCircleIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Avslått
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.rejected}
              </Heading>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
          marginBottom: 'var(--ds-spacing-6)',
          overflowX: 'auto',
          paddingBottom: 'var(--ds-spacing-2)',
        }}
      >
        {APPLICATION_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={statusFilter === option.value ? 'primary' : 'secondary'}
            data-size="sm"
            onClick={() => setStatusFilter(option.value)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-10)' }}>
          <Spinner aria-label="Laster søknader..." />
        </div>
      ) : error ? (
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
            Kunne ikke laste søknader. Vennligst prøv igjen senere.
          </Paragraph>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {statusFilter === 'all' ? 'Ingen søknader ennå' : 'Ingen søknader funnet'}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
            {statusFilter === 'all'
              ? 'Du har ikke sendt inn noen søknader om sesongbooking ennå.'
              : `Du har ingen søknader med status "${APPLICATION_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label}".`}
          </Paragraph>
          {statusFilter === 'all' && (
            <Button
              type="button"
              variant="primary"
              data-size="sm"
              onClick={() => navigate('/seasons')}
            >
              Utforsk sesonger
            </Button>
          )}
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--ds-spacing-6)',
          }}
        >
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id as string} application={application} />
          ))}
        </div>
      )}
    </Container>
  );
}
