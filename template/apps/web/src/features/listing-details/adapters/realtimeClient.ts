/**
 * Real-time Client Adapter
 *
 * Uses SDK's WebSocket realtime client for live updates.
 * Re-exports SDK types for local use.
 */

import { useEffect, useCallback, useState } from 'react';
import {
  realtimeClient as sdkRealtimeClient,
  createTenantWebSocketUrl,
  type RealtimeEvent,
  type RealtimeEventHandler,
} from '@xaheen/sdk';
import type { RealtimeEventType } from '../types';

// =============================================================================
// Re-export SDK types
// =============================================================================

export type { RealtimeEventHandler, RealtimeEvent };

// =============================================================================
// Client Interface
// =============================================================================

export interface RealtimeClient {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(listingId: string, handler: RealtimeEventHandler): () => void;
  isConnected(): boolean;
}

// =============================================================================
// SDK-based Implementation
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

class SdkRealtimeClient implements RealtimeClient {
  private listingHandlers = new Map<string, Set<RealtimeEventHandler>>();
  private unsubscribeAll: (() => void) | null = null;

  async connect(): Promise<void> {
    if (sdkRealtimeClient.isConnected) {
      return;
    }

    const wsUrl = createTenantWebSocketUrl(API_URL, TENANT_ID || '');

    sdkRealtimeClient.connect({
      url: wsUrl,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      tenantId: TENANT_ID,
      debug: import.meta.env.DEV,
    });

    // Subscribe to listing events and route to appropriate handlers
    this.unsubscribeAll = sdkRealtimeClient.onListing((event: RealtimeEvent) => {
      const listingId = (event.data as { listingId?: string })?.listingId;
      if (listingId) {
        const handlers = this.listingHandlers.get(listingId);
        handlers?.forEach(handler => handler(event));
      }
    });
  }

  disconnect(): void {
    this.unsubscribeAll?.();
    this.unsubscribeAll = null;
    this.listingHandlers.clear();
    sdkRealtimeClient.disconnect();
  }

  subscribe(listingId: string, handler: RealtimeEventHandler): () => void {
    if (!this.listingHandlers.has(listingId)) {
      this.listingHandlers.set(listingId, new Set());
    }

    this.listingHandlers.get(listingId)!.add(handler);

    return () => {
      const handlers = this.listingHandlers.get(listingId);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listingHandlers.delete(listingId);
        }
      }
    };
  }

  isConnected(): boolean {
    return sdkRealtimeClient.isConnected;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let realtimeClientInstance: RealtimeClient | null = null;

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new SdkRealtimeClient();
  }
  return realtimeClientInstance;
}

export function setRealtimeClient(client: RealtimeClient): void {
  realtimeClientInstance = client;
}

// =============================================================================
// React Hook for Real-time Updates
// =============================================================================

export interface UseRealtimeResult {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
}

export function useRealtimeUpdates(
  listingId: string,
  onUpdate?: (event: RealtimeEvent) => void
): UseRealtimeResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      setLastEvent(event);
      onUpdate?.(event);
    },
    [onUpdate]
  );

  useEffect(() => {
    const client = getRealtimeClient();

    // Connect if not already connected
    if (!client.isConnected()) {
      client.connect().then(() => {
        setIsConnected(true);
      });
    } else {
      setIsConnected(true);
    }

    // Subscribe to listing updates
    const unsubscribe = client.subscribe(listingId, handleEvent);

    return () => {
      unsubscribe();
    };
  }, [listingId, handleEvent]);

  return { isConnected, lastEvent };
}
