# Database Schema

Xaheen uses Convex as its database and serverless backend. The schema is defined in `convex/schema.ts` using Convex's type-safe schema definition.

## Schema Overview

```
convex/schema.ts — 35 tables across 4 domains
├── Platform (5 tables)     — tenants, organizations, users, roles, userRoles
├── Domain (20+ tables)     — resources, bookings, seasons, blocks, amenities, pricing, ...
├── Auth (3 tables)         — authDemoTokens, tenantUsers, (identities via Convex Auth)
├── Billing (3 tables)      — subscriptions, entitlements, invoices
└── Compliance (2 tables)   — audit events, consent records
```

## Platform Tables

| Table | Description |
|-------|-------------|
| `tenants` | Customer organizations with settings, feature flags, seat limits |
| `organizations` | Sub-groups within tenants (departments, associations) |
| `users` | User accounts with role, status, and tenant membership |
| `roles` | Tenant-scoped role definitions with permission arrays |
| `userRoles` | Role assignments linking users to roles |

## Domain Tables

| Table | Description |
|-------|-------------|
| `resources` | Bookable objects (rooms, halls, equipment) |
| `bookings` | Reservations with status lifecycle |
| `blocks` | Time blocks and availability rules |
| `allocations` | Resource allocation tracking |
| `bookingConflicts` | Conflict detection records |
| `seasons` | Seasonal periods for pricing and availability |
| `seasonApplications` | Season allocation applications |
| `priorityRules` | Priority ordering for season allocation |
| `seasonalLeases` | Long-term seasonal lease agreements |
| `categories` | Resource categorization |
| `amenities` | Amenity definitions |
| `amenityGroups` | Grouped amenity collections |
| `resourceAmenities` | Amenity assignments to resources |
| `addons` | Optional add-ons for bookings |
| `resourceAddons` | Add-on assignments to resources |
| `bookingAddons` | Add-on selections on bookings |
| `pricingGroups` | Pricing group definitions |
| `resourcePricing` | Resource-specific pricing rules |
| `favorites` | User favorite resources |
| `custodyGrants` | Resource custody delegation |
| `custodySubgrants` | Sub-delegation of custody |

## Communication Tables

| Table | Description |
|-------|-------------|
| `conversations` | Messaging threads |
| `messages` | Individual messages in conversations |
| `rentalAgreements` | Rental agreement documents |

## Monitoring Tables

| Table | Description |
|-------|-------------|
| `bookingMetrics` | Booking statistics aggregates |
| `availabilityMetrics` | Resource availability tracking |
| `scheduledReports` | Generated report data |
| `reportSchedules` | Report generation schedules |
| `bookingAudit` | Booking-specific audit trail |

## Auth Tables

| Table | Description |
|-------|-------------|
| `authDemoTokens` | Demo authentication tokens for development |
| `tenantUsers` | User-to-tenant membership links |

## Tenant Isolation

Every tenant-scoped table includes a `tenantId` field referencing the `tenants` table. Access control is enforced at the function level — all queries and mutations validate that the requesting user has access to the specified tenant before returning or modifying data.

```typescript
// All domain queries require tenantId
const resources = useQuery(api.domain.resources.list, {
  tenantId,
  status: 'published',
});
```

## Indexes

Tables use Convex indexes for efficient queries:

```typescript
// Example from schema.ts
resources: defineTable({ ... })
  .index("by_tenant", ["tenantId"])
  .index("by_slug", ["tenantId", "slug"])
  .index("by_category", ["tenantId", "categoryKey"])
  .index("by_status", ["tenantId", "status"]),
```

## Schema Changes

Convex handles schema evolution automatically:

1. Edit `convex/schema.ts`
2. The dev server validates and applies changes in real-time
3. For production, `npx convex deploy` pushes schema and function changes together

See [Migration Policy](/MIGRATION_POLICY) for deployment procedures.
