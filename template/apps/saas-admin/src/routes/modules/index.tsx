/**
 * Modules List Route - Xaheen Backoffice
 * 
 * Shows available platform modules and their status.
 */
import { useMemo, useState } from 'react';
import {
    Spinner,
    Card,
    Heading,
    Stack,
    Paragraph,
    StatusTag,
    Grid,
    ChartIcon,
    SearchIcon,
    DashboardPageHeader,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import { useModules } from '@xaheen/app-shell';

export function ModulesListPage(): React.ReactElement {
    const t = useT();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: modules, loading, error, refetch } = useModules();

    // Filter by search
    const filteredModules = useMemo(() => {
        if (!modules) return [];
        if (!searchQuery) return modules;
        const query = searchQuery.toLowerCase();
        return modules.filter(
            m => m.display_name.toLowerCase().includes(query) ||
                m.slug.toLowerCase().includes(query) ||
                m.category?.toLowerCase().includes(query)
        );
    }, [modules, searchQuery]);

    // Group by category
    const groupedModules = useMemo(() => {
        const groups: Record<string, typeof filteredModules> = {};
        filteredModules.forEach(module => {
            const category = module.category || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(module);
        });
        return groups;
    }, [filteredModules]);

    // Loading state
    if (loading && !modules) {
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
                title={t('backoffice.nav.modules', { defaultValue: 'Moduler' })}
                subtitle={t('backoffice.modules.subtitle', { defaultValue: 'Tilgjengelige plattformmoduler' })}
            />

            {/* Search */}
            <Card data-color="neutral">
                <Stack direction="horizontal" gap="md" align="center">
                    <Stack direction="horizontal" align="center" gap="sm" style={{ flex: 1 }}>
                        <SearchIcon aria-hidden />
                        <input
                            type="text"
                            placeholder={t('common.search', { defaultValue: 'Søk moduler...' })}
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
                        {filteredModules.length} {t('backoffice.modules.count', { defaultValue: 'moduler' })}
                    </Paragraph>
                </Stack>
            </Card>

            {/* Modules by Category */}
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
                <Stack key={category} direction="vertical" gap="md">
                    <Heading level={2} data-size="sm" style={{ textTransform: 'capitalize' }}>
                        {category}
                    </Heading>
                    <Grid cols={{ base: 1, sm: 2, md: 3 }} gap="md">
                        {categoryModules.map((module) => (
                            <Card key={module.id} data-color="neutral">
                                <Stack direction="vertical" gap="sm">
                                    <Stack direction="horizontal" justify="between" align="start">
                                        <Stack direction="horizontal" align="center" gap="sm">
                                            <ChartIcon aria-hidden />
                                            <Heading level={3} data-size="xs">{module.display_name}</Heading>
                                        </Stack>
                                        <StatusTag color={module.enabled ? 'success' : 'warning'} data-size="sm">
                                            {module.enabled ? 'Aktiv' : 'Deaktivert'}
                                        </StatusTag>
                                    </Stack>
                                    <Paragraph data-size="sm" data-color="subtle">
                                        {module.description || t('backoffice.modules.noDescription', { defaultValue: 'Ingen beskrivelse' })}
                                    </Paragraph>
                                    <Stack direction="horizontal" justify="between" align="center">
                                        <Paragraph data-size="xs" data-color="subtle">v{module.version}</Paragraph>
                                        <Paragraph data-size="xs" data-color="subtle">{module.slug}</Paragraph>
                                    </Stack>
                                </Stack>
                            </Card>
                        ))}
                    </Grid>
                </Stack>
            ))}

            {filteredModules.length === 0 && (
                <Card data-color="neutral">
                    <Stack direction="vertical" align="center" gap="md" style={{ padding: 'var(--ds-spacing-8)' }}>
                        <ChartIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
                        <Heading level={3} data-size="sm">
                            {t('backoffice.modules.empty', { defaultValue: 'Ingen moduler funnet' })}
                        </Heading>
                    </Stack>
                </Card>
            )}
        </Stack>
    );
}

export default ModulesListPage;
