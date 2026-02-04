/**
 * Xaheen SDK - Help Hooks (Tier 3)
 *
 * React Query-shaped hooks for help, FAQ, guides, training, and support.
 * Stubs until Convex backend functions are implemented.
 */

import { useState, useCallback } from "react";
import { toPaginatedResponse } from "../transforms/common";

// =============================================================================
// Types
// =============================================================================

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  locale?: string;
}

export interface Guide {
  id: string;
  title: string;
  slug: string;
  role: string;
  content: string;
  order: number;
  locale?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  steps: TrainingStep[];
  completedAt?: string;
}

export interface TrainingStep {
  id: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
}

export interface Tooltip {
  key: string;
  text: string;
  locale?: string;
}

export interface ContactFormDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
  tenantId?: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const helpKeys = {
  all: ["help"] as const,
  faq: (category?: string) => [...helpKeys.all, "faq", category] as const,
  guides: (role: string) => [...helpKeys.all, "guides", role] as const,
  training: () => [...helpKeys.all, "training"] as const,
  tooltips: () => [...helpKeys.all, "tooltips"] as const,
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
// Query Hooks
// =============================================================================

/**
 * Get FAQ entries, optionally filtered by category (stub).
 */
export function useFaq(
  _category?: string
): { data: { data: FaqEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<FaqEntry>([]), isLoading: false, error: null };
}

/**
 * Get user guides by role (stub).
 * @param _role User role (user, admin, case_handler). Defaults to "user".
 */
export function useGuides(
  _role?: string
): { data: { data: Guide[]; meta: { total: number; page: number; limit: number; totalPages: number } }; isLoading: boolean; error: Error | null } {
  return { data: toPaginatedResponse<Guide>([]), isLoading: false, error: null };
}

/**
 * Get training plan and materials (stub).
 */
export function useTraining(): {
  data: { data: TrainingModule[]; meta: { total: number; page: number; limit: number; totalPages: number } };
  isLoading: boolean;
  error: Error | null;
} {
  return { data: toPaginatedResponse<TrainingModule>([]), isLoading: false, error: null };
}

/**
 * Get UI tooltips (stub).
 * Long staleTime since tooltips rarely change.
 */
export function useTooltips(): {
  data: { data: Tooltip[]; meta: { total: number; page: number; limit: number; totalPages: number } };
  isLoading: boolean;
  error: Error | null;
} {
  return { data: toPaginatedResponse<Tooltip>([]), isLoading: false, error: null };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Submit support contact form (stub).
 */
export function useSubmitContact() {
  const fn = useCallback(
    async (_data: ContactFormDTO): Promise<{ success: boolean; ticketId?: string }> => {
      throw new Error(
        "useSubmitContact: not yet implemented in Convex backend"
      );
    },
    []
  );
  return useMutationAdapter(fn);
}
