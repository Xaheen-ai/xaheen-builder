import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import {
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLoginButton,
  NotificationBell,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon,
  DialogProvider,
} from '@xaheen/ds';
import type { SearchResultItem, SearchResultGroup } from '@xaheen/ds';
import { DesignsystemetProvider } from '@xaheen/ds';
import { DEFAULT_THEME, type ThemeId } from '@xaheen/ds-themes';
import { I18nProvider, useT } from '@xaheen/i18n';
import { useNotificationUnreadCount } from '@xaheen/sdk';
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { LoginPage } from './pages/login';
import { AuthCallbackPage } from './pages/auth-callback';
import { RealtimeProvider } from './providers';
import { RealtimeToast } from './components';

// Theme context type
type ColorScheme = 'auto' | 'light' | 'dark';
interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  effectiveScheme: 'light' | 'dark';
}

// Hook to use theme context from outlet
function useThemeContext() {
  return useOutletContext<ThemeContextType>();
}

// Layout with header for main pages
function MainLayout() {
  const t = useT();
  const navigate = useNavigate();
  const { setColorScheme, effectiveScheme } = useThemeContext();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  // Get real unread notification count (only for logged in users)
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  // Check auth state via localStorage (SDK useAuth manages this)
  const isLoggedIn = React.useMemo(() => {
    try {
      return !!(localStorage.getItem('xaheen_web_user') || localStorage.getItem('xaheen_user'));
    } catch { return false; }
  }, []);

  // Toggle between light and dark (skip auto for manual toggle)
  const handleThemeToggle = () => {
    setColorScheme(effectiveScheme === 'dark' ? 'light' : 'dark');
  };

  // Demo search data with translations
  const demoSearchResults: SearchResultGroup[] = [
    {
      id: 'actions',
      label: t('listings.quickActions'),
      items: [
        { id: 'new-booking', label: t('listings.newBooking'), description: t('listings.newBooking'), icon: <CalendarIcon size={18} />, shortcut: '⌘N' },
        { id: 'settings', label: t('nav.settings'), description: t('listings.openSettings'), icon: <SettingsIcon size={18} />, shortcut: '⌘,' },
      ]
    },
    {
      id: 'locations',
      label: t('listings.locations'),
      items: [
        { id: 'oslo', label: 'Oslo', description: t('listings.headquarters'), icon: <MapPinIcon size={18} />, meta: `12 ${t('listings.bookings')}` },
        { id: 'bergen', label: 'Bergen', description: 'Vestlandskontor', icon: <MapPinIcon size={18} />, meta: `8 ${t('listings.bookings')}` },
        { id: 'trondheim', label: 'Trondheim', description: 'Midtbykontor', icon: <MapPinIcon size={18} />, meta: `5 ${t('listings.bookings')}` },
      ]
    },
    {
      id: 'users',
      label: t('listings.users'),
      items: [
        { id: 'user-1', label: 'Ola Nordmann', description: 'ola@example.com', icon: <UserIcon size={18} /> },
        { id: 'user-2', label: 'Kari Hansen', description: 'kari@example.com', icon: <UserIcon size={18} /> },
      ]
    }
  ];

  // Simulated search function
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    setTimeout(() => {
      const query = value.toLowerCase();
      const filtered = demoSearchResults
        .map(group => ({
          ...group,
          items: group.items.filter(item =>
            item.label.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          )
        }))
        .filter(group => group.items.length > 0);

      setSearchResults(filtered);
      setIsSearching(false);
    }, 200);
  };

  const handleSearch = (_value: string) => {
    // Search action handled
  };

  const handleResultSelect = (_result: SearchResultItem) => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('xaheen_web_user');
    localStorage.removeItem('xaheen_web_session_token');
    localStorage.removeItem('xaheen_web_tenant_id');
    localStorage.removeItem('xaheen_user');
    localStorage.removeItem('xaheen_session_token');
    localStorage.removeItem('xaheen_tenant_id');
    localStorage.removeItem('web_user');
    window.location.reload();
  };

  // Get logged in user name
  const getUserName = () => {
    try {
      const stored = localStorage.getItem('xaheen_web_user') || localStorage.getItem('xaheen_user');
      if (stored) {
        const user = JSON.parse(stored);
        return user.name;
      }
    } catch { /* ignore */ }
    return undefined;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-neutral-background-default)',
      margin: 0,
      padding: 0
    }}>
      {/* Site-wide layout: 1366px max-width, 25px side padding */}
      <style>{`
        .ds-container {
          max-width: 1600px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          padding-left: 25px !important;
          padding-right: 25px !important;
        }

        @media (max-width: 599px) {
          .header-search-desktop { display: none !important; }
          .mobile-search-wrapper { display: block !important; }

          /* Hide view toggle on mobile - only show grid view */
          .listing-toolbar .ds-toggle-group {
            display: none !important;
          }
        }
        @media (min-width: 600px) {
          .mobile-search-wrapper { display: none !important; }
        }
      `}</style>

      <AppHeader
        sticky={true}
        logo={
          <HeaderLogo
            src="/logo.svg"
            title="DIGILIST"
            subtitle="ENKEL BOOKING"
            href="/"
            height="40px"
            hideTextOnMobile={true}
          />
        }
        search={
          <div className="header-search-desktop">
            <HeaderSearch
              placeholder={t('common.search')}
              value={searchQuery}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              results={searchResults}
              onResultSelect={handleResultSelect}
              isLoading={isSearching}
              showShortcut={true}
              enableGlobalShortcut={true}
            />
          </div>
        }
        actions={
          <HeaderActions spacing="12px">
            <HeaderThemeToggle
              isDark={effectiveScheme === 'dark'}
              onToggle={handleThemeToggle}
            />
            {isLoggedIn && (
              <NotificationBell
                count={unreadCount}
                onClick={() => {
                  // TODO: Open notification center modal
                }}
                aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
              />
            )}
            <HeaderLoginButton
              isLoggedIn={isLoggedIn}
              userName={getUserName()}
              onLogin={handleLogin}
              onLogout={handleLogout}
              color="accent"
            />
          </HeaderActions>
        }
      />

      <Outlet />
    </div>
  );
}

// Wrapper to provide theme context to MainLayout
function MainLayoutWithContext({ colorScheme, setColorScheme, effectiveScheme }: ThemeContextType) {
  return <Outlet context={{ colorScheme, setColorScheme, effectiveScheme }} />;
}

const THEME_STORAGE_KEY = 'theme-preference';

// App content with theme provider
function AppContent() {
  const [theme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [colorScheme, setColorSchemeState] = React.useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return 'auto';
  });
  const [systemScheme, setSystemScheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const setColorScheme = React.useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (scheme === 'auto') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, scheme);
    }
  }, []);

  // Detect system color scheme
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemScheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute effective scheme
  const effectiveScheme = colorScheme === 'auto' ? systemScheme : colorScheme;

  return (
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme} size="auto">
      <DialogProvider>
        <RealtimeProvider autoConnect={true} enableInDev={true}>
          <RealtimeToast />
          <style>{`
            *, *::before, *::after {
              transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
            }
          `}</style>
          <Routes>
            {/* Login page - no header */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Main pages with header - wrapped to provide theme context */}
            <Route element={<MainLayoutWithContext colorScheme={colorScheme} setColorScheme={setColorScheme} effectiveScheme={effectiveScheme} />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<ListingsPage />} />
                <Route path="/listing/:id" element={<ListingDetailPage />} />
                <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              </Route>
            </Route>
          </Routes>
        </RealtimeProvider>
      </DialogProvider>
    </DesignsystemetProvider>
  );
}

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
