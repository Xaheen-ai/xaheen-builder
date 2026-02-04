/**
 * Xaheen SDK - Report Hooks (Tier 2)
 *
 * React hooks for analytics, dashboard KPIs, and reporting.
 * Most are stubs since dashboard Convex functions don't exist yet.
 * Returns React Query-compatible shapes: { data, isLoading, error } for queries,
 * { mutate, mutateAsync, isLoading, error, isSuccess } for mutations.
 */

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../convex-api";
import { useState } from "react";

// =============================================================================
// Query Key Factory (inert — kept for future React Query migration)
// =============================================================================

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
  kpis: () => [...reportKeys.all, "kpis"] as const,
  stats: () => [...reportKeys.all, "stats"] as const,
  activity: (limit?: number) => [...reportKeys.all, "activity", { limit }] as const,
  pending: () => [...reportKeys.all, "pending"] as const,
  upcoming: (limit?: number) => [...reportKeys.all, "upcoming", { limit }] as const,
  quickActions: () => [...reportKeys.all, "quick-actions"] as const,
  bookings: (params?: Record<string, unknown>) => [...reportKeys.all, "bookings", params] as const,
  revenue: (params?: Record<string, unknown>) => [...reportKeys.all, "revenue", params] as const,
  usage: (params?: Record<string, unknown>) => [...reportKeys.all, "usage", params] as const,
  heatmap: (params?: Record<string, unknown>) => [...reportKeys.all, "heatmap", params] as const,
  seasonal: (params?: Record<string, unknown>) => [...reportKeys.all, "seasonal", params] as const,
  comparison: (params?: Record<string, unknown>) => [...reportKeys.all, "comparison", params] as const,
};

// =============================================================================
// Stub helper
// =============================================================================

/** Creates a query-shaped stub returning wrapped data */
function useStubQuery<T>(emptyValue: T): { data: { data: T }; isLoading: false; error: null } {
  return { data: { data: emptyValue }, isLoading: false, error: null };
}

/** Creates a mutation-shaped stub */
function useStubMutation<TArgs = void, TResult = void>(): {
  mutate: (args: TArgs) => void;
  mutateAsync: (args: TArgs) => Promise<TResult>;
  isLoading: false;
  error: null;
  isSuccess: false;
} {
  return {
    mutate: (_args: TArgs) => {},
    mutateAsync: (_args: TArgs) => Promise.resolve(undefined as unknown as TResult),
    isLoading: false,
    error: null,
    isSuccess: false,
  };
}

// =============================================================================
// Dashboard Query Hooks (stubs)
// =============================================================================

/**
 * Fetch dashboard KPIs (total bookings, revenue, utilization, etc.)
 * Stub: returns empty KPI object until Convex function exists.
 */
export function useDashboardKPIs(params?: Record<string, unknown>) {
  return useStubQuery({
    totalBookings: 0,
    totalRevenue: 0,
    utilizationRate: 0,
    activeResources: 0,
  });
}

/**
 * Fetch dashboard statistics (bookings, revenue, listings, users)
 * Stub: returns empty stats until Convex function exists.
 */
export function useDashboardStats(params?: Record<string, unknown>) {
  return useStubQuery({
    bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
    revenue: { total: 0, currency: "NOK" },
    resources: { total: 0, active: 0 },
    users: { total: 0 },
  });
}

/**
 * Fetch recent dashboard activity feed
 * Stub: returns empty array until Convex function exists.
 */
export function useDashboardActivity(params?: { limit?: number }) {
  return useStubQuery<Array<{ id: string; type: string; message: string; timestamp: string }>>([]);
}

/**
 * Fetch pending items count (bookings, messages, approvals)
 * Stub: returns zeroes until Convex function exists.
 */
export function usePendingItems(params?: Record<string, unknown>) {
  return useStubQuery({
    pendingBookings: 0,
    pendingMessages: 0,
    pendingApprovals: 0,
    total: 0,
  });
}

/**
 * Fetch upcoming bookings for today/near future
 * Stub: returns empty array until Convex function exists.
 */
export function useUpcomingBookings(params?: { limit?: number }) {
  return useStubQuery<Array<{ id: string; resourceName: string; startsAt: string; endsAt: string; status: string }>>([]);
}

/**
 * Fetch quick actions for the current user
 * Stub: returns empty array until Convex function exists.
 */
export function useQuickActions() {
  return useStubQuery<Array<{ id: string; label: string; icon?: string; action: string }>>([]);
}

// =============================================================================
// Analytics Report Query Hooks (stubs)
// =============================================================================

/**
 * Fetch booking statistics/report for a given period
 * Stub: returns empty report until Convex function exists.
 */
export function useBookingStats(params?: { startDate?: string; endDate?: string; period?: string }) {
  return useStubQuery({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    averageDuration: 0,
    chartData: [] as Array<{ date: string; count: number }>,
  });
}

/**
 * Fetch revenue report for a given period
 * Stub: returns empty report until Convex function exists.
 */
export function useRevenueReport(params?: { startDate?: string; endDate?: string; period?: string }) {
  return useStubQuery({
    totalRevenue: 0,
    currency: "NOK",
    chartData: [] as Array<{ date: string; amount: number }>,
    byCategory: [] as Array<{ category: string; amount: number }>,
  });
}

/**
 * Fetch usage / utilization report for a given period
 * Stub: returns empty report until Convex function exists.
 */
export function useUsageReport(params?: { startDate?: string; endDate?: string; period?: string }) {
  return useStubQuery({
    averageUtilization: 0,
    peakUtilization: 0,
    chartData: [] as Array<{ date: string; utilization: number }>,
    byResource: [] as Array<{ resourceId: string; name: string; utilization: number }>,
  });
}

/**
 * Fetch time-slot heatmap data
 * Stub: returns empty matrix until Convex function exists.
 */
export function useTimeSlotHeatmap(params?: { startDate?: string; endDate?: string; period?: string }) {
  return useStubQuery({
    matrix: [] as Array<Array<number>>,
    xLabels: [] as string[],
    yLabels: [] as string[],
  });
}

/**
 * Fetch seasonal patterns report
 * Stub: returns empty report until Convex function exists.
 */
export function useSeasonalPatterns(params?: { startDate?: string; endDate?: string; period?: string }) {
  return useStubQuery({
    patterns: [] as Array<{ month: string; bookings: number; revenue: number }>,
  });
}

/**
 * Fetch period comparison data
 * Stub: returns empty comparison until Convex function exists.
 */
export function useComparisonData(params?: { startDate?: string; endDate?: string; period?: string }) {
  return useStubQuery({
    current: { bookings: 0, revenue: 0, utilization: 0 },
    previous: { bookings: 0, revenue: 0, utilization: 0 },
    changePercent: { bookings: 0, revenue: 0, utilization: 0 },
  });
}

// =============================================================================
// Mutation Hooks (stubs)
// =============================================================================

/**
 * Export report data (CSV, PDF, etc.)
 * Stub: returns noop mutation until Convex function exists.
 */
export function useExportReport() {
  return useStubMutation<
    { type: string; params?: Record<string, unknown>; format?: "csv" | "pdf" | "xlsx" },
    { url: string }
  >();
}
