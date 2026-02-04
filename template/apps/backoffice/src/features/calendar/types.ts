/**
 * Calendar Feature Types
 * Types specific to the calendar module UI
 */

import type { CalendarEvent, Block, BlockType, Conflict } from '@xaheen/sdk';

export type CalendarViewType = 'day' | 'week' | 'month' | 'timeline';

export interface CalendarState {
  view: CalendarViewType;
  currentDate: Date;
  selectedListing: string | undefined;
  selectedEvent: CalendarEvent | null;
}

export interface CalendarFilters {
  listingId?: string;
  showBlocks?: boolean;
  showBookings?: boolean;
  showMaintenance?: boolean;
  status?: string[];
}

// Block form data for create/edit modals
export interface BlockFormData {
  listingId: string;
  title: string;
  blockType: BlockType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  notes: string;
  notifyAffectedUsers: boolean;
  recurrence: RecurrenceFormData | null;
}

export interface RecurrenceFormData {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays: number[];
  endDate: string;
}

// Event drawer state
export interface EventDrawerState {
  isOpen: boolean;
  event: CalendarEvent | null;
  mode: 'view' | 'edit';
}

// Block modal state
export interface BlockModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  block: Block | null;
  initialDate?: Date;
  initialListingId?: string;
}

// Conflict resolution
export interface ConflictResolution {
  conflicts: Conflict[];
  canOverride: boolean;
  overrideReason?: string;
}

// Calendar action types for UI
export type CalendarAction =
  | { type: 'CREATE_BLOCK'; listingId?: string; date?: Date }
  | { type: 'EDIT_BLOCK'; block: Block }
  | { type: 'DELETE_BLOCK'; blockId: string }
  | { type: 'VIEW_EVENT'; event: CalendarEvent }
  | { type: 'APPROVE_REQUEST'; bookingId: string }
  | { type: 'REJECT_REQUEST'; bookingId: string };

// Block type display configuration
export interface BlockTypeConfig {
  label: string;
  description: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  icon?: string;
}

export const BLOCK_TYPE_CONFIG: Record<BlockType, BlockTypeConfig> = {
  maintenance: {
    label: 'Vedlikehold',
    description: 'Planlagt vedlikehold av lokalet',
    colorBg: 'var(--ds-color-neutral-surface-hover)',
    colorBorder: 'var(--ds-color-neutral-border-default)',
    colorText: 'var(--ds-color-neutral-text-subtle)',
  },
  closed: {
    label: 'Stengt',
    description: 'Lokalet er stengt for bookinger',
    colorBg: 'var(--ds-color-danger-surface-default)',
    colorBorder: 'var(--ds-color-danger-border-default)',
    colorText: 'var(--ds-color-danger-text-default)',
  },
  hold: {
    label: 'Intern reservasjon',
    description: 'Reservert for intern bruk',
    colorBg: 'var(--ds-color-warning-surface-default)',
    colorBorder: 'var(--ds-color-warning-border-default)',
    colorText: 'var(--ds-color-warning-text-default)',
  },
  emergency: {
    label: 'Nødstenging',
    description: 'Akutt stenging av lokalet',
    colorBg: 'var(--ds-color-danger-surface-default)',
    colorBorder: 'var(--ds-color-danger-border-default)',
    colorText: 'var(--ds-color-danger-text-default)',
  },
  internal: {
    label: 'Intern aktivitet',
    description: 'Internt arrangement eller møte',
    colorBg: 'var(--ds-color-info-surface-default)',
    colorBorder: 'var(--ds-color-info-border-default)',
    colorText: 'var(--ds-color-info-text-default)',
  },
};

// Weekday labels (Norwegian)
export const WEEKDAY_LABELS = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
export const WEEKDAY_FULL_LABELS = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// Default form values
export const DEFAULT_BLOCK_FORM: BlockFormData = {
  listingId: '',
  title: '',
  blockType: 'maintenance',
  startDate: '',
  endDate: '',
  startTime: '08:00',
  endTime: '16:00',
  allDay: false,
  notes: '',
  notifyAffectedUsers: false,
  recurrence: null,
};

export const DEFAULT_RECURRENCE_FORM: RecurrenceFormData = {
  frequency: 'weekly',
  interval: 1,
  weekdays: [],
  endDate: '',
};
