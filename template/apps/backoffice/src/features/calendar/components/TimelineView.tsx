/**
 * Timeline View Component
 * Displays multiple resources (listings) side-by-side with time slots
 */

import { useMemo } from 'react';
import { Paragraph, Spinner } from '@xaheen/ds';
import type { CalendarEvent, Listing } from '@xaheen/sdk';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useConflictDetection } from '../hooks/useConflictDetection';
import { ConflictIndicator, getConflictColors } from './ConflictIndicator';

interface TimelineViewProps {
  events: CalendarEvent[];
  listings: Listing[];
  dateRange: { start: Date; end: Date };
  currentTime?: Date;
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onDragComplete?: (params: { startTime: Date; endTime: Date; listingId?: string }) => void;
}

type EventColors = { bg: string; border: string; text: string };

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00

function getEventColor(status: CalendarEvent['status']): EventColors {
  const normalizedStatus = status?.toLowerCase() || '';
  switch (normalizedStatus) {
    case 'confirmed':
      return {
        bg: 'var(--ds-color-success-surface-default)',
        border: 'var(--ds-color-success-border-default)',
        text: 'var(--ds-color-success-text-default)',
      };
    case 'pending':
      return {
        bg: 'var(--ds-color-warning-surface-default)',
        border: 'var(--ds-color-warning-border-default)',
        text: 'var(--ds-color-warning-text-default)',
      };
    case 'blocked':
    case 'maintenance':
      return {
        bg: 'var(--ds-color-neutral-surface-hover)',
        border: 'var(--ds-color-neutral-border-default)',
        text: 'var(--ds-color-neutral-text-subtle)',
      };
    default:
      return {
        bg: 'var(--ds-color-accent-surface-default)',
        border: 'var(--ds-color-accent-border-default)',
        text: 'var(--ds-color-accent-text-default)',
      };
  }
}

export function TimelineView({
  events,
  listings,
  dateRange,
  currentTime = new Date(),
  isLoading = false,
  onEventClick,
  onDragComplete,
}: TimelineViewProps) {
  // Initialize drag and drop hook
  const { isDragging, dragPreview, handlers: dragHandlers } = useDragAndDrop({
    startHour: 7,
    endHour: 21,
    hourHeight: 80,  // Timeline uses horizontal layout, but we treat the lane height as "hour height" for calculations
    headerOffset: 0,
    minDurationMinutes: 30,
    snapIntervalMinutes: 15,
    onDragComplete,
  });

  // Conflict detection
  const { hasConflict, getConflicts } = useConflictDetection({
    events,
    enabled: true,
  });

  // Group events by listing
  const eventsByListing = useMemo(() => {
    const byListing: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const listingId = event.listingId;
      if (!listingId) return;
      if (!byListing[listingId]) byListing[listingId] = [];
      byListing[listingId].push(event);
    });
    return byListing;
  }, [events]);

  // Calculate current time indicator position
  const currentTimePosition = useMemo(() => {
    const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
    if (hour < 7 || hour > 21) return null;
    // Each hour takes 80px width
    return 120 + (hour - 7) * 80;
  }, [currentTime]);

  // Check if current time is within the date range
  const isCurrentTimeInRange = useMemo(() => {
    const now = new Date(currentTime);
    now.setHours(0, 0, 0, 0);
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  }, [currentTime, dateRange]);

  // Render event card
  const renderEventCard = (event: CalendarEvent) => {
    const startStr = event.start || event.startTime;
    const endStr = event.end || event.endTime;
    if (!startStr || !endStr) return null;

    const eventStart = new Date(startStr);
    const eventEnd = new Date(endStr);
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;

    // Calculate position and width (each hour = 80px)
    const left = 120 + (startHour - 7) * 80;
    const width = Math.max((endHour - startHour) * 80 - 4, 40);

    // Check for conflicts
    const eventHasConflict = hasConflict(event.id);
    const conflictInfo = getConflicts(event.id);

    // Get colors - use conflict colors if there's a conflict, otherwise use status colors
    const conflictColors = getConflictColors(eventHasConflict);
    const statusColors = getEventColor(event.status);
    const colors = conflictColors || statusColors;

    return (
      <div
        key={event.id}
        onClick={() => onEventClick?.(event)}
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: 'var(--ds-spacing-1)',
          bottom: 'var(--ds-spacing-1)',
          width: `${width}px`,
          backgroundColor: colors.bg,
          border: eventHasConflict
            ? `2px solid ${colors.border}`
            : `1px solid ${colors.border}`,
          borderRadius: 'var(--ds-border-radius-sm)',
          padding: 'var(--ds-spacing-2)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          zIndex: eventHasConflict ? 3 : 2,
          boxShadow: eventHasConflict ? '0 0 0 1px var(--ds-color-danger-border-default)' : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = eventHasConflict
            ? '0 0 8px var(--ds-color-danger-border-default)'
            : 'var(--ds-shadow-sm)';
          e.currentTarget.style.zIndex = '10';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = eventHasConflict
            ? '0 0 0 1px var(--ds-color-danger-border-default)'
            : 'none';
          e.currentTarget.style.zIndex = eventHasConflict ? '3' : '2';
        }}
      >
        {/* Conflict indicator */}
        {eventHasConflict && conflictInfo && width > 60 && (
          <ConflictIndicator
            conflicts={conflictInfo.conflictingEvents}
            variant="icon"
            position="top-right"
          />
        )}

        <div
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: colors.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {event.title || event.userName || 'Booking'}
        </div>
        {width > 100 && (
          <div
            style={{
              fontSize: 'var(--ds-font-size-body-xs)',
              color: colors.text,
              opacity: 0.8,
              marginTop: 'var(--ds-spacing-1)',
            }}
          >
            {eventStart.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {eventEnd.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner aria-label="Laster tidslinje..." />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Ingen lokaler tilgjengelig for tidslinjevisning.
        </Paragraph>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Time axis header */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--ds-color-neutral-border-default)' }}>
        {/* Resource label column */}
        <div
          style={{
            width: '120px',
            flexShrink: 0,
            padding: 'var(--ds-spacing-2)',
            borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'var(--ds-font-weight-medium)',
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          Lokaler
        </div>

        {/* Time slots header */}
        <div style={{ flex: 1, display: 'flex', overflow: 'auto', position: 'relative' }}>
          {hours.map((hour) => (
            <div
              key={hour}
              style={{
                width: '80px',
                flexShrink: 0,
                padding: 'var(--ds-spacing-2)',
                borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                textAlign: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
              }}
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
      </div>

      {/* Resource lanes */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {listings.map((listing, index) => {
          const listingEvents = eventsByListing[listing.id] ?? [];

          return (
            <div
              key={listing.id}
              style={{
                display: 'flex',
                borderBottom:
                  index < listings.length - 1 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined,
                minHeight: '80px',
                position: 'relative',
              }}
            >
              {/* Resource name */}
              <div
                style={{
                  width: '120px',
                  flexShrink: 0,
                  padding: 'var(--ds-spacing-3)',
                  borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: 'var(--ds-color-neutral-text-default)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {listing.name}
                  </div>
                  {listing.capacity && (
                    <div
                      style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                        marginTop: 'var(--ds-spacing-1)',
                      }}
                    >
                      Kap: {listing.capacity}
                    </div>
                  )}
                </div>
              </div>

              {/* Time grid */}
              <div
                style={{ flex: 1, position: 'relative', backgroundColor: 'var(--ds-color-neutral-background-default)' }}
                data-listing-id={listing.id}
                data-date={dateRange.start.toISOString().split('T')[0]}
                {...dragHandlers}
              >
                {/* Hour dividers */}
                {hours.map((hour, hourIndex) => (
                  <div
                    key={hour}
                    style={{
                      position: 'absolute',
                      left: `${120 + hourIndex * 80}px`,
                      top: 0,
                      bottom: 0,
                      width: '80px',
                      borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  />
                ))}

                {/* Drag preview */}
                {isDragging && dragPreview.visible && dragPreview.listingId === listing.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--ds-spacing-1)',
                      bottom: 'var(--ds-spacing-1)',
                      left: `${dragPreview.top}px`,
                      width: `${dragPreview.height}px`,
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      border: '2px dashed var(--ds-color-accent-border-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      opacity: 0.7,
                      pointerEvents: 'none',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--ds-spacing-2)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-accent-text-default)',
                        fontWeight: 'var(--ds-font-weight-medium)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dragPreview.startTime?.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {dragPreview.endTime?.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}

                {/* Current time indicator */}
                {isCurrentTimeInRange && currentTimePosition && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${currentTimePosition}px`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                      zIndex: 5,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 'calc(-1 * var(--ds-spacing-1))',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '10px',
                        height: '10px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-danger-base-default)',
                      }}
                    />
                  </div>
                )}

                {/* Events */}
                {listingEvents.map((event) => renderEventCard(event))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
