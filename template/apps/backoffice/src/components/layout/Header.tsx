import { useNavigate } from 'react-router-dom';
import {
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  Button,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
} from '@xaheen/ds';
import { useUnreadCount } from '@xaheen/sdk';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { GlobalSearch } from '../GlobalSearch';

interface HeaderProps {
  title?: string;
}

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Get real unread notification count
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

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
          display: 'flex',
          alignItems: 'center',
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
        }}
      >
        {/* Left spacer for balance */}
        <div style={{ flex: '1 1 0', minWidth: 0 }} />

        {/* Search - centered */}
        <div
          style={{
            flex: '0 1 600px',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <GlobalSearch
            placeholder="Søk i bookinger, lokaler, organisasjoner..."
            showShortcut
            enableGlobalShortcut
          />
        </div>

        {/* Right side - Actions */}
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <HeaderActions spacing="var(--ds-spacing-3)">
            <HeaderThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />
            <HeaderIconButton
              icon={<BellIcon size={22} />}
              {...(unreadCount > 0 ? { badge: unreadCount, badgeColor: 'danger' as const } : {})}
              size="md"
              aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
              title="Varsler"
              onClick={() => navigate('/messages')}
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
