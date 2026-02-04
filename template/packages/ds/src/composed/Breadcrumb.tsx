/**
 * Breadcrumb
 *
 * Navigation breadcrumb component for showing page hierarchy.
 * Example: Hjem > Fasiliteter > Møterom 101
 */
import * as React from 'react';
import { Link } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import type { BreadcrumbItem } from '../types/listing-detail';

export interface BreadcrumbProps {
  /** List of breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator between items (defaults to ">") */
  separator?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

/**
 * Breadcrumb navigation component
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Hjem', href: '/' },
 *     { label: 'Fasiliteter', href: '/fasiliteter' },
 *     { label: 'Møterom 101' }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  separator = '>',
  className,
}: BreadcrumbProps): React.ReactElement {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('breadcrumb', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--ds-spacing-2)',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--ds-spacing-2)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && (item.href || item.onClick);

          return (
            <li
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {isClickable ? (
                item.href ? (
                  <Link
                    href={item.href}
                    style={{
                      color: 'var(--ds-color-accent-text-default)',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--ds-color-accent-text-default)',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                    }}
                  >
                    {item.label}
                  </button>
                )
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast
                      ? 'var(--ds-color-neutral-text-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                    fontWeight: isLast
                      ? 'var(--ds-font-weight-medium)'
                      : 'inherit',
                  }}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span
                  aria-hidden="true"
                  style={{
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
