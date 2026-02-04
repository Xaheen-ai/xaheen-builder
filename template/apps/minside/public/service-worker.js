/**
 * Service Worker for Browser Push Notifications
 * Handles push events and notification interactions for the Minside app
 */

// Service Worker version - increment to force update
const SW_VERSION = '1.0.0';
console.log('Service Worker version:', SW_VERSION);

// =============================================================================
// Installation & Activation
// =============================================================================

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// =============================================================================
// Push Event Handler
// =============================================================================

/**
 * Handle incoming push notifications
 * Displays notification with booking-specific styling and actions
 */
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  try {
    // Parse notification payload
    const payload = event.data.json();
    const { title, body, icon, badge, image, data, actions, tag, requireInteraction } = payload;

    // Build notification options
    const notificationOptions = {
      body: body || '',
      icon: icon || '/icon.png',
      badge: badge || '/icon.png',
      tag: tag || `notification-${Date.now()}`,
      requireInteraction: requireInteraction || false,
      data: data || {},
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    };

    // Add image if provided
    if (image) {
      notificationOptions.image = image;
    }

    // Add action buttons if provided
    if (actions && actions.length > 0) {
      notificationOptions.actions = actions;
    }

    // Add type-specific enhancements based on notification type
    if (data && data.type) {
      enhanceNotificationForType(notificationOptions, data.type);
    }

    // Display notification
    event.waitUntil(
      self.registration.showNotification(title || 'Xala', notificationOptions)
    );
  } catch (error) {
    console.error('Error parsing push notification:', error);
    // Fallback notification on parse error
    event.waitUntil(
      self.registration.showNotification('Xala', {
        body: 'Du har mottatt en ny varsling',
        icon: '/icon.png',
        badge: '/icon.png',
      })
    );
  }
});

// =============================================================================
// Notification Click Handler
// =============================================================================

/**
 * Handle notification click events
 * Opens or focuses the app at the appropriate URL
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  // Determine target URL based on notification data
  let targetUrl = getTargetUrl(data, action);

  // Open or focus window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window with same origin
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus().then((client) => {
            // Navigate to target URL if client supports it
            if (targetUrl && 'navigate' in client) {
              return client.navigate(targetUrl);
            }
            return client;
          });
        }
      }

      // No existing window found - open new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Enhance notification options based on notification type
 * Adds type-specific actions and visual enhancements
 */
function enhanceNotificationForType(options, type) {
  switch (type) {
    case 'booking_confirmed':
      options.requireInteraction = true;
      if (!options.actions) {
        options.actions = [
          { action: 'view', title: 'Se bestilling' },
          { action: 'dismiss', title: 'OK' },
        ];
      }
      break;

    case 'booking_reminder_24h':
    case 'booking_reminder_1h':
      options.requireInteraction = true;
      options.vibrate = [200, 100, 200, 100, 200];
      if (!options.actions) {
        options.actions = [
          { action: 'view', title: 'Se bestilling' },
          { action: 'dismiss', title: 'OK' },
        ];
      }
      break;

    case 'booking_cancelled':
      options.requireInteraction = true;
      options.vibrate = [300, 100, 300];
      if (!options.actions) {
        options.actions = [
          { action: 'view', title: 'Se detaljer' },
          { action: 'dismiss', title: 'OK' },
        ];
      }
      break;

    case 'booking_modified':
      options.requireInteraction = true;
      if (!options.actions) {
        options.actions = [
          { action: 'view', title: 'Se endringer' },
          { action: 'dismiss', title: 'OK' },
        ];
      }
      break;

    case 'booking_upcoming':
      if (!options.actions) {
        options.actions = [
          { action: 'view', title: 'Se bestilling' },
        ];
      }
      break;

    case 'booking_completed':
      if (!options.actions) {
        options.actions = [
          { action: 'view', title: 'Se bestilling' },
        ];
      }
      break;

    default:
      break;
  }
}

/**
 * Determine target URL based on notification data and clicked action
 * Provides deep linking to relevant pages
 */
function getTargetUrl(data, action) {
  // If action is dismiss, just return base URL
  if (action === 'dismiss') {
    return self.registration.scope;
  }

  // If explicit URL provided in data, use it
  if (data.url) {
    // Ensure URL is relative or same-origin for security
    try {
      const url = new URL(data.url, self.registration.scope);
      if (url.origin === new URL(self.registration.scope).origin) {
        return url.href;
      }
    } catch (error) {
      console.error('Invalid notification URL:', error);
      // Invalid URL, fall through to default routing
    }
  }

  // Route based on booking ID if available
  if (data.bookingId) {
    return `${self.registration.scope}bookings/${data.bookingId}`;
  }

  // Route based on listing ID if available
  if (data.listingId) {
    return `${self.registration.scope}listings/${data.listingId}`;
  }

  // Default to bookings page
  return `${self.registration.scope}bookings`;
}
