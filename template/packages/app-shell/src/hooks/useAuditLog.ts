/**
 * useAuditLog Hook
 *
 * Fetch audit log entries from Convex backend.
 */

interface AuditLogEntry {
    _id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

interface UseAuditLogResult {
    entries: AuditLogEntry[];
    isLoading: boolean;
    error: Error | null;
}

export function useAuditLog(_limit: number = 50): UseAuditLogResult {
    // TODO: Implement with Convex query when audit.list is available
    return {
        entries: [],
        isLoading: false,
        error: null,
    };
}
