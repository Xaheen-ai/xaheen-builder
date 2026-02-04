/**
 * ActivityTab Component
 *
 * Displays activity/history based on listing type:
 * - Facilities: Events and arrangements calendar
 * - Equipment: Rental history timeline
 * - Events: Session calendar
 */

import * as React from 'react';
import { Heading, Paragraph, Tag } from '@xaheen/ds';
import type { ActivityData, ListingEvent, RentalHistoryItem, ListingType } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================

function CalendarIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MapPinIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// =============================================================================
// Status Configuration
// =============================================================================

interface StatusConfig {
  color: 'success' | 'warning' | 'info' | 'neutral';
  label: string;
  accentColor: string;
  bgColor: string;
  iconBgColor: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  upcoming: {
    color: 'info',
    label: 'Kommende',
    accentColor: 'var(--ds-color-accent-base-default, #0ea5e9)',
    bgColor: 'rgba(14, 165, 233, 0.08)',
    iconBgColor: 'rgba(14, 165, 233, 0.15)',
  },
  ongoing: {
    color: 'success',
    label: 'Pågår nå',
    accentColor: 'var(--ds-color-success-base-default, #22c55e)',
    bgColor: 'rgba(34, 197, 94, 0.08)',
    iconBgColor: 'rgba(34, 197, 94, 0.15)',
  },
  past: {
    color: 'neutral',
    label: 'Avsluttet',
    accentColor: 'var(--ds-color-neutral-base-default, #64748b)',
    bgColor: 'rgba(100, 116, 139, 0.06)',
    iconBgColor: 'rgba(100, 116, 139, 0.12)',
  },
  cancelled: {
    color: 'warning',
    label: 'Avlyst',
    accentColor: 'var(--ds-color-warning-base-default, #f59e0b)',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    iconBgColor: 'rgba(245, 158, 11, 0.15)',
  },
};

// =============================================================================
// Props
// =============================================================================

export interface ActivityTabProps {
  activityData?: ActivityData;
  listingType: ListingType;
  className?: string;
}

// =============================================================================
// Sub-components
// =============================================================================

function EventCard({ event, index }: { event: ListingEvent; index: number }): React.ReactElement {
  const config = statusConfigs[event.status] || statusConfigs.past;
  const [isHovered, setIsHovered] = React.useState(false);

  const formatDate = (dateStr: string): { day: string; month: string; weekday: string } => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('nb-NO', { month: 'short' }).replace('.', ''),
      weekday: date.toLocaleDateString('nb-NO', { weekday: 'short' }).replace('.', ''),
    };
  };

  const dateInfo = formatDate(event.startDate);
  const isPast = event.status === 'past';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-lg, 12px)',
        backgroundColor: isHovered ? config.bgColor : 'var(--ds-color-neutral-surface-default, rgba(255,255,255,0.03))',
        border: '1px solid var(--ds-color-neutral-border-subtle, rgba(255,255,255,0.08))',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        opacity: isPast ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: config.accentColor,
          borderRadius: '4px 0 0 4px',
        }}
      />

      {/* Date badge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '60px',
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          backgroundColor: config.iconBgColor,
          borderRadius: 'var(--ds-border-radius-md, 8px)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: config.accentColor,
            lineHeight: 1,
          }}
        >
          {dateInfo.weekday}
        </span>
        <span
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--ds-color-neutral-text-default, #fff)',
            lineHeight: 1.2,
          }}
        >
          {dateInfo.day}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            color: 'var(--ds-color-neutral-text-subtle, #94a3b8)',
            lineHeight: 1,
          }}
        >
          {dateInfo.month}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
          <Heading level={4} data-size="xs" style={{ margin: 0, fontWeight: 600, lineHeight: 1.3 }}>
            {event.title}
          </Heading>
          <Tag color={config.color} data-size="sm" style={{ flexShrink: 0 }}>
            {config.label}
          </Tag>
        </div>

        {/* Time row */}
        {(event.startTime || event.endTime) && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover, rgba(255,255,255,0.05))',
              borderRadius: 'var(--ds-border-radius-sm, 4px)',
              width: 'fit-content',
            }}
          >
            <ClockIcon size={14} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ds-color-neutral-text-default, #e2e8f0)' }}>
              {event.startTime}{event.endTime && ` – ${event.endTime}`}
            </span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle, #94a3b8)',
              lineHeight: 1.5,
            }}
          >
            {event.description}
          </Paragraph>
        )}

        {/* Footer with organizer */}
        {event.organizer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              paddingTop: 'var(--ds-spacing-2)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle, rgba(255,255,255,0.06))',
              marginTop: 'var(--ds-spacing-1)',
            }}
          >
            <UsersIcon size={14} />
            <span style={{ fontSize: '0.75rem', color: 'var(--ds-color-neutral-text-subtle, #64748b)' }}>
              {event.organizer}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function RentalHistoryCard({ rental }: { rental: RentalHistoryItem }): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);
  const isCompleted = rental.status === 'completed';

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md, 8px)',
        backgroundColor: isHovered
          ? 'var(--ds-color-neutral-surface-hover, rgba(255,255,255,0.06))'
          : 'var(--ds-color-neutral-surface-default, rgba(255,255,255,0.03))',
        border: '1px solid var(--ds-color-neutral-border-subtle, rgba(255,255,255,0.08))',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: isCompleted
            ? 'var(--ds-color-success-base-default, #22c55e)'
            : 'var(--ds-color-neutral-base-default, #64748b)',
          boxShadow: isCompleted ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none',
        }}
      />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
          {formatDate(rental.date)}
          {rental.duration && (
            <span style={{ color: 'var(--ds-color-neutral-text-subtle, #64748b)' }}>
              {' '}• {rental.duration}
            </span>
          )}
        </Paragraph>
        {rental.purpose && (
          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle, #64748b)' }}>
            {rental.purpose}
          </Paragraph>
        )}
      </div>

      {/* Status tag */}
      <Tag color={isCompleted ? 'success' : 'neutral'} data-size="sm">
        {isCompleted ? 'Fullført' : 'Kansellert'}
      </Tag>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ActivityTab({
  activityData,
  listingType,
  className,
}: ActivityTabProps): React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);

  // Empty state
  if (!activityData || (activityData.events?.length === 0 && activityData.rentals?.length === 0)) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-12, 48px) var(--ds-spacing-6)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto var(--ds-spacing-4)',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover, rgba(255,255,255,0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarIcon size={28} />
        </div>
        <Paragraph data-size="sm" style={{ margin: 0, fontStyle: 'italic' }}>
          {presenter.getEmptyState('activity')}
        </Paragraph>
      </div>
    );
  }

  // Group events by status for better organization
  const upcomingEvents = activityData.events?.filter(e => e.status === 'upcoming' || e.status === 'ongoing') || [];
  const pastEvents = activityData.events?.filter(e => e.status === 'past') || [];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-6)',
      }}
    >
      {/* Events list */}
      {activityData.type === 'events' && activityData.events && activityData.events.length > 0 && (
        <>
          {/* Upcoming events */}
          {upcomingEvents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-accent-base-default, #0ea5e9)',
                  }}
                />
                <Heading level={3} data-size="xs" style={{ margin: 0, fontWeight: 600 }}>
                  Kommende arrangementer
                </Heading>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-accent-surface-default, rgba(14, 165, 233, 0.15))',
                    color: 'var(--ds-color-accent-base-default, #0ea5e9)',
                    fontWeight: 600,
                  }}
                >
                  {upcomingEvents.length}
                </span>
              </div>
              {upcomingEvents.map((event: ListingEvent, idx: number) => (
                <EventCard key={event.id} event={event} index={idx} />
              ))}
            </div>
          )}

          {/* Past events */}
          {pastEvents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-neutral-base-default, #64748b)',
                  }}
                />
                <Heading level={3} data-size="xs" style={{ margin: 0, fontWeight: 600, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tidligere arrangementer
                </Heading>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover, rgba(100, 116, 139, 0.15))',
                    color: 'var(--ds-color-neutral-text-subtle, #64748b)',
                    fontWeight: 600,
                  }}
                >
                  {pastEvents.length}
                </span>
              </div>
              {pastEvents.map((event: ListingEvent, idx: number) => (
                <EventCard key={event.id} event={event} index={idx} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Rental history */}
      {activityData.type === 'rentals' && activityData.rentals && activityData.rentals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Utleiehistorikk
          </Heading>
          {activityData.rentals.map((rental: RentalHistoryItem) => (
            <RentalHistoryCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}

      {/* Total count indicator */}
      {activityData.totalCount && activityData.totalCount > (activityData.events?.length || activityData.rentals?.length || 0) && (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover, rgba(255,255,255,0.03))',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Viser {activityData.events?.length || activityData.rentals?.length} av {activityData.totalCount} totalt
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default ActivityTab;
