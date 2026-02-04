# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xaheen is a multi-tenant Backend-as-a-Service platform built on **Convex** (serverless database + functions). It provides tenant isolation, RBAC, booking/resource management, billing, and compliance — consumed by 6 React apps through a shared SDK.

The 3 main user-facing apps (`web`, `backoffice`, `minside`) were migrated from the digdir monorepo. They use the `@xaheen/ds` design system and the `@xaheen/sdk` adapter layer which re-exports ~240 hooks backed by Convex instead of the original React Query + Fastify REST backend.

## Commands

```bash
# Development
pnpm install                          # Install all dependencies (pnpm required, not npm)
npx convex dev                        # Start Convex dev server (watches schema + functions)
pnpm dev                              # Alias for npx convex dev

# Build
pnpm sdk:build                        # Build SDK package (tsup)

# Testing
pnpm sdk:test                         # SDK unit tests (vitest, jsdom)
pnpm test:convex                      # Convex function tests (vitest, node env, from tests/)
pnpm test:convex:watch                # Watch mode
pnpm test:convex:e2e                  # E2E backend tests via custom runner
pnpm test:convex:e2e:all              # All E2E suites
pnpm test:e2e                         # Playwright browser E2E tests
pnpm test:all                         # Full suite: sdk + convex + e2e

# Run a single test file
cd tests && npx vitest run convex/path/to/file.test.ts
npx vitest run --filter "test name"   # SDK tests from packages/sdk/

# Typecheck & Lint
pnpm typecheck                        # Typecheck all workspaces
pnpm lint                             # Lint all workspaces

# Deploy
npx convex deploy                     # Deploy schema + functions to production
npx convex deploy --dry-run           # Validate without deploying
```

## Architecture

### Three-Plane Design

```
Experience Plane (apps/)          — 6 thin React apps, compose providers, no business logic
  ├── web (port 5173)             — Public booking platform (digdir)
  ├── backoffice (port 5175)      — Admin management + case handling (digdir)
  ├── minside (port 5174)         — User dashboard / "My Pages" (digdir)
  ├── saas-admin (port 6005)      — SaaS platform admin
  ├── dashboard                   — Analytics
  └── docs                        — VitePress documentation

SDK Layer (packages/sdk/)         — Source-only, type-safe Convex hooks (no build step)
  ├── convex-provider.tsx         — React context provider (XalaConvexProvider)
  ├── convex-api.ts               — Re-exports convex/_generated/api
  ├── hooks/                      — ~240 hooks: auth, resources, bookings, listings, blocks, orgs, etc.
  ├── transforms/                 — Field mapping: Convex Resource ↔ digdir Listing, epoch ↔ ISO
  └── compat/                     — No-op shims: initializeClient, queryKeys, realtime

Control Plane (convex/)           — All backend logic lives here
  ├── schema.ts                   — 40 tables, single source of truth
  ├── domain/                     — Resources, bookings, blocks, seasons, reviews, search, etc.
  ├── auth/                       — Password, demo token, claims, OAuth callback
  ├── rbac/                       — Roles, permissions, user-role bindings
  ├── billing/                    — Stripe/Vipps webhooks
  ├── compliance/                 — Consent, DSAR, governance policies
  ├── monitoring/                 — Dashboard KPIs, metrics
  ├── notifications/              — In-app notification feed
  └── [tenants|users|orgs|...]    — Platform management functions
```

### Shared Packages

- **`@xaheen/app-shell`** — Provider composition (`XalaProviders`), auth context (`AuthProvider`/`TenantProvider`), route guards (`RequireAuth`/`RequirePermission`/`RequireModule`), shared layout
- **`@xaheen/i18n`** — i18next with `nb`, `en`, `ar` locales (includes digdir translation keys)
- **`@xaheen/shared`** — Types, constants, navigation config; multi-entry (`./types`, `./constants`, `./navigation`)
- **`@xaheen/ds`** — Designsystemet-based design system (imported by digdir apps)
- **`@xaheen/ds-themes`** — Theme tokens for the design system
- **`@xaheen/ds-registry`** — Component registry

### Using @xaheen/shared Types

The `@xaheen/shared` package is the **single source of truth** for all domain types and interfaces. Import types from this package instead of defining them locally.

**Type files** (`packages/shared/src/types/`):
- `common.ts` — Base types: `Id`, `Timestamp`, `Pricing`, `Location`, `Image`, `App`, `Locale`
- `auth.ts` — `User`, `Session`, `Role`, `Permission`, `AuthState`
- `tenant.ts` — `Tenant`, `Organization`, `TenantUser`
- `listing.ts` — `Listing`, `ListingType`, `ListingStatus`, `ListingInput`, `ListingQuery`
- `booking.ts` — `Booking`, `BookingStatus`, `CalendarEvent`, `TimeSlot`, `Block`
- `category.ts` — `Category`, `CategoryWithSubcategories`, `CategoryOption`
- `amenity.ts` — `Amenity`, `AmenityGroup`, `AmenityOption`
- `filter.ts` — `ListingFilterState`, `FilterOption`, `SortOption`, `PriceRange`, `DateRange`
- `api.ts` — `PaginatedResponse`, `ProblemDetails`, `ApiError`, `QueryOptions`

**Usage examples**:
```typescript
// Import specific types
import type { Listing, Category, Amenity } from '@xaheen/shared/types';

// Import from main entry (re-exports all)
import type { ListingFilterState, PaginatedResponse } from '@xaheen/shared';

// Import constants
import { APPS, SUPPORTED_LOCALES } from '@xaheen/shared/constants';
```

**Adding new types**:
1. Add to the appropriate file in `packages/shared/src/types/`
2. Export from `packages/shared/src/types/index.ts`
3. Run `pnpm -F @xaheen/shared build` to rebuild

### Thin App Pattern

Every app follows the same entry structure — compose providers, render routes:
```
XalaConvexProvider (sdk) → [XalaProviders (app-shell)] → BrowserRouter → App
```

- **Digdir apps** (`web`, `backoffice`, `minside`): Use `@xaheen/ds` for the design system, `@xaheen/sdk` for data hooks
- **Platform apps** (`saas-admin`, `dashboard`): Use `@xala-technologies/platform-ui` and `@xaheen/app-shell`

Business logic lives in Convex functions and SDK hooks, not in apps.

### Convex Function Pattern

All tenant-scoped functions follow this structure:
```typescript
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.id("tenants"), /* ... */ },
  handler: async (ctx, args) => {
    // 1. Auth check: ctx.auth.getUserIdentity()
    // 2. Tenant membership validation
    // 3. Permission/entitlement check
    // 4. Query with .withIndex("by_tenant", q => q.eq("tenantId", args.tenantId))
  },
});
```

### Database Schema (convex/schema.ts)

40 tables across 5 domains. Every tenant-scoped table has `tenantId: v.id("tenants")` and a `by_tenant` index. Key domains:
- **Platform**: tenants, organizations, users, roles, userRoles, tenantUsers
- **Domain**: resources, bookings, blocks, seasons, categories, amenities, pricing, favorites, allocations, bookingConflicts, seasonalLeases, custodyGrants, reviews
- **Notifications**: notifications, notificationPreferences
- **Compliance**: auditLog (append-only), consent records
- **Monitoring**: bookingMetrics, availabilityMetrics, scheduledReports
- **User**: savedFilters, discountCodes

Status types are defined in `convex/types.ts` as string literal unions.

## Key Conventions

- **Errors**: RFC7807 format (`type`, `title`, `status`, `detail`, `instance`)
- **Tenant isolation**: Enforced at function level, not database level. Every query/mutation validates tenant membership.
- **Audit**: All mutations create audit events in `auditLog` (append-only)
- **Idempotency**: Mutations support idempotency keys
- **i18n**: Default locale is `nb` (Norwegian Bokmål), RTL support for `ar`
- **Module system**: Feature modules are gated — functions check `hasModuleEnabled()` before executing

## Test Structure

- **SDK tests** (`packages/sdk/src/__tests__/`): Vitest + jsdom + React Testing Library
- **Convex function tests** (`tests/convex/`): Vitest + node env, run with `convex-test` utilities
- **E2E backend tests** (`tests/convex/e2e/`): Custom runner via `tsx tests/convex/e2e/runner.ts`
- **Browser E2E** (`tests/e2e/`): Playwright, Desktop Chrome, sequential (1 worker)

Test config: `tests/vitest.config.ts` for Convex tests, `packages/sdk/vitest.config.ts` for SDK tests, `playwright.config.ts` at root for browser E2E.

## Relevant Docs

- `docs/CONVENTIONS.md` — Tenant boundaries, idempotency, RFC7807 errors, outbox events, audit requirements
- `docs/SECURITY_INVARIANTS.md` — Non-negotiable security rules (tenant isolation, auth, authorization, audit)
- `docs/DOMAIN_BUNDLE_SPEC.md` — Module contract: schema + functions + SDK hooks + tests
- `docs/MIGRATION_POLICY.md` — Schema change procedures (forward-only, additive preferred)
- `docs/DEFINITION_OF_DONE.md` — Feature completion gates
