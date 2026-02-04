# Xaheen API Contract

> **Version:** 1.0.0  
> **Base URL:** `https://<your-deployment>.convex.cloud/api`

This document defines the API contract between the Xaheen SDK and Convex Functions.

---

## Authentication

All requests require a valid Convex auth token:

```
Authorization: Bearer <auth-token>
```

The auth token must contain:
- `sub`: User ID
- `tenant_id`: Current tenant context

---

## Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | For POST/PUT | `application/json` |
| `Idempotency-Key` | For mutations | UUID for idempotent operations |
| `X-Request-ID` | No | Client request correlation ID |

---

## Error Response Types

All errors follow RFC7807 format. The SDK maps these to typed `XalaError` instances.

### TypeScript Types

```typescript
interface XalaError {
  type: ErrorType;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  errors?: ValidationError[];
}

type ErrorType =
  | 'urn:xala:error:bad_request'
  | 'urn:xala:error:unauthorized'
  | 'urn:xala:error:forbidden'
  | 'urn:xala:error:not_found'
  | 'urn:xala:error:conflict'
  | 'urn:xala:error:validation'
  | 'urn:xala:error:rate_limited'
  | 'urn:xala:error:internal';

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
```

---

## RBAC Endpoints

### List Roles

```
GET /rbac-list-roles
```

**Response 200:**
```typescript
interface ListRolesResponse {
  data: Role[];
  meta: {
    total: number;
  };
}

interface Role {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_system: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
```

---

### Create Role

```
POST /rbac-create-role
Idempotency-Key: <uuid>
```

**Request:**
```typescript
interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}
```

**Response 201:**
```typescript
interface CreateRoleResponse {
  data: Role;
}
```

**Errors:**
- `409 Conflict`: Role with name already exists
- `422 Validation`: Invalid request body

---

### Bind User to Role

```
POST /rbac-bind-user-role
Idempotency-Key: <uuid>
```

**Request:**
```typescript
interface BindUserRoleRequest {
  user_id: string;
  role_id: string;
}
```

**Response 201:**
```typescript
interface BindUserRoleResponse {
  data: {
    id: string;
    user_id: string;
    role_id: string;
    tenant_id: string;
    created_at: string;
  };
}
```

**Errors:**
- `404 Not Found`: User or role not found
- `409 Conflict`: Binding already exists

---

### Assign Permission to Role

```
POST /rbac-assign-permission
Idempotency-Key: <uuid>
```

**Request:**
```typescript
interface AssignPermissionRequest {
  role_id: string;
  permission_code: string;
}
```

**Response 201:**
```typescript
interface AssignPermissionResponse {
  data: {
    role_id: string;
    permission_id: string;
    created_at: string;
  };
}
```

---

## Feature Flags Endpoints

### Get Flag

```
GET /flags-get?key=<flag_key>
```

**Response 200:**
```typescript
interface GetFlagResponse {
  data: {
    key: string;
    value: unknown;
    enabled: boolean;
  } | null;
}
```

---

### Set Flag

```
POST /flags-set
Idempotency-Key: <uuid>
```

**Request:**
```typescript
interface SetFlagRequest {
  key: string;
  value: unknown;
  enabled?: boolean;
}
```

**Response 200:**
```typescript
interface SetFlagResponse {
  data: {
    key: string;
    value: unknown;
    enabled: boolean;
    updated_at: string;
  };
}
```

---

## Events Endpoints

### List Outbox Events

```
GET /events-list-outbox?topicPrefix=<prefix>&limit=<n>&after=<cursor>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `topicPrefix` | string | none | Filter by topic prefix (e.g., `rbac.`) |
| `limit` | number | 50 | Max events to return |
| `after` | string | none | Cursor for pagination |

**Response 200:**
```typescript
interface ListOutboxResponse {
  data: OutboxEvent[];
  meta: {
    has_more: boolean;
    next_cursor?: string;
  };
}

interface OutboxEvent {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  created_at: string;
  processed_at?: string;
}
```

---

## Auth Gateway Endpoints

### Start Auth Flow

```
POST /auth-start
```

**Request:**
```typescript
interface AuthStartRequest {
  provider: 'microsoft' | 'google' | 'bankid' | 'feide' | 'vipps' | 'magic_link';
  redirect_url: string;
  email?: string; // Required for magic_link
}
```

**Response 200:**
```typescript
interface AuthStartResponse {
  data: {
    authorization_url: string;
    state: string;
  };
}
```

---

### Auth Callback

```
GET /auth-callback?code=<code>&state=<state>
```

Handled by Convex HTTP action. Redirects to client with session tokens.

---

### Link Identity

```
POST /auth-link
Authorization: Bearer <jwt>
```

**Request:**
```typescript
interface AuthLinkRequest {
  provider: string;
  authorization_code: string;
  code_verifier: string;
}
```

**Response 200:**
```typescript
interface AuthLinkResponse {
  data: {
    identity_id: string;
    provider: string;
    linked_at: string;
  };
}
```

---

### Get Claims

```
GET /auth-claims
Authorization: Bearer <jwt>
```

**Response 200:**
```typescript
interface AuthClaimsResponse {
  data: {
    user_id: string;
    tenant_id: string;
    roles: string[];
    permissions: string[];
    entitlements: string[];
  };
}
```

---

## Billing Webhook Endpoints

### Stripe Webhook

```
POST /billing-webhook-stripe
Stripe-Signature: <signature>
```

Body: Raw Stripe event payload

**Response 200:** `{ "received": true }`

---

### Vipps Webhook

```
POST /billing-webhook-vipps
```

Body: Vipps webhook payload with signature

**Response 200:** `{ "received": true }`

---

## SDK Usage Examples

```typescript
import { XalaClient, XalaError } from '@xaheen/sdk';

const client = new XalaClient({
  convexUrl: 'https://<your-deployment>.convex.cloud',
});

// Query roles
const { data: roles } = await client.queries.rbac.listRoles();

// Create role with idempotency
try {
  const { data: role } = await client.mutations.rbac.createRole(
    { name: 'Manager', permissions: ['reports:read'] },
    { idempotencyKey: crypto.randomUUID() }
  );
} catch (error) {
  if (error instanceof XalaError && error.status === 409) {
    console.log('Role already exists');
  }
}

// Get feature flag
const { data: flag } = await client.queries.featureFlags.get('new_dashboard');
if (flag?.enabled) {
  // Show new dashboard
}
```
