/**
 * Compatibility shim for @digilist/client-sdk query-keys.
 * Mirrors the digdir key factory shape but returns inert arrays.
 * These keys are unused with Convex (queries are reactive by default)
 * but prevent import errors in code that references them.
 */

function keyFactory(namespace: string) {
  return {
    all: () => [namespace] as const,
    list: (...args: unknown[]) => [namespace, "list", ...args] as const,
    lists: () => [namespace, "list"] as const,
    detail: (id: string) => [namespace, "detail", id] as const,
    details: () => [namespace, "detail"] as const,
    search: (query: string) => [namespace, "search", query] as const,
    count: (...args: unknown[]) => [namespace, "count", ...args] as const,
    summary: (...args: unknown[]) => [namespace, "summary", ...args] as const,
    stats: (...args: unknown[]) => [namespace, "stats", ...args] as const,
  };
}

export const queryKeys = {
  auth: {
    ...keyFactory("auth"),
    session: () => ["auth", "session"] as const,
    profile: () => ["auth", "profile"] as const,
    permissions: () => ["auth", "permissions"] as const,
  },
  listings: {
    ...keyFactory("listings"),
    availability: (id: string) => ["listings", "availability", id] as const,
    pricing: (id: string) => ["listings", "pricing", id] as const,
    media: (id: string) => ["listings", "media", id] as const,
    categories: () => ["listings", "categories"] as const,
    amenities: () => ["listings", "amenities"] as const,
  },
  public: {
    ...keyFactory("public"),
    featured: () => ["public", "featured"] as const,
    nearby: (lat: number, lng: number) => ["public", "nearby", lat, lng] as const,
  },
  bookings: {
    ...keyFactory("bookings"),
    upcoming: () => ["bookings", "upcoming"] as const,
    history: () => ["bookings", "history"] as const,
    conflicts: (id: string) => ["bookings", "conflicts", id] as const,
    calendar: (...args: unknown[]) => ["bookings", "calendar", ...args] as const,
  },
  organizations: {
    ...keyFactory("organizations"),
    members: (orgId: string) => ["organizations", "members", orgId] as const,
    settings: (orgId: string) => ["organizations", "settings", orgId] as const,
  },
  users: {
    ...keyFactory("users"),
    roles: (userId: string) => ["users", "roles", userId] as const,
    activity: (userId: string) => ["users", "activity", userId] as const,
  },
  blocks: {
    ...keyFactory("blocks"),
    byResource: (resourceId: string) => ["blocks", "byResource", resourceId] as const,
  },
  seasons: {
    ...keyFactory("seasons"),
    active: () => ["seasons", "active"] as const,
    upcoming: () => ["seasons", "upcoming"] as const,
  },
  seasonalLeases: {
    ...keyFactory("seasonalLeases"),
    bySeason: (seasonId: string) => ["seasonalLeases", "bySeason", seasonId] as const,
    byTenant: (tenantId: string) => ["seasonalLeases", "byTenant", tenantId] as const,
  },
  reviews: {
    ...keyFactory("reviews"),
    byListing: (listingId: string) => ["reviews", "byListing", listingId] as const,
    byUser: (userId: string) => ["reviews", "byUser", userId] as const,
    average: (listingId: string) => ["reviews", "average", listingId] as const,
  },
  audit: {
    ...keyFactory("audit"),
    byEntity: (entityType: string, entityId: string) =>
      ["audit", "byEntity", entityType, entityId] as const,
    recent: () => ["audit", "recent"] as const,
  },
  conversations: {
    ...keyFactory("conversations"),
    messages: (conversationId: string) =>
      ["conversations", "messages", conversationId] as const,
    unread: () => ["conversations", "unread"] as const,
  },
  notifications: {
    ...keyFactory("notifications"),
    unread: () => ["notifications", "unread"] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  reports: {
    ...keyFactory("reports"),
    revenue: (...args: unknown[]) => ["reports", "revenue", ...args] as const,
    utilization: (...args: unknown[]) => ["reports", "utilization", ...args] as const,
    bookings: (...args: unknown[]) => ["reports", "bookings", ...args] as const,
  },
  search: {
    ...keyFactory("search"),
    results: (query: string) => ["search", "results", query] as const,
    suggestions: (query: string) => ["search", "suggestions", query] as const,
  },
  billing: {
    ...keyFactory("billing"),
    invoices: () => ["billing", "invoices"] as const,
    subscription: () => ["billing", "subscription"] as const,
    paymentMethods: () => ["billing", "paymentMethods"] as const,
  },
  economy: {
    ...keyFactory("economy"),
    balance: () => ["economy", "balance"] as const,
    transactions: (...args: unknown[]) => ["economy", "transactions", ...args] as const,
  },
  seasonApplications: {
    ...keyFactory("seasonApplications"),
    bySeason: (seasonId: string) => ["seasonApplications", "bySeason", seasonId] as const,
    byApplicant: (userId: string) => ["seasonApplications", "byApplicant", userId] as const,
    pending: () => ["seasonApplications", "pending"] as const,
  },
  integrations: {
    ...keyFactory("integrations"),
    available: () => ["integrations", "available"] as const,
    configured: () => ["integrations", "configured"] as const,
    status: (integrationId: string) => ["integrations", "status", integrationId] as const,
  },
  help: {
    ...keyFactory("help"),
    articles: () => ["help", "articles"] as const,
    article: (articleId: string) => ["help", "article", articleId] as const,
    categories: () => ["help", "categories"] as const,
  },
} as const;
