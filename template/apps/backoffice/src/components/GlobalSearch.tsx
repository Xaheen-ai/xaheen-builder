/**
 * GlobalSearch Component
 * Global search with typeahead suggestions and recent searches
 * Integrates with HeaderSearch from design system and SDK search hooks
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeaderSearch,
  SearchIcon,
  CalendarIcon,
  BuildingIcon,
  PeopleIcon,
} from '@xaheen/ds';
import type { SearchResultItem, SearchResultGroup } from '@xaheen/ds';
import {
  useTypeahead,
  useRecentSearches,
  type SearchEntityType,
} from '@xaheen/sdk';

interface GlobalSearchProps {
  /** Placeholder text */
  placeholder?: string;

  /** Show keyboard shortcut */
  showShortcut?: boolean;

  /** Enable global keyboard shortcut (Cmd+K / Ctrl+K) */
  enableGlobalShortcut?: boolean;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

// Entity type icons
const ENTITY_ICONS: Record<SearchEntityType, JSX.Element> = {
  booking: <CalendarIcon size={18} />,
  listing: <BuildingIcon size={18} />,
  organization: <PeopleIcon size={18} />,
  all: <SearchIcon size={18} />,
};

// Entity type labels (Norwegian)
const ENTITY_LABELS: Record<SearchEntityType, string> = {
  booking: 'Bookinger',
  listing: 'Lokaler',
  organization: 'Organisasjoner',
  all: 'Alle',
};

/**
 * GlobalSearch component with SDK-powered typeahead and recent searches
 */
export function GlobalSearch({
  placeholder = 'Søk i bookinger, lokaler, organisasjoner...',
  showShortcut = true,
  enableGlobalShortcut = true,
  className,
  style,
}: GlobalSearchProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch typeahead suggestions (hook handles enabling internally based on query)
  const { data: typeaheadData } = useTypeahead({
    query: searchQuery,
    limit: 5,
  });

  // Fetch recent searches
  const { data: recentSearchesData } = useRecentSearches({
    limit: 5,
  });

  // Convert typeahead suggestions to SearchResultGroup format
  const typeaheadResults = useMemo((): SearchResultGroup[] => {
    if (!typeaheadData?.suggestions || typeaheadData.suggestions.length === 0) {
      return [];
    }

    // Group suggestions by entity type
    const groupedByType = new Map<SearchEntityType, SearchResultItem[]>();

    typeaheadData.suggestions.forEach((suggestion) => {
      const entityType = suggestion.entityType;

      if (!groupedByType.has(entityType)) {
        groupedByType.set(entityType, []);
      }

      const item: SearchResultItem = {
        id: suggestion.entityId || `suggestion-${suggestion.text}`,
        label: suggestion.text,
        description: suggestion.category,
        icon: ENTITY_ICONS[entityType],
        // Navigate to search page with the suggestion text and entity type
        href: `/search?q=${encodeURIComponent(suggestion.text)}&type=${entityType}`,
      };

      groupedByType.get(entityType)?.push(item);
    });

    // Convert map to SearchResultGroup array
    const groups: SearchResultGroup[] = [];
    groupedByType.forEach((items, entityType) => {
      groups.push({
        id: `typeahead-${entityType}`,
        label: ENTITY_LABELS[entityType],
        items,
      });
    });

    return groups;
  }, [typeaheadData]);

  // Convert recent searches to SearchResultGroup format
  const recentSearchResults = useMemo((): SearchResultGroup[] => {
    if (!recentSearchesData?.data || recentSearchesData.data.length === 0) {
      return [];
    }

    const items: SearchResultItem[] = recentSearchesData.data.map((recentSearch) => ({
      id: recentSearch.id,
      label: recentSearch.query,
      description: `${ENTITY_LABELS[recentSearch.entityType]} - ${
        recentSearch.resultCount !== undefined
          ? `${recentSearch.resultCount} resultat${recentSearch.resultCount !== 1 ? 'er' : ''}`
          : 'Tidligere søk'
      }`,
      icon: ENTITY_ICONS[recentSearch.entityType],
      href: `/search?q=${encodeURIComponent(recentSearch.query)}&type=${recentSearch.entityType}`,
      meta: new Date(recentSearch.lastSearchedAt).toLocaleDateString('nb-NO', {
        month: 'short',
        day: 'numeric',
      }),
    }));

    return [
      {
        id: 'recent-searches',
        label: 'Nylige søk',
        items,
      },
    ];
  }, [recentSearchesData]);

  // Combine typeahead and recent search results
  const searchResults = useMemo(() => {
    // If user is typing, show typeahead suggestions
    if (searchQuery.trim().length > 0) {
      return typeaheadResults;
    }
    // If search is empty, show recent searches
    return recentSearchResults;
  }, [searchQuery, typeaheadResults, recentSearchResults]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle search result selection
  const handleResultSelect = useCallback(
    (result: SearchResultItem) => {
      if (result.href) {
        navigate(result.href);
        // Clear search query after navigation
        setSearchQuery('');
      }
    },
    [navigate]
  );

  // Handle enter key (full search submission)
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  return (
    <HeaderSearch
      placeholder={placeholder}
      value={searchQuery}
      onSearchChange={handleSearchChange}
      onResultSelect={handleResultSelect}
      onSubmit={handleSearchSubmit}
      results={searchResults}
      showShortcut={showShortcut}
      enableGlobalShortcut={enableGlobalShortcut}
      noResultsText={
        searchQuery.trim().length > 0
          ? 'Ingen forslag funnet'
          : 'Ingen nylige søk'
      }
      className={className}
      style={style}
    />
  );
}
