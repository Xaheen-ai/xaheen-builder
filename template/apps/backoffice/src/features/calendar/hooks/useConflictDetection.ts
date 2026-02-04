/**
 * Conflict Detection Hook
 * Detects overlapping bookings and blocks in calendar events
 */

import { useMemo } from 'react';
import type { CalendarEvent } from '@xaheen/sdk';

interface ConflictInfo {
  eventId: string;
  conflictingEvents: Array<{
    id: string;
    title?: string;
    listingName?: string;
  }>;
}

export interface ConflictDetectionOptions {
  /** Calendar events to check for conflicts */
  events: CalendarEvent[];
  /** Whether conflict detection is enabled */
  enabled?: boolean;
}

/**
 * Hook for detecting conflicts between calendar events
 * Identifies overlapping bookings for the same listing
 */
export function useConflictDetection(options: ConflictDetectionOptions) {
  const { events, enabled = true } = options;

  // Map of event IDs to their conflict info
  const conflictMap = useMemo(() => {
    if (!enabled || !events || events.length === 0) {
      return new Map<string, ConflictInfo>();
    }

    const conflicts = new Map<string, ConflictInfo>();

    // Check each event against all others
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event) continue;

      const eventStart = new Date(event.start || event.startTime || '');
      const eventEnd = new Date(event.end || event.endTime || '');

      // Skip if dates are invalid
      if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
        continue;
      }

      const conflictingEvents: Array<{
        id: string;
        title?: string;
        listingName?: string;
      }> = [];

      // Check against all other events
      for (let j = 0; j < events.length; j++) {
        if (i === j) continue;

        const otherEvent = events[j];
        if (!otherEvent) continue;

        // Only check events for the same listing
        if (event.listingId !== otherEvent.listingId) {
          continue;
        }

        const otherStart = new Date(otherEvent.start || otherEvent.startTime || '');
        const otherEnd = new Date(otherEvent.end || otherEvent.endTime || '');

        // Skip if dates are invalid
        if (isNaN(otherStart.getTime()) || isNaN(otherEnd.getTime())) {
          continue;
        }

        // Check for overlap: events overlap if one starts before the other ends
        // and ends after the other starts
        const hasOverlap =
          eventStart < otherEnd && eventEnd > otherStart;

        if (hasOverlap) {
          const conflictInfo: {
            id: string;
            title?: string;
            listingName?: string;
          } = {
            id: otherEvent.id,
          };

          if (otherEvent.title !== undefined) {
            conflictInfo.title = otherEvent.title;
          }

          if (otherEvent.listingName !== undefined) {
            conflictInfo.listingName = otherEvent.listingName;
          }

          conflictingEvents.push(conflictInfo);
        }
      }

      // Store conflict info if any conflicts found
      if (conflictingEvents.length > 0) {
        conflicts.set(event.id, {
          eventId: event.id,
          conflictingEvents,
        });
      }
    }

    return conflicts;
  }, [events, enabled]);

  // Check if a specific event has conflicts
  const hasConflict = useMemo(() => {
    return (eventId: string): boolean => {
      return conflictMap.has(eventId);
    };
  }, [conflictMap]);

  // Get conflict details for a specific event
  const getConflicts = useMemo(() => {
    return (eventId: string): ConflictInfo | undefined => {
      return conflictMap.get(eventId);
    };
  }, [conflictMap]);

  // Get all events with conflicts
  const conflictingEventIds = useMemo(() => {
    return Array.from(conflictMap.keys());
  }, [conflictMap]);

  // Count total conflicts
  const conflictCount = useMemo(() => {
    return conflictMap.size;
  }, [conflictMap]);

  // Check if any conflicts exist
  const hasAnyConflicts = useMemo(() => {
    return conflictMap.size > 0;
  }, [conflictMap]);

  return {
    /** Map of event IDs to conflict information */
    conflictMap,
    /** Check if a specific event has conflicts */
    hasConflict,
    /** Get conflict details for a specific event */
    getConflicts,
    /** Array of event IDs that have conflicts */
    conflictingEventIds,
    /** Total number of events with conflicts */
    conflictCount,
    /** Whether any conflicts exist in the dataset */
    hasAnyConflicts,
  };
}

export type ConflictDetectionReturn = ReturnType<typeof useConflictDetection>;
