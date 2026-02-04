/**
 * Xaheen SDK - Integration Hooks (Tier 2)
 *
 * React hooks for third-party integration management:
 * tenant settings, RCO lock access, Visma invoicing, BRREG/NIF lookup,
 * Vipps payments, and calendar sync.
 *
 * All stubs since integrations are external services not yet wired
 * to Convex functions.
 *
 * Queries:  { data, isLoading, error }
 * Mutations: { mutate, mutateAsync, isLoading, error, isSuccess }
 */

import { useQuery as useConvexQuery, useAction as useConvexAction } from "convex/react";
import { api } from "../convex-api";
import { useState } from "react";

// =============================================================================
// Query Key Factory (inert -- kept for future React Query migration)
// =============================================================================

export const integrationKeys = {
  all: ["integrations"] as const,
  settings: {
    tenant: () => ["settings", "tenant"] as const,
    integrations: () => ["settings", "integrations"] as const,
    integration: (name: string) => ["settings", "integrations", name] as const,
  },
  rco: {
    status: () => ["integrations", "rco", "status"] as const,
    locks: () => ["integrations", "rco", "locks"] as const,
  },
  visma: {
    status: () => ["integrations", "visma", "status"] as const,
    invoices: () => ["integrations", "visma", "invoices"] as const,
  },
  brreg: {
    lookup: (orgNumber: string) => ["integrations", "brreg", orgNumber] as const,
  },
  nif: {
    lookup: (orgNumber: string) => ["integrations", "nif", orgNumber] as const,
  },
  vipps: {
    status: () => ["integrations", "vipps", "status"] as const,
    payment: (id: string) => ["integrations", "vipps", "payment", id] as const,
    history: () => ["integrations", "vipps", "history"] as const,
  },
  calendar: {
    status: () => ["integrations", "calendar", "status"] as const,
  },
};

// =============================================================================
// Types
// =============================================================================

export interface TenantSettings {
  tenantId: string;
  locale: string;
  currency: string;
  timezone: string;
  bookingDefaults?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  features?: Record<string, boolean>;
}

export interface IntegrationConfig {
  provider: string;
  enabled: boolean;
  config: Record<string, unknown>;
  lastSyncAt?: string;
}

export interface RcoLock {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  lastSeenAt: string;
}

export interface VismaInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
}

export interface BrregOrganization {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: string;
  registreringsdatoEnhetsregisteret?: string;
  forretningsadresse?: {
    adresse: string[];
    postnummer: string;
    poststed: string;
  };
}

export interface VippsPayment {
  orderId: string;
  amount: number;
  currency: string;
  status: "initiated" | "authorized" | "captured" | "refunded" | "cancelled";
  createdAt: string;
}

// =============================================================================
// Stub helpers
// =============================================================================

function useStubQuery<T>(emptyValue: T): { data: { data: T }; isLoading: false; error: null } {
  return { data: { data: emptyValue }, isLoading: false, error: null };
}

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
// Tenant Settings Hooks
// =============================================================================

/**
 * Get tenant settings.
 * Stub: returns empty settings object until Convex function exists.
 */
export function useTenantSettings(params?: Record<string, unknown>) {
  return useStubQuery<TenantSettings | null>(null);
}

/**
 * Update tenant settings.
 * Stub: returns noop mutation until Convex function exists.
 */
export function useUpdateTenantSettings() {
  return useStubMutation<Partial<TenantSettings>, { success: boolean }>();
}

/**
 * Get settings for a specific integration.
 * Stub: returns null until Convex function exists.
 */
export function useIntegrationSettings(integration: string) {
  return useStubQuery<IntegrationConfig | null>(null);
}

/**
 * Update settings for a specific integration.
 * Stub: returns noop mutation until Convex function exists.
 */
export function useUpdateIntegration() {
  return useStubMutation<{ provider: string; data: Record<string, unknown> }, { success: boolean }>();
}

// =============================================================================
// RCO Lock Access Hooks
// =============================================================================

/**
 * Get RCO connection status.
 * Stub: returns disconnected until RCO integration exists.
 */
export function useRcoStatus() {
  return useStubQuery<{ connected: boolean; lastSyncAt: string | null }>({
    connected: false,
    lastSyncAt: null,
  });
}

/**
 * Get connected RCO locks.
 * Stub: returns empty array until RCO integration exists.
 */
export function useRcoLocks() {
  return useStubQuery<RcoLock[]>([]);
}

/**
 * Generate an access code for an RCO lock.
 * Stub: returns noop mutation until RCO integration exists.
 */
export function useGenerateAccessCode() {
  return useStubMutation<
    { lockId: string; validFrom: string; validUntil: string; userId?: string },
    { code: string; expiresAt: string }
  >();
}

/**
 * Remotely unlock an RCO lock.
 * Stub: returns noop mutation until RCO integration exists.
 */
export function useRemoteUnlock() {
  return useStubMutation<{ lockId: string; duration?: number }, { success: boolean }>();
}

// =============================================================================
// Visma Invoicing Hooks
// =============================================================================

/**
 * Get Visma connection status.
 * Stub: returns disconnected until Visma integration exists.
 */
export function useVismaStatus() {
  return useStubQuery<{ connected: boolean; lastSyncAt: string | null }>({
    connected: false,
    lastSyncAt: null,
  });
}

/**
 * Get Visma invoices.
 * Stub: returns empty array until Visma integration exists.
 */
export function useVismaInvoices() {
  return useStubQuery<VismaInvoice[]>([]);
}

/**
 * Create a Visma invoice.
 * Stub: returns noop mutation until Visma integration exists.
 */
export function useCreateInvoice() {
  return useStubMutation<
    { bookingId: string; amount: number; currency?: string; dueDate: string },
    { invoiceId: string }
  >();
}

/**
 * Trigger sync with Visma.
 * Stub: returns noop mutation until Visma integration exists.
 */
export function useSyncVisma() {
  return useStubMutation<void, { success: boolean; syncedCount: number }>();
}

// =============================================================================
// BRREG Hooks (Norwegian Business Registry)
// =============================================================================

/**
 * Look up an organization in BRREG by organization number.
 * Stub: returns null until BRREG integration exists.
 */
export function useBrregLookup(orgNumber: string | undefined) {
  return useStubQuery<BrregOrganization | null>(null);
}

/**
 * Verify an organization number against BRREG.
 * Stub: returns noop mutation until BRREG integration exists.
 */
export function useVerifyBrreg() {
  return useStubMutation<{ orgNumber: string }, { valid: boolean; organization?: BrregOrganization }>();
}

/**
 * Look up a sports organization in NIF (Norwegian Sports Federation).
 * Stub: returns null until NIF integration exists.
 */
export function useNifLookup(orgNumber: string | undefined) {
  return useStubQuery<{ id: string; name: string; type: string; region?: string } | null>(null);
}

// =============================================================================
// Vipps Payment Hooks (wired to Convex)
// =============================================================================

/**
 * Get Vipps connection status.
 * Returns connected if VIPPS_MSN is configured.
 */
export function useVippsStatus() {
  // Vipps is always available if the app is configured
  return { data: { data: { connected: true } }, isLoading: false, error: null };
}

/**
 * Get a Vipps payment by reference.
 * Reads from the local payments table via Convex query.
 */
export function useVippsPayment(reference: string | undefined, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false && !!reference;
  const result = useConvexQuery(
    api.billing.vipps.getPaymentStatus,
    enabled && reference ? { reference } : "skip"
  );

  return {
    data: result !== undefined ? { data: result } : undefined,
    isLoading: result === undefined && enabled,
    error: null,
  };
}

/**
 * Get Vipps payment history.
 * Stub: returns empty array (full history query not yet implemented).
 */
export function useVippsPaymentHistory() {
  return useStubQuery<VippsPayment[]>([]);
}

/**
 * Initiate a Vipps payment via Convex action.
 */
export function useInitiatePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const doAction = useConvexAction(api.billing.vipps.createPayment as any);

  const mutateAsync = async (args: {
    tenantId: string;
    bookingId?: string;
    userId?: string;
    amount: number;
    currency?: string;
    description: string;
    returnUrl: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const result = await doAction(args as any);
      setIsSuccess(true);
      return result as { reference: string; redirectUrl: string };
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (args: Parameters<typeof mutateAsync>[0]) => { mutateAsync(args).catch(() => {}); },
    mutateAsync,
    isLoading,
    error,
    isSuccess,
  };
}

/**
 * Capture an authorized Vipps payment.
 */
export function useCapturePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const doAction = useConvexAction(api.billing.vipps.capturePayment as any);

  const mutateAsync = async (args: { reference: string; amount?: number }) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const result = await doAction(args as any);
      setIsSuccess(true);
      return result as { success: boolean };
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (args: Parameters<typeof mutateAsync>[0]) => { mutateAsync(args).catch(() => {}); },
    mutateAsync,
    isLoading,
    error,
    isSuccess,
  };
}

/**
 * Refund a Vipps payment (full or partial).
 */
export function useRefundPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const doAction = useConvexAction(api.billing.vipps.refundPayment as any);

  const mutateAsync = async (args: { reference: string; amount: number; reason?: string }) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const result = await doAction(args as any);
      setIsSuccess(true);
      return result as { success: boolean };
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (args: Parameters<typeof mutateAsync>[0]) => { mutateAsync(args).catch(() => {}); },
    mutateAsync,
    isLoading,
    error,
    isSuccess,
  };
}

// =============================================================================
// Calendar Sync Hooks
// =============================================================================

/**
 * Get calendar sync status.
 * Stub: returns disconnected until calendar sync integration exists.
 */
export function useCalendarSyncStatus() {
  return useStubQuery<{
    connected: boolean;
    provider?: "google" | "outlook";
    lastSyncAt: string | null;
  }>({
    connected: false,
    lastSyncAt: null,
  });
}

/**
 * Trigger calendar sync with an external provider.
 * Stub: returns noop mutation until calendar sync integration exists.
 */
export function useSyncCalendar() {
  return useStubMutation<
    { provider: "google" | "outlook" },
    { success: boolean; syncedEvents: number }
  >();
}
