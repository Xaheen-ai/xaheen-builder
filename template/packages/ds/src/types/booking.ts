/**
 * Booking Types
 *
 * Comprehensive type definitions for the unified booking system.
 * Supports all listing types: SPACE, RESOURCE, EVENT, SERVICE, VEHICLE
 */

/**
 * Booking mode determines the UI and flow
 */
export type BookingMode =
  | 'slots'      // Hourly time slots (e.g., meeting rooms, sports halls)
  | 'daily'      // Full day booking (e.g., conference rooms, outdoor spaces)
  | 'dateRange'  // Multi-day range (e.g., vehicles, equipment rental)
  | 'event'      // Event/ticket based (e.g., workshops, classes)
  | 'recurring'  // Seasonal/recurring (e.g., sports clubs weekly slot)
  | 'instant';   // Instant booking without calendar (e.g., digital services)

/**
 * Pricing unit for display and calculation
 */
export type BookingPriceUnit =
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'booking'
  | 'person'
  | 'unit';

/**
 * Availability slot status
 */
export type SlotStatus =
  | 'available'
  | 'selected'
  | 'occupied'
  | 'blocked'
  | 'maintenance'
  | 'past';

/**
 * Single availability slot
 */
export interface AvailabilitySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  price?: number;
  note?: string;
}

/**
 * Day availability summary
 */
export interface DayAvailability {
  date: Date;
  isAvailable: boolean;
  availableSlots: number;
  totalSlots: number;
  minPrice?: number;
  maxPrice?: number;
  status: 'open' | 'full' | 'limited' | 'closed';
}

/**
 * Pricing configuration
 */
export interface BookingPricing {
  basePrice: number;
  currency: string;
  unit: BookingPriceUnit;
  /** Weekend price multiplier (e.g., 1.5 = 50% more) */
  weekendMultiplier?: number;
  /** Evening/night price multiplier */
  eveningMultiplier?: number;
  /** Minimum booking duration in units */
  minimumDuration?: number;
  /** Maximum booking duration in units */
  maximumDuration?: number;
  /** Discount for members (percentage) */
  memberDiscount?: number;
  /** Per-person pricing (for events) */
  perPerson?: boolean;
  /** Setup fee */
  setupFee?: number;
  /** Cleaning fee */
  cleaningFee?: number;
  /** VAT percentage */
  vatPercentage?: number;
}

/**
 * Booking rules and constraints
 */
export interface BookingRules {
  /** Require admin approval */
  requireApproval: boolean;
  /** Minimum lead time in hours */
  minLeadTimeHours: number;
  /** Maximum advance booking in days */
  maxAdvanceDays: number;
  /** Cancellation policy */
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  /** Free cancellation hours before */
  freeCancellationHours: number;
  /** Minimum attendees (for events) */
  minAttendees?: number;
  /** Maximum attendees/capacity */
  maxAttendees?: number;
  /** Allow partial day booking */
  allowPartialDay?: boolean;
  /** Allow same-day booking */
  allowSameDayBooking?: boolean;
  /** Required fields */
  requiredFields?: string[];
  /** Custom terms to accept */
  termsUrl?: string;
}

/**
 * Opening hours for a day
 */
export interface DaySchedule {
  /** 0 = Sunday, 1 = Monday, etc. */
  dayOfWeek: number;
  /** Is open this day */
  isOpen: boolean;
  /** Opening time HH:MM */
  openTime?: string;
  /** Closing time HH:MM */
  closeTime?: string;
  /** Break periods */
  breaks?: { start: string; end: string }[];
}

/**
 * Complete booking configuration for a listing
 */
export interface BookingConfig {
  /** Listing ID */
  listingId: string;
  /** Listing type */
  listingType: 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';
  /** Booking mode */
  mode: BookingMode;
  /** Pricing configuration */
  pricing: BookingPricing;
  /** Booking rules */
  rules: BookingRules;
  /** Weekly schedule */
  schedule: DaySchedule[];
  /** Slot duration in minutes (for slot mode) */
  slotDurationMinutes?: number;
  /** Buffer time between bookings in minutes */
  bufferMinutes?: number;
  /** Event capacity (for event mode) */
  eventCapacity?: number;
  /** Event date (for event mode) */
  eventDate?: Date;
  /** Supported activity types */
  activityTypes?: string[];
}

/**
 * User's booking selection state
 */
export interface BookingSelection {
  /** Selected slots (for slot mode) */
  slots: AvailabilitySlot[];
  /** Selected date range (for dateRange mode) */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Selected event tickets (for event mode) */
  tickets?: number;
  /** Recurring pattern (for recurring mode) */
  recurring?: {
    weekdays: number[];
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
  };
}

/**
 * Booking form data
 */
export interface BookingFormData {
  // Contact info
  name: string;
  email: string;
  phone: string;
  organization?: string;

  // Booking details
  purpose: string;
  showPurposeInCalendar: boolean;
  numberOfPeople: number;
  activityType?: string;
  notes?: string;

  // Additional options
  additionalServices: string[];
  discountCode?: string;

  // Terms
  acceptedTerms: boolean;
  acceptedCancellationPolicy: boolean;
}

/**
 * Price breakdown item
 */
export interface PriceItem {
  id: string;
  label: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
  type: 'base' | 'service' | 'fee' | 'discount' | 'tax';
}

/**
 * Complete price calculation
 */
export interface BookingPriceCalculation {
  items: PriceItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  currency: string;
}

/**
 * Booking step configuration
 */
export interface BookingStepConfig {
  id: string;
  label: string;
  icon: 'calendar' | 'form' | 'confirm' | 'success' | 'payment';
  description?: string;
  isOptional?: boolean;
}

/**
 * Get default booking steps based on mode
 */
export function getBookingSteps(mode: BookingMode, requirePayment: boolean = false): BookingStepConfig[] {
  const baseSteps: BookingStepConfig[] = [
    { id: 'select', label: 'Velg tid', icon: 'calendar' },
    { id: 'details', label: 'Detaljer', icon: 'form' },
    { id: 'confirm', label: 'Bekreft', icon: 'confirm' },
  ];

  if (requirePayment) {
    baseSteps.push({ id: 'payment', label: 'Betaling', icon: 'payment' });
  }

  baseSteps.push({ id: 'complete', label: 'Fullført', icon: 'success' });

  // Customize based on mode
  switch (mode) {
    case 'event':
      baseSteps[0] = { id: 'select', label: 'Velg billetter', icon: 'calendar' };
      break;
    case 'dateRange':
      baseSteps[0] = { id: 'select', label: 'Velg datoer', icon: 'calendar' };
      break;
    case 'recurring':
      baseSteps[0] = { id: 'select', label: 'Velg mønster', icon: 'calendar' };
      break;
    case 'instant':
      return [
        { id: 'details', label: 'Detaljer', icon: 'form' },
        { id: 'confirm', label: 'Bekreft', icon: 'confirm' },
        { id: 'complete', label: 'Fullført', icon: 'success' },
      ];
  }

  return baseSteps;
}

/**
 * Determine booking mode from listing type and config
 */
export function determineBookingMode(
  listingType: string,
  pricingUnit: BookingPriceUnit,
  hasEventDate?: boolean
): BookingMode {
  if (hasEventDate) return 'event';

  switch (listingType) {
    case 'EVENT':
      return 'event';
    case 'VEHICLE':
      return 'dateRange';
    case 'SERVICE':
      return pricingUnit === 'hour' ? 'slots' : 'instant';
    case 'SPACE':
    case 'RESOURCE':
      if (pricingUnit === 'hour') return 'slots';
      if (pricingUnit === 'day') return 'daily';
      if (pricingUnit === 'week' || pricingUnit === 'month') return 'dateRange';
      return 'slots';
    default:
      return 'slots';
  }
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: string = 'NOK',
  locale: string = 'nb-NO'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price unit for display (Norwegian)
 */
export function formatPriceUnit(unit: BookingPriceUnit): string {
  const unitMap: Record<BookingPriceUnit, string> = {
    hour: 'time',
    day: 'dag',
    week: 'uke',
    month: 'måned',
    booking: 'booking',
    person: 'person',
    unit: 'stk',
  };
  return unitMap[unit] || unit;
}
