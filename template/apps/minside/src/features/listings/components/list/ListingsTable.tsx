/**
 * Listings Table View
 * Table display of listings with sortable columns
 */

import { Table, Paragraph, Spinner, ListingStatusBadge, Checkbox } from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import { ListingRowActions } from './ListingRowActions';
import type { Listing, ListingStatus } from '@xaheen/sdk';
import type { ListingQueryFilters } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ListingsTableProps {
  listings: Listing[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectAll: (selected: boolean) => void;
  onSelectOne: (id: string, selected: boolean) => void;
  onSort: (field: ListingQueryFilters['sortBy']) => void;
  sortBy?: ListingQueryFilters['sortBy'];
  sortOrder?: ListingQueryFilters['sortOrder'];
  onRefresh?: () => void;
}

/**
 * Map listing type to Norwegian label
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FACILITY: 'Anlegg',
    LOCALE: 'Lokale',
    EQUIPMENT: 'Utstyr',
    EVENT: 'Arrangement',
    OTHER: 'Annet',
    SPACE: 'Lokale',
    RESOURCE: 'Ressurs',
    SERVICE: 'Tjeneste',
    VEHICLE: 'Kjøretøy',
  };
  return labels[type] || type;
}

/**
 * Format relative time in Norwegian
 */
function formatRelativeTime(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: nb });
  } catch {
    return '-';
  }
}

export function ListingsTable({
  listings,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onSort,
  sortBy,
  sortOrder,
  onRefresh,
}: ListingsTableProps) {
  const navigate = useNavigate();
  const allSelected = listings.length > 0 && selectedIds.length === listings.length;

  const handleRowClick = (id: string) => {
    navigate(`/listings/${id}`);
  };

  const getSortIndicator = (field: ListingQueryFilters['sortBy']) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
        }}
      >
        <Spinner aria-label="Laster..." />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Ingen utleieobjekter funnet
        </Paragraph>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Prøv å endre søkekriteriene eller opprett et nytt objekt
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell style={{ width: '48px' }}>
              <Checkbox
                aria-label="Velg alle"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => onSort('name')}
            >
              Navn{getSortIndicator('name')}
            </Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Lokasjon</Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => onSort('updatedAt')}
            >
              Sist oppdatert{getSortIndicator('updatedAt')}
            </Table.HeaderCell>
            <Table.HeaderCell style={{ width: '60px' }} />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {listings.map((listing) => (
            <Table.Row
              key={listing.id}
              onClick={() => handleRowClick(listing.id)}
              style={{ cursor: 'pointer' }}
            >
              <Table.Cell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  aria-label={`Velg ${listing.name}`}
                  checked={selectedIds.includes(listing.id)}
                  onChange={(e) => onSelectOne(listing.id, e.target.checked)}
                />
              </Table.Cell>
              <Table.Cell>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                      backgroundImage: listing.images?.[0] ? `url(${listing.images[0]})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <Paragraph
                      data-size="sm"
                      style={{
                        fontWeight: 'var(--ds-font-weight-medium)',
                        margin: 0,
                        color: 'var(--ds-color-neutral-text-default)',
                      }}
                    >
                      {listing.name}
                    </Paragraph>
                    {listing.slug && (
                      <Paragraph
                        data-size="xs"
                        style={{
                          color: 'var(--ds-color-neutral-text-subtle)',
                          margin: 0,
                        }}
                      >
                        /{listing.slug}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  {getTypeLabel(listing.type)}
                </Paragraph>
              </Table.Cell>
              <Table.Cell>
                <ListingStatusBadge status={listing.status as ListingStatus} />
              </Table.Cell>
              <Table.Cell>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {listing.metadata?.location?.city || '-'}
                </Paragraph>
              </Table.Cell>
              <Table.Cell>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {formatRelativeTime(listing.updatedAt)}
                </Paragraph>
              </Table.Cell>
              <Table.Cell onClick={(e) => e.stopPropagation()}>
                <ListingRowActions
                  listingId={listing.id}
                  listingName={listing.name}
                  status={listing.status as ListingStatus}
                  onActionComplete={onRefresh}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
