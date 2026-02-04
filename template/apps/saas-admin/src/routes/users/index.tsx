/**
 * Users List Route - Xaheen Backoffice
 * 
 * Shows list of all platform users.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Spinner,
    Card,
    Heading,
    Stack,
    Paragraph,
    StatusTag,
    Table,
    UsersIcon,
    PlusIcon,
    SearchIcon,
    DashboardPageHeader,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import { useUsers } from '@xaheen/app-shell';

// Status color mapping
function getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'warning';
        case 'suspended': return 'danger';
        case 'deleted': return 'danger';
        default: return 'info';
    }
}

export function UsersListPage(): React.ReactElement {
    const t = useT();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: users, loading, error, refetch } = useUsers();

    // Filter by search
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchQuery) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(
            u => u.email.toLowerCase().includes(query) || u.display_name?.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    // Loading state
    if (loading && !users) {
        return (
            <Stack direction="vertical" align="center" justify="center" gap="md" id="main-content">
                <Spinner aria-hidden="true" />
                <Paragraph data-size="sm">{t('common.loading', { defaultValue: 'Laster...' })}</Paragraph>
            </Stack>
        );
    }

    // Error state
    if (error) {
        return (
            <Stack direction="vertical" align="center" justify="center" gap="md" id="main-content">
                <Heading level={2} data-size="md">{t('common.error', { defaultValue: 'Feil' })}</Heading>
                <Paragraph data-color="subtle">{error.message}</Paragraph>
                <Button onClick={refetch}>{t('common.retry', { defaultValue: 'Prøv igjen' })}</Button>
            </Stack>
        );
    }

    return (
        <Stack direction="vertical" gap="lg" id="main-content">
            {/* Page Header */}
            <DashboardPageHeader
                title={t('backoffice.nav.users', { defaultValue: 'Brukere' })}
                subtitle={t('backoffice.users.subtitle', { defaultValue: 'Administrer plattformbrukere' })}
                primaryAction={
                    <Button data-variant="primary" onClick={() => navigate('/users/invite')}>
                        <PlusIcon aria-hidden />
                        {t('backoffice.users.invite', { defaultValue: 'Inviter Bruker' })}
                    </Button>
                }
            />

            {/* Search */}
            <Card data-color="neutral">
                <Stack direction="horizontal" gap="md" align="center">
                    <Stack direction="horizontal" align="center" gap="sm" style={{ flex: 1 }}>
                        <SearchIcon aria-hidden />
                        <input
                            type="text"
                            placeholder={t('common.search', { defaultValue: 'Søk...' })}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: 'var(--ds-spacing-2)',
                                border: '1px solid var(--ds-color-neutral-border-default)',
                                borderRadius: 'var(--ds-border-radius-md)',
                                background: 'var(--ds-color-neutral-surface-default)',
                                color: 'var(--ds-color-neutral-text-default)',
                            }}
                        />
                    </Stack>
                    <Paragraph data-size="sm" data-color="subtle">
                        {filteredUsers.length} {t('backoffice.users.count', { defaultValue: 'brukere' })}
                    </Paragraph>
                </Stack>
            </Card>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <Card data-color="neutral">
                    <Stack direction="vertical" align="center" gap="md" style={{ padding: 'var(--ds-spacing-8)' }}>
                        <UsersIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
                        <Heading level={3} data-size="sm">
                            {t('backoffice.users.empty', { defaultValue: 'Ingen brukere funnet' })}
                        </Heading>
                        <Paragraph data-color="subtle">
                            {t('backoffice.users.emptyDesc', { defaultValue: 'Inviter din første bruker for å komme i gang.' })}
                        </Paragraph>
                        <Button data-variant="primary" onClick={() => navigate('/users/invite')}>
                            <PlusIcon aria-hidden />
                            {t('backoffice.users.invite', { defaultValue: 'Inviter Bruker' })}
                        </Button>
                    </Stack>
                </Card>
            ) : (
                <Card data-color="neutral">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{t('backoffice.users.email', { defaultValue: 'E-post' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.users.name', { defaultValue: 'Navn' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.users.status', { defaultValue: 'Status' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.users.lastLogin', { defaultValue: 'Sist pålogget' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.users.created', { defaultValue: 'Opprettet' })}</Table.HeaderCell>
                                <Table.HeaderCell></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filteredUsers.map((user) => (
                                <Table.Row key={user.id} onClick={() => navigate(`/users/${user.id}`)} style={{ cursor: 'pointer' }}>
                                    <Table.Cell>
                                        <Stack direction="horizontal" align="center" gap="sm">
                                            <UsersIcon aria-hidden />
                                            <Paragraph data-weight="bold">{user.email}</Paragraph>
                                        </Stack>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm">{user.display_name || '-'}</Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusTag color={getStatusColor(user.status)} data-size="sm">
                                            {user.status}
                                        </StatusTag>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-color="subtle">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('nb-NO') : '-'}
                                        </Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-color="subtle">
                                            {new Date(user.created_at).toLocaleDateString('nb-NO')}
                                        </Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button data-variant="tertiary" data-size="sm" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/users/${user.id}/edit`);
                                        }}>
                                            {t('common.edit', { defaultValue: 'Rediger' })}
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card>
            )}
        </Stack>
    );
}

export default UsersListPage;
