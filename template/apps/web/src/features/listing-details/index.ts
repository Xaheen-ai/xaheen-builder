/**
 * Listing Details Feature
 *
 * Main export file for the listing details feature.
 * Exports types, components, adapters, and presenters.
 */

// Types - explicit exports to avoid conflicts
export type {
  ListingType,
  BookingMode,
  ApprovalMode,
  GeoCoordinates,
  Address,
  ContactInfo,
  DayHours,
  ExceptionalDay,
  OpeningHours,
  Amenity,
  IncludedFacility,
  Rule,
  FAQItem,
  ListingEvent,
  RentalHistoryItem,
  ActivityData,
  BookingConfig,
  ListingMetadata,
  ListingImage,
  KeyFacts,
  Listing,
  FavoriteState,
  ShareOptions,
  AuditEventType,
  AuditEvent,
  RealtimeEventType,
  RealtimeEvent,
  ListingDetailsI18n,
  TabsProps,
  SidebarProps,
} from './types';

// Presenters
export {
  createPresenter,
  getListingTypeLabel,
  getBookingModeLabel,
  isCurrentlyOpen,
  type ListingTypeConfig,
  type KeyFactConfig,
  type ActivityTabConfig,
} from './presenters/listingTypePresenter';

// Adapters
export * from './adapters';

// Components - explicit exports
export {
  ListingDetailsLayout,
  ListingHeader,
  KeyFactsRow,
  FavoriteButton,
  ShareButton,
  OverviewTab,
  ActivityTab,
  RulesTab,
  FaqTab,
  ContactWidget,
  MapWidget,
  OpeningHoursWidget,
  BookingWidgetPlacement,
} from './components';

export type {
  ListingDetailsLayoutProps,
  ListingHeaderProps,
  KeyFactsRowProps,
  FavoriteButtonProps,
  ShareButtonProps,
  OverviewTabProps,
  ActivityTabProps,
  RulesTabProps,
  FaqTabProps,
  ContactWidgetProps,
  MapWidgetProps,
  OpeningHoursWidgetProps,
  BookingWidgetPlacementProps,
} from './components';
