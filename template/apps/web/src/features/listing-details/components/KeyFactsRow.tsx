/**
 * KeyFactsRow Component
 *
 * Displays key characteristics of a listing as badges/chips.
 * Dynamically rendered based on listing type configuration.
 */

import * as React from 'react';
import { Tag } from '@xaheen/ds';
import {
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@xaheen/ds';
import type { KeyFacts, ListingType, BookingMode } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';

// =============================================================================
// Icon Mapping
// =============================================================================

function MaximizeIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function AccessibilityIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v6" />
      <path d="M8 8h8" />
      <path d="M9 22l3-9 3 9" />
    </svg>
  );
}

function ClockIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  users: UsersIcon,
  calendar: CalendarIcon,
  'map-pin': MapPinIcon,
  maximize: MaximizeIcon,
  accessibility: AccessibilityIcon,
  clock: ClockIcon,
};

// =============================================================================
// Props
// =============================================================================

export interface KeyFactsRowProps {
  keyFacts: KeyFacts;
  listingType: ListingType;
  bookingMode?: BookingMode;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

interface VisibleFact {
  key: string;
  icon: string;
  label: string;
  value: string;
}

export function KeyFactsRow({
  keyFacts,
  listingType,
  className,
}: KeyFactsRowProps): React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);
  const visibleFacts: VisibleFact[] = presenter.getKeyFacts(keyFacts);

  if (visibleFacts.length === 0) {
    return <></>;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--ds-spacing-2)',
        marginTop: 'var(--ds-spacing-3)',
      }}
    >
      {visibleFacts.map((fact: VisibleFact, index: number) => {
        const IconComponent = iconMap[fact.icon] || CheckCircleIcon;

        if (!fact.value) return null;

        return (
          <Tag
            key={`${fact.key}-${index}`}
            color="neutral"
            data-size="sm"
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              <IconComponent size={14} />
              {fact.value}
            </span>
          </Tag>
        );
      })}
    </div>
  );
}

export default KeyFactsRow;
