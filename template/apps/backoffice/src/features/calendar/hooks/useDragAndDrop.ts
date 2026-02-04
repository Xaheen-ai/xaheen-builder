/**
 * Drag and Drop Hook
 * Manages drag-and-drop interactions for creating bookings on the calendar grid
 */

import { useState, useCallback, useMemo, useRef } from 'react';

interface DragPosition {
  x: number;
  y: number;
  time: Date;
  listingId?: string;
}

interface DragState {
  isDragging: boolean;
  startPosition: DragPosition | null;
  currentPosition: DragPosition | null;
}

interface DragAndDropOptions {
  /** Start hour for the calendar grid (default: 7) */
  startHour?: number;
  /** End hour for the calendar grid (default: 21) */
  endHour?: number;
  /** Height of each hour slot in pixels (default: 60) */
  hourHeight?: number;
  /** Offset from top for header (default: 48) */
  headerOffset?: number;
  /** Minimum drag duration in minutes (default: 30) */
  minDurationMinutes?: number;
  /** Snap to interval in minutes (default: 15) */
  snapIntervalMinutes?: number;
  /** Callback when drag completes */
  onDragComplete?: (params: {
    startTime: Date;
    endTime: Date;
    listingId?: string;
  }) => void;
}

interface DragHandlers {
  onMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseUp: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
}

interface DragPreview {
  visible: boolean;
  top: number;
  height: number;
  startTime: Date | null;
  endTime: Date | null;
  listingId?: string;
}

export function useDragAndDrop(options: DragAndDropOptions = {}) {
  const {
    startHour = 7,
    endHour = 21,
    hourHeight = 60,
    headerOffset = 48,
    minDurationMinutes = 30,
    snapIntervalMinutes = 15,
    onDragComplete,
  } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: null,
    currentPosition: null,
  });

  const dragContainerRef = useRef<HTMLElement | null>(null);

  /**
   * Calculate time from Y position on the calendar grid
   */
  const calculateTimeFromY = useCallback(
    (y: number, date: Date): Date => {
      // Adjust for header offset
      const adjustedY = Math.max(0, y - headerOffset);

      // Calculate hour offset from Y position
      const hourOffset = adjustedY / hourHeight;
      const totalHour = startHour + hourOffset;

      // Snap to interval
      const totalMinutes = totalHour * 60;
      const snappedMinutes =
        Math.round(totalMinutes / snapIntervalMinutes) * snapIntervalMinutes;

      // Create date with calculated time
      const result = new Date(date.getTime());
      result.setHours(0, 0, 0, 0);
      result.setMinutes(snappedMinutes);

      return result;
    },
    [startHour, hourHeight, headerOffset, snapIntervalMinutes]
  );

  /**
   * Extract listing ID from the target element or its parents
   */
  const extractListingId = useCallback((element: HTMLElement): string | undefined => {
    let current: HTMLElement | null = element;
    while (current) {
      const listingId = current.dataset.listingId;
      if (listingId) {
        return listingId;
      }
      current = current.parentElement;
    }
    return undefined;
  }, []);

  /**
   * Extract date from the target element or its parents
   */
  const extractDate = useCallback((element: HTMLElement): Date | null => {
    let current: HTMLElement | null = element;
    while (current) {
      const dateStr = current.dataset.date;
      if (dateStr) {
        return new Date(dateStr);
      }
      current = current.parentElement;
    }
    return null;
  }, []);

  /**
   * Handle mouse down - start dragging
   */
  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const date = extractDate(target) || new Date();
      const time = calculateTimeFromY(y, date);
      const listingId = extractListingId(target);

      dragContainerRef.current = target;

      setDragState({
        isDragging: true,
        startPosition: {
          x: event.clientX,
          y,
          time,
          listingId,
        },
        currentPosition: {
          x: event.clientX,
          y,
          time,
          listingId,
        },
      });

      // Prevent text selection during drag
      event.preventDefault();
    },
    [calculateTimeFromY, extractDate, extractListingId]
  );

  /**
   * Handle mouse move - update drag position
   */
  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!dragState.isDragging || !dragState.startPosition) return;

      const target = dragContainerRef.current || event.currentTarget;
      const rect = target.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const date = extractDate(target) || dragState.startPosition.time;
      const time = calculateTimeFromY(y, date);
      const listingId = extractListingId(target) || dragState.startPosition.listingId;

      setDragState((prev) => ({
        ...prev,
        currentPosition: {
          x: event.clientX,
          y,
          time,
          listingId,
        },
      }));
    },
    [dragState.isDragging, dragState.startPosition, calculateTimeFromY, extractDate, extractListingId]
  );

  /**
   * Handle mouse up - complete dragging
   */
  const onMouseUp = useCallback(
    (_event: React.MouseEvent<HTMLElement>) => {
      if (!dragState.isDragging || !dragState.startPosition || !dragState.currentPosition) {
        setDragState({
          isDragging: false,
          startPosition: null,
          currentPosition: null,
        });
        return;
      }

      const { startPosition, currentPosition } = dragState;

      // Calculate start and end times (ensure start is before end)
      let startTime = startPosition.time;
      let endTime = currentPosition.time;

      if (startTime > endTime) {
        [startTime, endTime] = [endTime, startTime];
      }

      // Ensure minimum duration
      const durationMs = endTime.getTime() - startTime.getTime();
      const minDurationMs = minDurationMinutes * 60 * 1000;
      if (durationMs < minDurationMs) {
        endTime = new Date(startTime.getTime() + minDurationMs);
      }

      // Constrain to calendar bounds
      const maxTime = new Date(startTime.getTime());
      maxTime.setHours(endHour, 0, 0, 0);
      if (endTime > maxTime) {
        endTime = maxTime;
      }

      // Call completion callback
      if (onDragComplete) {
        onDragComplete({
          startTime,
          endTime,
          listingId: startPosition.listingId,
        });
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        startPosition: null,
        currentPosition: null,
      });
      dragContainerRef.current = null;
    },
    [dragState, minDurationMinutes, endHour, onDragComplete]
  );

  /**
   * Handle mouse leave - cancel dragging
   */
  const onMouseLeave = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // Only cancel if leaving the main container (not child elements)
    if (event.currentTarget === event.target) {
      setDragState({
        isDragging: false,
        startPosition: null,
        currentPosition: null,
      });
      dragContainerRef.current = null;
    }
  }, []);

  /**
   * Calculate drag preview position and dimensions
   */
  const dragPreview = useMemo((): DragPreview => {
    if (!dragState.isDragging || !dragState.startPosition || !dragState.currentPosition) {
      return {
        visible: false,
        top: 0,
        height: 0,
        startTime: null,
        endTime: null,
      };
    }

    const { startPosition, currentPosition } = dragState;

    // Calculate Y positions (currently unused but kept for future enhancements)
    // const startY = Math.min(startPosition.y, currentPosition.y);
    // const endY = Math.max(startPosition.y, currentPosition.y);

    // Calculate time range
    const startTime = new Date(Math.min(startPosition.time.getTime(), currentPosition.time.getTime()));
    let endTime = new Date(Math.max(startPosition.time.getTime(), currentPosition.time.getTime()));

    // Ensure minimum duration
    const durationMs = endTime.getTime() - startTime.getTime();
    const minDurationMs = minDurationMinutes * 60 * 1000;
    if (durationMs < minDurationMs) {
      endTime = new Date(startTime.getTime() + minDurationMs);
    }

    // Calculate pixel positions from times
    const startHourFloat = startTime.getHours() + startTime.getMinutes() / 60;
    const endHourFloat = endTime.getHours() + endTime.getMinutes() / 60;
    const top = headerOffset + (startHourFloat - startHour) * hourHeight;
    const height = Math.max((endHourFloat - startHourFloat) * hourHeight, hourHeight * (minDurationMinutes / 60));

    return {
      visible: true,
      top,
      height,
      startTime,
      endTime,
      listingId: startPosition.listingId,
    };
  }, [dragState, minDurationMinutes, startHour, hourHeight, headerOffset]);

  /**
   * Handlers object for attaching to calendar grid
   */
  const handlers: DragHandlers = useMemo(
    () => ({
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    }),
    [onMouseDown, onMouseMove, onMouseUp, onMouseLeave]
  );

  /**
   * Reset drag state (useful for cleanup)
   */
  const resetDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      startPosition: null,
      currentPosition: null,
    });
    dragContainerRef.current = null;
  }, []);

  return {
    // State
    isDragging: dragState.isDragging,
    dragPreview,

    // Handlers
    handlers,

    // Actions
    resetDrag,
  };
}

export type DragAndDropReturn = ReturnType<typeof useDragAndDrop>;
