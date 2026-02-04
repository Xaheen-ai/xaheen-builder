/**
 * Listing Filters Hook
 * Manages filter state for the listings list view
 */

import { useState, useCallback, useMemo } from 'react';
import { LISTING_TYPE_OPTIONS, type ListingType } from '@xaheen/sdk';
import type { ListingQueryFilters, ViewMode } from '../types';

export interface UseListingFiltersReturn {
  filters: ListingQueryFilters;
  viewMode: ViewMode;
  setFilter: <K extends keyof ListingQueryFilters>(key: K, value: ListingQueryFilters[K]) => void;
  setFilters: (filters: Partial<ListingQueryFilters>) => void;
  setViewMode: (mode: ViewMode) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: ListingQueryFilters = {
  page: 1,
  limit: 50,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

export function useListingFilters(
  initialFilters?: Partial<ListingQueryFilters>,
  initialViewMode: ViewMode = 'table'
): UseListingFiltersReturn {
  const [filters, setFiltersState] = useState<ListingQueryFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  const setFilter = useCallback(<K extends keyof ListingQueryFilters>(
    key: K,
    value: ListingQueryFilters[K]
  ) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filters change (except pagination itself)
      ...(key !== 'page' && key !== 'limit' ? { page: 1 } : {}),
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<ListingQueryFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change
      page: newFilters.page ?? 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Count active filters (excluding default values and pagination)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.search) count++;
    if (filters.city) count++;
    if (filters.municipality) count++;
    if (filters.organizationId) count++;
    if (filters.minCapacity) count++;
    if (filters.maxCapacity) count++;
    if (filters.hasBookingConfig !== undefined) count++;
    return count;
  }, [filters]);

  return {
    filters,
    viewMode,
    setFilter,
    setFilters,
    setViewMode,
    resetFilters,
    activeFilterCount,
  };
}

/**
 * Type tabs configuration - use SDK's LISTING_TYPE_OPTIONS directly
 */
export const TYPE_TABS: Array<{ id: ListingType | 'ALL'; label: string }> = LISTING_TYPE_OPTIONS;

/**
 * Status filter options
 */
export const STATUS_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Alle statuser' },
  { id: 'draft', label: 'Utkast' },
  { id: 'published', label: 'Publisert' },
  { id: 'archived', label: 'Arkivert' },
];

/**
 * Sort options for listings
 */
export const SORT_OPTIONS: Array<{ id: string; label: string; field: ListingQueryFilters['sortBy']; order: ListingQueryFilters['sortOrder'] }> = [
  { id: 'updated-desc', label: 'Sist oppdatert', field: 'updatedAt', order: 'desc' },
  { id: 'updated-asc', label: 'Eldst oppdatert', field: 'updatedAt', order: 'asc' },
  { id: 'created-desc', label: 'Nyeste først', field: 'createdAt', order: 'desc' },
  { id: 'created-asc', label: 'Eldste først', field: 'createdAt', order: 'asc' },
  { id: 'name-asc', label: 'Navn A-Å', field: 'name', order: 'asc' },
  { id: 'name-desc', label: 'Navn Å-A', field: 'name', order: 'desc' },
];
