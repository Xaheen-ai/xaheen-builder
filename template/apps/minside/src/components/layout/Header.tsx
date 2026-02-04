import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeaderSearch,
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  Button,
  NotificationBell,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
  CalendarIcon,
  PeopleIcon,
} from '@xaheen/ds';
import type { SearchResultItem, SearchResultGroup } from '@xaheen/ds';
import { useNotificationUnreadCount } from '@xaheen/sdk';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { useNotificationCenter } from '../../App';
import { AccountSwitcher } from '../AccountSwitcher';

interface HeaderProps {
  title?: string;
}

/**
 * Get navigation search results based on query
 * TODO: Replace with SDK global search when available
 */
const getNavigationResults = (query: string): SearchResultGroup[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const navItems: SearchResultItem[] = [];

  // Dashboard
  if ('dashboard'.includes(q) || 'hjem'.includes(q) || 'oversikt'.includes(q)) {
    navItems.push({
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Gå til oversikt',
      icon: <SearchIcon size={18} />,
      href: '/',
    });
  }

  // Bookings
  if ('booking'.includes(q) || 'bestilling'.includes(q)) {
    navItems.push({
      id: 'nav-bookings',
      label: 'Bookinger',
      description: 'Se alle dine bookinger',
      icon: <CalendarIcon size={18} />,
      href: '/bookings',
    });
  }

  // Calendar
  if ('kalender'.includes(q) || 'calendar'.includes(q)) {
    navItems.push({
      id: 'nav-calendar',
      label: 'Kalender',
      description: 'Se bookinger i kalendervisning',
      icon: <CalendarIcon size={18} />,
      href: '/calendar',
    });
  }

  // Messages
  if ('melding'.includes(q) || 'message'.includes(q) || 'samtale'.includes(q)) {
    navItems.push({
      id: 'nav-messages',
      label: 'Meldinger',
      description: 'Se samtaler og meldinger',
      icon: <PeopleIcon size={18} />,
      href: '/messages',
    });
  }

  // Settings
  if ('innstilling'.includes(q) || 'setting'.includes(q)) {
    navItems.push({
      id: 'nav-settings',
      label: 'Innstillinger',
      description: 'Systemkonfigurasjon',
      icon: <SettingsIcon size={18} />,
      href: '/settings',
    });
  }

  if (navItems.length === 0) return [];

  return [{ id: 'navigation', label: 'Sider', items: navItems }];
};

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { openNotificationCenter } = useNotificationCenter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);

  // Get real unread notification count
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchResults(getNavigationResults(value));
  };

  const handleResultSelect = (result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        boxShadow: 'var(--ds-shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Left zone - Account Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <AccountSwitcher />
        </div>

        {/* Center zone - Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '650px',
            maxWidth: '700px',
          }}
        >
          <HeaderSearch
            placeholder="Søk i bookinger, brukere..."
            value={searchQuery}
            onSearchChange={handleSearchChange}
            onResultSelect={handleResultSelect}
            results={searchResults}
            showShortcut
            enableGlobalShortcut
            noResultsText="Ingen resultater funnet"
          />
        </div>


        {/* Right zone - Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <HeaderActions spacing="var(--ds-spacing-2)">
            <HeaderThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />
            <NotificationBell
              count={unreadCount}
              onClick={openNotificationCenter}
              aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
            />
            <HeaderIconButton
              icon={<SettingsIcon size={22} />}
              size="md"
              aria-label="Innstillinger"
              title="Innstillinger"
              onClick={() => navigate('/settings')}
            />
            <div
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                margin: '0 var(--ds-spacing-2)',
              }}
            />
            {user && (
              <Button
                type="button"
                variant="tertiary"
                data-size="md"
                onClick={logout}
                aria-label="Logg ut"
                style={{ whiteSpace: 'nowrap' }}
              >
                <LogOutIcon size={20} />
                Logg ut
              </Button>
            )}
          </HeaderActions>
        </div>
      </div>
    </header>
  );
}
