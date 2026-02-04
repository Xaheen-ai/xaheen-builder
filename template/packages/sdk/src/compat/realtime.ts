/**
 * Compatibility shim for @digilist/client-sdk realtime hooks.
 * Convex queries are reactive by default, so these are all no-ops.
 * They exist solely to prevent import errors in code that references them.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RealtimeConnectionState {
  connected: boolean;
  reconnecting: boolean;
}

export interface RealtimeSubscriptionState {
  connected: boolean;
}

export interface NotificationBadgeState {
  count: number;
}

export interface RealtimeEvent {
  type: string;
  payload?: unknown;
  timestamp?: number;
  /** Alias used by some consumers */
  data?: unknown;
  /** Human-readable message */
  message?: string;
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

export interface RealtimeSendHandle {
  send: (...args: unknown[]) => void;
}

/** Alias kept for backwards-compat imports */
export type RealtimeSendHandleAlias = RealtimeEventHandler;

type AnyCallback = (...args: unknown[]) => void;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Returns a static "connected" state. Convex manages its own connection. */
export function useRealtimeConnection(): RealtimeConnectionState {
  return { connected: true, reconnecting: false };
}

/** No-op: Convex bookings queries are already reactive. */
export function useRealtimeBookings(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** No-op: Convex listing queries are already reactive. */
export function useRealtimeListings(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** No-op: Convex calendar queries are already reactive. */
export function useRealtimeCalendar(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** No-op: Convex message queries are already reactive. */
export function useRealtimeMessages(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** No-op: Convex notification queries are already reactive. */
export function useRealtimeNotifications(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** No-op: Convex audit-log queries are already reactive. */
export function useRealtimeAudit(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** No-op: Convex event queries are already reactive. */
export function useRealtimeEvents(_callback?: AnyCallback): RealtimeSubscriptionState {
  return { connected: true };
}

/** Always returns zero — notification count comes from Convex queries instead. */
export function useNotificationBadge(): NotificationBadgeState {
  return { count: 0 };
}

/** Returns a no-op send handle. Convex mutations replace WebSocket sends. */
export function useRealtimeSend(): RealtimeSendHandle {
  return { send: () => {} };
}

// ---------------------------------------------------------------------------
// Realtime client object (imperative API shim)
// ---------------------------------------------------------------------------

export const realtimeClient = {
  /** Static property — Convex is always "connected". */
  isConnected: true as boolean,

  /** No-op: Convex manages its own connection. */
  connect: (_opts?: Record<string, unknown> | string) => {},

  /** No-op: Convex manages its own connection. */
  disconnect: () => {},

  /** No-op event listener registration. Returns unsubscribe function. */
  on: (_event: string, _callback: AnyCallback): (() => void) => {
    return () => {};
  },

  /** No-op event listener removal. */
  off: (_event: string, _callback: AnyCallback): void => {},

  /** No-op listing subscription. Returns unsubscribe function. */
  onListing: (_idOrCallback: string | AnyCallback, _callback?: AnyCallback): (() => void) => {
    return () => {};
  },

  /** No-op: subscribe to all events. Returns unsubscribe function. */
  onAll: (_callback: AnyCallback): (() => void) => {
    return () => {};
  },

  /** No-op: emit an event (used in test utilities). */
  emit: (_event: string, ..._args: unknown[]): void => {},
};

// ---------------------------------------------------------------------------
// URL factories (stubs)
// ---------------------------------------------------------------------------

/**
 * Returns an empty string. The digdir SDK used this to build WebSocket URLs
 * for the audit trail; Convex audit queries are reactive and need no WebSocket.
 */
export function createAuditWebSocketUrl(_tenantId?: string): string {
  return "";
}

/**
 * Returns an empty string. The digdir SDK used this to build tenant-scoped
 * WebSocket URLs; Convex handles real-time at the query level.
 */
export function createTenantWebSocketUrl(_baseUrlOrTenantId?: string, _tenantId?: string): string {
  return "";
}
