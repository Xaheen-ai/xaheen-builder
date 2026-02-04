/**
 * Season Feature Types
 *
 * Local type definitions extending SDK types.
 */

import type {
  Season,
  SeasonStatus,
} from '@xaheen/sdk/types';

// =============================================================================
// Extended Season Types
// =============================================================================

/**
 * Season with additional computed properties for UI
 */
export interface SeasonWithUI extends Season {
  isOpen?: boolean;
  isActive?: boolean;
  isUpcoming?: boolean;
  daysUntilDeadline?: number;
  isOnOffer?: boolean; // Special "tilbud" status from metadata
}

// =============================================================================
// Filter Types
// =============================================================================

export interface SeasonFilters {
  status: SeasonStatus | 'all';
  search?: string;
}

export interface ApplicationFilters {
  seasonId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'allocated' | 'all';
}

// =============================================================================
// Form Types
// =============================================================================

export interface SeasonApplicationFormData {
  seasonId: string;
  listingId: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface SeasonListState {
  filters: SeasonFilters;
  view: 'grid' | 'list';
}

export interface ApplicationDrawerState {
  isOpen: boolean;
  seasonId?: string;
  listingId?: string;
  editingApplicationId?: string;
}

// =============================================================================
// Stats Types
// =============================================================================

export interface SeasonStats {
  totalSeasons: number;
  openSeasons: number;
  activeSeasons: number;
  upcomingSeasons: number;
  myApplications: number;
  approvedApplications: number;
}
