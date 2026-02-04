/**
 * Plans/Products List Route - Xaheen Backoffice
 * 
 * Shows subscription plans/products.
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
    CreditCardIcon,
    SearchIcon,
    DashboardPageHeader,
} from '@xala-technologies/platform-ui';
import { useT } from '@xaheen/i18n';
import { usePlans } from '@xaheen/app-shell';

export function PlansListPage(): React.ReactElement {
    const t = useT();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: plans, loading, error } = usePlans();

    // Filter by search
    const filteredPlans = useMemo(() => {
        if (!plans) return [];
        if (!searchQuery) return plans;
        const query = searchQuery.toLowerCase();
        return plans.filter(
            p => p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query)
        );
    }, [plans, searchQuery]);

    // Loading state
    if (loading && !plans) {
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
                title={t('backoffice.nav.plans', { defaultValue: 'Planer' })}
                subtitle={t('backoffice.plans.subtitle', { defaultValue: 'Abonnementsplaner og produkter' })}
            />

            {/* Search */}
            <Card data-color="neutral">
                <Stack direction="horizontal" gap="md" align="center">
                    <Stack direction="horizontal" align="center" gap="sm" style={{ flex: 1 }}>
                        <SearchIcon aria-hidden />
                        <input
                            type="text"
                            placeholder={t('common.search', { defaultValue: 'Søk planer...' })}
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
                        {filteredPlans.length} {t('backoffice.plans.count', { defaultValue: 'planer' })}
                    </Paragraph>
                </Stack>
            </Card>

            {/* Plans Grid */}
            <Grid cols={{ base: 1, sm: 2, md: 3 }} gap="md">
                {filteredPlans.map((plan) => (
                    <Card key={plan.id} data-color="neutral">
                        <Stack direction="vertical" gap="md">
                            <Stack direction="horizontal" justify="between" align="start">
                                <Stack direction="horizontal" align="center" gap="sm">
                                    <CreditCardIcon aria-hidden />
                                    <Heading level={3} data-size="sm">{plan.name}</Heading>
                                </Stack>
                                <StatusTag color={plan.active ? 'success' : 'warning'} data-size="sm">
                                    {plan.active ? 'Aktiv' : 'Inaktiv'}
                                </StatusTag>
                            </Stack>
                            <Paragraph data-size="sm" data-color="subtle">
                                {plan.description || t('backoffice.plans.noDescription', { defaultValue: 'Ingen beskrivelse' })}
                            </Paragraph>
                            <Stack direction="horizontal" justify="between" align="center">
                                <StatusTag color="info" data-size="sm">{plan.type}</StatusTag>
                                <Paragraph data-size="sm" data-color="subtle">{plan.slug}</Paragraph>
                            </Stack>
                            {plan.modules.length > 0 && (
                                <Stack direction="horizontal" gap="xs" style={{ flexWrap: 'wrap' }}>
                                    {plan.modules.map((module) => (
                                        <StatusTag key={module} color="info" data-size="sm">{module}</StatusTag>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Card>
                ))}
            </Grid>

            {filteredPlans.length === 0 && (
                <Card data-color="neutral">
                    <Stack direction="vertical" align="center" gap="md" style={{ padding: 'var(--ds-spacing-8)' }}>
                        <CreditCardIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
                        <Heading level={3} data-size="sm">
                            {t('backoffice.plans.empty', { defaultValue: 'Ingen planer funnet' })}
                        </Heading>
                    </Stack>
                </Card>
            )}
        </Stack>
    );
}

export default PlansListPage;
