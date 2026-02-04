/**
 * Xaheen SDK - Billing Hooks (Tier 3)
 *
 * React Query-shaped hooks for user and organization billing (Minside portal).
 * Stubs until Convex backend functions are implemented.
 */

import { useState, useCallback } from "react";
import { toPaginatedResponse } from "../transforms/common";

// =============================================================================
// Types
// =============================================================================

export interface InvoiceQueryParams {
  status?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface BillingSummary {
  totalOutstanding: number;
  totalPaid: number;
  currency: string;
  invoiceCount: number;
  overdueCount: number;
  nextDueDate?: string;
  period?: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  description?: string;
  lineItems: InvoiceLineItem[];
  metadata?: Record<string, unknown>;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// =============================================================================
// Query Keys
// =============================================================================

export const billingKeys = {
  all: ["billing"] as const,
  summary: (params?: { period?: string }) =>
    [...billingKeys.all, "summary", params] as const,
  invoices: {
    all: () => [...billingKeys.all, "invoices"] as const,
    list: (params?: InvoiceQueryParams) =>
      [...billingKeys.invoices.all(), "list", params] as const,
    detail: (id: string) =>
      [...billingKeys.invoices.all(), "detail", id] as const,
  },
  org: (orgId: string) => ({
    all: [...billingKeys.all, "org", orgId] as const,
    summary: (params?: { period?: string }) =>
      [...billingKeys.org(orgId).all, "summary", params] as const,
    invoices: {
      list: (params?: InvoiceQueryParams) =>
        [...billingKeys.org(orgId).all, "invoices", "list", params] as const,
      detail: (invoiceId: string) =>
        [
          ...billingKeys.org(orgId).all,
          "invoices",
          "detail",
          invoiceId,
        ] as const,
    },
  }),
};

// =============================================================================
// Internal Helpers
// =============================================================================

function useMutationAdapter<TArgs extends unknown[], TResult = void>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutateAsync = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      try {
        const result = await fn(...args);
        setIsSuccess(true);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [fn]
  );

  const mutate = useCallback(
    (...args: TArgs) => {
      mutateAsync(...args).catch(() => {
        /* swallow - error is captured in state */
      });
    },
    [mutateAsync]
  );

  return { mutate, mutateAsync, isLoading, error, isSuccess };
}

// =============================================================================
// User Billing Hooks
// =============================================================================

/**
 * Get user's billing summary (stub).
 */
export function useBillingSummary(
  _params?: { period?: string }
): { data: { data: BillingSummary } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Get user's invoices (stub).
 */
export function useInvoices(
  _params?: InvoiceQueryParams
): { data: { data: Invoice[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<Invoice>([]), isLoading: false, error: null };
}

/**
 * Get single invoice by ID (stub).
 */
export function useInvoice(
  _id: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: Invoice } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Download invoice as PDF (returns blob) (stub).
 */
export function useDownloadInvoice() {
  const fn = useCallback(
    async (_id: string): Promise<Blob> => {
      throw new Error(
        "useDownloadInvoice: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Get temporary download URL for invoice (stub).
 */
export function useInvoiceDownloadUrl(
  _id: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: string } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

// =============================================================================
// Organization Billing Hooks
// =============================================================================

/**
 * Get organization's billing summary (stub).
 */
export function useOrgBillingSummary(
  _orgId: string | undefined,
  _params?: { period?: string }
): { data: { data: BillingSummary } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Get organization's invoices (stub).
 */
export function useOrgInvoices(
  _orgId: string | undefined,
  _params?: InvoiceQueryParams
): { data: { data: Invoice[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<Invoice>([]), isLoading: false, error: null };
}

/**
 * Get single organization invoice (stub).
 */
export function useOrgInvoice(
  _orgId: string | undefined,
  _invoiceId: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: Invoice } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Download organization invoice as PDF (stub).
 */
export function useDownloadOrgInvoice() {
  const fn = useCallback(
    async (_input: {
      orgId: string;
      invoiceId: string;
    }): Promise<Blob> => {
      throw new Error(
        "useDownloadOrgInvoice: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}
