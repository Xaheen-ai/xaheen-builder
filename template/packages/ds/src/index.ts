/**
 * @xaheen/ds
 * 
 * Xala Design System - Production-ready components built on Digdir Designsystemet
 * 
 * ## Component Hierarchy
 * 
 * ### Primitives (Low-level)
 * - Container, Grid, Stack - Layout primitives
 * - Button, Input, Card, etc. - From @digdir/designsystemet-react
 * 
 * ### Composed (Mid-level)
 * - ContentLayout, ContentSection, PageHeader
 * - Built from primitives
 * 
 * ### Blocks (Business logic)
 * - StatsGrid, KPICard, FormBlock (coming soon)
 * - Built from composed components
 * 
 * ### Shells (Application level)
 * - AppShell - Complete application layout
 * - Built from blocks and composed components
 * 
 * @example
 * ```tsx
 * import { AppShell, ContentLayout, ContentSection, Grid } from '@xaheen/ds';
 * 
 * function MyApp() {
 *   return (
 *     <AppShell title="My App">
 *       <ContentLayout>
 *         <ContentSection title="Dashboard">
 *           <Grid columns="repeat(3, 1fr)" gap={24}>
 *             <Card>Content</Card>
 *           </Grid>
 *         </ContentSection>
 *       </ContentLayout>
 *     </AppShell>
 *   );
 * }
 * ```
 */

// =============================================================================
// Re-export everything from Digdir Designsystemet
// =============================================================================
export * from '@digdir/designsystemet-react';

// =============================================================================
// Provider
// =============================================================================
export * from './provider';

// =============================================================================
// Component Layers - Import from specific layers
// =============================================================================

// Shells - High-level layout components
export { AppShell } from './shells';
export type { AppShellProps } from './shells';

// Composed - Mid-level components
export {
  ContentLayout,
  ContentSection,
  PageHeader,
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderActionButton,
  HeaderIconButton,
  HeaderThemeToggle,
  HeaderLanguageSwitch,
  HeaderLoginButton,
  Navigation,
  NavigationLink,
  FilterBar,
  ListingFilter,
  Drawer,
  DrawerSection,
  DrawerItem,
  DrawerEmptyState,
  Breadcrumb,
  BookingStepper,
  BottomNavigation,
  // Dialogs
  DialogProvider,
  useDialog,
  ConfirmDialog,
  AlertDialog,
} from './composed';
export { mockFilterData } from './composed';
export type {
  ContentLayoutProps,
  ContentSectionProps,
  PageHeaderProps,
  AppHeaderProps,
  HeaderLogoProps,
  HeaderSearchProps,
  HeaderActionsProps,
  HeaderIconButtonProps,
  HeaderThemeToggleProps,
  HeaderLanguageSwitchProps,
  HeaderLoginButtonProps,
  NavigationProps,
  NavigationLinkProps,
  FilterBarProps,
  ListingFilterProps,
  ListingFilterState,
  CategoryOption as ListingCategoryOption,
  SubcategoryOption,
  CityOption,
  FacilityOption,
  SortOption,
  SearchResultItem,
  SearchResultGroup,
  ListingType,
  VenueType,
  PriceUnit,
  AvailabilityStatus,
  FilterOption,
  PriceRangeFilter,
  CapacityRangeFilter,
  RatingFilter,
  LocationFilter,
  FacilitiesFilter,
  DateTimeFilter,
  FilterState,
  FilterConfig,
  DrawerProps,
  DrawerPosition,
  DrawerSize,
  DrawerSectionProps,
  DrawerItemProps,
  DrawerEmptyStateProps,
  BreadcrumbProps,
  BookingStepperProps,
  BottomNavigationProps,
  BottomNavigationItem,
  // Dialog Types
  ConfirmDialogProps,
  AlertDialogProps,
  DialogVariant,
} from './composed';

// Primitives - Low-level building blocks
export {
  Container,
  Grid,
  Stack,
  Icon,
  Card,
  Text,
  Badge,
  SunIcon,
  MoonIcon,
  SearchIcon,
  GlobeIcon,
  UserIcon,
  LogOutIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  MapIcon,
  MapPinIcon,
  CalendarIcon,
  PeopleIcon,
  ShoppingCartIcon,
  BellIcon,
  HeartIcon,
  SettingsIcon,
  LayoutGrid, // For backward compatibility
  CheckIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ProjectorIcon,
  WifiIcon,
  BoardIcon,
  VideoIcon,
  InfoIcon,
  CloseIcon,
  SparklesIcon,
  UsersIcon,
  CheckCircleIcon,
  StarIcon,
  ShieldIcon,
  ShieldCheckIcon,
  PlatformIcon,
  AutomationIcon,
  TrendUpIcon,
  TrendDownIcon,
  DownloadIcon,
  MoreVerticalIcon,
  HomeIcon,
  BuildingIcon,
  InboxIcon,
  BookOpenIcon,
  RepeatIcon,
  MessageIcon,
  ChartIcon,
  ArrowRightIcon,
  XCircleIcon,
  PlusIcon,
  MessageSquareIcon,
  IdPortenIcon,
  MicrosoftIcon,
  GoogleIcon,
  BankIdIcon,
  VippsIcon,
  SendIcon,
  OrganizationIcon,
  EditIcon,
  TrashIcon,
  RefreshIcon,
  PaperclipIcon,
  XIcon,
  SaveIcon,
  CopyIcon,
  EyeIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  FileTextIcon,
  ClipboardListIcon,
  PlayIcon,
  LockIcon,
  UnlockIcon,
  UploadIcon,
  CameraIcon,
  ImageIcon,
  FormField,
} from './primitives';
export type {
  ContainerProps,
  GridProps,
  StackProps,
  IconProps,
  CardProps,
  TextProps,
  BadgeProps,
  LayoutGridProps,
  FormFieldProps,
} from './primitives';

// Blocks - Business logic components
export {
  ListingCard,
  ListingListItem,
  ListingGrid,
  ListingToolbar,
  ListingMap,
  ListingTableView,
  ImageGallery,
  ImageSlider,
  ListingDetailHeader,
  CapacityCard,
  FacilityChips,
  AdditionalServicesList,
  ContactInfoCard,
  LocationCard,
  OpeningHoursCard,
  AvailabilityCalendar,
  GuidelinesTab,
  FAQTab,
  PriceSummaryCard,
  BookingFormModal,
  BookingConfirmation,
  BookingSuccess,
  BookingSection,
  UnifiedBookingEngine,
  // New listing detail components
  KeyFactsRow,
  FavoriteButton,
  ShareButton,
  ShareSheet,
  ListingTabs,
  TabContent,
  TabEmptyState,
  RequireAuthModal,
  LoginOption,
  FeatureItem,
  IntegrationBadge,
  LoginFooterLink,
  LoginLayout,
  StatCard,
  ActivityItem,
  ActivityFeed,
  QuickActionCard,
  formatTimeAgo,
  mapBookingStatusToActivity,
  // Status Badge Components
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
  // Chart Components
  BarChart,
  VerticalBarChart,
  // Auth UI Components
  LoadingScreen,
  AccessDeniedScreen,
  NotFoundScreen,
  ErrorScreen,
  PermissionGate,
  // Messaging Components
  NotificationBell,
  ConversationList,
  ConversationListItem,
  MessageBubble,
  ChatThread,
  // Error Handling Components
  ErrorBoundary,
  withErrorBoundary,
  GlobalErrorHandler,
  useGlobalError,
} from './blocks';
export type {
  ListingCardProps,
  ListingCardVariant,
  ListingListItemProps,
  ListingGridProps,
  ListingToolbarProps,
  ListingMapProps,
  MapListing,
  ListingTableViewProps,
  ViewMode,
  ImageGalleryProps,
  ImageSliderProps,
  ListingDetailHeaderProps,
  CapacityCardProps,
  FacilityChipsProps,
  AdditionalServicesListProps,
  ContactInfoCardProps,
  LocationCardProps,
  OpeningHoursCardProps,
  AvailabilityCalendarProps,
  GuidelinesTabProps,
  FAQTabProps,
  PriceSummaryCardProps,
  PriceLineItem,
  BookingFormModalProps,
  BookingConfirmationProps,
  BookingSuccessProps,
  BookingSectionProps,
  UnifiedBookingEngineProps,
  // New listing detail types
  KeyFactsRowProps,
  KeyFact,
  KeyFactType,
  FavoriteButtonProps,
  ShareButtonProps,
  ShareSheetProps,
  ShareData,
  SharePlatform,
  ListingTabsProps,
  TabConfig,
  TabContentProps,
  TabEmptyStateProps,
  RequireAuthModalProps,
  LoginOptionProps,
  FeatureItemProps,
  IntegrationBadgeProps,
  LoginFooterLinkProps,
  LoginLayoutProps,
  StatCardProps,
  ActivityItemProps,
  ActivityStatus,
  ActivityFeedProps,
  QuickActionProps,
  // Status Badge Types
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
  // Chart Types
  BarChartDataItem,
  BarChartProps,
  VerticalBarChartProps,
  // Auth UI Types
  LoadingScreenProps,
  AccessDeniedScreenProps,
  NotFoundScreenProps,
  ErrorScreenProps,
  PermissionGateProps,
  // Messaging Types
  NotificationBellProps,
  ConversationListProps,
  ConversationListItemProps,
  ConversationItem,
  MessageBubbleProps,
  MessageItem,
  ChatThreadProps,
  // Error Handling Types
  ErrorBoundaryProps,
  WithErrorBoundaryOptions,
  GlobalErrorHandlerProps,
  GlobalError,
  UseGlobalErrorOptions,
} from './blocks';

// Listing Detail Types
export type {
  TimeSlotStatus,
  GalleryImage,
  Facility,
  AdditionalService,
  ContactInfo,
  Coordinates,
  OpeningHoursDay,
  TimeSlot,
  BreadcrumbItem,
  BookingStep,
  BookingDetails,
  BookingState,
  GuidelineSection,
  FAQItem,
  ListingDetail,
  ActivityType
} from './types/listing-detail';

// Booking Engine Types
export type {
  BookingMode,
  BookingPriceUnit,
  SlotStatus,
  AvailabilitySlot,
  DayAvailability,
  BookingPricing,
  BookingRules,
  DaySchedule,
  BookingConfig,
  BookingSelection,
  BookingFormData,
  PriceItem,
  BookingPriceCalculation,
  BookingStepConfig
} from './types/booking';

export {
  getBookingSteps,
  determineBookingMode,
  formatPrice,
  formatPriceUnit
} from './types/booking';

// =============================================================================
// Design System Utilities & Tokens
// =============================================================================
export {
  cn,
  spacing,
  interactiveBackgrounds,
  badgeStyles,
  menuItemStyles,
  emptyStateStyles,
  buttonTextColors,
  logoStyles,
  brandColors,
  brandColorsCss,
} from './utils';

// =============================================================================
// API Error Utilities (RFC 7807 Problem Details)
// =============================================================================
export {
  parseApiError,
  parseErrorObject,
  getStatusMessage,
  formatFieldErrors,
  shouldOfferRetry,
  createProblemDetails,
} from './utils/api-error';
export type {
  ProblemDetails,
  ParsedApiError,
  ApiErrorCategory,
} from './utils/api-error';

// =============================================================================
// CSS Import Policy
// =============================================================================
/** 
 * We intentionally do NOT export Digdir CSS from this module. Applications
 * must import '@xaheen/ds/styles' exactly once in their entry point to ensure
 * proper theme switching and prevent CSS duplication.
 */
