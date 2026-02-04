/**
 * SavedFilters Component
 * Manages user's saved search filters with create, apply, and delete operations
 * Integrates with SDK search hooks for filter persistence
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Filter management component */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Drawer,
  DrawerSection,
  DrawerItem,
  Heading,
  Text,
  Stack,
  Badge,
  Spinner,
  HeartIcon,
  CloseIcon,
  StarIcon,
  ClockIcon,
  PlusIcon,
  useDialog,
} from '@xaheen/ds';
import {
  useSavedFilters,
  useCreateSavedFilter,
  useDeleteSavedFilter,
  type SavedFilter,
  type CreateSavedFilterDTO,
  type SearchFilters,
  type SearchEntityType,
} from '@xaheen/sdk';

interface SavedFiltersProps {
  /** Current search filters to save (optional) */
  currentFilters?: SearchFilters;

  /** Current search query (optional) */
  currentQuery?: string;

  /** Current entity type (optional) */
  currentEntityType?: SearchEntityType;

  /** Callback when a saved filter is applied */
  onApplyFilter?: (filter: SavedFilter) => void;

  /** Show as inline list instead of button+drawer */
  inline?: boolean;

  /** Custom trigger button text */
  triggerText?: string;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * SavedFilters component for managing user's saved search filters
 */
export function SavedFilters({
  currentFilters,
  currentQuery,
  currentEntityType,
  onApplyFilter,
  inline = false,
  triggerText = 'Lagrede filtre',
  className,
  style,
}: SavedFiltersProps) {
  const { confirm } = useDialog();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // Fetch saved filters
  const { data: savedFiltersData, isLoading } = useSavedFilters({ limit: 50 });
  const createSavedFilter = useCreateSavedFilter();
  const deleteSavedFilter = useDeleteSavedFilter();

  // Extract filters list
  const savedFilters = useMemo(() => {
    return savedFiltersData?.data ?? [];
  }, [savedFiltersData]);

  // Check if there are any active filters to save
  const hasActiveFilters = useMemo(() => {
    if (!currentFilters) return false;
    return Object.keys(currentFilters).length > 0 || !!currentQuery;
  }, [currentFilters, currentQuery]);

  // Handle opening drawer
  const handleOpenDrawer = useCallback(() => {
    setIsDrawerOpen(true);
    setIsCreating(false);
    setNewFilterName('');
  }, []);

  // Handle closing drawer
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setIsCreating(false);
    setNewFilterName('');
  }, []);

  // Handle starting create flow
  const handleStartCreate = useCallback(() => {
    setIsCreating(true);
    setNewFilterName('');
  }, []);

  // Handle cancel create
  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setNewFilterName('');
  }, []);

  // Handle create saved filter
  const handleCreateFilter = useCallback(async () => {
    if (!newFilterName.trim()) {
      return;
    }

    if (!currentFilters) {
      return;
    }

    const filterData: CreateSavedFilterDTO = {
      name: newFilterName.trim(),
      filters: currentFilters,
      ...(currentQuery && { query: currentQuery }),
      ...(currentEntityType && { entityType: currentEntityType }),
      isDefault: false,
    };

    try {
      await createSavedFilter.mutateAsync(filterData);
      setIsCreating(false);
      setNewFilterName('');
    } catch (error) {
      console.error('Failed to create saved filter:', error);
    }
  }, [newFilterName, currentFilters, currentQuery, currentEntityType, createSavedFilter]);

  // Handle apply saved filter
  const handleApplyFilter = useCallback(
    (filter: SavedFilter) => {
      onApplyFilter?.(filter);
      if (!inline) {
        handleCloseDrawer();
      }
    },
    [onApplyFilter, inline, handleCloseDrawer]
  );

  // Handle delete saved filter
  const handleDeleteFilter = useCallback(
    async (filter: SavedFilter) => {
      const confirmed = await confirm({
        title: 'Slett lagret filter',
        description: `Er du sikker på at du vil slette "${filter.name}"?`,
        confirmText: 'Slett',
        cancelText: 'Avbryt',
        variant: 'danger',
      });

      if (confirmed) {
        try {
          await deleteSavedFilter.mutateAsync(filter.id);
        } catch (error) {
          console.error('Failed to delete saved filter:', error);
        }
      }
    },
    [confirm, deleteSavedFilter]
  );

  // Format last used date
  const formatLastUsed = useCallback((dateStr?: string) => {
    if (!dateStr) return 'Aldri brukt';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    if (diffDays < 7) return `${diffDays} dager siden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} uker siden`;

    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }, []);

  // Render saved filter item
  const renderFilterItem = useCallback(
    (filter: SavedFilter) => (
      <DrawerItem
        key={filter.id}
        onClick={() => handleApplyFilter(filter)}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              <Text
                style={{
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  fontSize: 'var(--ds-font-size-md)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {filter.name}
              </Text>
              {filter.isDefault && (
                <Badge variant="info" >
                  <StarIcon size={12} style={{ marginRight: 'var(--ds-spacing-1)' }} />
                  Standard
                </Badge>
              )}
            </div>

            {filter.query && (
              <Text
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-neutral-600)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 'var(--ds-spacing-1)',
                }}
              >
                Søk: {filter.query}
              </Text>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-500)',
              }}
            >
              {filter.usageCount !== undefined && filter.usageCount > 0 && (
                <span>Brukt {filter.usageCount} gang{filter.usageCount !== 1 ? 'er' : ''}</span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                <ClockIcon size={12} />
                {formatLastUsed(filter.lastUsedAt)}
              </span>
            </div>
          </div>

          <Button
            variant="tertiary"
            
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFilter(filter);
            }}
            aria-label={`Slett ${filter.name}`}
            style={{
              flexShrink: 0,
              color: 'var(--ds-color-danger-500)',
            }} type="button"
          >
            <CloseIcon size={16} />
          </Button>
        </div>
      </DrawerItem>
    ),
    [handleApplyFilter, handleDeleteFilter, formatLastUsed]
  );

  // Render content (used both for drawer and inline modes)
  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--ds-spacing-8)',
          }}
        >
          <Spinner aria-label="Laster..." />
        </div>
      );
    }

    if (savedFilters.length === 0 && !isCreating) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-8)',
            textAlign: 'center',
          }}
        >
          <HeartIcon size={48} style={{ color: 'var(--ds-color-neutral-400)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Text
            style={{
              fontSize: 'var(--ds-font-size-md)',
              color: 'var(--ds-color-neutral-600)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            Ingen lagrede filtre
          </Text>
          <Text
            style={{
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-500)',
            }}
          >
            Lagre dine ofte brukte søkefiltre for rask tilgang
          </Text>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {savedFilters.map(renderFilterItem)}
      </div>
    );
  }, [isLoading, savedFilters, isCreating, renderFilterItem]);

  // Inline mode: render as simple list
  if (inline) {
    return (
      <div className={className} style={style}>
        {renderContent()}
      </div>
    );
  }

  // Drawer mode: render with trigger button and drawer
  return (
    <>
      <Button
        variant="secondary"
        onClick={handleOpenDrawer}
        className={className}
        style={style} type="button"
      >
        <HeartIcon size={16} />
        {triggerText}
        {savedFilters.length > 0 && (
          <Badge variant="neutral"  style={{ marginLeft: 'var(--ds-spacing-2)' }}>
            {savedFilters.length}
          </Badge>
        )}
      </Button>

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} position="right">
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
            <Heading level={2} data- style={{ margin: 0 }}>
              Lagrede filtre
            </Heading>
            {hasActiveFilters && !isCreating && (
              <Button variant="primary" data- onClick={handleStartCreate} type="button">
                <PlusIcon size={16} />
                Lagre filter
              </Button>
            )}
          </div>

          {isCreating && (
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                borderBottom: '1px solid var(--ds-color-neutral-200)',
                backgroundColor: 'var(--ds-color-neutral-50)',
              }}
            >
              <Stack direction="vertical" spacing={3}>
                <Text style={{ fontWeight: 'var(--ds-font-weight-semibold)', fontSize: 'var(--ds-font-size-sm)' }}>
                  Nytt lagret filter
                </Text>
                <input
                  type="text"
                  placeholder="Filternavn (f.eks. 'Ventende bookinger denne uken')"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFilter();
                    } else if (e.key === 'Escape') {
                      handleCancelCreate();
                    }
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2)',
                    fontSize: 'var(--ds-font-size-md)',
                    border: '1px solid var(--ds-color-neutral-300)',
                    borderRadius: 'var(--ds-radius-md)',
                  }}
                />
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <Button
                    variant="primary"
                    
                    onClick={handleCreateFilter}
                    disabled={!newFilterName.trim() || createSavedFilter.isPending}
                    style={{ flex: 1 }} type="button"
                  >
                    {createSavedFilter.isPending ? 'Lagrer...' : 'Lagre'}
                  </Button>
                  <Button
                    variant="secondary"
                    
                    onClick={handleCancelCreate}
                    disabled={createSavedFilter.isPending}
                    style={{ flex: 1 }} type="button"
                  >
                    Avbryt
                  </Button>
                </div>
              </Stack>
            </div>
          )}

          {renderContent()}
        </DrawerSection>
      </Drawer>
    </>
  );
}
