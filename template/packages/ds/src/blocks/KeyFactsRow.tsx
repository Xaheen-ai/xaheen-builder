/**
 * KeyFactsRow
 *
 * Displays key listing facts as a horizontal row of badges/chips.
 * Adapts based on listing type to show relevant information.
 */
import * as React from 'react';
import { cn } from '../utils';
import {
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export type KeyFactType =
  | 'capacity'
  | 'area'
  | 'duration'
  | 'quantity'
  | 'bookingMode'
  | 'accessibility'
  | 'custom';

export interface KeyFact {
  /** Type of key fact for automatic icon selection */
  type: KeyFactType;
  /** Display label (e.g., "Kapasitet", "Areal") */
  label: string;
  /** Display value (e.g., "25 personer", "120 m²") */
  value: string;
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
}

export interface KeyFactsRowProps {
  /** Array of key facts to display */
  facts: KeyFact[];
  /** Visual variant */
  variant?: 'default' | 'compact' | 'prominent';
  /** Maximum facts to show before collapse */
  maxVisible?: number;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Icon Components
// =============================================================================

function AreaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function PackageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function AccessibilityIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M12 7v8" />
      <path d="M7 12h10" />
      <path d="M9 21l3-6 3 6" />
    </svg>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getIconForType(type: KeyFactType): React.ReactNode {
  switch (type) {
    case 'capacity':
      return <UsersIcon size={14} />;
    case 'area':
      return <AreaIcon size={14} />;
    case 'duration':
      return <ClockIcon size={14} />;
    case 'quantity':
      return <PackageIcon size={14} />;
    case 'bookingMode':
      return <CalendarIcon size={14} />;
    case 'accessibility':
      return <AccessibilityIcon size={14} />;
    default:
      return <CheckCircleIcon size={14} />;
  }
}

// =============================================================================
// Component
// =============================================================================

export function KeyFactsRow({
  facts,
  variant = 'default',
  maxVisible,
  className,
}: KeyFactsRowProps): React.ReactElement | null {
  if (!facts || facts.length === 0) {
    return null;
  }

  const visibleFacts = maxVisible ? facts.slice(0, maxVisible) : facts;
  const hiddenCount = maxVisible ? Math.max(0, facts.length - maxVisible) : 0;

  const isCompact = variant === 'compact';
  const isProminent = variant === 'prominent';

  return (
    <div
      className={cn('key-facts-row', className)}
      role="list"
      aria-label="Nøkkelinformasjon"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isCompact ? 'var(--ds-spacing-2)' : 'var(--ds-spacing-3)',
        alignItems: 'center',
      }}
    >
      {visibleFacts.map((fact, index) => (
        <div
          key={`${fact.type}-${index}`}
          role="listitem"
          title={fact.tooltip || `${fact.label}: ${fact.value}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            padding: isCompact
              ? 'var(--ds-spacing-1) var(--ds-spacing-2)'
              : 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: isProminent
              ? 'var(--ds-color-accent-surface-default)'
              : 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            color: isProminent
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-default)',
            fontSize: isCompact
              ? 'var(--ds-font-size-xs)'
              : 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            whiteSpace: 'nowrap',
            border: isProminent
              ? 'none'
              : '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: isProminent
                ? 'var(--ds-color-accent-base-default)'
                : 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {fact.icon || getIconForType(fact.type)}
          </span>
          <span>{fact.value}</span>
        </div>
      ))}

      {hiddenCount > 0 && (
        <div
          role="listitem"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: isCompact
              ? 'var(--ds-spacing-1) var(--ds-spacing-2)'
              : 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-full)',
            color: 'var(--ds-color-neutral-text-subtle)',
            fontSize: isCompact
              ? 'var(--ds-font-size-xs)'
              : 'var(--ds-font-size-sm)',
          }}
        >
          +{hiddenCount} mer
        </div>
      )}
    </div>
  );
}

export default KeyFactsRow;
