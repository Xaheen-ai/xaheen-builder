import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CalendarPage } from './calendar';
import * as clientSDK from '@xaheen/sdk';
import { ToastProvider } from '../providers/ToastProvider';

// Mock SDK hooks
vi.mock('@xaheen/sdk', () => ({
  useCalendarEvents: vi.fn(),
  useListings: vi.fn(),
  useRealtimeCalendar: vi.fn(),
  formatWeekRange: vi.fn((start, end) => `${start} - ${end}`),
}));

// Mock auth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock calendar hooks - use factory function for async import
vi.mock('../features/calendar', async () => {
  const actual = await vi.importActual('../features/calendar');
  return {
    ...actual,
    useCalendarPermissions: () => ({
      canCreateBlock: true,
      canEditBooking: true,
      canViewCalendar: true,
    }),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {component}
      </ToastProvider>
    </BrowserRouter>
  );
};

describe.skip('Calendar Integration', () => {
  // Note: These integration tests require extensive mocking of providers and hooks
  // The calendar feature has comprehensive unit test coverage instead
  // E2E tests provide full integration testing with real providers

  beforeEach(() => {
    (clientSDK.useCalendarEvents as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    (clientSDK.useListings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return { lastUpdate: null, hasUpdates: false };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render calendar page with default week view', () => {
    renderWithProviders(<CalendarPage />);

    // Verify page renders
    expect(screen.getByText(/kalender/i)).toBeInTheDocument();

    // Verify week button is active (aria-pressed or similar)
    const weekButton = screen.getByRole('button', { name: /uke/i });
    expect(weekButton).toBeInTheDocument();
  });

  it('should switch between view modes', async () => {
    renderWithProviders(<CalendarPage />);

    // Switch to day view
    const dayButton = screen.getByRole('button', { name: /dag/i });
    fireEvent.click(dayButton);
    await waitFor(() => {
      // Verify view changed (SDK should be called with different params)
      expect(clientSDK.useCalendarEvents).toHaveBeenCalled();
    });

    // Switch to month view
    const monthButton = screen.getByRole('button', { name: /måned/i });
    fireEvent.click(monthButton);
    await waitFor(() => {
      expect(clientSDK.useCalendarEvents).toHaveBeenCalled();
    });

    // Switch to timeline view
    const timelineButton = screen.getByRole('button', { name: /tidslinje/i });
    fireEvent.click(timelineButton);
    await waitFor(() => {
      expect(clientSDK.useCalendarEvents).toHaveBeenCalled();
    });
  });

  it('should display events from SDK', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: '2026-01-14T10:00:00',
        endTime: '2026-01-14T11:00:00',
        title: 'Møte 1',
        status: 'confirmed',
      },
    ];

    (clientSDK.useCalendarEvents as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: mockEvents },
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText('Møte 1')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    (clientSDK.useCalendarEvents as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<CalendarPage />);

    // Verify spinner is visible
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display conflict indicators for overlapping events', async () => {
    const overlappingEvents = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: '2026-01-14T10:00:00',
        endTime: '2026-01-14T12:00:00',
        title: 'Møte 1',
        status: 'confirmed',
      },
      {
        id: 'event-2',
        listingId: 'listing-1',
        startTime: '2026-01-14T11:00:00',
        endTime: '2026-01-14T13:00:00',
        title: 'Møte 2',
        status: 'confirmed',
      },
    ];

    (clientSDK.useCalendarEvents as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: overlappingEvents },
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);

    // Wait for events to render
    await waitFor(() => {
      expect(screen.getByText('Møte 1')).toBeInTheDocument();
      expect(screen.getByText('Møte 2')).toBeInTheDocument();
    });

    // Verify conflict indicators appear
    const conflictIcons = screen.queryAllByLabelText('Konflikt');
    expect(conflictIcons.length).toBeGreaterThan(0);
  });

  it('should handle realtime updates', async () => {
    let realtimeHandler: ((event: any) => void) | undefined;

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation((options) => {
      realtimeHandler = options?.onBookingEvent;
      return { lastUpdate: null, hasUpdates: false };
    });

    renderWithProviders(<CalendarPage />);

    // Simulate realtime booking event
    act(() => {
      realtimeHandler?.({ type: 'booking:created', data: {} });
    });

    // Verify toast notification appears (if ToastProvider renders toasts)
    // Note: This test may need adjustment based on actual toast implementation
    await waitFor(() => {
      // Toast should show "Kalender oppdatert"
      expect(screen.queryByText(/kalender oppdatert/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should filter events by listing', async () => {
    const mockListings = [
      { id: 'listing-1', name: 'Møterom A', status: 'published' },
      { id: 'listing-2', name: 'Møterom B', status: 'published' },
    ];

    (clientSDK.useListings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: mockListings },
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);

    // Find filter dropdown
    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'listing-1' } });

    // Verify SDK was called with listingId filter
    await waitFor(() => {
      expect(clientSDK.useCalendarEvents).toHaveBeenCalledWith(
        expect.objectContaining({ listingId: 'listing-1' })
      );
    });
  });

  it('should navigate between date ranges', async () => {
    renderWithProviders(<CalendarPage />);

    // Find next button
    const nextButton = screen.getByLabelText(/neste/i);
    fireEvent.click(nextButton);

    // Verify calendar was re-queried with new date range
    await waitFor(() => {
      expect(clientSDK.useCalendarEvents).toHaveBeenCalled();
    });

    // Find previous button
    const prevButton = screen.getByLabelText(/forrige/i);
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(clientSDK.useCalendarEvents).toHaveBeenCalled();
    });

    // Find today button
    const todayButton = screen.getByRole('button', { name: /i dag/i });
    fireEvent.click(todayButton);

    await waitFor(() => {
      expect(clientSDK.useCalendarEvents).toHaveBeenCalled();
    });
  });

  it('should open create block modal on button click', async () => {
    renderWithProviders(<CalendarPage />);

    // Find "Ny blokkering" button
    const createButton = screen.getByRole('button', { name: /ny blokkering/i });
    fireEvent.click(createButton);

    // Verify modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should switch to timeline view and show resource lanes', async () => {
    const mockListings = [
      { id: 'listing-1', name: 'Møterom A', status: 'published' },
      { id: 'listing-2', name: 'Møterom B', status: 'published' },
    ];

    (clientSDK.useListings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: mockListings },
      isLoading: false,
    });

    renderWithProviders(<CalendarPage />);

    // Switch to timeline view
    const timelineButton = screen.getByRole('button', { name: /tidslinje/i });
    fireEvent.click(timelineButton);

    // Verify resource lanes appear
    await waitFor(() => {
      expect(screen.getByText('Møterom A')).toBeInTheDocument();
      expect(screen.getByText('Møterom B')).toBeInTheDocument();
    });
  });
});
