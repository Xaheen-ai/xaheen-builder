/**
 * Xaheen SDK - Audit Hooks
 *
 * Fetch and query audit log entries using Convex backend.
 * Uses proper Convex React hooks for real-time updates.
 *
 * Convex backend exposes:
 *   api.domain.audit.listForBooking  — audit trail per booking
 *   api.domain.audit.listByAction    — filter by action type
 *   api.domain.audit.get             — single entry
 *   api.domain.audit.getSummary      — aggregate stats for a period
 */

import { useQuery as useConvexQuery } from "convex/react";
import { api, type TenantId } from "../convex-api";
import type { Id } from "../convex-api";
import { toPaginatedResponse, toSingleResponse } from "../transforms/common";

// ============================================================================
// Types
// ============================================================================

export interface AuditLogEntry {
    id: string;
    tenantId: string;
    bookingId: string;
    userId?: string;
    action: string;
    previousState?: unknown;
    newState?: unknown;
    reason?: string;
    metadata?: Record<string, unknown>;
    timestamp: number;
    user?: { id: string; name?: string; email?: string } | null;
    booking?: unknown;
    createdAt: string;
}

export interface AuditQueryParams {
    tenantId?: TenantId;
    action?: string;
    startDate?: number;
    endDate?: number;
    limit?: number;
}

export interface AuditStats {
    total: number;
    byAction: Record<string, number>;
    byUser: Record<string, number>;
    period: { startDate: number; endDate: number };
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch audit log entries filtered by action type.
 *
 * Wraps `api.domain.audit.listByAction`. Requires a `tenantId` and `action`
 * to be present in params; otherwise the query is skipped.
 */
export function useAuditLog(params: AuditQueryParams = {}): {
    data: { data: AuditLogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    const { tenantId, action, startDate, endDate, limit } = params;

    const canQuery = !!tenantId && !!action;

    const raw = useConvexQuery(
        api.domain.audit.listByAction,
        canQuery
            ? { tenantId: tenantId!, action: action!, startDate, endDate, limit }
            : "skip"
    );

    const isLoading = canQuery && raw === undefined;

    const items: AuditLogEntry[] = (raw ?? []).map((e: any) => ({
        id: e._id as string,
        tenantId: e.tenantId as string,
        bookingId: e.bookingId as string,
        userId: e.userId as string | undefined,
        action: e.action,
        previousState: e.previousState,
        newState: e.newState,
        reason: e.reason,
        metadata: e.metadata,
        timestamp: e.timestamp,
        user: null,
        createdAt: new Date(e.timestamp ?? e._creationTime).toISOString(),
    }));

    return { data: toPaginatedResponse(items), isLoading, error: null };
}

/**
 * Fetch a single audit event by ID.
 *
 * Wraps `api.domain.audit.get`.
 */
export function useAuditEvent(id: Id<"bookingAudit"> | undefined): {
    data: { data: AuditLogEntry } | null;
    isLoading: boolean;
    error: Error | null;
} {
    const raw = useConvexQuery(
        api.domain.audit.get,
        id ? { id } : "skip"
    );

    const isLoading = id !== undefined && raw === undefined;

    const item: AuditLogEntry | null = raw
        ? {
              id: (raw as any)._id as string,
              tenantId: (raw as any).tenantId as string,
              bookingId: (raw as any).bookingId as string,
              userId: (raw as any).userId as string | undefined,
              action: (raw as any).action,
              previousState: (raw as any).previousState,
              newState: (raw as any).newState,
              reason: (raw as any).reason,
              metadata: (raw as any).metadata,
              timestamp: (raw as any).timestamp,
              user: (raw as any).user ?? null,
              booking: (raw as any).booking ?? null,
              createdAt: new Date(
                  (raw as any).timestamp ?? (raw as any)._creationTime
              ).toISOString(),
          }
        : null;

    const data = item ? toSingleResponse(item) : null;

    return { data, isLoading, error: null };
}

/**
 * Fetch audit statistics / summary for a tenant over a time period.
 *
 * Wraps `api.domain.audit.getSummary`. Returns aggregated counts by
 * action and by user.
 */
export function useAuditStats(
    params: { tenantId?: TenantId; startDate?: number; endDate?: number } = {}
): {
    data: { data: AuditStats } | null;
    isLoading: boolean;
    error: Error | null;
} {
    const { tenantId, startDate, endDate } = params;

    const canQuery = !!tenantId && startDate !== undefined && endDate !== undefined;

    const raw = useConvexQuery(
        api.domain.audit.getSummary,
        canQuery
            ? { tenantId: tenantId!, startDate: startDate!, endDate: endDate! }
            : "skip"
    );

    const isLoading = canQuery && raw === undefined;

    const item: AuditStats | null = raw
        ? {
              total: (raw as any).total,
              byAction: (raw as any).byAction,
              byUser: (raw as any).byUser,
              period: (raw as any).period,
          }
        : null;

    const data = item ? toSingleResponse(item) : null;

    return { data, isLoading, error: null };
}

/**
 * Fetch audit log entries for a specific booking (resource-level audit).
 *
 * Wraps `api.domain.audit.listForBooking`.
 */
export function useResourceAudit(
    resourceId: Id<"bookings"> | undefined,
    params: { limit?: number } = {}
): {
    data: { data: AuditLogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    const raw = useConvexQuery(
        api.domain.audit.listForBooking,
        resourceId ? { bookingId: resourceId, limit: params.limit } : "skip"
    );

    const isLoading = resourceId !== undefined && raw === undefined;

    const items: AuditLogEntry[] = (raw ?? []).map((e: any) => ({
        id: e._id as string,
        tenantId: e.tenantId as string,
        bookingId: e.bookingId as string,
        userId: e.userId as string | undefined,
        action: e.action,
        previousState: e.previousState,
        newState: e.newState,
        reason: e.reason,
        metadata: e.metadata,
        timestamp: e.timestamp,
        user: e.user ?? null,
        createdAt: new Date(e.timestamp ?? e._creationTime).toISOString(),
    }));

    return { data: toPaginatedResponse(items), isLoading, error: null };
}

/**
 * Fetch audit log entries for a specific user.
 *
 * Stub: Convex backend currently filters by action, not by user directly.
 * This returns an empty dataset until a `listByUser` query is added to the
 * backend. Consumers can still bind to the hook safely.
 */
export function useUserAudit(
    _userId: Id<"users"> | string | undefined,
    _params: AuditQueryParams = {}
): {
    data: { data: AuditLogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    isLoading: boolean;
    error: Error | null;
} {
    // TODO: Wire up when api.domain.audit.listByUser is available
    return { data: toPaginatedResponse<AuditLogEntry>([]), isLoading: false, error: null };
}
