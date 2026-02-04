/**
 * useOfflineBookings Hook
 *
 * Provides offline-first bookings data with IndexedDB caching
 * - Fetches bookings via SDK when online
 * - Caches bookings in IndexedDB for offline access
 * - Returns cached data when offline
 * - Detects online/offline status
 *
 * Pattern: Wraps SDK hooks with offline persistence layer
 */

import { useEffect, useState } from 'react';
import { useMyBookings, type BookingQueryParams, type Booking } from '@xaheen/sdk';

const DB_NAME = 'minside-offline';
const DB_VERSION = 1;
const STORE_NAME = 'bookings';

/**
 * IndexedDB wrapper for bookings cache
 */
class BookingsCache {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save bookings to cache
   */
  async set(key: string, data: unknown): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put({
        cacheKey: key,
        data,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get bookings from cache
   */
  async get(key: string): Promise<unknown | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.data ?? null);
      };
    });
  }

  /**
   * Clear all cached bookings
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton cache instance
const cache = new BookingsCache();

/**
 * Generate cache key from query params
 */
function getCacheKey(params?: BookingQueryParams): string {
  if (!params) return 'my-bookings-all';
  const parts = ['my-bookings'];
  if (params.status) parts.push(params.status);
  if (params.listingId) parts.push(params.listingId);
  return parts.join('-');
}

/**
 * Offline-first bookings hook
 *
 * @param params - Query parameters for filtering bookings
 * @returns Bookings data with offline support and online status
 */
export function useOfflineBookings(params?: BookingQueryParams) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<{
    data: Booking[];
    meta: { total: number; page: number; limit: number };
  } | null>(null);

  // Use SDK hook for online fetching
  const queryResult = useMyBookings(params);
  const { data, isLoading } = queryResult;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data on mount and when offline
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cacheKey = getCacheKey(params);
        const cached = await cache.get(cacheKey);
        if (cached) {
          setCachedData(cached as typeof cachedData);
        }
      } catch {
        // Silently fail - IndexedDB might not be available
      }
    };

    if (!isOnline || !data) {
      loadCachedData();
    }
  }, [isOnline, params, data]);

  // Cache data when successfully fetched online
  useEffect(() => {
    const cacheData = async () => {
      if (!data || !isOnline) return;

      try {
        const cacheKey = getCacheKey(params);
        await cache.set(cacheKey, data);
        setCachedData(data);
      } catch {
        // Silently fail - caching is not critical
      }
    };

    cacheData();
  }, [data, isOnline, params]);

  // Return online data if available, otherwise cached data
  const finalData = isOnline && data ? data : cachedData;

  return {
    ...queryResult,
    data: finalData,
    isOnline,
    isOffline: !isOnline,
    isCached: !isOnline && !!cachedData,
    isLoading: isOnline ? isLoading : false,
  };
}

/**
 * Clear all offline bookings cache
 */
export async function clearOfflineBookingsCache(): Promise<void> {
  try {
    await cache.clear();
  } catch {
    // Silently fail
  }
}
