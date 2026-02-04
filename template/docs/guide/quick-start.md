# Quick Start

Get Xaheen running locally in under 5 minutes.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Convex CLI](https://docs.convex.dev/getting-started) (`npx convex` or install globally)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/xala/xalabase.git
cd xalabase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Convex Dev Server

```bash
npx convex dev
```

This starts the local Convex development server with functions and database.

### 4. Seed Demo Data

```bash
npm run seed:test
```

This seeds demo tenants, roles, permissions, and feature flags.

### 5. Build the SDK

```bash
npm run build --workspace=@xaheen/sdk
```

## First API Call

```typescript
import { XalaClient } from '@xaheen/sdk';

const client = new XalaClient({
  convexUrl: process.env.VITE_CONVEX_URL!,
});

// List all permissions
const { data: permissions } = await client.queries.rbac.listPermissions();
console.log(permissions);
```

## Demo Data

After seeding, you have:

| Entity | Default Value |
|--------|---------------|
| Demo Tenant | `demo` (slug) |
| System Roles | `super_admin`, `tenant_admin`, `user` |
| Permissions | 21 system permissions |
| Feature Flags | `new_dashboard`, `multi_language` |

## Convex Dashboard

Access the database GUI and function logs at:

```
https://dashboard.convex.dev
```

Or open it from the CLI:

```bash
npx convex dashboard
```

## Next Steps

- [Multi-Tenancy](/guide/multi-tenancy) - Understand tenant isolation
- [Authentication](/guide/authentication) - Set up OAuth providers
- [SDK Reference](/sdk/) - Explore client capabilities
