/**
 * Xaheen SDK - Hooks Index
 *
 * All hooks use Convex backend for real-time data.
 */

// Tenant ID resolution (reads from session, used internally and by apps)
export { useSessionTenantId, useResolveTenantId } from './use-tenant-id';

// Auth
export { useAuth } from './use-auth';

// Auth Adapter (digdir-compatible)
export {
    useSession,
    useLogin,
    useEmailLogin,
    useLogout,
    useRefreshToken,
    useAuthProviders,
} from './use-auth';

// OAuth Callback
export { useOAuthCallback } from './use-oauth-callback';

// Resources
export {
    useResources,
    useResource,
    useCreateResource,
    useUpdateResource,
    useDeleteResource,
    usePublishResource,
    useUnpublishResource,
    usePublicResources,
} from './use-resources';

// Bookings
export {
    useBookings,
    useCreateBooking,
    useCalendar,
    useApproveBooking,
    useRejectBooking,
    useCancelBooking,
} from './use-bookings';

// Bookings Adapter (digdir-compatible)
export {
    useBooking,
    useMyBookings,
    useRecurringBookings,
    useBookingPricing,
    useUpdateBooking,
    useConfirmBooking,
    useCompleteBooking,
    useDeleteBooking,
    useCalendarEvents,
    useAvailabilitySlots,
    useAllocations,
    useCreateAllocation,
    useDeleteAllocation,
    usePaymentHistory,
    usePaymentReconciliation,
} from './use-bookings';

export type { CalendarEvent } from './use-bookings';

// Listings (Tier 1 adapter — digdir-compatible API shape over Convex resources)
export {
    useListings,
    useListing,
    useListingBySlug,
    useListingAvailability,
    useListingStats,
    usePublicListings,
    usePublicUiListings,
    usePublicListing,
    usePublicUiListing,
    usePublicAvailability,
    usePublicCategories,
    usePublicCities,
    usePublicMunicipalities,
    useFeaturedListings,
    useCreateListing,
    useUpdateListing,
    useDeleteListing,
    usePublishListing,
    useUnpublishListing,
    useArchiveListing,
    useRestoreListing,
    useDuplicateListing,
    useUploadListingMedia,
    useDeleteListingMedia,
} from './use-listings';

// Listing types (re-exported for convenience)
export type {
    Listing,
    ListingType,
    ListingStatus,
    ListingPricing,
    ListingLocation,
    ListingMetadata,
    ListingAvailability,
    ListingStats,
    ListingQueryParams,
    PublicListingParams,
    AvailabilityQueryParams,
    CreateListingDTO,
    UpdateListingDTO,
    Category,
    City,
    Municipality,
} from './use-listings';

// Blocks (Tier 2 adapter — digdir-compatible API shape over Convex blocks)
export {
    useBlocks,
    useBlock,
    useCreateBlock,
    useUpdateBlock,
    useDeleteBlock,
    useCheckConflicts,
    blockKeys,
} from './use-blocks';

export type {
    Block,
    BlockId,
    BlockListParams,
    CreateBlockInput,
    UpdateBlockInput,
    ConflictCheckParams,
    ConflictsResponse,
} from './use-blocks';

// Organizations & Users (Tier 2 adapter — digdir-compatible API shape)
export {
    useOrganizations,
    useOrganization,
    useOrganizationMembers,
    useCreateOrganization,
    useUpdateOrganization,
    useDeleteOrganization,
    useVerifyOrganization,
    useUploadOrganizationLogo,
    organizationKeys,
    useUsers,
    useUser,
    useCurrentUser,
    useCreateUser,
    useUpdateUser,
    useUpdateCurrentUser,
    useDeactivateUser,
    useReactivateUser,
    useUploadUserAvatar,
    useExportData,
    useDeleteAccount,
    useConsents,
    useUpdateConsents,
    userKeys,
} from './use-organizations';

export type {
    Organization,
    OrganizationQueryParams,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    User,
    UserQueryParams,
    CreateUserInput,
    UpdateUserInput,
    ConsentSettings,
} from './use-organizations';

// Audit (Tier 2 adapter — audit log hooks over Convex bookingAudit)
export {
    useAuditLog,
    useAuditEvent,
    useAuditStats,
    useResourceAudit,
    useUserAudit,
} from './use-audit';

export type {
    AuditLogEntry,
    AuditQueryParams,
    AuditStats,
} from './use-audit';

// Seasons (Tier 2 adapter — season management over Convex seasons)
export {
    useSeasons,
    useSeason,
    useSeasonStats,
    useCreateSeason,
    useUpdateSeason,
    useOpenSeason,
    useCloseSeason,
    useActivateSeason,
    useCompleteSeason,
    useCancelSeason,
    useDeleteSeason,
    seasonKeys,
} from './use-seasons';

export type {
    Season,
    SeasonQueryParams,
    CreateSeasonInput,
    UpdateSeasonInput,
} from './use-seasons';

// Reviews (Tier 2 adapter — stubs until Convex reviews table exists)
export {
    useReviews,
    useReview,
    useListingReviews,
    useReviewStats,
    useReviewSummary,
    useMyReviews,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
    useModerateReview,
    useApproveReview,
    useRejectReview,
    reviewKeys,
} from './use-reviews';

export type {
    Review,
    ReviewStatus,
    ReviewQueryParams,
    CreateReviewInput,
    UpdateReviewInput,
    ModerateReviewInput,
    ReviewStats,
    ReviewSummary,
} from './use-reviews';

// Reports (Tier 2 adapter — dashboard KPIs, analytics, export)
export {
    useDashboardKPIs,
    useDashboardStats,
    useDashboardActivity,
    usePendingItems,
    useUpcomingBookings,
    useQuickActions,
    useBookingStats,
    useRevenueReport,
    useUsageReport,
    useTimeSlotHeatmap,
    useSeasonalPatterns,
    useComparisonData,
    useExportReport,
    reportKeys,
} from './use-reports';

// Conversations (Tier 2 adapter — messaging)
export {
    useConversations,
    useConversation,
    useMessages,
    useUnreadCount,
    useCreateConversation,
    useSendMessage,
    useMarkMessagesRead,
    useResolveConversation,
    useReopenConversation,
    useAssignConversation,
    conversationKeys,
} from './use-conversations';

export type {
    Conversation,
    Message,
    CreateConversationInput,
    SendMessageInput,
} from './use-conversations';

// Notifications (Tier 2 adapter — in-app + push)
export {
    useNotifications,
    useMyNotifications,
    useNotificationUnreadCount,
    useNotificationTemplates,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useDeleteNotification,
    usePushSubscriptions,
    useNotificationPreferences,
    usePushPermission,
    useRegisterPushSubscription,
    useUnsubscribePush,
    useDeletePushSubscription,
    useUpdateNotificationPreferences,
    useTestPushNotification,
    usePushSubscriptionFlow,
    notificationKeys,
} from './use-notifications';

export type {
    Notification,
    NotificationTemplate,
    PushSubscription,
    NotificationPreferences,
} from './use-notifications';

// Integrations (Tier 2 adapter — RCO, Visma, BRREG, Vipps, calendar sync)
export {
    useTenantSettings,
    useUpdateTenantSettings,
    useIntegrationSettings,
    useUpdateIntegration,
    useRcoStatus,
    useRcoLocks,
    useGenerateAccessCode,
    useRemoteUnlock,
    useVismaStatus,
    useVismaInvoices,
    useCreateInvoice,
    useSyncVisma,
    useBrregLookup,
    useVerifyBrreg,
    useNifLookup,
    useVippsStatus,
    useVippsPayment,
    useVippsPaymentHistory,
    useInitiatePayment,
    useCapturePayment,
    useRefundPayment,
    useCalendarSyncStatus,
    useSyncCalendar,
    integrationKeys,
} from './use-integrations';

export type {
    TenantSettings,
    IntegrationConfig,
    RcoLock,
    VismaInvoice,
    BrregOrganization,
    VippsPayment,
} from './use-integrations';

// Seasonal Leases (Tier 3 adapter — stubs)
export {
    useSeasonalLeases,
    useSeasonalLease,
    useCreateSeasonalLease,
    useUpdateSeasonalLease,
    useApproveSeasonalLease,
    useRejectSeasonalLease,
    useCancelSeasonalLease,
    useDeleteSeasonalLease,
    useGenerateAllocations,
    seasonalLeaseKeys,
} from './use-seasonal-leases';

export type {
    SeasonalLease,
    SeasonalLeaseQueryParams,
    CreateSeasonalLeaseDTO,
} from './use-seasonal-leases';

// Season Applications (Tier 3 adapter — stubs)
export {
    useSeasonApplications,
    useSeasonApplication,
    useCreateSeasonApplication,
    useUpdateSeasonApplication,
    useApproveSeasonApplication,
    useRejectSeasonApplication,
    useAllocateApplication,
    useFinalizeSeasonAllocations,
    useDeleteSeasonApplication,
    seasonApplicationKeys,
} from './use-season-applications';

export type {
    SeasonApplication,
    SeasonApplicationQueryParams,
    CreateSeasonApplicationDTO,
    AllocateApplicationDTO,
    FinalizeSeasonAllocationsDTO,
} from './use-season-applications';

// Billing (Tier 3 adapter — stubs)
export {
    useBillingSummary,
    useInvoices,
    useInvoice,
    useDownloadInvoice,
    useInvoiceDownloadUrl,
    useOrgBillingSummary,
    useOrgInvoices,
    useOrgInvoice,
    useDownloadOrgInvoice,
    billingKeys,
} from './use-billing';

export type {
    BillingSummary,
    Invoice,
    InvoiceLineItem,
    InvoiceQueryParams,
} from './use-billing';

// Economy (Tier 3 adapter — stubs for Visma/invoicing)
export {
    useInvoiceBases,
    useInvoiceBasis,
    useCreateInvoiceBasis,
    useGenerateFromBookings,
    useUpdateInvoiceBasis,
    useApproveInvoiceBasis,
    useFinalizeInvoiceBasis,
    useDeleteInvoiceBasis,
    useSalesDocuments,
    useSalesDocument,
    useSendSalesDocument,
    useMarkAsPaid,
    useDownloadInvoicePdf,
    useCancelSalesDocument,
    useCreditNotes,
    useCreditNote,
    useCreateCreditNote,
    useApproveCreditNote,
    useProcessCreditNote,
    useDownloadCreditNotePdf,
    useSyncToVisma,
    useVismaInvoiceStatus,
    useExportEconomy,
    useEconomyStatistics,
    economyKeys,
} from './use-economy';

export type {
    InvoiceBasis,
    SalesDocument,
    CreditNote,
    EconomyStatistics,
    VismaInvoiceStatus as VismaInvoiceStatusType,
    EconomyQueryParams,
    CreateInvoiceBasisDTO,
    UpdateInvoiceBasisDTO,
    GenerateInvoicesFromBookingsDTO,
    FinalizeInvoiceBasisDTO,
    SendSalesDocumentDTO,
    MarkAsPaidDTO,
    CreateCreditNoteDTO,
    SyncToVismaDTO,
    EconomyExportParams,
} from './use-economy';

// Search (Tier 3 adapter — stubs)
export {
    useGlobalSearch,
    useTypeahead,
    useSavedFilters,
    useSavedFilter,
    useCreateSavedFilter,
    useUpdateSavedFilter,
    useDeleteSavedFilter,
    useRecentSearches,
    useExportResults,
    searchKeys,
} from './use-search';

export type {
    SearchParams,
    SearchResult,
    SearchResponse,
    TypeaheadParams,
    TypeaheadSuggestion,
    SavedFilter,
    CreateSavedFilterDTO,
    RecentSearch,
    ExportSearchParams,
} from './use-search';

// Help (Tier 3 adapter — stubs)
export {
    useFaq,
    useGuides,
    useTraining,
    useTooltips,
    useSubmitContact,
    helpKeys,
} from './use-help';

export type {
    FaqEntry,
    Guide,
    TrainingModule,
    TrainingStep,
    Tooltip,
    ContactFormDTO,
} from './use-help';

// Geocode (Tier 3 — client-side geocoding, no backend dependency)
export {
    useGeocodeListings,
    useGeocode,
    buildAddressString,
} from './use-geocode';

export type {
    GeocodedLocation,
    GeocodeConfig,
    GeocodedItem,
    UseGeocodeListingsOptions,
    UseGeocodeListingsResult,
} from './use-geocode';

// Accessibility Monitoring (Tier 3 — client-side monitoring, no backend dependency)
export {
    useAccessibilityMonitoring,
    useScreenReaderDetection,
    useKeyboardNavigationDetection,
} from './use-accessibility-monitoring';

export type {
    UseAccessibilityMonitoringOptions,
    AccessibilityMonitoringAPI,
    AccessibilityMonitoringConfig,
    AccessibilityMetric,
    AccessibilityMetricType,
    AccessibilityReport,
    KeyboardNavigationMetric,
    SkipLinkUsageMetric,
    ScreenReaderDetectionMetric,
    FocusManagementMetric,
    AriaAnnouncementMetric,
} from './use-accessibility-monitoring';

// Categories (Tier 2 adapter — tenant-configurable categories from database)
export {
    useCategories,
    useCategoryTree,
    useCategoryOptions,
    useCategoryLabel,
} from './use-categories';

export type {
    Category as TenantCategory,
    CategoryWithSubcategories,
    CategoryOption,
} from './use-categories';

// Amenities (Tier 2 adapter — tenant-configurable amenities from database)
export {
    useAmenities,
    useAmenitiesGrouped,
    useAmenityOptions,
    useAmenityLabel,
} from './use-amenities';

export type {
    Amenity,
    AmenityGroup,
    AmenityOption,
} from './use-amenities';
