# Security Invariants

> These are **non-negotiable** rules. Any violation is a blocking issue.

---

## 1. Tenant Isolation

### 1.1 Function-Level Access Control is Mandatory
```
INVARIANT: No tenant-scoped function operates without access control.
```

Every Convex function accessing tenant-scoped data **must**:
- Validate authentication via `ctx.auth.getUserIdentity()`
- Verify the user belongs to the requested tenant
- Check required permissions before data access

**Verification:**
```typescript
// Every query/mutation must include this pattern
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthorized");
// Validate tenant access before proceeding
```

### 1.2 Tenant Context is Auth-Based
```
INVARIANT: Tenant context is derived from authenticated identity.
```

- Tenant access is validated against the `tenantUsers` table
- The authenticated user must have an active membership for the requested tenant
- No tenant switching mid-request

**Forbidden:**
```typescript
// ❌ NEVER trust unvalidated tenant context
const tenantId = args.tenantId; // without validation
```

**Required:**
```typescript
// ✅ Always validate tenant membership
const identity = await ctx.auth.getUserIdentity();
const membership = await ctx.db
  .query("tenantUsers")
  .withIndex("by_user_tenant", (q) => q.eq("userId", userId).eq("tenantId", args.tenantId))
  .first();
if (!membership) throw new Error("Forbidden");
```

### 1.3 Cross-Tenant Queries are Impossible
```
INVARIANT: No authenticated user can read/write another tenant's data.
```

Every Convex function must filter by the validated tenant context. Cross-tenant access is prevented at the function level.

**Test Pattern:**
```typescript
// Contract test: user from tenant_a cannot access tenant_b data
const result = await ctx.runQuery(api.domain.resources.list, {
  tenantId: tenantB_id, // User belongs to tenant_a
});
// Should throw "Forbidden" or return empty
```

---

## 2. Authentication

### 2.1 No Anonymous Mutations
```
INVARIANT: All mutations require authenticated user.
```

- Public queries may be allowed for read-only data (e.g., published resources)
- All mutations require `ctx.auth.getUserIdentity()` to return a valid identity

### 2.2 Claim Minting is Centralized
```
INVARIANT: Only auth-claims Convex function mints custom claims.
```

No other function may:
- Modify auth identity metadata
- Create auth sessions
- Bypass authentication checks

### 2.3 Provider Identity is Unique
```
INVARIANT: One external identity can link to at most one user.
```

Enforced by uniqueness checks in the auth linking functions.

**Conflict Handling:**
- If identity already linked → RFC7807 `409 Conflict`
- User must unlink from other account first

---

## 3. Authorization

### 3.1 Permission Checks are Mandatory
```
INVARIANT: Every protected endpoint checks permissions before execution.
```

Pattern:
```typescript
const permError = await requirePermission(ctx, 'resource:action');
if (permError) return permError;
```

### 3.2 Entitlement Checks for Module Features
```
INVARIANT: Module-owned features check entitlements.
```

Pattern:
```typescript
const entitled = await hasEntitlement(ctx, 'module:analytics');
if (!entitled) return forbidden('Module not enabled');
```

### 3.3 No Privilege Escalation
```
INVARIANT: Users cannot grant permissions they don't have.
```

- Role assignment requires `rbac:roles:assign` permission
- Permission assignment requires `rbac:permissions:assign`
- Cannot assign permissions not in own set (or super_admin)

---

## 4. Audit Trail

### 4.1 All Mutations Audited
```
INVARIANT: Every mutation creates an audit event.
```

Audit events contain:
- `tenant_id`, `user_id`, `action`
- `resource_type`, `resource_id`
- `before_state` (for updates/deletes)
- `created_at` (immutable)

### 4.2 Audit is Append-Only
```
INVARIANT: Audit events cannot be modified or deleted by application code.
```

- No UPDATE/DELETE grants on `audit_events`
- Retention policy handles lifecycle

### 4.3 Legal Holds Block Deletion
```
INVARIANT: Data under legal hold cannot be deleted.
```

Pattern:
```typescript
const legalHold = await isUnderLegalHold(ctx, tenantId, userId);
if (legalHold) throw new Error("Data under legal hold");
```

---

## 5. Data Protection

### 5.1 Secrets are Encrypted
```
INVARIANT: Credentials, tokens, and PII are encrypted at rest.
```

- AES-256-GCM encryption via `secrets.ts`
- Encryption key from environment (not in code)
- Key rotation supported

### 5.2 No Secrets in Logs
```
INVARIANT: Logs never contain credentials, tokens, or PII.
```

Sanitize before logging:
```typescript
logger.info('OAuth complete', { 
  provider, 
  // ❌ token: accessToken 
});
```

### 5.3 Service Role is Internal Only
```
INVARIANT: CONVEX_DEPLOY_KEY never used in client-facing code.
```

- Service client only in:
  - Scheduled jobs (outbox-worker)
  - System operations (tenant-onboard)
  - Webhook processing (billing-*)

---

## 6. Input Validation

### 6.1 All Input Validated
```
INVARIANT: Every endpoint validates input before processing.
```

- Required fields checked
- Types validated
- Enums constrained

### 6.2 Query Safety
```
INVARIANT: All data access uses Convex's type-safe query builder.
```

- Use `ctx.db.query()` with typed indexes
- Never construct dynamic queries from user input

### 6.3 XSS Prevention
```
INVARIANT: User-generated content is sanitized before storage.
```

- HTML entities escaped
- Script tags stripped

---

## 7. Rate Limiting

### 7.1 Auth Endpoints Protected
```
INVARIANT: Auth endpoints have aggressive rate limits.
```

| Endpoint | Limit |
|----------|-------|
| auth-start | 10/min/IP |
| auth-callback | 10/min/IP |
| auth-link | 5/min/user |

### 7.2 Billing Endpoints Protected
```
INVARIANT: Billing webhooks are rate limited and signature-verified.
```

- Stripe: HMAC-SHA256 signature
- Vipps: RSA signature

---

## 8. Error Handling

### 8.1 RFC7807 for All Errors
```
INVARIANT: All error responses follow RFC7807 Problem Details.
```

Schema:
```json
{
  "type": "https://xala.no/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Missing permission: rbac:roles:write",
  "instance": "/functions/v1/rbac-create-role",
  "traceId": "abc123"
}
```

### 8.2 No Stack Traces in Production
```
INVARIANT: Production errors never expose internal stack traces.
```

- Log full error internally
- Return sanitized message to client

---

## Verification Checklist

Before any release, verify:

- [ ] All tenant-scoped functions validate tenant access
- [ ] All mutations generate audit events
- [ ] All Convex functions use `requireAuth()`
- [ ] All secrets use `secrets.ts` encryption
- [ ] All errors return RFC7807
- [ ] Service role usage is documented and justified
- [ ] Rate limits are configured for auth/billing
- [ ] Legal hold check exists in delete paths
