/**
 * Tenants List Route - Xaheen Backoffice
 * 
 * Shows list of all tenants with status, create/edit capabilities.
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
    BuildingIcon,
    PlusIcon,
    SearchIcon,
    DashboardPageHeader,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import { useTenants } from '@xaheen/app-shell';

// Status color mapping
function getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
        case 'active': return 'success';
        case 'suspended': return 'warning';
        case 'pending': return 'info';
        case 'deleted': return 'danger';
        default: return 'info';
    }
}

export function TenantsListPage(): React.ReactElement {
    const t = useT();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch tenants
    const { data: tenants, loading, error, refetch } = useTenants();

    // Filter by search
    const filteredTenants = useMemo(() => {
        if (!tenants) return [];
        if (!searchQuery) return tenants;
        const query = searchQuery.toLowerCase();
        return tenants.filter(
            t => t.name.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query)
        );
    }, [tenants, searchQuery]);

    // Loading state
    if (loading && !tenants) {
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
                title={t('backoffice.nav.tenants', { defaultValue: 'Tenants' })}
                subtitle={t('backoffice.tenants.subtitle', { defaultValue: 'Administrer alle tenants i plattformen' })}
                primaryAction={
                    <Button data-variant="primary" onClick={() => navigate('/tenants/new')}>
                        <PlusIcon aria-hidden />
                        {t('backoffice.tenants.create', { defaultValue: 'Opprett Tenant' })}
                    </Button>
                }
            />

            {/* Search and Filters */}
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
                        {filteredTenants.length} {t('backoffice.tenants.count', { defaultValue: 'tenants' })}
                    </Paragraph>
                </Stack>
            </Card>

            {/* Tenants Table */}
            {filteredTenants.length === 0 ? (
                <Card data-color="neutral">
                    <Stack direction="vertical" align="center" gap="md" style={{ padding: 'var(--ds-spacing-8)' }}>
                        <BuildingIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
                        <Heading level={3} data-size="sm">
                            {t('backoffice.tenants.empty', { defaultValue: 'Ingen tenants funnet' })}
                        </Heading>
                        <Paragraph data-color="subtle">
                            {t('backoffice.tenants.emptyDesc', { defaultValue: 'Opprett din første tenant for å komme i gang.' })}
                        </Paragraph>
                        <Button data-variant="primary" onClick={() => navigate('/tenants/new')}>
                            <PlusIcon aria-hidden />
                            {t('backoffice.tenants.create', { defaultValue: 'Opprett Tenant' })}
                        </Button>
                    </Stack>
                </Card>
            ) : (
                <Card data-color="neutral">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{t('backoffice.tenants.name', { defaultValue: 'Navn' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.tenants.slug', { defaultValue: 'Slug' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.tenants.domain', { defaultValue: 'Domene' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.tenants.status', { defaultValue: 'Status' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.tenants.created', { defaultValue: 'Opprettet' })}</Table.HeaderCell>
                                <Table.HeaderCell></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filteredTenants.map((tenant) => (
                                <Table.Row key={tenant.id} onClick={() => navigate(`/tenants/${tenant.id}`)} style={{ cursor: 'pointer' }}>
                                    <Table.Cell>
                                        <Stack direction="horizontal" align="center" gap="sm">
                                            <BuildingIcon aria-hidden />
                                            <Paragraph data-weight="bold">{tenant.name}</Paragraph>
                                        </Stack>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-color="subtle">{tenant.slug}</Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-color="subtle">{tenant.domain || '-'}</Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusTag color={getStatusColor(tenant.status)} data-size="sm">
                                            {tenant.status}
                                        </StatusTag>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-color="subtle">
                                            {new Date(tenant.created_at).toLocaleDateString('nb-NO')}
                                        </Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button data-variant="tertiary" data-size="sm" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/tenants/${tenant.id}/edit`);
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

export default TenantsListPage;
