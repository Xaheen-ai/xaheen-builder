/**
 * Realtime Calendar Hook
 * Subscribes to real-time booking events and auto-refreshes calendar data
 */

import { useState, useCallback, useRef } from 'react';
import { useRealtimeCalendar as useSDKRealtimeCalendar } from '@xaheen/sdk';
import type { RealtimeEvent } from '@xaheen/sdk';

export interface RealtimeCalendarOptions {
  /** Whether to enable realtime updates */
  enabled?: boolean;
  /** Custom handler for booking events */
  onBookingEvent?: (event: RealtimeEvent) => void;
  /** Whether to track update timestamps */
  trackUpdates?: boolean;
}

/**
 * Hook for subscribing to real-time calendar updates
 * Wraps the SDK's useRealtimeCalendar hook and provides additional tracking
 */
export function useRealtimeCalendar(options: RealtimeCalendarOptions = {}) {
  const { enabled = true, onBookingEvent, trackUpdates = true } = options;

  // Track last update timestamp
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // Use ref to avoid stale closure in handler
  const handlerRef = useRef(onBookingEvent);
  handlerRef.current = onBookingEvent;

  // Custom handler to track updates and call user handler
  const handleBookingEvent = useCallback(
    (event: RealtimeEvent) => {
      if (!enabled) return;

      // Track update timestamp
      if (trackUpdates) {
        setLastUpdate(new Date());
        setUpdateCount((prev) => prev + 1);
      }

      // Call custom handler if provided
      handlerRef.current?.(event);
    },
    [enabled, trackUpdates]
  );

  // Subscribe to realtime calendar events via SDK
  // This automatically invalidates calendar-related queries
  useSDKRealtimeCalendar(enabled ? handleBookingEvent : undefined);

  // Reset update tracking
  const resetTracking = useCallback(() => {
    setLastUpdate(null);
    setUpdateCount(0);
  }, []);

  return {
    /** Timestamp of last realtime update */
    lastUpdate,
    /** Number of updates received since mount or last reset */
    updateCount,
    /** Whether realtime updates are enabled */
    isEnabled: enabled,
    /** Reset update tracking counters */
    resetTracking,
    /** Whether any updates have been received */
    hasUpdates: updateCount > 0,
  };
}

export type RealtimeCalendarReturn = ReturnType<typeof useRealtimeCalendar>;
