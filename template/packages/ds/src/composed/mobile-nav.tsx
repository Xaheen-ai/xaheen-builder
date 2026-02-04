/**
 * MobileNav - Mobile hamburger navigation component
 *
 * A specialized wrapper around Drawer for mobile navigation menus.
 * Provides hamburger menu functionality with sensible mobile defaults.
 *
 * @module @xaheen/ds/composed/MobileNav
 */

import React, { forwardRef, useCallback, useState } from 'react';
import { Drawer, DrawerProps } from './Drawer';

// =============================================================================
// TYPES
// =============================================================================

export interface MobileNavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation href */
  href?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether item is active/selected */
  active?: boolean;
  /** Badge count */
  badge?: number;
  /** Whether item is disabled */
  disabled?: boolean;
}

export interface MobileNavSection {
  /** Section title */
  title?: string;
  /** Section items */
  items: MobileNavItem[];
}

export interface MobileNavProps extends Omit<DrawerProps, 'children' | 'isOpen' | 'onClose'> {
  /** Whether the mobile nav is open */
  isOpen: boolean;
  /** Callback when nav should close */
  onClose: () => void;
  /** Navigation items or sections */
  items?: MobileNavItem[];
  /** Navigation sections (for grouped navigation) */
  sections?: MobileNavSection[];
  /** Custom content (overrides items/sections) */
  children?: React.ReactNode;
  /** Header content (logo, etc.) */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Panel title */
  title?: React.ReactNode;
  /** Whether to close nav on item click */
  closeOnItemClick?: boolean;
}

export interface MobileNavToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether nav is open */
  isOpen?: boolean;
  /** ARIA label */
  'aria-label'?: string;
  /** Custom icon */
  icon?: React.ReactNode;
}

// =============================================================================
// ICONS
// =============================================================================

function MenuIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * MobileNavToggle - Hamburger menu toggle button
 *
 * @example
 * ```tsx
 * <MobileNavToggle
 *   isOpen={isNavOpen}
 *   onClick={() => setNavOpen(!isNavOpen)}
 *   aria-label="Toggle navigation"
 * />
 * ```
 */
export const MobileNavToggle = forwardRef<HTMLButtonElement, MobileNavToggleProps>(
  (
    {
      isOpen = false,
      'aria-label': ariaLabel = 'Åpne navigasjonsmeny',
      icon,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '44px',
      minHeight: '44px',
      padding: 'var(--ds-spacing-2)',
      border: 'none',
      borderRadius: 'var(--ds-border-radius-md, 5px)',
      backgroundColor: isHovered
        ? 'var(--ds-color-neutral-surface-hover)'
        : 'transparent',
      color: 'var(--ds-color-neutral-text-default)',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease, color 0.15s ease',
      // Mobile tap highlight
      WebkitTapHighlightColor: 'var(--ds-color-accent-surface-hover)',
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={isOpen ? 'Lukk navigasjonsmeny' : ariaLabel}
        aria-expanded={isOpen}
        className={className}
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {icon ?? <MenuIcon />}
      </button>
    );
  }
);

MobileNavToggle.displayName = 'MobileNavToggle';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * MobileNav - Mobile hamburger navigation
 *
 * @example Basic usage with items
 * ```tsx
 * <MobileNav
 *   isOpen={isNavOpen}
 *   onClose={() => setNavOpen(false)}
 *   title="Meny"
 *   items={[
 *     { id: '1', label: 'Hjem', href: '/', icon: <HomeIcon />, active: true },
 *     { id: '2', label: 'Mine bookinger', href: '/bookings', icon: <CalendarIcon />, badge: 3 },
 *     { id: '3', label: 'Innstillinger', href: '/settings', icon: <SettingsIcon /> },
 *   ]}
 * />
 * ```
 *
 * @example With sections
 * ```tsx
 * <MobileNav
 *   isOpen={isNavOpen}
 *   onClose={() => setNavOpen(false)}
 *   title="Meny"
 *   sections={[
 *     {
 *       title: 'Hovedmeny',
 *       items: [
 *         { id: '1', label: 'Hjem', href: '/' },
 *         { id: '2', label: 'Mine bookinger', href: '/bookings' },
 *       ]
 *     },
 *     {
 *       title: 'Innstillinger',
 *       items: [
 *         { id: '3', label: 'Profil', href: '/profile' },
 *         { id: '4', label: 'Logg ut', onClick: handleLogout },
 *       ]
 *     }
 *   ]}
 * />
 * ```
 *
 * @example Custom content
 * ```tsx
 * <MobileNav
 *   isOpen={isNavOpen}
 *   onClose={() => setNavOpen(false)}
 *   title="Meny"
 *   header={<Logo />}
 *   footer={<UserProfile />}
 * >
 *   <CustomNavContent />
 * </MobileNav>
 * ```
 */
export const MobileNav = forwardRef<HTMLDivElement, MobileNavProps>(
  (
    {
      isOpen,
      onClose,
      items,
      sections,
      children,
      header,
      footer,
      title = 'Meny',
      position = 'left',
      size = 'sm',
      closeOnItemClick = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      overlay = true,
      mobilePosition = 'left',
      mobileSize = 'lg',
      ...drawerProps
    },
    ref
  ) => {
    const handleItemClick = useCallback(
      (item: MobileNavItem) => {
        if (item.disabled) return;

        if (item.onClick) {
          item.onClick();
        }

        if (closeOnItemClick) {
          onClose();
        }
      },
      [closeOnItemClick, onClose]
    );

    // Render nav items
    const renderItems = (navItems: MobileNavItem[]): React.ReactNode => {
      return navItems.map((item) => {
        const ItemWrapper = item.href ? 'a' : 'button';
        const isActive = item.active ?? false;

        return (
          <ItemWrapper
            key={item.id}
            href={item.href}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              width: '100%',
              minHeight: '48px',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
              border: 'none',
              borderLeft: isActive
                ? '3px solid var(--ds-color-accent-base-default)'
                : '3px solid transparent',
              backgroundColor: isActive
                ? 'var(--ds-color-accent-surface-default)'
                : 'transparent',
              color: isActive
                ? 'var(--ds-color-accent-base-default)'
                : 'var(--ds-color-neutral-text-default)',
              textDecoration: 'none',
              textAlign: 'left',
              fontSize: 'var(--ds-font-size-md, 1rem)',
              fontWeight: isActive
                ? 'var(--ds-font-weight-semibold)' as unknown as number
                : 'var(--ds-font-weight-regular)' as unknown as number,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
              transition: 'all 0.15s ease',
              // Mobile tap highlight
              WebkitTapHighlightColor: 'var(--ds-color-accent-surface-hover)',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled && !isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'var(--ds-color-neutral-surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.disabled && !isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'transparent';
              }
            }}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={item.disabled}
          >
            {/* Icon */}
            {item.icon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                }}
              >
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span style={{ flex: 1 }}>{item.label}</span>

            {/* Badge */}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'var(--ds-spacing-5)',
                  height: 'var(--ds-spacing-5)',
                  padding: '0 var(--ds-spacing-2)',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                  color: 'var(--ds-color-accent-contrast-default)',
                  borderRadius: 'var(--ds-border-radius-full, 9999px)',
                }}
                aria-label={`${item.badge} notifications`}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </ItemWrapper>
        );
      });
    };

    // Render nav sections
    const renderSections = (navSections: MobileNavSection[]): React.ReactNode => {
      return navSections.map((section, index) => (
        <div
          key={index}
          style={{
            borderBottom:
              index < navSections.length - 1
                ? '1px solid var(--ds-color-neutral-border-subtle)'
                : undefined,
          }}
        >
          {section.title && (
            <div
              style={{
                padding: 'var(--ds-spacing-4) var(--ds-spacing-5) var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                color: 'var(--ds-color-neutral-text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {section.title}
            </div>
          )}
          <nav role="navigation">{renderItems(section.items)}</nav>
        </div>
      ));
    };

    // Determine content
    let content: React.ReactNode;
    if (children) {
      content = children;
    } else if (sections) {
      content = renderSections(sections);
    } else if (items) {
      content = <nav role="navigation">{renderItems(items)}</nav>;
    } else {
      content = null;
    }

    return (
      <Drawer
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        position={position}
        size={size}
        title={title}
        overlay={overlay}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEscape={closeOnEscape}
        mobilePosition={mobilePosition}
        mobileSize={mobileSize}
        footer={footer}
        {...drawerProps}
      >
        {/* Custom header */}
        {header && (
          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {header}
          </div>
        )}

        {/* Navigation content */}
        {content}
      </Drawer>
    );
  }
);

MobileNav.displayName = 'MobileNav';

export default MobileNav;
