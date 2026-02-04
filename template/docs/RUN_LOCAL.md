# Run Local (Developer)

Complete guide for running Xaheen locally.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm/pnpm installed
- Convex CLI (`npx convex` or `npm install -g convex`)

---

## Quick Start

```bash
# 1. Start Convex dev server
npx convex dev

# 2. One-time environment setup
./scripts/setup-local.sh

# 3. Seed the database
npm run seed:test

# 4. Run full verification pack
./scripts/test.sh all
```

---

## Commands Reference

### Start/Stop

```bash
# Start Convex dev server (watches for changes, hot reload)
npx convex dev

# Deploy to a fresh dev environment
npx convex deploy --cmd 'npm run seed:test'
```

### Database

```bash
# Push schema changes to dev
npx convex dev

# Re-seed the database with demo data
npm run seed:test

# View data in the Convex dashboard
npx convex dashboard
```

### Functions

```bash
# Functions are served automatically by `npx convex dev`

# Test a specific function
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"path": "<function-name>", "args": {}}'
```

### Testing

```bash
# Run all tests
./scripts/test.sh all

# Run only contract tests
./scripts/test.sh contracts

# Run only E2E tests
./scripts/test.sh e2e

# Run security scanner
./scripts/scan-secrets-usage.sh

# Run domain bundle CI gate
npx tsx scripts/ci/verify-domain-bundles.ts
```

---

## Environment Variables

Create `.env.local` from template:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `VITE_CONVEX_URL` | From `npx convex dev` output |
| `CONVEX_DEPLOY_KEY` | From Convex dashboard (for deploy scripts) |

---

## Dashboard Access

After `npx convex dev`:

- **Convex Dashboard**: https://dashboard.convex.dev
- **Local Functions**: Served via the dev server URL shown in terminal

---

## Module Operations (Local)

```bash
# Install a module for a tenant
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"path": "modules/install", "args": {"tenantId": "<tenant-id>", "moduleCode": "digilist"}}'

# Enable the module
curl -X POST https://<your-deployment>.convex.cloud/api/mutation \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"path": "modules/enable", "args": {"tenantId": "<tenant-id>", "moduleCode": "digilist"}}'
```

---

## Troubleshooting

### Port conflicts

```bash
# Convex dev server uses a local port; check what's using it
lsof -i :3210

# You can specify a different port
npx convex dev --port 3211
```

### Schema errors

```bash
# View schema validation errors in the Convex dev server output
# Check the Convex dashboard for detailed error messages
npx convex dashboard
```

### Function errors

```bash
# View function logs in the Convex dashboard
npx convex logs

# Or use the dashboard for detailed traces
npx convex dashboard
```
