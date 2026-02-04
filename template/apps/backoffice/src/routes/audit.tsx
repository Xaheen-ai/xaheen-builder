/**
 * Audit Log Page
 * Admin view for viewing system audit trail with filters and details
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex filter form with native elements */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  HeaderSearch,
  Drawer,
  DrawerSection,
  Stack,
  Badge,
  FilterIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@xaheen/ds';

import {
  useAuditLog,
  useUsers,
  useListings,
} from '@xaheen/sdk';
import type { AuditLogEntry, AuditQueryParams } from '@xaheen/sdk';
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

// Resource type options
const RESOURCE_OPTIONS = [
  { id: 'all', label: 'Alle ressurser' },
  { id: 'listing', label: 'Lokaler' },
  { id: 'booking', label: 'Bookinger' },
  { id: 'user', label: 'Brukere' },
  { id: 'organization', label: 'Organisasjoner' },
  { id: 'allocation', label: 'Allokeringer' },
  { id: 'settings', label: 'Innstillinger' },
];

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

// Helper to get resource label
function getResourceLabel(resource: string): string {
  switch (resource) {
    case 'listing':
      return 'Lokale';
    case 'booking':
      return 'Booking';
    case 'user':
      return 'Bruker';
    case 'organization':
      return 'Organisasjon';
    case 'allocation':
      return 'Allokering';
    case 'settings':
      return 'Innstillinger';
    default:
      return resource;
  }
}

export function AuditPage() {
  const { locale } = useLocale();
  const formatLocale = locale === 'en' ? 'en-US' : 'nb-NO';

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEntry | null>(null);
  const [page, setPage] = useState(1);

  // Filter state
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Build query params
  const queryParams: AuditQueryParams = useMemo(() => {
    const params: AuditQueryParams = {
      page,
      limit: 25,
    };
    if (resourceFilter !== 'all') params.resource = resourceFilter;
    if (actionFilter !== 'all') params.action = actionFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, resourceFilter, actionFilter, startDate, endDate]);

  // Data fetching
  const { data: auditData, isLoading, error } = useAuditLog(queryParams);
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: listingsData } = useListings({ limit: 100 });

  // Create lookup maps
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.data?.forEach((user: { id: string; name?: string; email?: string }) => {
      map.set(user.id, user.name || user.email || 'Ukjent');
    });
    return map;
  }, [usersData]);

  const listingNameMap = useMemo(() => {
    const map = new Map<string, string>();
    listingsData?.data?.forEach((listing: { id: string; name: string }) => {
      map.set(listing.id, listing.name);
    });
    return map;
  }, [listingsData]);

  // Filter events by search
  const events = useMemo(() => {
    if (!auditData?.data) return [];
    if (!searchQuery) return auditData.data;

    const query = searchQuery.toLowerCase();
    return auditData.data.filter((event: AuditLogEntry) => {
      const userName = userNameMap.get(event.userId || '') || '';
      const resourceName = event.resource || '';
      return (
        userName.toLowerCase().includes(query) ||
        resourceName.toLowerCase().includes(query) ||
        event.resourceId?.toLowerCase().includes(query)
      );
    });
  }, [auditData, searchQuery, userNameMap]);

  // Pagination
  const totalPages = auditData?.meta?.totalPages || 1;
  const totalCount = auditData?.meta?.total || events.length;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value || '');
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setResourceFilter('all');
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const hasActiveFilters = resourceFilter !== 'all' || actionFilter !== 'all' || startDate || endDate;

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return {
      date: formatDate(timestamp, formatLocale),
      time: formatTime(timestamp, formatLocale),
    };
  };

  // Get display value for resource
  const getResourceDisplay = (event: AuditLogEntry): string => {
    if (event.resource === 'listing' && event.resourceId) {
      return listingNameMap.get(event.resourceId) || event.resourceId.slice(0, 8);
    }
    return event.resourceId?.slice(0, 8) || '-';
  };

  return (
    <>
      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        position="right"
       
        title="Filtrer hendelser"
      >
        <DrawerSection title="Ressurstype">
          <Stack spacing="var(--ds-spacing-2)">
            {RESOURCE_OPTIONS.map((option) => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  cursor: 'pointer',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor:
                    resourceFilter === option.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="resource"
                  value={option.id}
                  checked={resourceFilter === option.id}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  style={{ accentColor: 'var(--ds-color-accent-base-default)' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Handling">
          <Stack spacing="var(--ds-spacing-2)">
            {ACTION_OPTIONS.map((option) => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  cursor: 'pointer',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor:
                    actionFilter === option.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="action"
                  value={option.id}
                  checked={actionFilter === option.id}
                  onChange={(e) => setActionFilter(e.target.value)}
                  style={{ accentColor: 'var(--ds-color-accent-base-default)' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Tidsperiode">
          <Stack spacing="var(--ds-spacing-2)">
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
                Fra dato
              </Paragraph>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
                Til dato
              </Paragraph>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              />
            </div>
          </Stack>
        </DrawerSection>

        {hasActiveFilters && (
          <div style={{ padding: 'var(--ds-spacing-4)' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              style={{ width: '100%' }}
            >
              Nullstill filtre
            </Button>
          </div>
        )}
      </Drawer>

      {/* Event Detail Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        position="right"
       
        title="Hendelsesdetaljer"
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
                    {getResourceLabel(selectedEvent.resource)}
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
                    {formatTimestamp(selectedEvent.timestamp).date} {formatTimestamp(selectedEvent.timestamp).time}
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
                    {userNameMap.get(selectedEvent.userId || '') || 'System'}
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
              <DrawerSection title="Metadata">
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
                  <Badge data-color={selectedEvent.severity === 'error' || selectedEvent.severity === 'critical' ? 'danger' : 'neutral'}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                {selectedEvent.userAgent && (
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
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

      {/* Main Content */}
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--ds-spacing-6)',
          }}
        >
          <div>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              Revisjonslogg
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Oversikt over alle systemhendelser og endringer
            </Paragraph>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-4)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}>
            <HeaderSearch
              placeholder="Søk i hendelser..."
              value={searchValue}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsFilterOpen(true)}
            style={{ position: 'relative' }}
          >
            <FilterIcon />
            Filter
            {hasActiveFilters && (
              <span
                style={{
                  position: 'absolute',
                  top: 'calc(-1 * var(--ds-spacing-1))',
                  right: 'calc(-1 * var(--ds-spacing-1))',
                  width: '8px',
                  height: '8px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                }}
              />
            )}
          </Button>

          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {totalCount} hendelser
          </Paragraph>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-4)',
              flexWrap: 'wrap',
            }}
          >
            {resourceFilter !== 'all' && (
              <Badge data-color="neutral">
                {RESOURCE_OPTIONS.find((o) => o.id === resourceFilter)?.label}
                <button
                  type="button"
                  onClick={() => setResourceFilter('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <CloseIcon style={{ width: '12px', height: '12px' }} />
                </button>
              </Badge>
            )}
            {actionFilter !== 'all' && (
              <Badge data-color="neutral">
                {ACTION_OPTIONS.find((o) => o.id === actionFilter)?.label}
                <button
                  type="button"
                  onClick={() => setActionFilter('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <CloseIcon style={{ width: '12px', height: '12px' }} />
                </button>
              </Badge>
            )}
            {(startDate || endDate) && (
              <Badge data-color="neutral">
                {startDate || '...'} - {endDate || '...'}
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <CloseIcon style={{ width: '12px', height: '12px' }} />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
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
          ) : error ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--ds-spacing-10)',
              }}
            >
              <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
                Kunne ikke laste revisjonslogg
              </Paragraph>
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--ds-spacing-10)',
              }}
            >
              <Paragraph data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                Ingen hendelser funnet
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {hasActiveFilters
                  ? 'Prøv å justere filtrene dine'
                  : 'Ingen hendelser er registrert ennå'}
              </Paragraph>
            </div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                    <Table.HeaderCell>Handling</Table.HeaderCell>
                    <Table.HeaderCell>Ressurs</Table.HeaderCell>
                    <Table.HeaderCell>Ressurs-ID</Table.HeaderCell>
                    <Table.HeaderCell>Bruker</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: 'var(--ds-spacing-12)' }}></Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {events.map((event: AuditLogEntry) => {
                    const { date, time } = formatTimestamp(event.timestamp);
                    return (
                      <Table.Row
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Table.Cell>
                          <div>
                            <Paragraph data-size="sm" style={{ margin: 0 }}>
                              {date}
                            </Paragraph>
                            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {time}
                            </Paragraph>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge data-color={getActionColor(event.action)}>
                            {getActionLabel(event.action)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>
                            {getResourceLabel(event.resource)}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                            {getResourceDisplay(event)}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>
                            {userNameMap.get(event.userId || '') || 'System'}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            type="button"
                            variant="tertiary"
                            data-size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            aria-label="Se detaljer"
                          >
                            &rarr;
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    padding: 'var(--ds-spacing-4)',
                    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon />
                    Forrige
                  </Button>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    Side {page} av {totalPages}
                  </Paragraph>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Neste
                    <ChevronRightIcon />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
