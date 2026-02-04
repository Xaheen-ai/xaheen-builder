# Xaheen Platform Conventions

> **Version:** 1.0.0  
> **Last Updated:** 2026-02-02

This document defines the foundational conventions for the Xaheen platform. All code, migrations, and API implementations MUST adhere to these standards.

---

## 1. Tenant Boundary Rules

### 1.1 Database Schema

All tenant-scoped tables MUST:

1. Be defined in `convex/schema.ts`
2. Include a `tenantId` field referencing the `tenants` table
3. Have a `by_tenant` index for efficient tenant-scoped queries

```typescript
// Required pattern for all tenant tables in convex/schema.ts
exampleTable: defineTable({
  tenantId: v.id("tenants"),
  // ... other fields
})
  .index("by_tenant", ["tenantId"]),
```

### 1.2 Function-Level Access Control

All Convex functions MUST validate tenant access:

```typescript
// Required pattern in every query/mutation
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthorized");
const tenantId = args.tenantId;
// Verify user belongs to tenant before proceeding
```

### 1.3 API Requests

- All authenticated requests MUST include tenant context via function arguments
- Tenant access is validated at the function level in every query and mutation
- Cross-tenant access is NEVER permitted at the application layer

---

## 2. Idempotency Rule

All mutations (POST, PUT, PATCH, DELETE) MUST support idempotent operations.

### 2.1 Idempotency Key Header

```
Idempotency-Key: <client-generated-uuid>
```

### 2.2 Server Behavior

| Scenario | Response |
|----------|----------|
| First request with key | Execute operation, cache response for 24h |
| Duplicate request (same key) | Return cached response, DO NOT re-execute |
| Key format invalid | Return 400 with RFC7807 error |

### 2.3 Implementation Requirements

1. Store idempotency keys in an idempotency cache (Convex table or in-memory)
2. Key expiration: 24 hours
3. Cache includes: key, tenantId, response status, response body, createdAt

---

## 3. RFC7807 Error Response Format

All API errors MUST return `application/problem+json` content type with RFC7807 structure.

### 3.1 Required Fields

```json
{
  "type": "urn:xala:error:forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "User does not have required permission: rbac:manage",
  "instance": "urn:uuid:550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | URI reference identifying error type |
| `title` | string | Human-readable summary (matches HTTP status text) |
| `status` | integer | HTTP status code |
| `detail` | string | Specific explanation for this occurrence |
| `instance` | string | URI identifying this specific error instance |

### 3.2 Standard Error Types

| Type | Status | Use Case |
|------|--------|----------|
| `urn:xala:error:bad_request` | 400 | Malformed request body/params |
| `urn:xala:error:unauthorized` | 401 | Missing or invalid authentication |
| `urn:xala:error:forbidden` | 403 | Authenticated but lacks permission |
| `urn:xala:error:not_found` | 404 | Resource does not exist |
| `urn:xala:error:conflict` | 409 | Resource already exists or state conflict |
| `urn:xala:error:validation` | 422 | Request validation failed |
| `urn:xala:error:rate_limited` | 429 | Too many requests |
| `urn:xala:error:internal` | 500 | Unexpected server error |

### 3.3 Validation Errors Extension

For validation errors (422), include `errors` array:

```json
{
  "type": "urn:xala:error:validation",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Request validation failed",
  "instance": "urn:uuid:...",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "name", "message": "Name is required" }
  ]
}
```

---

## 4. Outbox Event Topic Naming

All outbox events follow a consistent topic naming convention.

### 4.1 Format

```
{domain}.{entity}.{action}
```

### 4.2 Examples

| Topic | Trigger |
|-------|---------|
| `rbac.role.created` | New role created |
| `rbac.role.updated` | Role modified |
| `rbac.user_role.assigned` | User bound to role |
| `billing.subscription.created` | New subscription started |
| `billing.subscription.updated` | Subscription changed |
| `billing.entitlements.changed` | Tenant entitlements recomputed |
| `auth.user.registered` | New user created |
| `auth.identity.linked` | Provider linked to user |
| `governance.policy.published` | Policy version activated |

### 4.3 Payload Structure

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "rbac.role.created",
  "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
  "payload": {
    "role_id": "...",
    "name": "CustomRole",
    "permissions": ["read:reports", "write:reports"]
  },
  "created_at": "2026-02-02T23:50:00Z"
}
```

---

## 5. API Endpoint Naming

### 5.1 REST Endpoints

- Use kebab-case for path segments
- Resource names are plural
- Nested resources for relationships

```
POST   /edge/rbac/roles
GET    /edge/rbac/roles
GET    /edge/rbac/roles/:id
POST   /edge/rbac/roles/:id/permissions
POST   /edge/auth/start
GET    /edge/auth/callback
POST   /edge/billing/webhooks/stripe
```

### 5.2 Convex Function Structure

Each Convex function resides in a module directory:

```
convex/
├── rbac/
│   ├── createRole.ts
│   └── bindUserRole.ts
├── _shared/
│   ├── context.ts
│   ├── problem.ts
│   └── idempotency.ts
└── schema.ts
```

---

## 6. Audit Trail Requirements

### 6.1 Audited Operations

All mutations to the following tables MUST generate audit events:

- `roles`
- `userRoles`
- `resources`
- `bookings`
- `tenants` (settings changes)
- Feature flag changes

### 6.2 Audit Event Structure

| Field | Description |
|-------|-------------|
| `tenant_id` | Tenant context |
| `user_id` | User who performed action |
| `action` | INSERT, UPDATE, DELETE |
| `resource_type` | Table name |
| `resource_id` | Row primary key |
| `old_data` | Previous state (UPDATE/DELETE) |
| `new_data` | New state (INSERT/UPDATE) |
| `metadata` | Additional context (IP, user agent) |

---

## 7. Security Requirements

### 7.1 Append-Only Tables

The following tables are APPEND-ONLY (no UPDATE or DELETE):

- `bookingAudit`

Convex functions for these tables MUST NOT include update or delete operations.

### 7.2 Webhook Signature Validation

All incoming webhooks MUST validate signatures:

- **Stripe**: Verify using `stripe-signature` header with HMAC-SHA256
- **Vipps**: Verify using configured webhook secret with timing-safe comparison

### 7.3 PKCE for OAuth

All OAuth flows MUST use PKCE (Proof Key for Code Exchange) with S256 method.

---

## 8. TypeScript Standards

### 8.1 SDK Error Handling

```typescript
// All SDK methods throw XalaError on non-2xx responses
try {
  await client.mutations.rbac.createRole({ name: 'Admin' });
} catch (error) {
  if (error instanceof XalaError) {
    console.error(error.type, error.detail);
  }
}
```

### 8.2 Idempotency Key Usage

```typescript
// Client-generated UUID for mutation idempotency
const idempotencyKey = crypto.randomUUID();
await client.mutations.rbac.createRole(
  { name: 'Admin' },
  { idempotencyKey }
);
```

---

## 9. Schema Evolution

Schema changes are managed through `convex/schema.ts`:

- All table definitions live in a single schema file
- The Convex dev server validates changes in real-time
- Production deployments push schema and functions atomically via `npx convex deploy`
- See [Migration Policy](/MIGRATION_POLICY) for deployment procedures

---

## References

- [RFC 7807 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc7807)
- [Convex Access Control](https://docs.convex.dev/auth)
- [PKCE RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)
