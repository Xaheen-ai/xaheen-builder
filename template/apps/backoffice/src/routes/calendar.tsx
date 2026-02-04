/* eslint-disable digdir/prefer-ds-components -- Calendar view with custom elements */

import { useState, useMemo, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Spinner, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@xaheen/ds';
import { useCalendarEvents, useListings, type CalendarEvent, type Listing, formatWeekRange } from '@xaheen/sdk';
import {
  CreateBlockModal,
  EventDrawer,
  TimelineView,
  ConflictIndicator,
  getConflictColors,
  useCalendarPermissions,
  useDragAndDrop,
  useConflictDetection,
  useRealtimeCalendar
} from '../features/calendar';
import { useToast } from '../providers/ToastProvider';

type ViewType = 'day' | 'week' | 'month' | 'timeline';

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const monthNames = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

type EventColors = { bg: string; border: string; text: string };

function getEventColor(status: CalendarEvent['status']): EventColors {
  const normalizedStatus = status?.toLowerCase() || '';
  switch (normalizedStatus) {
    case 'confirmed':
      return { bg: 'var(--ds-color-success-surface-default)', border: 'var(--ds-color-success-border-default)', text: 'var(--ds-color-success-text-default)' };
    case 'pending':
      return { bg: 'var(--ds-color-warning-surface-default)', border: 'var(--ds-color-warning-border-default)', text: 'var(--ds-color-warning-text-default)' };
    case 'blocked':
    case 'maintenance':
      return { bg: 'var(--ds-color-neutral-surface-hover)', border: 'var(--ds-color-neutral-border-default)', text: 'var(--ds-color-neutral-text-subtle)' };
    default:
      return { bg: 'var(--ds-color-accent-surface-default)', border: 'var(--ds-color-accent-border-default)', text: 'var(--ds-color-accent-text-default)' };
  }
}


function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function CalendarPage() {
  const [view, setView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedListing, setSelectedListing] = useState<string | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Block modal state
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false);
  const [draggedTimeRange, setDraggedTimeRange] = useState<{
    startTime: Date;
    endTime: Date;
    listingId?: string;
  } | null>(null);

  // Permissions
  const permissions = useCalendarPermissions();

  // Drag and drop for week view
  const { isDragging: isWeekDragging, dragPreview: weekDragPreview, handlers: weekDragHandlers } = useDragAndDrop({
    onDragComplete: (params) => {
      setDraggedTimeRange(params);
      setIsCreateBlockOpen(true);
    },
  });

  // Toast notifications
  const toast = useToast();

  // Real-time calendar sync
  const { lastUpdate, hasUpdates } = useRealtimeCalendar({
    enabled: true,
    onBookingEvent: () => {
      // Show subtle notification when calendar updates
      toast.info('Kalender oppdatert', 'Nye bookinger eller endringer er synkronisert');
    },
    trackUpdates: true,
  });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);

  // Fetch listings for filter dropdown
  const { data: listingsData } = useListings({ status: 'published' });
  const listings = listingsData?.data ?? [];

  // Build calendar query params based on view
  const calendarParams = useMemo(() => {
    let start: string;
    let end: string;

    if (view === 'day') {
      start = currentDate.toISOString().split('T')[0] ?? '';
      end = start;
    } else if (view === 'month') {
      start = monthStart.toISOString().split('T')[0] ?? '';
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      end = monthEnd.toISOString().split('T')[0] ?? '';
    } else {
      start = weekStart.toISOString().split('T')[0] ?? '';
      end = weekEnd.toISOString().split('T')[0] ?? '';
    }

    const params: { listingId?: string; startDate: string; endDate: string } = {
      startDate: start,
      endDate: end,
    };
    if (selectedListing) {
      params.listingId = selectedListing;
    }
    return params;
  }, [view, currentDate, weekStart, weekEnd, monthStart, selectedListing]);

  // Fetch calendar events
  const { data: eventsData, isLoading } = useCalendarEvents(calendarParams);
  const events = eventsData?.data ?? [];

  // Conflict detection
  const { hasConflict, getConflicts } = useConflictDetection({
    events,
    enabled: true,
  });

  // Transform events to day index for week view
  const eventsByDay = useMemo(() => {
    const byDay: Record<number, CalendarEvent[]> = {};
    events.forEach((event: CalendarEvent) => {
      const eventDateStr = event.start || event.startTime;
      if (!eventDateStr) return;
      const eventDate = new Date(eventDateStr);
      const dayOfWeek = eventDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      if (!byDay[adjustedDay]) byDay[adjustedDay] = [];
      byDay[adjustedDay].push(event);
    });
    return byDay;
  }, [events]);

  // Transform events by date for month view
  const eventsByDate = useMemo(() => {
    const byDate: Record<string, CalendarEvent[]> = {};
    events.forEach((event: CalendarEvent) => {
      const eventDateStr = event.start || event.startTime;
      if (!eventDateStr) return;
      const dateKey = eventDateStr.split('T')[0] ?? '';
      if (!dateKey) return;
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(event);
    });
    return byDate;
  }, [events]);

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (view === 'day') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const getDateTitle = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      return formatWeekRange(weekStart);
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  // Current time indicator position (for week/day view)
  const currentTimePosition = useMemo(() => {
    const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
    if (hour < 7 || hour > 21) return null;
    return 48 + (hour - 7) * 60;
  }, [currentTime]);

  const isCurrentDayInView = (dayIndex: number) => {
    const today = new Date();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    return dayDate.toDateString() === today.toDateString();
  };

  // Render event card
  const renderEventCard = (event: CalendarEvent, compact = false) => {
    const startStr = event.start || event.startTime;
    const endStr = event.end || event.endTime;
    if (!startStr || !endStr) return null;

    const eventStart = new Date(startStr);
    const eventEnd = new Date(endStr);
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;

    // Check for conflicts
    const eventHasConflict = hasConflict(event.id);
    const conflictInfo = getConflicts(event.id);

    // Get colors - use conflict colors if there's a conflict, otherwise use status colors
    const conflictColors = getConflictColors(eventHasConflict);
    const statusColors = getEventColor(event.status);
    const colors = conflictColors || statusColors;

    const top = 48 + (startHour - 7) * 60;
    const height = Math.max((endHour - startHour) * 60 - 4, 20);

    return (
      <div
        key={event.id}
        onClick={() => setSelectedEvent(event)}
        style={{
          position: compact ? 'relative' : 'absolute',
          top: compact ? undefined : `${top}px`,
          left: compact ? undefined : '2px',
          right: compact ? undefined : '2px',
          height: compact ? 'auto' : `${height}px`,
          backgroundColor: colors.bg,
          border: eventHasConflict
            ? `2px solid ${colors.border}`
            : `1px solid ${colors.border}`,
          borderRadius: 'var(--ds-border-radius-sm)',
          padding: compact ? 'var(--ds-spacing-1)' : 'var(--ds-spacing-1) var(--ds-spacing-2)',
          overflow: 'hidden',
          cursor: 'pointer',
          marginBottom: compact ? 'var(--ds-spacing-1)' : undefined,
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          boxShadow: eventHasConflict ? '0 0 0 1px var(--ds-color-danger-border-default)' : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = eventHasConflict
            ? '0 0 8px var(--ds-color-danger-border-default)'
            : 'var(--ds-shadow-sm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = eventHasConflict
            ? '0 0 0 1px var(--ds-color-danger-border-default)'
            : 'none';
        }}
      >
        {/* Conflict indicator */}
        {eventHasConflict && conflictInfo && !compact && (
          <ConflictIndicator
            conflicts={conflictInfo.conflictingEvents}
            variant="icon"
            position="top-right"
          />
        )}

        <div
          style={{
            fontSize: compact ? '10px' : 'var(--ds-font-size-xs)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: colors.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {event.title || event.userName || 'Booking'}
        </div>
        {!compact && height > 40 && (
          <div style={{ fontSize: 'var(--ds-font-size-body-xs)', color: colors.text, opacity: 0.8 }}>
            {event.listingName}
          </div>
        )}
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Time column */}
      <div style={{ width: '60px', flexShrink: 0, borderRight: '1px solid var(--ds-color-neutral-border-subtle)' }}>
        <div style={{ height: '48px', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }} />
        {hours.map((hour) => (
          <div
            key={hour}
            style={{
              height: '60px',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'right',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {/* Days columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', overflow: 'auto', position: 'relative' }}>
        {days.map((day, dayIndex) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIndex);
          const isToday = dayDate.toDateString() === new Date().toDateString();
          const dayEvents = eventsByDay[dayIndex] ?? [];

          return (
            <div
              key={day}
              style={{ borderRight: dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined, position: 'relative' }}
              data-date={dayDate.toISOString().split('T')[0]}
              {...weekDragHandlers}
            >
              {/* Day header */}
              <div
                style={{
                  height: '48px',
                  padding: 'var(--ds-spacing-2)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  textAlign: 'center',
                  backgroundColor: isToday ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <div style={{ fontSize: 'var(--ds-font-size-xs)', color: isToday ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                  {day}
                </div>
                <div style={{
                  fontSize: 'var(--ds-font-size-md)',
                  fontWeight: isToday ? 'var(--ds-font-weight-bold)' : 'var(--ds-font-weight-medium)',
                  color: isToday ? 'white' : 'var(--ds-color-neutral-text-default)',
                  width: isToday ? '28px' : undefined,
                  height: isToday ? '28px' : undefined,
                  borderRadius: isToday ? 'var(--ds-border-radius-full)' : undefined,
                  backgroundColor: isToday ? 'var(--ds-color-accent-base-default)' : undefined,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {dayDate.getDate()}
                </div>
              </div>

              {/* Hour slots */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    height: '60px',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    position: 'relative',
                  }}
                />
              ))}

              {/* Drag preview */}
              {isWeekDragging && weekDragPreview.visible && !weekDragPreview.listingId && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${weekDragPreview.top}px`,
                    left: 'var(--ds-spacing-1)',
                    right: 'var(--ds-spacing-1)',
                    height: `${weekDragPreview.height}px`,
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    border: '2px dashed var(--ds-color-accent-border-default)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    opacity: 0.7,
                    pointerEvents: 'none',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-accent-text-default)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {weekDragPreview.startTime?.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {weekDragPreview.endTime?.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}

              {/* Current time indicator */}
              {isCurrentDayInView(dayIndex) && currentTimePosition && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${currentTimePosition}px`,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--ds-color-danger-base-default)',
                    zIndex: 5,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 'calc(-1 * var(--ds-spacing-1))',
                      top: 'calc(-1 * var(--ds-spacing-1))',
                      width: '10px',
                      height: '10px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                    }}
                  />
                </div>
              )}

              {/* Events */}
              {dayEvents.map((event) => renderEventCard(event))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Day View
  const renderDayView = () => {
    const todayEvents = events.filter((event: CalendarEvent) => {
      const eventDateStr = event.start || event.startTime;
      if (!eventDateStr) return false;
      return eventDateStr.split('T')[0] === currentDate.toISOString().split('T')[0];
    });

    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Time column */}
        <div style={{ width: '80px', flexShrink: 0, borderRight: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <div style={{ height: '48px', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Tid</span>
          </div>
          {hours.map((hour) => (
            <div
              key={hour}
              style={{
                height: '60px',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textAlign: 'right',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day column */}
        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          {/* Header */}
          <div
            style={{
              height: '48px',
              padding: 'var(--ds-spacing-2)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              textAlign: 'center',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {currentDate.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Paragraph>
          </div>

          {/* Hour slots */}
          {hours.map((hour) => (
            <div
              key={hour}
              style={{
                height: '60px',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                position: 'relative',
              }}
            />
          ))}

          {/* Current time indicator */}
          {currentDate.toDateString() === new Date().toDateString() && currentTimePosition && (
            <div
              style={{
                position: 'absolute',
                top: `${currentTimePosition}px`,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'var(--ds-color-danger-base-default)',
                zIndex: 5,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(-1 * var(--ds-spacing-1))',
                  top: 'calc(-1 * var(--ds-spacing-1))',
                  width: '10px',
                  height: '10px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-danger-base-default)',
                }}
              />
            </div>
          )}

          {/* Events */}
          {todayEvents.map((event: CalendarEvent) => renderEventCard(event))}
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = monthStart.getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          {days.map((day) => (
            <div
              key={day}
              style={{
                padding: 'var(--ds-spacing-2)',
                textAlign: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-subtle)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1 }}>
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNumber = i - startOffset + 1;
            const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
            const cellDate = isValidDay ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber) : null;
            const dateKey = cellDate ? (cellDate.toISOString().split('T')[0] ?? '') : '';
            const dayEvents = dateKey ? (eventsByDate[dateKey] ?? []) : [];
            const isToday = cellDate?.toDateString() === new Date().toDateString();

            return (
              <div
                key={i}
                style={{
                  minHeight: '100px',
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined,
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  padding: 'var(--ds-spacing-2)',
                  backgroundColor: isValidDay ? 'var(--ds-color-neutral-background-default)' : 'var(--ds-color-neutral-surface-default)',
                }}
              >
                {isValidDay && (
                  <>
                    <div
                      style={{
                        fontSize: 'var(--ds-font-size-sm)',
                        fontWeight: isToday ? 'var(--ds-font-weight-bold)' : 'var(--ds-font-weight-regular)',
                        color: isToday ? 'white' : 'var(--ds-color-neutral-text-default)',
                        width: isToday ? '24px' : undefined,
                        height: isToday ? '24px' : undefined,
                        borderRadius: isToday ? 'var(--ds-border-radius-full)' : undefined,
                        backgroundColor: isToday ? 'var(--ds-color-accent-base-default)' : undefined,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'var(--ds-spacing-1)',
                      }}
                    >
                      {dayNumber}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      {dayEvents.slice(0, 3).map((event: CalendarEvent) => renderEventCard(event, true))}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: 'var(--ds-font-size-body-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                          +{dayEvents.length - 3} flere
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Kalender
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Visuell oversikt over bookinger og tilgjengelighet.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {permissions.canCreateBlock && (
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={() => setIsCreateBlockOpen(true)}
            >
              <PlusIcon />
              Opprett blokkering
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Controls */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--ds-spacing-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <Button type="button" variant="tertiary" data-data-size="sm" onClick={() => navigate('prev')} aria-label="Forrige">
              <ChevronLeftIcon />
            </Button>
            <Button type="button" variant="tertiary" data-data-size="sm" onClick={() => navigate('next')} aria-label="Neste">
              <ChevronRightIcon />
            </Button>
            <Heading level={2} data-size="sm" style={{ margin: 0, minWidth: '200px' }}>
              {getDateTitle()}
            </Heading>
            <Button type="button" variant="secondary" data-data-size="sm" onClick={goToToday}>
              I dag
            </Button>
            {/* Real-time sync indicator */}
            {hasUpdates && lastUpdate && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-success-text-default)',
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-success-surface-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  border: '1px solid var(--ds-color-success-border-default)',
                }}
                title={`Sist oppdatert: ${lastUpdate.toLocaleTimeString('nb-NO')}`}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-success-base-default)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <span>Live</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            {/* Listing filter */}
            <select
              value={selectedListing ?? ''}
              onChange={(e) => setSelectedListing(e.target.value || undefined)}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
                minWidth: '180px',
              }}
            >
              <option value="">Alle lokaler</option>
              {listings.map((listing: Listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.name}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--ds-color-neutral-surface-default)', padding: '2px', borderRadius: 'var(--ds-border-radius-md)' }}>
              {(['day', 'week', 'month', 'timeline'] as ViewType[]).map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant={view === v ? 'primary' : 'tertiary'}
                  data-size="sm"
                  onClick={() => setView(v)}
                  style={{ borderRadius: 'var(--ds-border-radius-sm)' }}
                >
                  {v === 'day' ? 'Dag' : v === 'week' ? 'Uke' : v === 'month' ? 'Måned' : 'Tidslinje'}
                </Button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-success-surface-default)', border: '1px solid var(--ds-color-success-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Bekreftet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-warning-surface-default)', border: '1px solid var(--ds-color-warning-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Venter</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', border: '1px solid var(--ds-color-neutral-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Sperret</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner aria-label="Laster kalender..." />
          </div>
        ) : (
          <>
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
            {view === 'month' && renderMonthView()}
            {view === 'timeline' && (
              <TimelineView
                events={events}
                listings={listings}
                dateRange={{ start: weekStart, end: weekEnd }}
                currentTime={currentTime}
                isLoading={isLoading}
                onEventClick={setSelectedEvent}
                onDragComplete={(params) => {
                  setDraggedTimeRange(params);
                  setIsCreateBlockOpen(true);
                }}
              />
            )}
          </>
        )}
      </Card>

      {/* Empty state */}
      {events.length === 0 && !isLoading && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen bookinger i denne perioden.
          </Paragraph>
        </Card>
      )}

      {/* Event Detail Drawer */}
      <EventDrawer
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Create Block Modal */}
      <CreateBlockModal
        isOpen={isCreateBlockOpen}
        onClose={() => {
          setIsCreateBlockOpen(false);
          setDraggedTimeRange(null);
        }}
        initialListingId={selectedListing || draggedTimeRange?.listingId}
        initialDate={draggedTimeRange?.startTime || currentDate}
        initialStartTime={draggedTimeRange?.startTime}
        initialEndTime={draggedTimeRange?.endTime}
      />

      {/* Animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
