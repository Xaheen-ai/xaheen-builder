# Domain Bundle Spec (Module Contract)

A module is a bundle that must be complete across 4 planes:
1. **DB bundle** — Schema, tables, access control policies
2. **Functions bundle** — Convex functions + catalog entries
3. **SDK bundle** — TypeScript SDK extension  
4. **Verification bundle** — Access control test + contract test + E2E journey

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Module code | kebab-case | `digilist` |
| Schema name | Same as module code | `digilist` |
| Schema file | `convex/<module>/schema.ts` | `convex/digilist/schema.ts` |
| Convex function | `<module>/<action>` | `digilist/listObjects` |
| Access control test | `<module>_isolation.test.ts` | `digilist_isolation.test.ts` |
| Contract test | `<module>_*.test.ts` | `digilist_booking.test.ts` |
| E2E test | `<module>_*.spec.ts` | `digilist_booking_journey.spec.ts` |

---

## Required: DB Bundle

### Schema File
- Path: `convex/<module>/schema.ts`
- Defines tables named after module code

### Table Requirements
All tables in the module schema must contain:
```typescript
// Required fields for all tenant-scoped tables
defineTable({
  tenantId: v.id("tenants"),
  // ... module-specific fields
})
  .index("by_tenant", ["tenantId"]),
```

### Access Control Requirements
All module functions must enforce:
```typescript
// 1. Authentication check
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthorized");

// 2. Module enablement check
const isEnabled = await hasModuleEnabled(ctx, args.tenantId, '<module>');
if (!isEnabled) throw new Error("Module not enabled");

// 3. Permission check
const hasAccess = await hasPermission(ctx, args.tenantId, '<module>.<resource>.read');
if (!hasAccess) throw new Error("Forbidden");
```

---

## Required: Functions Bundle

### Convex Functions
- Path: `convex/<module>/<action>.ts`
- Each public function must be registered in the function registry

### Function Registration
Each function is a Convex query/mutation exported from its module directory. Functions are automatically registered when deployed.

### Error Format
All errors must be RFC7807:
```json
{
  "type": "https://xaheen.io/errors/<code>",
  "title": "Error Title",
  "status": 400,
  "detail": "Detailed message",
  "code": "error_code",
  "traceId": "uuid"
}
```

---

## Required: SDK Bundle

- Path: `packages/sdk/src/hooks/use-convex-<module>.ts`
- Must expose `sdk.<module>.*` methods for each function
- Must throw `XalaError` for RFC7807 responses

---

## Required: Verification Bundle

### Minimum per module:

| Test Type | Path | Purpose |
|-----------|------|---------|
| Access control test | `tests/convex/<module>_isolation.test.ts` | Prove tenant isolation + module gate |
| Contract test | `tests/contracts/<module>_*.test.ts` | Prove API contracts |
| E2E journey | `tests/e2e/<module>_*.spec.ts` | Prove complete user flow |

---

## Definition of Done (DoD)

CI fails if:
- ❌ Module schema exists but no access control test
- ❌ Convex function exists but no function catalog entry
- ❌ Function catalog entry exists but no contract test
- ❌ Any module lacks an E2E journey test

---

## Adding a New Module

1. Create schema: `convex/<module>/schema.ts`
2. Add access control policies in the same module
3. Create Convex functions: `convex/<module>/<action>.ts`
4. Write access control test: `tests/convex/<module>_isolation.test.ts`
5. Write contract test: `tests/contracts/<module>_*.test.ts`
6. Write E2E journey: `tests/e2e/<module>_*.spec.ts`
7. Run `npm run ci:verify-bundles` locally
8. Push and let CI validate

---

## Example: DigiList Module

```
convex/digilist/schema.ts
convex/digilist/listObjects.ts
convex/digilist/createBooking.ts
tests/convex/digilist_isolation.test.ts
tests/contracts/digilist_booking.test.ts
tests/e2e/digilist_booking_journey.spec.ts
```
