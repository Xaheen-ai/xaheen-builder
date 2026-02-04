/**
 * Listing Detail Types
 *
 * Type definitions for the listing detail page components.
 */

/**
 * Listing type enum matching the schema
 */
export type ListingType = 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';

/**
 * Time slot availability status
 */
export type TimeSlotStatus = 'available' | 'occupied' | 'selected' | 'unavailable';

/**
 * Image for gallery display
 */
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
}

/**
 * Facility with optional icon
 */
export interface Facility {
  id: string;
  label: string;
  icon?: string;
}

/**
 * Additional service with pricing
 */
export interface AdditionalService {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  name?: string;
}

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Opening hours for a single day
 */
export interface OpeningHoursDay {
  day: string;
  hours: string;
  isClosed?: boolean;
}

/**
 * Time slot for availability calendar
 */
export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime?: string;
  status: TimeSlotStatus;
}

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Booking step
 */
export interface BookingStep {
  id: string;
  label: string;
}

/**
 * Activity type for booking
 */
export type ActivityType =
  | 'meeting'      // Møte
  | 'training'     // Trening
  | 'event'        // Arrangement
  | 'workshop'     // Workshop
  | 'presentation' // Presentasjon
  | 'party'        // Fest/Selskap
  | 'other';       // Annet

/**
 * Booking details form data
 */
export interface BookingDetails {
  /** Contact name */
  name: string;
  /** Contact email */
  email: string;
  /** Contact phone */
  phone: string;
  /** Additional notes (short description) */
  notes?: string;
  /** Whether terms are accepted */
  acceptedTerms: boolean;
  /** Purpose of booking */
  purpose?: string;
  /** Show purpose in calendar */
  showPurposeInCalendar?: boolean;
  /** Book multiple days */
  bookMultipleDays?: boolean;
  /** Number of attendees */
  numberOfPeople?: number;
  /** Type of activity */
  activityType?: ActivityType;
  /** Organization name */
  organization?: string;
}

/**
 * Booking state
 */
export interface BookingState {
  selectedSlots: TimeSlot[];
  currentStep: number;
  bookingDetails: BookingDetails;
}

/**
 * Guideline section for accordion
 */
export interface GuidelineSection {
  id: string;
  title: string;
  content: string;
}

/**
 * FAQ item for accordion
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Complete listing detail data
 */
export interface ListingDetail {
  id: string;
  name: string;
  category: string;
  listingType: ListingType;
  location: string;
  description: string;
  images: GalleryImage[];
  capacity?: number;
  facilities: Facility[];
  additionalServices?: AdditionalService[];
  contact?: ContactInfo;
  coordinates?: Coordinates;
  openingHours?: OpeningHoursDay[];
  guidelines?: GuidelineSection[];
  faq?: FAQItem[];
  /** Base price */
  price?: number;
  /** Price unit (e.g., 'time', 'dag') */
  priceUnit?: string;
  /** Currency code */
  currency?: string;
}
