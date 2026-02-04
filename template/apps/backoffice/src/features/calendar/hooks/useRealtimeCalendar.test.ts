import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { useRealtimeCalendar } from './useRealtimeCalendar';
import * as clientSDK from '@xaheen/sdk';

// Mock the SDK hook
vi.mock('@xaheen/sdk', () => ({
  useRealtimeCalendar: vi.fn(),
}));

describe('useRealtimeCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation(() => {});

    const { result } = renderHook(() => useRealtimeCalendar());

    expect(result.current.lastUpdate).toBeNull();
    expect(result.current.updateCount).toBe(0);
    expect(result.current.hasUpdates).toBe(false);
  });

  it('should track updates when booking events occur', async () => {
    let eventHandler: ((event: any) => void) | undefined;

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation((handler) => {
      eventHandler = handler;
    });

    const { result } = renderHook(() =>
      useRealtimeCalendar({ enabled: true, trackUpdates: true })
    );

    // Simulate booking event
    act(() => {
      eventHandler?.({ type: 'booking:created', data: {} });
    });

    await waitFor(() => {
      expect(result.current.updateCount).toBe(1);
      expect(result.current.hasUpdates).toBe(true);
      expect(result.current.lastUpdate).toBeInstanceOf(Date);
    });
  });

  it('should call custom handler when provided', async () => {
    let eventHandler: ((event: any) => void) | undefined;
    const mockCustomHandler = vi.fn();

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation((handler) => {
      eventHandler = handler;
    });

    renderHook(() =>
      useRealtimeCalendar({
        enabled: true,
        onBookingEvent: mockCustomHandler,
      })
    );

    // Simulate booking event
    const mockEvent = { type: 'booking:created', data: {} };
    act(() => {
      eventHandler?.(mockEvent);
    });

    await waitFor(() => {
      expect(mockCustomHandler).toHaveBeenCalledWith(mockEvent);
    });
  });

  it('should reset tracking when resetTracking is called', async () => {
    let eventHandler: ((event: any) => void) | undefined;

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation((handler) => {
      eventHandler = handler;
    });

    const { result } = renderHook(() =>
      useRealtimeCalendar({ enabled: true, trackUpdates: true })
    );

    // Simulate booking event
    act(() => {
      eventHandler?.({ type: 'booking:created', data: {} });
    });

    await waitFor(() => {
      expect(result.current.updateCount).toBe(1);
    });

    // Reset tracking
    act(() => {
      result.current.resetTracking();
    });

    expect(result.current.lastUpdate).toBeNull();
    expect(result.current.updateCount).toBe(0);
    expect(result.current.hasUpdates).toBe(false);
  });

  it('should not track updates when trackUpdates is false', async () => {
    let eventHandler: ((event: any) => void) | undefined;

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation((handler) => {
      eventHandler = handler;
    });

    const { result } = renderHook(() =>
      useRealtimeCalendar({ enabled: true, trackUpdates: false })
    );

    // Simulate booking event
    act(() => {
      eventHandler?.({ type: 'booking:created', data: {} });
    });

    // Should not track
    expect(result.current.updateCount).toBe(0);
    expect(result.current.hasUpdates).toBe(false);
  });

  it('should not subscribe when enabled is false', () => {
    const mockSDKHook = vi.fn();
    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation(mockSDKHook);

    renderHook(() => useRealtimeCalendar({ enabled: false }));

    // Should be called with undefined handler (disabled)
    expect(mockSDKHook).toHaveBeenCalledWith(undefined);
  });

  it('should report enabled status correctly', () => {
    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation(() => {});

    const { result: result1 } = renderHook(() =>
      useRealtimeCalendar({ enabled: true })
    );
    expect(result1.current.isEnabled).toBe(true);

    const { result: result2 } = renderHook(() =>
      useRealtimeCalendar({ enabled: false })
    );
    expect(result2.current.isEnabled).toBe(false);
  });

  it('should handle multiple consecutive events', async () => {
    let eventHandler: ((event: any) => void) | undefined;

    (clientSDK.useRealtimeCalendar as ReturnType<typeof vi.fn>).mockImplementation((handler) => {
      eventHandler = handler;
    });

    const { result } = renderHook(() =>
      useRealtimeCalendar({ enabled: true, trackUpdates: true })
    );

    // Simulate multiple booking events
    act(() => {
      eventHandler?.({ type: 'booking:created', data: {} });
      eventHandler?.({ type: 'booking:updated', data: {} });
      eventHandler?.({ type: 'booking:deleted', data: {} });
    });

    await waitFor(() => {
      expect(result.current.updateCount).toBe(3);
      expect(result.current.hasUpdates).toBe(true);
    });
  });
});
