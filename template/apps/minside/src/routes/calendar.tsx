import { useState, useMemo } from 'react';
import { Card, Heading, Paragraph, Button, Spinner, ChevronLeftIcon, ChevronRightIcon } from '@xaheen/ds';
import { useMyBookings, type Booking, formatWeekRange } from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
  return new Date(d.setDate(diff));
}

function getBookingColor(status: string) {
  switch (status) {
    case 'confirmed':
      return { bg: 'var(--ds-color-success-surface-default)', border: 'var(--ds-color-success-border-default)', text: 'var(--ds-color-success-text-default)' };
    case 'pending':
      return { bg: 'var(--ds-color-warning-surface-default)', border: 'var(--ds-color-warning-border-default)', text: 'var(--ds-color-warning-text-default)' };
    case 'cancelled':
      return { bg: 'var(--ds-color-neutral-surface-hover)', border: 'var(--ds-color-neutral-border-default)', text: 'var(--ds-color-neutral-text-subtle)' };
    default:
      return { bg: 'var(--ds-color-accent-surface-default)', border: 'var(--ds-color-accent-border-default)', text: 'var(--ds-color-accent-text-default)' };
  }
}

export function CalendarPage() {
  const t = useT();
  const { locale } = useLocale();
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = locale === 'en' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Fetch user's bookings for the current week
  const { data: bookingsData, isLoading } = useMyBookings();
  const allBookings = bookingsData?.data ?? [];

  // Filter bookings for current week
  const weekBookings = useMemo(() => {
    return allBookings.filter((booking: Booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= weekStart && bookingDate <= weekEnd;
    });
  }, [allBookings, weekStart, weekEnd]);

  // Transform bookings to day index
  const bookingsByDay = useMemo(() => {
    const byDay: Record<number, Booking[]> = {};
    weekBookings.forEach((booking: Booking) => {
      const bookingDate = new Date(booking.startTime);
      const dayOfWeek = bookingDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
      if (!byDay[adjustedDay]) byDay[adjustedDay] = [];
      byDay[adjustedDay].push(booking);
    });
    return byDay;
  }, [weekBookings]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('minside.myCalendar')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('minside.myCalendarDesc')}
        </Paragraph>
      </div>

      {/* Calendar Controls */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigateWeek('prev')} aria-label={t('calendar.previous_week') || 'Previous week'}>
              <ChevronLeftIcon />
            </Button>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigateWeek('next')} aria-label={t('calendar.next_week') || 'Next week'}>
              <ChevronRightIcon />
            </Button>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {formatWeekRange(weekStart)}
            </Heading>
            <Button type="button" variant="secondary" data-size="sm" onClick={goToToday}>
              {t('calendar.today')}
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-success-surface-default)', border: '1px solid var(--ds-color-success-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{t('booking.confirmed')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-warning-surface-default)', border: '1px solid var(--ds-color-warning-border-default)' }} />
              <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{t('requests.pending')}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Week View Calendar Grid */}
      <Card style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner aria-label="Loading" data-size="md" />
          </div>
        ) : (
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
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', overflow: 'auto' }}>
              {days.map((day, dayIndex) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + dayIndex);
                const isToday = dayDate.toDateString() === new Date().toDateString();
                const dayBookings = bookingsByDay[dayIndex] ?? [];

                return (
                  <div key={day} style={{ borderRight: dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined, position: 'relative' }}>
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
                      <div style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: isToday ? 'var(--ds-font-weight-bold)' : 'var(--ds-font-weight-medium)', color: isToday ? 'var(--ds-color-accent-text-default)' : undefined }}>
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

                    {/* Bookings */}
                    {dayBookings.map((booking: Booking) => {
                      const bookingStart = new Date(booking.startTime);
                      const bookingEnd = new Date(booking.endTime);
                      const startHour = bookingStart.getHours() + bookingStart.getMinutes() / 60;
                      const endHour = bookingEnd.getHours() + bookingEnd.getMinutes() / 60;
                      const colors = getBookingColor(booking.status);
                      const top = 48 + (startHour - 7) * 60;
                      const height = Math.max((endHour - startHour) * 60 - 4, 20);

                      return (
                        <div
                          key={booking.id}
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
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                        >
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
                            {booking.listingName || 'Booking'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {weekBookings.length === 0 && !isLoading && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('calendar.noBookingsThisWeek')}
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
