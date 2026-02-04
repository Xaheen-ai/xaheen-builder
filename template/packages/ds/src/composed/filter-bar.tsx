/**
 * Filter Bar Component
 * 
 * Horizontal filter bar following DIGILIST patterns.
 * Supports primary listing type filter (top-level) and secondary filters.
 */

import React, { forwardRef } from 'react';
import { Select, Button } from '@digdir/designsystemet-react';
import { Grid, Stack } from '../primitives';
import { GridIcon, ListIcon, MapIcon } from '../primitives/icons';
import type { FilterConfig, ListingType } from '../types/filters';

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Primary listing type filter (top-level)
   * This is the main filter that appears prominently at the top
   */
  primaryFilter?: {
    /** Current selected listing type */
    value: ListingType | 'ALL';
    /** Available listing type options */
    options: Array<{ id: ListingType | 'ALL'; label: string; count?: number }>;
    /** Change handler */
    onChange: (value: ListingType | 'ALL') => void;
    /** Label for the filter */
    label?: string;
  };
  
  /**
   * Secondary filter configurations
   * These appear below the primary filter
   */
  filters?: FilterConfig[];
  
  /**
   * Results count
   */
  resultsCount?: number;
  
  /**
   * Results label (e.g., "lokaler", "ressurser")
   */
  resultsLabel?: string;
  
  /**
   * View mode
   */
  viewMode?: 'grid' | 'list' | 'map';
  
  /**
   * On view mode change
   */
  onViewModeChange?: (mode: 'grid' | 'list' | 'map') => void;
  
  /**
   * Spacing between filters
   * @default var(--ds-spacing-4)
   */
  spacing?: number | string;
  
  /**
   * Show primary filter as prominent button group
   * @default true
   */
  showPrimaryAsButtons?: boolean;
}

export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  ({
    primaryFilter,
    filters = [],
    resultsCount,
    resultsLabel = 'lokaler',
    viewMode = 'grid',
    onViewModeChange,
    spacing = 'var(--ds-spacing-4)',
    showPrimaryAsButtons = true,
    className,
    style,
    ...props
  }, ref) => {
    const spacingValue = typeof spacing === 'number' ? `${spacing}px` : spacing;

    return (
      <div
        ref={ref}
        className={className}
        style={{
          padding: 'var(--ds-spacing-6) 0',
          borderBottom: 'var(--ds-border-width-default, 1px) solid var(--ds-color-neutral-border-default)',
          ...style
        }}
        {...props}
      >
        <Stack spacing={spacingValue}>
          {/* Primary Filter - Listing Type (Top Level) */}
          {primaryFilter && (
            <div>
              {primaryFilter.label && (
                <div style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  marginBottom: 'var(--ds-spacing-2)'
                }}>
                  {primaryFilter.label}
                </div>
              )}
              {showPrimaryAsButtons ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                  {primaryFilter.options.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant={primaryFilter.value === option.id ? 'primary' : 'tertiary'}
                      onClick={() => primaryFilter.onChange(option.id)}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span style={{ marginLeft: 'var(--ds-spacing-1)', opacity: 0.8 }}>
                          ({option.count})
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <Select
                  value={primaryFilter.value}
                  onChange={(e) => primaryFilter.onChange(e.target.value as ListingType | 'ALL')}
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  {primaryFilter.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                      {option.count !== undefined ? ` (${option.count})` : ''}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          )}

          {/* Secondary Filters */}
          {filters.length > 0 && (
            <Grid
              columns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={spacingValue}
              style={{ alignItems: 'flex-end' }}
            >
              {filters.map((filter) => (
                <div key={filter.id}>
                  <div style={{
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    marginBottom: 'var(--ds-spacing-1)'
                  }}>
                    {filter.label}
                  </div>
                  {filter.type === 'select' && filter.options && (
                    <Select
                      value={typeof filter.value === 'string' ? filter.value : ''}
                      onChange={(e) => filter.onChange(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {filter.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                          {option.count !== undefined ? ` (${option.count})` : ''}
                        </option>
                      ))}
                    </Select>
                  )}
                  {filter.type === 'multiselect' && filter.options && (
                    <select
                      multiple
                      value={Array.isArray(filter.value) ? filter.value.map(String) : []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                        filter.onChange(selected);
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--ds-spacing-2)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: '1px solid var(--ds-color-neutral-border-default)',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        fontSize: 'var(--ds-font-size-sm)',
                        minHeight: '80px',
                      }}
                    >
                      {filter.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                          {option.count !== undefined ? ` (${option.count})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  {filter.helpText && (
                    <div style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      marginTop: 'var(--ds-spacing-1)'
                    }}>
                      {filter.helpText}
                    </div>
                  )}
                </div>
              ))}
            </Grid>
          )}

          {/* Results count and view toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-4)',
            paddingTop: filters.length > 0 || primaryFilter ? 'var(--ds-spacing-4)' : 0,
            borderTop: filters.length > 0 || primaryFilter ? 'var(--ds-border-width-default, 1px) solid var(--ds-color-neutral-border-subtle)' : 'none',
            marginTop: filters.length > 0 || primaryFilter ? 'var(--ds-spacing-4)' : 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              flexWrap: 'wrap'
            }}>
              {resultsCount !== undefined && (
                <>
                  <span style={{
                    fontSize: 'var(--ds-font-size-xl)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    color: 'var(--ds-color-neutral-text-default)'
                  }}>
                    {resultsCount}
                  </span>
                  <span style={{
                    fontSize: 'var(--ds-font-size-md)',
                    color: 'var(--ds-color-neutral-text-subtle)'
                  }}>
                    {resultsLabel}
                  </span>
                </>
              )}
            </div>

            {/* View mode buttons */}
            {onViewModeChange && (
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
                  onClick={() => onViewModeChange('grid')}
                  style={{ height: 'var(--ds-spacing-10)', width: 'var(--ds-spacing-10)', padding: 0 }}
                  title="Rutenett visning"
                  aria-label="Rutenett visning"
                >
                  <GridIcon size={20} />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'list' ? 'primary' : 'tertiary'}
                  onClick={() => onViewModeChange('list')}
                  style={{ height: 'var(--ds-spacing-10)', width: 'var(--ds-spacing-10)', padding: 0 }}
                  title="Liste visning"
                  aria-label="Liste visning"
                >
                  <ListIcon size={20} />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'map' ? 'primary' : 'tertiary'}
                  onClick={() => onViewModeChange('map')}
                  style={{ height: 'var(--ds-spacing-10)', width: 'var(--ds-spacing-10)', padding: 0 }}
                  title="Kart visning"
                  aria-label="Kart visning"
                >
                  <MapIcon size={20} />
                </Button>
              </div>
            )}
          </div>
        </Stack>
      </div>
    );
  }
);

FilterBar.displayName = 'FilterBar';
