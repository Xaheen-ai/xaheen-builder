/**
 * Users Management Page - Complete Admin View
 * Create, invite, and manage backoffice users with roles
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserIcon,
  UsersIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeaderSearch,
} from '@xaheen/ds';
import {
  useUsers,
  useDeactivateUser,
  useReactivateUser,
  type User,
  type UserRole,
  type UserStatus,
} from '@xaheen/sdk';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Superadmin',
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  user: 'Bruker',
};

const roleColors: Record<UserRole, 'success' | 'info' | 'warning' | 'neutral'> = {
  super_admin: 'success',
  admin: 'info',
  saksbehandler: 'warning',
  user: 'neutral',
};

const statusColors: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function UsersPage() {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  // Queries
  const { data: usersData, isLoading } = useUsers({
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const users = usersData?.data ?? [];

  // Mutations
  const deactivateUserMutation = useDeactivateUser();
  const reactivateUserMutation = useReactivateUser();

  // Handlers
  const handleCreate = () => {
    navigate('/users/new');
  };

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('Er du sikker på at du vil deaktivere denne brukeren?')) {
      await deactivateUserMutation.mutateAsync(id);
    }
  };

  const handleReactivate = async (id: string) => {
    await reactivateUserMutation.mutateAsync(id);
  };

  const handleViewDetail = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Brukere
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer backoffice-brukere og tilgangsroller
          </Paragraph>
        </div>
        <Button onClick={handleCreate} data-size="md" type="button">
          <PlusIcon />
          Inviter bruker
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter bruker..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Rolle: {roleFilter === 'all' ? 'Alle' : roleLabels[roleFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setRoleFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setRoleFilter('admin')}>Administrator</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setRoleFilter('saksbehandler')}>Saksbehandler</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>

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
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label="Laster..." />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <UsersIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen brukere funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Inviter din første bruker for å komme i gang'}
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>E-post</Table.HeaderCell>
                <Table.HeaderCell>Telefon</Table.HeaderCell>
                <Table.HeaderCell>Rolle</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Sist innlogget</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(user)}>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <UserIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{user.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{user.email}</span>
                  </Table.Cell>
                  <Table.Cell>
                    {user.phone ? (
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{user.phone}</span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>–</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[user.status]}>
                      {user.status === 'active' ? 'Aktiv' : user.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {user.lastLoginAt ? (
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {new Date(user.lastLoginAt).toLocaleDateString('nb-NO')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Aldri</span>
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm" aria-label="Handlinger">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(user)}>
                              <UserIcon />
                              Se detaljer
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleEdit(user)}>
                              <EditIcon />
                              Rediger
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {user.status === 'active' ? (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleDeactivate(user.id)} data-color="danger">
                                <XCircleIcon />
                                Deaktiver
                              </Dropdown.Button>
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleReactivate(user.id)}>
                                <CheckCircleIcon />
                                Reaktiver
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
