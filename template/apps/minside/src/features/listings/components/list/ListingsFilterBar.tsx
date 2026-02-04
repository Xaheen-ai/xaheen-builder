/**
 * Listings Filter Bar
 * Enhanced search, type tabs, and filter controls using DS components
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Dropdown,
  Tabs,
  Dialog,
  Heading,
  Textfield,
  ListingToolbar,
  FilterIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import { useListingPermissions } from '../../hooks/useListingPermissions';
import { TYPE_TABS, STATUS_OPTIONS, SORT_OPTIONS } from '../../hooks/useListingFilters';
import type { ListingQueryFilters, ViewMode } from '../../types';
import type { ListingType } from '@xaheen/sdk';

interface ListingsFilterBarProps {
  filters: ListingQueryFilters;
  viewMode: ViewMode;
  onFilterChange: <K extends keyof ListingQueryFilters>(key: K, value: ListingQueryFilters[K]) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  totalCount?: number;
}

// Capacity filter options
const CAPACITY_OPTIONS = [
  { id: 'any', label: 'Alle størrelser', min: undefined, max: undefined },
  { id: '1-10', label: '1-10 personer', min: 1, max: 10 },
  { id: '11-25', label: '11-25 personer', min: 11, max: 25 },
  { id: '26-50', label: '26-50 personer', min: 26, max: 50 },
  { id: '51-100', label: '51-100 personer', min: 51, max: 100 },
  { id: '100+', label: 'Over 100 personer', min: 101, max: undefined },
];

export function ListingsFilterBar({
  filters,
  viewMode,
  onFilterChange,
  onViewModeChange,
  onResetFilters,
  activeFilterCount,
  totalCount,
}: ListingsFilterBarProps) {
  const navigate = useNavigate();
  const { permissions } = useListingPermissions();
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Partial<ListingQueryFilters>>({});

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || '')) {
        onFilterChange('search', searchValue || undefined);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onFilterChange('search', undefined);
  };

  const handleTypeChange = (typeId: string) => {
    onFilterChange('type', typeId === 'ALL' ? undefined : (typeId as ListingType));
  };

  const handleStatusChange = (statusId: string) => {
    onFilterChange('status', statusId === 'all' ? undefined : statusId as ListingQueryFilters['status']);
  };

  const handleSortChange = (sortId: string) => {
    const sortOption = SORT_OPTIONS.find((opt) => opt.id === sortId);
    if (sortOption) {
      onFilterChange('sortBy', sortOption.field);
      onFilterChange('sortOrder', sortOption.order);
    }
  };

  // Map ViewMode to ListingToolbar ViewMode
  const handleViewModeChange = (mode: 'grid' | 'list' | 'map') => {
    if (mode === 'grid') {
      onViewModeChange('grid');
    } else if (mode === 'list') {
      onViewModeChange('table');
    }
  };

  const toolbarViewMode = viewMode === 'grid' ? 'grid' : 'list';

  const currentSort = SORT_OPTIONS.find(
    (opt) => opt.field === filters.sortBy && opt.order === filters.sortOrder
  ) || SORT_OPTIONS[0];

  // Filter modal handlers
  const openFilterModal = useCallback(() => {
    const newFilters: Partial<ListingQueryFilters> = {};
    if (filters.minCapacity !== undefined) newFilters.minCapacity = filters.minCapacity;
    if (filters.maxCapacity !== undefined) newFilters.maxCapacity = filters.maxCapacity;
    if (filters.city) newFilters.city = filters.city;
    if (filters.hasBookingConfig !== undefined) newFilters.hasBookingConfig = filters.hasBookingConfig;
    setTempFilters(newFilters);
    setFilterModalOpen(true);
  }, [filters]);

  const applyFilters = useCallback(() => {
    if (tempFilters.minCapacity !== undefined) {
      onFilterChange('minCapacity', tempFilters.minCapacity);
    } else {
      onFilterChange('minCapacity', undefined);
    }
    if (tempFilters.maxCapacity !== undefined) {
      onFilterChange('maxCapacity', tempFilters.maxCapacity);
    } else {
      onFilterChange('maxCapacity', undefined);
    }
    if (tempFilters.city) {
      onFilterChange('city', tempFilters.city);
    } else {
      onFilterChange('city', undefined);
    }
    if (tempFilters.hasBookingConfig !== undefined) {
      onFilterChange('hasBookingConfig', tempFilters.hasBookingConfig);
    } else {
      onFilterChange('hasBookingConfig', undefined);
    }
    setFilterModalOpen(false);
  }, [tempFilters, onFilterChange]);

  const handleCapacityChange = (optionId: string) => {
    const option = CAPACITY_OPTIONS.find((o) => o.id === optionId);
    if (option) {
      setTempFilters((prev) => {
        const newFilters = { ...prev };
        if (option.min !== undefined) {
          newFilters.minCapacity = option.min;
        } else {
          delete newFilters.minCapacity;
        }
        if (option.max !== undefined) {
          newFilters.maxCapacity = option.max;
        } else {
          delete newFilters.maxCapacity;
        }
        return newFilters;
      });
    }
  };

  const getCurrentCapacityOption = () => {
    const { minCapacity, maxCapacity } = tempFilters;
    if (minCapacity === undefined && maxCapacity === undefined) return 'any';
    return CAPACITY_OPTIONS.find(
      (o) => o.min === minCapacity && o.max === maxCapacity
    )?.id || 'any';
  };

  // Get active filter summary for chips
  const getActiveFilterChips = () => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.status) {
      const statusLabel = STATUS_OPTIONS.find((o) => o.id === filters.status)?.label || filters.status;
      chips.push({
        key: 'status',
        label: statusLabel,
        onRemove: () => onFilterChange('status', undefined),
      });
    }

    if (filters.minCapacity || filters.maxCapacity) {
      const capacityOption = CAPACITY_OPTIONS.find(
        (o) => o.min === filters.minCapacity && o.max === filters.maxCapacity
      );
      chips.push({
        key: 'capacity',
        label: capacityOption?.label || `${filters.minCapacity || 0}-${filters.maxCapacity || '∞'} pers`,
        onRemove: () => {
          onFilterChange('minCapacity', undefined);
          onFilterChange('maxCapacity', undefined);
        },
      });
    }

    if (filters.city) {
      chips.push({
        key: 'city',
        label: filters.city,
        onRemove: () => onFilterChange('city', undefined),
      });
    }

    if (filters.hasBookingConfig !== undefined) {
      chips.push({
        key: 'booking',
        label: filters.hasBookingConfig ? 'Med booking' : 'Uten booking',
        onRemove: () => onFilterChange('hasBookingConfig', undefined),
      });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
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
          {totalCount !== undefined && (
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

      {/* Type Tabs */}
      <Tabs
        value={filters.type || 'ALL'}
        onChange={handleTypeChange}
      >
        <Tabs.List>
          {TYPE_TABS.map((tab) => (
            <Tabs.Tab key={tab.id} value={tab.id}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {/* Toolbar Row using ListingToolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          {/* eslint-disable-next-line digdir/prefer-ds-components -- Custom search input with icon positioning */}
          <input
            type="text"
            aria-label="Søk etter objekter"
            placeholder="Søk etter navn, sted..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: 'var(--ds-sizing-10)',
              paddingLeft: 'var(--ds-spacing-9)',
              paddingRight: searchValue ? 'var(--ds-spacing-9)' : 'var(--ds-spacing-3)',
              fontSize: 'var(--ds-font-size-sm)',
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              color: 'var(--ds-color-neutral-text-default)',
              outline: 'none',
            }}
          />
          <SearchIcon
            size={18}
            style={{
              position: 'absolute',
              left: 'var(--ds-spacing-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ds-color-neutral-text-subtle)',
              pointerEvents: 'none',
            }}
          />
          {searchValue && (
            <Button
              type="button"
              onClick={handleClearSearch}
              aria-label="Tøm søk"
              style={{
                position: 'absolute',
                right: 'var(--ds-spacing-2)',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'transparent',
                color: 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
              }}
            >
              <CloseIcon size={16} />
            </Button>
          )}
        </div>

        {/* Status Dropdown */}
        <Dropdown.TriggerContext>
          <Dropdown.Trigger>
            {STATUS_OPTIONS.find((opt) => opt.id === (filters.status || 'all'))?.label || 'Status'}
            <ChevronRightIcon size={16} style={{ transform: 'rotate(90deg)', marginLeft: 'var(--ds-spacing-1)' }} />
          </Dropdown.Trigger>
          <Dropdown placement="bottom-start">
            <Dropdown.List>
              {STATUS_OPTIONS.map((option) => (
                <Dropdown.Item key={option.id}>
                  <Dropdown.Button
                    onClick={() => handleStatusChange(option.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      minWidth: '150px',
                    }}
                  >
                    {option.label}
                    {(filters.status || 'all') === option.id && (
                      <CheckIcon size={16} style={{ color: 'var(--ds-color-accent-base-default)' }} />
                    )}
                  </Dropdown.Button>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown>
        </Dropdown.TriggerContext>

        {/* Sort Dropdown */}
        <Dropdown.TriggerContext>
          <Dropdown.Trigger>
            {currentSort?.label || 'Sorter'}
            <ChevronRightIcon size={16} style={{ transform: 'rotate(90deg)', marginLeft: 'var(--ds-spacing-1)' }} />
          </Dropdown.Trigger>
          <Dropdown placement="bottom-start">
            <Dropdown.List>
              {SORT_OPTIONS.map((option) => (
                <Dropdown.Item key={option.id}>
                  <Dropdown.Button
                    onClick={() => handleSortChange(option.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      minWidth: '150px',
                    }}
                  >
                    {option.label}
                    {currentSort?.id === option.id && (
                      <CheckIcon size={16} style={{ color: 'var(--ds-color-accent-base-default)' }} />
                    )}
                  </Dropdown.Button>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown>
        </Dropdown.TriggerContext>

        {/* More Filters Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={openFilterModal}
        >
          <FilterIcon />
          Flere filter
          {activeFilterCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-accent-contrast-default)',
                borderRadius: 'var(--ds-border-radius-full)',
                padding: 'var(--ds-spacing-05) var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-xs)',
                marginLeft: 'var(--ds-spacing-1)',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View Mode using ListingToolbar pattern */}
        <ListingToolbar
          count={totalCount || 0}
          countLabel="objekter"
          viewMode={toolbarViewMode}
          onViewModeChange={handleViewModeChange}
          availableViews={['grid', 'list']}
          showViewToggle
          className="listings-toolbar"
        />
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            flexWrap: 'wrap',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Aktive filter:
          </Paragraph>
          {activeChips.map((chip) => (
            // eslint-disable-next-line digdir/prefer-ds-components -- Custom styled chip button with specific appearance
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Fjern filter: ${chip.label}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-text-default)',
                border: '1px solid var(--ds-color-accent-border-subtle)',
                borderRadius: 'var(--ds-border-radius-full)',
                fontSize: 'var(--ds-font-size-sm)',
                cursor: 'pointer',
                height: '32px',
              }}
            >
              {chip.label}
              <CloseIcon size={14} />
            </button>
          ))}
          <Button
            type="button"
            onClick={onResetFilters}
            style={{
              padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
              backgroundColor: 'transparent',
              color: 'var(--ds-color-neutral-text-subtle)',
              border: 'none',
              fontSize: 'var(--ds-font-size-sm)',
              cursor: 'pointer',
              textDecoration: 'underline',
              height: '32px',
            }}
          >
            Nullstill alle
          </Button>
        </div>
      )}

      {/* Filter Modal */}
      <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)}>
        <Dialog.Block>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              Flere filter
            </Heading>
            <Button
              type="button"
              onClick={() => setFilterModalOpen(false)}
              aria-label="Lukk"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'transparent',
                color: 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
              }}
            >
              <CloseIcon size={20} />
            </Button>
          </div>
        </Dialog.Block>

        <Dialog.Block>
          {/* Capacity Filter */}
          <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
            <Paragraph
              data-size="sm"
              style={{
                fontWeight: 'var(--ds-font-weight-medium)',
                margin: 0,
                marginBottom: 'var(--ds-spacing-3)',
              }}
            >
              Kapasitet
            </Paragraph>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              {CAPACITY_OPTIONS.map((option) => (
                // eslint-disable-next-line digdir/prefer-ds-components -- Custom styled radio group with complex styling
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    cursor: 'pointer',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: getCurrentCapacityOption() === option.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Custom styled radio input */}
                  <input
                    type="radio"
                    name="capacity"
                    checked={getCurrentCapacityOption() === option.id}
                    onChange={() => handleCapacityChange(option.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                  <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
            <Textfield
              label="By"
              placeholder="F.eks. Oslo, Bergen..."
              value={tempFilters.city || ''}
              onChange={(e) => {
                const value = e.target.value;
                setTempFilters((prev) => {
                  const newFilters = { ...prev };
                  if (value) {
                    newFilters.city = value;
                  } else {
                    delete newFilters.city;
                  }
                  return newFilters;
                });
              }}
            />
          </div>

          {/* Booking Config Filter */}
          <div>
            <Paragraph
              data-size="sm"
              style={{
                fontWeight: 'var(--ds-font-weight-medium)',
                margin: 0,
                marginBottom: 'var(--ds-spacing-2)',
              }}
            >
              Booking
            </Paragraph>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {/* eslint-disable-next-line digdir/prefer-ds-components -- Custom styled checkbox with complex behavior */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  cursor: 'pointer',
                }}
              >
                {/* eslint-disable-next-line digdir/prefer-ds-components -- Custom styled checkbox */}
                <input
                  type="checkbox"
                  checked={tempFilters.hasBookingConfig === true}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setTempFilters((prev) => {
                      const newFilters = { ...prev };
                      if (checked) {
                        newFilters.hasBookingConfig = true;
                      } else {
                        delete newFilters.hasBookingConfig;
                      }
                      return newFilters;
                    });
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--ds-color-accent-base-default)',
                  }}
                />
                <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>Kun med booking aktivert</span>
              </label>
            </div>
          </div>
        </Dialog.Block>

        <Dialog.Block>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTempFilters({});
                setFilterModalOpen(false);
              }}
            >
              Nullstill
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={applyFilters}
            >
              Bruk filter
            </Button>
          </div>
        </Dialog.Block>
      </Dialog>
    </div>
  );
}
