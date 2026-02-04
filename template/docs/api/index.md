# API Reference

Xaheen exposes functionality through Convex functions (queries, mutations, and actions).

## Base URL

```
https://<deployment>.convex.cloud
```

## Authentication

Convex handles authentication via the ConvexProvider. For HTTP endpoints, use:

```http
Authorization: Bearer <convex-auth-token>
```

## Tenant Context

All functions receive tenant context via function arguments:

```typescript
// Queries and mutations receive tenantId as an argument
const resources = useQuery(api.domain.resources.list, { tenantId });
```

## Error Handling

Convex functions throw typed errors that the SDK maps to `XalaError`:

```typescript
interface XalaError {
  type: ErrorType;
  message: string;
  code?: string;
}

type ErrorType =
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict';
```

## Function Categories

| Category | Functions | Type |
|----------|-----------|------|
| **Domain** | | |
| Resources | `list`, `get`, `getBySlug`, `create`, `update`, `remove`, `publish`, `unpublish` | Query/Mutation |
| Bookings | `list`, `get`, `create`, `update`, `approve`, `reject`, `cancel`, `calendar` | Query/Mutation |
| Blocks | `list`, `get`, `create`, `update`, `remove`, `checkAvailability`, `getAvailableSlots` | Query/Mutation |
| Categories | `list`, `get`, `getByKey`, `create`, `update`, `remove`, `getTree` | Query/Mutation |
| Amenities | `listGroups`, `list`, `get`, `create`, `update`, `remove`, `addToResource`, `removeFromResource` | Query/Mutation |
| Addons | `list`, `get`, `create`, `update`, `remove`, `listForResource`, `addToResource` | Query/Mutation |
| Pricing | `listGroups`, `createGroup`, `listForResource`, `create`, `update`, `calculatePrice` | Query/Mutation |
| Favorites | `list`, `isFavorite`, `add`, `remove`, `toggle` | Query/Mutation |
| Seasons | `list`, `get`, `create`, `update`, `publish`, `close`, `listApplications`, `submitApplication` | Query/Mutation |
| **Platform** | | |
| Tenants | `onboard`, `getSettings`, `updateSettings`, `getBySlug`, `getByDomain` | Query/Mutation |
| Organizations | `list`, `get`, `getBySlug`, `create`, `update`, `remove`, `getTree` | Query/Mutation |
| Users | `list`, `getByEmail`, `me`, `create`, `update`, `invite`, `suspend`, `remove` | Query/Mutation |
| RBAC | `listRoles`, `createRole`, `assignPermission`, `bindUserRole`, `getUserPermissions` | Query/Mutation |
| Modules | `catalog`, `list`, `install`, `uninstall`, `enable`, `disable` | Query/Mutation |
| **Compliance** | | |
| Consent | `getConsent`, `updateConsent` | Query/Mutation |
| DSAR | `submitDSAR` | Mutation |
| Policies | `getPolicy`, `publishPolicy`, `policyHistory`, `rollbackPolicy` | Query/Mutation |
| **Integrations** | | |
| Config | `list`, `getConfig`, `configure`, `disable`, `remove` | Query/Mutation |
| Webhooks | `registerWebhook`, `listWebhooks`, `deleteWebhook` | Query/Mutation |
| Sync | `testConnection`, `sync` | Action |
| **Billing** | | |
| Webhooks | `stripeWebhook`, `vippsWebhook` | Action |
| **Monitoring** | | |
| Metrics | `getBookingMetrics`, `getAvailabilityMetrics`, `calculateBookingMetrics` | Query/Mutation |
| Reports | `listReportSchedules`, `createReportSchedule`, `getDashboardSummary` | Query/Mutation |

## Usage with React

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Real-time query (auto-updates)
const resources = useQuery(api.domain.resources.list, { 
  tenantId,
  status: 'published',
  limit: 20 
});

// Mutation with error handling
const createBooking = useMutation(api.domain.bookings.create);

try {
  await createBooking({ 
    tenantId, 
    resourceId, 
    userId,
    startTime, 
    endTime 
  });
} catch (error) {
  console.error('Booking failed:', error.message);
}
```

## Pagination

List functions support limit-based pagination:

```typescript
const resources = useQuery(api.domain.resources.list, { 
  tenantId,
  limit: 20,
  // Use cursor-based pagination for large datasets
});
