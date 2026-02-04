# Migration Policy

> Schema changes are permanent in production. Plan accordingly.

---

## Core Principles

### 1. Forward-Only Changes
```
POLICY: We do not revert schema changes in production.
```

**Rationale:**
- Reverting schema changes can cause data loss
- Rollback = new forward schema change

**If something breaks:**
1. Create a new schema change that fixes it
2. Deploy with `npx convex deploy`

### 2. Schema is Versioned in Code
```
POLICY: The schema is defined in convex/schema.ts and versioned in git.
```

All schema changes go through code review before deployment.

### 3. Additive Changes Preferred
```
POLICY: Prefer additive changes over destructive changes.
```

| Change Type | Risk | Approach |
|-------------|------|----------|
| Add field (optional) | Low | Add to schema, deploy |
| Add table | Low | Add to schema, deploy |
| Add index | Low | Add to schema, deploy |
| Rename field | Medium | Add new → backfill data → remove old |
| Remove field | High | Stop using → verify → remove from schema |
| Remove table | Critical | Archive data → soft delete → remove schema |

---

## Migration Workflow

### Development
```bash
# Edit schema in convex/schema.ts
# Changes are validated automatically by the dev server

# Start dev server (watches for schema changes)
npx convex dev

# Test schema changes
npm run test:access-control
```

### Pull Request
```yaml
# CI checks
- npx convex deploy --dry-run
- Schema validation passes
- Access control tests pass
- No breaking changes without migration plan
```

### Production
```bash
# Never run manually
# Automated via CI/CD after merge to main
npx convex deploy
```

---

## Schema Change Patterns

### Adding a Field (Optional)
```typescript
// Safe: optional field with no default required
myTable: defineTable({
  // existing fields...
  nickname: v.optional(v.string()),
})
```

### Adding a Field (Required with Default)
```typescript
// Phase 1: Add as optional
myTable: defineTable({
  status: v.optional(v.string()),
})

// Phase 2: Backfill existing documents via mutation
// Phase 3: Change to required after all documents have the field
```

### Adding an Index
```typescript
// Safe: Convex builds indexes automatically
myTable: defineTable({ /* ... */ })
  .index("by_status", ["tenantId", "status"]),
```

### Renaming a Field
```
Phase 1: Add new field to schema
Phase 2: Deploy mutation to backfill new field from old field
Phase 3: Update application code to use new field
Phase 4: Remove old field from schema (after verification)
```

### Removing a Field
```
Phase 1: Stop writing to field (code change)
Phase 2: Deploy and verify no reads
Phase 3: Remove field from schema
```

---

## Dangerous Patterns

### Never Do This

```typescript
// Removing a required field without migration
// This will fail validation for existing documents
myTable: defineTable({
  // removed 'email' that existing documents still have
})
```

```typescript
// Changing field type without migration
// Existing documents have string, new schema expects number
myTable: defineTable({
  count: v.number(), // was v.string()
})
```

---

## Module Schema Changes

### Module Schema Versioning
Each module's schema is defined in `convex/<module>/schema.ts` and merged into the main schema.

### Module Schema Gating
```
POLICY: Modules cannot be enabled until schema is deployed.
```

---

## Emergency Procedures

### Hotfix Schema Change
```bash
# 1. Make emergency schema/function fix in convex/

# 2. Test on staging
CONVEX_DEPLOY_KEY=$STAGING_KEY npx convex deploy

# 3. Verify staging
./scripts/verify-staging.sh

# 4. Deploy to production
CONVEX_DEPLOY_KEY=$PROD_KEY npx convex deploy

# 5. Create PR after the fact
git add .
git commit -m "emergency: fix xxx"
git push
```

### Rollback via Forward Change
```typescript
// Original change added a bad field
// Fix: remove the field and deploy again
```

### Data Recovery
```bash
# Convex provides data export and import
npx convex export --path backup.zip

# Contact Convex support for point-in-time recovery (Enterprise)
```

---

## Pre-Production Checklist

Before any schema change reaches production:

- [ ] Schema validates with `npx convex dev`
- [ ] Tested on fresh deployment
- [ ] Tested on populated staging
- [ ] Destructive changes have data migration plan
- [ ] Access control enforced in new functions
- [ ] Rollback plan documented

---

## Monitoring

### Schema Health Checks
```bash
# Check deployment status
npx convex dashboard

# Verify schema is up to date
npx convex deploy --dry-run
```

### Post-Deployment Verification
```bash
# After production deployment
./scripts/verify-prod.sh

# Check via Convex dashboard for any function errors
npx convex logs
```
