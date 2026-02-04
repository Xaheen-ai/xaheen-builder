/**
 * Season Allocation Management Component
 * Manual allocation of approved applications and recurring booking generation
 * This is the core of the seasonal lease (sesongleie) system
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Stack,
  Table,
  Badge,
  Heading,
  Paragraph,
  Card,
  Spinner,
  Alert,
  CheckIcon,
  CalendarIcon,
  BuildingIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@xaheen/ds';
import {
  useSeasonApplications,
  useAllocateApplication,
  useFinalizeSeasonAllocations,
  type SeasonApplication,
} from '@xaheen/sdk';

interface SeasonAllocationManagementProps {
  seasonId: string;
  seasonStartDate: string;
  seasonEndDate: string;
  onAllocationComplete: () => void;
}

export function SeasonAllocationManagement({
  seasonId,
  seasonStartDate,
  seasonEndDate,
  onAllocationComplete,
}: SeasonAllocationManagementProps) {
  const [allocating, setAllocating] = useState<Record<string, boolean>>({});

  // Queries
  const { data: applicationsData, isLoading } = useSeasonApplications(seasonId);
  const applications = applicationsData?.data ?? [];

  // Mutations
  const allocateMutation = useAllocateApplication();
  const finalizeMutation = useFinalizeSeasonAllocations();

  // Filter approved applications
  const approvedApplications = useMemo(() => {
    return applications.filter(app => app.status === 'approved');
  }, [applications]);

  // Filter allocated applications
  const allocatedApplications = useMemo(() => {
    return applications.filter(app => app.status === 'allocated');
  }, [applications]);

  // Group by venue
  const applicationsByVenue = useMemo(() => {
    const groups: Record<string, SeasonApplication[]> = {};
    approvedApplications.forEach(app => {
      if (!groups[app.listingId]) {
        groups[app.listingId] = [];
      }
      groups[app.listingId].push(app);
    });
    // Sort by weekday then time
    Object.keys(groups).forEach(venueId => {
      groups[venueId].sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return a.startTime.localeCompare(b.startTime);
      });
    });
    return groups;
  }, [approvedApplications]);

  // Check if all approved are allocated
  const allAllocated = approvedApplications.length > 0 && allocatedApplications.length === approvedApplications.length;

  // Handlers
  const handleAllocate = async (applicationId: string) => {
    setAllocating(prev => ({ ...prev, [applicationId]: true }));
    try {
      await allocateMutation.mutateAsync({
        applicationId,
        generateRecurring: true, // Generate weekly recurring bookings
      });
    } finally {
      setAllocating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleAllocateAll = async () => {
    if (confirm(`Tildel alle ${approvedApplications.length} godkjente søknader og generer bookinger?`)) {
      for (const app of approvedApplications) {
        await handleAllocate(app.id);
      }
    }
  };

  const handleFinalize = async () => {
    if (confirm('Fullfør sesongtildelingen? Sesongen vil bli markert som "Tildelt" og kan ikke endres.')) {
      await finalizeMutation.mutateAsync(seasonId);
      onAllocationComplete();
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const calculateBookingCount = (_application: SeasonApplication) => {
    const start = new Date(seasonStartDate);
    const end = new Date(seasonEndDate);
    const weeks = Math.floor((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return weeks;
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
      {/* Header with instructions */}
      <Alert severity="info">
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Manuell tildeling
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          Tildel godkjente søknader manuelt. Systemet genererer automatisk ukentlige repeterende bookinger for hele sesongen.
          Når alle søknader er tildelt, fullfør tildelingen for å låse sesongen.
        </Paragraph>
      </Alert>

      {/* Progress stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Godkjente søknader
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {approvedApplications.length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Tildelt
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
            {allocatedApplications.length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Gjenstår
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
            {approvedApplications.length - allocatedApplications.length}
          </div>
        </Card>
      </div>

      {/* Action buttons */}
      {approvedApplications.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end' }}>
          {!allAllocated && (
            <Button onClick={handleAllocateAll} disabled={allocateMutation.isPending} type="button">
              <PlayIcon />
              Tildel alle ({approvedApplications.length})
            </Button>
          )}
          {allAllocated && (
            <Button variant="primary" onClick={handleFinalize} disabled={finalizeMutation.isPending} type="button">
              <CheckCircleIcon />
              Fullfør tildeling
            </Button>
          )}
        </div>
      )}

      {/* Applications by venue */}
      {Object.keys(applicationsByVenue).length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
          <CalendarIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen godkjente søknader
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Godkjenn søknader i "Søknader"-fanen før du kan tildele
          </Paragraph>
        </div>
      ) : (
        <Stack spacing={4}>
          {Object.entries(applicationsByVenue).map(([venueId, apps]) => (
            <Card key={venueId}>
              <div style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <BuildingIcon />
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    {apps[0].listingName}
                  </Heading>
                </div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  {apps.length} søknad{apps.length > 1 ? 'er' : ''}
                </Paragraph>
              </div>

              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Organisasjon</Table.HeaderCell>
                    <Table.HeaderCell>Ukedag</Table.HeaderCell>
                    <Table.HeaderCell>Tid</Table.HeaderCell>
                    <Table.HeaderCell>Bookinger</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: '120px' }}>Handling</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {apps.map(application => {
                    const bookingCount = calculateBookingCount(application);
                    const isAllocated = application.status === 'allocated';

                    return (
                      <Table.Row key={application.id}>
                        <Table.Cell>
                          <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{application.organizationName}</div>
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
                          <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                            {bookingCount} ukentlige bookinger
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          {isAllocated ? (
                            <Badge color="success">
                              <CheckIcon /> Tildelt
                            </Badge>
                          ) : (
                            <Badge color="warning">Venter</Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {!isAllocated && (
                            <Button
                              size="sm"
                              onClick={() => handleAllocate(application.id)}
                              disabled={allocating[application.id] || allocateMutation.isPending} type="button"
                            >
                              {allocating[application.id] ? (
                                <>
                                  <Spinner data-size="sm" aria-label="Laster..." /> Tildeler...
                                </>
                              ) : (
                                <>
                                  <CheckIcon /> Tildel
                                </>
                              )}
                            </Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </Card>
          ))}
        </Stack>
      )}

      {/* Success message */}
      {allAllocated && (
        <Alert severity="success">
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Alle søknader er tildelt!
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {allocatedApplications.length} søknader har fått tildelt ukentlige bookinger.
            Klikk "Fullfør tildeling" for å låse sesongen og gjøre bookingene synlige i kalenderen.
          </Paragraph>
        </Alert>
      )}
    </div>
  );
}
