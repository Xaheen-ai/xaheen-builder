/**
 * Opening Hours Step
 * Weekly schedule configuration for the listing
 */

import { Paragraph, Heading, Checkbox, Button, Select } from '@xaheen/ds';
import type { BackofficeListing, ListingOpeningHours } from '../../../types';

export interface OpeningHoursStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

type DayKey = keyof ListingOpeningHours;

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Mandag' },
  { key: 'tuesday', label: 'Tirsdag' },
  { key: 'wednesday', label: 'Onsdag' },
  { key: 'thursday', label: 'Torsdag' },
  { key: 'friday', label: 'Fredag' },
  { key: 'saturday', label: 'Lørdag' },
  { key: 'sunday', label: 'Søndag' },
];

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30', '00:00',
];

export function OpeningHoursStep({ data, onChange, errors = [] }: OpeningHoursStepProps) {
  const openingHours: ListingOpeningHours = data.openingHours || {};

  const handleDayToggle = (day: DayKey, isOpen: boolean) => {
    const newHours = { ...openingHours };
    if (isOpen) {
      newHours[day] = { open: '08:00', close: '17:00' };
    } else {
      newHours[day] = null;
    }
    onChange({ openingHours: newHours });
  };

  const handleTimeChange = (day: DayKey, field: 'open' | 'close', value: string) => {
    const current = openingHours[day];
    if (!current) return;

    onChange({
      openingHours: {
        ...openingHours,
        [day]: {
          ...current,
          [field]: value,
        },
      },
    });
  };

  const handleApplyToAll = () => {
    const newHours: ListingOpeningHours = {};
    for (const { key } of DAYS) {
      newHours[key] = { open: '08:00', close: '17:00' };
    }
    onChange({ openingHours: newHours });
  };

  const handleApplyToWeekdays = () => {
    const newHours = { ...openingHours };
    const weekdays: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const day of weekdays) {
      newHours[day] = { open: '08:00', close: '17:00' };
    }
    // Set weekend as closed
    newHours.saturday = null;
    newHours.sunday = null;
    onChange({ openingHours: newHours });
  };

  const handleClearAll = () => {
    const newHours: ListingOpeningHours = {};
    for (const { key } of DAYS) {
      newHours[key] = null;
    }
    onChange({ openingHours: newHours });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header with Quick Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Åpningstider
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Angi når utleieobjektet er tilgjengelig for booking
          </Paragraph>
        </div>

        {/* Quick Action Buttons - Top Right */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            flexShrink: 0,
          }}
        >
          <Button
            type="button"
            variant="secondary"
            data-size="sm"
            onClick={handleApplyToWeekdays}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Ukedager
          </Button>
          <Button
            type="button"
            variant="secondary"
            data-size="sm"
            onClick={handleApplyToAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Alle dager
          </Button>
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={handleClearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Nullstill
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* Weekly schedule */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {DAYS.map(({ key, label }, index) => {
          const dayHours = openingHours[key];
          const isOpen = dayHours !== null && dayHours !== undefined;

          return (
            <div
              key={key}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: 'var(--ds-spacing-4)',
                alignItems: 'center',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: index % 2 === 0 ? 'var(--ds-color-neutral-surface-default)' : 'var(--ds-color-neutral-background-default)',
                borderBottom: index < DAYS.length - 1 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
              }}
            >
              {/* Day name with toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <Checkbox
                  aria-label={`${label} åpen`}
                  checked={isOpen}
                  onChange={(e) => handleDayToggle(key, e.target.checked)}
                />
                <Paragraph
                  data-size="md"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: isOpen ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {label}
                </Paragraph>
              </div>

              {/* Time selectors */}
              {isOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <div style={{ minWidth: '100px' }}>
                    <Select
                      value={dayHours?.open || '08:00'}
                      onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                      aria-label={`${label} åpningstid`}
                      data-size="sm"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Paragraph
                    data-size="md"
                    style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                  >
                    –
                  </Paragraph>
                  <div style={{ minWidth: '100px' }}>
                    <Select
                      value={dayHours?.close || '17:00'}
                      onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                      aria-label={`${label} stengetid`}
                      data-size="sm"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      marginLeft: 'var(--ds-spacing-2)',
                      color: 'var(--ds-color-success-text-default)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-1)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Åpent
                  </Paragraph>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      color: 'var(--ds-color-neutral-text-subtle)',
                      fontStyle: 'italic',
                    }}
                  >
                    Stengt
                  </Paragraph>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-info-text-default)', margin: 0 }}>
          Åpningstider definerer når objektet kan bookes. Du kan legge til unntak (helligdager, ferie osv.) etter at objektet er opprettet.
        </Paragraph>
      </div>
    </div>
  );
}
