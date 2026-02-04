/**
 * ListingTableView - Accessible table alternative to map view
 *
 * Provides keyboard-accessible alternative to ListingMap for WCAG 2.1.1 Level A compliance.
 * Features:
 * - Full keyboard navigation (Tab, Arrow keys, Enter)
 * - Screen reader support with ARIA labels
 * - Sortable columns
 * - Responsive design with horizontal scroll
 * - Design token compliance
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import type { MapListing } from './ListingMap';

export interface ListingTableViewProps {
  listings: MapListing[];
  onListingClick?: (id: string, slug?: string) => void;
  height?: string | number;
  className?: string;
}

type SortColumn = 'name' | 'location' | 'type' | 'capacity' | 'price';
type SortDirection = 'asc' | 'desc';

export function ListingTableView({
  listings,
  onListingClick,
  height = '600px',
  className,
}: ListingTableViewProps): React.ReactElement {
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [focusedRow, setFocusedRow] = useState<number>(-1);

  // Sort listings
  const sortedListings = React.useMemo(() => {
    const sorted = [...listings].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortColumn) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'location':
          aVal = a.location || '';
          bVal = b.location || '';
          break;
        case 'type':
          aVal = a.type || '';
          bVal = b.type || '';
          break;
        case 'capacity':
          aVal = a.capacity || 0;
          bVal = b.capacity || 0;
          break;
        case 'price':
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal, 'nb')
          : bVal.localeCompare(aVal, 'nb');
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return sorted;
  }, [listings, sortColumn, sortDirection]);

  // Handle column header click for sorting
  const handleSort = useCallback((column: SortColumn) => {
    setSortDirection(prev =>
      sortColumn === column && prev === 'asc' ? 'desc' : 'asc'
    );
    setSortColumn(column);
  }, [sortColumn]);

  // Handle row click
  const handleRowClick = useCallback((listing: MapListing) => {
    onListingClick?.(listing.id, listing.slug);
  }, [onListingClick]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number, listing: MapListing) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleRowClick(listing);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < sortedListings.length - 1) {
          setFocusedRow(index + 1);
          // Focus next row
          const nextRow = document.querySelector(`[data-row-index="${index + 1}"]`) as HTMLElement;
          nextRow?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setFocusedRow(index - 1);
          // Focus previous row
          const prevRow = document.querySelector(`[data-row-index="${index - 1}"]`) as HTMLElement;
          prevRow?.focus();
        }
        break;
    }
  }, [handleRowClick, sortedListings.length]);

  // Format price
  const formatPrice = (listing: MapListing) => {
    if (!listing.price) return '–';
    return `kr ${listing.price}${listing.priceUnit ? `/${listing.priceUnit}` : ''}`;
  };

  return (
    <div
      className={className}
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Table container with scroll */}
      <div
        role="region"
        aria-label="Tabellvisning av lokaler"
        tabIndex={0}
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--ds-font-size-sm)',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                borderBottom: '2px solid var(--ds-color-neutral-border-default)',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: 'var(--ds-spacing-4)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  color: 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('name')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('name');
                  }
                }}
                tabIndex={0}
                aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Navn {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: 'var(--ds-spacing-4)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  color: 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('location')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('location');
                  }
                }}
                tabIndex={0}
                aria-sort={sortColumn === 'location' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Plassering {sortColumn === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: 'var(--ds-spacing-4)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  color: 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('type')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('type');
                  }
                }}
                tabIndex={0}
                aria-sort={sortColumn === 'type' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Type {sortColumn === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'right',
                  padding: 'var(--ds-spacing-4)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  color: 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('capacity')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('capacity');
                  }
                }}
                tabIndex={0}
                aria-sort={sortColumn === 'capacity' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Kapasitet {sortColumn === 'capacity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'right',
                  padding: 'var(--ds-spacing-4)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  color: 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleSort('price')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('price');
                  }
                }}
                tabIndex={0}
                aria-sort={sortColumn === 'price' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Pris {sortColumn === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedListings.map((listing, index) => (
              <tr
                key={listing.id}
                data-row-index={index}
                tabIndex={0}
                role="button"
                aria-label={`Vis detaljer for ${listing.name}`}
                onClick={() => handleRowClick(listing)}
                onKeyDown={(e) => handleKeyDown(e, index, listing)}
                style={{
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  cursor: 'pointer',
                  backgroundColor: focusedRow === index
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'var(--ds-color-neutral-surface-default)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = focusedRow === index
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'var(--ds-color-neutral-surface-default)';
                }}
                onFocus={() => setFocusedRow(index)}
                onBlur={() => setFocusedRow(-1)}
              >
                <td
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
                  }}
                >
                  {listing.name}
                </td>
                <td
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {listing.location}
                </td>
                <td
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {listing.type || '–'}
                </td>
                <td
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    color: 'var(--ds-color-neutral-text-default)',
                    textAlign: 'right',
                  }}
                >
                  {listing.capacity ? `${listing.capacity} personer` : '–'}
                </td>
                <td
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    color: 'var(--ds-color-neutral-text-default)',
                    textAlign: 'right',
                    fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
                  }}
                >
                  {formatPrice(listing)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with listing count */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-neutral-text-subtle)',
          textAlign: 'center',
        }}
      >
        Viser {sortedListings.length} {sortedListings.length === 1 ? 'lokale' : 'lokaler'}
      </div>

      <style>{`
        /* Responsive table styles */
        @media (max-width: 991px) {
          table {
            font-size: var(--ds-font-size-xs);
          }
          th, td {
            padding: var(--ds-spacing-2) var(--ds-spacing-3) !important;
          }
        }

        /* Focus indicator for table rows */
        tr[role="button"]:focus {
          outline: 3px solid var(--ds-color-focus-outer);
          outline-offset: -3px;
        }

        tr[role="button"]:focus-visible {
          outline: 3px solid var(--ds-color-focus-outer);
          outline-offset: -3px;
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          tr {
            transition: none !important;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          tr[role="button"]:focus {
            outline-width: 4px;
          }
        }
      `}</style>
    </div>
  );
}

export default ListingTableView;
