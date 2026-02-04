import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDragAndDrop } from './useDragAndDrop';

describe('useDragAndDrop', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useDragAndDrop());

    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragPreview.visible).toBe(false);
  });

  it('should calculate time from Y position correctly', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ startHour: 7, hourHeight: 60, headerOffset: 48 })
    );

    // Mock mouse event at Y=168 (120px from top + 48px offset = hour 9)
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      clientY: 168,
      clientX: 100,
      target: {
        dataset: { listingId: '123', date: '2026-01-14' },
      },
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handlers.onMouseDown(mockEvent);
    });

    // Verify time calculation (should be 9:00)
    expect(result.current.dragPreview.startTime?.getHours()).toBe(9);
  });

  it('should enforce minimum drag duration of 30 minutes', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ minDurationMinutes: 30, startHour: 7, hourHeight: 60, headerOffset: 48 })
    );

    // Start drag at 10:00
    const mouseDown = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      clientY: 228, // 10:00 position
      clientX: 100,
      target: {
        dataset: { listingId: '123', date: '2026-01-14' },
      },
      preventDefault: vi.fn(),
    } as any;

    // Try to drag only 10 minutes (should enforce 30)
    const mouseMove = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      clientY: 238, // 10:10 position (only 10 minutes)
      clientX: 100,
      target: {
        dataset: { date: '2026-01-14' },
      },
    } as any;

    act(() => {
      result.current.handlers.onMouseDown(mouseDown);
      result.current.handlers.onMouseMove(mouseMove);
    });

    // Verify minimum 30 minutes enforced
    const startTime = result.current.dragPreview.startTime;
    const endTime = result.current.dragPreview.endTime;
    if (startTime && endTime) {
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      expect(durationMinutes).toBeGreaterThanOrEqual(30);
    }
  });

  it('should snap to 15-minute intervals', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ snapIntervalMinutes: 15, startHour: 7, hourHeight: 60, headerOffset: 48 })
    );

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      clientY: 175, // Odd position that should snap
      clientX: 100,
      target: {
        dataset: { listingId: '123', date: '2026-01-14' },
      },
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handlers.onMouseDown(mockEvent);
    });

    // Verify time is snapped to 15-minute interval
    const minutes = result.current.dragPreview.startTime?.getMinutes();
    expect(minutes! % 15).toBe(0);
  });

  it('should extract listing ID from data attribute', () => {
    const { result } = renderHook(() => useDragAndDrop());

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14', listingId: 'listing-abc-123' },
      },
      clientY: 168,
      clientX: 100,
      target: {
        dataset: { listingId: 'listing-abc-123', date: '2026-01-14' },
      },
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handlers.onMouseDown(mockEvent);
    });

    expect(result.current.dragPreview.listingId).toBe('listing-abc-123');
  });

  it('should provide drag handlers', () => {
    const { result } = renderHook(() => useDragAndDrop());

    // Verify handlers are provided
    expect(result.current.handlers.onMouseDown).toBeDefined();
    expect(result.current.handlers.onMouseMove).toBeDefined();
    expect(result.current.handlers.onMouseUp).toBeDefined();
    expect(result.current.handlers.onMouseLeave).toBeDefined();

    // Verify handlers are functions
    expect(typeof result.current.handlers.onMouseDown).toBe('function');
    expect(typeof result.current.handlers.onMouseMove).toBe('function');
    expect(typeof result.current.handlers.onMouseUp).toBe('function');
    expect(typeof result.current.handlers.onMouseLeave).toBe('function');
  });

  it('should cancel drag on mouse leave', () => {
    const { result } = renderHook(() => useDragAndDrop());

    const mouseDown = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      clientY: 168,
      clientX: 100,
      target: {
        dataset: { listingId: '123', date: '2026-01-14' },
      },
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handlers.onMouseDown(mouseDown);
    });

    expect(result.current.isDragging).toBe(true);

    // Create proper mouse leave event where currentTarget === target
    const mouseLeave = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      target: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
    } as any;
    // Make currentTarget === target
    mouseLeave.target = mouseLeave.currentTarget;

    act(() => {
      result.current.handlers.onMouseLeave(mouseLeave);
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragPreview.visible).toBe(false);
  });

  it('should reset drag state with resetDrag', () => {
    const { result } = renderHook(() => useDragAndDrop());

    const mouseDown = {
      currentTarget: {
        getBoundingClientRect: () => ({ top: 0 }),
        dataset: { date: '2026-01-14' },
      },
      clientY: 168,
      clientX: 100,
      target: {
        dataset: { listingId: '123', date: '2026-01-14' },
      },
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handlers.onMouseDown(mouseDown);
    });

    expect(result.current.isDragging).toBe(true);

    act(() => {
      result.current.resetDrag();
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragPreview.visible).toBe(false);
  });
});
