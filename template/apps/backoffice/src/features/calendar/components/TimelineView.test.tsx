import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TimelineView } from './TimelineView';
import type { CalendarEvent, Listing } from '@xaheen/sdk';

const mockListings: Listing[] = [
  { id: 'listing-1', name: 'Møterom A', status: 'published' } as Listing,
  { id: 'listing-2', name: 'Møterom B', status: 'published' } as Listing,
];

const mockEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    listingId: 'listing-1',
    startTime: new Date('2026-01-14T10:00:00'),
    endTime: new Date('2026-01-14T11:00:00'),
    title: 'Møte 1',
    status: 'confirmed',
  } as CalendarEvent,
];

describe('TimelineView', () => {
  it('should render timeline with resource lanes', () => {
    render(
      <TimelineView
        events={mockEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('Møterom A')).toBeInTheDocument();
    expect(screen.getByText('Møterom B')).toBeInTheDocument();
  });

  it('should render time axis with hours', () => {
    render(
      <TimelineView
        events={mockEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('07:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  it('should render events in correct lanes', () => {
    render(
      <TimelineView
        events={mockEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('Møte 1')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <TimelineView
        events={[]}
        listings={[]}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
        isLoading={true}
      />
    );

    expect(screen.getByLabelText('Laster tidslinje...')).toBeInTheDocument();
  });

  it('should show empty state when no listings', () => {
    render(
      <TimelineView
        events={[]}
        listings={[]}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText(/ingen lokaler tilgjengelig/i)).toBeInTheDocument();
  });

  it('should call onEventClick when event is clicked', () => {
    const mockOnEventClick = vi.fn();

    render(
      <TimelineView
        events={mockEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
        onEventClick={mockOnEventClick}
      />
    );

    fireEvent.click(screen.getByText('Møte 1'));
    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('should render event times when width is sufficient', () => {
    render(
      <TimelineView
        events={mockEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    // Event times should be visible (10:00 - 11:00)
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it('should render Lokaler header', () => {
    render(
      <TimelineView
        events={mockEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('Lokaler')).toBeInTheDocument();
  });

  it('should display capacity if available', () => {
    const listingsWithCapacity: Listing[] = [
      { id: 'listing-1', name: 'Møterom A', status: 'published', capacity: 10 } as Listing,
    ];

    render(
      <TimelineView
        events={[]}
        listings={listingsWithCapacity}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('Kap: 10')).toBeInTheDocument();
  });

  it('should render multiple events in the same lane', () => {
    const multipleEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T10:00:00'),
        endTime: new Date('2026-01-14T11:00:00'),
        title: 'Møte 1',
        status: 'confirmed',
      } as CalendarEvent,
      {
        id: 'event-2',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T14:00:00'),
        endTime: new Date('2026-01-14T15:00:00'),
        title: 'Møte 2',
        status: 'confirmed',
      } as CalendarEvent,
    ];

    render(
      <TimelineView
        events={multipleEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('Møte 1')).toBeInTheDocument();
    expect(screen.getByText('Møte 2')).toBeInTheDocument();
  });

  it('should show conflict indicators for overlapping events', () => {
    const overlappingEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T10:00:00'),
        endTime: new Date('2026-01-14T12:00:00'),
        title: 'Møte 1',
        status: 'confirmed',
      } as CalendarEvent,
      {
        id: 'event-2',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T11:00:00'),
        endTime: new Date('2026-01-14T13:00:00'),
        title: 'Møte 2',
        status: 'confirmed',
      } as CalendarEvent,
    ];

    render(
      <TimelineView
        events={overlappingEvents}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    // Conflict indicators should be visible
    const conflictIcons = screen.queryAllByLabelText('Konflikt');
    expect(conflictIcons.length).toBeGreaterThan(0);
  });

  it('should render fallback title when event has no title', () => {
    const eventWithoutTitle: CalendarEvent[] = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T10:00:00'),
        endTime: new Date('2026-01-14T11:00:00'),
        status: 'confirmed',
      } as CalendarEvent,
    ];

    render(
      <TimelineView
        events={eventWithoutTitle}
        listings={mockListings}
        dateRange={{ start: new Date('2026-01-14'), end: new Date('2026-01-14') }}
      />
    );

    expect(screen.getByText('Booking')).toBeInTheDocument();
  });
});
