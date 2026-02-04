/**
 * Realtime Provider
 *
 * Provides WebSocket-based real-time event streaming for the web app.
 * Automatically connects when user is authenticated and handles reconnection.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  realtimeClient,
  createTenantWebSocketUrl,
  type RealtimeEvent,
  type RealtimeEventHandler,
  type RealtimeEventType,
} from '@xaheen/sdk';

// =============================================================================
// Types
// =============================================================================

export interface RealtimeContextValue {
  /** Whether connected to realtime server */
  isConnected: boolean;
  /** Connection status */
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  /** Last error if any */
  error: string | null;
  /** Connect to realtime server */
  connect: () => void;
  /** Disconnect from realtime server */
  disconnect: () => void;
  /** Subscribe to event type */
  subscribe: (eventType: RealtimeEventType | '*', handler: RealtimeEventHandler) => () => void;
  /** Last received events by type */
  lastEvents: Map<RealtimeEventType, RealtimeEvent>;
}

export interface RealtimeProviderProps {
  children: React.ReactNode;
  /** API base URL (defaults to VITE_API_URL) */
  baseUrl?: string;
  /** Tenant ID for WebSocket connection */
  tenantId?: string;
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Enable in development mode (defaults to true) */
  enableInDev?: boolean;
}

// =============================================================================
// Context
// =============================================================================

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

export function RealtimeProvider({
  children,
  baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId = import.meta.env.VITE_TENANT_ID || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  autoConnect = true,
  enableInDev = true,
}: RealtimeProviderProps): React.ReactElement {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastEvents, setLastEvents] = useState<Map<RealtimeEventType, RealtimeEvent>>(new Map());
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Connect to realtime server
  const connect = useCallback(() => {
    if (!enableInDev && import.meta.env.DEV) {
      return;
    }

    try {
      setStatus('connecting');
      setError(null);

      const wsUrl = createTenantWebSocketUrl(baseUrl, tenantId);

      realtimeClient.connect({
        url: wsUrl,
        autoReconnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        tenantId,
      });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [baseUrl, tenantId, enableInDev]);

  // Disconnect from realtime server
  const disconnect = useCallback(() => {
    realtimeClient.disconnect();
    setIsConnected(false);
    setStatus('disconnected');
  }, []);

  // Subscribe to event type
  const subscribe = useCallback((eventType: RealtimeEventType | '*', handler: RealtimeEventHandler) => {
    const unsubscribe = realtimeClient.on(eventType, handler);
    unsubscribesRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  // Setup connection event handlers
  useEffect(() => {
    // Handle connection events
    const unsubConnected = realtimeClient.on('connected', () => {
      setIsConnected(true);
      setStatus('connected');
      setError(null);
    });

    // Track all events for debugging/display
    const unsubAll = realtimeClient.onAll((event) => {
      if (event.type !== 'pong') {
        setLastEvents(prev => {
          const next = new Map(prev);
          next.set(event.type, event);
          return next;
        });
      }
    });

    unsubscribesRef.current.push(unsubConnected, unsubAll);

    // Auto-connect if enabled
    if (autoConnect) {
      // Small delay to ensure app is ready
      const timer = setTimeout(connect, 500);
      return () => {
        clearTimeout(timer);
        // Cleanup all subscriptions
        unsubscribesRef.current.forEach(unsub => unsub());
        unsubscribesRef.current = [];
      };
    }

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubscribesRef.current = [];
    };
  }, [autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: RealtimeContextValue = {
    isConnected,
    status,
    error,
    connect,
    disconnect,
    subscribe,
    lastEvents,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Access realtime context
 */
export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}

// =============================================================================
// Event-specific Hooks
// =============================================================================

/**
 * Subscribe to booking events
 */
export function useRealtimeBooking(handler: RealtimeEventHandler): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    const unsubscribe = subscribe('booking', handler);
    return unsubscribe;
  }, [subscribe, handler]);
}

/**
 * Subscribe to listing events
 */
export function useRealtimeListing(handler: RealtimeEventHandler): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    const unsubscribe = subscribe('listing', handler);
    return unsubscribe;
  }, [subscribe, handler]);
}

/**
 * Subscribe to audit events
 */
export function useRealtimeAudit(handler: RealtimeEventHandler): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    const unsubscribe = subscribe('audit', handler);
    return unsubscribe;
  }, [subscribe, handler]);
}

/**
 * Subscribe to notification events
 */
export function useRealtimeNotification(handler: RealtimeEventHandler): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    const unsubscribe = subscribe('notification', handler);
    return unsubscribe;
  }, [subscribe, handler]);
}

/**
 * Subscribe to message events
 */
export function useRealtimeMessage(handler: RealtimeEventHandler): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    const unsubscribe = subscribe('message', handler);
    return unsubscribe;
  }, [subscribe, handler]);
}

/**
 * Subscribe to all events
 */
export function useRealtimeAll(handler: RealtimeEventHandler): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    const unsubscribe = subscribe('*', handler);
    return unsubscribe;
  }, [subscribe, handler]);
}

/**
 * Get connection status
 */
export function useRealtimeStatus(): {
  isConnected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
} {
  const { isConnected, status, error } = useRealtimeContext();
  return { isConnected, status, error };
}

export default RealtimeProvider;
