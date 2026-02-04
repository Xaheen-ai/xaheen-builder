/**
 * SearchResults Component
 * Displays global search results across bookings, listings, and organizations
 * Styled consistently with bookings page and other list views
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  Stack,
  Text,
  BookingStatusBadge,
  CalendarIcon,
  BuildingIcon,
  PeopleIcon,
  ExternalLinkIcon,
} from '@xaheen/ds';

import {
  useGlobalSearch,
  type SearchParams,
  type SearchResult,
  type SearchEntityType,
  formatDate,
  formatTime,
} from '@xaheen/sdk';

interface SearchResultsProps {
  /** Search query string */
  query: string;

  /** Entity type filter */
  entityType?: SearchEntityType;

  /** Additional search filters */
  filters?: SearchParams['filters'];

  /** Callback when a result is clicked */
  onResultClick?: (result: SearchResult) => void;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

// Entity type tabs for filtering results
const ENTITY_TYPE_TABS = [
  { id: 'all', label: 'Alle', icon: '🔍' },
  { id: 'booking', label: 'Bookinger', icon: '📅' },
  { id: 'listing', label: 'Lokaler', icon: '🏢' },
  { id: 'organization', label: 'Organisasjoner', icon: '👥' },
] as const;

/**
 * SearchResults component with SDK-powered global search
 */
export function SearchResults({
  query,
  entityType = 'all',
  filters,
  onResultClick,
  className,
  style,
}: SearchResultsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchEntityType>(entityType);

  // Build search params
  const searchParams = useMemo((): SearchParams => {
    return {
      query,
      entityType: activeTab,
      filters,
      includeHighlights: true,
    };
  }, [query, activeTab, filters]);

  // Fetch search results
  const { data: searchData, isLoading, error } = useGlobalSearch(searchParams);

  // Group results by entity type
  const groupedResults = useMemo(() => {
    const results = searchData?.data ?? [];

    const groups = {
      bookings: results.filter((r) => r.type === 'booking'),
      listings: results.filter((r) => r.type === 'listing'),
      organizations: results.filter((r) => r.type === 'organization'),
    };

    return groups;
  }, [searchData]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as SearchEntityType);
  }, []);

  // Handle result click
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      if (onResultClick) {
        onResultClick(result);
        return;
      }

      // Default navigation based on entity type
      switch (result.type) {
        case 'booking':
          navigate(`/bookings/${result.entity.id}`);
          break;
        case 'listing':
          navigate(`/listings/${result.entity.id}`);
          break;
        case 'organization':
          navigate(`/organizations/${result.entity.id}`);
          break;
      }
    },
    [onResultClick, navigate]
  );

  // Render loading state
  if (isLoading) {
    return (
      <Stack spacing="lg" align="center" style={{ padding: 'var(--ds-spacing-12)', ...style }} className={className}>
        <Spinner data-size="lg" aria-label="Laster..." />
        <Text color="secondary">Søker...</Text>
      </Stack>
    );
  }

  // Render error state
  if (error) {
    return (
      <Stack spacing="md" style={{ padding: 'var(--ds-spacing-8)', ...style }} className={className}>
        <Heading level={3}>Søket feilet</Heading>
        <Paragraph color="danger">
          {error instanceof Error ? error.message : 'En ukjent feil oppstod'}
        </Paragraph>
      </Stack>
    );
  }

  const totalResults = searchData?.meta?.total ?? 0;
  const counts = searchData?.meta?.counts;

  // Render empty state
  if (totalResults === 0) {
    return (
      <Stack spacing="md" align="center" style={{ padding: 'var(--ds-spacing-12)', ...style }} className={className}>
        <Text size="lg" weight="medium">
          Ingen resultater funnet
        </Text>
        <Paragraph color="secondary">
          Prøv å justere søket ditt eller filtrene
        </Paragraph>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg" style={style} className={className}>
      {/* Header with counts */}
      <Stack spacing="sm">
        <Heading level={2}>
          Søkeresultater for "{query}"
        </Heading>
        <Paragraph color="secondary">
          {totalResults} resultat{totalResults !== 1 ? 'er' : ''} funnet
          {counts && (
            <>
              {' • '}
              {counts.bookings > 0 && `${counts.bookings} booking${counts.bookings !== 1 ? 'er' : ''}`}
              {counts.bookings > 0 && (counts.listings > 0 || counts.organizations > 0) && ', '}
              {counts.listings > 0 && `${counts.listings} lokal${counts.listings !== 1 ? 'er' : ''}`}
              {counts.listings > 0 && counts.organizations > 0 && ', '}
              {counts.organizations > 0 && `${counts.organizations} organisasjon${counts.organizations !== 1 ? 'er' : ''}`}
            </>
          )}
        </Paragraph>
      </Stack>

      {/* Entity type tabs */}
      <Stack direction="horizontal" spacing="sm">
        {ENTITY_TYPE_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? totalResults
              : tab.id === 'booking'
              ? counts?.bookings ?? 0
              : tab.id === 'listing'
              ? counts?.listings ?? 0
              : counts?.organizations ?? 0;

          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => handleTabChange(tab.id)} type="button"
            >
              {tab.icon} {tab.label} ({count})
            </Button>
          );
        })}
      </Stack>

      {/* Results sections */}
      <Stack spacing="xl">
        {/* Bookings section */}
        {(activeTab === 'all' || activeTab === 'booking') && groupedResults.bookings.length > 0 && (
          <Stack spacing="md">
            {activeTab === 'all' && (
              <Heading level={3}>
                <CalendarIcon size={20} style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }} />
                Bookinger ({groupedResults.bookings.length})
              </Heading>
            )}
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lokale</th>
                  <th>Organisasjon</th>
                  <th>Tidspunkt</th>
                  <th>Status</th>
                  <th>Pris</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupedResults.bookings.map((result) => {
                  if (result.type !== 'booking') return null;
                  const booking = result.entity;

                  return (
                    <tr key={booking.id}>
                      <td>
                        <Text size="sm">
                          {booking.id.slice(0, 8)}
                        </Text>
                      </td>
                      <td>
                        <Text weight="medium">
                          {booking.listingName || 'Ukjent lokale'}
                        </Text>
                        {result.highlight?.field === 'listingName' && (
                          <Text size="sm" color="secondary">
                            {result.highlight.snippet}
                          </Text>
                        )}
                      </td>
                      <td>
                        <Text>
                          {booking.organizationName || booking.userName || 'Ukjent'}
                        </Text>
                      </td>
                      <td>
                        <Text size="sm">
                          {formatDate(booking.startTime)} {formatTime(booking.startTime)}
                        </Text>
                      </td>
                      <td>
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td>
                        <Text weight="medium">
                          {booking.totalPrice ? `${booking.totalPrice} kr` : '-'}
                        </Text>
                      </td>
                      <td>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleResultClick(result)}
                          aria-label="Åpne booking" type="button"
                        >
                          <ExternalLinkIcon size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Stack>
        )}

        {/* Listings section */}
        {(activeTab === 'all' || activeTab === 'listing') && groupedResults.listings.length > 0 && (
          <Stack spacing="md">
            {activeTab === 'all' && (
              <Heading level={3}>
                <BuildingIcon size={20} style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }} />
                Lokaler ({groupedResults.listings.length})
              </Heading>
            )}
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Navn</th>
                  <th>Type</th>
                  <th>Lokasjon</th>
                  <th>Kapasitet</th>
                  <th>Pris/time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupedResults.listings.map((result) => {
                  if (result.type !== 'listing') return null;
                  const listing = result.entity;

                  return (
                    <tr key={listing.id}>
                      <td>
                        <Text size="sm">
                          {listing.id.slice(0, 8)}
                        </Text>
                      </td>
                      <td>
                        <Text weight="medium">{listing.name}</Text>
                        {result.highlight?.field === 'name' && (
                          <Text size="sm" color="secondary">
                            {result.highlight.snippet}
                          </Text>
                        )}
                      </td>
                      <td>
                        <Text>{listing.type || '-'}</Text>
                      </td>
                      <td>
                        <Text size="sm">
                          {listing.address?.city || listing.address?.street || '-'}
                        </Text>
                      </td>
                      <td>
                        <Text>{listing.capacity ? `${listing.capacity} pers.` : '-'}</Text>
                      </td>
                      <td>
                        <Text weight="medium">
                          {listing.basePrice ? `${listing.basePrice} kr` : '-'}
                        </Text>
                      </td>
                      <td>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleResultClick(result)}
                          aria-label="Åpne lokale" type="button"
                        >
                          <ExternalLinkIcon size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Stack>
        )}

        {/* Organizations section */}
        {(activeTab === 'all' || activeTab === 'organization') && groupedResults.organizations.length > 0 && (
          <Stack spacing="md">
            {activeTab === 'all' && (
              <Heading level={3}>
                <PeopleIcon size={20} style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }} />
                Organisasjoner ({groupedResults.organizations.length})
              </Heading>
            )}
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Navn</th>
                  <th>Org.nr</th>
                  <th>Type</th>
                  <th>E-post</th>
                  <th>Telefon</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupedResults.organizations.map((result) => {
                  if (result.type !== 'organization') return null;
                  const org = result.entity;

                  return (
                    <tr key={org.id}>
                      <td>
                        <Text size="sm">
                          {org.id.slice(0, 8)}
                        </Text>
                      </td>
                      <td>
                        <Text weight="medium">{org.name}</Text>
                        {result.highlight?.field === 'name' && (
                          <Text size="sm" color="secondary">
                            {result.highlight.snippet}
                          </Text>
                        )}
                      </td>
                      <td>
                        <Text size="sm">
                          {org.organizationNumber || '-'}
                        </Text>
                      </td>
                      <td>
                        <Text>{org.type || '-'}</Text>
                      </td>
                      <td>
                        <Text size="sm">{org.email || '-'}</Text>
                      </td>
                      <td>
                        <Text size="sm">{org.phone || '-'}</Text>
                      </td>
                      <td>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleResultClick(result)}
                          aria-label="Åpne organisasjon" type="button"
                        >
                          <ExternalLinkIcon size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Stack>
        )}
      </Stack>

      {/* Execution time footer (if available) */}
      {searchData?.meta?.executionTime && (
        <Text size="sm" style={{ textAlign: 'right' }}>
          Søk utført på {searchData.meta.executionTime}ms
        </Text>
      )}
    </Stack>
  );
}
