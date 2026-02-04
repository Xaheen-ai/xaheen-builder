/**
 * Xaheen SDK - Convex API Types
 *
 * Re-exports the generated Convex API for type-safe function references.
 * This allows SDK hooks to use proper Convex React hooks with typed functions.
 *
 * NOTE: This is a source-only package. The relative path resolves at each
 * app's compile time via Vite.
 */

import { api as generatedApi } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const api = generatedApi;

// Re-export Id types for convenience
export type { Id };

// Tenant ID type alias
export type TenantId = Id<"tenants">;
export type ResourceId = Id<"resources">;
export type BookingId = Id<"bookings">;
export type UserId = Id<"users">;
export type OrganizationId = Id<"organizations">;
