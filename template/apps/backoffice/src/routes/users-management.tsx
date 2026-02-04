/**
 * UsersManagementPage
 *
 * Admin page for managing users and roles
 * - List all users
 * - Role assignment
 * - User status management
 * - Invite users
 */

/* eslint-disable digdir/prefer-ds-components, digdir/no-hardcoded-typography -- Form with native HTML elements */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Table,
  Badge,
  Spinner,
  Select,
  useDialog,
  Input,
} from '@xaheen/ds';

const MOBILE_BREAKPOINT = 768;

const ROLES = [
  { id: 'admin', label: 'Administrator' },
  { id: 'saksbehandler', label: 'Saksbehandler' },
  { id: 'viewer', label: 'Leser' },
];

// Mock users
const mockUsers = [
  {
    id: 'user-001',
    name: 'Ola Nordmann',
    email: 'ola@kommune.no',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-01-14T10:00:00Z',
  },
  {
    id: 'user-002',
    name: 'Kari Hansen',
    email: 'kari@kommune.no',
    role: 'saksbehandler',
    status: 'active',
    lastLogin: '2026-01-13T14:30:00Z',
  },
  {
    id: 'user-003',
    name: 'Per Olsen',
    email: 'per@kommune.no',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2026-01-01T09:00:00Z',
  },
];

export function UsersManagementPage() {
  const { confirm } = useDialog();
  const [isLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('saksbehandler');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDeactivate = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Deaktiver bruker',
      description: `Er du sikker på at du vil deaktivere "${name}"?`,
      confirmText: 'Deaktiver',
      cancelText: 'Avbryt',
      variant: 'danger',
    });
    if (confirmed) {
      console.log('Deactivated:', id);
    }
  };

  const handleInvite = () => {
    console.log('Invite:', inviteEmail, inviteRole);
    setInviteEmail('');
    setShowInvite(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Brukere
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer brukere og tilganger
          </Paragraph>
        </div>
        <Button 
          type="button" 
          variant="primary" 
          data-size="md" 
          onClick={() => setShowInvite(!showInvite)}
          style={{ minHeight: '44px', width: isMobile ? '100%' : 'auto' }}
        >
          Inviter bruker
        </Button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Inviter ny bruker
          </Heading>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto',
            gap: 'var(--ds-spacing-3)',
            alignItems: 'end',
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>
                E-post
              </label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="bruker@kommune.no"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>
                Rolle
              </label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                {ROLES.map((role) => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              style={{ minHeight: '44px' }}
            >
              Send invitasjon
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Totalt</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{mockUsers.length}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Aktive</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
            {mockUsers.filter(u => u.status === 'active').length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Administratorer</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>
            {mockUsers.filter(u => u.role === 'admin').length}
          </Heading>
        </Card>
      </div>

      {/* Users Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster..." data-size="lg" />
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Bruker</Table.HeaderCell>
                <Table.HeaderCell>Rolle</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Sist innlogget</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '160px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {mockUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-accent-surface-default)',
                        color: 'var(--ds-color-accent-text-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'var(--ds-font-weight-semibold)',
                      }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{user.name}</Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{user.email}</Paragraph>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Select
                      value={user.role}
                      onChange={() => {}}
                      style={{ minWidth: '140px' }}
                    >
                      {ROLES.map((role) => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </Select>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge style={{
                      backgroundColor: user.status === 'active' ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                      color: user.status === 'active' ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}>
                      {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDate(user.lastLogin)}</Table.Cell>
                  <Table.Cell>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      data-size="sm" 
                      onClick={() => handleDeactivate(user.id, user.name)}
                    >
                      {user.status === 'active' ? 'Deaktiver' : 'Aktiver'}
                    </Button>
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
