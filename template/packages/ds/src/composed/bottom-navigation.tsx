/**
 * BottomNavigation Component
 *
 * Mobile-first bottom navigation with 44px+ touch targets
 * Following DIGILIST design patterns - thumb-friendly navigation
 * Uses design system tokens for styling
 */

import React, { forwardRef } from 'react';

export interface BottomNavigationItem {
  /**
   * Unique identifier for the nav item
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Icon element
   */
  icon: React.ReactNode;

  /**
   * Navigation href
   */
  href: string;

  /**
   * Is this item active?
   * @default false
   */
  active?: boolean;

  /**
   * Badge count (optional)
   */
  badge?: number;

  /**
   * Click handler (if not using href)
   */
  onClick?: (e: React.MouseEvent) => void;
}

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Navigation items (3-5 recommended for optimal UX)
   */
  items: BottomNavigationItem[];

  /**
   * Whether navigation is fixed to bottom
   * @default true
   */
  fixed?: boolean;

  /**
   * Background variant
   * @default 'surface'
   */
  variant?: 'surface' | 'background';

  /**
   * Show labels
   * @default true
   */
  showLabels?: boolean;

  /**
   * Navigation height
   * @default '64px'
   */
  height?: string;

  /**
   * Safe area inset bottom (for iPhone notches)
   * @default true
   */
  safeArea?: boolean;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  ({
    items,
    fixed = true,
    variant = 'surface',
    showLabels = true,
    height = '64px',
    safeArea = true,
    className,
    style,
    ...props
  }, ref) => {
    const backgrounds = {
      surface: 'var(--ds-color-neutral-surface-default)',
      background: 'var(--ds-color-neutral-background-default)'
    };

    const navStyle: React.CSSProperties = {
      position: fixed ? 'fixed' : 'relative',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: backgrounds[variant],
      borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
      boxShadow: 'var(--ds-shadow-md)',
      paddingBottom: safeArea ? 'env(safe-area-inset-bottom)' : undefined,
      transition: 'transform 0.3s ease',
      ...style
    };

    return (
      <nav ref={ref} className={className} style={navStyle} {...props} role="navigation" aria-label="Bottom navigation">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            height,
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0 var(--ds-spacing-2)'
          }}
        >
          {items.map((item) => {
            const isActive = item.active ?? false;
            const ItemWrapper = item.href ? 'a' : 'button';

            return (
              <ItemWrapper
                key={item.id}
                href={item.href ? item.href : undefined}
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: '64px',
                  minHeight: '48px', // Minimum 44px + 4px padding for WCAG AA touch target
                  maxWidth: '168px',
                  padding: 'var(--ds-spacing-2)',
                  border: 'none',
                  background: 'transparent',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  borderRadius: 'var(--ds-border-radius-md)',
                  gap: 'var(--ds-spacing-1)',
                  // Tap highlight for mobile
                  WebkitTapHighlightColor: 'var(--ds-color-accent-surface-hover)'
                }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon container with 44px minimum */}
                <div
                  style={{
                    position: 'relative',
                    width: '24px',
                    height: '24px',
                    color: isActive
                      ? 'var(--ds-color-accent-base-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {item.icon}

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-danger-base-default)',
                        color: 'var(--ds-color-danger-contrast-default)',
                        fontSize: '10px',
                        fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        lineHeight: 1
                      }}
                      aria-label={`${item.badge} notifications`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                {showLabels && (
                  <span
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      fontWeight: isActive
                        ? 'var(--ds-font-weight-semibold)' as unknown as number
                        : 'var(--ds-font-weight-medium)' as unknown as number,
                      color: isActive
                        ? 'var(--ds-color-accent-base-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                      textAlign: 'center',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '32px',
                      height: '2px',
                      backgroundColor: 'var(--ds-color-accent-base-default)',
                      borderRadius: 'var(--ds-border-radius-full)'
                    }}
                    aria-hidden="true"
                  />
                )}
              </ItemWrapper>
            );
          })}
        </div>
      </nav>
    );
  }
);

BottomNavigation.displayName = 'BottomNavigation';
