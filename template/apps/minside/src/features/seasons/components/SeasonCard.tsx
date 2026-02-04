import { useNavigate } from 'react-router-dom';
import { Card, Heading, Paragraph, Button } from '@xaheen/ds';
import type { Season } from '@xaheen/sdk/types';
import { SeasonStatusBadge } from './SeasonStatusBadge';

/**
 * Season Card Component
 *
 * Displays season information in a card format with actions.
 */

// Icons
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

interface SeasonCardProps {
  season: Season;
  showActions?: boolean;
}

export function SeasonCard({ season, showActions = true }: SeasonCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleViewDetails = () => {
    navigate(`/seasons/${season.id}`);
  };

  const handleApply = () => {
    navigate(`/seasons/${season.id}?apply=true`);
  };

  const isOpen = season.status === 'open';

  return (
    <Card
      style={{
        padding: 0,
        transition: 'all 0.2s',
        border: '1px solid var(--ds-color-neutral-border-default)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {season.name}
          </Heading>
          {season.description && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {season.description}
            </Paragraph>
          )}
        </div>
        <SeasonStatusBadge status={season.status} size="sm" />
      </div>

      {/* Details Grid */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          display: 'grid',
          gap: 'var(--ds-spacing-5)',
          flex: 1,
        }}
      >
        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              color: 'var(--ds-color-accent-base-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarIcon />
          </div>
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Periode
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatDate(season.startDate)} - {formatDate(season.endDate)}
            </Paragraph>
          </div>
        </div>

        {/* Application Deadline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-warning-surface-default)',
              color: 'var(--ds-color-warning-base-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ClockIcon />
          </div>
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Søknadsfrist
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatDate(season.applicationDeadline)}
            </Paragraph>
          </div>
        </div>

        {/* Statistics */}
        {(season.totalApplications !== undefined || season.approvedApplications !== undefined) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                color: 'var(--ds-color-success-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Søknader
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {season.totalApplications ?? 0} totalt
                {season.approvedApplications !== undefined && ` • ${season.approvedApplications} godkjent`}
              </Paragraph>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div
          style={{
            padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={handleViewDetails}
          >
            Se detaljer
          </Button>
          {isOpen && (
            <Button
              type="button"
              variant="primary"
              data-size="sm"
              onClick={handleApply}
            >
              Søk nå
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
