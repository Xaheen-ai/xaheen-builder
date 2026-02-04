/**
 * OpeningHoursCard
 *
 * Card displaying opening hours in a table format.
 * Supports highlighting the current day.
 */
import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { ClockIcon } from '../primitives/icons';
import type { OpeningHoursDay } from '../types/listing-detail';

export interface OpeningHoursCardProps {
  /** Array of opening hours for each day */
  hours: OpeningHoursDay[];
  /** Card title */
  title?: string;
  /** Whether to highlight today's row */
  highlightToday?: boolean;
  /** Custom class name */
  className?: string;
}

// Norwegian day names
const dayNames: Record<string, number> = {
  'mandag': 1,
  'tirsdag': 2,
  'onsdag': 3,
  'torsdag': 4,
  'fredag': 5,
  'lørdag': 6,
  'søndag': 0,
  'man': 1,
  'tir': 2,
  'ons': 3,
  'tor': 4,
  'fre': 5,
  'lør': 6,
  'søn': 0,
};

/**
 * Check if a day string matches today
 */
function isToday(dayStr: string): boolean {
  const today = new Date().getDay();
  const parts = dayStr.toLowerCase().split('-');
  const normalizedDay = (parts[0] ?? '').trim();
  const dayNumber = dayNames[normalizedDay];
  return dayNumber !== undefined && dayNumber === today;
}

/**
 * OpeningHoursCard component
 *
 * @example
 * ```tsx
 * <OpeningHoursCard
 *   hours={[
 *     { day: 'Mandag-Fredag', hours: '08:00 - 22:00' },
 *     { day: 'Lørdag', hours: '09:00 - 20:00' },
 *     { day: 'Søndag', hours: '10:00 - 18:00' },
 *   ]}
 *   highlightToday
 * />
 * ```
 */
export function OpeningHoursCard({
  hours,
  title = 'Åpningstider',
  highlightToday = true,
  className,
}: OpeningHoursCardProps): React.ReactElement {
  if (!hours.length) {
    return <></>;
  }

  return (
    <div
      className={cn('opening-hours-card', className)}
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <ClockIcon
            size={18}
            style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
          />
          <Heading
            level={3}
            data-size="xs"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </Heading>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {hours.map((item, index) => {
          const isTodayRow = highlightToday && isToday(item.day);
          const isClosed = item.isClosed || item.hours.toLowerCase() === 'stengt';

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: index < hours.length - 1 ? 'var(--ds-spacing-3)' : 0,
                borderBottom: index < hours.length - 1 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
              }}
            >
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: isTodayRow
                    ? 'var(--ds-color-accent-text-default)'
                    : 'var(--ds-color-neutral-text-default)',
                  fontWeight: isTodayRow
                    ? 'var(--ds-font-weight-medium)'
                    : 'inherit',
                }}
              >
                {item.day}
              </Paragraph>
              {/* Pill badge for hours */}
              <span
                style={{
                  display: 'inline-block',
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                  backgroundColor: isClosed
                    ? 'var(--ds-color-neutral-surface-hover)'
                    : 'var(--ds-color-neutral-surface-default)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  fontSize: 'var(--ds-font-size-sm)',
                  color: isClosed
                    ? 'var(--ds-color-neutral-text-subtle)'
                    : 'var(--ds-color-neutral-text-default)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                }}
              >
                {item.hours}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OpeningHoursCard;
