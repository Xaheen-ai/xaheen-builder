/**
 * Season Detail Page
 * Full-page view for managing a seasonal lease season with applications and allocation
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Tabs,
  EditIcon,
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  CalendarIcon,
  BuildingIcon,
  FileTextIcon,
  ClipboardListIcon,
  PlayIcon,
  LockIcon,
  UnlockIcon,
} from '@xaheen/ds';
import {
  useSeasonalLease,
  useDeleteSeasonalLease,
  type SeasonalLeaseStatus,
} from '@xaheen/sdk';
import { FormSection } from '../../components/shared';
import { SeasonVenueManagement } from '../../components/seasons/SeasonVenueManagement';
import { SeasonApplicationManagement } from '../../components/seasons/SeasonApplicationManagement';
import { SeasonAllocationManagement } from '../../components/seasons/SeasonAllocationManagement';

// Temporary placeholder hooks until implemented in SDK
const useSeasonVenues = (_seasonId: string) => ({ data: { data: [] }, isLoading: false });
const useSeasonApplications = (_seasonId: string) => ({ data: { data: [] }, isLoading: false });
const useUpdateSeasonalLeaseStatus = () => ({ mutateAsync: async () => {}, isLoading: false });

const statusLabels: Record<SeasonalLeaseStatus, string> = {
  draft: 'Utkast',
  open: 'Åpen',
  closed: 'Lukket',
  assigned: 'Tildelt',
};

const statusVariants: Record<SeasonalLeaseStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  draft: 'neutral',
  open: 'info',
  closed: 'warning',
  assigned: 'success',
};

export function SeasonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  // Queries
  const { data: seasonData, isLoading } = useSeasonalLease(id!);
  const season = seasonData?.data;

  const { data: venuesData } = useSeasonVenues(id!);
  const venues = venuesData?.data ?? [];

  const { data: applicationsData } = useSeasonApplications(id!);
  const applications = applicationsData?.data ?? [];

  // Mutations
  const deleteSeasonMutation = useDeleteSeasonalLease();
  const updateStatusMutation = useUpdateSeasonalLeaseStatus();

  // Handlers
  const handleDelete = async () => {
    if (confirm('Er du sikker på at du vil slette denne sesongen?')) {
      await deleteSeasonMutation.mutateAsync(id!);
      navigate('/seasons');
    }
  };

  const handleOpenSeason = async () => {
    if (venues.length === 0) {
      alert('Du må legge til minst ett lokale før sesongen kan åpnes.');
      return;
    }
    if (confirm('Er du sikker på at du vil åpne sesongen for søknader?')) {
      await updateStatusMutation.mutateAsync({ id: id!, status: 'open' });
    }
  };

  const handleCloseSeason = async () => {
    if (confirm('Er du sikker på at du vil lukke sesongen? Ingen flere søknader vil bli akseptert.')) {
      await updateStatusMutation.mutateAsync({ id: id!, status: 'closed' });
      setActiveTab('applications');
    }
  };

  const handleStartAllocation = () => {
    setActiveTab('allocation');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  if (!season) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">Sesong ikke funnet</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Sesongen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/seasons">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/seasons">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={2} data-size="lg">
              {season.name}
            </Heading>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)', alignItems: 'center' }}>
              <Badge color={statusVariants[season.status]}>
                {statusLabels[season.status]}
              </Badge>
              <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {formatDate(season.startDate)} – {formatDate(season.endDate)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            {/* Status-specific actions */}
            {season.status === 'draft' && (
              <>
                <Link to={`/seasons/${id}/edit`}>
                  <Button variant="secondary" data-size="sm" type="button">
                    <EditIcon />
                    Rediger
                  </Button>
                </Link>
                <Button variant="primary" data-size="sm" onClick={handleOpenSeason} type="button">
                  <UnlockIcon />
                  Åpne sesong
                </Button>
                <Button variant="danger" data-size="sm" onClick={handleDelete} type="button">
                  <TrashIcon />
                  Slett
                </Button>
              </>
            )}

            {season.status === 'open' && (
              <>
                <Link to={`/seasons/${id}/edit`}>
                  <Button variant="secondary" data-size="sm" type="button">
                    <EditIcon />
                    Rediger
                  </Button>
                </Link>
                <Button variant="warning" data-size="sm" onClick={handleCloseSeason} type="button">
                  <LockIcon />
                  Lukk sesong
                </Button>
              </>
            )}

            {season.status === 'closed' && (
              <Button variant="primary" data-size="sm" onClick={handleStartAllocation} type="button">
                <PlayIcon />
                Start tildeling
              </Button>
            )}

            {season.status === 'assigned' && (
              <Link to={`/seasons/${id}/edit`}>
                <Button variant="secondary" data-size="sm" type="button">
                  <EditIcon />
                  Se detaljer
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status info banner */}
      {season.status === 'open' && (
        <Card style={{ backgroundColor: 'var(--ds-color-info-surface-subtle)', border: '1px solid var(--ds-color-info-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <UnlockIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-info-text-default)' }} />
            <div>
              <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                Sesongen er åpen for søknader
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Søknadsfrist: {formatDate(season.applicationDeadline)} • {applications.length} søknader mottatt
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {season.status === 'closed' && (
        <Card style={{ backgroundColor: 'var(--ds-color-warning-surface-subtle)', border: '1px solid var(--ds-color-warning-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <LockIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-warning-text-default)' }} />
            <div>
              <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                Sesongen er lukket for søknader
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {applications.length} søknader venter på tildeling
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {season.status === 'assigned' && (
        <Card style={{ backgroundColor: 'var(--ds-color-success-surface-subtle)', border: '1px solid var(--ds-color-success-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <CheckCircleIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-success-text-default)' }} />
            <div>
              <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                Sesongen er tildelt
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Alle søknader er behandlet og bookinger er opprettet
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="info">
            <FileTextIcon />
            Informasjon
          </Tabs.Trigger>
          <Tabs.Trigger value="venues">
            <BuildingIcon />
            Lokaler ({venues.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="applications">
            <ClipboardListIcon />
            Søknader ({applications.length})
          </Tabs.Trigger>
          {(season.status === 'closed' || season.status === 'assigned') && (
            <Tabs.Trigger value="allocation">
              <CalendarIcon />
              Tildeling
            </Tabs.Trigger>
          )}
        </Tabs.List>

        {/* Info Tab */}
        <Tabs.Panel value="info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Card>
              <FormSection title="Sesongdetaljer">
                <Stack spacing={3}>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Navn
                    </div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{season.name}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Periode
                    </div>
                    <div>{formatDate(season.startDate)} – {formatDate(season.endDate)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Søknadsfrist
                    </div>
                    <div>{formatDate(season.applicationDeadline)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Status
                    </div>
                    <Badge color={statusVariants[season.status]}>
                      {statusLabels[season.status]}
                    </Badge>
                  </div>
                </Stack>
              </FormSection>
            </Card>

            <Card>
              <FormSection title="Beskrivelse og retningslinjer">
                {season.description ? (
                  <Paragraph data-size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {season.description}
                  </Paragraph>
                ) : (
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Ingen beskrivelse lagt til
                  </Paragraph>
                )}
              </FormSection>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Venues Tab */}
        <Tabs.Panel value="venues">
          <Card>
            <SeasonVenueManagement
              seasonId={id!}
              canEdit={season.status === 'draft' || season.status === 'open'}
            />
          </Card>
        </Tabs.Panel>

        {/* Applications Tab */}
        <Tabs.Panel value="applications">
          <Card>
            <SeasonApplicationManagement
              seasonId={id!}
              canProcess={season.status === 'closed'}
            />
          </Card>
        </Tabs.Panel>

        {/* Allocation Tab */}
        {(season.status === 'closed' || season.status === 'assigned') && (
          <Tabs.Panel value="allocation">
            <Card>
              <SeasonAllocationManagement
                seasonId={id!}
                seasonStartDate={season.startDate}
                seasonEndDate={season.endDate}
                onAllocationComplete={() => navigate(`/seasons/${id}`)}
              />
            </Card>
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  );
}
