import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  BuildingIcon,
  CalendarIcon,
  BookOpenIcon,
  RepeatIcon,
  MessageIcon,
  UsersIcon,
  OrganizationIcon,
  ChartIcon,
  SettingsIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@xaheen/ds';
import { useAuth } from '../../hooks/useAuth';
import { useBackofficeRole, type EffectiveBackofficeRole } from '../../hooks/useBackofficeRole';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Roles that can view this nav item.
   * Empty array or undefined = visible to all authenticated users.
   */
  roles?: EffectiveBackofficeRole[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// NavItem component with proper active state handling
function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = item.href === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(item.href);

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className="sidebar-nav-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
        borderRadius: 'var(--ds-border-radius-lg)',
        textDecoration: 'none',
        position: 'relative',
        backgroundColor: isActive
          ? 'var(--ds-color-neutral-surface-hover)'
          : 'transparent',
        borderLeft: isActive
          ? '3px solid var(--ds-color-accent-base-default)'
          : '3px solid transparent',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Icon with background */}
      <div
        className="sidebar-nav-icon"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: isActive
            ? 'var(--ds-color-accent-surface-default)'
            : 'var(--ds-color-neutral-surface-hover)',
          color: isActive
            ? 'var(--ds-color-accent-text-default)'
            : 'var(--ds-color-neutral-text-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        {item.icon}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
            color: isActive
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-default)',
          }}
        >
          {item.name}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginTop: '2px',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {item.description}
        </Paragraph>
      </div>

      {/* Badge or Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        {item.badge && item.badge > 0 && (
          <div
            style={{
              minWidth: '32px',
              height: '32px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              color: 'var(--ds-color-neutral-text-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              padding: '0 var(--ds-spacing-3)',
            }}
          >
            {item.badge}
          </div>
        )}
        <div
          style={{
            color: isActive
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-subtle)',
            opacity: isActive ? 1 : 0.5,
          }}
        >
          <ArrowRightIcon />
        </div>
      </div>
    </NavLink>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const { effectiveRole } = useBackofficeRole();

  const navSections: NavSection[] = [
    {
      items: [
        { name: 'Dashboard', description: 'Oversikt og statistikk', href: '/', icon: <HomeIcon /> },
      ],
    },
    {
      title: 'Administrasjon',
      items: [
        { name: 'Listings', description: 'Administrer utleieobjekter', href: '/listings', icon: <BuildingIcon /> },
        { name: 'Kalender', description: 'Visuell oversikt', href: '/calendar', icon: <CalendarIcon /> },
        { name: 'Bookinger', description: 'Forespørsler og reservasjoner', href: '/bookings', icon: <BookOpenIcon />, badge: 20, badgeColor: 'accent' },
        { name: 'Sesongleie', description: 'Faste avtaler', href: '/seasons', icon: <RepeatIcon /> },
      ],
    },
    {
      title: 'Kommunikasjon',
      items: [
        { name: 'Meldinger', description: 'Samtaler med brukere', href: '/messages', icon: <MessageIcon />, badge: 3, badgeColor: 'danger' },
      ],
    },
    {
      title: 'Brukere & Org',
      items: [
        { name: 'Organisasjoner', description: 'Administrer organisasjoner', href: '/organizations', icon: <OrganizationIcon />, roles: ['admin'] },
        { name: 'Brukere', description: 'Administrer brukere', href: '/users', icon: <UsersIcon />, roles: ['admin'] },
      ],
    },
    {
      title: 'Innsikt',
      items: [
        { name: 'Rapporter', description: 'Statistikk og eksport', href: '/reports', icon: <ChartIcon /> },
      ],
    },
    {
      title: 'Saksbehandler',
      items: [
        { name: 'Arbeidskø', description: 'Ventende forespørsler', href: '/work-queue', icon: <ClockIcon />, roles: ['case_handler'] },
        { name: 'Sesongsøknader', description: 'Behandle søknader', href: '/season-applications', icon: <RepeatIcon />, roles: ['case_handler'] },
        { name: 'Allokeringsplan', description: 'Fordele faste tider', href: '/allocation-planner', icon: <CalendarIcon />, roles: ['case_handler'] },
        { name: 'Vedtaksskjema', description: 'Fatt formelle vedtak', href: '/decision-forms', icon: <CheckCircleIcon />, roles: ['case_handler'] },
        { name: 'Revisjonslogg', description: 'Vedtakshistorikk', href: '/audit-timeline', icon: <ClockIcon />, roles: ['case_handler'] },
      ],
    },
    {
      title: 'Admin',
      items: [
        { name: 'Ny listing', description: 'Opprett lokale', href: '/listings/wizard', icon: <BuildingIcon />, roles: ['admin'] },
        { name: 'Prisregler', description: 'Administrer priser', href: '/pricing-rules', icon: <SettingsIcon />, roles: ['admin'] },
        { name: 'Brukeradmin', description: 'Administrer tilgang', href: '/users-management', icon: <UsersIcon />, roles: ['admin'] },
        { name: 'Rapporter', description: 'Statistikk og analyser', href: '/reports', icon: <ChartIcon />, roles: ['admin'] },
      ],
    },
    {
      title: 'Tenant',
      items: [
        { name: 'Plattforminnstillinger', description: 'Konfigurer tenant', href: '/tenant/settings', icon: <SettingsIcon />, roles: ['admin'] },
        { name: 'Merkevare', description: 'Logo og farger', href: '/tenant/branding', icon: <BuildingIcon />, roles: ['admin'] },
        { name: 'Systemlogg', description: 'Alle plattformhendelser', href: '/tenant/audit-log', icon: <ClockIcon />, roles: ['admin'] },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Anmeldelser', description: 'Moderer anmeldelser', href: '/reviews/moderation', icon: <CheckCircleIcon />, roles: ['admin'] },
        { name: 'Audit Log', description: 'Systemhendelser', href: '/audit', icon: <ClockIcon />, roles: ['admin'] },
        { name: 'Innstillinger', description: 'Systemkonfigurasjon', href: '/settings', icon: <SettingsIcon />, roles: ['admin'] },
      ],
    },
  ];

  // Filter items based on effective role
  // Items with no roles array or empty roles array are visible to all authenticated users
  // Items with roles array are only visible if the current effectiveRole is in that array
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // If no roles specified or empty array, visible to all
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        // Otherwise, check if current effective role is in the allowed roles
        return effectiveRole ? item.roles.includes(effectiveRole) : false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      style={{
        width: '360px',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <img
            src="/logo.svg"
            alt="Digilist"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />
          <div>
            <div
              style={{
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 'var(--ds-font-weight-bold)',
                color: 'var(--ds-color-accent-text-default)',
                lineHeight: 'var(--ds-font-line-height-sm)',
                letterSpacing: 'var(--ds-font-letter-spacing-sm)',
              }}
            >
              DIGILIST
            </div>
            <div
              style={{
                fontSize: 'var(--ds-font-size-2xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                letterSpacing: 'var(--ds-font-letter-spacing-md)',
                marginTop: '2px',
                textTransform: 'uppercase',
              }}
            >
              Backoffice
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--ds-spacing-4) var(--ds-spacing-3)', overflowY: 'auto' }}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            {section.title && (
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-font-letter-spacing-md)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-5)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {section.title}
              </Paragraph>
            )}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info Section */}
      {user && (
        <div
          style={{
            padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-text-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 'var(--ds-font-weight-semibold)',
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Paragraph
                data-size="sm"
                style={{
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </Paragraph>
              <Paragraph
                data-size="xs"
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: 0,
                  marginTop: '2px',
                }}
              >
                {user.role === 'admin' ? 'Administrator' : 'Saksbehandler'}
              </Paragraph>
            </div>
          </div>
        </div>
      )}

      {/* CSS for hover states */}
      <style>{`
        .sidebar-nav-item:hover {
          background-color: var(--ds-color-neutral-surface-hover) !important;
        }
        .sidebar-nav-item:hover .sidebar-nav-icon {
          background-color: var(--ds-color-accent-surface-default) !important;
          color: var(--ds-color-accent-text-default) !important;
        }
      `}</style>
    </aside>
  );
}
