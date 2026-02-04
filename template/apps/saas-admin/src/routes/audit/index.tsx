/**
 * Audit Log Route - Xaheen Backoffice
 * 
 * Shows audit events with filtering.
 */
import { useMemo, useState } from 'react';
import {
    Spinner,
    Card,
    Heading,
    Stack,
    Paragraph,
    StatusTag,
    Table,
    ShieldIcon,
    SearchIcon,
    DashboardPageHeader,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import { useAuditLog } from '@xaheen/app-shell';

// Action color mapping
function getActionColor(action: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (action) {
        case 'INSERT': return 'success';
        case 'UPDATE': return 'info';
        case 'DELETE': return 'danger';
        default: return 'warning';
    }
}

export function AuditLogPage(): React.ReactElement {
    const t = useT();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: events, loading, error, refetch } = useAuditLog(100);

    // Filter by search
    const filteredEvents = useMemo(() => {
        if (!events) return [];
        if (!searchQuery) return events;
        const query = searchQuery.toLowerCase();
        return events.filter(
            e => e.action.toLowerCase().includes(query) ||
                e.resource_type.toLowerCase().includes(query) ||
                e.resource_id?.toLowerCase().includes(query)
        );
    }, [events, searchQuery]);

    // Loading state
    if (loading && !events) {
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
            </Stack>
        );
    }

    return (
        <Stack direction="vertical" gap="lg" id="main-content">
            {/* Page Header */}
            <DashboardPageHeader
                title={t('backoffice.nav.audit', { defaultValue: 'Audit Log' })}
                subtitle={t('backoffice.audit.subtitle', { defaultValue: 'Alle hendelser i systemet' })}
            />

            {/* Search */}
            <Card data-color="neutral">
                <Stack direction="horizontal" gap="md" align="center">
                    <Stack direction="horizontal" align="center" gap="sm" style={{ flex: 1 }}>
                        <SearchIcon aria-hidden />
                        <input
                            type="text"
                            placeholder={t('common.search', { defaultValue: 'Søk hendelser...' })}
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
                        {filteredEvents.length} {t('backoffice.audit.count', { defaultValue: 'hendelser' })}
                    </Paragraph>
                </Stack>
            </Card>

            {/* Audit Table */}
            {filteredEvents.length === 0 ? (
                <Card data-color="neutral">
                    <Stack direction="vertical" align="center" gap="md" style={{ padding: 'var(--ds-spacing-8)' }}>
                        <ShieldIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
                        <Heading level={3} data-size="sm">
                            {t('backoffice.audit.empty', { defaultValue: 'Ingen hendelser funnet' })}
                        </Heading>
                    </Stack>
                </Card>
            ) : (
                <Card data-color="neutral">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{t('backoffice.audit.timestamp', { defaultValue: 'Tidspunkt' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.audit.action', { defaultValue: 'Handling' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.audit.resource', { defaultValue: 'Ressurs' })}</Table.HeaderCell>
                                <Table.HeaderCell>{t('backoffice.audit.resourceId', { defaultValue: 'ID' })}</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filteredEvents.map((event) => (
                                <Table.Row key={event.id}>
                                    <Table.Cell>
                                        <Paragraph data-size="sm">
                                            {new Date(event.created_at).toLocaleString('nb-NO')}
                                        </Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusTag color={getActionColor(event.action)} data-size="sm">
                                            {event.action}
                                        </StatusTag>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-weight="bold">{event.resource_type}</Paragraph>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Paragraph data-size="sm" data-color="subtle" style={{ fontFamily: 'monospace' }}>
                                            {event.resource_id ? event.resource_id.substring(0, 8) + '...' : '-'}
                                        </Paragraph>
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

export default AuditLogPage;
