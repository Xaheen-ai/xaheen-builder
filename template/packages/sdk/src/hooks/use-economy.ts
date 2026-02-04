/**
 * Xaheen SDK - Economy Hooks (Tier 3)
 *
 * React Query-shaped hooks for economy, invoicing, credit notes, and Visma integration.
 * Stubs until Convex backend functions are implemented.
 */

import { useState, useCallback } from "react";
import { toPaginatedResponse } from "../transforms/common";

// =============================================================================
// Types
// =============================================================================

export interface EconomyQueryParams {
  tenantId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateInvoiceBasisDTO {
  tenantId: string;
  customerId: string;
  lineItems: InvoiceBasisLineItem[];
  dueDate: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceBasisLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  bookingId?: string;
  resourceId?: string;
}

export interface UpdateInvoiceBasisDTO {
  lineItems?: InvoiceBasisLineItem[];
  dueDate?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface GenerateInvoicesFromBookingsDTO {
  tenantId: string;
  startDate: string;
  endDate: string;
  resourceIds?: string[];
  customerIds?: string[];
}

export interface FinalizeInvoiceBasisDTO {
  invoiceBasisId: string;
  sendToCustomer?: boolean;
}

export interface SendSalesDocumentDTO {
  salesDocumentId: string;
  recipientEmail?: string;
  method?: "email" | "ehf" | "print";
}

export interface MarkAsPaidDTO {
  salesDocumentId: string;
  paidAt?: string;
  paymentMethod?: string;
  reference?: string;
}

export interface CreateCreditNoteDTO {
  salesDocumentId: string;
  reason: string;
  lineItems?: CreditNoteLineItem[];
  fullCredit?: boolean;
}

export interface CreditNoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
}

export interface SyncToVismaDTO {
  salesDocumentIds: string[];
  dryRun?: boolean;
}

export interface EconomyExportParams {
  tenantId: string;
  format: "csv" | "xlsx" | "pdf";
  startDate?: string;
  endDate?: string;
  type?: "invoices" | "credit-notes" | "all";
}

export interface InvoiceBasis {
  id: string;
  tenantId: string;
  customerId: string;
  status: string;
  lineItems: InvoiceBasisLineItem[];
  totalAmount: number;
  vatAmount: number;
  currency: string;
  dueDate: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SalesDocument {
  id: string;
  tenantId: string;
  invoiceBasisId: string;
  customerId: string;
  documentNumber: string;
  status: string;
  totalAmount: number;
  vatAmount: number;
  currency: string;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  sentAt?: string;
  vismaId?: string;
  vismaSyncStatus?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNote {
  id: string;
  tenantId: string;
  salesDocumentId: string;
  creditNoteNumber: string;
  status: string;
  reason: string;
  totalAmount: number;
  vatAmount: number;
  currency: string;
  lineItems: CreditNoteLineItem[];
  issuedAt?: string;
  processedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EconomyStatistics {
  totalRevenue: number;
  totalOutstanding: number;
  totalCredited: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  creditNoteCount: number;
  currency: string;
  period?: { startDate: string; endDate: string };
}

export interface VismaInvoiceStatus {
  salesDocumentId: string;
  vismaId?: string;
  syncStatus: string;
  lastSyncAt?: string;
  errorMessage?: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const economyKeys = {
  all: ["economy"] as const,
  invoiceBases: {
    all: () => [...economyKeys.all, "invoice-bases"] as const,
    lists: () => [...economyKeys.invoiceBases.all(), "list"] as const,
    list: (params?: EconomyQueryParams) =>
      [...economyKeys.invoiceBases.lists(), params] as const,
    details: () => [...economyKeys.invoiceBases.all(), "detail"] as const,
    detail: (id: string) =>
      [...economyKeys.invoiceBases.details(), id] as const,
  },
  salesDocuments: {
    all: () => [...economyKeys.all, "sales-documents"] as const,
    lists: () => [...economyKeys.salesDocuments.all(), "list"] as const,
    list: (params?: EconomyQueryParams) =>
      [...economyKeys.salesDocuments.lists(), params] as const,
    details: () => [...economyKeys.salesDocuments.all(), "detail"] as const,
    detail: (id: string) =>
      [...economyKeys.salesDocuments.details(), id] as const,
    vismaStatus: (id: string) =>
      [...economyKeys.salesDocuments.detail(id), "visma-status"] as const,
  },
  creditNotes: {
    all: () => [...economyKeys.all, "credit-notes"] as const,
    lists: () => [...economyKeys.creditNotes.all(), "list"] as const,
    list: (params?: EconomyQueryParams) =>
      [...economyKeys.creditNotes.lists(), params] as const,
    details: () => [...economyKeys.creditNotes.all(), "detail"] as const,
    detail: (id: string) =>
      [...economyKeys.creditNotes.details(), id] as const,
  },
  statistics: (params?: { startDate?: string; endDate?: string }) =>
    [...economyKeys.all, "statistics", params] as const,
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
// Invoice Basis Hooks
// =============================================================================

/**
 * Get paginated invoice bases (stub).
 */
export function useInvoiceBases(
  _params?: EconomyQueryParams
): { data: { data: InvoiceBasis[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<InvoiceBasis>([]), isLoading: false, error: null };
}

/**
 * Get single invoice basis by ID (stub).
 */
export function useInvoiceBasis(
  _id: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: InvoiceBasis } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Create invoice basis (stub).
 */
export function useCreateInvoiceBasis() {
  const fn = useCallback(
    async (_data: CreateInvoiceBasisDTO): Promise<{ id: string }> => {
      throw new Error(
        "useCreateInvoiceBasis: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Generate invoice bases from bookings (stub).
 */
export function useGenerateFromBookings() {
  const fn = useCallback(
    async (
      _data: GenerateInvoicesFromBookingsDTO
    ): Promise<{ ids: string[]; count: number }> => {
      throw new Error(
        "useGenerateFromBookings: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Update invoice basis (stub).
 */
export function useUpdateInvoiceBasis() {
  const fn = useCallback(
    async (_input: {
      id: string;
      data: UpdateInvoiceBasisDTO;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useUpdateInvoiceBasis: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Approve invoice basis (stub).
 */
export function useApproveInvoiceBasis() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useApproveInvoiceBasis: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Finalize invoice basis to sales document (stub).
 */
export function useFinalizeInvoiceBasis() {
  const fn = useCallback(
    async (
      _data: FinalizeInvoiceBasisDTO
    ): Promise<{ salesDocumentId: string }> => {
      throw new Error(
        "useFinalizeInvoiceBasis: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Delete invoice basis (stub).
 */
export function useDeleteInvoiceBasis() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useDeleteInvoiceBasis: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

// =============================================================================
// Sales Document Hooks
// =============================================================================

/**
 * Get paginated sales documents (stub).
 */
export function useSalesDocuments(
  _params?: EconomyQueryParams
): { data: { data: SalesDocument[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<SalesDocument>([]), isLoading: false, error: null };
}

/**
 * Get single sales document by ID (stub).
 */
export function useSalesDocument(
  _id: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: SalesDocument } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Send sales document to customer (stub).
 */
export function useSendSalesDocument() {
  const fn = useCallback(
    async (_data: SendSalesDocumentDTO): Promise<{ success: boolean }> => {
      throw new Error(
        "useSendSalesDocument: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Mark sales document as paid (stub).
 */
export function useMarkAsPaid() {
  const fn = useCallback(
    async (_data: MarkAsPaidDTO): Promise<{ success: boolean }> => {
      throw new Error(
        "useMarkAsPaid: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Download invoice PDF (stub).
 */
export function useDownloadInvoicePdf() {
  const fn = useCallback(
    async (_id: string): Promise<Blob> => {
      throw new Error(
        "useDownloadInvoicePdf: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Cancel sales document (stub).
 */
export function useCancelSalesDocument() {
  const fn = useCallback(
    async (_input: {
      id: string;
      reason?: string;
    }): Promise<{ success: boolean }> => {
      throw new Error(
        "useCancelSalesDocument: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

// =============================================================================
// Credit Note Hooks
// =============================================================================

/**
 * Get paginated credit notes (stub).
 */
export function useCreditNotes(
  _params?: EconomyQueryParams
): { data: { data: CreditNote[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<CreditNote>([]), isLoading: false, error: null };
}

/**
 * Get single credit note by ID (stub).
 */
export function useCreditNote(
  _id: string | undefined,
  _options?: { enabled?: boolean }
): { data: { data: CreditNote } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}

/**
 * Create credit note (stub).
 */
export function useCreateCreditNote() {
  const fn = useCallback(
    async (_data: CreateCreditNoteDTO): Promise<{ id: string }> => {
      throw new Error(
        "useCreateCreditNote: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Approve credit note (stub).
 */
export function useApproveCreditNote() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useApproveCreditNote: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Process credit note (stub).
 */
export function useProcessCreditNote() {
  const fn = useCallback(
    async (_id: string): Promise<{ success: boolean }> => {
      throw new Error(
        "useProcessCreditNote: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Download credit note PDF (stub).
 */
export function useDownloadCreditNotePdf() {
  const fn = useCallback(
    async (_id: string): Promise<Blob> => {
      throw new Error(
        "useDownloadCreditNotePdf: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

// =============================================================================
// Visma Integration Hooks
// =============================================================================

/**
 * Sync sales documents to Visma (stub).
 */
export function useSyncToVisma() {
  const fn = useCallback(
    async (
      _data: SyncToVismaDTO
    ): Promise<{ success: boolean; syncedCount: number }> => {
      throw new Error(
        "useSyncToVisma: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

/**
 * Check Visma sync status for a specific sales document (stub).
 */
export function useVismaInvoiceStatus(
  _salesDocumentId: string | undefined,
  _options?: { enabled?: boolean }
): {
  data: { data: VismaInvoiceStatus } | null;
  isLoading: boolean;
  error: Error | null;
} {
  return { data: null, isLoading: false, error: null };
}

// =============================================================================
// Export Hooks
// =============================================================================

/**
 * Export economy data (stub).
 */
export function useExportEconomy() {
  const fn = useCallback(
    async (_params: EconomyExportParams): Promise<Blob> => {
      throw new Error(
        "useExportEconomy: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}

// =============================================================================
// Statistics Hooks
// =============================================================================

/**
 * Get economy statistics (stub).
 */
export function useEconomyStatistics(
  _params?: { startDate?: string; endDate?: string }
): { data: { data: EconomyStatistics } | null; isLoading: boolean; error: Error | null } {
  return { data: null, isLoading: false, error: null };
}
