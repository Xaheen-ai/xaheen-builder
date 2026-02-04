/**
 * Availability Tab
 * Calendar view for viewing and managing listing availability
 * Shows bookings, blocks, and allows creating block-out periods
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Checkbox,
  Select,
} from '@xaheen/ds';
import {
  useCalendarEvents,
  type CalendarEvent,
  formatWeekRange,
  useListing,
  useUpdateListing,
} from '@xaheen/sdk';
import {
  CreateBlockModal,
  EventDrawer,
  useCalendarPermissions,
} from '../../../calendar';
import type { ListingOpeningHours } from '../../types';

interface AvailabilityTabProps {
  listingId: string;
  listingName?: string;
}

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

type DayKey = keyof ListingOpeningHours;

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Mandag' },
  { key: 'tuesday', label: 'Tirsdag' },
  { key: 'wednesday', label: 'Onsdag' },
  { key: 'thursday', label: 'Torsdag' },
  { key: 'friday', label: 'Fredag' },
  { key: 'saturday', label: 'Lørdag' },
  { key: 'sunday', label: 'Søndag' },
];

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30', '00:00',
];

type EventColors = { bg: string; border: string; text: string };

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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function AvailabilityTab({ listingId, listingName }: AvailabilityTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false);
  const [showOpeningHours, setShowOpeningHours] = useState(true);
  const [localOpeningHours, setLocalOpeningHours] = useState<ListingOpeningHours>({});
  const [isDirty, setIsDirty] = useState(false);

  const permissions = useCalendarPermissions();

  // Fetch listing data for opening hours
  const { data: listingData, isLoading: isLoadingListing } = useListing(listingId);
  const listing = listingData?.data;

  // Update mutation for saving opening hours
  const updateMutation = useUpdateListing();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync local opening hours with listing data
  useEffect(() => {
    if (listing?.openingHours) {
      setLocalOpeningHours(listing.openingHours);
    }
  }, [listing]);

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Build calendar query params
  const calendarParams = useMemo(() => {
    const start = weekStart.toISOString().split('T')[0] ?? '';
    const end = weekEnd.toISOString().split('T')[0] ?? '';

    return {
      listingId,
      startDate: start,
      endDate: end,
    };
  }, [listingId, weekStart, weekEnd]);

  // Fetch calendar events
  const { data: eventsData, isLoading, refetch } = useCalendarEvents(calendarParams);
  const events = eventsData?.data ?? [];

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

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  // Opening hours handlers
  const handleDayToggle = (day: DayKey, isOpen: boolean) => {
    const newHours = { ...localOpeningHours };
    if (isOpen) {
      newHours[day] = { open: '08:00', close: '17:00' };
    } else {
      newHours[day] = null;
    }
    setLocalOpeningHours(newHours);
    setIsDirty(true);
  };

  const handleTimeChange = (day: DayKey, field: 'open' | 'close', value: string) => {
    const current = localOpeningHours[day];
    if (!current) return;

    setLocalOpeningHours({
      ...localOpeningHours,
      [day]: {
        ...current,
        [field]: value,
      },
    });
    setIsDirty(true);
  };

  const handleApplyToAll = () => {
    const newHours: ListingOpeningHours = {};
    for (const { key } of DAYS) {
      newHours[key] = { open: '08:00', close: '17:00' };
    }
    setLocalOpeningHours(newHours);
    setIsDirty(true);
  };

  const handleApplyToWeekdays = () => {
    const newHours = { ...localOpeningHours };
    const weekdays: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const day of weekdays) {
      newHours[day] = { open: '08:00', close: '17:00' };
    }
    newHours.saturday = null;
    newHours.sunday = null;
    setLocalOpeningHours(newHours);
    setIsDirty(true);
  };

  const handleClearAll = () => {
    const newHours: ListingOpeningHours = {};
    for (const { key } of DAYS) {
      newHours[key] = null;
    }
    setLocalOpeningHours(newHours);
    setIsDirty(true);
  };

  const handleSaveOpeningHours = async () => {
    try {
      await updateMutation.mutateAsync({
        id: listingId,
        data: { openingHours: localOpeningHours },
      });
      setIsDirty(false);
    } catch {
      // Error handling will be shown by the mutation
    }
  };

  const handleCancelEdit = () => {
    if (listing?.openingHours) {
      setLocalOpeningHours(listing.openingHours);
    }
    setIsDirty(false);
  };

  // Current time indicator position
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
  const renderEventCard = (event: CalendarEvent) => {
    const startStr = event.start || event.startTime;
    const endStr = event.end || event.endTime;
    if (!startStr || !endStr) return null;

    const eventStart = new Date(startStr);
    const eventEnd = new Date(endStr);
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
    const colors = getEventColor(event.status);
    const top = 48 + (startHour - 7) * 60;
    const height = Math.max((endHour - startHour) * 60 - 4, 20);

    return (
      <div
        key={event.id}
        onClick={() => setSelectedEvent(event)}
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: '2px',
          right: '2px',
          height: `${height}px`,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 'var(--ds-border-radius-sm)',
          padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
          fontSize: 'var(--ds-font-size-xs)',
          color: colors.text,
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.15s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.zIndex = '20';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.zIndex = '10';
        }}
      >
        <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: '2px' }}>
          {event.title || event.userName || 'Booking'}
        </div>
        <div style={{ fontSize: 'var(--ds-font-size-2xs)' }}>
          {eventStart.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })} -{' '}
          {eventEnd.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  if (isLoading || isLoadingListing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '400px',
        }}
      >
        <Spinner aria-label="Laster tilgjengelighet..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
            Tilgjengelighet
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            Oversikt over bookinger og blokkeringer for {listingName || 'dette lokalet'}
          </Paragraph>
        </div>
        {permissions.canCreateBlock && (
          <Button type="button" variant="primary" onClick={() => setIsCreateBlockOpen(true)}>
            <PlusIcon size={16} />
            Ny blokkering
          </Button>
        )}
      </div>

      {/* Opening Hours Section */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
          {/* Header with Toggle and Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--ds-spacing-4)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  cursor: 'pointer',
                }}
                onClick={() => setShowOpeningHours(!showOpeningHours)}
              >
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Åpningstider
                </Heading>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showOpeningHours ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                Angi standard åpningstider for lokalet
              </Paragraph>
            </div>

            {showOpeningHours && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--ds-spacing-2)',
                  flexShrink: 0,
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  data-size="sm"
                  onClick={handleApplyToWeekdays}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Ukedager
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  data-size="sm"
                  onClick={handleApplyToAll}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Alle dager
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  onClick={handleClearAll}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Nullstill
                </Button>
              </div>
            )}
          </div>

          {/* Opening Hours Grid */}
          {showOpeningHours && (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-2)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {DAYS.map(({ key, label }) => {
                  const dayHours = localOpeningHours[key];
                  const isOpen = !!dayHours;

                  return (
                    <div
                      key={key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr',
                        alignItems: 'center',
                        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                        <Checkbox
                          checked={isOpen}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDayToggle(key, e.target.checked)}
                          aria-label={`${label} åpen`}
                        />
                        <Paragraph
                          data-size="sm"
                          style={{
                            margin: 0,
                            fontWeight: 'var(--ds-font-weight-medium)',
                          }}
                        >
                          {label}
                        </Paragraph>
                      </div>

                      {isOpen && dayHours ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--ds-spacing-2)',
                          }}
                        >
                          <Select
                            value={dayHours.open}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTimeChange(key, 'open', e.target.value)}
                            data-size="sm"
                            style={{ width: '120px' }}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </Select>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>
                            til
                          </Paragraph>
                          <Select
                            value={dayHours.close}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTimeChange(key, 'close', e.target.value)}
                            data-size="sm"
                            style={{ width: '120px' }}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </Select>
                        </div>
                      ) : (
                        <Paragraph
                          data-size="sm"
                          style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                        >
                          Stengt
                        </Paragraph>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save/Cancel buttons */}
              {isDirty && (
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--ds-spacing-2)',
                    justifyContent: 'flex-end',
                    paddingTop: 'var(--ds-spacing-2)',
                    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={handleCancelEdit}
                    disabled={updateMutation.isPending}
                  >
                    Avbryt
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    data-size="sm"
                    onClick={handleSaveOpeningHours}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Lagrer...' : 'Lagre endringer'}
                  </Button>
                </div>
              )}

              {updateMutation.isError && (
                <div
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-danger-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-danger-border-default)',
                  }}
                >
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
                    Kunne ikke lagre åpningstider. Vennligst prøv igjen.
                  </Paragraph>
                </div>
              )}

              {updateMutation.isSuccess && !isDirty && (
                <div
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-success-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-success-border-default)',
                  }}
                >
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-success-text-default)', margin: 0 }}>
                    Åpningstider lagret
                  </Paragraph>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Calendar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        <Button type="button" variant="tertiary" onClick={() => navigate('prev')}>
          <ChevronLeftIcon size={16} />
        </Button>
        <Button type="button" variant="secondary" onClick={goToToday}>
          I dag
        </Button>
        <Button type="button" variant="tertiary" onClick={() => navigate('next')}>
          <ChevronRightIcon size={16} />
        </Button>
        <Heading
          level={3}
          data-size="sm"
          style={{ margin: 0, marginLeft: 'var(--ds-spacing-2)' }}
        >
          {formatWeekRange(weekStart)}
        </Heading>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        {[
          { label: 'Bekreftet', color: getEventColor('confirmed') },
          { label: 'Venter godkjenning', color: getEventColor('pending') },
          { label: 'Blokkert', color: getEventColor('blocked') },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: item.color.bg,
                border: `1px solid ${item.color.border}`,
                borderRadius: 'var(--ds-border-radius-sm)',
              }}
            />
            <Paragraph data-size="xs" style={{ margin: 0 }}>
              {item.label}
            </Paragraph>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {/* Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px repeat(7, 1fr)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <div style={{ padding: 'var(--ds-spacing-2)' }} />
              {days.map((day, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + index);
                const isToday = isCurrentDayInView(index);

                return (
                  <div
                    key={day}
                    style={{
                      padding: 'var(--ds-spacing-2)',
                      textAlign: 'center',
                      fontWeight: isToday ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                      color: isToday ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{day}</div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', marginTop: '2px' }}>
                      {dayDate.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              {/* Time Labels Column */}
              <div style={{ borderRight: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      height: '60px',
                      padding: 'var(--ds-spacing-1)',
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

              {/* Day Columns */}
              {days.map((_, dayIndex) => {
                const isToday = isCurrentDayInView(dayIndex);
                const dayEvents = eventsByDay[dayIndex] || [];

                return (
                  <div
                    key={dayIndex}
                    style={{
                      position: 'relative',
                      borderRight:
                        dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                      backgroundColor: isToday
                        ? 'var(--ds-color-accent-surface-subtle)'
                        : 'transparent',
                    }}
                  >
                    {/* Hour Slots */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{
                          height: '60px',
                          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                        }}
                      />
                    ))}

                    {/* Current Time Indicator */}
                    {isToday && currentTimePosition && (
                      <div
                        style={{
                          position: 'absolute',
                          top: `${currentTimePosition}px`,
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: 'var(--ds-color-danger-border-default)',
                          zIndex: 30,
                          pointerEvents: 'none',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: 'calc(-1 * var(--ds-spacing-1))',
                            top: 'calc(-1 * var(--ds-spacing-1))',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--ds-color-danger-border-default)',
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
        </div>
      </Card>

      {/* Info Card */}
      <Card
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-subtle)',
          border: '1px solid var(--ds-color-info-border-subtle)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          <strong>Tips:</strong> Klikk på en hendelse for å se detaljer eller administrere bookingen.
          {permissions.canCreateBlock &&
            ' Bruk "Ny blokkering" knappen for å blokkere tidsperioder når lokalet ikke er tilgjengelig.'}
        </Paragraph>
      </Card>

      {/* Modals */}
      <CreateBlockModal
        isOpen={isCreateBlockOpen}
        onClose={() => setIsCreateBlockOpen(false)}
        initialListingId={listingId}
        onSuccess={() => {
          refetch();
        }}
      />

      <EventDrawer
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
