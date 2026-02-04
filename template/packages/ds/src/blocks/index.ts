/**
 * Blocks
 *
 * Business-logic components composed from primitives and composed components
 */

export { ListingCard } from './ListingCard';
export type { ListingCardProps, ListingCardVariant } from './ListingCard';

export { ListingListItem } from './ListingListItem';
export type { ListingListItemProps } from './ListingListItem';

export { ListingGrid } from './ListingGrid';
export type { ListingGridProps } from './ListingGrid';

export { ListingToolbar } from './ListingToolbar';
export type { ListingToolbarProps, ViewMode } from './ListingToolbar';

export { ListingMap } from './ListingMap';
export type { ListingMapProps, MapListing } from './ListingMap';

export { ListingTableView } from './ListingTableView';
export type { ListingTableViewProps } from './ListingTableView';

// Listing Detail Components
export { ImageGallery } from './ImageGallery';
export type { ImageGalleryProps } from './ImageGallery';

export { ListingDetailHeader } from './ListingDetailHeader';
export type { ListingDetailHeaderProps } from './ListingDetailHeader';

export { CapacityCard } from './CapacityCard';
export type { CapacityCardProps } from './CapacityCard';

export { FacilityChips } from './FacilityChips';
export type { FacilityChipsProps } from './FacilityChips';

export { AdditionalServicesList } from './AdditionalServicesList';
export type { AdditionalServicesListProps } from './AdditionalServicesList';

export { ContactInfoCard } from './ContactInfoCard';
export type { ContactInfoCardProps } from './ContactInfoCard';

export { LocationCard } from './LocationCard';
export type { LocationCardProps } from './LocationCard';

export { OpeningHoursCard } from './OpeningHoursCard';
export type { OpeningHoursCardProps } from './OpeningHoursCard';

export { AvailabilityCalendar } from './AvailabilityCalendar';
export type { AvailabilityCalendarProps } from './AvailabilityCalendar';

export { GuidelinesTab } from './GuidelinesTab';
export type { GuidelinesTabProps } from './GuidelinesTab';

export { FAQTab } from './FAQTab';
export type { FAQTabProps } from './FAQTab';

export { ImageSlider } from './ImageSlider';
export type { ImageSliderProps } from './ImageSlider';

export { PriceSummaryCard } from './PriceSummaryCard';
export type { PriceSummaryCardProps, PriceLineItem } from './PriceSummaryCard';

// Booking Flow Components
export { BookingFormModal } from './BookingFormModal';
export type { BookingFormModalProps } from './BookingFormModal';

export { BookingConfirmation } from './BookingConfirmation';
export type { BookingConfirmationProps } from './BookingConfirmation';

export { BookingSuccess } from './BookingSuccess';
export type { BookingSuccessProps } from './BookingSuccess';

export { BookingSection } from './BookingSection';
export type { BookingSectionProps } from './BookingSection';

// Unified Booking Engine - Dynamic booking system for all listing types
export { UnifiedBookingEngine } from './UnifiedBookingEngine';
export type { UnifiedBookingEngineProps } from './UnifiedBookingEngine';

// Key Facts Row - Display key listing information
export { KeyFactsRow } from './KeyFactsRow';
export type { KeyFactsRowProps, KeyFact, KeyFactType } from './KeyFactsRow';

// Interactive Action Buttons
export { FavoriteButton } from './FavoriteButton';
export type { FavoriteButtonProps } from './FavoriteButton';

export { ShareButton, ShareSheet } from './ShareButton';
export type { ShareButtonProps, ShareSheetProps, ShareData, SharePlatform } from './ShareButton';

// Tabbed Navigation for Listing Details
export { ListingTabs, TabContent, TabEmptyState } from './ListingTabs';
export type { ListingTabsProps, TabConfig, TabContentProps, TabEmptyStateProps } from './ListingTabs';

// Auth Gating Modal
export { RequireAuthModal } from './RequireAuthModal';
export type { RequireAuthModalProps } from './RequireAuthModal';

// Login Components
export { 
  LoginOption, 
  FeatureItem, 
  IntegrationBadge, 
  LoginFooterLink, 
  LoginLayout 
} from './LoginComponents';
export type { 
  LoginOptionProps, 
  FeatureItemProps, 
  IntegrationBadgeProps, 
  LoginFooterLinkProps, 
  LoginLayoutProps 
} from './LoginComponents';

// Dashboard Components
export {
  StatCard,
  ActivityItem,
  ActivityFeed,
  QuickActionCard,
  formatTimeAgo,
  mapBookingStatusToActivity,
} from './DashboardComponents';
export type {
  StatCardProps,
  ActivityItemProps,
  ActivityStatus,
  ActivityFeedProps,
  QuickActionProps,
} from './DashboardComponents';

// Status Badge Components
export {
  StatusTag,
  BookingStatusBadge,
  PaymentStatusBadge,
  ListingStatusBadge,
  RequestStatusBadge,
  SeasonalLeaseStatusBadge,
  OrganizationStatusBadge,
  UserStatusBadge,
  GenericStatusBadge,
  statusConfigs,
} from './StatusBadges';
export type {
  StatusTagProps,
  BadgeColor,
  StatusBadgeConfig,
  BookingStatusType,
  BookingStatusBadgeProps,
  PaymentStatusType,
  PaymentStatusBadgeProps,
  ListingStatusType,
  ListingStatusBadgeProps,
  RequestStatusType,
  RequestStatusBadgeProps,
  SeasonalLeaseStatusType,
  SeasonalLeaseStatusBadgeProps,
  OrganizationStatusType,
  OrganizationStatusBadgeProps,
  UserStatusType,
  UserStatusBadgeProps,
  GenericStatusBadgeProps,
} from './StatusBadges';

// Chart Components
export { BarChart, VerticalBarChart } from './BarChart';
export type {
  BarChartDataItem,
  BarChartProps,
  VerticalBarChartProps,
} from './BarChart';

// Auth UI Components
export {
  LoadingScreen,
  AccessDeniedScreen,
  NotFoundScreen,
  ErrorScreen,
  PermissionGate,
} from './AuthComponents';
export type {
  LoadingScreenProps,
  AccessDeniedScreenProps,
  NotFoundScreenProps,
  ErrorScreenProps,
  PermissionGateProps,
} from './AuthComponents';

// Messaging Components
export {
  NotificationBell,
  ConversationList,
  ConversationListItem,
  MessageBubble,
  ChatThread,
} from './messaging';
export type {
  NotificationBellProps,
  ConversationListProps,
  ConversationListItemProps,
  ConversationItem,
  MessageBubbleProps,
  MessageItem,
  ChatThreadProps,
} from './messaging';

// Error Handling Components
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps, WithErrorBoundaryOptions } from './ErrorBoundary';

export { GlobalErrorHandler, useGlobalError } from './GlobalErrorHandler';
export type {
  GlobalErrorHandlerProps,
  GlobalError,
  UseGlobalErrorOptions,
} from './GlobalErrorHandler';
