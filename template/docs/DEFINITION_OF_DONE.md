# Definition of Done

> A feature is not "complete" until it has been verified by automated checks.

---

## Phase Gate Criteria

Every phase must pass **all** of the following gates before being marked complete.

### Gate 1: Schema Integrity
- [ ] `npx convex dev` schema validation passes with no errors
- [ ] All tables have appropriate indexes for query patterns
- [ ] Schema changes are backward-compatible or have migration plan

### Gate 2: Security Enforcement
- [ ] Every tenant-scoped function validates tenant access
- [ ] Access control deny tests exist (cross-tenant, cross-user)
- [ ] No deploy key usage in client-facing paths
- [ ] Sensitive fields encrypted at rest

### Gate 3: API Contracts
- [ ] Convex function returns RFC7807 for all error cases
- [ ] Happy path test exists
- [ ] Auth denial test exists (401, 403)
- [ ] Idempotency test exists (for mutations)
- [ ] Rate limiting test exists (for protected endpoints)

### Gate 4: Observability
- [ ] Structured logs with `traceId`
- [ ] Metrics emitted for latency + errors
- [ ] Audit event created for mutations

### Gate 5: Documentation
- [ ] Function registered in `function_registry`
- [ ] OpenAPI spec updated
- [ ] SDK extension method exists

---

## Acceptance Criteria by Component

### Schema Changes
```
✓ Schema validates with npx convex dev
✓ Indexes for primary query patterns
✓ Tenant-scoped tables include tenantId field
✓ Access control enforced in all functions
```

### Convex Function
```
✓ Returns RFC7807 for errors
✓ Validates input with schema
✓ Checks auth (401 if missing, 403 if forbidden)
✓ Checks tenant context
✓ Checks permissions/entitlements
✓ Creates audit event (mutations)
✓ Emits outbox event (if applicable)
✓ Logs with traceId
✓ Respects rate limits
```

### SDK Method
```
✓ Typed arguments
✓ Typed return value
✓ XalaError on failure
✓ Idempotency support (mutations)
✓ JSDoc with permissions
```

---

## Test Categories

### 1. Unit Tests
Scope: Single function/module in isolation
Location: `packages/sdk/src/__tests__/`
Runner: Vitest

### 2. Integration Tests
Scope: Convex function with real DB
Location: `tests/convex/`
Runner: Vitest

### 3. Access Control Tests
Scope: Function-level tenant isolation
Location: `tests/convex/`
Runner: Vitest (testing cross-tenant denial)

### 4. Contract Tests
Scope: API behavior verification  
Location: `tests/contracts/`  
Runner: Vitest + fetch

### 5. E2E Journeys
Scope: Multi-step workflows across roles  
Location: `tests/e2e/`  
Runner: Playwright or scripted

---

## Role Definitions for E2E

| Role | Permissions | Use Cases |
|------|-------------|-----------|
| **User** | Read own data, basic features | Login, view dashboard, use enabled modules |
| **Caseworker** | User + create/update records | Process requests, manage cases |
| **TenantAdmin** | Caseworker + tenant config | Invite users, configure settings, install modules |
| **SuperAdmin** | All + cross-tenant | Onboard tenants, view all metrics |

---

## Verification Commands

```bash
# Run all tests
./scripts/dev.sh test

# Run access control tests only
npm run test:access-control

# Run contract tests
npm run test:contracts

# Run E2E journeys  
npm run test:e2e

# Full verification (CI)
npm run verify
```

---

## CI/CD Gates

```yaml
# Must pass before merge
- lint
- typecheck
- unit-tests
- integration-tests
- access-control-tests
- contract-tests

# Must pass before deploy
- e2e-journeys
- migration-dry-run
- security-scan
```

---

## "Not Complete" Indicators

A feature should be reverted to "in progress" if:

1. **No deny test** — "It works" is not proof of security
2. **No error test** — Happy path only is incomplete
3. **No audit trail** — Mutations without audit are unacceptable
4. **Hardcoded values** — Config should be tenant-scoped
5. **Missing access control** — Any tenant function without access validation is a blocker
