/**
 * Listings List View
 * Main container for the listings list with right drawer filters
 * Styled similar to web app ListingsPage but for admin use
 */

import { useState, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  PlusIcon,
  Drawer,
  DrawerSection,
  DrawerItem,
  HeaderSearch,
  Stack,
  Text,
} from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import { useListings, LISTING_TYPE_OPTIONS, type ListingType } from '@xaheen/sdk';
import type { ListingStatus } from '@xaheen/sdk';
import { ListingsGrid } from './ListingsGrid';
import { ListingsTable } from './ListingsTable';
import { useListingFilters, STATUS_OPTIONS, SORT_OPTIONS } from '../../hooks/useListingFilters';
import { useListingPermissions } from '../../hooks/useListingPermissions';

// Capacity filter options
const CAPACITY_OPTIONS = [
  { id: 'all', label: 'Alle størrelser', min: 0, max: 999999 },
  { id: '1-10', label: '1-10 personer', min: 1, max: 10 },
  { id: '11-25', label: '11-25 personer', min: 11, max: 25 },
  { id: '26-50', label: '26-50 personer', min: 26, max: 50 },
  { id: '51-100', label: '51-100 personer', min: 51, max: 100 },
  { id: '100+', label: 'Over 100 personer', min: 101, max: 999999 },
];

export function ListingsListView() {
  const navigate = useNavigate();
  const { permissions } = useListingPermissions();

  const {
    filters,
    viewMode,
    setFilter,
    setViewMode,
    resetFilters,
    activeFilterCount,
  } = useListingFilters();

  // Right drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Filter state for drawer
  const [selectedType, setSelectedType] = useState<ListingType | 'ALL'>(filters.type || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('updated-desc');

  // Build query params, only including defined values
  const queryParams: Record<string, unknown> = {};
  if (filters.status) queryParams.status = filters.status;
  if (filters.type) queryParams.type = filters.type;
  if (filters.search) queryParams.search = filters.search;
  if (filters.city) queryParams.city = filters.city;
  if (filters.page) queryParams.page = filters.page;
  if (filters.limit) queryParams.limit = filters.limit;
  if (filters.sortBy) queryParams.sortBy = filters.sortBy;
  if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder;

  const { data, isLoading, refetch } = useListings(queryParams);

  const listings = data?.data || [];
  const pagination = data?.meta;
  const totalCount = pagination?.total || 0;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  // Get type counts for filter display
  const typeCounts = listings.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  typeCounts['ALL'] = totalCount;

  // Search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setFilter('search', value || undefined);
  }, [setFilter]);

  // Apply filters from drawer
  const applyFilters = useCallback(() => {
    // Apply type
    setFilter('type', selectedType === 'ALL' ? undefined : selectedType);

    // Apply status
    setFilter('status', selectedStatus === 'all' ? undefined : selectedStatus as ListingStatus);

    // Apply capacity
    const capacityOption = CAPACITY_OPTIONS.find(c => c.id === selectedCapacity);
    if (capacityOption && selectedCapacity !== 'all') {
      setFilter('minCapacity', capacityOption.min);
      setFilter('maxCapacity', capacityOption.max);
    } else {
      setFilter('minCapacity', undefined);
      setFilter('maxCapacity', undefined);
    }

    // Apply sort
    const sortOption = SORT_OPTIONS.find(s => s.id === selectedSort);
    if (sortOption && sortOption.field && sortOption.order) {
      setFilter('sortBy', sortOption.field);
      setFilter('sortOrder', sortOption.order);
    }

    setIsFilterOpen(false);
  }, [selectedType, selectedStatus, selectedCapacity, selectedSort, setFilter]);

  // Reset drawer filters
  const resetDrawerFilters = useCallback(() => {
    setSelectedType('ALL');
    setSelectedStatus('all');
    setSelectedCapacity('all');
    setSelectedSort('updated-desc');
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(listings.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  }, [listings]);

  const handleSelectOne = useCallback((id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  const handleSort = useCallback((field: 'name' | 'updatedAt' | 'createdAt' | 'status' | undefined) => {
    if (!field) return;

    const currentSortBy = filters.sortBy;
    const currentSortOrder = filters.sortOrder;

    if (field === currentSortBy) {
      setFilter('sortOrder', currentSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setFilter('sortBy', field);
      setFilter('sortOrder', 'desc');
    }
  }, [filters.sortBy, filters.sortOrder, setFilter]);

  const handlePageChange = useCallback((page: number) => {
    setFilter('page', page);
  }, [setFilter]);

  const handleRefresh = useCallback(() => {
    refetch();
    setSelectedIds([]);
  }, [refetch]);

  return (
    <>
      {/* Right Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter og sortering"
        icon={<FilterIcon size={20} />}
        position="right"
        size="sm"
        footer={
          <Stack spacing="var(--ds-spacing-3)">
            <Text
              size="sm"
              color="var(--ds-color-neutral-text-subtle)"
              style={{ textAlign: 'center' }}
            >
              Viser {totalCount} resultater
            </Text>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  resetDrawerFilters();
                  resetFilters();
                  setIsFilterOpen(false);
                }}
              >
                Nullstill
              </Button>
              <Button
                type="button"
                variant="primary"
                style={{ flex: 1 }}
                onClick={applyFilters}
              >
                Bruk filter
              </Button>
            </div>
          </Stack>
        }
      >
        {/* Type Section */}
        <DrawerSection title="Type" collapsible>
          <Stack spacing="var(--ds-spacing-1)">
            {LISTING_TYPE_OPTIONS.map((type) => (
              <DrawerItem
                key={type.id}
                left={
                  <input
                    type="radio"
                    name="type"
                    checked={selectedType === type.id}
                    onChange={() => setSelectedType(type.id as ListingType | 'ALL')}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                right={<Text size="sm">({typeCounts[type.id] || 0})</Text>}
                onClick={() => setSelectedType(type.id as ListingType | 'ALL')}
                selected={selectedType === type.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {type.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Status Section */}
        <DrawerSection title="Status" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {STATUS_OPTIONS.map((status) => (
              <DrawerItem
                key={status.id}
                left={
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status.id}
                    onChange={() => setSelectedStatus(status.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedStatus(status.id)}
                selected={selectedStatus === status.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {status.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Capacity Section */}
        <DrawerSection title="Kapasitet" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {CAPACITY_OPTIONS.map((cap) => (
              <DrawerItem
                key={cap.id}
                left={
                  <input
                    type="radio"
                    name="capacity"
                    checked={selectedCapacity === cap.id}
                    onChange={() => setSelectedCapacity(cap.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedCapacity(cap.id)}
                selected={selectedCapacity === cap.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {cap.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Sort Section */}
        <DrawerSection title="Sortering" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {SORT_OPTIONS.map((sort) => (
              <DrawerItem
                key={sort.id}
                left={
                  <input
                    type="radio"
                    name="sort"
                    checked={selectedSort === sort.id}
                    onChange={() => setSelectedSort(sort.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedSort(sort.id)}
                selected={selectedSort === sort.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {sort.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>
      </Drawer>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-5)',
          height: '100%',
        }}
      >
        {/* Header Row: Title + Create Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Heading level={1} data-size="md" style={{ margin: 0 }}>
            Utleieobjekter
            {totalCount > 0 && (
              <span
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  fontWeight: 'var(--ds-font-weight-regular)',
                  marginLeft: 'var(--ds-spacing-2)',
                }}
              >
                ({totalCount})
              </span>
            )}
          </Heading>

          {permissions.canCreate && (
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/listings/new')}
            >
              <PlusIcon />
              Nytt objekt
            </Button>
          )}
        </div>

        {/* Toolbar Row: Search (left) | Count (center) | View toggle + Filter (right) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {/* Search on left */}
          <HeaderSearch
            placeholder="Søk etter navn, sted..."
            value={searchValue}
            onSearchChange={handleSearchChange}
            onSearch={handleSearch}
            width="350px"
          />

          {/* Count in center */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', whiteSpace: 'nowrap' }}>
              {totalCount} objekter
            </Paragraph>
          </div>

          {/* View toggle + Filter on right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--ds-color-neutral-surface-default)', padding: '2px', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-subtle)' }}>
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Rutenettvisning"
                style={{ padding: 'var(--ds-spacing-2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </Button>
              <Button
                type="button"
                variant={viewMode === 'table' ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setViewMode('table')}
                aria-label="Listevisning"
                style={{ padding: 'var(--ds-spacing-2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </div>

            {/* Filter button */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFilterOpen(true)}
              style={{ position: 'relative' }}
            >
              <FilterIcon />
              Filtre
              {activeFilterCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 'calc(-1 * var(--ds-spacing-2))',
                    right: 'calc(-1 * var(--ds-spacing-2))',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    backgroundColor: 'var(--ds-color-accent-base-default)',
                    color: 'var(--ds-color-accent-contrast-default)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    padding: '0 var(--ds-spacing-1)',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Bulk Actions (when items selected) */}
        {selectedIds.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {selectedIds.length} valgt
            </Paragraph>
            <Button type="button" variant="secondary" data-data-size="sm" onClick={() => setSelectedIds([])}>
              Fjern valg
            </Button>
          </div>
        )}

        {/* Content - Grid or Table View */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {viewMode === 'grid' ? (
            <ListingsGrid
              listings={listings}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onRefresh={handleRefresh}
            />
          ) : (
            <ListingsTable
              listings={listings}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onRefresh={handleRefresh}
            />
          )}
        </div>

        {/* Simple Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              paddingTop: 'var(--ds-spacing-4)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Forrige side"
            >
              <ChevronLeftIcon />
            </Button>

            <Paragraph data-size="sm" style={{ margin: 0 }}>
              Side {currentPage} av {totalPages}
            </Paragraph>

            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Neste side"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
