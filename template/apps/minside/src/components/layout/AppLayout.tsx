/**
 * AppLayout Component
 *
 * Mobile-first responsive layout for Minside app
 * - Shows sidebar on desktop (>= 768px)
 * - Shows bottom navigation on mobile (< 768px)
 * - Follows DIGILIST design patterns
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Alert,
  BottomNavigation,
  type BottomNavigationItem,
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  MessageIcon,
  SettingsIcon,
} from '@xaheen/ds';
import { useT } from '@xaheen/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAccountContext } from '../../providers/AccountContextProvider';

interface LocationState {
  contextRedirectMessage?: string;
  from?: { pathname: string };
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/bookings': 'Bookinger',
  '/reports': 'Rapporter',
  '/users': 'Brukere',
  '/settings': 'Innstillinger',
};

const MOBILE_BREAKPOINT = 768;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const { lostOrganizationMessage, clearLostOrganizationMessage } = useAccountContext();
  const title = pageTitles[location.pathname] ?? '';
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  // Handle context redirect message from navigation state
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.contextRedirectMessage) {
      setRedirectMessage(state.contextRedirectMessage);
      // Clear the message from navigation state to prevent showing on refresh
      navigate(location.pathname, { replace: true, state: {} });
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setRedirectMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  // Handle lost organization message notification - auto-dismiss after 7 seconds
  useEffect(() => {
    if (lostOrganizationMessage) {
      const timer = setTimeout(() => {
        clearLostOrganizationMessage();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [lostOrganizationMessage, clearLostOrganizationMessage]);

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bottom navigation items for mobile
  const bottomNavItems: BottomNavigationItem[] = [
    {
      id: 'dashboard',
      label: t('minside.dashboard'),
      icon: <HomeIcon />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'bookings',
      label: t('minside.myBookings'),
      icon: <BookOpenIcon />,
      href: '/bookings',
      active: location.pathname.startsWith('/bookings'),
    },
    {
      id: 'calendar',
      label: t('minside.myCalendar'),
      icon: <CalendarIcon />,
      href: '/calendar',
      active: location.pathname.startsWith('/calendar'),
    },
    {
      id: 'messages',
      label: t('minside.messages'),
      icon: <MessageIcon />,
      href: '/messages',
      active: location.pathname.startsWith('/messages'),
    },
    {
      id: 'settings',
      label: t('minside.settings'),
      icon: <SettingsIcon />,
      href: '/settings',
      active: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      {/* Sidebar - Desktop only */}
      {!isMobile && <Sidebar />}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header title={title} />

        {/* Context redirect notification */}
        {redirectMessage && (
          <div
            style={{
              padding: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
              paddingBottom: 0,
            }}
          >
            <Alert
              data-color="info"
              data-size="sm"
              role="status"
              aria-live="polite"
            >
              {redirectMessage}
            </Alert>
          </div>
        )}

        {/* Lost organization notification - shown when user's org membership was lost */}
        {lostOrganizationMessage && (
          <div
            style={{
              padding: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
              paddingBottom: 0,
            }}
          >
            <Alert
              data-color="warning"
              data-size="sm"
              role="alert"
              aria-live="assertive"
            >
              {lostOrganizationMessage}
            </Alert>
          </div>
        )}

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: isMobile ? 'var(--ds-spacing-4)' : 'var(--ds-spacing-8)',
            // Add padding at bottom for bottom navigation on mobile
            paddingBottom: isMobile ? 'calc(64px + var(--ds-spacing-4) + env(safe-area-inset-bottom))' : 'var(--ds-spacing-8)',
          }}
        >
          <div style={{ maxWidth: '1400px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <BottomNavigation
          items={bottomNavItems}
          fixed={true}
          variant="surface"
          showLabels={true}
          safeArea={true}
        />
      )}
    </div>
  );
}
