/**
 * Realtime Provider
 * Connects to WebSocket and provides realtime functionality to React tree
 */

import { createContext, useContext, type ReactNode } from 'react';
import { 
  useRealtimeConnection,
  useRealtimeBookings,
  useRealtimeListings,
  useRealtimeMessages,
} from '@xaheen/sdk';

interface RealtimeContextValue {
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({ isConnected: false });

interface RealtimeProviderProps {
  children: ReactNode;
  /** WebSocket URL - if not provided, realtime is disabled */
  wsUrl?: string;
  /** Tenant ID for multi-tenant filtering */
  tenantId?: string;
}

/**
 * RealtimeProvider - Wraps app to enable real-time updates
 * 
 * @example
 * ```tsx
 * <RealtimeProvider wsUrl="wss://api.digilist.no" tenantId="f47ac10b...">
 *   <App />
 * </RealtimeProvider>
 * ```
 */
export function RealtimeProvider({ children, wsUrl, tenantId }: RealtimeProviderProps) {
  // Build full WebSocket URL with tenant ID suffix
  // Expects wsUrl like "wss://api.digilist.no/ws/events" and appends /{tenantId}
  const fullWsUrl = wsUrl && tenantId 
    ? `${wsUrl}/${tenantId}` 
    : undefined;
  
  // Connect to WebSocket
  const isConnected = useRealtimeConnection(fullWsUrl ? {
    url: fullWsUrl,
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 3,
    ...(tenantId ? { tenantId } : {}),
  } : undefined);

  // Subscribe to domain events - auto-invalidates queries
  useRealtimeBookings();
  useRealtimeListings();
  useRealtimeMessages();

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to check realtime connection status
 */
export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
