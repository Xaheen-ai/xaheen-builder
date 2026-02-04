/**
 * Organizations List Page
 * Admin view for listing and managing organizations
 */

import { useState, useMemo } from 'react';
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
  FilterIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  EditIcon,
  TrashIcon,
  ShieldCheckIcon,
  EyeIcon,
  HeaderSearch,
} from '@xaheen/ds';
import {
  useOrganizations,
  useDeleteOrganization,
  useVerifyOrganization,
  type Organization,
  type ActorType,
  type OrganizationStatus,
} from '@xaheen/sdk';
import { useT } from '@xaheen/i18n';

const actorTypeLabels: Record<ActorType, string> = {
  private: 'Privatperson',
  business: 'Bedrift',
  sports_club: 'Idrettslag',
  youth_organization: 'Ungdomsorganisasjon',
  school: 'Skole',
  municipality: 'Kommune',
};

const actorTypeColors: Record<ActorType, 'neutral' | 'info' | 'success' | 'warning'> = {
  private: 'neutral',
  business: 'info',
  sports_club: 'success',
  youth_organization: 'warning',
  school: 'info',
  municipality: 'success',
};

const statusColors: Record<OrganizationStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function OrganizationsListPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useT();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | 'all'>('all');
  const [actorTypeFilter, setActorTypeFilter] = useState<ActorType | 'all'>('all');

  // Queries
  const { data: orgsData, isLoading } = useOrganizations({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const orgs = orgsData?.data ?? [];

  // Mutations
  const deleteOrgMutation = useDeleteOrganization();
  const verifyOrgMutation = useVerifyOrganization();

  // Filter organizations by actor type
  const filteredOrgs = useMemo(() => {
    if (actorTypeFilter === 'all') return orgs;
    return orgs.filter(org => org.actorType === actorTypeFilter);
  }, [orgs, actorTypeFilter]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne organisasjonen?')) {
      await deleteOrgMutation.mutateAsync(id);
    }
  };

  const handleVerify = async (id: string) => {
    await verifyOrgMutation.mutateAsync(id);
  };

  const handleViewDetail = (org: Organization) => {
    navigate(`/organizations/${org.id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Organisasjoner
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer organisasjoner, medlemmer og verifisering
          </Paragraph>
        </div>
        <Link to="/organizations/new">
          <Button type="button">
            <PlusIcon />
            Ny organisasjon
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter organisasjon..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Status: {statusFilter === 'all' ? 'Alle' : statusFilter}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>Aktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('inactive')}>Inaktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('suspended')}>Suspendert</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Type: {actorTypeFilter === 'all' ? 'Alle' : actorTypeLabels[actorTypeFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('private')}>Privatperson</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('business')}>Bedrift</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('sports_club')}>Idrettslag</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('youth_organization')}>Ungdomsorganisasjon</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('school')}>Skole</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('municipality')}>Kommune</Dropdown.Button>
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
        ) : filteredOrgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <BuildingIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen organisasjoner funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all' || actorTypeFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Opprett din første organisasjon for å komme i gang'}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && actorTypeFilter === 'all' && (
              <Link to="/organizations/new">
                <Button data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
                  <PlusIcon />
                  Ny organisasjon
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Org.nr</Table.HeaderCell>
                <Table.HeaderCell>Kontakt</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Verifisert</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredOrgs.map(org => (
                <Table.Row key={org.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(org)}>
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{org.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={actorTypeColors[org.actorType]}>
                      {actorTypeLabels[org.actorType]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)' }}>
                      {org.organizationNumber || '—'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {org.email || org.phone ? (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                        {org.email && <div>{org.email}</div>}
                        {org.phone && <div>{org.phone}</div>}
                      </div>
                    ) : (
                      '—'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[org.status]}>
                      {org.status === 'active' ? 'Aktiv' : org.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {org.verified ? (
                      <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                    ) : (
                      <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(org)}>
                              <EyeIcon />
                              Vis detaljer
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/organizations/${org.id}/edit`)}>
                              <EditIcon />
                              Rediger
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {!org.verified && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleVerify(org.id)}>
                                <ShieldCheckIcon />
                                Verifiser
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleDelete(org.id)} data-color="danger">
                              <TrashIcon />
                              Slett
                            </Dropdown.Button>
                          </Dropdown.Item>
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
