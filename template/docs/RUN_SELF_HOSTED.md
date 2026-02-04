# Run Self-Hosted (Staging/Prod)

Complete guide for deploying Xaheen to staging and production environments.

---

## Principles

> **Forward-only schema changes.** Never edit existing schema definitions without a migration plan.

Rollbacks are performed by:
1. Disabling features (flags/modules)
2. Deploying a new fix or hotfix function
3. Never manual data changes outside of migrations

---

## Deployment Order (Safe Rollout)

```
1. Deploy Convex functions (backward compatible)
2. Apply schema changes
3. Enable module(s) / flags for tenant(s)
```

This order ensures:
- Old code can run against new schema (if backward compatible)
- New code can run against new schema
- Features are gated until explicitly enabled

---

## Deploy to Production

### Option A: CI Pipeline (Recommended)

```yaml
# .github/workflows/deploy.yml
- name: Deploy to Convex
  run: |
    npx convex deploy
  env:
    CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

### Option B: Manual

```bash
# Deploy all functions and schema changes
npx convex deploy
```

### Verify Deployment Success

```bash
# Check deployment status
npx convex dashboard
```

---

## Required Environment Variables

Set these in your Convex dashboard under Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVEX_DEPLOY_KEY` | Yes | Deploy key for CI/CD |
| `STRIPE_SECRET_KEY` | If using Stripe | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | If using Stripe | For Stripe webhooks |
| `VIPPS_CLIENT_ID` | If using Vipps | Vipps client ID |
| `VIPPS_CLIENT_SECRET` | If using Vipps | Vipps client secret |
| `BANKID_CLIENT_ID` | If using BankID | BankID client ID |
| `METRICS_AUTH_TOKEN` | If using metrics | For metrics endpoint |
| `WORKER_AUTH_TOKEN` | If using workers | For worker operations |

---

## Health Checks

### Liveness Check

```bash
curl https://<your-deployment>.convex.cloud/api/query \
  -H "Content-Type: application/json" \
  -d '{"path": "ops/health", "args": {}}'
# Expected: { "status": "ok", "timestamp": "..." }
```

### Metrics Check (Auth Required)

```bash
curl https://<your-deployment>.convex.cloud/api/query \
  -H "Authorization: Bearer $METRICS_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "ops/metrics", "args": {}}'
```

---

## Rollback Rules

### If Schema Changes Are Bad

> Do NOT attempt down-migrations

1. **Immediately disable** related functionality:
   ```bash
   # Disable module for affected tenants via Convex mutation
   curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"path": "modules/disable", "args": {"tenantId": "<tenant-id>", "moduleCode": "<module>"}}'
   ```

2. **Deploy hotfix function** that blocks unsafe operations

3. **Ship new schema fix** and redeploy:
   ```bash
   # Fix the schema/functions and redeploy
   npx convex deploy
   ```

### If Function Deployment Is Bad

1. **Redeploy previous version**:
   ```bash
   # Checkout previous commit
   git checkout <previous-sha> -- convex/

   # Redeploy
   npx convex deploy
   ```

2. Keep schema as-is; functions must remain compatible

---

## Tenant Module Operations

### Install Module

```bash
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "modules/install", "args": {"tenantId": "<tenant-id>", "moduleCode": "digilist", "version": "1.0.0"}}'
```

### Enable Module

```bash
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "modules/enable", "args": {"tenantId": "<tenant-id>", "moduleCode": "digilist"}}'
```

### Disable Module (Emergency)

```bash
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "modules/disable", "args": {"tenantId": "<tenant-id>", "moduleCode": "digilist"}}'
```

### Uninstall Module (Safe)

```bash
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "modules/uninstall", "args": {"tenantId": "<tenant-id>", "moduleCode": "digilist"}}'
```

---

## Monitoring

### Logs

```bash
# View function logs
npx convex logs

# View logs in the dashboard
npx convex dashboard
```

### Database Health

```bash
# Check data via Convex dashboard
npx convex dashboard

# Or query directly
npx convex run ops/health
```

---

## Checklist: Before Deploy

- [ ] All tests pass locally
- [ ] Domain bundle CI gate passes
- [ ] Security scanner clean
- [ ] Schema change is backward compatible
- [ ] Rollback plan documented
- [ ] Health check endpoint tested

---

## Checklist: After Deploy

- [ ] Health check returns OK
- [ ] Sample API call succeeds
- [ ] Logs show no errors
- [ ] Metrics collecting
- [ ] Alert channels active
