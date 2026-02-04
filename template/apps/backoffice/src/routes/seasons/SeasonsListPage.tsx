/**
 * Seasons List Page
 * Admin view for managing seasonal lease seasons
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
  PlusIcon,
  MoreVerticalIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  HeaderSearch,
} from '@xaheen/ds';
import {
  useSeasonalLeases,
  useDeleteSeasonalLease,
  // type SeasonalLease,
  type SeasonalLeaseStatus,
} from '@xaheen/sdk';
// import { StatusBadge } from '../../components/shared';

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

export function SeasonsListPage() {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SeasonalLeaseStatus | 'all'>('all');

  // Queries
  const { data: seasonsData, isLoading } = useSeasonalLeases({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const seasons = seasonsData?.data ?? [];

  // Mutations
  const deleteSeasonMutation = useDeleteSeasonalLease();

  // Filtered seasons
  const filteredSeasons = seasons.filter(season => {
    if (!searchQuery) return true;
    return season.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handlers
  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne sesongen?')) {
      await deleteSeasonMutation.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Sesongleie
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer sesonger, søknader og tildelinger
          </Paragraph>
        </div>
        <Link to="/seasons/new">
          <Button type="button">
            <PlusIcon />
            Ny sesong
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter sesong..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              Status: {statusFilter === 'all' ? 'Alle' : statusLabels[statusFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('draft')}>Utkast</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('open')}>Åpen</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('closed')}>Lukket</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('assigned')}>Tildelt</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label="Laster..." />
          </div>
        ) : filteredSeasons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <CalendarIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen sesonger funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Opprett din første sesong for å komme i gang'}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/seasons/new">
                <Button data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
                  <PlusIcon />
                  Ny sesong
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>Periode</Table.HeaderCell>
                <Table.HeaderCell>Søknadsfrist</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Lokaler</Table.HeaderCell>
                <Table.HeaderCell>Søknader</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredSeasons.map(season => (
                <Table.Row key={season.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/seasons/${season.id}`)}>
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{season.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {formatDate(season.startDate)} – {formatDate(season.endDate)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {formatDate(season.applicationDeadline)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusVariants[season.status]}>
                      {statusLabels[season.status]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {season.venueCount || 0} lokaler
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {season.applicationCount || 0} søknader
                    </div>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/seasons/${season.id}`)}>
                              <EyeIcon />
                              Vis detaljer
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/seasons/${season.id}/edit`)}>
                              <EditIcon />
                              Rediger
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {season.status === 'draft' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleDelete(season.id)} data-color="danger">
                                <TrashIcon />
                                Slett
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                        </Dropdown.List>
                      </Dropdown>
                    </Dropdown.TriggerContext>
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
