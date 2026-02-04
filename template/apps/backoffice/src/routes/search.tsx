/**
 * Search Page
 * Global search interface integrating SearchResults, SavedFilters, and advanced filtering
 * Styled consistently with bookings page and other list views
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex search form */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Heading,
  Stack,
  Drawer,
  DrawerSection,
  DrawerItem,
  FilterIcon,
  DownloadIcon,
  Badge,
  Text,
} from '@xaheen/ds';

import {
  useExportResults,
  type SearchEntityType,
  type SearchFilters,
  type SavedFilter,
} from '@xaheen/sdk';
import { SearchResults } from '../components/SearchResults';
import { SavedFilters } from '../components/SavedFilters';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get search query from URL
  const query = searchParams.get('q') || '';
  const urlEntityType = searchParams.get('type') as SearchEntityType | null;

  // Filter state
  const [entityType, setEntityType] = useState<SearchEntityType>(urlEntityType || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  // Update entityType when URL changes
  useEffect(() => {
    if (urlEntityType && urlEntityType !== entityType) {
      setEntityType(urlEntityType);
    }
  }, [urlEntityType, entityType]);

  // Build search filters object
  const searchFilters = useMemo((): SearchFilters | undefined => {
    const filters: SearchFilters = {};

    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (statusFilter) filters.status = statusFilter;

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [dateFrom, dateTo, statusFilter]);

  // Active filter count
  const activeFilterCount = [dateFrom, dateTo, statusFilter].filter(Boolean).length;

  // Export mutation
  const exportResults = useExportResults();

  // Handle filter drawer toggle
  const handleToggleFilters = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  const handleCloseFilters = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  // Handle applying saved filter
  const handleApplySavedFilter = useCallback(
    (filter: SavedFilter) => {
      // Apply filter to current state
      const filters = filter.filters || {};

      setDateFrom(filters.dateFrom || '');
      setDateTo(filters.dateTo || '');
      setStatusFilter(filters.status || '');

      if (filter.entityType) {
        setEntityType(filter.entityType);
      }

      // If filter has a query, update URL
      if (filter.query) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('q', filter.query);
        if (filter.entityType) {
          newParams.set('type', filter.entityType);
        }
        setSearchParams(newParams);
      }

      // Close filter drawer
      handleCloseFilters();
    },
    [searchParams, setSearchParams, handleCloseFilters]
  );

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
  }, []);

  // Handle export to CSV
  const handleExport = useCallback(async () => {
    if (!query) return;

    try {
      await exportResults.mutateAsync({
        query,
        entityType,
        filters: searchFilters,
        format: 'csv',
      });
      // Note: SDK should handle download automatically
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [query, entityType, searchFilters, exportResults]);

  // If no search query, show empty state
  if (!query) {
    return (
      <Stack spacing="lg" style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={1}>Søk</Heading>
        <Stack spacing="md" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
          <Text weight="medium">
            Ingen søk utført
          </Text>
          <Text color="secondary">
            Bruk søkefeltet i toppmeny for å søke i bookinger, lokaler og organisasjoner
          </Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg" style={{ padding: 'var(--ds-spacing-6)' }}>
      {/* Page header with filters and actions */}
      <Stack direction="horizontal" justify="space-between" align="center">
        <Heading level={1}>Søkeresultater</Heading>

        <Stack direction="horizontal" spacing="sm">
          {/* Saved Filters */}
          <SavedFilters
            currentFilters={searchFilters}
            currentQuery={query}
            currentEntityType={entityType}
            onApplyFilter={handleApplySavedFilter}
          />

          {/* Filter Toggle Button */}
          <Button variant="secondary" onClick={handleToggleFilters} type="button">
            <FilterIcon size={16} />
            Filtre
            {activeFilterCount > 0 && (
              <Badge variant="primary" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Export Button */}
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exportResults.isPending || !query} type="button"
          >
            <DownloadIcon size={16} />
            {exportResults.isPending ? 'Eksporterer...' : 'Eksporter'}
          </Button>
        </Stack>
      </Stack>

      {/* Search Results */}
      <SearchResults
        query={query}
        entityType={entityType}
        filters={searchFilters}
      />

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={handleCloseFilters} position="right">
        <DrawerSection>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              borderBottom: '1px solid var(--ds-color-neutral-200)',
            }}
          >
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              Filtre
            </Heading>
            {activeFilterCount > 0 && (
              <Button variant="tertiary" data-size="sm" onClick={handleClearFilters} type="button">
                Nullstill alle
              </Button>
            )}
          </div>

          {/* Date Filters */}
          <DrawerItem>
            <Stack spacing="sm">
              <Text weight="medium" style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                Datoperiode
              </Text>
              <Stack direction="horizontal" spacing="sm" align="center">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-2)',
                    fontSize: 'var(--ds-font-size-sm)',
                    border: '1px solid var(--ds-color-neutral-300)',
                    borderRadius: 'var(--ds-radius-md)',
                  }}
                />
                <Text color="secondary">
                  til
                </Text>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-2)',
                    fontSize: 'var(--ds-font-size-sm)',
                    border: '1px solid var(--ds-color-neutral-300)',
                    borderRadius: 'var(--ds-radius-md)',
                  }}
                />
              </Stack>
            </Stack>
          </DrawerItem>

          {/* Status Filter (for bookings) */}
          {(entityType === 'all' || entityType === 'booking') && (
            <DrawerItem>
              <Stack spacing="sm">
                <Text weight="medium" style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                  Booking status
                </Text>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2)',
                    fontSize: 'var(--ds-font-size-sm)',
                    border: '1px solid var(--ds-color-neutral-300)',
                    borderRadius: 'var(--ds-radius-md)',
                  }}
                >
                  <option value="">Alle statuser</option>
                  <option value="pending">Ventende</option>
                  <option value="confirmed">Bekreftet</option>
                  <option value="completed">Fullført</option>
                  <option value="cancelled">Kansellert</option>
                </select>
              </Stack>
            </DrawerItem>
          )}

          {/* Apply Button */}
          <div style={{ padding: 'var(--ds-spacing-4)' }}>
            <Button
              variant="primary"
              onClick={handleCloseFilters}
              style={{ width: '100%' }} type="button"
            >
              Bruk filtre
            </Button>
          </div>
        </DrawerSection>
      </Drawer>
    </Stack>
  );
}
