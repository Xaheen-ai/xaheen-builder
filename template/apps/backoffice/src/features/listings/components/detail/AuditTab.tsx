/**
 * Audit Tab Component
 * Displays audit trail for a specific listing with filtering
 * Shows timestamp, actor, and action for all listing-related events
 */

/* eslint-disable digdir/prefer-ds-components -- Filter form with native HTML elements */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  HeaderSearch,
  Badge,
  Drawer,
  DrawerSection,
  Stack,
  FilterIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@xaheen/ds';

import {
  useAuditLog,
  useUsers,
  type AuditLogEntry,
  type AuditQueryParams,
} from '@xaheen/sdk';
import { useLocale } from '@xaheen/i18n';

// Helper to format date
function formatDate(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Helper to format time
function formatTime(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Action type options
const ACTION_OPTIONS = [
  { id: 'all', label: 'Alle handlinger' },
  { id: 'create', label: 'Opprettet' },
  { id: 'read', label: 'Lest' },
  { id: 'update', label: 'Oppdatert' },
  { id: 'delete', label: 'Slettet' },
];

// Helper to get action badge color
function getActionColor(action: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  switch (action) {
    case 'create':
      return 'success';
    case 'read':
      return 'info';
    case 'update':
      return 'warning';
    case 'delete':
      return 'danger';
    default:
      return 'neutral';
  }
}

// Helper to get action label
function getActionLabel(action: string): string {
  switch (action) {
    case 'create':
      return 'Opprettet';
    case 'read':
      return 'Lest';
    case 'update':
      return 'Oppdatert';
    case 'delete':
      return 'Slettet';
    default:
      return action;
  }
}

interface AuditTabProps {
  listingId: string;
}

export function AuditTab({ listingId }: AuditTabProps) {
  const { locale } = useLocale();
  const formatLocale = locale === 'en' ? 'en-US' : 'nb-NO';

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEntry | null>(null);
  const [page, setPage] = useState(1);

  // Filter state
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Build query params - filter by this listing's ID
  const queryParams: AuditQueryParams = useMemo(() => {
    const params: AuditQueryParams = {
      resourceId: listingId,
      resource: 'listing',
      page,
      limit: 25,
    };
    if (actionFilter !== 'all') params.action = actionFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [listingId, page, actionFilter, startDate, endDate]);

  // Data fetching
  const { data: auditData, isLoading, error } = useAuditLog(queryParams);
  const { data: usersData } = useUsers({ limit: 100 });

  // Create user lookup map
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.data?.forEach((user: { id: string; name?: string; email?: string }) => {
      map.set(user.id, user.name || user.email || 'Ukjent');
    });
    return map;
  }, [usersData]);

  // Filter events by search
  const events = useMemo(() => {
    if (!auditData?.data) return [];
    if (!searchQuery) return auditData.data;

    const query = searchQuery.toLowerCase();
    return auditData.data.filter((event: AuditLogEntry) => {
      const userName = userNameMap.get(event.userId || '') || '';
      const action = getActionLabel(event.action).toLowerCase();
      return (
        userName.toLowerCase().includes(query) ||
        action.includes(query) ||
        event.action.toLowerCase().includes(query)
      );
    });
  }, [auditData, searchQuery, userNameMap]);

  // Pagination
  const totalPages = auditData?.meta?.totalPages || 1;
  const totalCount = auditData?.meta?.total || 0;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value || '');
    setPage(1); // Reset to first page on search
  }, []);

  const handleRowClick = useCallback((event: AuditLogEntry) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const handleResetFilters = useCallback(() => {
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchValue('');
    setSearchQuery('');
    setPage(1);
  }, []);

  // Count active filters
  const activeFilters = useMemo(() => {
    let count = 0;
    if (actionFilter !== 'all') count++;
    if (startDate) count++;
    if (endDate) count++;
    if (searchQuery) count++;
    return count;
  }, [actionFilter, startDate, endDate, searchQuery]);

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '300px',
        }}
      >
        <Spinner aria-label="Laster endringslogg..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Kunne ikke laste endringslogg
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Det oppstod en feil ved lasting av endringsloggen.
        </Paragraph>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
            Endringslogg
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {totalCount} {totalCount === 1 ? 'hendelse' : 'hendelser'}
          </Paragraph>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsFilterOpen(true)}
          style={{ position: 'relative' }}
        >
          <FilterIcon size={16} />
          Filtrer
          {activeFilters > 0 && (
            <Badge
              color="info"
              style={{
                position: 'absolute',
                top: 'calc(-1 * var(--ds-spacing-2))',
                right: 'calc(-1 * var(--ds-spacing-2))',
                minWidth: '20px',
                height: '20px',
                padding: '0 var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-body-xs)',
              }}
            >
              {activeFilters}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <HeaderSearch
          value={searchValue}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          placeholder="Søk etter aktør eller handling..."
        />
      </div>

      {/* Empty state */}
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-10)' }}>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen hendelser
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {activeFilters > 0
              ? 'Ingen hendelser matcher de valgte filtrene.'
              : 'Ingen hendelser registrert for dette objektet ennå.'}
          </Paragraph>
          {activeFilters > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetFilters}
              style={{ marginTop: 'var(--ds-spacing-4)' }}
            >
              Nullstill filtre
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <Table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: 'var(--ds-spacing-3)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                >
                  Tidspunkt
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: 'var(--ds-spacing-3)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                >
                  Aktør
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: 'var(--ds-spacing-3)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                >
                  Handling
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: 'var(--ds-spacing-3)',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                >
                  Alvorlighetsgrad
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => handleRowClick(event)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td
                    style={{
                      padding: 'var(--ds-spacing-3)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {formatDate(event.timestamp, formatLocale)}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {formatTime(event.timestamp, formatLocale)}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: 'var(--ds-spacing-3)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    {event.userId ? userNameMap.get(event.userId) || 'Ukjent bruker' : 'System'}
                  </td>
                  <td
                    style={{
                      padding: 'var(--ds-spacing-3)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <Badge color={getActionColor(event.action)}>{getActionLabel(event.action)}</Badge>
                  </td>
                  <td
                    style={{
                      padding: 'var(--ds-spacing-3)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      fontSize: 'var(--ds-font-size-sm)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {event.severity}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-4)',
                marginTop: 'var(--ds-spacing-6)',
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                <ChevronLeftIcon size={16} />
                Forrige
              </Button>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                Side {page} av {totalPages}
              </Paragraph>
              <Button
                type="button"
                variant="secondary"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Neste
                <ChevronRightIcon size={16} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtrer hendelser"
        position="right"
      >
        <DrawerSection>
          <Stack spacing={4}>
            {/* Action Filter */}
            <div>
              <label
                htmlFor="action-filter"
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                Handling
              </label>
              <select
                id="action-filter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-md)',
                  fontFamily: 'inherit',
                }}
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label
                htmlFor="start-date"
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                Fra dato
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-md)',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                Til dato
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-md)',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Reset Button */}
            {activeFilters > 0 && (
              <Button type="button" variant="secondary" onClick={handleResetFilters}>
                <CloseIcon size={16} />
                Nullstill filtre
              </Button>
            )}
          </Stack>
        </DrawerSection>
      </Drawer>

      {/* Event Detail Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={handleCloseDrawer}
        title="Hendelsesdetaljer"
        position="right"
        size="lg"
      >
        {selectedEvent && (
          <>
            <DrawerSection title="Oversikt">
              <Stack spacing="var(--ds-spacing-3)">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Handling
                  </Paragraph>
                  <Badge data-color={getActionColor(selectedEvent.action)}>
                    {getActionLabel(selectedEvent.action)}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Ressurs
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    Lokale
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Ressurs-ID
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                    {selectedEvent.resourceId || '-'}
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Tidspunkt
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {formatDate(selectedEvent.timestamp, formatLocale)}{' '}
                    {formatTime(selectedEvent.timestamp, formatLocale)}
                  </Paragraph>
                </div>
              </Stack>
            </DrawerSection>

            <DrawerSection title="Utført av">
              <Stack spacing="var(--ds-spacing-2)">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Bruker
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {selectedEvent.userId
                      ? userNameMap.get(selectedEvent.userId) || 'Ukjent bruker'
                      : 'System'}
                  </Paragraph>
                </div>
                {selectedEvent.userId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Bruker-ID
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {selectedEvent.userId.slice(0, 8)}...
                    </Paragraph>
                  </div>
                )}
                {selectedEvent.ipAddress && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      IP-adresse
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {selectedEvent.ipAddress}
                    </Paragraph>
                  </div>
                )}
              </Stack>
            </DrawerSection>

            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <>
                <DrawerSection title="Endringer">
                  {selectedEvent.metadata.before && selectedEvent.metadata.after ? (
                    <div>
                      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                        <Paragraph
                          data-size="sm"
                          style={{
                            margin: 0,
                            marginBottom: 'var(--ds-spacing-2)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                          }}
                        >
                          Før
                        </Paragraph>
                        <div
                          style={{
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            padding: 'var(--ds-spacing-3)',
                            overflow: 'auto',
                            maxHeight: '200px',
                          }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              fontSize: 'var(--ds-font-size-xs)',
                              fontFamily: 'var(--ds-font-family-monospace)',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {JSON.stringify(selectedEvent.metadata.before, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <Paragraph
                          data-size="sm"
                          style={{
                            margin: 0,
                            marginBottom: 'var(--ds-spacing-2)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                          }}
                        >
                          Etter
                        </Paragraph>
                        <div
                          style={{
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            padding: 'var(--ds-spacing-3)',
                            overflow: 'auto',
                            maxHeight: '200px',
                          }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              fontSize: 'var(--ds-font-size-xs)',
                              fontFamily: 'var(--ds-font-family-monospace)',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {JSON.stringify(selectedEvent.metadata.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Ingen endringsdata tilgjengelig
                    </Paragraph>
                  )}
                </DrawerSection>

                <DrawerSection title="Full hendelse (JSON)">
                  <div
                    style={{
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      padding: 'var(--ds-spacing-3)',
                      overflow: 'auto',
                      maxHeight: '300px',
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: 'var(--ds-font-size-xs)',
                        fontFamily: 'var(--ds-font-family-monospace)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                </DrawerSection>
              </>
            )}

            <DrawerSection title="System">
              <Stack spacing="var(--ds-spacing-2)">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Hendelse-ID
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                    {selectedEvent.id.slice(0, 8)}...
                  </Paragraph>
                </div>
                {selectedEvent.tenantId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Tenant-ID
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {selectedEvent.tenantId.slice(0, 8)}...
                    </Paragraph>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Alvorlighetsgrad
                  </Paragraph>
                  <Badge
                    data-color={
                      selectedEvent.severity === 'error' || selectedEvent.severity === 'critical'
                        ? 'danger'
                        : 'neutral'
                    }
                  >
                    {selectedEvent.severity}
                  </Badge>
                </div>
                {selectedEvent.userAgent && (
                  <div>
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        marginBottom: 'var(--ds-spacing-1)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      User Agent
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)', wordBreak: 'break-all' }}>
                      {selectedEvent.userAgent}
                    </Paragraph>
                  </div>
                )}
              </Stack>
            </DrawerSection>
          </>
        )}
      </Drawer>
    </div>
  );
}
