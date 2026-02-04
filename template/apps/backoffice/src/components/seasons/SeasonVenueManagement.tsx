/**
 * Season Venue Management Component
 * Manage venues (listings) linked to a season
 */

import { useState } from 'react';
import {
  Button,
  Stack,
  Table,
  Badge,
  Heading,
  Paragraph,
  Dropdown,
  Spinner,
  PlusIcon,
  TrashIcon,
  BuildingIcon,
  MoreVerticalIcon,
  CheckIcon,
} from '@xaheen/ds';
import {
  useListings,
  // TODO: Implement season venue management hooks
  // useSeasonVenues,
  // useAddVenueToSeason,
  // useRemoveVenueFromSeason,
  // type Listing,
} from '@xaheen/sdk';

// Temporary placeholder hooks until implemented in SDK
const useSeasonVenues = (_seasonId: string) => ({ data: { data: [] }, isLoading: false });
const useAddVenueToSeason = () => ({ mutateAsync: async () => {}, isLoading: false });
const useRemoveVenueFromSeason = () => ({ mutateAsync: async () => {}, isLoading: false });

interface SeasonVenueManagementProps {
  seasonId: string;
  canEdit: boolean; // Only allow editing in draft/open status
}

export function SeasonVenueManagement({ seasonId, canEdit }: SeasonVenueManagementProps) {
  const [isAddingVenue, setIsAddingVenue] = useState(false);

  // Queries
  const { data: allListingsData, isLoading: isLoadingAll } = useListings({
    status: 'published',
    limit: 100,
  });
  const allVenues = allListingsData?.data ?? [];

  const { data: seasonVenuesData, isLoading: isLoadingSeasonVenues } = useSeasonVenues(seasonId);
  const seasonVenues = seasonVenuesData?.data ?? [];

  // Mutations
  const addVenueMutation = useAddVenueToSeason();
  const removeVenueMutation = useRemoveVenueFromSeason();

  // Available venues (not already added)
  const availableVenues = allVenues.filter(
    venue => !seasonVenues.some(sv => sv.id === venue.id)
  );

  // Handlers
  const handleAddVenue = async (listingId: string) => {
    await addVenueMutation.mutateAsync({ seasonId, listingId });
    setIsAddingVenue(false);
  };

  const handleRemoveVenue = async (listingId: string) => {
    if (confirm('Er du sikker på at du vil fjerne dette lokalet fra sesongen?')) {
      await removeVenueMutation.mutateAsync({ seasonId, listingId });
    }
  };

  if (isLoadingAll || isLoadingSeasonVenues) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={3} data-size="sm">
            Tilknyttede lokaler
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
            {seasonVenues.length} lokaler kan søkes på i denne sesongen
          </Paragraph>
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddingVenue(true)} size="sm" disabled={availableVenues.length === 0} type="button">
            <PlusIcon />
            Legg til lokale
          </Button>
        )}
      </div>

      {/* Add venue modal/dropdown */}
      {isAddingVenue && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-info-border-default)',
          }}
        >
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Velg lokale å legge til
          </Heading>
          <Stack spacing={2}>
            {availableVenues.map(venue => (
              <div
                key={venue.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{venue.name}</div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {venue.type}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddVenue(venue.id)}
                  disabled={addVenueMutation.isPending} type="button"
                >
                  <CheckIcon />
                  Legg til
                </Button>
              </div>
            ))}
            {availableVenues.length === 0 && (
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center' }}>
                Alle tilgjengelige lokaler er allerede lagt til
              </Paragraph>
            )}
          </Stack>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--ds-spacing-3)' }}>
            <Button variant="secondary" data-size="sm" onClick={() => setIsAddingVenue(false)} type="button">
              Lukk
            </Button>
          </div>
        </div>
      )}

      {/* Venues list */}
      {seasonVenues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
          <BuildingIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen lokaler lagt til
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Legg til lokaler som skal inngå i sesongleien
          </Paragraph>
          {canEdit && availableVenues.length > 0 && (
            <Button data-size="sm" onClick={() => setIsAddingVenue(true)} style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
              <PlusIcon />
              Legg til ditt første lokale
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Kapasitet</Table.HeaderCell>
              <Table.HeaderCell>Adresse</Table.HeaderCell>
              {canEdit && <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {seasonVenues.map(venue => (
              <Table.Row key={venue.id}>
                <Table.Cell>
                  <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{venue.name}</div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="info">{venue.type}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                    {venue.capacity ? `${venue.capacity} personer` : '—'}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {venue.address || '—'}
                  </div>
                </Table.Cell>
                {canEdit && (
                  <Table.Cell>
                    <Dropdown>
                      <Dropdown.Trigger asChild>
                        <Button variant="tertiary" data-size="sm" type="button">
                          <MoreVerticalIcon />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.Content>
                        <Dropdown.Item onClick={() => handleRemoveVenue(venue.id)} color="danger">
                          <TrashIcon />
                          Fjern
                        </Dropdown.Item>
                      </Dropdown.Content>
                    </Dropdown>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
