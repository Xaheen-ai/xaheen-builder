import { Card, Heading, Paragraph, Button, Badge } from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import type { SeasonApplication } from '@xaheen/sdk/types';
import { WEEKDAY_LABELS } from '../constants';

/**
 * Application Card Component
 *
 * Displays a season application with status, venue info, and actions.
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

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Status configuration
const APPLICATION_STATUS_CONFIG = {
  pending: {
    label: 'Til behandling',
    color: 'var(--ds-color-warning-text-default)',
    bgColor: 'var(--ds-color-warning-surface-default)',
  },
  approved: {
    label: 'Godkjent',
    color: 'var(--ds-color-success-text-default)',
    bgColor: 'var(--ds-color-success-surface-default)',
  },
  rejected: {
    label: 'Avslått',
    color: 'var(--ds-color-danger-text-default)',
    bgColor: 'var(--ds-color-danger-surface-default)',
  },
  cancelled: {
    label: 'Kansellert',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
} as const;

interface ApplicationCardProps {
  application: SeasonApplication;
  showActions?: boolean;
}

export function ApplicationCard({ application, showActions = true }: ApplicationCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleViewSeason = () => {
    navigate(`/seasons/${application.seasonId}`);
  };

  const handleViewListing = () => {
    // TODO: Navigate to listing detail page when available
    navigate(`/listings/${application.listingId}`);
  };

  const statusConfig = APPLICATION_STATUS_CONFIG[application.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.pending;

  return (
    <Card
      style={{
        padding: 0,
        border: '1px solid var(--ds-color-neutral-border-default)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-5)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
            {application.season?.name || 'Sesong'}
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Søknad sendt {formatDate(application.createdAt)}
          </Paragraph>
        </div>
        <Badge
          data-size="sm"
          style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
            border: 'none',
            fontWeight: 'var(--ds-font-weight-medium)',
            flexShrink: 0,
          }}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Details Grid */}
      <div
        style={{
          padding: 'var(--ds-spacing-5)',
          display: 'grid',
          gap: 'var(--ds-spacing-4)',
          flex: 1,
        }}
      >
        {/* Venue */}
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
            <MapPinIcon />
          </div>
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Lokale
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {application.listing?.name || 'Ukjent lokale'}
            </Paragraph>
          </div>
        </div>

        {/* Weekday and Time */}
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
            <CalendarIcon />
          </div>
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Dag og tid
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {WEEKDAY_LABELS[application.weekday]} • {application.startTime} - {application.endTime}
            </Paragraph>
          </div>
        </div>

        {/* Season Period */}
        {application.season && (
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
              <ClockIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Sesongperiode
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {formatDate(application.season.startDate)} - {formatDate(application.season.endDate)}
              </Paragraph>
            </div>
          </div>
        )}

        {/* Notes (if any) */}
        {application.notes && (
          <div
            style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              borderLeft: '3px solid var(--ds-color-neutral-border-default)',
            }}
          >
            <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
              Merknad
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {application.notes}
            </Paragraph>
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {application.status === 'rejected' && application.rejectionReason && (
          <div
            style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-danger-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              borderLeft: '3px solid var(--ds-color-danger-border-default)',
            }}
          >
            <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
              Årsak til avslag
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
              {application.rejectionReason}
            </Paragraph>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div
          style={{
            padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
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
            onClick={handleViewSeason}
          >
            Se sesong
          </Button>
          {application.status === 'approved' && (
            <Button
              type="button"
              variant="secondary"
              data-size="sm"
              onClick={handleViewListing}
            >
              Se lokale
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
