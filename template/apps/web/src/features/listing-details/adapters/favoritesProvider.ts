/**
 * Favorites Provider Adapter
 *
 * Interface and implementation for managing user favorites.
 * Supports optimistic updates and audit logging.
 */

import type { FavoriteState } from '../types';
import { logAuditEvent } from './auditProvider';

// =============================================================================
// Adapter Interface
// =============================================================================

export interface FavoritesProvider {
  /**
   * Get favorite state for a listing
   */
  getFavoriteState(listingId: string): Promise<FavoriteState>;

  /**
   * Toggle favorite status
   */
  toggleFavorite(
    listingId: string,
    tenantId: string,
    userId: string
  ): Promise<FavoriteState>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null;
}

// =============================================================================
// Local Storage Implementation
// Favorites are stored locally for unauthenticated users
// =============================================================================

const FAVORITES_STORAGE_KEY = 'digilist_favorites';

function getFavoritesFromStorage(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveFavoritesToStorage(favorites: Record<string, boolean>): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Storage might be full or disabled
  }
}

/**
 * Local storage-based favorites provider
 * Persists favorites locally for quick access
 */
class LocalStorageFavoritesProvider implements FavoritesProvider {
  private userId: string | null = null;

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  async getFavoriteState(listingId: string): Promise<FavoriteState> {
    const favorites = getFavoritesFromStorage();
    const state: FavoriteState = {
      isFavorited: !!favorites[listingId],
    };
    return state;
  }

  async toggleFavorite(
    listingId: string,
    tenantId: string,
    userId: string
  ): Promise<FavoriteState> {
    const favorites = getFavoritesFromStorage();
    const wasFavorited = !!favorites[listingId];
    const newState = !wasFavorited;

    favorites[listingId] = newState;
    saveFavoritesToStorage(favorites);

    // Log audit event
    await logAuditEvent(
      newState ? 'FAVORITE_ADDED' : 'FAVORITE_REMOVED',
      tenantId,
      listingId,
      userId
    );

    return {
      isFavorited: newState,
      lastToggled: new Date().toISOString(),
    };
  }

  isAuthenticated(): boolean {
    return this.userId !== null;
  }

  getCurrentUserId(): string | null {
    return this.userId;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let favoritesProviderInstance: FavoritesProvider | null = null;

export function getFavoritesProvider(): FavoritesProvider {
  if (!favoritesProviderInstance) {
    favoritesProviderInstance = new LocalStorageFavoritesProvider();
  }
  return favoritesProviderInstance;
}

export function setFavoritesProvider(provider: FavoritesProvider): void {
  favoritesProviderInstance = provider;
}

// =============================================================================
// React Hook for Favorites
// =============================================================================

import { useState, useCallback } from 'react';

export interface UseFavoritesResult {
  isFavorited: boolean;
  isLoading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
}

export function useFavorites(
  listingId: string,
  tenantId: string,
  isAuthenticated: boolean,
  userId: string | null,
  onAuthRequired: () => void
): UseFavoritesResult {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      onAuthRequired();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    try {
      const provider = getFavoritesProvider();
      const result = await provider.toggleFavorite(listingId, tenantId, userId);
      setIsFavorited(result.isFavorited);
    } catch (err) {
      // Revert on error
      setIsFavorited(previousState);
      setError(err instanceof Error ? err.message : 'Kunne ikke oppdatere favoritter');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, tenantId, isAuthenticated, userId, isFavorited, onAuthRequired]);

  return { isFavorited, isLoading, error, toggle };
}
