/**
 * Notification Testing Utility
 * Simulates WebSocket notification events for testing real-time notification delivery
 *
 * ⚠️ FOR DEVELOPMENT/TESTING ONLY - DO NOT USE IN PRODUCTION
 */

import { realtimeClient } from '@xaheen/sdk/realtime';
import type { RealtimeEvent } from '@xaheen/sdk/realtime';

export interface SimulateNotificationOptions {
  type?: 'booking_confirmed' | 'booking_reminder_24h' | 'booking_reminder_1h' | 'booking_cancelled' | 'booking_modified';
  title?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  bookingId?: string;
  listingId?: string;
}

/**
 * Simulates a notification event via WebSocket
 * This directly emits an event to the realtimeClient as if it came from the backend
 */
export function simulateNotificationEvent(options: SimulateNotificationOptions = {}) {
  const {
    type = 'booking_confirmed',
    title = 'Test Notification',
    message = 'This is a test notification',
    priority = 'medium',
    bookingId = 'test-booking-123',
    listingId = 'test-listing-456',
  } = options;

  // Create a mock notification event that matches the backend format
  const notificationEvent: RealtimeEvent = {
    type: 'notification',
    timestamp: new Date().toISOString(),
    data: {
      id: `notification-${Date.now()}`,
      type,
      title,
      message,
      priority,
      createdAt: new Date().toISOString(),
      readAt: null,
      metadata: {
        bookingId,
        listingId,
      },
    },
  };

  // Emit the event through the realtimeClient
  // @ts-expect-error - accessing private emit method for testing
  if (realtimeClient.emit) {
    // @ts-expect-error - private method
    realtimeClient.emit('notification', notificationEvent);
    // @ts-expect-error - private method
    realtimeClient.emit('*', notificationEvent);
  } else {
    console.warn('[NotificationTest] Could not emit event - realtimeClient.emit is not available');
  }

  return notificationEvent;
}

/**
 * Simulates a booking confirmation notification
 */
export function simulateBookingConfirmation() {
  return simulateNotificationEvent({
    type: 'booking_confirmed',
    title: 'Booking bekreftet',
    message: 'Din booking er bekreftet for møterom Alpha, 15. januar kl. 10:00',
    priority: 'high',
  });
}

/**
 * Simulates a booking reminder (24h before)
 */
export function simulateBookingReminder24h() {
  return simulateNotificationEvent({
    type: 'booking_reminder_24h',
    title: 'Påminnelse: Booking i morgen',
    message: 'Du har en booking i morgen kl. 10:00',
    priority: 'medium',
  });
}

/**
 * Simulates a booking reminder (1h before)
 */
export function simulateBookingReminder1h() {
  return simulateNotificationEvent({
    type: 'booking_reminder_1h',
    title: 'Påminnelse: Booking om 1 time',
    message: 'Du har en booking om 1 time',
    priority: 'urgent',
  });
}

/**
 * Simulates a booking cancellation notification
 */
export function simulateBookingCancellation() {
  return simulateNotificationEvent({
    type: 'booking_cancelled',
    title: 'Booking kansellert',
    message: 'Din booking for møterom Alpha er kansellert',
    priority: 'high',
  });
}

/**
 * Simulates a booking modification notification
 */
export function simulateBookingModification() {
  return simulateNotificationEvent({
    type: 'booking_modified',
    title: 'Booking endret',
    message: 'Din booking har blitt endret. Sjekk detaljene.',
    priority: 'medium',
  });
}

// Expose to window for browser console testing
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).notificationTest = {
    simulate: simulateNotificationEvent,
    bookingConfirmation: simulateBookingConfirmation,
    bookingReminder24h: simulateBookingReminder24h,
    bookingReminder1h: simulateBookingReminder1h,
    bookingCancellation: simulateBookingCancellation,
    bookingModification: simulateBookingModification,
  };
}
