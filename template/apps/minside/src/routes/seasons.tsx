import { useState, useMemo } from 'react';
import { Container, Heading, Paragraph, Card, Button, Spinner } from '@xaheen/ds';
import { useSeasons } from '@xaheen/sdk/hooks';
import type { SeasonStatus } from '@xaheen/sdk/types';
import { useAccountContext } from '../providers/AccountContextProvider';
import { SeasonCard } from '../features/seasons/components/SeasonCard';
import { SEASON_FILTER_OPTIONS } from '../features/seasons/constants';

/**
 * Seasons List Page
 *
 * Main page for browsing available seasons and applying for seasonal bookings.
 */

// Icons
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function SeasonsPage() {
  const { accountType, selectedOrganization } = useAccountContext();
  const [statusFilter, setStatusFilter] = useState<SeasonStatus | 'all'>('all');

  // Fetch seasons from SDK
  const { data: seasonsResponse, isLoading, error } = useSeasons(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const seasons = seasonsResponse?.data ?? [];

  // Calculate stats
  const stats = useMemo(() => {
    const openSeasons = seasons.filter(s => s.status === 'open').length;
    const activeSeasons = seasons.filter(s => s.status === 'active').length;
    const upcomingSeasons = seasons.filter(s => s.status === 'draft').length;

    return {
      openSeasons,
      activeSeasons,
      upcomingSeasons,
    };
  }, [seasons]);

  return (
    <Container style={{ padding: 'var(--ds-spacing-8)' }}>
      {/* Account Context Banner */}
      {accountType === 'organization' && selectedOrganization && (
        <Card
          style={{
            marginBottom: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            border: '1px solid var(--ds-color-success-border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Du søker på vegne av: {selectedOrganization.name}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Søknader sendes inn som organisasjon
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Sesongbooking
        </Heading>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '800px' }}>
          Søk om faste tider for hele sesongen. Perfekt for lag, foreninger og organisasjoner som trenger
          regelmessig tilgang til lokaler og fasiliteter.
        </Paragraph>
      </div>

      {/* Season Status Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-8)',
        }}
      >
        {/* Active Seasons */}
        <Card
          style={{
            padding: 'var(--ds-spacing-5)',
            border: '2px solid var(--ds-color-accent-border-default)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircleIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Aktive sesonger
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.activeSeasons}
              </Heading>
            </div>
          </div>
        </Card>

        {/* Open for Applications */}
        <Card
          style={{
            padding: 'var(--ds-spacing-5)',
            border: '2px solid var(--ds-color-success-border-default)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CalendarIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Åpne for søknader
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.openSeasons}
              </Heading>
            </div>
          </div>
        </Card>

        {/* Upcoming Seasons */}
        <Card
          style={{
            padding: 'var(--ds-spacing-5)',
            border: '2px solid var(--ds-color-warning-border-default)',
            backgroundColor: 'var(--ds-color-warning-surface-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ClockIcon />
            </div>
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
              >
                Kommende sesonger
              </Paragraph>
              <Heading level={3} data-size="lg" style={{ margin: 0 }}>
                {stats.upcomingSeasons}
              </Heading>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
          marginBottom: 'var(--ds-spacing-6)',
          overflowX: 'auto',
          paddingBottom: 'var(--ds-spacing-2)',
        }}
      >
        {SEASON_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={statusFilter === option.value ? 'primary' : 'secondary'}
            data-size="sm"
            onClick={() => setStatusFilter(option.value)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Season List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-10)' }}>
          <Spinner aria-label="Laster sesonger..." />
        </div>
      ) : error ? (
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
            Kunne ikke laste sesonger. Vennligst prøv igjen senere.
          </Paragraph>
        </Card>
      ) : seasons.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen sesonger funnet
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Det er ingen sesonger tilgjengelig for øyeblikket.
          </Paragraph>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--ds-spacing-6)',
          }}
        >
          {seasons.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>
      )}
    </Container>
  );
}
