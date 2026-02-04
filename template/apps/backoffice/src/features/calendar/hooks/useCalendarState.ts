/**
 * Calendar State Hook
 * Manages calendar view state, navigation, and filters
 */

import { useState, useMemo, useCallback } from 'react';
import type { CalendarViewType, CalendarFilters } from '../types';
import type { CalendarEvent } from '@xaheen/sdk';

interface CalendarStateOptions {
  initialView?: CalendarViewType;
  initialDate?: Date;
  initialListing?: string;
}

export function useCalendarState(options: CalendarStateOptions = {}) {
  const { initialView = 'week', initialDate = new Date(), initialListing } = options;

  // View state
  const [view, setView] = useState<CalendarViewType>(initialView);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedListing, setSelectedListing] = useState<string | undefined>(initialListing);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filters
  const [filters, setFilters] = useState<CalendarFilters>({
    showBlocks: true,
    showBookings: true,
    showMaintenance: true,
  });

  // Compute week start (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [currentDate]);

  // Compute week end (Sunday)
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Compute month start
  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  // Compute month end
  const monthEnd = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Get date range based on current view
  const dateRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (view) {
      case 'day':
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start = monthStart;
        end = monthEnd;
        break;
      case 'week':
      default:
        start = weekStart;
        end = weekEnd;
        break;
    }

    return { start, end };
  }, [view, currentDate, weekStart, weekEnd, monthStart, monthEnd]);

  // Calendar query params for API
  const calendarParams = useMemo(() => {
    const params: { listingId?: string; startDate: string; endDate: string } = {
      startDate: dateRange.start.toISOString().split('T')[0] ?? '',
      endDate: dateRange.end.toISOString().split('T')[0] ?? '',
    };
    if (selectedListing) {
      params.listingId = selectedListing;
    }
    return params;
  }, [dateRange, selectedListing]);

  // Navigation functions
  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        const offset = direction === 'next' ? 1 : -1;

        switch (view) {
          case 'day':
            newDate.setDate(newDate.getDate() + offset);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() + offset * 7);
            break;
          case 'month':
            newDate.setMonth(newDate.getMonth() + offset);
            break;
        }

        return newDate;
      });
    },
    [view]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Check if a date is in the current view
  const isDateInView = useCallback(
    (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    },
    [dateRange]
  );

  // Check if today is in the current view
  const isTodayInView = useMemo(() => {
    return isDateInView(new Date());
  }, [isDateInView]);

  // Format title based on view
  const getViewTitle = useCallback(() => {
    const monthNames = [
      'Januar',
      'Februar',
      'Mars',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    switch (view) {
      case 'day':
        return currentDate.toLocaleDateString('nb-NO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      case 'week': {
        const startMonth = weekStart.getMonth();
        const endMonth = weekEnd.getMonth();
        if (startMonth === endMonth) {
          return `${weekStart.getDate()}. - ${weekEnd.getDate()}. ${monthNames[startMonth]} ${weekStart.getFullYear()}`;
        }
        return `${weekStart.getDate()}. ${monthNames[startMonth]} - ${weekEnd.getDate()}. ${monthNames[endMonth]} ${weekEnd.getFullYear()}`;
      }
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      default:
        return '';
    }
  }, [view, currentDate, weekStart, weekEnd]);

  return {
    // State
    view,
    currentDate,
    selectedListing,
    selectedEvent,
    filters,

    // Computed
    weekStart,
    weekEnd,
    monthStart,
    monthEnd,
    dateRange,
    calendarParams,
    isTodayInView,

    // Setters
    setView,
    setCurrentDate,
    setSelectedListing,
    setSelectedEvent,
    setFilters,

    // Actions
    navigate,
    goToToday,
    goToDate,
    isDateInView,
    getViewTitle,
  };
}

export type CalendarStateReturn = ReturnType<typeof useCalendarState>;
