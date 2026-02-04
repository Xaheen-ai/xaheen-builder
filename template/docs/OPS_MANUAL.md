# Xaheen Operations Manual

## Backup & Disaster Recovery

### Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| **RPO** (Recovery Point Objective) | 1 hour | Maximum data loss acceptable |
| **RTO** (Recovery Time Objective) | 4 hours | Maximum downtime acceptable |

### Backup Strategy

#### Database (Convex Managed)

Convex provides automatic backups:

| Plan | Backup Frequency | Retention |
|------|-----------------|-----------|
| Free | Daily | 7 days |
| Pro | Daily | 30 days |
| Enterprise | Continuous | Custom |

**Data Recovery:**
- Available on all plans
- Export data via Convex dashboard or CLI
- Contact Convex support for point-in-time recovery

#### Manual Backup Procedure

```bash
# Export data via Convex CLI
npx convex export --path backup_$(date +%Y%m%d_%H%M%S).zip

# Or use the Convex dashboard to download a snapshot
npx convex dashboard
```

### Restore Procedures

#### Full Database Restore

```bash
# 1. Stop all applications
# 2. Import data from backup
npx convex import --path backup_file.zip

# 3. Verify data integrity
npx convex run ops/health

# 4. Restart applications
```

#### Data Restore (Enterprise)

1. Go to Convex Dashboard > Settings > Backups
2. Select the snapshot to restore from
3. Confirm restoration

---

## Monitoring & Alerting

### Health Endpoints

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/functions/v1/ops-health` | System health check | None (load balancer) |
| `/functions/v1/ops-metrics` | Prometheus metrics | Bearer token |

### Key Metrics

```promql
# Unhealthy tenants (subscription issues)
xaheen_subscriptions_active < 1

# Outbox queue backup
xaheen_outbox_pending > 1000

# Failed events requiring attention
xaheen_outbox_failed > 0

# Auth session leak
xaheen_auth_sessions_active > 10000
```

### Recommended Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| Database Unhealthy | `ops-health` status = unhealthy | Critical |
| Outbox Backlog | pending > 1000 for 10m | Warning |
| Failed Events | failed > 0 for 30m | Warning |
| High Latency | p99 > 2s for 5m | Warning |
| Error Rate | 5xx > 1% for 5m | Critical |

### Grafana Dashboard

Import the dashboard from `docs/grafana/xaheen-dashboard.json`:

- System overview
- Request latency histograms
- Error rate by endpoint
- Outbox queue depth
- Cache hit rates

---

## Secrets Management

### Environment Variables

| Variable | Description | Rotation |
|----------|-------------|----------|
| `CONVEX_DEPLOY_KEY` | Deploy key for CI/CD | On rotation schedule |
| `ENCRYPTION_MASTER_KEY` | Tenant secrets encryption | Yearly |
| `STRIPE_WEBHOOK_SECRET` | Stripe signature validation | On compromise |
| `VIPPS_WEBHOOK_SECRET` | Vipps signature validation | On compromise |
| `METRICS_AUTH_TOKEN` | Metrics endpoint auth | Quarterly |

### Key Rotation Procedure

#### 1. Encryption Master Key

```bash
# 1. Generate new key
NEW_KEY=$(openssl rand -base64 32)

# 2. Re-encrypt all tenant secrets (migration script)
# This requires running the rotation function for each tenant

# 3. Update environment variable in Convex dashboard
# Or via CLI: npx convex env set ENCRYPTION_MASTER_KEY $NEW_KEY

# 4. Deploy and verify
npx convex deploy
```

#### 2. Webhook Secrets

```bash
# 1. Regenerate in provider dashboard (Stripe/Vipps)
# 2. Update secret in Convex dashboard
# Or via CLI: npx convex env set STRIPE_WEBHOOK_SECRET <new-secret>
# 3. Redeploy
npx convex deploy
```

---

## Runbooks

### High Outbox Queue

**Symptoms:** `xaheen_outbox_pending` > 1000

**Steps:**
1. Check for stuck events via Convex dashboard or query the outbox table for unprocessed events
2. Check for specific tenant flooding by grouping unprocessed events by `tenantId`
3. If single tenant, check their subscription and rate limits
4. Manual drain if needed: run a Convex mutation to mark stale events as processed

### Failed Webhooks

**Symptoms:** `xaheen_outbox_failed` > 0

**Steps:**
1. Identify failed events via Convex dashboard — filter outbox events with `retryCount > 0` and no `processedAt`
2. Check event payload for issues
3. Retry manually or fix destination
4. Reset retry count via Convex mutation

### Memory Pressure

**Symptoms:** Convex function memory limits

**Steps:**
1. Check cache size: `GET /ops-health` → cache stats
2. Clear caches if needed (redeploy functions)
3. Review query patterns for N+1 issues
4. Add pagination limits

---

## Scheduled Maintenance

### Weekly

- [ ] Review error logs
- [ ] Check outbox queue depth
- [ ] Verify backup completion

### Monthly

- [ ] Review Convex function performance in dashboard
- [ ] Check for functions exceeding execution time limits
- [ ] Review query patterns for N+1 issues
- [ ] Check index utilization

### Quarterly

- [ ] Rotate non-critical secrets
- [ ] Review and prune old audit logs
- [ ] Disaster recovery drill
- [ ] Dependency updates

### Yearly

- [ ] Rotate encryption master key
- [ ] Full security audit
- [ ] Review access control policies
- [ ] Capacity planning
