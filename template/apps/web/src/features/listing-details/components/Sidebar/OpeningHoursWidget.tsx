/**
 * OpeningHoursWidget Component
 *
 * Displays weekly opening hours for facilities.
 * Shows grouped days with same hours (e.g., "Mandag-Fredag: 08:00 - 22:00").
 */

import * as React from 'react';
import { Paragraph } from '@xaheen/ds';
import type { OpeningHours, DayHours } from '../../types';

// =============================================================================
// Icons
// =============================================================================

function ClockIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// =============================================================================
// Day names
// =============================================================================

const dayNames: Record<number, string> = {
  0: 'Søndag',
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
};

// =============================================================================
// Props
// =============================================================================

export interface OpeningHoursWidgetProps {
  openingHours: OpeningHours;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

interface GroupedHours {
  label: string;
  hours: string;
}

function groupConsecutiveDays(days: DayHours[]): GroupedHours[] {
  if (!days || days.length === 0) return [];

  // Sort days: Monday (1) to Sunday (0 treated as 7)
  const sortedDays = [...days].sort((a, b) => {
    const aIndex = a.dayIndex === 0 ? 7 : a.dayIndex;
    const bIndex = b.dayIndex === 0 ? 7 : b.dayIndex;
    return aIndex - bIndex;
  });

  const groups: GroupedHours[] = [];
  let currentGroup: DayHours[] = [];
  let currentHours = '';

  for (const day of sortedDays) {
    const dayHours = day.isClosed ? 'Stengt' : `${day.open} - ${day.close}`;

    if (currentGroup.length === 0) {
      currentGroup = [day];
      currentHours = dayHours;
    } else {
      const lastDay = currentGroup[currentGroup.length - 1];
      if (!lastDay) {
        currentGroup = [day];
        currentHours = dayHours;
        continue;
      }
      const lastDayIndex = lastDay.dayIndex === 0 ? 7 : lastDay.dayIndex;
      const currentDayIndex = day.dayIndex === 0 ? 7 : day.dayIndex;
      const isConsecutive = currentDayIndex === lastDayIndex + 1;
      const sameHours = dayHours === currentHours;

      if (isConsecutive && sameHours) {
        currentGroup.push(day);
      } else {
        // Save current group and start new one
        groups.push(formatGroup(currentGroup, currentHours));
        currentGroup = [day];
        currentHours = dayHours;
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    groups.push(formatGroup(currentGroup, currentHours));
  }

  return groups;
}

function formatGroup(days: DayHours[], hours: string): GroupedHours {
  const first = days[0];
  const last = days[days.length - 1];

  if (!first || !last) {
    return { label: '', hours };
  }

  if (days.length === 1) {
    return {
      label: dayNames[first.dayIndex] ?? `Dag ${first.dayIndex}`,
      hours,
    };
  }

  const firstDay = dayNames[first.dayIndex] ?? `Dag ${first.dayIndex}`;
  const lastDay = dayNames[last.dayIndex] ?? `Dag ${last.dayIndex}`;

  return {
    label: `${firstDay}-${lastDay}`,
    hours,
  };
}

// =============================================================================
// Component
// =============================================================================

export function OpeningHoursWidget({
  openingHours,
  className,
}: OpeningHoursWidgetProps): React.ReactElement {
  const groupedHours = React.useMemo(
    () => groupConsecutiveDays(openingHours.regular),
    [openingHours.regular]
  );

  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          <ClockIcon />
        </div>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Åpningstider
        </Paragraph>
      </div>

      {/* Grouped hours */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {groupedHours.map((group, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {group.label}
            </Paragraph>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: group.hours === 'Stengt'
                  ? 'var(--ds-color-neutral-text-subtle)'
                  : 'var(--ds-color-neutral-text-default)',
              }}
            >
              {group.hours}
            </Paragraph>
          </div>
        ))}
      </div>

      {/* Exceptional days */}
      {openingHours.exceptions && openingHours.exceptions.length > 0 && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-4)',
            paddingTop: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Spesielle dager
          </Paragraph>
          {openingHours.exceptions.map((exception) => (
            <div
              key={exception.date}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--ds-spacing-1) 0',
              }}
            >
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {exception.label}
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
              >
                {exception.isClosed
                  ? 'Stengt'
                  : exception.hours
                  ? `${exception.hours.open} - ${exception.hours.close}`
                  : ''}
              </Paragraph>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OpeningHoursWidget;
