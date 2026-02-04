/**
 * Drawer / SlidePanel - Sliding panel component
 *
 * A slide-in panel that can open from left, right, top, or bottom.
 * Includes helper components for building panel content.
 *
 * @module @xaheen/ds/composed/Drawer
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// =============================================================================
// TYPES
// =============================================================================

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Drawer content */
  children: React.ReactNode;
  /** Position of the drawer */
  position?: DrawerPosition;
  /** Panel title */
  title?: React.ReactNode;
  /** Icon to show next to title */
  icon?: React.ReactNode;
  /** Badge count to show */
  badge?: number;
  /** Size preset (width for left/right, height for top/bottom) */
  size?: DrawerSize;
  /** Custom width/height override */
  customSize?: string | number;
  /** Whether to show backdrop overlay */
  overlay?: boolean;
  /** Whether to close on backdrop click */
  closeOnOverlayClick?: boolean;
  /** Whether to close on Escape key */
  closeOnEscape?: boolean;
  /** Footer content */
  footer?: React.ReactNode;
  /** Additional className for the drawer panel */
  className?: string;
  /** Z-index for the drawer */
  zIndex?: number;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Show drag handle (for bottom/top drawers) */
  showHandle?: boolean;
  /** Position on mobile viewports (under 600px). Defaults to main position */
  mobilePosition?: DrawerPosition;
  /** Size on mobile viewports. Defaults to 'full' for bottom/top, 'lg' for left/right */
  mobileSize?: DrawerSize;
  /** Breakpoint for mobile behavior in pixels */
  mobileBreakpoint?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Width sizes for left/right drawers (+10% from original)
const widthSizeMap: Record<DrawerSize, string> = {
  sm: '352px',
  md: '440px',
  lg: '550px',
  xl: '700px',
  full: '100%',
};

// Height sizes for top/bottom drawers (+10% from original)
const heightSizeMap: Record<DrawerSize, string> = {
  sm: '45vh',
  md: '60vh',
  lg: '77vh',
  xl: '90vh',
  full: '100%',
};

// =============================================================================
// ICONS
// =============================================================================

function CloseIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const getPositionStyles = (
  position: DrawerPosition,
  size: string,
  isOpen: boolean
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), visibility 300ms',
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const shadow = isOpen ? 'var(--ds-shadow-lg, 0 25px 50px -12px var(--ds-color-neutral-border-default))' : 'none';

  switch (position) {
    case 'left':
      return {
        ...baseStyles,
        top: 0,
        left: 0,
        bottom: 0,
        width: size,
        maxWidth: '100vw',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        borderRight: '1px solid var(--ds-color-neutral-border-default)',
        boxShadow: shadow,
      };
    case 'right':
      return {
        ...baseStyles,
        top: 0,
        right: 0,
        bottom: 0,
        width: size,
        maxWidth: '100vw',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        borderLeft: '1px solid var(--ds-color-neutral-border-default)',
        boxShadow: shadow,
      };
    case 'top':
      return {
        ...baseStyles,
        top: 0,
        left: 0,
        right: 0,
        height: size,
        maxHeight: '90vh',
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
        borderBottom: '1px solid var(--ds-color-neutral-border-default)',
        borderRadius: '0 0 var(--ds-border-radius-lg, 8px) var(--ds-border-radius-lg, 8px)',
        boxShadow: shadow,
      };
    case 'bottom':
      return {
        ...baseStyles,
        bottom: 0,
        left: 0,
        right: 0,
        height: size,
        maxHeight: '90vh',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        borderTop: '1px solid var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-lg, 8px) var(--ds-border-radius-lg, 8px) 0 0',
        boxShadow: shadow,
      };
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Drawer - Sliding panel component
 *
 * @example Left filter panel
 * ```tsx
 * <Drawer
 *   isOpen={isFiltersOpen}
 *   onClose={() => setFiltersOpen(false)}
 *   title="Filtre"
 *   position="left"
 *   size="sm"
 * >
 *   <DrawerSection title="Type anlegg" collapsible>
 *     <FilterCheckboxes />
 *   </DrawerSection>
 * </Drawer>
 * ```
 *
 * @example Right cart panel
 * ```tsx
 * <Drawer
 *   isOpen={isCartOpen}
 *   onClose={() => setCartOpen(false)}
 *   title="Min bestilling"
 *   icon={<ShoppingCartIcon />}
 *   badge={3}
 *   position="right"
 *   footer={<CheckoutButton />}
 * >
 *   <CartItems />
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'left',
  title,
  icon,
  badge,
  size = 'md',
  customSize,
  overlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
  zIndex = 1000,
  'aria-label': ariaLabel,
  showHandle = false,
  mobilePosition,
  mobileSize,
  mobileBreakpoint = 600,
}: DrawerProps): React.ReactElement | null {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Determine effective position and size based on viewport
  const effectivePosition = isMobile && mobilePosition ? mobilePosition : position;
  const effectiveSize = isMobile && mobileSize ? mobileSize : size;

  const isVertical = effectivePosition === 'top' || effectivePosition === 'bottom';

  // Use appropriate size map based on drawer orientation
  const computedSize = customSize
    ? typeof customSize === 'number' ? `${customSize}px` : customSize
    : isVertical ? heightSizeMap[effectiveSize] : widthSizeMap[effectiveSize];

  // Show handle automatically on mobile bottom drawer
  const effectiveShowHandle = showHandle || (isMobile && effectivePosition === 'bottom');

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  const handleOverlayClick = useCallback((): void => {
    if (closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // SSR safety
  if (typeof document === 'undefined') return null;

  const drawerContent = (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          onClick={handleOverlayClick}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ds-color-neutral-background-backdrop, rgba(0, 0, 0, 0.4))',
            backdropFilter: 'blur(2px)',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'opacity 300ms ease, visibility 300ms ease',
            zIndex: zIndex - 1,
          }}
        />
      )}

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        className={className}
        style={{
          ...getPositionStyles(effectivePosition, computedSize, isOpen),
          zIndex,
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Handle (for vertical drawers) */}
        {effectiveShowHandle && isVertical && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-3) 0 var(--ds-spacing-2)',
            flexShrink: 0,
          }}>
            <div style={{
              width: 'var(--ds-spacing-10)',
              height: 'var(--ds-spacing-1)',
              backgroundColor: 'var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-full, 9999px)',
            }} />
          </div>
        )}

        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
            borderBottom: '1px solid var(--ds-color-neutral-border-default)',
            flexShrink: 0,
            gap: 'var(--ds-spacing-3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', flex: 1 }}>
              {icon && (
                <span style={{ color: 'var(--ds-color-accent-text-default)', display: 'flex' }}>
                  {icon}
                </span>
              )}
              <h2 style={{
                margin: 0,
                fontSize: 'var(--ds-font-size-md, 1.125rem)',
                fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                color: 'var(--ds-color-neutral-text-default)',
              }}>
                {title}
              </h2>
              {badge !== undefined && badge > 0 && (
                <span style={{
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
                }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Lukk"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'var(--ds-spacing-8)',
                height: 'var(--ds-spacing-8)',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md, 5px)',
                backgroundColor: 'transparent',
                color: 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                e.currentTarget.style.color = 'var(--ds-color-neutral-text-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)';
              }}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            flexShrink: 0,
            padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
            borderTop: '1px solid var(--ds-color-neutral-border-default)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
          }}>
            {footer}
          </div>
        )}
      </aside>
    </>
  );

  return createPortal(drawerContent, document.body);
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

export interface DrawerSectionProps {
  /** Section title */
  title?: React.ReactNode;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Whether section is initially collapsed */
  defaultCollapsed?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * DrawerSection - Collapsible section within a drawer
 */
export function DrawerSection({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: DrawerSectionProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = (): void => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={className}
      style={{
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {title && (
        <div
          onClick={handleToggle}
          onKeyDown={collapsible ? (e) => e.key === 'Enter' && handleToggle() : undefined}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
            cursor: collapsible ? 'pointer' : 'default',
            transition: 'background-color 0.15s ease',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={collapsible ? (e) => {
            e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
          } : undefined}
          onMouseLeave={collapsible ? (e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          } : undefined}
        >
          <div>
            <span style={{
              fontSize: 'var(--ds-font-size-sm, 0.875rem)',
              fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
              color: 'var(--ds-color-neutral-text-default)',
            }}>
              {title}
            </span>
            {description && (
              <p style={{
                margin: 'var(--ds-spacing-1) 0 0 0',
                fontSize: 'var(--ds-font-size-xs, 0.75rem)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}>
                {description}
              </p>
            )}
          </div>
          {collapsible && (
            <span style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              transition: 'transform 0.2s ease',
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              display: 'flex',
            }}>
              <ChevronDownIcon />
            </span>
          )}
        </div>
      )}
      {(!collapsible || !isCollapsed) && (
        <div style={{ padding: title ? '0 var(--ds-spacing-5) var(--ds-spacing-4)' : 'var(--ds-spacing-4) var(--ds-spacing-5)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export interface DrawerItemProps {
  /** Item content */
  children: React.ReactNode;
  /** Left slot (icon, checkbox) */
  left?: React.ReactNode;
  /** Right slot (badge, count) */
  right?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether item is selected */
  selected?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
}

/**
 * DrawerItem - List item within a drawer
 */
export function DrawerItem({
  children,
  left,
  right,
  onClick,
  selected = false,
  disabled = false,
}: DrawerItemProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);
  const isInteractive = onClick && !disabled;

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-3)',
    padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
    cursor: isInteractive ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: selected
      ? 'var(--ds-color-accent-surface-default)'
      : isHovered && isInteractive
        ? 'var(--ds-color-neutral-surface-hover)'
        : 'transparent',
    borderLeft: selected ? '3px solid var(--ds-color-accent-base-default)' : '3px solid transparent',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  };

  const content = (
    <>
      {left && <span style={{ display: 'flex', flexShrink: 0 }}>{left}</span>}
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
      {right && <span style={{ display: 'flex', flexShrink: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{right}</span>}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...style,
          width: '100%',
          border: 'none',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        {content}
      </button>
    );
  }

  return <div style={style}>{content}</div>;
}

export interface DrawerEmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Empty state title */
  title: string;
  /** Empty state description */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
}

/**
 * DrawerEmptyState - Empty state for drawers
 */
export function DrawerEmptyState({
  icon,
  title,
  description,
  action,
}: DrawerEmptyStateProps): React.ReactElement {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--ds-spacing-12) var(--ds-spacing-6)',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          marginBottom: 'var(--ds-spacing-4)',
        }}>
          {icon}
        </div>
      )}
      <span style={{
        fontSize: 'var(--ds-font-size-md, 1rem)',
        fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
        color: 'var(--ds-color-neutral-text-default)',
        marginBottom: 'var(--ds-spacing-1)',
      }}>
        {title}
      </span>
      {description && (
        <p style={{
          margin: '0 0 var(--ds-spacing-4) 0',
          fontSize: 'var(--ds-font-size-sm, 0.875rem)',
          color: 'var(--ds-color-neutral-text-subtle)',
          maxWidth: 'var(--ds-size-empty-state-max-width, 280px)',
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export default Drawer;
