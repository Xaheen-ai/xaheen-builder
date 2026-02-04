/**
 * Season Feature Constants
 *
 * Centralized constants for the season booking feature.
 */

import type { SeasonStatus } from '@xaheen/sdk/types';

// =============================================================================
// Season Status Configuration
// =============================================================================

export const SEASON_STATUS_CONFIG = {
  draft: {
    label: 'Utkast',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
  open: {
    label: 'Åpen for søknader',
    color: 'var(--ds-color-success-text-default)',
    bgColor: 'var(--ds-color-success-surface-default)',
  },
  closed: {
    label: 'Stengt',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
  active: {
    label: 'Aktiv',
    color: 'var(--ds-color-accent-text-default)',
    bgColor: 'var(--ds-color-accent-surface-default)',
  },
  completed: {
    label: 'Avsluttet',
    color: 'var(--ds-color-neutral-text-subtle)',
    bgColor: 'var(--ds-color-neutral-surface-default)',
  },
  cancelled: {
    label: 'Kansellert',
    color: 'var(--ds-color-danger-text-default)',
    bgColor: 'var(--ds-color-danger-surface-default)',
  },
} as const;

// =============================================================================
// Application Status Configuration
// =============================================================================

export const APPLICATION_STATUS_CONFIG = {
  pending: {
    label: 'Venter',
    color: 'var(--ds-color-warning-text-default)',
    bgColor: 'var(--ds-color-warning-surface-default)',
  },
  approved: {
    label: 'Godkjent',
    color: 'var(--ds-color-success-text-default)',
    bgColor: 'var(--ds-color-success-surface-default)',
  },
  rejected: {
    label: 'Avslått',
    color: 'var(--ds-color-danger-text-default)',
    bgColor: 'var(--ds-color-danger-surface-default)',
  },
  allocated: {
    label: 'Tildelt',
    color: 'var(--ds-color-accent-text-default)',
    bgColor: 'var(--ds-color-accent-surface-default)',
  },
} as const;

// =============================================================================
// Weekday Configuration
// =============================================================================

export const WEEKDAY_LABELS = [
  'Søndag',
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
] as const;

export const WEEKDAY_SHORT_LABELS = [
  'Søn',
  'Man',
  'Tir',
  'Ons',
  'Tor',
  'Fre',
  'Lør',
] as const;

// =============================================================================
// Time Configuration
// =============================================================================

export const TIME_SLOT_CONFIG = {
  minHour: 6,  // 06:00
  maxHour: 23, // 23:00
  interval: 30, // 30 minutes
} as const;

// =============================================================================
// Filter Options
// =============================================================================

export const SEASON_FILTER_OPTIONS: { label: string; value: SeasonStatus | 'all' }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Åpne', value: 'open' },
  { label: 'Aktive', value: 'active' },
  { label: 'Kommende', value: 'draft' },
];

// =============================================================================
// UI Constants
// =============================================================================

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export const GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;
