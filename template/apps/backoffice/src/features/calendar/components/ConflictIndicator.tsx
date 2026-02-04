/**
 * Conflict Indicator Component
 * Visual indicator for booking conflicts with tooltip showing details
 */

import { Tooltip, XCircleIcon } from '@xaheen/ds';

export interface ConflictIndicatorProps {
  /** Conflicting events information */
  conflicts: Array<{
    id: string;
    title?: string;
    listingName?: string;
  }>;
  /** Display variant */
  variant?: 'icon' | 'border' | 'both';
  /** Position of the indicator */
  position?: 'top-right' | 'top-left' | 'inline';
}

/**
 * ConflictIndicator displays a visual warning for overlapping bookings
 * Shows a red warning icon with tooltip containing conflict details
 */
export function ConflictIndicator({
  conflicts,
  variant = 'both',
  position = 'top-right',
}: ConflictIndicatorProps) {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  // Generate tooltip text (string only, as Tooltip component expects)
  const conflictNames = conflicts
    .slice(0, 3)
    .map((c) => {
      const name = c.title || 'Booking';
      const location = c.listingName ? ` (${c.listingName})` : '';
      return `${name}${location}`;
    })
    .join(', ');

  const extraCount = conflicts.length > 3 ? ` +${conflicts.length - 3} flere` : '';
  const tooltipContent = `Konflikt: Overlapper med ${conflictNames}${extraCount}`;

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': {
      position: 'absolute',
      top: 'var(--ds-spacing-1)',
      right: 'var(--ds-spacing-1)',
      zIndex: 2,
    },
    'top-left': {
      position: 'absolute',
      top: 'var(--ds-spacing-1)',
      left: 'var(--ds-spacing-1)',
      zIndex: 2,
    },
    inline: {
      display: 'inline-flex',
      verticalAlign: 'middle',
    },
  };

  if (variant === 'border') {
    // Border variant doesn't show icon, only used for styling parent element
    return null;
  }

  return (
    <Tooltip content={tooltipContent}>
      <div style={positionStyles[position]}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-danger-base-default)',
            color: 'var(--ds-color-neutral-contrast-default)',
            cursor: 'help',
          }}
          aria-label="Konflikt"
          title="Booking har konflikter"
        >
          <XCircleIcon
            style={{
              width: '14px',
              height: '14px',
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </Tooltip>
  );
}

/**
 * Get conflict styles for event cards
 * Returns CSS properties to apply red border and background
 */
export function getConflictStyles(hasConflict: boolean): React.CSSProperties {
  if (!hasConflict) {
    return {};
  }

  return {
    border: '2px solid var(--ds-color-danger-border-default)',
    backgroundColor: 'var(--ds-color-danger-surface-default)',
    boxShadow: '0 0 0 1px var(--ds-color-danger-border-default)',
  };
}

/**
 * Get conflict color overrides for event cards
 * Returns color scheme for conflicted events
 */
export function getConflictColors(hasConflict: boolean) {
  if (!hasConflict) {
    return null;
  }

  return {
    bg: 'var(--ds-color-danger-surface-default)',
    border: 'var(--ds-color-danger-border-default)',
    text: 'var(--ds-color-danger-text-default)',
  };
}
